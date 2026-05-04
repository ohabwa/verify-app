"""API key management endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db, APIKey, RateLimitTier
from app.services.api_key_service import api_key_service


router = APIRouter(prefix="/keys", tags=["API Keys"])


class CreateKeyRequest(BaseModel):
    """Request to create a new API key."""
    name: str = Field(..., min_length=1, max_length=255)
    tier: Optional[RateLimitTier] = Field(default=RateLimitTier.STARTER)


class APIKeyResponse(BaseModel):
    """API key response (without secret)."""
    id: str
    name: str
    key_prefix: str
    created_at: datetime
    last_used_at: Optional[datetime]
    is_active: bool
    rate_limit_tier: str
    
    model_config = {
        "from_attributes": True
    }


class CreateKeyResponse(BaseModel):
    """Response after creating a new key (includes raw key once)."""
    id: str
    name: str
    key: str  # Only returned once at creation
    key_prefix: str
    created_at: datetime
    rate_limit_tier: str


class ErrorResponse(BaseModel):
    error: str
    message: str


# Mock user ID for MVP - in production this would come from JWT auth
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"


async def get_current_user_id() -> str:
    """Get current user ID from auth context (mocked for MVP)."""
    return MOCK_USER_ID


@router.post(
    "",
    response_model=CreateKeyResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "API key created successfully"},
        401: {"model": ErrorResponse},
        400: {"model": ErrorResponse},
    },
    summary="Create new API key",
    description="Generate a new API key. The raw key is only returned once - store it securely.",
)
async def create_api_key(
    request: CreateKeyRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> CreateKeyResponse:
    """Create a new API key for the authenticated user."""
    try:
        api_key, raw_key = await api_key_service.create_key(
            db=db,
            name=request.name,
            user_id=user_id,
            rate_limit_tier=request.tier or RateLimitTier.STARTER,
        )
        
        await db.commit()
        
        return CreateKeyResponse(
            id=str(api_key.id),
            name=api_key.name,
            key=raw_key,
            key_prefix=api_key.key_prefix,
            created_at=api_key.created_at,
            rate_limit_tier=api_key.rate_limit_tier.value,
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create API key: {str(e)}"
        )


@router.get(
    "",
    response_model=List[APIKeyResponse],
    summary="List API keys",
    description="Get all API keys for the authenticated user (without secrets).",
)
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> List[APIKeyResponse]:
    """List all API keys for the user."""
    keys = await api_key_service.get_keys_for_user(db, user_id)
    
    return [
        APIKeyResponse(
            id=str(key.id),
            name=key.name,
            key_prefix=key.key_prefix,
            created_at=key.created_at,
            last_used_at=key.last_used_at,
            is_active=key.is_active,
            rate_limit_tier=key.rate_limit_tier.value,
        )
        for key in keys
    ]


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "API key revoked successfully"},
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
    summary="Revoke API key",
    description="Revoke (deactivate) an API key. The key will no longer work.",
)
async def revoke_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Revoke an API key."""
    try:
        key_uuid = uuid.UUID(key_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid key ID format"
        )
    
    success = await api_key_service.revoke_key(db, key_id, user_id)
    
    if not success:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found or already revoked"
        )
    
    await db.commit()
    return None