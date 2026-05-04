"""Health check and utility API endpoints."""
from datetime import datetime
from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check API health status and dependent services.",
)
async def health_check() -> HealthResponse:
    """
    Check API health status.
    
    Returns overall status, version, and status of dependent services.
    """
    settings = get_settings()
    
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=datetime.utcnow(),
        services={
            "api": "healthy",
            # Redis and database health would be checked in production
        }
    )


@router.get(
    "/",
    summary="API root",
    description="API root endpoint with version info.",
)
async def root():
    """API root endpoint."""
    settings = get_settings()
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "openapi": "/openapi.json",
    }