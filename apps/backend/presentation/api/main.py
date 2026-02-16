"""
Main FastAPI Application
Orchestrates the entire Sencient Corporation system
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from backend.presentation.api.holding_api import router as holding_router
from backend.presentation.api.stripe_api import router as stripe_router
from backend.infrastructure.database.connection import init_database, close_database
from backend.agents.specialized.auto_evolution_agent import AutoEvolutionAgent
from backend.application.use_cases.create_subsidiary_use_case import (
    EvaluateOpportunityUseCase, CreateSubsidiaryUseCase
)
from backend.infrastructure.database.holding_repository import (
    HoldingRepository, SubsidiaryRepository, OpportunityRepository
)
from backend.core.services.subsidiary_creation_service import SubsidiaryCreationService


# Global agent instances
auto_evolution_agent: AutoEvolutionAgent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting Sencient Corporation API...")

    try:
        # Initialize database
        await init_database()
        print("✅ Database connected")

        # Initialize global agents
        await initialize_agents()
        print("✅ Agents initialized")

        yield

    except Exception as e:
        print(f"❌ Startup error: {str(e)}")
        raise
    finally:
        # Shutdown
        print("🛑 Shutting down Sencient Corporation API...")

        # Stop agents
        if auto_evolution_agent:
            await auto_evolution_agent.stop_processing()

        # Close database
        await close_database()
        print("✅ Database disconnected")


async def initialize_agents():
    """Initialize global agent instances"""
    global auto_evolution_agent

    # Get dependencies
    db = get_database_connection()
    holding_repo = HoldingRepository(db)
    subsidiary_repo = SubsidiaryRepository(db)
    opportunity_repo = OpportunityRepository(db)

    # Initialize services
    creation_service = SubsidiaryCreationService(subsidiary_repo, opportunity_repo)

    # Initialize use cases
    evaluate_use_case = EvaluateOpportunityUseCase(creation_service)
    create_use_case = CreateSubsidiaryUseCase(
        creation_service, holding_repo, subsidiary_repo, opportunity_repo
    )

    # Initialize auto-evolution agent
    auto_evolution_agent = AutoEvolutionAgent(
        evaluate_use_case=evaluate_use_case,
        create_use_case=create_use_case,
        holding_repo=holding_repo,
        opportunity_repo=opportunity_repo
    )

    # Start agent processing
    await auto_evolution_agent.start_processing()
    print("🤖 Auto Evolution Agent started")


# Create FastAPI app
app = FastAPI(
    title="Corporação Senciente API",
    description="API para gestão autônoma da Holding Corporativa Senciente",
    version="8.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(holding_router)
app.include_router(stripe_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🏢 Corporação Senciente API v8.0.0",
        "description": "Sistema Autônomo de Gestão Empresarial",
        "status": "operational",
        "endpoints": {
            "holding": "/api/holding",
            "health": "/health",
            "agents": "/agents/status"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from backend.infrastructure.database.connection import check_database_health

    try:
        db_health = await check_database_health()

        agent_status = "operational" if auto_evolution_agent and auto_evolution_agent.is_active else "inactive"

        return {
            "status": "healthy" if db_health['status'] == 'healthy' else "degraded",
            "database": db_health,
            "agents": {
                "auto_evolution": agent_status,
                "evolution_cycles_completed": auto_evolution_agent.evolution_cycles_completed if auto_evolution_agent else 0
            },
            "version": "8.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.get("/agents/status")
async def get_agents_status():
    """Get status of all agents"""
    if not auto_evolution_agent:
        return {"agents": [], "message": "Agents not initialized"}

    return {
        "agents": [
            {
                "name": auto_evolution_agent.name,
                "role": auto_evolution_agent.role.value,
                "autonomy_level": auto_evolution_agent.autonomy_level,
                "performance_score": auto_evolution_agent.performance_score,
                "is_active": auto_evolution_agent.is_active,
                "evolution_cycles_completed": auto_evolution_agent.evolution_cycles_completed,
                "capabilities": auto_evolution_agent.get_capabilities_list()
            }
        ]
    }


@app.post("/agents/auto-evolution/run-cycle")
async def run_evolution_cycle():
    """Manually trigger auto-evolution cycle"""
    if not auto_evolution_agent:
        raise HTTPException(status_code=503, detail="Auto evolution agent not available")

    try:
        from backend.agents.base.agent_base import AgentTask

        # Create and assign evolution task
        task = AgentTask(
            task_type="auto_evolution_cycle",
            description="Manual evolution cycle trigger",
            priority=9
        )

        await auto_evolution_agent.assign_task(task)

        return {
            "message": "Evolution cycle initiated",
            "task_id": str(task.id),
            "estimated_completion": "30-60 seconds"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start evolution cycle: {str(e)}")


@app.get("/agents/auto-evolution/status")
async def get_evolution_status():
    """Get auto-evolution agent status"""
    if not auto_evolution_agent:
        raise HTTPException(status_code=503, detail="Auto evolution agent not available")

    try:
        status = await auto_evolution_agent.get_evolution_status()
        return status

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get evolution status: {str(e)}")


@app.post("/system/bootstrap")
async def bootstrap_system():
    """Bootstrap the entire system with initial data"""
    try:
        from backend.infrastructure.database.connection import get_database_connection
        from uuid import uuid4
        from backend.core.entities.holding import Holding

        db = get_database_connection()

        # Create main holding if it doesn't exist
        holding_repo = HoldingRepository(db)
        existing_holding = await holding_repo.get_by_id("550e8400-e29b-41d4-a716-446655440000")

        if not existing_holding:
            holding = Holding(
                id="550e8400-e29b-41d4-a716-446655440000",  # Fixed UUID for main holding
                name="Corporação Senciente",
                vision="Holding que constrói empresas automaticamente"
            )

            saved_holding = await holding_repo.save(holding)
            print(f"✅ Created main holding: {saved_holding.name}")

        # Trigger initial evolution cycle
        if auto_evolution_agent:
            from backend.agents.base.agent_base import AgentTask

            task = AgentTask(
                task_type="auto_evolution_cycle",
                description="Initial system bootstrap evolution cycle",
                priority=10
            )

            await auto_evolution_agent.assign_task(task)
            print("✅ Initial evolution cycle triggered")

        return {
            "message": "System bootstrap completed",
            "holding_created": existing_holding is None,
            "evolution_cycle_triggered": auto_evolution_agent is not None
        }

    except Exception as e:
        print(f"❌ Bootstrap error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bootstrap failed: {str(e)}")


@app.get("/system/stats")
async def get_system_stats():
    """Get comprehensive system statistics"""
    try:
        from backend.infrastructure.database.connection import get_table_stats

        table_stats = await get_table_stats()

        agent_stats = {}
        if auto_evolution_agent:
            agent_stats = {
                "auto_evolution_agent": {
                    "cycles_completed": auto_evolution_agent.evolution_cycles_completed,
                    "autonomy_level": auto_evolution_agent.autonomy_level,
                    "performance_score": auto_evolution_agent.performance_score,
                    "capabilities_count": len(auto_evolution_agent.get_capabilities_list())
                }
            }

        return {
            "database_stats": table_stats,
            "agent_stats": agent_stats,
            "system_health": "operational",
            "version": "8.0.0"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system stats: {str(e)}")


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": str(request.url)
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )