"""
============================================
CLI Orchestrator Routes - FastAPI
Corporação Senciente - Orquestra de CLIs
============================================

Rotas de API para executar comandos via Aider e Qwen.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import logging

from backend.core.services.cli_orchestrator import orchestrator
from backend.core.services.aider_service import aider_service
from backend.core.services.qwen_service import qwen_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cli", tags=["CLI Orchestrator"])

# ===== SCHEMAS =====

class ExecuteCommandRequest(BaseModel):
    """Request para executar comando via CLI."""
    command: str
    cli: Optional[Literal["aider", "qwen"]] = None
    mode: Optional[Literal["chat", "task"]] = "task" # Default para Task (Maestro)
    auto_handoff: bool = True


class DocumentFileRequest(BaseModel):
    """Request para documentar arquivo."""
    file_path: str

class TranslateUIRequest(BaseModel):
    """Request para traduzir componente."""
    component_path: str
    target_lang: Literal["pt", "en"] = "pt"

# ===== ROUTES =====

@router.post("/orchestrator/execute")
async def execute_command(request: ExecuteCommandRequest):
    """
    Executa comando via CLI apropriada (Aider ou Qwen).
    
    Se CLI não especificada, o orquestrador decide automaticamente.
    """
    try:
        result = await orchestrator.execute_command(
            command=request.command,
            cli=request.cli,
            mode=request.mode,
            auto_handoff=request.auto_handoff
        )
        
        return result
        
        
    except Exception as e:
        logger.error(f"Erro ao executar comando: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orchestrator/proactive-summary")
async def get_proactive_summary():
    """Retorna resumo proativo do sistema."""
    try:
        summary = await orchestrator.generate_proactive_summary()
        return summary
    except Exception as e:
        logger.error(f"Erro ao gerar resumo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orchestrator/logs")
async def get_logs(lines: int = 20):
    """Retorna logs recentes do sistema."""
    try:
        logs = await orchestrator.get_recent_logs(lines)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orchestrator/start-frontend")
async def start_frontend():
    """Inicia o servidor Frontend (Mission Control)."""
    try:
        result = await orchestrator.start_frontend()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orchestrator/frontend")
async def get_frontend_status():
    """Retorna status do Frontend (Mission Control)."""
    try:
        status = await orchestrator.check_frontend_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/aider/execute")
async def execute_aider(request: ExecuteCommandRequest):
    """Executa comando diretamente via Aider CLI."""
    try:
        result = await aider_service.execute(request.command)
        return result
        
    except Exception as e:
        logger.error(f"Erro ao executar Aider: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qwen/execute")
async def execute_qwen(request: ExecuteCommandRequest):
    """Executa tarefa diretamente via Qwen."""
    try:
        result = await qwen_service.execute(request.command)
        return result
        
    except Exception as e:
        logger.error(f"Erro ao executar Qwen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qwen/document")
async def document_file(request: DocumentFileRequest):
    """Documenta arquivo específico via Qwen."""
    try:
        result = await qwen_service.document_file(request.file_path)
        return result
        
    except Exception as e:
        logger.error(f"Erro ao documentar arquivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qwen/translate")
async def translate_ui(request: TranslateUIRequest):
    """Traduz componente de UI via Qwen."""
    try:
        result = await qwen_service.translate_ui(
            request.component_path,
            request.target_lang
        )
        return result
        
    except Exception as e:
        logger.error(f"Erro ao traduzir componente: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orchestrator/proactive-summary")
async def get_proactive_summary():
    """Retorna resumo consolidado para notificações proativas."""
    try:
        return await orchestrator.get_proactive_summary()
    except Exception as e:
        logger.error(f"Erro ao obter resumo proativo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Retorna status da Orquestra de CLIs."""
    try:
        # Validar instalação do Aider
        aider_installed = await aider_service.validate_installation()
        
        return {
            "aider": {
                "installed": aider_installed,
                "model": aider_service.model,
                "editor_model": aider_service.editor_model
            },
            "qwen": {
                "model": qwen_service.model,
                "api_configured": bool(qwen_service.api_key)
            },
            "orchestrator": {
                "state": orchestrator.state
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/state")
async def get_state():
    """Retorna estado atual das CLIs (pending tasks, etc.)."""
    return orchestrator.state
