"""
PennyWise Scraper — Base Spider
Abstract base class for all platform spiders.
"""

import asyncio
import random
import time
from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

import httpx

from config import settings


class ScrapedProduct(BaseModel):
    """Unified schema for all scraped products across platforms."""
    platform: str
    product_name: str
    price: float
    url: str
    in_stock: bool = True
    rating: Optional[float] = None
    currency: str = "PKR"
    scraped_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    image_url: Optional[str] = None


class ScrapeResult(BaseModel):
    """Result wrapper from a single spider."""
    platform: str
    success: bool
    products: List[ScrapedProduct] = []
    error: Optional[str] = None
    duration_ms: int = 0


class BaseSpider(ABC):
    """Abstract base spider class. All platform spiders must extend this."""

    platform_name: str = "unknown"
    base_url: str = ""

    def __init__(self):
        self.timeout = settings.SCRAPE_TIMEOUT
        self.max_results = settings.MAX_RESULTS_PER_PLATFORM

    def _get_headers(self) -> dict:
        """Get request headers with a random User-Agent."""
        ua = random.choice(settings.USER_AGENTS)
        return {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
        }

    async def _fetch(self, url: str) -> Optional[str]:
        """Fetch a URL with error handling and timeout."""
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout),
                follow_redirects=True,
                verify=False,  # Some Pakistani sites have SSL issues
            ) as client:
                response = await client.get(url, headers=self._get_headers())
                response.raise_for_status()
                return response.text
        except httpx.TimeoutException:
            raise Exception(f"{self.platform_name}: Request timed out")
        except httpx.HTTPStatusError as e:
            raise Exception(f"{self.platform_name}: HTTP {e.response.status_code}")
        except Exception as e:
            raise Exception(f"{self.platform_name}: {str(e)}")

    @abstractmethod
    async def search(self, product_name: str) -> List[ScrapedProduct]:
        """
        Search for a product on this platform.
        Must be implemented by each spider.
        Returns a list of ScrapedProduct objects.
        """
        pass

    async def safe_search(self, product_name: str) -> ScrapeResult:
        """
        Wrapper around search() that catches all errors
        and returns a ScrapeResult (never throws).
        """
        start = time.time()
        try:
            products = await self.search(product_name)
            duration = int((time.time() - start) * 1000)
            return ScrapeResult(
                platform=self.platform_name,
                success=True,
                products=products[:self.max_results],
                duration_ms=duration,
            )
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            return ScrapeResult(
                platform=self.platform_name,
                success=False,
                error=str(e),
                duration_ms=duration,
            )
