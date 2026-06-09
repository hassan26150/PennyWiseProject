"""
PennyWise Scraper — iShopping.pk Spider
Scrapes product listings from iShopping Pakistan.
"""

import re
from typing import List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from spiders.base import BaseSpider, ScrapedProduct


class IShoppingSpider(BaseSpider):
    platform_name = "iShopping"
    base_url = "https://www.ishopping.pk"

    def _build_search_url(self, query: str) -> str:
        return f"{self.base_url}/search?q={quote_plus(query)}"

    def _parse_price(self, price_str: str) -> float:
        """Parse iShopping price string to float."""
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

        # iShopping uses a standard e-commerce grid layout
        product_cards = soup.select(
            '.product-card, .product-item, .product-grid-item, '
            '[class*="product-card"], [class*="productCard"], '
            '.grid__item, .product-block'
        )

        if not product_cards:
            # Fallback: look for product links in a grid
            product_cards = soup.select('.collection-product, .product, [data-product-id]')

        for card in product_cards[:self.max_results]:
            try:
                # Product name
                name_el = card.select_one(
                    '.product-card__title, .product-title, '
                    'h3, h4, h5, .title, [class*="title"], '
                    '.product-name, a.product-link'
                )
                name = name_el.get_text(strip=True) if name_el else ''

                # Price
                price_el = card.select_one(
                    '.product-card__price, .price, [class*="price"], '
                    '.product-price, .money, .amount'
                )
                price_text = price_el.get_text(strip=True) if price_el else '0'
                price = self._parse_price(price_text)

                # URL
                link_el = card.select_one('a[href]')
                product_url = link_el.get('href', '') if link_el else ''
                if product_url and not product_url.startswith('http'):
                    product_url = f"{self.base_url}{product_url}"

                # Image
                img_el = card.select_one('img[src], img[data-src]')
                image_url = None
                if img_el:
                    image_url = img_el.get('src') or img_el.get('data-src') or ''
                    if image_url.startswith('//'):
                        image_url = f"https:{image_url}"

                # Stock
                sold_out = card.select_one('[class*="sold-out"], [class*="soldout"], [class*="out-of-stock"]')
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
