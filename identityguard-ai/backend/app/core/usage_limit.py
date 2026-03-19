from datetime import datetime, timedelta
from fastapi import HTTPException

FREE_LIMIT = 50  # requests per day


def check_usage(user):
    now = datetime.utcnow()

    # Reset usage every 24 hours
    if user.last_reset < now - timedelta(days=1):
        user.usage_count = 0
        user.last_reset = now

    # Check limit
    if user.plan == "free" and user.usage_count >= FREE_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="Free tier limit reached. Upgrade to continue."
        )

    # Increment usage
    user.usage_count += 1
