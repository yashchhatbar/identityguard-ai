from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from ..database import db
from ..database.models import User, Admin, SystemLog
from ..services.auth_service import AuthService, get_current_admin

router = APIRouter()

# --- Pydantic Schemas ---
class AdminSignup(BaseModel):
    username: str
    email: str
    password: str

@router.post("/signup")
def create_admin(admin: AdminSignup, session: Session = Depends(db.get_db)):
    """Development only: create an admin account."""
    existing_admin = session.query(Admin).filter((Admin.username == admin.username) | (Admin.email == admin.email)).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin with this username or email already exists")
        
    hashed_pw = AuthService.get_password_hash(admin.password)
    new_admin = Admin(
        username=admin.username,
        email=admin.email,
        hashed_password=hashed_pw
    )
    session.add(new_admin)
    session.commit()
    return {"message": "Admin user created successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(db.get_db)):
    """Standard OAuth2 login."""
    admin = session.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not AuthService.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    log = SystemLog(event_type="Admin Login", status="Success", description=admin.username)
    session.add(log)
    session.commit()

    access_token = AuthService.create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    """Client side should just drop the token. To strictly invalidate, we'd need a token blacklist."""
    return {"message": "Successfully logged out"}

@router.get("/profile")
def get_profile(current_admin: Admin = Depends(get_current_admin)):
    """Return current admin info."""
    return {
        "status": "success",
        "data": {
            "id": current_admin.id,
            "username": current_admin.username,
            "email": current_admin.email
        }
    }

@router.get("/users")
def get_users(session: Session = Depends(db.get_db), current_admin: Admin = Depends(get_current_admin)):
    """Get all registered users for the dashboard."""
    users = session.query(User).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        out.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "embedding_id": u.embedding_path.split("/")[-1].replace(".npy", "")
        })
    return {"status": "success", "data": out}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(db.get_db), current_admin: Admin = Depends(get_current_admin)):
    """Admin endpoint to delete a user profile map."""
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    session.delete(user)
    session.commit()
    return {"status": "success", "message": "User deleted"}

@router.get("/stats")
def get_stats(session: Session = Depends(db.get_db), current_admin: Admin = Depends(get_current_admin)):
    total_users = session.query(User).count()
    duplicate_attempts = session.query(SystemLog).filter(SystemLog.event_type.in_(["Duplicate Detection", "Liveness Failure", "Verification Liveness"])).count()
    return {
        "status": "success",
        "data": {
            "total_users": total_users,
            "total_embeddings": total_users, # 1:1 mapping in our system
            "duplicate_attempts": duplicate_attempts,
            "system_health": "Optimal🟢",
            "uptime_hours": 24
        }
    }

@router.get("/logs")
def get_logs(session: Session = Depends(db.get_db), current_admin: Admin = Depends(get_current_admin)):
    logs = session.query(SystemLog).order_by(SystemLog.timestamp.desc()).limit(100).all()
    out = []
    for log in logs:
        out.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() + "Z" if log.timestamp else "N/A",
            "type": log.event_type,
            "status": log.status,
            "email": log.description or "N/A"
        })
    return {
        "status": "success",
        "data": out
    }

@router.get("/fraud-alerts")
def get_fraud_alerts(session: Session = Depends(db.get_db), current_admin: Admin = Depends(get_current_admin)):
    from ..database.models import FraudAlerts
    from ..ai.fraud_agent import FraudAgent
    
    alerts = session.query(FraudAlerts).filter(FraudAlerts.resolved == False).order_by(FraudAlerts.timestamp.desc()).limit(20).all()
    results = []
    for a in alerts:
        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "trigger": a.trigger_event,
            "timestamp": a.timestamp.isoformat() + "Z" if a.timestamp else "N/A",
            "ai_analysis": FraudAgent.investigate_user_alert(a.id).get("analysis", "Loading...")
        })
    return {"status": "success", "data": results}

