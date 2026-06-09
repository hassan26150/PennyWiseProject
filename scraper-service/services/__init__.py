"""
PennyWise Scraper — Normalization Service
Standardizes scraped data across all platforms into a uniform format.
"""

import re
from typing import List, Optional
from spiders.base import ScrapedProduct


def normalize_price(price_str: str) -> float:
    """
    Clean and normalize a price string to a float.
    Handles: 'Rs. 89,999', 'PKR 89999', '₨89,999', 'Rs89999', etc.
    """
    if isinstance(price_str, (int, float)):
        return float(price_str)

    if not price_str:
        return 0.0

    # Remove currency symbols and text
    cleaned = re.sub(r'(Rs\.?|PKR|₨|rupees?)', '', str(price_str), flags=re.IGNORECASE)
    # Remove commas and whitespace
    cleaned = cleaned.replace(',', '').strip()
    # Extract the first number (with optional decimal)
    match = re.search(r'(\d+\.?\d*)', cleaned)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return 0.0
    return 0.0


def normalize_product_name(name: str) -> str:
    """
    Normalize a product name for comparison purposes.
    - Trim whitespace
    - Remove extra spaces
    - Lowercase for matching
    """
    if not name:
        return ""
    # Remove extra whitespace
    normalized = re.sub(r'\s+', ' ', name.strip())
    return normalized


def normalize_stock_status(status) -> bool:
    """
    Convert various stock status representations to a boolean.
    """
    if isinstance(status, bool):
        return status
    if isinstance(status, str):
        lower = status.lower().strip()
        out_of_stock_keywords = [
            'out of stock', 'sold out', 'unavailable',
            'not available', 'out-of-stock', 'soldout',
        ]
        return not any(kw in lower for kw in out_of_stock_keywords)
    return True


def normalize_rating(rating) -> Optional[float]:
    """
    Normalize a rating value to 0-5 scale.
    """
    if rating is None:
        return None

    try:
        val = float(rating)
    except (ValueError, TypeError):
        return None

    # If rating is on a 10-point scale, convert
    if val > 5.0:
        val = val / 2.0

    # Clamp to 0-5
    return max(0.0, min(5.0, round(val, 1)))


def normalize_url(url: str, base_url: str = "") -> str:
    """Ensure URL is absolute."""
    if not url:
        return ""
    if url.startswith('http'):
        return url
    if url.startswith('//'):
        return f"https:{url}"
    if url.startswith('/') and base_url:
        return f"{base_url.rstrip('/')}{url}"
    return url


def normalize_product(product: ScrapedProduct) -> ScrapedProduct:
    """Apply all normalizations to a single ScrapedProduct."""
    return ScrapedProduct(
        platform=product.platform,
        product_name=normalize_product_name(product.product_name),
        price=product.price,  # Already parsed to float by spiders
        url=normalize_url(product.url),
        in_stock=normalize_stock_status(product.in_stock),
        rating=normalize_rating(product.rating),
        currency="PKR",
        scraped_at=product.scraped_at,
        image_url=product.image_url,
    )


def normalize_results(products: List[ScrapedProduct]) -> List[ScrapedProduct]:
    """Normalize a list of scraped products."""
    normalized = []
    for p in products:
        try:
            normalized.append(normalize_product(p))
        except Exception:
            continue
    return normalized
