from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ScrapeRequest, ScrapeResponse, SalesInsights
from app.services.mongo_cache import get_cache_by_url, save_to_cache
from app.services.scraper import scrape_website
from app.services.ai_analyzer import analyze_text_with_ai
from app.core.security import get_current_user, get_current_active_admin_user # Dependência de autenticação
import hashlib
from datetime import datetime

# Mock da dependência de autenticação para desenvolvimento inicial
async def mock_get_current_user():
    return {'username': 'testuser'}

router = APIRouter()

@router.get("/admin/cached_data", response_model=list[ScrapeResponse])
async def get_all_cached_data(current_user: dict = Depends(get_current_active_admin_user)):
    """
    Retorna todos os dados cacheados. Apenas para usuários administradores.
    """
    cached_items = await get_all_cached_items()
    return cached_items

# Em um ambiente real, o banco de dados seria injetado aqui.
# Por enquanto, vamos simular a lógica de cache em memória para a Fase 2.

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_and_analyze_url(
    request: ScrapeRequest,
    current_user: dict = Depends(get_current_user) # Descomentar na fase de segurança
):
    """
    Recebe uma URL, realiza a verificação de cache, scraping, análise com IA e retorna os insights.
    """
    url = request.url
    
    # 1. Verificação de Cache
    cached_data = await get_cache_by_url(url)
    if cached_data:
        return ScrapeResponse(
            url=url,
            is_cached=True,
            insights=cached_data.insights,
            cached_at=cached_data.updated_at
        )

    # 2. Cache Miss: Scraping do conteúdo da URL
    scraped_text = scrape_website(url)
    if not scraped_text:
        raise HTTPException(status_code=400, detail=f"Não foi possível raspar o conteúdo da URL: {url}")

    # 3. Análise do texto com IA
    insights_data = analyze_text_with_ai(scraped_text)
    if "error" in insights_data:
        raise HTTPException(status_code=500, detail=f"Erro na análise de IA: {insights_data['error']}")

    # 4. Validação com Pydantic
    try:
        insights = SalesInsights(**insights_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao validar os dados da IA: {e}")

    # 5. Salvar no Cache
    new_cache_item = await save_to_cache(url, insights)

    # 6. Montagem da resposta
    return ScrapeResponse(
        url=url,
        is_cached=False,
        insights=insights,
        cached_at=new_cache_item.updated_at
    )

