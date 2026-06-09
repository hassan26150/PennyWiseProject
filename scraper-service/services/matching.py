"""
PennyWise Scraper — Product Matching Service
Uses RapidFuzz for fuzzy string matching between internal and external products.
"""

import re
from typing import List, Tuple, Optional
from rapidfuzz import fuzz, process
from spiders.base import ScrapedProduct
from config import settings


def _clean_for_matching(name: str) -> str:
    """
    Clean a product name for fuzzy matching.
    - Lowercase
    - Remove special characters
    - Normalize common abbreviations
    """
    if not name:
        return ""

    cleaned = name.lower().strip()

    # Common replacements for Pakistani product listings
    replacements = {
        'gb': ' gb ',
        'tb': ' tb ',
        'ram': ' ram ',
        'rom': ' rom ',
        'inch': ' inch ',
        '"': ' inch ',
        "''": ' inch ',
        '/': ' ',
        '-': ' ',
        '+': ' plus ',
        '(': ' ',
        ')': ' ',
        ',': ' ',
    }

    for old, new in replacements.items():
        cleaned = cleaned.replace(old, new)

    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return cleaned


def match_product(
    query_name: str,
    scraped_product: ScrapedProduct,
    threshold: float = None,
) -> Tuple[bool, float]:
    """
    Check if a scraped product matches the query product name.

    Returns:
        (is_match: bool, score: float)
    """
    if threshold is None:
        threshold = settings.MATCH_THRESHOLD

    clean_query = _clean_for_matching(query_name)
    clean_scraped = _clean_for_matching(scraped_product.product_name)

    if not clean_query or not clean_scraped:
        return False, 0.0

    # Use multiple fuzzy matching strategies and take the best score
    scores = [
        fuzz.token_sort_ratio(clean_query, clean_scraped),
        fuzz.token_set_ratio(clean_query, clean_scraped),
        fuzz.partial_ratio(clean_query, clean_scraped),
    ]

    best_score = max(scores)

    return best_score >= threshold, best_score


def filter_matches(
    query_name: str,
    products: List[ScrapedProduct],
    threshold: float = None,
) -> List[dict]:
    """
    Filter a list of scraped products to only include matches.

    Returns a list of dicts with the product and its match score:
    [
        { "product": ScrapedProduct, "match_score": 87.5 },
        ...
    ]
    """
    if threshold is None:
        threshold = settings.MATCH_THRESHOLD

    matches = []
    for product in products:
        is_match, score = match_product(query_name, product, threshold)
        if is_match:
            matches.append({
                "product": product,
                "match_score": round(score, 1),
            })

    # Sort by match score (highest first)
    matches.sort(key=lambda x: x["match_score"], reverse=True)

    return matches


def find_best_match(
    query_name: str,
    products: List[ScrapedProduct],
) -> Optional[dict]:
    """
    Find the single best matching product from a list.
    Returns None if no match meets the threshold.
    """
    matches = filter_matches(query_name, products)
    if matches:
        return matches[0]
    return None
