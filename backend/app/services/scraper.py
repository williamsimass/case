import requests
from bs4 import BeautifulSoup

def scrape_website(url: str) -> str:
    """
    Realiza o scraping de uma página web e retorna o texto limpo.
    """
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        for script_or_style in soup(['script', 'style']):
            script_or_style.decompose()

        text = ' '.join(line.strip() for line in soup.get_text().splitlines() if line.strip())

        # Limita o texto para não exceder o limite de tokens da IA (ex: 10000 caracteres)
        return text[:10000]

    except requests.RequestException as e:
        print(f"Erro ao acessar a URL {url}: {e}")
        return None

