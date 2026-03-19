import os
from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BASE_DIR / "identityguard.db"
DEFAULT_UPLOAD_DIR = BASE_DIR / "data" / "uploads"


def _split_origins(raw: str) -> list[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass
class Settings:
    app_name: str = os.getenv("APP_NAME", "IdentityGuard API")
    environment: str = os.getenv("ENVIRONMENT", "development")
    secret_key: str = os.getenv("SECRET_KEY", os.getenv("JWT_SECRET_KEY", "dev-secret-change-me"))
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    allowed_origins: list[str] = None
    face_match_threshold: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.72"))
    face_matching_mode: str = os.getenv("FACE_MATCHING_MODE", "arcface_cosine_similarity")
    face_model_name: str = os.getenv("FACE_MODEL_NAME", "ArcFace")
    face_detector_backend: str = os.getenv("FACE_DETECTOR_BACKEND", "retinaface")
    upload_max_bytes: int = int(os.getenv("UPLOAD_MAX_BYTES", str(5 * 1024 * 1024)))
    upload_min_face_dimension: int = int(os.getenv("UPLOAD_MIN_FACE_DIMENSION", "80"))
    admin_default_page_size: int = int(os.getenv("ADMIN_DEFAULT_PAGE_SIZE", "10"))
    admin_max_page_size: int = int(os.getenv("ADMIN_MAX_PAGE_SIZE", "100"))
    admin_name: str = os.getenv("ADMIN_NAME", "Platform Admin")
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@identityguard.ai")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "Admin12345!")
    upload_dir: str = os.getenv("UPLOAD_DIR", str(DEFAULT_UPLOAD_DIR))

    def __post_init__(self):
        self.allowed_origins = _split_origins(
            os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        )


settings = Settings()
