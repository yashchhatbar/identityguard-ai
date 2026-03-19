import uuid

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"
    __table_args__ = (
        Index("ix_face_embeddings_user_hash", "user_id", "image_hash"),
        Index("ix_face_embeddings_created_at", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    embedding: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)
    image_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="face_embeddings")
