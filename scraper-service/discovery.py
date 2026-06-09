import asyncio
import logging
import httpx
from typing import List, Dict
from spiders.daraz import DarazSpider
from spiders.priceoye import PriceOyeSpider
from config import settings

logger = logging.getLogger(__name__)

# An extensive set of broad search terms to discover products from every possible category
DISCOVERY_KEYWORDS = [
    "smartphones", "laptops", "smart watches", "wireless earbuds", "tablets",
    "men's fashion", "women's clothing", "shoes", "sneakers", "home appliances", 
    "furniture", "kitchen appliances", "groceries", "beauty products", "makeup", 
    "skincare", "toys", "gaming consoles", "video games", "books", 
    "sports equipment", "fitness gear", "automotive accessories", "motorcycle parts", 
    "pet supplies", "baby products", "jewelry", "watches", "sunglasses", 
    "backpacks", "office supplies", "health supplements", "cameras", "headphones"
]

class DiscoveryJob:
    def __init__(self):
        self.daraz = DarazSpider()
        self.priceoye = PriceOyeSpider()
        # Maximize the number of products fetched during discovery (typically 40 per page on Daraz)
        self.daraz.max_results = 40
        self.priceoye.max_results = 40
        # You can add more spiders here
        self.backend_ingest_url = f"{settings.BACKEND_URL.replace('/api', '')}/api/discovery/ingest"

    async def push_to_backend(self, platform_name: str, products: List[Dict]):
        if not products:
            return

        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "platform": platform_name,
                    "products": [p.dict() for p in products] if hasattr(products[0], 'dict') else products
                }
                response = await client.post(self.backend_ingest_url, json=payload, timeout=120.0)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Ingested {len(products)} products from {platform_name}: Created {data['stats']['created']}, Updated {data['stats']['updated']}")
                else:
                    logger.error(f"Failed to ingest to backend. Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            logger.error(f"Error pushing discovery data to backend: {str(e)}")

    async def run_discovery(self):
        logger.info("Starting scheduled Product Discovery Job...")
        
        for keyword in DISCOVERY_KEYWORDS:
            logger.info(f"Discovering products for keyword: {keyword}")
            
            # Run spiders concurrently for this keyword
            results = await asyncio.gather(
                self.daraz.search(keyword),
                self.priceoye.search(keyword),
                return_exceptions=True
            )
            
            # Process Daraz results
            if not isinstance(results[0], Exception):
                await self.push_to_backend("Daraz", results[0])
            else:
                logger.error(f"Daraz discovery failed for '{keyword}': {results[0]}")
                
            # Process PriceOye results
            if not isinstance(results[1], Exception):
                await self.push_to_backend("PriceOye", results[1])
            else:
                logger.error(f"PriceOye discovery failed for '{keyword}': {results[1]}")
            
            # Sleep a bit to avoid hitting rate limits too hard during discovery
            await asyncio.sleep(5)
            
        logger.info("Product Discovery Job completed.")

async def run_manual_discovery():
    job = DiscoveryJob()
    await job.run_discovery()

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    asyncio.run(run_manual_discovery())
