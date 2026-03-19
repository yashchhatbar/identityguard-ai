from datetime import datetime

from pydantic import BaseModel


class DuplicateAlertResponse(BaseModel):
    id: str
    user_id: str
    matched_user_id: str
    similarity_score: float
    status: str
    created_at: datetime | None = None
