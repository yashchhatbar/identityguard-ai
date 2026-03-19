import uuid

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DuplicateLog(Base):
    __tablename__ = "duplicate_logs"
    __table_args__ = (
        Index("ix_duplicate_logs_status_created_at", "status", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    matched_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending_review")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
