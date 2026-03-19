# 📁 backend/app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.logging import get_logger
from .postgres import DATABASE_URL

logger = get_logger("identityguard.db")

# ✅ ENV CONFIG
USE_SQLITE = os.getenv("USE_SQLITE", "true").lower() == "true"

# ✅ SQLITE (LOCAL DEV)
if USE_SQLITE:
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    os.makedirs(DATA_DIR, exist_ok=True)

    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'users.db')}"

    logger.info(f"🗄 Using SQLite DB: {SQLALCHEMY_DATABASE_URL}")

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )

# ✅ POSTGRES (PRODUCTION)
else:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL

    logger.info(f"🐘 Using Postgres DB")

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
    )

# ✅ SESSION
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ✅ BASE MODEL
Base = declarative_base()

# ✅ DEPENDENCY
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()