"""
Create Subsidiary Use Case - Application Layer
Orquestra a criação de uma subsidiária através de múltiplas etapas
"""

from typing import Dict, Any, Optional
from uuid import UUID

from backend.core.entities.holding import Holding, Subsidiary, Opportunity
from backend.core.services.subsidiary_creation_service import SubsidiaryCreationService
from backend.infrastructure.database.holding_repository import (
    HoldingRepository, SubsidiaryRepository, OpportunityRepository
)


class CreateSubsidiaryRequest:
    """Request DTO para criação de subsidiária"""
    def __init__(
        self,
        holding_id: UUID,
        opportunity_data: Dict[str, Any],
        auto_launch: bool = False
    ):
        self.holding_id = holding_id
        self.opportunity_data = opportunity_data
        self.auto_launch = auto_launch


class CreateSubsidiaryResponse:
    """Response DTO para criação de subsidiária"""
    def __init__(
        self,
        subsidiary: Optional[Subsidiary] = None,
        opportunity: Optional[Opportunity] = None,
        evaluation: Optional[Dict[str, Any]] = None,
        success: bool = False,
        message: str = "",
        errors: Optional[list] = None
    ):
        self.subsidiary = subsidiary
        self.opportunity = opportunity
        self.evaluation = evaluation
        self.success = success
        self.message = message
        self.errors = errors or []


class CreateSubsidiaryUseCase:
    """
    Caso de uso para criação de subsidiária
    Orquestra todo o processo de avaliação e criação
    """

    def __init__(
        self,
        creation_service: SubsidiaryCreationService,
        holding_repo: HoldingRepository,
        subsidiary_repo: SubsidiaryRepository,
        opportunity_repo: OpportunityRepository
    ):
        self.creation_service = creation_service
        self.holding_repo = holding_repo
        self.subsidiary_repo = subsidiary_repo
        self.opportunity_repo = opportunity_repo

    async def execute(self, request: CreateSubsidiaryRequest) -> CreateSubsidiaryResponse:
        """
        Executa o caso de uso completo de criação de subsidiária

        Args:
            request: Dados da requisição

        Returns:
            Response com resultado da operação
        """
        try:
            # 1. Buscar holding
            holding = await self.holding_repo.get_by_id(request.holding_id)
            if not holding:
                return CreateSubsidiaryResponse(
                    success=False,
                    message="Holding não encontrada",
                    errors=["Holding ID inválido"]
                )

            # 2. Avaliar oportunidade
            evaluation = await self.creation_service.evaluate_opportunity(
                request.opportunity_data
            )

            if not evaluation['is_viable']:
                return CreateSubsidiaryResponse(
                    success=False,
                    message="Oportunidade não é viável para criação de subsidiária",
                    evaluation=evaluation,
                    errors=["Critérios de viabilidade não atendidos"]
                )

            opportunity = evaluation['opportunity']

            # 3. Persistir oportunidade (opcional)
            saved_opportunity = await self.opportunity_repo.save(opportunity)

            # 4. Criar subsidiária
            subsidiary = await self.creation_service.create_subsidiary_from_opportunity(
                holding, opportunity
            )

            # 5. Atribuir agentes iniciais
            await self.creation_service.assign_initial_agents(subsidiary)

            # 6. Auto-launch se solicitado
            if request.auto_launch and subsidiary.is_ready_for_launch():
                subsidiary = await self.creation_service.launch_subsidiary(subsidiary)

            # 7. Atualizar métricas da holding
            await self.holding_repo.update_financials(holding.id)

            return CreateSubsidiaryResponse(
                subsidiary=subsidiary,
                opportunity=saved_opportunity,
                evaluation=evaluation,
                success=True,
                message="Subsidiária criada com sucesso"
            )

        except ValueError as e:
            return CreateSubsidiaryResponse(
                success=False,
                message="Erro de validação",
                errors=[str(e)]
            )

        except Exception as e:
            return CreateSubsidiaryResponse(
                success=False,
                message="Erro interno do sistema",
                errors=[f"Erro inesperado: {str(e)}"]
            )


class GetHoldingDashboardUseCase:
    """
    Caso de uso para obter dashboard executivo da holding
    """

    def __init__(self, holding_repo: HoldingRepository):
        self.holding_repo = holding_repo

    async def execute(self, holding_id: UUID) -> Dict[str, Any]:
        """
        Obtém dados completos do dashboard da holding

        Args:
            holding_id: ID da holding

        Returns:
            Dados do dashboard
        """
        # Buscar holding com subsidiárias
        holding = await self.holding_repo.get_by_id(holding_id)
        if not holding:
            raise ValueError("Holding não encontrada")

        # Calcular métricas agregadas
        total_subsidiaries = len(holding.subsidiaries)
        active_subsidiaries = len([s for s in holding.subsidiaries if s.status.value == 'active'])
        total_revenue = sum(s.current_revenue for s in holding.subsidiaries)
        avg_autonomy = sum(s.autonomy_level for s in holding.subsidiaries) / max(total_subsidiaries, 1)

        # Agrupar por tipo de negócio
        by_business_type = {}
        for subsidiary in holding.subsidiaries:
            biz_type = subsidiary.business_type.value
            if biz_type not in by_business_type:
                by_business_type[biz_type] = []
            by_business_type[biz_type].append({
                'id': subsidiary.id,
                'name': subsidiary.name,
                'revenue': subsidiary.current_revenue,
                'autonomy': subsidiary.autonomy_level,
                'status': subsidiary.status.value
            })

        # Métricas de performance
        performance_metrics = {
            'total_subsidiaries': total_subsidiaries,
            'active_subsidiaries': active_subsidiaries,
            'inactive_subsidiaries': total_subsidiaries - active_subsidiaries,
            'total_revenue': total_revenue,
            'average_autonomy': round(avg_autonomy, 2),
            'revenue_by_type': by_business_type
        }

        # Alertas e recomendações
        alerts = self._generate_alerts(holding)
        recommendations = self._generate_recommendations(holding)

        return {
            'holding': {
                'id': holding.id,
                'name': holding.name,
                'vision': holding.vision,
                'total_revenue': holding.total_revenue,
                'total_assets': holding.total_assets,
                'created_at': holding.created_at.isoformat()
            },
            'performance_metrics': performance_metrics,
            'subsidiaries': [
                {
                    'id': s.id,
                    'name': s.name,
                    'business_type': s.business_type.value,
                    'status': s.status.value,
                    'current_revenue': s.current_revenue,
                    'autonomy_level': s.autonomy_level,
                    'agent_count': len(s.agents),
                    'created_at': s.created_at.isoformat()
                }
                for s in holding.subsidiaries
            ],
            'alerts': alerts,
            'recommendations': recommendations,
            'last_updated': holding.updated_at.isoformat()
        }

    def _generate_alerts(self, holding: Holding) -> list:
        """Gera alertas baseados no estado da holding"""
        alerts = []

        # Alerta de baixa autonomia
        low_autonomy_subs = [s for s in holding.subsidiaries if s.autonomy_level < 50]
        if low_autonomy_subs:
            alerts.append({
                'type': 'warning',
                'title': 'Subsidiárias com baixa autonomia',
                'description': f'{len(low_autonomy_subs)} subsidiárias têm autonomia abaixo de 50%',
                'action_required': 'Revisar atribuição de agentes'
            })

        # Alerta de revenue baixo
        total_revenue = sum(s.current_revenue for s in holding.subsidiaries)
        if total_revenue < 10000:  # Menos de $10K
            alerts.append({
                'type': 'danger',
                'title': 'Revenue abaixo do esperado',
                'description': f'Revenue total: ${total_revenue:.2f} (meta: $50K/mês)',
                'action_required': 'Focar em monetização das subsidiárias'
            })

        # Alerta de subsidiárias inativas
        inactive_subs = [s for s in holding.subsidiaries if s.status.value == 'inactive']
        if inactive_subs:
            alerts.append({
                'type': 'warning',
                'title': 'Subsidiárias inativas detectadas',
                'description': f'{len(inactive_subs)} subsidiárias estão inativas',
                'action_required': 'Investigar e reativar ou arquivar'
            })

        return alerts

    def _generate_recommendations(self, holding: Holding) -> list:
        """Gera recomendações para melhoria da holding"""
        recommendations = []

        # Recomendação baseada no número de subsidiárias
        if len(holding.subsidiaries) < 3:
            recommendations.append({
                'priority': 'high',
                'title': 'Expandir portfólio de subsidiárias',
                'description': 'Holding precisa de mais subsidiárias para diversificação de revenue',
                'action': 'Executar processo de criação automática de subsidiárias'
            })

        # Recomendação baseada em autonomia
        avg_autonomy = sum(s.autonomy_level for s in holding.subsidiaries) / max(len(holding.subsidiaries), 1)
        if avg_autonomy < 70:
            recommendations.append({
                'priority': 'medium',
                'title': 'Melhorar autonomia das subsidiárias',
                'description': f'Autonomia média: {avg_autonomy:.1f}% (meta: 90%+)',
                'action': 'Atribuir mais agentes especializados e melhorar treinamento'
            })

        # Recomendação baseada em diversificação
        business_types = set(s.business_type.value for s in holding.subsidiaries)
        if len(business_types) < 3:
            recommendations.append({
                'priority': 'medium',
                'title': 'Aumentar diversificação de negócio',
                'description': f'Atualmente {len(business_types)} tipos de negócio',
                'action': 'Explorar novos segmentos de mercado'
            })

        return recommendations


class EvaluateOpportunityUseCase:
    """
    Caso de uso para avaliar oportunidades de negócio
    """

    def __init__(self, creation_service: SubsidiaryCreationService):
        self.creation_service = creation_service

    async def execute(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Avalia uma oportunidade para criação de subsidiária

        Args:
            opportunity_data: Dados da oportunidade

        Returns:
            Avaliação completa da oportunidade
        """
        return await self.creation_service.evaluate_opportunity(opportunity_data)