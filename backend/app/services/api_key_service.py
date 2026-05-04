"""API key management service."""
import secrets
import hashlib
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import APIKey, RateLimitTier


class APIKeyService:
    """Service for API key generation and management."""
    
    @staticmethod
    def generate_key() -> Tuple[str, str]:
        """
        Generate a new API key and its hash.
        
        Returns:
            Tuple of (raw_key, key_hash) - raw_key should be returned to user once
        """
        # Generate 32 bytes of random data, hex encoded = 64 characters
        raw_key = f"verify_{secrets.token_hex(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        return raw_key, key_hash
    
    @staticmethod
    def get_key_prefix(raw_key: str) -> str:
        """Get displayable prefix from raw key (first 8 chars after verify_)."""
        return raw_key[:16]  # verify_ (7) + first 9 chars
    
    @staticmethod
    def hash_key(raw_key: str) -> str:
        """Hash a raw API key for comparison."""
        return hashlib.sha256(raw_key.encode()).hexdigest()
    
    async def create_key(
        self,
        db: AsyncSession,
        name: str,
        user_id: Optional[str] = None,
        rate_limit_tier: RateLimitTier = RateLimitTier.STARTER
    ) -> Tuple[APIKey, str]:
        """
        Create a new API key.
        
        Returns:
            Tuple of (APIKey model, raw_key) - raw_key is only available at creation
        """
        raw_key, key_hash = self.generate_key()
        key_prefix = self.get_key_prefix(raw_key)
        
        api_key = APIKey(
            key_hash=key_hash,
            key_prefix=key_prefix,
            name=name,
            user_id=user_id,
            rate_limit_tier=rate_limit_tier,
            is_active=True,
        )
        
        db.add(api_key)
        await db.flush()
        await db.refresh(api_key)
        
        return api_key, raw_key
    
    async def get_key_by_hash(
        self, 
        db: AsyncSession, 
        key_hash: str
    ) -> Optional[APIKey]:
        """Get API key by its hash."""
        result = await db.execute(
            select(APIKey).where(
                APIKey.key_hash == key_hash,
                APIKey.is_active == True
            )
        )
        return result.scalar_one_or_none()
    
    async def get_keys_for_user(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> List[APIKey]:
        """Get all active keys for a user (without the secret)."""
        result = await db.execute(
            select(APIKey)
            .where(
                APIKey.user_id == user_id,
                APIKey.is_active == True
            )
            .order_by(APIKey.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def revoke_key(
        self, 
        db: AsyncSession, 
        key_id: str, 
        user_id: str
    ) -> bool:
        """Revoke an API key (soft delete)."""
        result = await db.execute(
            update(APIKey)
            .where(
                APIKey.id == key_id,
                APIKey.user_id == user_id,
                APIKey.is_active == True
            )
            .values(is_active=False)
        )
        return result.rowcount > 0
    
    async def update_last_used(
        self, 
        db: AsyncSession, 
        key_id: str
    ) -> None:
        """Update the last_used timestamp for an API key."""
        await db.execute(
            update(APIKey)
            .where(APIKey.id == key_id)
            .values(last_used_at=datetime.utcnow())
        )
    
    async def verify_key(
        self, 
        db: AsyncSession, 
        raw_key: str
    ) -> Optional[APIKey]:
        """
        Verify an API key and return the key model if valid.
        
        Returns None if key is invalid, expired, or revoked.
        """
        key_hash = self.hash_key(raw_key)
        api_key = await self.get_key_by_hash(db, key_hash)
        
        if api_key and api_key.is_active:
            # Update last used timestamp
            await self.update_last_used(db, api_key.id)
            return api_key
        
        return None
    
    def get_rate_limit(self, tier: RateLimitTier) -> Tuple[int, int]:
        """
        Get rate limit for a tier.
        
        Returns:
            Tuple of (requests_per_minute, burst_limit)
        """
        rate_limits = {
            RateLimitTier.STARTER: (100, 20),
            RateLimitTier.PRO: (1000, 100),
            RateLimitTier.ENTERPRISE: (10000, 500),
        }
        return rate_limits.get(tier, (100, 20))


# Singleton instance
api_key_service = APIKeyService()