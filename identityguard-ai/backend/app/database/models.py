from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    embedding_path = Column(String, nullable=False) # Path to the numpy array file
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True, nullable=False)  # e.g., 'Duplicate Detection', 'Verification', 'Registration'
    status = Column(String, nullable=False) # e.g., 'Blocked', 'Success', 'Failed'
    description = Column(String, nullable=True) # E.g. email or reason
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class MCPLog(Base):
    __tablename__ = "mcp_logs"

    id = Column(Integer, primary_key=True, index=True)
    tool_name = Column(String, index=True, nullable=False)
    request_payload = Column(String, nullable=True)
    response_payload = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class FraudAlerts(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Can be null if blocked before user creation
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    trigger_event = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)

