"""Core configuration for Verify API."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # API
    app_name: str = "Verify API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/v1"
    
    # Security
    secret_key: str = "change-me-in-production"
    api_key_header: str = "X-API-Key"
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/verify"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    
    # ML Model
    model_version: str = "v0.1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
