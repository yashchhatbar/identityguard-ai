from pydantic import BaseModel, Field
from typing import Optional, List, Any

class ImagePayload(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image string for biometric processing")

class VerifyIdentityResponse(BaseModel):
    verified: bool
    user_id: Optional[str] = None
    similarity_score: Optional[float] = None
    message: str

class RegisterIdentityRequest(BaseModel):
    name: str = Field(..., description="Full name of the user")
    email: str = Field(..., description="Unique email address")
    image_base64: str = Field(..., description="Base64 encoded face image")

class RegisterIdentityResponse(BaseModel):
    success: bool
    message: str

class DuplicateCheckResponse(BaseModel):
    duplicate_detected: bool
    similarity_score: Optional[float] = None
    message: str

class AdminStatsResponse(BaseModel):
    total_users: int
    total_embeddings: int
    duplicate_attempts: int
    system_health: str
    uptime_hours: int

class UserListResponseItem(BaseModel):
    id: int
    name: str
    email: str
    created_at: str
