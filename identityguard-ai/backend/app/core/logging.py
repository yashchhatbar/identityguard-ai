from contextvars import ContextVar
import logging
import logging.config
from typing import Any

request_id_context: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_context.get()
        return True


LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | request_id=%(request_id)s | %(message)s",
        }
    },
    "filters": {
        "request_id": {
            "()": RequestIdFilter,
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "filters": ["request_id"],
            "level": "INFO",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}


def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def mask_email(email: str | None) -> str | None:
    if not email or "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[:2] + "*" * (len(local) - 2)
    return f"{masked_local}@{domain}"


def compact_log(**fields: Any) -> str:
    return " ".join(f"{key}={value}" for key, value in fields.items() if value is not None)


def set_request_id(request_id: str):
    return request_id_context.set(request_id)


def reset_request_id(token):
    request_id_context.reset(token)
