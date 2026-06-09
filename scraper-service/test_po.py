import httpx
from bs4 import BeautifulSoup
r = httpx.get('https://priceoye.pk/search?q=smartphones', headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')
print(len(soup.select('.productBox, .product-box, [class*="product-card"]')))
with open('po.html', 'w', encoding='utf-8') as f:
  f.write(r.text)
