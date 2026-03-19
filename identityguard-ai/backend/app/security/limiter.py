try:
    from slowapi import Limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
    SLOWAPI_AVAILABLE = True
except ModuleNotFoundError:
    class RateLimitExceeded(Exception):
        pass

    class SlowAPIMiddleware:  # pragma: no cover
        def __init__(self, app):
            self.app = app

        async def __call__(self, scope, receive, send):
            await self.app(scope, receive, send)

    class _FallbackLimiter:
        def limit(self, _rule: str):
            def decorator(func):
                return func

            return decorator

    limiter = _FallbackLimiter()
    SLOWAPI_AVAILABLE = False
