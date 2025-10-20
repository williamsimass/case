# Sales Intelligence Case

## Desafio

O objetivo deste projeto é automatizar e otimizar a coleta de informações relevantes da web para uma equipe de vendas antes de reuniões com clientes específicos. A solução deve:

1. Oferecer uma **API** que receba links de sites e retorne informações relevantes para a equipe de vendas.  
   **Bônus:** Para cada site scrapeado, salvar um JSON em um banco de dados para evitar rescrapear.
2. Oferecer uma **UI** para facilitar o uso para a equipe de vendas.  
   **Bônus:** Autenticação e painel administrativo na UI.

---

## Planejamento da Solução

Antes de iniciar o desenvolvimento, a solução foi planejada considerando:

- **Arquitetura:** Backend em **FastAPI** com endpoints REST, frontend em **React** para a interface, e banco de dados **MongoDB** para cache dos dados scrapeados.
- **Funcionalidade principal:** Receber URLs, processar o conteúdo com scraping e análise via IA, e retornar informações resumidas.
- **Bônus:** Autenticação de usuários e painel administrativo para gerenciamento.

---

## Arquitetura do Projeto

sales-intelligence-complete/
│
├─ backend/ # API e lógica do backend
│ ├─ app/
│ │ ├─ api/v1/endpoints/ # Endpoints da API (scrape, auth, admin)
│ │ ├─ core/ # Configurações, segurança, autenticação
│ │ ├─ models/ # Schemas e models Pydantic
│ │ ├─ services/ # Serviços auxiliares (scraper, cache, IA)
│ │ └─ main.py # Inicialização da aplicação
│ └─ Dockerfile
│
├─ frontend/ # UI em React
│ └─ ...
│
├─ docker-compose.yml # Configuração dos containers
├─ README.md
└─ .gitignore

---

## Funcionalidades

### Backend (API)

- Recebe links de sites e retorna informações relevantes.
- Salva dados scrapeados no **MongoDB** para cache e eficiência.
- Autenticação de usuários (login com roles: vendas e admin).
- Endpoint administrativo para gestão de dados.

### Frontend (UI)

- Interface simples para que a equipe de vendas envie links.
- Visualização das informações extraídas.
- Login e acesso restrito por perfil de usuário.
- Painel administrativo (para usuários admin).

---

## Principais Ferramentas Utilizadas

- **FastAPI**: Criação da API, endpoints e autenticação.
- **React**: Interface web para interação da equipe de vendas.
- **MongoDB**: Armazenamento de dados scrapeados (cache).
- **Docker & Docker Compose**: Isolamento de ambiente e facilidade de deploy.
- **Passlib + JWT**: Autenticação segura via token.
- **BeautifulSoup / Scrapy / Requests**: Coleta e parsing de dados da web.
- **IA (opcional)**: Para análise de textos e geração de insights a partir do conteúdo scrapeado.

---

## Principais Desafios

- Tratar diferentes estruturas de sites e capturar apenas informações relevantes.
- Implementar cache eficiente no banco de dados para não sobrecarregar os sites.
- Garantir segurança e autenticação na API e UI.
- Integrar análise de IA para extrair insights do conteúdo scrapeado.

---

## Como o time de vendas usaria a solução

1. Acessa a UI com login.
2. Insere links de sites relevantes.
3. Recebe os principais insights e informações consolidadas.
4. Admin pode gerenciar usuários e dados scrapeados.

---

## Como rodar o projeto localmente

### Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Comandos

```bash
# Clonar o repositório
git clone https://github.com/williamsimass/case.git
cd case

# Subir containers
docker compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost

Explicação do Código

backend/app/core/security.py → Implementa hashing de senha, JWT e autenticação.

backend/app/api/v1/endpoints/auth.py → Endpoints de login e perfil do usuário.

backend/app/api/v1/endpoints/scrape.py → Recebe URL, faz scraping, analisa e retorna JSON.

backend/app/services/mongo_cache.py → Gerencia cache no MongoDB.

frontend/ → Interface em React para interação com a API.


# Contato

Desenvolvido por William Simas.
Repositório: https://github.com/williamsimass/case
