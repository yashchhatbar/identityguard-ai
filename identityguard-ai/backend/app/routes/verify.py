import os
import shutil
import uuid
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

from ..security.limiter import limiter

@router.post("/")
@limiter.limit("5/minute")
async def verify_user(
    request: Request,
    image: UploadFile = Form(...),
    strictness: str = Form("STANDARD"),
    debug_mode: bool = Form(False),
    session: Session = Depends(db.get_db)
):
    temp_path = ""
    try:
        # Check Image type (Phase 11)
        if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, or WEBP allowed.")
            
        # Save temp image
        temp_filename = f"{uuid.uuid4().hex}_verify_{image.filename}"
        temp_path = os.path.join(TEMP_DIR, temp_filename)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Step 1: Advanced Liveness detection (Phase 5)
        from ..security.anti_spoof import AntiSpoofModule
        liveness_results = AntiSpoofModule.evaluate_liveness(temp_path)
        is_live = liveness_results["is_live"]
        if not is_live:
            log = SystemLog(event_type="Verification Liveness", status="Blocked", description="Unknown")
            session.add(log)
            session.commit()
            
            # Phase 4 Fast Queue Alert trigger
            from ..workers.celery_worker import analyze_fraud_activity
            try:
                analyze_fraud_activity.delay({"failed_liveness": liveness_results["spoof_probability"]}, "Verification Liveness")
            except Exception as e:
                logger.error(f"Queue alert failed (Redis down?): {e}")
            
            raise HTTPException(status_code=400, detail=f"Liveness check failed. Spoof Probability: {liveness_results['spoof_probability']:.2f}")

        # Step 2: Extract embedding
        try:
            auth_embedding = FaceEngine.get_embedding(temp_path, debug=debug_mode)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Step 3: Compare with database using Numpy vectorization
        all_users = session.query(User).all()
        matched_user = None
        highest_similarity = 0.0
        
        # Calculate dynamic threshold based on strictness
        if strictness == "LOW":
            threshold = 0.65
        elif strictness == "HIGH":
            threshold = 0.85
        else: # STANDARD or fallback
            threshold = 0.75

        if all_users:
            embeddings_dict = {}
            user_map = {}
            import glob
            for user in all_users:
                try:
                    # IdentityGuard stores embeddings in: data/users/usr_XXXXXX/embedding_N.npy
                    if user.embedding_path and os.path.isdir(os.path.dirname(user.embedding_path)):
                        user_dir = os.path.dirname(user.embedding_path)
                        emb_files = glob.glob(os.path.join(user_dir, "embedding_*.npy"))
                        
                        user_embs = []
                        for f in emb_files:
                            try:
                                emb = np.load(f)
                                # Log exact shape as requested (Step 6)
                                print("Loaded embedding:", emb.shape)
                                user_embs.append(emb)
                            except Exception as e:
                                logger.error(f"Error loading embedding file {f}: {e}")
                            
                        if user_embs:
                            embeddings_dict[user.id] = user_embs
                            user_map[user.id] = user
                    else:
                        # Fallback for old or single-file records
                        try:
                            embeddings_dict[user.id] = [np.load(user.embedding_path)]
                            user_map[user.id] = user
                        except:
                            pass
                except Exception as e:
                    logger.error(f"Error processing user {user.id}: {e}")
                    
            is_match, matched_user_id, highest_similarity = FaceEngine.compare_embeddings_batch(auth_embedding, embeddings_dict, threshold=threshold)
            confidence = FaceEngine.get_confidence_score(highest_similarity, threshold)
            
            # Step 10: Final Verification Debug Output
            print(f"Similarity: {highest_similarity:.2f}")
            print(f"Threshold: {threshold:.2f}")
            print(f"Decision: {'VERIFIED' if is_match else 'FAILED'}")
            
            if is_match and matched_user_id in user_map:
                matched_user = user_map[matched_user_id]

        if matched_user:
            log = SystemLog(event_type="Verification", status="Success", description=matched_user.email)
            session.add(log)
            session.commit()
            return {
                "status": "success",
                "message": f"Welcome back, {matched_user.name}",
                "similarity_score": round(highest_similarity, 4),
                "confidence_score": round(confidence, 1),
                "profile_image": f"http://localhost:8000/api/images/usr_{matched_user.id:06d}/profile.jpg",
                "user": {
                    "id": matched_user.id,
                    "name": matched_user.name,
                    "email": matched_user.email
                }
            }
        else:
            log = SystemLog(event_type="Verification", status="Failed", description="Unrecognized Face")
            session.add(log)
            session.commit()
            raise HTTPException(status_code=401, detail="Face not recognized in the system")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during verification")
    finally:
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
