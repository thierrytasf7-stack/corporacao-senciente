"""
============================================
Orquestra API Main - FastAPI Entry Point
Corporação Senciente
============================================

Servidor principal para o Orquestrador de CLIs.
"""

import sys
import os

# Adicionar raiz do projeto ao path para imports funcionarem
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# Configuração de Logs
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        RotatingFileHandler("logs/backend.log", maxBytes=10*1024*1024, backupCount=5, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_orchestra")

# Carregar envs
load_dotenv()

from backend.api.cli_routes import router as cli_router
from backend.api.task_routes import router as task_router
from backend.api.agent_routes import router as agent_router
from backend.api.squad_routes import router as squad_router
from backend.api.metrics_routes import router as metrics_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 OAIOS API Starting up...")
    # Iniciar orquestrador automaticamente? Opcional. 
    # Por enquanto, mantemos manual via /start ou podemos auto-iniciar.
    # Vamos manter o comportamento atual de iniciar via rota, mas garantir limpeza no shutdown.
    yield
    # Shutdown
    logger.info("🛑 OAIOS API Shutting down...")
    from backend.core.services.cerebro_orchestrator import get_orchestrator
    orchestrator = get_orchestrator()
    if orchestrator.running:
        logger.info("Parando Orquestrador...")
        orchestrator.stop()

app = FastAPI(
    title="Corporação Senciente - OAIOS v3.0",
    description="API do Operating Agent-based Intelligent Orchestration System",
    version="3.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(cli_router)
app.include_router(task_router)
app.include_router(agent_router)
app.include_router(squad_router)
app.include_router(metrics_router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "oaios-api", "version": "3.0.0"}


@app.get("/api/orchestrator/status")
async def get_orchestrator_status():
    """Obtém status do CerebroOrchestrator."""
    from backend.core.services.cerebro_orchestrator import get_orchestrator
    orchestrator = get_orchestrator()
    return orchestrator.get_status()


@app.post("/api/orchestrator/start")
async def start_orchestrator():
    """Inicia o CerebroOrchestrator em background."""
    from backend.core.services.cerebro_orchestrator import start_orchestrator_background
    await start_orchestrator_background()
    return {"success": True, "message": "CerebroOrchestrator iniciado em background"}


@app.post("/api/orchestrator/stop")
async def stop_orchestrator():
    """Para o CerebroOrchestrator."""
    from backend.core.services.cerebro_orchestrator import get_orchestrator
    orchestrator = get_orchestrator()
    orchestrator.stop()
    return {"success": True, "message": "CerebroOrchestrator parando..."}


if __name__ == "__main__":
    # Iniciar na porta 3002 para não conflitar com o Dashboard (3001)
    uvicorn.run(app, host="0.0.0.0", port=3002)
