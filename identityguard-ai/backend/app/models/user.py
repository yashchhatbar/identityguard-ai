import uuid
from datetime import datetime

from sqlalchemy import DateTime, Index, String, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_role_created_at", "role", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False, index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # 🔥 FREE TIER FIELDS
    plan: Mapped[str] = mapped_column(String(20), default="free")
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    last_reset: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    face_embeddings = relationship(
        "FaceEmbedding",
        back_populates="user",
        cascade="all, delete-orphan",
    )
