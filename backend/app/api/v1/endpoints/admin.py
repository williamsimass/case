from fastapi import APIRouter, Depends
from app.core.security import get_current_admin_user
from app.services.mongo_cache import get_cache_stats
from datetime import datetime

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_admin_user)):
    """
    Endpoint protegido para administradores.
    Retorna estatísticas do sistema.
    """
    try:
        stats = await get_cache_stats()
        return {
            "total_analyses": stats.get("total_analyses", 0),
            "cache_hits": stats.get("cache_hits", 0),
            "cache_misses": stats.get("cache_misses", 0),
            "unique_urls": stats.get("unique_urls", 0),
            "last_analysis": stats.get("last_analysis"),
            "cache_efficiency": f"{stats.get('cache_efficiency', 0):.1f}%",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "total_analyses": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "unique_urls": 0,
            "last_analysis": None,
            "cache_efficiency": "0.0%",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@router.get("/recent-analyses")
async def get_recent_analyses(current_user: dict = Depends(get_current_admin_user), limit: int = 10):
    """
    Endpoint protegido para administradores.
    Retorna as análises mais recentes.
    """
    try:
        from app.services.mongo_cache import get_recent_analyses
        analyses = await get_recent_analyses(limit)
        return {
            "analyses": analyses,
            "count": len(analyses)
        }
    except Exception as e:
        return {
            "analyses": [],
            "count": 0,
            "error": str(e)
        }

