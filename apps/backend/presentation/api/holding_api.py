"""
Holding API - REST Endpoints
APIs para gerenciamento da holding e suas subsidiárias
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from backend.application.use_cases.create_subsidiary_use_case import (
    CreateSubsidiaryUseCase,
    CreateSubsidiaryRequest,
    GetHoldingDashboardUseCase,
    EvaluateOpportunityUseCase
)
from backend.core.entities.holding import Holding
from backend.infrastructure.database.holding_repository import (
    HoldingRepository, SubsidiaryRepository, OpportunityRepository
)


# Pydantic Models for API
class OpportunityDataRequest(BaseModel):
    market_segment: str = Field(..., description="Segmento de mercado")
    description: str = Field(..., description="Descrição da oportunidade")
    estimated_revenue: float = Field(..., description="Receita estimada anual")
    risk_level: str = Field("medium", description="Nível de risco (low/medium/high)")
    confidence_score: float = Field(0.7, description="Score de confiança (0-1)")

class CreateSubsidiaryRequestModel(BaseModel):
    holding_id: UUID = Field(..., description="ID da holding")
    opportunity_data: OpportunityDataRequest
    auto_launch: bool = Field(False, description="Lançar automaticamente se pronto")

class SubsidiaryResponse(BaseModel):
    id: UUID
    name: str
    business_type: str
    status: str
    current_revenue: float
    autonomy_level: float
    agent_count: int
    created_at: datetime

    @classmethod
    def from_entity(cls, subsidiary):
        return cls(
            id=subsidiary.id,
            name=subsidiary.name,
            business_type=subsidiary.business_type.value,
            status=subsidiary.status.value,
            current_revenue=float(subsidiary.current_revenue),
            autonomy_level=subsidiary.autonomy_level,
            agent_count=len(subsidiary.agents),
            created_at=subsidiary.created_at
        )

class HoldingResponse(BaseModel):
    id: UUID
    name: str
    vision: str
    total_revenue: float
    total_assets: float
    subsidiaries: List[SubsidiaryResponse]
    created_at: datetime

    @classmethod
    def from_entity(cls, holding):
        return cls(
            id=holding.id,
            name=holding.name,
            vision=holding.vision,
            total_revenue=float(holding.total_revenue),
            total_assets=float(holding.total_assets),
            subsidiaries=[SubsidiaryResponse.from_entity(s) for s in holding.subsidiaries],
            created_at=holding.created_at
        )

class OpportunityEvaluationResponse(BaseModel):
    opportunity_id: UUID
    market_segment: str
    viability_score: float
    is_viable: bool
    market_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    recommendations: List[str]

class CreateSubsidiaryResponse(BaseModel):
    success: bool
    message: str
    subsidiary: Optional[SubsidiaryResponse]
    opportunity_evaluation: Optional[OpportunityEvaluationResponse]
    errors: List[str] = []

class DashboardResponse(BaseModel):
    holding: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    subsidiaries: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    last_updated: str


# Dependency injection functions
def get_holding_repository() -> HoldingRepository:
    # In production, this would be injected via dependency injection framework
    from backend.infrastructure.database.connection import get_database_connection
    db = get_database_connection()
    return HoldingRepository(db)

def get_subsidiary_repository() -> SubsidiaryRepository:
    from backend.infrastructure.database.connection import get_database_connection
    db = get_database_connection()
    return SubsidiaryRepository(db)

def get_opportunity_repository() -> OpportunityRepository:
    from backend.infrastructure.database.connection import get_database_connection
    db = get_database_connection()
    return OpportunityRepository(db)

def get_create_subsidiary_use_case() -> CreateSubsidiaryUseCase:
    from backend.core.services.subsidiary_creation_service import SubsidiaryCreationService

    subsidiary_repo = get_subsidiary_repository()
    opportunity_repo = get_opportunity_repository()
    creation_service = SubsidiaryCreationService(subsidiary_repo, opportunity_repo)

    holding_repo = get_holding_repository()

    return CreateSubsidiaryUseCase(
        creation_service, holding_repo, subsidiary_repo, opportunity_repo
    )

def get_holding_dashboard_use_case() -> GetHoldingDashboardUseCase:
    holding_repo = get_holding_repository()
    return GetHoldingDashboardUseCase(holding_repo)

def get_evaluate_opportunity_use_case() -> EvaluateOpportunityUseCase:
    from backend.core.services.subsidiary_creation_service import SubsidiaryCreationService

    subsidiary_repo = get_subsidiary_repository()
    opportunity_repo = get_opportunity_repository()
    creation_service = SubsidiaryCreationService(subsidiary_repo, opportunity_repo)

    return EvaluateOpportunityUseCase(creation_service)


# Router
router = APIRouter(prefix="/api/holding", tags=["holding"])


@router.post("/evaluate-opportunity", response_model=OpportunityEvaluationResponse)
async def evaluate_opportunity(
    opportunity_data: OpportunityDataRequest,
    use_case: EvaluateOpportunityUseCase = Depends(get_evaluate_opportunity_use_case)
):
    """
    Avalia uma oportunidade de negócio para criação de subsidiária
    """
    try:
        result = await use_case.execute(opportunity_data.dict())

        market_analysis = {
            'market_size': float(result['market_analysis'].market_size),
            'market_growth_rate': result['market_analysis'].market_growth_rate,
            'competition_level': result['market_analysis'].competition_level,
            'entry_barriers': result['market_analysis'].entry_barriers,
            'customer_pain_points': result['market_analysis'].customer_pain_points,
            'estimated_market_share': result['market_analysis'].estimated_market_share,
            'opportunity_score': result['market_analysis'].calculate_opportunity_score()
        }

        risk_assessment = {
            'technical_risk': result['risk_assessment'].technical_risk,
            'market_risk': result['risk_assessment'].market_risk,
            'financial_risk': result['risk_assessment'].financial_risk,
            'operational_risk': result['risk_assessment'].operational_risk,
            'mitigation_strategies': result['risk_assessment'].mitigation_strategies,
            'overall_risk': result['risk_assessment'].calculate_overall_risk()
        }

        return OpportunityEvaluationResponse(
            opportunity_id=result['opportunity'].id,
            market_segment=result['opportunity'].market_segment,
            viability_score=result['viability_score'],
            is_viable=result['is_viable'],
            market_analysis=market_analysis,
            risk_assessment=risk_assessment,
            recommendations=result['recommendations']
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na avaliação: {str(e)}")


@router.post("/create-subsidiary", response_model=CreateSubsidiaryResponse)
async def create_subsidiary(
    request: CreateSubsidiaryRequestModel,
    background_tasks: BackgroundTasks,
    use_case: CreateSubsidiaryUseCase = Depends(get_create_subsidiary_use_case)
):
    """
    Cria uma nova subsidiária baseada em uma oportunidade avaliada
    """
    try:
        use_case_request = CreateSubsidiaryRequest(
            holding_id=request.holding_id,
            opportunity_data=request.opportunity_data.dict(),
            auto_launch=request.auto_launch
        )

        result = await use_case.execute(use_case_request)

        response = CreateSubsidiaryResponse(
            success=result.success,
            message=result.message,
            errors=result.errors
        )

        if result.subsidiary:
            response.subsidiary = SubsidiaryResponse.from_entity(result.subsidiary)

        if result.evaluation:
            market_analysis = {
                'market_size': float(result.evaluation['market_analysis'].market_size),
                'market_growth_rate': result.evaluation['market_analysis'].market_growth_rate,
                'competition_level': result.evaluation['market_analysis'].competition_level,
                'entry_barriers': result.evaluation['market_analysis'].entry_barriers,
                'customer_pain_points': result.evaluation['market_analysis'].customer_pain_points,
                'estimated_market_share': result.evaluation['market_analysis'].estimated_market_share,
                'opportunity_score': result.evaluation['market_analysis'].calculate_opportunity_score()
            }

            risk_assessment = {
                'technical_risk': result.evaluation['risk_assessment'].technical_risk,
                'market_risk': result.evaluation['risk_assessment'].market_risk,
                'financial_risk': result.evaluation['risk_assessment'].financial_risk,
                'operational_risk': result.evaluation['risk_assessment'].operational_risk,
                'mitigation_strategies': result.evaluation['risk_assessment'].mitigation_strategies,
                'overall_risk': result.evaluation['risk_assessment'].calculate_overall_risk()
            }

            response.opportunity_evaluation = OpportunityEvaluationResponse(
                opportunity_id=result.evaluation['opportunity'].id,
                market_segment=result.evaluation['opportunity'].market_segment,
                viability_score=result.evaluation['viability_score'],
                is_viable=result.evaluation['is_viable'],
                market_analysis=market_analysis,
                risk_assessment=risk_assessment,
                recommendations=result.evaluation['recommendations']
            )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na criação: {str(e)}")


@router.get("/dashboard/{holding_id}", response_model=DashboardResponse)
async def get_holding_dashboard(
    holding_id: UUID,
    use_case: GetHoldingDashboardUseCase = Depends(get_holding_dashboard_use_case)
):
    """
    Obtém dashboard executivo da holding
    """
    try:
        dashboard = await use_case.execute(holding_id)
        return DashboardResponse(**dashboard)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no dashboard: {str(e)}")


@router.get("/subsidiaries/{holding_id}")
async def get_holding_subsidiaries(
    holding_id: UUID,
    subsidiary_repo: SubsidiaryRepository = Depends(get_subsidiary_repository)
):
    """
    Lista todas as subsidiárias de uma holding
    """
    try:
        subsidiaries = await subsidiary_repo.get_by_holding_id(holding_id)
        return [SubsidiaryResponse.from_entity(s) for s in subsidiaries]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar subsidiárias: {str(e)}")


@router.get("/opportunities/viable")
async def get_viable_opportunities(
    opportunity_repo: OpportunityRepository = Depends(get_opportunity_repository)
):
    """
    Lista oportunidades viáveis para criação de subsidiárias
    """
    try:
        opportunities = await opportunity_repo.get_viable_opportunities()
        return [
            {
                'id': opp.id,
                'market_segment': opp.market_segment,
                'viability_score': opp.calculate_viability_score(),
                'estimated_revenue': float(opp.estimated_revenue),
                'risk_level': opp.risk_level,
                'created_at': opp.created_at.isoformat()
            }
            for opp in opportunities
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar oportunidades: {str(e)}")


@router.post("/subsidiary/{subsidiary_id}/launch")
async def launch_subsidiary(
    subsidiary_id: UUID,
    subsidiary_repo: SubsidiaryRepository = Depends(get_subsidiary_repository)
):
    """
    Lança uma subsidiária para produção
    """
    try:
        # Buscar subsidiária
        subsidiary = await subsidiary_repo.get_by_id(subsidiary_id)
        if not subsidiary:
            raise HTTPException(status_code=404, detail="Subsidiária não encontrada")

        # Verificar se está pronta
        if not subsidiary.is_ready_for_launch():
            raise HTTPException(
                status_code=400,
                detail="Subsidiária não está pronta para lançamento. Verifique agentes e autonomia."
            )

        # Lançar
        subsidiary.status = "active"
        subsidiary.updated_at = datetime.utcnow()

        # Persistir
        launched = await subsidiary_repo.save(subsidiary)

        return {
            'success': True,
            'message': 'Subsidiária lançada com sucesso',
            'subsidiary': SubsidiaryResponse.from_entity(launched)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no lançamento: {str(e)}")


@router.get("/holding/{holding_id}")
async def get_holding_details(
    holding_id: UUID,
    holding_repo: HoldingRepository = Depends(get_holding_repository)
):
    """
    Obtém detalhes completos de uma holding
    """
    try:
        holding = await holding_repo.get_by_id(holding_id)
        if not holding:
            raise HTTPException(status_code=404, detail="Holding não encontrada")

        return HoldingResponse.from_entity(holding)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar holding: {str(e)}")


@router.post("/holding/{holding_id}/update-financials")
async def update_holding_financials(
    holding_id: UUID,
    holding_repo: HoldingRepository = Depends(get_holding_repository)
):
    """
    Atualiza métricas financeiras da holding
    """
    try:
        await holding_repo.update_financials(holding_id)
        return {'success': True, 'message': 'Métricas atualizadas com sucesso'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na atualização: {str(e)}")