from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.security.limiter import limiter
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register")
@limiter.limit("3/minute")
def register(
    request: Request,
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user = AuthService.register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return success_response(
        data=UserResponse.model_validate(user).model_dump(),
        message="User registered successfully",
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    token_payload = AuthService.login_user(db, payload.email, payload.password)
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(**token_payload)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump(),
        message="Authenticated user",
    )


@router.post("/admin/bootstrap")
def bootstrap_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    admin_user = AuthService.bootstrap_admin(db, force=True)
    return success_response(
        data=UserResponse.model_validate(admin_user).model_dump(),
        message="Admin account ensured",
    )
