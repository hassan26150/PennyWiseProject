"""
PennyWise Scraper — Daraz.pk Spider
Scrapes product listings from Daraz Pakistan.
"""

import re
import json
from typing import List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from spiders.base import BaseSpider, ScrapedProduct


class DarazSpider(BaseSpider):
    platform_name = "Daraz"
    base_url = "https://www.daraz.pk"

    def _build_search_url(self, query: str) -> str:
        return f"{self.base_url}/catalog/?q={quote_plus(query)}&ajax=true"

    def _parse_price(self, price_str: str) -> float:
        """Parse Daraz price string like 'Rs. 89,999' to float."""
        if not price_str:
            return 0.0
        cleaned = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return 0.0

    def _parse_rating(self, rating_str: str) -> float:
        """Parse rating string to float."""
        if not rating_str:
            return None
        try:
            return float(rating_str)
        except (ValueError, TypeError):
            return None

    async def search(self, product_name: str) -> List[ScrapedProduct]:
        url = self._build_search_url(product_name)
        try:
            html = await self._fetch(url)
            if not html:
                return []
                
            data = json.loads(html)
            items = data.get('mods', {}).get('listItems', [])
            
            products = []
            for item in items[:self.max_results]:
                name = item.get('name', '')
                price = self._parse_price(str(item.get('price', item.get('priceShow', '0'))))
                product_url = item.get('productUrl', item.get('itemUrl', ''))
                if product_url and not product_url.startswith('http'):
                    product_url = f"https:{product_url}" if product_url.startswith('//') else f"{self.base_url}{product_url}"
                
                image_url = item.get('image', '')
                rating = item.get('ratingScore', None)
                
                if name and price > 0:
                    products.append(ScrapedProduct(
                        platform=self.platform_name,
                        product_name=name,
                        price=price,
                        url=product_url,
                        in_stock=True,
                        rating=float(rating) if rating else None,
                        image_url=image_url
                    ))
            return products
        except Exception as e:
            print(f"Daraz JSON parsing error: {e}")
            return []

    def _extract_script_data(self, soup: BeautifulSoup) -> List[ScrapedProduct]:
        """Try to extract product data from embedded JSON in script tags."""
        products = []
        for script in soup.find_all('script'):
            text = script.string or ''
            if 'listItems' in text or 'products' in text:
                try:
                    # Try to find JSON data
                    json_match = re.search(r'window\.__NEXT_DATA__\s*=\s*({.*?})\s*;', text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group(1))
                        items = self._dig_for_items(data)
                        for item in items[:self.max_results]:
                            name = item.get('name', item.get('title', ''))
                            price = self._parse_price(str(item.get('price', item.get('priceShow', '0'))))
                            url = item.get('productUrl', item.get('itemUrl', ''))
                            if url and not url.startswith('http'):
                                url = f"{self.base_url}{url}"
                            rating = item.get('ratingScore', None)

                            if name and price > 0:
                                products.append(ScrapedProduct(
                                    platform=self.platform_name,
                                    product_name=name,
                                    price=price,
                                    url=url,
                                    in_stock=True,
                                    rating=float(rating) if rating else None,
                                ))
                except (json.JSONDecodeError, AttributeError):
                    continue
        return products

    def _dig_for_items(self, data: dict, depth: int = 0) -> list:
        """Recursively search for product item arrays in nested JSON."""
        if depth > 10:
            return []
        if isinstance(data, dict):
            for key in ('listItems', 'items', 'products', 'mods'):
                if key in data:
                    val = data[key]
                    if isinstance(val, list):
                        return val
                    if isinstance(val, dict):
                        result = self._dig_for_items(val, depth + 1)
                        if result:
                            return result
            for val in data.values():
                if isinstance(val, (dict, list)):
                    result = self._dig_for_items(val, depth + 1)
                    if result:
                        return result
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, (dict, list)):
                    result = self._dig_for_items(item, depth + 1)
                    if result:
                        return result
        return []
