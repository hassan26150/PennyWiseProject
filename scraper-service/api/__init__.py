"""
PennyWise Scraper — API Routes
FastAPI routes for triggering scrapes and managing the scraper service.
"""

import asyncio
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from spiders import get_all_spiders
from services.normalization import normalize_results
from services.matching import filter_matches
from services.cache import cache
from config import settings

router = APIRouter()


# ── Request/Response Models ──

class ScrapeRequest(BaseModel):
    productName: str
    threshold: Optional[float] = None  # Override match threshold


class PlatformResult(BaseModel):
    platform: str
    product_name: str
    price: float
    url: str
    in_stock: bool
    rating: Optional[float] = None
    currency: str = "PKR"
    match_score: float = 0.0
    image_url: Optional[str] = None
    scraped_at: str = ""


class ScrapeResponse(BaseModel):
    success: bool
    product_query: str
    results: List[PlatformResult] = []
    platforms_scraped: int = 0
    platforms_succeeded: int = 0
    platforms_failed: List[str] = []
    cached: bool = False
    duration_ms: int = 0


class HealthResponse(BaseModel):
    status: str
    service: str
    redis_connected: bool
    platforms_available: List[str]
    timestamp: str


# ── Routes ──

@router.get("/scrape/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    spiders = get_all_spiders()
    return HealthResponse(
        status="healthy",
        service="PennyWise Scraper Service",
        redis_connected=cache.is_available,
        platforms_available=[s.platform_name for s in spiders],
        timestamp=datetime.utcnow().isoformat(),
    )


@router.post("/scrape/trigger", response_model=ScrapeResponse)
async def trigger_scrape(request: ScrapeRequest):
    """
    Trigger a scrape across all platforms for a product name.
    Checks cache first, scrapes if needed.
    """
    import time
    start = time.time()

    product_name = request.productName.strip()
    if not product_name:
        raise HTTPException(status_code=400, detail="productName is required")

    threshold = request.threshold or settings.MATCH_THRESHOLD

    # Check cache first
    cached_results = cache.get(product_name)
    if cached_results:
        duration = int((time.time() - start) * 1000)
        return ScrapeResponse(
            success=True,
            product_query=product_name,
            results=[PlatformResult(**r) for r in cached_results],
            platforms_scraped=0,
            platforms_succeeded=0,
            cached=True,
            duration_ms=duration,
        )

    # Run all spiders concurrently
    spiders = get_all_spiders()
    tasks = [spider.safe_search(product_name) for spider in spiders]
    spider_results = await asyncio.gather(*tasks)

    # Process results
    all_matched = []
    platforms_failed = []
    platforms_succeeded = 0

    for result in spider_results:
        if result.success and result.products:
            platforms_succeeded += 1
            # Normalize results
            normalized = normalize_results(result.products)
            # Match against query
            matches = filter_matches(product_name, normalized, threshold)
            for match in matches:
                product = match["product"]
                all_matched.append(PlatformResult(
                    platform=product.platform,
                    product_name=product.product_name,
                    price=product.price,
                    url=product.url,
                    in_stock=product.in_stock,
                    rating=product.rating,
                    currency=product.currency,
                    match_score=match["match_score"],
                    image_url=product.image_url,
                    scraped_at=product.scraped_at,
                ))
        elif result.success and not result.products:
            platforms_succeeded += 1  # Scraped successfully but no products found
        else:
            platforms_failed.append(f"{result.platform}: {result.error}")

    # Sort by price (lowest first)
    all_matched.sort(key=lambda x: x.price)

    # Cache the results
    if all_matched:
        cache.set(product_name, [r.model_dump() for r in all_matched])

    duration = int((time.time() - start) * 1000)

    return ScrapeResponse(
        success=True,
        product_query=product_name,
        results=all_matched,
        platforms_scraped=len(spiders),
        platforms_succeeded=platforms_succeeded,
        platforms_failed=platforms_failed,
        cached=False,
        duration_ms=duration,
    )


class RefreshRequest(BaseModel):
    productNames: List[str] = []


@router.post("/scrape/refresh-popular")
async def refresh_popular(request: RefreshRequest):
    """
    Refresh comparison data for a list of product names.
    Used by the scheduler to keep popular products cached.
    """
    results = []
    for name in request.productNames[:settings.TOP_PRODUCTS_COUNT]:
        try:
            # Invalidate existing cache
            cache.invalidate(name)
            # Trigger fresh scrape
            scrape_req = ScrapeRequest(productName=name)
            result = await trigger_scrape(scrape_req)
            results.append({
                "productName": name,
                "success": result.success,
                "resultCount": len(result.results),
            })
        except Exception as e:
            results.append({
                "productName": name,
                "success": False,
                "error": str(e),
            })

    return {
        "success": True,
        "refreshed": len(results),
        "results": results,
    }
