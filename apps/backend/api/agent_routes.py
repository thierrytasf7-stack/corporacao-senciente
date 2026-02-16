"""
Agent Routes - API de Agentes OAIOS v3.0

Endpoints para listar e gerenciar agentes da Corporação Senciente.
"""

import os
import yaml
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/agents", tags=["Agents"])

# Diretório dos agentes AIOS
AIOS_AGENTS_DIR = Path(__file__).parent.parent.parent / "agents" / "aios"

# Catálogo de agentes com metadados
AGENT_CATALOG = {
    # Development Agents (AIOS)
    "dev": {
        "id": "dev",
        "name": "Dex",
        "title": "Full Stack Developer",
        "icon": "💻",
        "category": "development",
        "description": "Implementação de código, debugging, refatoração",
        "source": "aios-core",
        "file": "dev.md"
    },
    "architect": {
        "id": "architect",
        "name": "Architect",
        "title": "System Architect",
        "icon": "🏗️",
        "category": "development",
        "description": "Design de sistema e arquitetura técnica",
        "source": "aios-core",
        "file": "architect.md"
    },
    "qa": {
        "id": "qa",
        "name": "Quinn",
        "title": "Quality Assurance",
        "icon": "🧪",
        "category": "quality",
        "description": "Testes, validação e garantia de qualidade",
        "source": "aios-core",
        "file": "qa.md"
    },
    "pm": {
        "id": "pm",
        "name": "PM",
        "title": "Product Manager",
        "icon": "📋",
        "category": "product",
        "description": "Gerenciamento de produto e priorização",
        "source": "aios-core",
        "file": "pm.md"
    },
    "sm": {
        "id": "sm",
        "name": "River",
        "title": "Scrum Master",
        "icon": "🔄",
        "category": "product",
        "description": "Gerenciamento de sprint e criação de histórias",
        "source": "aios-core",
        "file": "sm.md"
    },
    "devops": {
        "id": "devops",
        "name": "Gage",
        "title": "DevOps Engineer",
        "icon": "⚙️",
        "category": "infrastructure",
        "description": "CI/CD, deploy, infraestrutura",
        "source": "aios-core",
        "file": "devops.md"
    },
    "analyst": {
        "id": "analyst",
        "name": "Analyst",
        "title": "Business Analyst",
        "icon": "📊",
        "category": "business",
        "description": "Análise de negócios e criação de PRD",
        "source": "aios-core",
        "file": "analyst.md"
    },
    "data-engineer": {
        "id": "data-engineer",
        "name": "Data Engineer",
        "title": "Data Engineer",
        "icon": "🗄️",
        "category": "data",
        "description": "ETL, pipelines de dados, banco de dados",
        "source": "aios-core",
        "file": "data-engineer.md"
    },
    "po": {
        "id": "po",
        "name": "PO",
        "title": "Product Owner",
        "icon": "👤",
        "category": "product",
        "description": "Gerenciamento de backlog e histórias",
        "source": "aios-core",
        "file": "po.md"
    },
    "ux-design-expert": {
        "id": "ux-design-expert",
        "name": "UX Expert",
        "title": "UX Design Expert",
        "icon": "🎨",
        "category": "design",
        "description": "Design de experiência do usuário e usabilidade",
        "source": "aios-core",
        "file": "ux-design-expert.md"
    },
    "aios-master": {
        "id": "aios-master",
        "name": "AIOS Master",
        "title": "Master Orchestrator",
        "icon": "🧠",
        "category": "meta",
        "description": "Agente mestre de orquestração",
        "source": "aios-core",
        "file": "aios-master.md"
    },
    "squad-creator": {
        "id": "squad-creator",
        "name": "Squad Creator",
        "title": "Squad Creator",
        "icon": "🏛️",
        "category": "meta",
        "description": "Criador de squads e expansion packs",
        "source": "aios-core",
        "file": "squad-creator.md"
    },
    # Specialized Agents (Existing)
    "marketing": {
        "id": "marketing",
        "name": "Marketing Agent",
        "title": "Marketing Specialist",
        "icon": "📢",
        "category": "business",
        "description": "Estratégias de marketing e growth",
        "source": "senciente"
    },
    "trading": {
        "id": "trading",
        "name": "Trading Agent",
        "title": "Trading Specialist",
        "icon": "💰",
        "category": "finance",
        "description": "Trading algorítmico e gestão de risco",
        "source": "senciente"
    },
    "sales": {
        "id": "sales",
        "name": "Sales Agent",
        "title": "Sales Specialist",
        "icon": "💼",
        "category": "business",
        "description": "Vendas e relacionamento com clientes",
        "source": "senciente"
    },
    "auto_evolution": {
        "id": "auto_evolution",
        "name": "Auto Evolution",
        "title": "Self-Improvement Agent",
        "icon": "🔮",
        "category": "meta",
        "description": "Evolução autônoma e auto-melhoria",
        "source": "senciente"
    }
}


@router.get("")
async def list_agents(
    category: Optional[str] = None,
    source: Optional[str] = None
) -> Dict[str, Any]:
    """
    Lista todos os agentes disponíveis.
    
    Args:
        category: Filtrar por categoria (development, business, etc.)
        source: Filtrar por fonte (aios-core, senciente)
    """
    agents = list(AGENT_CATALOG.values())
    
    if category:
        agents = [a for a in agents if a.get("category") == category]
    
    if source:
        agents = [a for a in agents if a.get("source") == source]
    
    # Agrupar por categoria
    by_category = {}
    for agent in agents:
        cat = agent.get("category", "other")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(agent)
    
    return {
        "agents": agents,
        "total": len(agents),
        "by_category": by_category,
        "categories": list(by_category.keys())
    }


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> Dict[str, Any]:
    """
    Obtém detalhes de um agente específico.
    """
    if agent_id not in AGENT_CATALOG:
        raise HTTPException(status_code=404, detail=f"Agente {agent_id} não encontrado")
    
    agent = AGENT_CATALOG[agent_id].copy()
    
    # Tentar ler o arquivo MD se existir
    if agent.get("file"):
        file_path = AIOS_AGENTS_DIR / agent["file"]
        if file_path.exists():
            content = file_path.read_text(encoding="utf-8")
            # Extrair primeiras linhas como preview
            lines = content.split("\n")[:20]
            agent["preview"] = "\n".join(lines)
            agent["file_size"] = file_path.stat().st_size
    
    return {"agent": agent}


@router.get("/categories/list")
async def list_categories() -> Dict[str, Any]:
    """Lista todas as categorias de agentes."""
    categories = {}
    for agent in AGENT_CATALOG.values():
        cat = agent.get("category", "other")
        if cat not in categories:
            categories[cat] = {"name": cat, "count": 0, "agents": []}
        categories[cat]["count"] += 1
        categories[cat]["agents"].append(agent["id"])
    
    return {"categories": list(categories.values())}
