from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.models.schemas import WebCache, SalesInsights
from datetime import datetime, timedelta, timezone
import hashlib
from typing import Optional

# Variáveis globais para lazy loading
_client = None
_database = None
_cache_collection = None

def get_mongo_client():
    """
    Cria o cliente MongoDB sob demanda (lazy loading).
    Isso evita que o container crashe se houver problema com MongoDB durante a importação.
    """
    global _client, _database, _cache_collection
    
    if _client is None:
        try:
            _client = AsyncIOMotorClient(settings.MONGO_URI)
            _database = _client[settings.MONGO_DB_NAME]
            _cache_collection = _database[settings.CACHE_COLLECTION_NAME]
        except Exception as e:
            print(f"⚠️ Aviso: Não foi possível conectar ao MongoDB: {e}")
            raise
    
    return _client, _database, _cache_collection

async def get_cache_by_url(url: str) -> Optional[WebCache]:
    """
    Verifica se a URL está em cache e se o cache ainda é válido.
    """
    try:
        _, _, cache_collection = get_mongo_client()
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        return None
    
    url_hash = hashlib.sha256(url.encode('utf-8')).hexdigest()
    
    try:
        cached_data = await cache_collection.find_one({"_id": url_hash})
        
        if cached_data:
            # Verifica a validade do cache
            cache_expiration_date = cached_data["updated_at"] + timedelta(days=settings.CACHE_EXPIRATION_DAYS)
            now_br = datetime.now(timezone.utc) - timedelta(hours=3)
            now_br = now_br.replace(tzinfo=None)
            if now_br < cache_expiration_date:
                # Cache válido
                return WebCache(
                    url_hash=cached_data["_id"],
                    url=cached_data["url"],
                    insights=SalesInsights(**cached_data["insights"]),
                    created_at=cached_data["created_at"],
                    updated_at=cached_data["updated_at"]
                )
            else:
                # Cache expirado
                return None
        
        return None
    except Exception as e:
        print(f"Erro ao buscar cache: {e}")
        return None

async def save_to_cache(url: str, insights: SalesInsights) -> Optional[WebCache]:
    """
    Salva o resultado da análise no cache do MongoDB.
    """
    try:
        _, _, cache_collection = get_mongo_client()
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        return None
    
    url_hash = hashlib.sha256(url.encode('utf-8')).hexdigest()
    now = datetime.now(timezone.utc) - timedelta(hours=3)
    now = now.replace(tzinfo=None)
    
    cache_item = {
        "_id": url_hash,
        "url": url,
        "insights": insights.model_dump(),
        "created_at": now,
        "updated_at": now
    }
    
    try:
        # Usa upsert para inserir ou atualizar
        await cache_collection.update_one(
            {"_id": url_hash},
            {"$set": cache_item},
            upsert=True
        )
        
        return WebCache(**cache_item)
    except Exception as e:
        print(f"Erro ao salvar no cache: {e}")
        return None

async def create_mongo_index():
    """
    Cria um índice TTL (Time-To-Live) para o campo 'updated_at' para limpeza automática de cache.
    (Embora a lógica de validade seja feita no código, é bom ter um TTL para limpeza de documentos muito antigos)
    """
    try:
        _, _, cache_collection = get_mongo_client()
        
        # Cria um índice no campo 'updated_at' para otimizar queries
        await cache_collection.create_index([("updated_at", 1)])
        
        # O TTL será controlado pelo código, mas podemos ter um índice de expiração para documentos
        # que o código não está verificando (ex: se o CACHE_EXPIRATION_DAYS fosse usado no TTL)
        # Por hora, mantemos o controle de validade no código para maior flexibilidade.
        
        print("✅ MongoDB index criado/verificado.")
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível criar índice no MongoDB: {e}")
        print("A aplicação continuará rodando, mas o cache pode não funcionar corretamente.")
        # Não lança exceção para permitir que a aplicação continue

