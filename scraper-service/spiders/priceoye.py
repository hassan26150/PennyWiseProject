"""
PennyWise Scraper — PriceOye.pk Spider
Scrapes product listings from PriceOye Pakistan.
"""

import re
from typing import List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from spiders.base import BaseSpider, ScrapedProduct


class PriceOyeSpider(BaseSpider):
    platform_name = "PriceOye"
    base_url = "https://priceoye.pk"

    def _build_search_url(self, query: str) -> str:
        return f"{self.base_url}/search?q={quote_plus(query)}"

    def _parse_price(self, price_str: str) -> float:
        """Parse PriceOye price like 'Rs 89,999' to float."""
        if not price_str:
            return 0.0
        cleaned = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return 0.0

    async def search(self, product_name: str) -> List[ScrapedProduct]:
        url = self._build_search_url(product_name)
        html = await self._fetch(url)

        if not html:
            return []

        products = []
        soup = BeautifulSoup(html, 'lxml')

        # PriceOye product cards
        product_cards = soup.select('.productBox, .product-box, [class*="product-card"], [class*="productCard"]')

        if not product_cards:
            # Fallback: look for product listing containers
            product_cards = soup.select('.p-grid-item, .product-item, .col-product')

        if not product_cards:
            # Another fallback: find all links with price patterns
            product_cards = soup.select('a[href*="/product/"], a[href*="/mobile/"]')

        for card in product_cards[:self.max_results]:
            try:
                # Product name
                name_el = (
                    card.select_one('.p-title') or 
                    card.select_one('.p-title-brand') or 
                    card.select_one('.product-name') or 
                    card.select_one('div.p-title') or 
                    card.select_one('h4') or 
                    card.select_one('.product-title') or 
                    card.select_one('.title')
                )
                name = name_el.get_text(strip=True) if name_el else ''

                if not name:
                    # Try the card itself if it's a link
                    name = card.get('title', '') or card.get_text(strip=True)[:100]

                # Price
                price_el = card.select_one('.price-box') or card.select_one('.price') or card.select_one('[class*="price"]')
                price_text = price_el.get_text(strip=True) if price_el else '0'
                price = self._parse_price(price_text)

                # URL
                link_el = card if card.name == 'a' else card.select_one('a[href]')
                product_url = link_el.get('href', '') if link_el else ''
                if product_url and not product_url.startswith('http'):
                    product_url = f"{self.base_url}{product_url}"

                # Image
                img_el = card.select_one('img[src], img[data-src]')
                image_url = None
                if img_el:
                    image_url = img_el.get('src') or img_el.get('data-src')

                # Stock status
                out_of_stock_el = card.select_one('[class*="out-of-stock"], [class*="outOfStock"]')
                in_stock = out_of_stock_el is None

                if name and price > 0:
                    products.append(ScrapedProduct(
                        platform=self.platform_name,
                        product_name=name.strip(),
                        price=price,
                        url=product_url,
                        in_stock=in_stock,
                        image_url=image_url,
                    ))
            except Exception:
                continue

        return products
