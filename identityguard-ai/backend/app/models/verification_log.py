import uuid

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VerificationLog(Base):
    __tablename__ = "verification_logs"
    __table_args__ = (
        Index("ix_verification_logs_success_created_at", "success", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, index=True)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.72)
    reason: Mapped[str] = mapped_column(String(120), nullable=False, default="verification")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
