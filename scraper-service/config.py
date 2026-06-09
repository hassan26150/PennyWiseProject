"""
PennyWise Scraper Service — Configuration
Environment-based settings for the scraper microservice.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service
    SERVICE_HOST: str = "0.0.0.0"
    SERVICE_PORT: int = 8000
    DEBUG: bool = True

    # Redis Cache
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    CACHE_TTL: int = 3600  # 1 hour in seconds
    CACHE_PREFIX: str = "compare:"

    # Scraping
    SCRAPE_TIMEOUT: int = 15  # seconds per platform
    MAX_RESULTS_PER_PLATFORM: int = 5
    USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
    # Rotate user agents to avoid detection
    USER_AGENTS: list = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    ]

    # Product Matching
    MATCH_THRESHOLD: float = 70.0  # RapidFuzz similarity threshold (%)
    HIGH_CONFIDENCE_THRESHOLD: float = 85.0  # High confidence match

    # Node.js Backend
    BACKEND_URL: str = "http://localhost:5000/api"

    # Scheduler
    SCHEDULER_ENABLED: bool = True
    REFRESH_INTERVAL_HOURS: int = 6
    TOP_PRODUCTS_COUNT: int = 20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
