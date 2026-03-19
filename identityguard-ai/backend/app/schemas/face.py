from datetime import datetime

from pydantic import BaseModel


class FaceUploadResponse(BaseModel):
    face_id: str
    user_id: str
    image_url: str
    matching_mode: str
    duplicate_detected: bool
    similarity_score: float
    matched_user_id: str | None = None
    duplicate_alert_id: str | None = None
    threshold: float
    liveness_passed: bool
    liveness_score: float
    created_at: datetime | None = None


class FaceVerifyResponse(BaseModel):
    verified: bool
    matching_mode: str
    matched_user_id: str | None = None
    similarity_score: float
    threshold: float
    liveness_passed: bool
    liveness_score: float
