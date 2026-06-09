"""
PennyWise Scraper — Spider Registry
Central registry for all platform spiders.
Adding a new spider only requires importing and adding it to SPIDERS dict.
"""

from spiders.daraz import DarazSpider
from spiders.priceoye import PriceOyeSpider
from spiders.goto import GotoSpider
from spiders.ishopping import IShoppingSpider

# Spider registry — add new spiders here
SPIDERS = {
    "daraz": DarazSpider,
    "priceoye": PriceOyeSpider,
    "goto": GotoSpider,
    "ishopping": IShoppingSpider,
}


def get_all_spiders():
    """Instantiate and return all registered spiders."""
    return [SpiderClass() for SpiderClass in SPIDERS.values()]


def get_spider(platform_name: str):
    """Get a specific spider by platform name."""
    SpiderClass = SPIDERS.get(platform_name)
    if SpiderClass:
        return SpiderClass()
    return None
