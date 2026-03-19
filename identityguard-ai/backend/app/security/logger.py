import logging
from pythonjsonlogger import jsonlogger
import os
import sys

def setup_structured_logging():
    """Configures root logger to output structured JSON for external observability (e.g. ELK, Datadog)."""
    logger = logging.getLogger()
    
    # Remove existing handlers to avoid duplicates
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    logHandler = logging.StreamHandler()
    
    # Define the fields to include in the JSON log
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(message)s',
        rename_fields={
            "levelname": "level",
            "asctime": "timestamp"
        }
    )
    
    logHandler.setFormatter(formatter)
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)
    
    # Optional: Log to a file if directory exists
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
    os.makedirs(log_dir, exist_ok=True)
    fileHandler = logging.FileHandler(os.path.join(log_dir, "system.json"))
    fileHandler.setFormatter(formatter)
    logger.addHandler(fileHandler)
    
    # We still use loguru in many places, so we can intercept loguru and route to standard logging
    from loguru import logger as loguru_logger
    
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Get corresponding Loguru level if it exists.
            try:
                level = loguru_logger.level(record.levelname).name
            except ValueError:
                level = record.levelno

            # Find caller from where originated the logged message.
            frame, depth = sys._getframe(6), 6
            while frame and frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1

            loguru_logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())
            
    # For now, we prefer python-json-logger output to stdout
    return logger

structured_logger = setup_structured_logging()
