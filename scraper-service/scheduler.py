"""
PennyWise Scraper — Background Scheduler
APScheduler-based background job for refreshing popular product comparisons.
"""

import httpx
import logging
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from config import settings
from discovery import DiscoveryJob

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


async def update_popular_products():
    """
    Background job that runs every N hours to refresh
    comparison data for the most popular products.
    """
    logger.info("[SCHEDULER] Starting popular products refresh...")

    try:
        # Fetch top product names from the Node.js backend
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.BACKEND_URL}/products?sort=views&limit={settings.TOP_PRODUCTS_COUNT}",
                timeout=10,
            )

        if response.status_code != 200:
            logger.error("[SCHEDULER] Failed to fetch popular products from backend")
            return

        data = response.json()
        products = data.get('data', [])

        if not products:
            logger.info("[SCHEDULER] No popular products to update.")
            return

        for p in products:
            product_name = p.get('name')
            if product_name:
                logger.info(f"[SCHEDULER] Refreshing popular product: {product_name}")
                # We reuse the main scraping logic by triggering an internal HTTP call
                # to our own FastAPI endpoint to keep things clean.
                async with httpx.AsyncClient() as client:
                    try:
                        await client.post(
                            "http://localhost:8000/scrape/trigger",
                            json={"productName": product_name},
                            timeout=60.0
                        )
                    except Exception as e:
                        logger.error(f"[SCHEDULER] Failed to trigger scrape for {product_name}: {str(e)}")

    except Exception as e:
        logger.error(f"[SCHEDULER] Job failed: {str(e)}")


def refresh_popular_products_job():
    """Wrapper to run the async job in the background scheduler."""
    asyncio.run(update_popular_products())


async def run_discovery_job():
    try:
        job = DiscoveryJob()
        await job.run_discovery()
    except Exception as e:
        logger.error(f"[SCHEDULER] Discovery Job failed: {str(e)}")


def run_discovery_wrapper():
    """Wrapper to run the async discovery job in the background scheduler."""
    asyncio.run(run_discovery_job())


def start_scheduler():
    """Start the background scheduler."""
    # Schedule popular products refresh every 6 hours
    scheduler.add_job(
        refresh_popular_products_job,
        CronTrigger(hour='*/6'),
        id='refresh_popular_products',
        replace_existing=True
    )
    
    # Schedule product discovery every 6 hours (offset by 3 hours from the refresh job)
    scheduler.add_job(
        run_discovery_wrapper,
        CronTrigger(hour='3,9,15,21'),
        id='run_discovery_job',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("[SCHEDULER] Started - next refresh in 6h, discovery scheduled.")
