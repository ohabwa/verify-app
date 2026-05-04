"""Core security utilities for API key authentication."""
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from typing import Optional

from app.core.config import get_settings

# API Key header scheme
api_key_header = APIKeyHeader(
    name=get_settings().api_key_header, 
    auto_error=False
)


async def verify_api_key(
    api_key: Optional[str] = Security(api_key_header)
) -> str:
    """
    Extract and validate API key format from request header.
    
    This just validates the format (starts with verify_). 
    Actual key verification is done in verify_key_and_check_rate dependency.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Include X-API-Key header."
        )
    
    # Basic format validation
    if not api_key.startswith("verify_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format."
        )
    
    return api_key


async def verify_api_key_or_optional(
    api_key: Optional[str] = Security(api_key_header)
) -> Optional[str]:
    """Optional API key verification for public endpoints."""
    if api_key:
        return await verify_api_key(api_key)
    return None