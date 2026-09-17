import sys

from loguru import logger

logger.remove()
logger.add(
    sys.stdout,
    colorize=sys.stdout.isatty(),
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}:{function}:{line}</cyan> | <level>{message}</level>"
    ),
    level="INFO",
)

app_logger = logger
