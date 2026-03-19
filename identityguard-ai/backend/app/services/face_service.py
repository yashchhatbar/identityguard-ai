import hashlib
import os
import uuid
import time
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import compact_log, get_logger, mask_email
from app.models.duplicate_log import DuplicateLog
from app.models.face import FaceEmbedding
from app.models.user import User
from app.models.verification_log import VerificationLog
from app.services.face_engine import FaceEngine
from app.services.liveness_service import LivenessService

logger = get_logger("identityguard.face")


class FaceService:
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

    # -------------------------
    # READ IMAGE
    # -------------------------
    @staticmethod
    async def _read_upload(image: UploadFile):
        content = await image.read()

        if not content:
            raise ValueError("Empty image")

        if image.content_type not in FaceService.allowed_types:
            raise ValueError("Invalid image type")

        if len(content) > settings.upload_max_bytes:
            raise ValueError("Image too large")

        return content

    # -------------------------
    # SAVE IMAGE
    # -------------------------
    @staticmethod
    def _save_file(content: bytes):
        os.makedirs(settings.upload_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex}.jpg"
        path = Path(settings.upload_dir) / filename
        path.write_bytes(content)

        return str(path)

    # -------------------------
    # LOAD EMBEDDINGS
    # -------------------------
    @staticmethod
    def _load_embeddings(db: Session, exclude_user_id=None):
        query = db.query(FaceEmbedding)

        if exclude_user_id:
            query = query.filter(FaceEmbedding.user_id != exclude_user_id)

        return [
            (r.user_id, FaceEngine.deserialize_embedding(r.embedding))
            for r in query.all()
            if r.embedding
        ]

    # -------------------------
    # STORE FACE
    # -------------------------
    @staticmethod
    async def store_face_upload(
        db: Session,
        user: User,
        image: UploadFile,
        threshold: float
    ):
        content = await FaceService._read_upload(image)
        path = FaceService._save_file(content)

        try:
            image_hash = hashlib.sha256(content).hexdigest()

            # 🔥 LIVENESS CHECK
            liveness = LivenessService.analyze(path)
            if not liveness["is_live"]:
                raise ValueError("Liveness failed. Use real face.")

            # 🔥 CACHE
            embedding = FaceEngine.get_cached_embedding(image_hash)

            if embedding is None:
                print("🚀 START AI")

                start = time.time()
                embedding = FaceEngine.get_embedding(path)
                print(f"⚡ DONE in {time.time() - start:.2f}s")

                FaceEngine.set_cached_embedding(image_hash, embedding)

            # 🔥 MATCHING
            candidates = FaceService._load_embeddings(db, exclude_user_id=user.id)

            is_duplicate, matched_user_id, score = FaceEngine.match_against_embeddings(
                embedding, candidates, threshold
            )

            # 🔥 SAVE RECORD
            record = FaceEmbedding(
                user_id=user.id,
                embedding=FaceEngine.serialize_embedding(embedding),
                image_url=path,
                image_hash=image_hash,
            )

            db.add(record)
            db.commit()
            db.refresh(record)

            # 🔥 DUPLICATE LOG
            duplicate_alert_id = None
            if is_duplicate and matched_user_id:
                duplicate_log = DuplicateLog(
                    user_id=user.id,
                    matched_user_id=matched_user_id,
                    similarity_score=score,
                    status="match_found",
                )
                db.add(duplicate_log)
                db.commit()
                duplicate_alert_id = duplicate_log.id

            # 🔥 LOG
            logger.info(
                compact_log(
                    event="face_upload",
                    user_id=user.id,
                    email=mask_email(user.email),
                    duplicate=is_duplicate,
                    similarity=f"{score:.4f}",
                )
            )

            # 🔥 FINAL RESPONSE (FIXED ✅)
            return {
                "face_id": record.id,
                "user_id": user.id,
                "image_url": record.image_url,
                "matching_mode": "cosine_similarity",

                "duplicate_detected": is_duplicate,
                "similarity_score": score,
                "matched_user_id": matched_user_id,
                "duplicate_alert_id": duplicate_alert_id,

                "threshold": threshold,

                "liveness_passed": True,
                "liveness_score": liveness["score"],

                "created_at": record.created_at or datetime.utcnow(),
            }

        finally:
            Path(path).unlink(missing_ok=True)

    # -------------------------
    # VERIFY FACE
    # -------------------------
    @staticmethod
    async def verify_face(
        db: Session,
        image: UploadFile,
        threshold: float
    ):
        content = await FaceService._read_upload(image)
        path = FaceService._save_file(content)

        try:
            # 🔥 LIVENESS
            liveness = LivenessService.analyze(path)
            if not liveness["is_live"]:
                raise ValueError("Liveness failed")

            image_hash = hashlib.sha256(content).hexdigest()

            embedding = FaceEngine.get_cached_embedding(image_hash)

            if embedding is None:
                embedding = FaceEngine.get_embedding(path)
                FaceEngine.set_cached_embedding(image_hash, embedding)

            candidates = FaceService._load_embeddings(db)

            is_match, user_id, score = FaceEngine.match_against_embeddings(
                embedding, candidates, threshold
            )

            # 🔥 LOG
            logger.info(
                compact_log(
                    event="face_verify",
                    matched_user_id=user_id,
                    success=is_match,
                    similarity=f"{score:.4f}",
                )
            )

            return {
                "verified": is_match,
                "matching_mode": "cosine_similarity",
                "matched_user_id": user_id,
                "similarity_score": score,
                "threshold": threshold,
                "liveness_passed": True,
                "liveness_score": liveness["score"],
            }

        finally:
            Path(path).unlink(missing_ok=True)