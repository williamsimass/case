from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import scrape, auth
from app.services.mongo_cache import create_mongo_index

app = FastAPI(title="Sales Intelligence API", version="0.1.0")

# Configuração de CORS para permitir acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(scrape.router, prefix="/api/v1", tags=["scraping"])

@app.on_event("startup")
async def startup_db_client():
    """Inicializa conexões e índices no startup da aplicação"""
    print("🚀 Iniciando Sales Intelligence API...")
    
    # Tenta criar índice do MongoDB (não crítico)
    try:
        await create_mongo_index()
    except Exception as e:
        # Não loga novamente pois create_mongo_index já loga
        pass
    
    print("✅ Sales Intelligence API iniciada com sucesso!")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sales Intelligence API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
