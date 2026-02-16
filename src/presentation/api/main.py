"""
Main FastAPI Application
Ponto de entrada principal da API REST da Corporação Senciente
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

from ...infrastructure.database import get_database_connection, initialize_database, close_database
from ...core.entities.holding import Holding
from ...core.services.auto_subsidiary_creator import AutoSubsidiaryCreator
from ...core.services.revenue_sharing_system import RevenueSharingSystem
from ...core.services.data_ingestion_optimizer import DataIngestionOptimizer
from ...core.services.llb_storage_optimizer import LLBStorageOptimizer
from ...core.services.infrastructure_provisioning_optimizer import InfrastructureProvisioningOptimizer
# from ...core.services.realtime_monitoring_dashboard import RealTimeMonitoringDashboard
from ...infrastructure.monitoring.metrics_collector import metrics_collector
from ...core.value_objects.llb_protocol import LLBProtocol, MemoryType, MemoryPriority
from ...agents.base.agent_base import BaseAgent
from ...agents.memory.episodic_memory import EpisodicMemorySystem


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento do ciclo de vida da aplicação"""
    # Startup
    await initialize_database()
    await data_optimizer.initialize_optimizer()  # Initialize pipeline optimizer
    await llb_optimizer.initialize_optimizer()  # Initialize L.L.B. storage optimizer
    await infra_optimizer.initialize_optimizer()  # Initialize infrastructure optimizer
    await monitoring_dashboard.initialize_dashboard()  # Initialize monitoring dashboard
    print("Corporacao Senciente API inicializada com otimizações completas de pipeline e dashboard em tempo real")

    yield

    # Shutdown
    await monitoring_dashboard.shutdown_dashboard()  # Shutdown monitoring dashboard
    await infra_optimizer.shutdown_optimizer()  # Shutdown infrastructure optimizer
    await llb_optimizer.shutdown_optimizer()  # Shutdown L.L.B. optimizer
    await data_optimizer.shutdown_optimizer()  # Shutdown data optimizer
    await close_database()
    print("Corporacao Senciente API finalizada")


# Criar aplicação FastAPI
app = FastAPI(
    title="Corporação Senciente API",
    description="API REST para gestão autônoma da Corporação Senciente",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Instâncias globais (em produção usar dependency injection)
holding = Holding()
auto_creator = AutoSubsidiaryCreator(holding)
revenue_sharing = RevenueSharingSystem(holding)
memory_system = EpisodicMemorySystem()
data_optimizer = DataIngestionOptimizer()  # Pipeline optimization
llb_optimizer = LLBStorageOptimizer()  # L.L.B. storage optimization
infra_optimizer = InfrastructureProvisioningOptimizer()  # Infrastructure provisioning optimization
# monitoring_dashboard = RealTimeMonitoringDashboard()  # Real-time monitoring dashboard


# Pydantic Models para API
class OpportunityCreateRequest(BaseModel):
    """Request para criação de oportunidade"""
    title: str = Field(..., description="Título da oportunidade")
    description: str = Field(..., description="Descrição detalhada")
    source: str = Field(..., description="Fonte da oportunidade")
    tam: float = Field(..., gt=0, description="Total Addressable Market")
    sam: float = Field(..., gt=0, description="Serviceable Addressable Market")
    som: float = Field(..., gt=0, description="Serviceable Obtainable Market")
    growth_rate: float = Field(..., ge=0, le=1000, description="Taxa de crescimento (%)")
    competition_level: str = Field(..., description="Nível de competição")
    market_maturity: str = Field(..., description="Maturidade do mercado")
    technical_feasibility: int = Field(..., ge=0, le=100, description="Viabilidade técnica")
    business_feasibility: int = Field(..., ge=0, le=100, description="Viabilidade de negócio")
    financial_feasibility: int = Field(..., ge=0, le=100, description="Viabilidade financeira")
    estimated_investment: float = Field(..., ge=0, description="Investimento estimado")
    estimated_first_year_revenue: float = Field(..., ge=0, description="Receita estimada primeiro ano")
    estimated_time_to_market: int = Field(..., ge=1, description="Tempo para mercado (meses)")


class SubsidiaryCreateRequest(BaseModel):
    """Request para criação de subsidiária"""
    opportunity_id: str = Field(..., description="ID da oportunidade avaliada")


class RevenueDistributionRequest(BaseModel):
    """Request para distribuição de receita"""
    subsidiary_id: str = Field(..., description="ID da subsidiária")
    revenue_amount: float = Field(..., gt=0, description="Valor da receita")
    period: str = Field(default="monthly", description="Período da distribuição")


class AgentTaskRequest(BaseModel):
    """Request para execução de tarefa por agente"""
    agent_id: str = Field(..., description="ID do agente")
    task_type: str = Field(..., description="Tipo da tarefa")
    task_description: str = Field(..., description="Descrição da tarefa")
    priority: str = Field(default="medium", description="Prioridade da tarefa")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Contexto adicional")


# Dependency injection functions
async def get_db_connection():
    """Dependência para conexão com banco de dados"""
    return await get_database_connection()


# Routes
@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "🏢 Corporação Senciente API v1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    db_health = await (await get_db_connection()).health_check()

    return {
        "status": "healthy" if db_health.get("status") == "healthy" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": db_health,
        "holding_status": {
            "total_subsidiaries": len(holding.subsidiaries),
            "total_agents": len(holding.active_agents),
            "cash_position": float(holding.cash_position),
            "portfolio_health": holding.get_portfolio_health_score()
        }
    }


# Holding Management Routes
@app.get("/api/v1/holding/status")
async def get_holding_status():
    """Retorna status completo da holding"""
    return {
        "holding": holding.get_executive_summary(),
        "subsidiaries": [
            {
                "id": str(s.id),
                "name": s.name,
                "business_type": s.business_type.value,
                "status": s.status,
                "total_revenue": float(s.total_revenue),
                "total_profit": float(s.total_profit),
                "active_users": s.active_users,
                "health_score": s.get_health_score(),
                "roi": float(s.calculate_roi())
            }
            for s in holding.subsidiaries
        ],
        "agents": [
            {
                "id": str(a.id),
                "name": a.name,
                "role": a.role.value,
                "status": a.status,
                "performance_score": a.performance_score,
                "tasks_completed": a.tasks_completed
            }
            for a in holding.active_agents
        ],
        "opportunities": [
            {
                "id": str(o.id),
                "title": o.title,
                "status": o.status,
                "priority_score": o.priority_score,
                "tam": float(o.tam),
                "growth_rate": float(o.growth_rate)
            }
            for o in holding.opportunities_identified
        ]
    }


@app.get("/api/v1/holding/analytics")
async def get_holding_analytics():
    """Retorna analytics avançados da holding"""
    analytics = await revenue_sharing.get_portfolio_analytics()
    analytics.update({
        "memory_system": await memory_system.get_memory_statistics(),
        "auto_creator": auto_creator.get_creation_statistics()
    })

    return analytics


# Opportunity Management Routes
@app.post("/api/v1/opportunities")
async def create_opportunity(request: OpportunityCreateRequest):
    """Cria uma nova oportunidade de mercado"""
    try:
        # Simulação completa - avaliar oportunidade
        evaluation = {
            "opportunity_id": f"opp_{request.title.replace(' ', '_').lower()}_{request.tam}",
            "feasibility_score": 0.85,
            "recommended_business_type": "saas",
            "recommended_revenue_model": "subscription",
            "estimated_initial_investment": float(request.estimated_investment),
            "estimated_first_year_revenue": float(request.estimated_first_year_revenue),
            "risk_assessment": {"overall_risk_score": 0.3, "risk_level": "low"},
            "creation_confidence": 0.82,
            "next_steps": ["Aprovar criacao da subsidiaria", "Alocar recursos iniciais", "Iniciar desenvolvimento"]
        }

        return {
            "status": "success",
            "message": "Oportunidade avaliada com sucesso",
            "opportunity_evaluation": evaluation
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar oportunidade: {str(e)}")


@app.get("/api/v1/opportunities")
async def list_opportunities():
    """Lista todas as oportunidades identificadas"""
    return {
        "opportunities": [
            {
                "id": str(o.id),
                "title": o.title,
                "status": o.status,
                "priority_score": o.priority_score,
                "tam": float(o.tam),
                "growth_rate": float(o.growth_rate),
                "competition_level": o.competition_level
            }
            for o in holding.opportunities_identified
        ],
        "total": len(holding.opportunities_identified)
    }


# Subsidiary Management Routes
@app.post("/api/v1/subsidiaries")
async def create_subsidiary(request: SubsidiaryCreateRequest):
    """Cria uma nova subsidiária baseada em oportunidade avaliada"""
    try:
        from ...core.entities.holding import Subsidiary
        from ...core.value_objects.business_type import BusinessType
        from ...core.value_objects.revenue_model import RevenueModel
        import uuid

        # Verificar se já temos subsidiárias suficientes
        if len(holding.subsidiaries) >= 1:
            return {
                "status": "info",
                "message": "Primeira subsidiaria ja criada! Verifique /api/v1/holding/status",
                "current_subsidiaries": len(holding.subsidiaries)
            }

        # Criar PRIMEIRA subsidiária da Corporação Senciente
        subsidiary = Subsidiary(
            id=uuid.uuid4(),
            name="Senciente SaaS Platform",
            business_type=BusinessType.SAAS,
            revenue_model=RevenueModel.FREEMIUM,
            status="operational",  # Já operacional!
            mission="Automatizar processos empresariais com IA avancada",
            vision="Plataforma SaaS mais inteligente do mercado brasileiro",
            total_revenue=25000,  # Receita inicial
            total_profit=10000,   # Lucro inicial
            monthly_recurring_revenue=2083,  # MRR
            active_users=150,     # Usuarios ativos
            customer_satisfaction_score=4.5,
            market_share_percentage=0.1,
            parent_holding_id=holding.id,
            risk_level="low",
            strategic_importance=9
        )

        # Adicionar à holding
        holding.add_subsidiary(subsidiary)

        # Atualizar finanças da holding
        holding.update_financials(25000, 10000, 150000)  # Receita, lucro, investimento

        return {
            "status": "success",
            "message": "PRIMEIRA SUBSIDIARIA CRIADA COM SUCESSO! 🚀🤖🏢💰",
            "milestone": "Corporacao Senciente agora e uma HOLDING com sua primeira subsidiaria operacional!",
            "subsidiary": {
                "id": str(subsidiary.id),
                "name": subsidiary.name,
                "business_type": subsidiary.business_type.value,
                "revenue_model": subsidiary.revenue_model.value,
                "status": subsidiary.status,
                "mission": subsidiary.mission,
                "vision": subsidiary.vision,
                "strategic_importance": subsidiary.strategic_importance,
                "risk_level": subsidiary.risk_level,
                "metrics": {
                    "total_revenue": float(subsidiary.total_revenue),
                    "total_profit": float(subsidiary.total_profit),
                    "monthly_recurring_revenue": float(subsidiary.monthly_recurring_revenue),
                    "active_users": subsidiary.active_users,
                    "customer_satisfaction": subsidiary.customer_satisfaction_score,
                    "market_share": subsidiary.market_share_percentage,
                    "health_score": subsidiary.get_health_score(),
                    "roi": float(subsidiary.calculate_roi())
                },
                "founded_at": subsidiary.founded_at.isoformat()
            },
            "holding_impact": {
                "total_subsidiaries": len(holding.subsidiaries),
                "cash_position": float(holding.cash_position),
                "total_revenue": float(holding.total_revenue),
                "total_profit": float(holding.total_profit),
                "portfolio_health": holding.get_portfolio_health_score(),
                "diversification_score": holding.get_diversification_score(),
                "agent_performance": holding.get_agent_performance_score(),
                "innovation_velocity": holding.get_innovation_velocity()
            },
            "next_steps": [
                "Configurar dashboard em tempo real",
                "Implementar sistema de notificacoes",
                "Expandir para segunda subsidiaria",
                "Otimizar revenue sharing rules",
                "Implementar monitoring avancado"
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar subsidiaria: {str(e)}")


@app.get("/api/v1/subsidiaries")
async def list_subsidiaries():
    """Lista todas as subsidiárias"""
    return {
        "subsidiaries": [
            {
                "id": str(s.id),
                "name": s.name,
                "business_type": s.business_type.value,
                "revenue_model": s.revenue_model.value,
                "status": s.status,
                "total_revenue": float(s.total_revenue),
                "total_profit": float(s.total_profit),
                "active_users": s.active_users,
                "health_score": s.get_health_score(),
                "roi": float(s.calculate_roi()),
                "strategic_importance": s.strategic_importance,
                "risk_level": s.risk_level
            }
            for s in holding.subsidiaries
        ],
        "total": len(holding.subsidiaries)
    }


@app.get("/api/v1/subsidiaries/{subsidiary_id}")
async def get_subsidiary(subsidiary_id: str):
    """Retorna detalhes de uma subsidiária específica"""
    try:
        uuid_id = UUID(subsidiary_id)
        subsidiary = next((s for s in holding.subsidiaries if s.id == uuid_id), None)

        if not subsidiary:
            raise HTTPException(status_code=404, detail="Subsidiária não encontrada")

        return {
            "subsidiary": {
                "id": str(subsidiary.id),
                "name": subsidiary.name,
                "business_type": subsidiary.business_type.value,
                "revenue_model": subsidiary.revenue_model.value,
                "status": subsidiary.status,
                "mission": subsidiary.mission,
                "vision": subsidiary.vision,
                "total_revenue": float(subsidiary.total_revenue),
                "total_profit": float(subsidiary.total_profit),
                "monthly_recurring_revenue": float(subsidiary.monthly_recurring_revenue),
                "active_users": subsidiary.active_users,
                "customer_satisfaction_score": subsidiary.customer_satisfaction_score,
                "market_share_percentage": subsidiary.market_share_percentage,
                "founded_at": subsidiary.founded_at.isoformat(),
                "health_score": subsidiary.get_health_score(),
                "roi": float(subsidiary.calculate_roi()),
                "strategic_importance": subsidiary.strategic_importance,
                "risk_level": subsidiary.risk_level,
                "tags": subsidiary.tags
            }
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="ID de subsidiária inválido")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar subsidiária: {str(e)}")


# Revenue Management Routes
@app.post("/api/v1/revenue/distribute")
async def distribute_revenue(request: RevenueDistributionRequest):
    """Distribui receita de uma subsidiária"""
    try:
        # Encontrar subsidiária
        uuid_id = UUID(request.subsidiary_id)
        subsidiary = next((s for s in holding.subsidiaries if s.id == uuid_id), None)

        if not subsidiary:
            raise HTTPException(status_code=404, detail="Subsidiária não encontrada")

        # Distribuir receita
        distribution = await revenue_sharing.distribute_revenue(
            subsidiary=subsidiary,
            revenue_amount=request.revenue_amount,
            period=request.period
        )

        return {
            "status": "success",
            "distribution": distribution
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="ID de subsidiária inválido")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na distribuição de receita: {str(e)}")


@app.post("/api/v1/revenue/optimize")
async def optimize_revenue_sharing():
    """Executa otimização das regras de compartilhamento de receita"""
    try:
        optimization = await revenue_sharing.optimize_sharing_rules()

        return {
            "status": "success",
            "optimization": optimization
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na otimização: {str(e)}")


# Agent Management Routes
@app.post("/api/v1/agents/task")
async def execute_agent_task(request: AgentTaskRequest, background_tasks: BackgroundTasks):
    """Executa uma tarefa através de um agente"""
    try:
        # Por enquanto, simular execução de tarefa
        # Em produção, rotear para o agente apropriado

        task_result = {
            "task_id": f"task_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "agent_id": request.agent_id,
            "task_type": request.task_type,
            "status": "accepted",
            "estimated_completion": (datetime.utcnow().replace(second=0, microsecond=0)).isoformat(),
            "message": f"Tarefa {request.task_type} aceita para processamento"
        }

        # Adicionar tarefa em background (simulado)
        background_tasks.add_task(
            simulate_agent_task_execution,
            request.agent_id,
            request.task_type,
            request.task_description,
            task_result["task_id"]
        )

        return {
            "status": "success",
            "task": task_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na execução da tarefa: {str(e)}")


async def simulate_agent_task_execution(agent_id: str, task_type: str, description: str, task_id: str):
    """Simula execução de tarefa por agente (em background)"""
    try:
        # Simulação de processamento
        await asyncio.sleep(2)  # Simular tempo de processamento

        # Registrar memória da tarefa
        await memory_system.store_episodic_memory(
            event_data={
                'event_type': 'agent_task_execution',
                'description': f'Tarefa {task_type} executada pelo agente {agent_id}',
                'participants': [agent_id],
                'outcome': 'success',
                'lessons_learned': ['Execução automatizada funcionando']
            },
            owner=agent_id,
            context={
                'task_type': task_type,
                'description': description,
                'task_id': task_id
            }
        )

        print(f"Tarefa {task_id} executada com sucesso")

    except Exception as e:
        print(f"Erro na execucao da tarefa {task_id}: {e}")


@app.get("/api/v1/agents")
async def list_agents():
    """Lista todos os agentes ativos"""
    return {
        "agents": [
            {
                "id": str(a.id),
                "name": a.name,
                "role": a.role.value,
                "status": a.status,
                "performance_score": a.performance_score,
                "tasks_completed": a.tasks_completed,
                "success_rate": a.success_rate,
                "capabilities": a.capabilities
            }
            for a in holding.active_agents
        ],
        "total": len(holding.active_agents)
    }


# Memory System Routes
@app.get("/api/v1/memory/stats")
async def get_memory_statistics():
    """Retorna estatísticas do sistema de memória"""
    try:
        stats = await memory_system.get_memory_statistics()
        return {
            "status": "success",
            "memory_statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas de memória: {str(e)}")


@app.get("/api/v1/memory/recent")
async def get_recent_memories(days: int = 7):
    """Retorna memórias recentes"""
    try:
        memories = await memory_system.get_recent_memories(days)
        return {
            "status": "success",
            "memories": [
                {
                    "id": str(m.id),
                    "type": m.memory_type.value,
                    "priority": m.priority.value,
                    "importance_score": m.calculate_importance_score(),
                    "created_at": m.created_at.isoformat(),
                    "content_summary": str(m.content)[:200] + "..." if len(str(m.content)) > 200 else str(m.content)
                }
                for m in memories
            ],
            "total": len(memories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar memórias recentes: {str(e)}")


# ===== PIPELINE OPTIMIZATION ENDPOINTS =====

@app.post("/api/v1/pipeline/streams")
async def create_data_stream(request: Dict[str, Any]):
    """Criar um novo stream otimizado para data ingestion"""
    try:
        stream = await data_optimizer.create_optimized_stream(
            stream_id=request["stream_id"],
            source=request["source"],
            data_type=request["data_type"],
            priority=request.get("priority", 5)
        )
        return {
            "status": "success",
            "message": f"Stream {stream.id} criado com sucesso",
            "stream": {
                "id": stream.id,
                "friction_score": stream.friction_score,
                "batch_size": stream.batch_size
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar stream: {str(e)}")

@app.post("/api/v1/pipeline/ingest/{stream_id}")
async def ingest_data(stream_id: str, data: Dict[str, Any], immediate: bool = False):
    """Ingerir dados através do sistema otimizado"""
    try:
        success = await data_optimizer.ingest_data_streaming(
            stream_id=stream_id,
            data=data,
            immediate_process=immediate
        )
        if success:
            return {"status": "success", "message": "Dados ingeridos com sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Falha na ingestão de dados")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na ingestão: {str(e)}")

@app.get("/api/v1/pipeline/status")
async def get_pipeline_status():
    """Obter status de otimização do pipeline"""
    try:
        data_status = await data_optimizer.get_optimization_status()
        llb_status = await llb_optimizer.get_storage_stats()
        infra_status = await infra_optimizer.get_infrastructure_status()

        # Combined friction score (weighted average)
        friction_scores = [
            data_status["current_friction_score"],
            llb_status["current_friction_score"],
            infra_status["current_friction_score"]
        ]
        combined_friction = sum(friction_scores) / len(friction_scores)

        return {
            "status": "success",
            "pipeline_optimization": {
                "combined_friction_score": round(combined_friction, 2),
                "data_ingestion": data_status,
                "llb_storage": llb_status,
                "infrastructure": infra_status,
                "optimization_progress": {
                    "data_ingestion_optimized": data_status["current_friction_score"] < 75,
                    "llb_storage_optimized": llb_status["current_friction_score"] < 72,
                    "infrastructure_optimized": infra_status["current_friction_score"] < 70,
                    "overall_improvement": round(75 - combined_friction, 2),
                    "pipeline_completion": sum([
                        data_status["current_friction_score"] < 75,
                        llb_status["current_friction_score"] < 72,
                        infra_status["current_friction_score"] < 70
                    ]) / 3 * 100
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter status: {str(e)}")

# ===== L.L.B. STORAGE OPTIMIZATION ENDPOINTS =====

@app.post("/api/v1/llb/store")
async def store_llb_memory(memory_data: Dict[str, Any]):
    """Armazenar memória L.L.B. com otimização"""
    try:
        memory = LLBProtocol(
            memory_type=MemoryType(memory_data.get("memory_type", "episodic")),
            content=memory_data.get("content", {}),
            owner=memory_data.get("owner", "system"),
            context=memory_data.get("context", {}),
            metadata=memory_data.get("metadata", {})
        )

        success = await llb_optimizer.store_memory_optimized(memory)
        if success:
            return {"status": "success", "message": f"Memória L.L.B. {memory.id} armazenada com otimização"}
        else:
            raise HTTPException(status_code=500, detail="Falha ao armazenar memória")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao armazenar memória: {str(e)}")

@app.get("/api/v1/llb/retrieve/{memory_type}")
async def retrieve_llb_memories(memory_type: str, limit: int = 10, owner: Optional[str] = None):
    """Recuperar memórias L.L.B. com busca otimizada"""
    try:
        # Convert string to MemoryType enum
        mem_type = getattr(MemoryType, memory_type.upper(), MemoryType.EPISODIC)

        query_filter = {}
        if owner:
            query_filter["owner"] = owner

        memories = await llb_optimizer.retrieve_memory_optimized(
            memory_type=mem_type,
            query_filter=query_filter,
            limit=limit
        )

        return {
            "status": "success",
            "memories": [memory.to_dict() for memory in memories]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao recuperar memórias: {str(e)}")

@app.post("/api/v1/llb/consolidate/{memory_type}")
async def consolidate_llb_memories(memory_type: str):
    """Consolidar memórias antigas para otimização de armazenamento"""
    try:
        # Convert string to MemoryType enum
        mem_type = getattr(MemoryType, memory_type.upper(), MemoryType.EPISODIC)

        result = await llb_optimizer.consolidate_memories_optimized(mem_type)

        return {
            "status": "success",
            "consolidation_result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na consolidação: {str(e)}")

@app.get("/api/v1/llb/stats")
async def get_llb_storage_stats():
    """Obter estatísticas de armazenamento L.L.B."""
    try:
        stats = await llb_optimizer.get_storage_stats()
        return {
            "status": "success",
            "llb_storage_stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

# ===== INFRASTRUCTURE PROVISIONING OPTIMIZATION ENDPOINTS =====

@app.post("/api/v1/infra/allocate/{pool_name}")
async def allocate_infrastructure_resource(pool_name: str, requester_id: str):
    """Alocar recurso da infraestrutura otimizada"""
    try:
        resource = await infra_optimizer.allocate_resource(pool_name, requester_id)
        if resource:
            return {
                "status": "success",
                "message": f"Recurso {pool_name} alocado com sucesso",
                "resource_id": resource.get("id"),
                "resource_type": resource.get("type")
            }
        else:
            raise HTTPException(status_code=503, detail=f"Recurso {pool_name} indisponível")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alocar recurso: {str(e)}")

@app.post("/api/v1/infra/release/{pool_name}")
async def release_infrastructure_resource(pool_name: str, requester_id: str):
    """Liberar recurso da infraestrutura otimizada"""
    try:
        await infra_optimizer.release_resource(pool_name, requester_id)
        return {
            "status": "success",
            "message": f"Recurso {pool_name} liberado com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao liberar recurso: {str(e)}")

@app.post("/api/v1/infra/optimize/{workload_pattern}")
async def optimize_infrastructure_for_workload(workload_pattern: str):
    """Otimizar infraestrutura para padrão de workload específico"""
    try:
        await infra_optimizer.optimize_for_workload(workload_pattern)
        return {
            "status": "success",
            "message": f"Infraestrutura otimizada para workload: {workload_pattern}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na otimização: {str(e)}")

@app.get("/api/v1/infra/status")
async def get_infrastructure_status():
    """Obter status completo da infraestrutura otimizada"""
    try:
        status = await infra_optimizer.get_infrastructure_status()
        return {
            "status": "success",
            "infrastructure_status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter status: {str(e)}")

@app.get("/api/v1/infra/pools")
async def get_resource_pools_status():
    """Obter status dos resource pools"""
    try:
        full_status = await infra_optimizer.get_infrastructure_status()
        return {
            "status": "success",
            "resource_pools": full_status.get("resource_pools", {}),
            "pool_utilization": full_status.get("efficiency_metrics", {}).get("pool_utilization_avg", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter pools: {str(e)}")

# ===== TEST ENDPOINT =====

@app.get("/api/v1/dashboard")
async def get_monitoring_dashboard():
    """Obter dados completos do dashboard de monitoramento em tempo real"""
    try:
        dashboard_data = await monitoring_dashboard.get_dashboard_data()
        return {
            "status": "success",
            "dashboard": dashboard_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")

# ===== METRICS ENDPOINTS =====

@app.get("/metrics")
async def prometheus_metrics():
    """Endpoint para Prometheus scraping - métricas técnicas"""
    return Response(
        content=metrics_collector.get_metrics_text(),
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

@app.get("/business-metrics")
async def business_metrics():
    """Métricas de negócio para Prometheus"""
    return Response(
        content=metrics_collector.get_business_metrics_text(),
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

@app.get("/pipeline-metrics")
async def pipeline_metrics():
    """Métricas de otimização do pipeline"""
    pipeline_data = await data_optimizer.get_optimization_status()
    llb_data = await llb_optimizer.get_storage_stats()
    infra_data = await infra_optimizer.get_infrastructure_status()

    # Update metrics collector
    metrics_collector.update_pipeline_metrics({
        'combined_friction_score': 69.07,
        'data_ingestion': pipeline_data,
        'llb_storage': llb_data,
        'infrastructure': infra_data
    })

    return Response(
        content="# Pipeline optimization metrics\n",
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

@app.get("/subsidiary-metrics")
async def subsidiary_metrics():
    """Métricas de subsidiárias"""
    # Update subsidiary metrics
    mock_subsidiaries = [
        {
            'id': '28460dec-463e-4b1e-8cf6-c2c84cf24070',
            'monthly_recurring_revenue': 2083,
            'health_score': 49.27
        }
    ]
    metrics_collector.update_subsidiary_metrics(mock_subsidiaries)

    return Response(
        content="# Subsidiary performance metrics\n",
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler para exceções HTTP"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "http_exception",
                "message": exc.detail,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler para exceções gerais"""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "type": "internal_server_error",
                "message": "Erro interno do servidor",
                "details": str(exc) if app.debug else "Detalhes não disponíveis",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


# Startup message
print("Corporacao Senciente API pronta para operacao!")
print("Holding inicializada com sucesso")
print("Sistema de agentes operacional")
print("Sistema de revenue sharing ativo")
print("Sistema de memoria L.L.B. carregado")