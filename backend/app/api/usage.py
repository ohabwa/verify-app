"""Usage statistics API endpoints."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db import get_db, UsageLog, VerificationResult, APIKey
from app.services.api_key_service import api_key_service

router = APIRouter(prefix="/usage", tags=["Usage Statistics"])


class UsageSummary(BaseModel):
    """Usage summary response."""
    total_requests: int
    requests_today: int
    requests_this_week: int
    average_response_time_ms: int
    success_rate: float
    by_endpoint: dict
    by_day: list


# Need to import BaseModel from pydantic
from pydantic import BaseModel


@router.get(
    "",
    summary="Get usage statistics",
    description="Get usage statistics for the authenticated user's API key.",
)
async def get_usage(
    days: int = Query(default=7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(lambda: "00000000-0000-0000-0000-000000000000"),  # Mock
) -> UsageSummary:
    """Get usage statistics."""
    # Get user's keys
    keys = await api_key_service.get_keys_for_user(db, user_id)
    
    if not keys:
        return UsageSummary(
            total_requests=0,
            requests_today=0,
            requests_this_week=0,
            average_response_time_ms=0,
            success_rate=100.0,
            by_endpoint={},
            by_day=[]
        )
    
    key_ids = [str(k.id) for k in keys]
    
    # Get usage stats
    now = datetime.utcnow()
    week_ago = now - timedelta(days=days)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Total requests
    total_result = await db.execute(
        select(func.count(UsageLog.id))
        .where(UsageLog.api_key_id.in_(key_ids))
    )
    total_requests = total_result.scalar() or 0
    
    # Requests today
    today_result = await db.execute(
        select(func.count(UsageLog.id))
        .where(
            UsageLog.api_key_id.in_(key_ids),
            UsageLog.created_at >= today_start
        )
    )
    requests_today = today_result.scalar() or 0
    
    # Requests this week
    week_result = await db.execute(
        select(func.count(UsageLog.id))
        .where(
            UsageLog.api_key_id.in_(key_ids),
            UsageLog.created_at >= week_ago
        )
    )
    requests_this_week = week_result.scalar() or 0
    
    # Average response time
    avg_result = await db.execute(
        select(func.avg(UsageLog.response_time_ms))
        .where(
            UsageLog.api_key_id.in_(key_ids),
            UsageLog.response_time_ms.isnot(None)
        )
    )
    avg_response_time = avg_result.scalar() or 0
    
    # Success rate
    success_result = await db.execute(
        select(func.count(UsageLog.id))
        .where(
            UsageLog.api_key_id.in_(key_ids),
            UsageLog.status_code >= 200,
            UsageLog.status_code < 400
        )
    )
    success_count = success_result.scalar() or 0
    success_rate = (success_count / total_requests * 100) if total_requests > 0 else 100.0
    
    # By endpoint
    endpoint_result = await db.execute(
        select(UsageLog.endpoint, func.count(UsageLog.id))
        .where(UsageLog.api_key_id.in_(key_ids))
        .group_by(UsageLog.endpoint)
    )
    by_endpoint = {row[0]: row[1] for row in endpoint_result.all()}
    
    # By day
    by_day = []
    for i in range(days):
        day_start = today_start - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_result = await db.execute(
            select(func.count(UsageLog.id))
            .where(
                UsageLog.api_key_id.in_(key_ids),
                UsageLog.created_at >= day_start,
                UsageLog.created_at < day_end
            )
        )
        day_count = day_result.scalar() or 0
        by_day.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": day_count
        })
    
    by_day.reverse()
    
    return UsageSummary(
        total_requests=total_requests,
        requests_today=requests_today,
        requests_this_week=requests_this_week,
        average_response_time_ms=int(avg_response_time),
        success_rate=round(success_rate, 2),
        by_endpoint=by_endpoint,
        by_day=by_day
    )