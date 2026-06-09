"""
PennyWise Scraper — Goto.com.pk Spider
Scrapes product listings from Goto Pakistan.
"""

import re
from typing import List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from spiders.base import BaseSpider, ScrapedProduct


class GotoSpider(BaseSpider):
    platform_name = "Goto"
    base_url = "https://www.goto.com.pk"

    def _build_search_url(self, query: str) -> str:
        return f"{self.base_url}/search?q={quote_plus(query)}"

    def _parse_price(self, price_str: str) -> float:
        """Parse Goto price string to float."""
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

        # Goto uses Shopify-style product grid
        product_cards = soup.select(
            '.product-card, .grid-product, '
            '[class*="product-card"], [class*="productCard"], '
            '.product-item, .collection-product-card'
        )

        if not product_cards:
            # Shopify fallback: look for product links
            product_cards = soup.select('.grid__item, .product-grid-item')

        for card in product_cards[:self.max_results]:
            try:
                # Product name
                name_el = card.select_one(
                    '.product-card__title, .product-card__name, '
                    'h3, h4, .product-title, [class*="title"], '
                    'a.product-link, .product-name'
                )
                name = name_el.get_text(strip=True) if name_el else ''

                # Price — look for sale price first, then regular
                price_el = card.select_one(
                    '.product-card__price, .price, [class*="price"], '
                    '.product-price, .price--sale, .money'
                )
                price_text = price_el.get_text(strip=True) if price_el else '0'
                # Sometimes there are multiple prices (original + sale)
                # Take the first number we find
                price = self._parse_price(price_text)

                # URL
                link_el = card.select_one('a[href]')
                product_url = link_el.get('href', '') if link_el else ''
                if product_url and not product_url.startswith('http'):
                    product_url = f"{self.base_url}{product_url}"

                # Image
                img_el = card.select_one('img[src], img[data-src], img[data-srcset]')
                image_url = None
                if img_el:
                    image_url = img_el.get('src') or img_el.get('data-src') or ''
                    if image_url.startswith('//'):
                        image_url = f"https:{image_url}"

                # Stock
                sold_out = card.select_one('[class*="sold-out"], [class*="soldout"]')
                in_stock = sold_out is None

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
