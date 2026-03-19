from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.security.limiter import limiter
from app.services.admin_service import AdminService

router = APIRouter()


@router.get("/users")
@limiter.limit("30/minute")
def list_users(
    request: Request,
    search: str | None = Query(default=None, max_length=255),
    role: str | None = Query(default=None, pattern="^(admin|user)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = AdminService.list_users(db, search=search, role=role, page=page, page_size=page_size)
    return success_response(
        data=result["items"],
        message="Users fetched successfully",
        meta=result["pagination"],
    )


@router.get("/duplicates")
@limiter.limit("30/minute")
def list_duplicates(
    request: Request,
    search: str | None = Query(default=None, max_length=255),
    status: str | None = Query(default=None, max_length=100),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = AdminService.list_duplicates(db, status=status, search=search, page=page, page_size=page_size)
    return success_response(
        data=result["items"],
        message="Duplicate alerts fetched successfully",
        meta=result["pagination"],
    )


@router.get("/analytics")
@limiter.limit("30/minute")
def analytics(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = AdminService.analytics(db)
    return success_response(
        data=result,
        message="Analytics fetched successfully",
    )


@router.delete("/user/{user_id}")
@limiter.limit("10/minute")
def delete_user(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    deleted = AdminService.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(data={"id": user_id}, message="User deleted successfully")
