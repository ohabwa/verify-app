"""Database models for API key management and usage tracking."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


class RateLimitTier(str, enum.Enum):
    """Rate limit tiers for API keys."""
    STARTER = "starter"      # 100/min
    PRO = "pro"              # 1000/min
    ENTERPRISE = "enterprise"  # unlimited


class APIKey(Base):
    """API key model for authentication."""
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key_hash = Column(String(64), nullable=False, unique=True, index=True)
    key_prefix = Column(String(16), nullable=False)  # First 8 chars for display
    name = Column(String(255), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    rate_limit_tier = Column(SQLEnum(RateLimitTier), default=RateLimitTier.STARTER, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="api_keys")
    usage_logs = relationship("UsageLog", back_populates="api_key")

    def __repr__(self):
        return f"<APIKey {self.name} ({self.key_prefix}...)>"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    api_keys = relationship("APIKey", back_populates="user")
    subscription_tier = Column(String(50), default="starter")

    def __repr__(self):
        return f"<User {self.email}>"


class UsageLog(Base):
    """API usage log for tracking and rate limiting."""
    __tablename__ = "usage_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    request_size = Column(Integer, nullable=True)
    response_size = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationship
    api_key = relationship("APIKey", back_populates="usage_logs")

    def __repr__(self):
        return f"<UsageLog {self.endpoint} ({self.status_code})>"


class VerificationResult(Base):
    """Stored verification results for history."""
    __tablename__ = "verification_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    text_length = Column(Integer, nullable=False)
    ai_probability = Column(String(10), nullable=False)  # Stored as string for flexibility
    confidence = Column(String(20), nullable=False)
    model_version = Column(String(20), nullable=False)
    processing_time_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Signals stored as JSON string
    signals = Column(Text, nullable=True)  # JSON string of signals array