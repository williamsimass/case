
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Modelos de Autenticação ---
class UserInDB(BaseModel):
    username: str
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# --- Modelos de Insights de Vendas (Retorno da IA) ---
class SalesInsights(BaseModel):
    nome_empresa: str = Field(..., description="Nome da empresa dona do site.")
    principal_servico_produto: str = Field(..., description="O principal serviço ou produto oferecido.")
    publico_alvo: str = Field(..., description="O público-alvo principal da empresa.")
    proposta_de_valor: str = Field(..., description="Um resumo conciso (máximo 2 frases) da proposta de valor.")
    pontos_de_venda_usp: List[str] = Field(..., description="3 a 5 pontos de venda únicos (USPs) que o time de vendas pode usar.")
    resumo_executivo: str = Field(..., description="Um resumo executivo do conteúdo do site para a reunião.")

# --- Modelo de Cache (MongoDB) ---
class WebCache(BaseModel):
    url_hash: str = Field(..., alias="_id") # Mapeia o _id do MongoDB para url_hash
    url: str
    insights: SalesInsights
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True  # Permite que o Pydantic use tanto o nome do campo quanto o alias
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

# --- Modelo de Requisição de Scraping ---
class ScrapeRequest(BaseModel):
    url: str = Field(..., description="URL do site a ser raspado e analisado.")

# --- Modelo de Resposta de Scraping ---
class ScrapeResponse(BaseModel):
    url: str
    is_cached: bool
    insights: SalesInsights
    cached_at: Optional[datetime] = None

