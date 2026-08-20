import logging
import os
import re
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings

# Regex pattern matching ANSI escape sequences for stripping colors in log files
ANSI_ESCAPE_PATTERN = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')


class FileLogFormatter(logging.Formatter):
    """Formatter for file output that strips ANSI color codes to keep plain log files clean."""

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        return ANSI_ESCAPE_PATTERN.sub('', formatted)


class SafeRotatingFileHandler(RotatingFileHandler):
    """Subclass of RotatingFileHandler safe for Windows multi-process file locking."""

    def rotate(self, source: str, dest: str) -> None:
        try:
            if os.path.exists(dest):
                try:
                    os.remove(dest)
                except Exception:
                    pass
            os.rename(source, dest)
        except (PermissionError, OSError):
            # On Windows, if file is locked by another worker process during rotation,
            # handle gracefully to avoid emitting stack traces
            pass


def setup_logging() -> None:
    """Initialize enterprise-grade logging with console and rotating file handlers."""
    log_level = logging.DEBUG if settings.DEBUG else logging.getLevelName(settings.LOG_LEVEL.upper())

    # Ensure logs directory exists
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_file_path = os.path.join(log_dir, "app.log")

    log_format_str = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    console_format = logging.Formatter(log_format_str)
    file_format = FileLogFormatter(log_format_str)

    # Console Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_format)

    # Rotating File Handler (10MB max size, 5 backups) - Safe for Windows
    file_handler = SafeRotatingFileHandler(
        log_file_path,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(file_format)

    # Root Logger Setup
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Avoid duplicate handlers on re-initialization
    if not root_logger.handlers:
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)

    # Silence noise from external dependencies
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Reusable utility returning a named logger instance."""
    return logging.getLogger(name)


logger = get_logger("nearby_backend")
