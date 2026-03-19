import requests

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.config import settings
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.face import FaceUploadResponse, FaceVerifyResponse
from app.security.limiter import limiter
from app.services.face_service import FaceService

router = APIRouter()


@router.post("/upload", response_model=dict)
@limiter.limit("6/minute")
async def upload_face(
    request: Request,
    image: UploadFile = File(...),
    threshold: float = Form(default=settings.face_match_threshold),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user", "admin")),
):
    try:
        result = await FaceService.store_face_upload(
            db=db,
            user=current_user,
            image=image,
            threshold=threshold,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return success_response(
        data=FaceUploadResponse(**result).model_dump(),
        message="Face upload processed",
    )


# 🔥 NEW FEATURE: URL UPLOAD
@router.post("/upload-url", response_model=dict)
@limiter.limit("6/minute")
async def upload_face_url(
    request: Request,
    url: str = Form(...),
    threshold: float = Form(default=settings.face_match_threshold),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user", "admin")),
):
    try:
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            raise ValueError("Invalid image URL")

        image_bytes = response.content

        upload_file = UploadFile(
            filename="url-image.jpg",
            file=bytes(image_bytes)
        )

        result = await FaceService.store_face_upload(
            db=db,
            user=current_user,
            image=upload_file,
            threshold=threshold,
        )

    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return success_response(
        data=FaceUploadResponse(**result).model_dump(),
        message="Image uploaded from URL",
    )


@router.post("/verify", response_model=dict)
@limiter.limit("6/minute")
async def verify_face(
    request: Request,
    image: UploadFile = File(...),
    threshold: float = Form(default=settings.face_match_threshold),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user", "admin")),
):
    try:
        result = await FaceService.verify_face(
            db=db,
            image=image,
            threshold=threshold,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return success_response(
        data=FaceVerifyResponse(**result).model_dump(),
        message="Face verification completed",
    )