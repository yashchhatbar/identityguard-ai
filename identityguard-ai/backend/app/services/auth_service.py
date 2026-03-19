from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import compact_log, get_logger, mask_email
from app.models.user import User
from app.schemas.auth import RegisterRequest

SECRET_KEY = settings.secret_key
ALGORITHM = settings.jwt_algorithm
logger = get_logger("identityguard.auth")


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

    @staticmethod
    def create_access_token(user: User) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "type": "access",
            "iat": now,
            "nbf": now,
            "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        }
        return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)

    @staticmethod
    def register_user(db: Session, payload: RegisterRequest, role: str = "user") -> User:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            name=payload.name.strip(),
            email=payload.email,
            password_hash=AuthService.hash_password(payload.password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(compact_log(event="auth_register", user_id=user.id, email=mask_email(user.email), role=user.role))
        return user

    @staticmethod
    def login_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user or not AuthService.verify_password(password, user.password_hash):
            logger.warning(compact_log(event="auth_login_failed", email=mask_email(email)))
            return None
        access_token = AuthService.create_access_token(user)
        logger.info(compact_log(event="auth_login", user_id=user.id, email=mask_email(user.email), role=user.role))
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }

    @staticmethod
    def get_user_from_token(db: Session, token: str) -> User | None:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
            user_id = payload.get("sub")
            if payload.get("type") != "access" or not user_id:
                return None
        except jwt.PyJWTError:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if user.email != payload.get("email") or user.role != payload.get("role"):
            return None
        return user

    @staticmethod
    def bootstrap_admin(db: Session, force: bool = False) -> User:
        admin = db.query(User).filter(User.email == settings.admin_email).first()
        if admin:
            if force and admin.role != "admin":
                admin.role = "admin"
                db.add(admin)
                db.commit()
                db.refresh(admin)
            return admin

        if not settings.admin_password:
            raise ValueError("ADMIN_PASSWORD is required to bootstrap admin")

        admin_payload = RegisterRequest(
            name=settings.admin_name,
            email=settings.admin_email,
            password=settings.admin_password,
        )
        return AuthService.register_user(db, admin_payload, role="admin")


def get_current_admin(*args, **kwargs):
    raise RuntimeError("Legacy admin dependency is no longer active. Use app.api.deps.require_role('admin').")
