# 🔥 SAME IMPORTS (no change)
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, session_scope
from app.core.logging import (
    compact_log,
    get_logger,
    reset_request_id,
    set_request_id,
    setup_logging,
)
from app.core.metrics import metrics_store
from app.core.responses import error_response
from app.models import user, face, duplicate_log, verification_log  # noqa
from app.security.limiter import (
    RateLimitExceeded,
    SLOWAPI_AVAILABLE,
    SlowAPIMiddleware,
    limiter,
)
from app.services.auth_service import AuthService
from app.services.face_engine import FaceEngine

setup_logging()
logger = get_logger("identityguard.api")

STARTED_AT = datetime.now(timezone.utc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN plan VARCHAR DEFAULT 'free'"))
        except:
            pass
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN usage_count INTEGER DEFAULT 0"))
        except:
            pass
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_reset TIMESTAMP"))
        except:
            pass

        try:
            conn.execute(text("UPDATE users SET plan='free' WHERE plan IS NULL"))
        except:
            pass
        try:
            conn.execute(text("UPDATE users SET usage_count=0 WHERE usage_count IS NULL"))
        except:
            pass

    with session_scope() as session:
        AuthService.bootstrap_admin(session)

    if settings.environment != "production":
        try:
            FaceEngine.warmup()
        except Exception as e:
            logger.warning(f"AI warmup skipped: {e}")
    else:
        logger.info("Skipping AI warmup in production")

    yield


app = FastAPI(
    title="IdentityGuard API",
    version="3.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter

if SLOWAPI_AVAILABLE:
    app.add_middleware(SlowAPIMiddleware)

# ✅🔥 FIXED CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://identityguard-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    started = perf_counter()

    request_id = request.headers.get("x-request-id", str(uuid4()))
    request.state.request_id = request_id
    token = set_request_id(request_id)

    response = None

    try:
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

    finally:
        duration_ms = (perf_counter() - started) * 1000

        metrics_store.record(
            request.url.path,
            getattr(response, "status_code", 500),
            duration_ms,
        )

        logger.info(
            compact_log(
                event="request",
                method=request.method,
                path=request.url.path,
                status=getattr(response, "status_code", 500),
                duration_ms=f"{duration_ms:.2f}",
                client=getattr(request.client, "host", "unknown"),
            )
        )

        reset_request_id(token)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(exc.detail), code="http_error"),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error_response(
            "Validation failed",
            code="validation_error",
            errors=jsonable_encoder(exc.errors()),
        ),
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(_, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content=error_response(str(exc.detail), code="rate_limited"),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response("Internal server error", code="internal_error"),
    )


app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "IdentityGuard API running 🚀"}


@app.get("/api/health")
def api_health():
    database_status = "disconnected"

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            database_status = "connected"
    except:
        database_status = "disconnected"

    uptime_seconds = int((datetime.now(timezone.utc) - STARTED_AT).total_seconds())

    return {
        "status": "ok",
        "database": database_status,
        "ai_model": "loaded" if FaceEngine._warmed_up else "lazy",
        "uptime": f"{uptime_seconds}s",
        "version": app.version,
    }


@app.get("/api/metrics")
def api_metrics():
    return metrics_store.snapshot()
