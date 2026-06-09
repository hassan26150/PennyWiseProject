import httpx
from bs4 import BeautifulSoup
r = httpx.get('https://priceoye.pk/search?q=smartphones', headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')
cards = soup.select('.productBox, .product-box, [class*="product-card"]')
for card in cards[:3]:
    name_el = card.select_one('.p-title') or card.select_one('.p-title-brand') or card.select_one('.product-name') or card.select_one('div.p-title') or card.select_one('h4') or card.select_one('.product-title') or card.select_one('.title')
    name = name_el.get_text(strip=True) if name_el else 'Unknown'
    price_el = card.select_one('.price-box') or card.select_one('.price') or card.select_one('[class*="price"]')
    price = price_el.get_text(strip=True) if price_el else '0'
    print(f'Name: {name} | Price: {price}')
