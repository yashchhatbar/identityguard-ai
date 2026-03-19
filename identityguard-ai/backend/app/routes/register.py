import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException, status, Request
from sqlalchemy.orm import Session
from loguru import logger

from ..database import db
from ..database.models import User, SystemLog
from ..database.embedding_store import EmbeddingStore
from ..services.face_engine import FaceEngine
from ..services.liveness_detector import LivenessDetector

router = APIRouter()

TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

import re
from ..security.limiter import limiter

def sanitize_input(value: str) -> str:
    """Removes HTML tags and malicious symbols."""
    clean = re.sub('<[^<]+?>', '', value)
    return clean.strip()

@router.post("/")
@limiter.limit("5/minute")
async def register_user(
    request: Request,
    name: str = Form(..., max_length=100),
    email: str = Form(..., max_length=100, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$"),
    images: List[UploadFile] = Form(...),
    debug_mode: bool = Form(False),
    session: Session = Depends(db.get_db)
):
    temp_path = ""
    try:
        # Phase 11 Sanitization
        name = sanitize_input(name)
        email = sanitize_input(email).lower()
        
        # Check if user already exists
        existing_user = session.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Save uploaded images temporarily and perform initial validation
        temp_paths = []
        for idx, image in enumerate(images):
            # Check Image type (Phase 11)
            if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise HTTPException(status_code=400, detail=f"Invalid file type for image {idx+1}. Only JPEG, PNG, or WEBP allowed.")
            
            temp_filename = f"{uuid.uuid4().hex}_{idx}_{image.filename}"
            t_path = os.path.join(TEMP_DIR, temp_filename)
            with open(t_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            temp_paths.append(t_path)

        if not temp_paths:
             raise HTTPException(status_code=400, detail="At least one image is required for registration.")

        # Step 1: Advanced Liveness detection (Phase 5) - Check the first image for liveness
        # In production, we should check all, but for now we check the primary one.
        from ..security.anti_spoof import AntiSpoofModule
        liveness_results = AntiSpoofModule.evaluate_liveness(temp_paths[0])
        is_live = liveness_results["is_live"]
        if not is_live:
            log = SystemLog(event_type="Liveness Failure", status="Blocked", description=email)
            session.add(log)
            session.commit()
            
            # Phase 4 Fast Queue Alert trigger
            from ..workers.celery_worker import analyze_fraud_activity
            try:
                analyze_fraud_activity.delay({"failed_liveness": liveness_results["spoof_probability"]}, "Liveness Failure")
            except Exception as e:
                logger.error(f"Queue alert failed (Redis down?): {e}")
            
            raise HTTPException(status_code=400, detail=f"Liveness check failed. Spoof Probability: {liveness_results['spoof_probability']:.2f}. Please recapture dynamically.")

        # Step 2: Extract embeddings for all images
        new_embeddings = []
        try:
            for t_path in temp_paths:
                emb = FaceEngine.get_embedding(t_path, debug=debug_mode)
                new_embeddings.append(emb)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        main_embedding = new_embeddings[0]

        # Step 3: Duplicate detection against all existing embeddings
        all_users = session.query(User).all()

        if all_users:
            embeddings_dict = {}
            for user in all_users:
                try:
                    embeddings_dict[user.id] = EmbeddingStore.load_embedding(user.embedding_path)
                except Exception as e:
                    logger.error(f"Error loading embedding for user {user.id}: {e}")
                    
            is_duplicate, matched_user_id, highest_sim = FaceEngine.compare_embeddings_batch(main_embedding, embeddings_dict)
            if is_duplicate:
                log = SystemLog(event_type="Duplicate Detection", status="Blocked", description=email)
                session.add(log)
                session.commit()
                
                # Phase 4 Fast Queue Alert trigger
                from ..workers.celery_worker import analyze_fraud_activity
                try:
                    analyze_fraud_activity.delay({"duplicate_attempts": 1.0}, "Duplicate Detection")
                except Exception as e:
                    logger.error(f"Queue alert failed (Redis down?): {e}")
                
                logger.warning(f"Duplicate registration attempt. Face matches user ID: {matched_user_id} with similarity {highest_sim:.4f}")
                raise HTTPException(status_code=400, detail="Duplicate identity detected")

        # Step 4: If unique -> Store User first to get ID
        new_user = User(
            name=name,
            email=email,
            embedding_path=""
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # Create isolated user directory mapping to their ID
        import numpy as np
        user_dir_name = f"usr_{new_user.id:06d}"
        user_dir_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "users", user_dir_name)
        os.makedirs(user_dir_path, exist_ok=True)
        
        # Save profile image and embeddings iteratively
        profile_image_path = os.path.join(user_dir_path, "profile.jpg")
        shutil.copy(temp_paths[0], profile_image_path)
        
        embedding_file_paths = []
        from ..vector.faiss_index import faiss_manager
        
        for idx, emb in enumerate(new_embeddings):
            # Log exact shape as requested (Step 1)
            print("Saved embedding shape:", emb.shape)
            embedding_file_path = os.path.join(user_dir_path, f"embedding_{idx+1}.npy")
            np.save(embedding_file_path, emb)
            embedding_file_paths.append(embedding_file_path)
            # Sync memory index for FAISS vector search for each embedding
            faiss_manager.add_embedding(new_user.id, emb)
        
        # Update user with the primary embedding path
        new_user.embedding_path = embedding_file_paths[0]
        session.commit()

        log = SystemLog(event_type="Registration", status="Success", description=email)
        session.add(log)
        session.commit()

        return {
            "status": "success", 
            "message": "User registered successfully", 
            "user_id": new_user.id
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        with open("/tmp/reg_error.log", "w") as f:
            f.write(traceback.format_exc())
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")
    finally:
        # Cleanup temporary files
        for t_path in temp_paths:
            if t_path and os.path.exists(t_path):
                os.remove(t_path)
