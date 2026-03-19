import math
from collections import defaultdict
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.duplicate_log import DuplicateLog
from app.models.face import FaceEmbedding
from app.models.user import User
from app.models.verification_log import VerificationLog


class AdminService:
    @staticmethod
    def _paginate(page: int, page_size: int):
        normalized_page = max(page, 1)
        normalized_page_size = min(max(page_size, 1), settings.admin_max_page_size)
        return normalized_page, normalized_page_size, (normalized_page - 1) * normalized_page_size

    @staticmethod
    def list_users(
        db: Session,
        search: str | None = None,
        role: str | None = None,
        page: int = 1,
        page_size: int | None = None,
    ):
        page, page_size, offset = AdminService._paginate(page, page_size or settings.admin_default_page_size)
        query = db.query(User)

        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
        if role:
            query = query.filter(User.role == role)

        total = query.count()
        users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
        results = [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "face_embeddings": len(user.face_embeddings),
            }
            for user in users
        ]

        return {
            "items": results,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": math.ceil(total / page_size) if total else 0,
            },
        }

    @staticmethod
    def list_duplicates(
        db: Session,
        status: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int | None = None,
    ):
        page, page_size, offset = AdminService._paginate(page, page_size or settings.admin_default_page_size)
        query = db.query(DuplicateLog)

        if status:
            query = query.filter(DuplicateLog.status == status)
        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    DuplicateLog.user_id.ilike(pattern),
                    DuplicateLog.matched_user_id.ilike(pattern),
                )
            )

        total = query.count()
        logs = query.order_by(DuplicateLog.created_at.desc()).offset(offset).limit(page_size).all()
        results = [
            {
                "id": log.id,
                "user_id": log.user_id,
                "matched_user_id": log.matched_user_id,
                "similarity_score": log.similarity_score,
                "status": log.status,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ]

        return {
            "items": results,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": math.ceil(total / page_size) if total else 0,
            },
        }

    @staticmethod
    def delete_user(db: Session, user_id: str) -> bool:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        db.query(DuplicateLog).filter(
            (DuplicateLog.user_id == user_id) | (DuplicateLog.matched_user_id == user_id)
        ).delete(synchronize_session=False)
        db.query(FaceEmbedding).filter(FaceEmbedding.user_id == user_id).delete(synchronize_session=False)
        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def analytics(db: Session):
        users = db.query(User).all()
        duplicates = db.query(DuplicateLog).all()
        verifications = db.query(VerificationLog).all()

        registration_daily = defaultdict(int)
        for user in users:
            if user.created_at:
                registration_daily[user.created_at.date().isoformat()] += 1

        duplicate_daily = defaultdict(int)
        for item in duplicates:
            if item.created_at:
                duplicate_daily[item.created_at.date().isoformat()] += 1

        verification_daily = defaultdict(lambda: {"success": 0, "failed": 0})
        for item in verifications:
            if item.created_at:
                bucket = verification_daily[item.created_at.date().isoformat()]
                if item.success:
                    bucket["success"] += 1
                else:
                    bucket["failed"] += 1

        all_dates = sorted(
            set(registration_daily.keys()) | set(duplicate_daily.keys()) | set(verification_daily.keys())
        )
        chart = []
        for key in all_dates:
            verification_bucket = verification_daily.get(key, {"success": 0, "failed": 0})
            total_verifications = verification_bucket["success"] + verification_bucket["failed"]
            success_rate = (verification_bucket["success"] / total_verifications) if total_verifications else 0.0
            chart.append(
                {
                    "date": key,
                    "registrations": registration_daily.get(key, 0),
                    "duplicates": duplicate_daily.get(key, 0),
                    "verification_success_rate": round(success_rate, 4),
                }
            )

        return {
            "summary": {
                "total_users": len(users),
                "total_duplicates": len(duplicates),
                "verification_success_rate": round(
                    (sum(1 for item in verifications if item.success) / len(verifications)) if verifications else 0.0,
                    4,
                ),
            },
            "charts": {
                "daily": chart,
            },
        }
