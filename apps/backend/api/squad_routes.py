"""
Squad Routes - API de Squads OAIOS v3.0

Endpoints para gerenciar squads (times de agentes) da Corporação Senciente.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/squads", tags=["Squads"])

# Squads pré-configurados da Corporação
SQUADS_CATALOG = {
    "devops-core": {
        "id": "devops-core",
        "name": "DevOps Core",
        "icon": "🛠️",
        "mission": "Infraestrutura e CI/CD",
        "description": "Squad responsável por arquitetura de sistemas, containerização, pipelines de CI/CD e infraestrutura cloud.",
        "agents": ["architect", "devops", "qa"],
        "capabilities": [
            "Design de arquitetura",
            "Containerização (Docker/K8s)",
            "Pipelines CI/CD",
            "Infraestrutura como código"
        ],
        "status": "active"
    },
    "frontend-elite": {
        "id": "frontend-elite",
        "name": "Frontend Elite",
        "icon": "🎨",
        "mission": "UI/UX Premium",
        "description": "Squad focado em criar interfaces de usuário excepcionais com design moderno e experiência premium.",
        "agents": ["dev", "ux-design-expert"],
        "capabilities": [
            "Desenvolvimento frontend",
            "Design de interfaces",
            "Prototipagem",
            "Design responsivo"
        ],
        "status": "active"
    },
    "ai-research": {
        "id": "ai-research",
        "name": "AI Research",
        "icon": "🧠",
        "mission": "Evolução Autônoma",
        "description": "Squad dedicado à pesquisa e evolução do próprio sistema, implementando auto-melhoria contínua.",
        "agents": ["architect", "dev", "analyst", "auto_evolution"],
        "capabilities": [
            "Pesquisa de IA",
            "Auto-evolução",
            "Otimização de agentes",
            "Análise de padrões"
        ],
        "status": "active"
    },
    "growth-hacking": {
        "id": "growth-hacking",
        "name": "Growth Hacking",
        "icon": "📈",
        "mission": "Aquisição e Retenção",
        "description": "Squad focado em estratégias de crescimento, marketing e aquisição de usuários.",
        "agents": ["marketing", "sales", "analyst"],
        "capabilities": [
            "Marketing digital",
            "SEO/SEM",
            "Análise de métricas",
            "Growth strategies"
        ],
        "status": "active"
    },
    "financial-ops": {
        "id": "financial-ops",
        "name": "Financial Ops",
        "icon": "💰",
        "mission": "Gestão de Capital",
        "description": "Squad responsável por operações financeiras, trading algorítmico e gestão de risco.",
        "agents": ["trading", "analyst"],
        "capabilities": [
            "Trading algorítmico",
            "Gestão de risco",
            "Análise financeira",
            "Automação de trades"
        ],
        "status": "active"
    },
    "security-squad": {
        "id": "security-squad",
        "name": "Security Squad",
        "icon": "🔒",
        "mission": "Segurança e Qualidade",
        "description": "Squad dedicado à segurança, validação de código e compliance.",
        "agents": ["qa", "devops"],
        "capabilities": [
            "Code review",
            "Security audit",
            "Compliance",
            "Testes de segurança"
        ],
        "status": "active"
    }
}


@router.get("")
async def list_squads(status: Optional[str] = None) -> Dict[str, Any]:
    """
    Lista todos os squads disponíveis.
    
    Args:
        status: Filtrar por status (active, inactive)
    """
    squads = list(SQUADS_CATALOG.values())
    
    if status:
        squads = [s for s in squads if s.get("status") == status]
    
    return {
        "squads": squads,
        "total": len(squads)
    }


@router.get("/{squad_id}")
async def get_squad(squad_id: str) -> Dict[str, Any]:
    """
    Obtém detalhes de um squad específico.
    """
    if squad_id not in SQUADS_CATALOG:
        raise HTTPException(status_code=404, detail=f"Squad {squad_id} não encontrado")
    
    squad = SQUADS_CATALOG[squad_id].copy()
    
    # Enriquecer com detalhes dos agentes
    from backend.api.agent_routes import AGENT_CATALOG
    squad["agent_details"] = []
    for agent_id in squad["agents"]:
        if agent_id in AGENT_CATALOG:
            squad["agent_details"].append(AGENT_CATALOG[agent_id])
    
    return {"squad": squad}


@router.post("/{squad_id}/execute")
async def execute_squad(squad_id: str, task_description: str) -> Dict[str, Any]:
    """
    Executa uma tarefa usando um squad específico.
    
    Args:
        squad_id: ID do squad
        task_description: Descrição da tarefa a executar
    """
    if squad_id not in SQUADS_CATALOG:
        raise HTTPException(status_code=404, detail=f"Squad {squad_id} não encontrado")
    
    squad = SQUADS_CATALOG[squad_id]
    
    # Criar tarefa na fila com o squad
    from backend.core.services.task_queue import get_task_queue, TaskPriority
    queue = get_task_queue()
    
    task = await queue.add(
        description=task_description,
        priority=TaskPriority.HIGH,
        squad_id=squad_id,
        metadata={
            "squad_name": squad["name"],
            "agents": squad["agents"]
        }
    )
    
    return {
        "success": True,
        "task": task.to_dict(),
        "squad": squad["name"],
        "message": f"Tarefa criada para o squad {squad['name']}"
    }


@router.get("/{squad_id}/stats")
async def get_squad_stats(squad_id: str) -> Dict[str, Any]:
    """
    Obtém estatísticas de um squad.
    """
    if squad_id not in SQUADS_CATALOG:
        raise HTTPException(status_code=404, detail=f"Squad {squad_id} não encontrado")
    
    squad = SQUADS_CATALOG[squad_id]
    
    # Buscar tarefas do squad
    from backend.core.services.task_queue import get_task_queue
    queue = get_task_queue()
    all_tasks = await queue.get_all(limit=100)
    
    squad_tasks = [t for t in all_tasks if t.squad_id == squad_id]
    
    stats = {
        "total_tasks": len(squad_tasks),
        "pending": sum(1 for t in squad_tasks if t.status.value == "pending"),
        "in_progress": sum(1 for t in squad_tasks if t.status.value == "in_progress"),
        "completed": sum(1 for t in squad_tasks if t.status.value == "completed"),
        "failed": sum(1 for t in squad_tasks if t.status.value == "failed")
    }
    
    return {
        "squad_id": squad_id,
        "squad_name": squad["name"],
        "stats": stats
    }


@router.get("/meeting-logs")
async def get_squad_meeting_logs() -> Dict[str, Any]:
    """
    Retorna o log da última reunião de squad (Automação de Docs).
    """
    import os
    log_path = "backend/logs/SQUAD_MEETING_LOGS.md"
    
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                content = f.read()
            return {"success": True, "logs": content}
        except Exception as e:
            return {"success": False, "error": str(e)}
            
    return {"success": False, "logs": "Nenhum log de reunião encontrado."}
