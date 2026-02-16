"""
Auto Evolution Agent - Agente de Auto-Evolução
Especializado em identificar oportunidades e criar subsidiárias automaticamente
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
import random

from backend.agents.base.agent_base import BaseAgent, AgentTask, AgentCapability
from backend.core.value_objects import AgentRole
from backend.application.use_cases.create_subsidiary_use_case import (
    EvaluateOpportunityUseCase, CreateSubsidiaryUseCase
)
from backend.infrastructure.database.holding_repository import (
    HoldingRepository, OpportunityRepository
)


class OpportunityDiscoveryCapability(AgentCapability):
    """Capability for discovering business opportunities"""

    @property
    def name(self) -> str:
        return "discover_opportunities"

    @property
    def description(self) -> str:
        return "Discover and analyze potential business opportunities"

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute opportunity discovery"""
        market_segments = parameters.get('market_segments', [
            'tech', 'finance', 'healthcare', 'ecommerce', 'consulting', 'research'
        ])

        opportunities = []

        # Simulate opportunity discovery (in production, this would use APIs, web scraping, etc.)
        for segment in market_segments:
            # Generate 1-3 opportunities per segment
            num_opportunities = random.randint(1, 3)

            for i in range(num_opportunities):
                opportunity = self._generate_opportunity(segment, i + 1)
                opportunities.append(opportunity)

        return {
            'opportunities_found': len(opportunities),
            'opportunities': opportunities,
            'market_segments_scanned': market_segments
        }

    def _generate_opportunity(self, segment: str, index: int) -> Dict[str, Any]:
        """Generate a simulated business opportunity"""
        templates = {
            'tech': {
                'descriptions': [
                    'Plataforma SaaS para gerenciamento de projetos remotos',
                    'Sistema de IA para análise de dados empresariais',
                    'Aplicativo móvel para produtividade corporativa',
                    'Ferramenta de colaboração em tempo real'
                ],
                'revenue_range': (50000, 500000)
            },
            'finance': {
                'descriptions': [
                    'Plataforma de trading automatizado',
                    'Sistema de gestão financeira pessoal',
                    'Ferramenta de análise de investimentos',
                    'Plataforma de crowdfunding'
                ],
                'revenue_range': (100000, 1000000)
            },
            'healthcare': {
                'descriptions': [
                    'Sistema de telemedicina integrado',
                    'Plataforma de gestão de pacientes',
                    'App de monitoramento de saúde',
                    'Sistema de agendamento médico inteligente'
                ],
                'revenue_range': (75000, 750000)
            },
            'ecommerce': {
                'descriptions': [
                    'Marketplace B2B especializado',
                    'Plataforma de dropshipping automatizada',
                    'Sistema de gestão de inventário inteligente',
                    'App de compras sociais'
                ],
                'revenue_range': (30000, 300000)
            },
            'consulting': {
                'descriptions': [
                    'Consultoria especializada em transformação digital',
                    'Serviços de implementação de IA',
                    'Consultoria em cibersegurança',
                    'Assessoria em sustentabilidade corporativa'
                ],
                'revenue_range': (80000, 800000)
            },
            'research': {
                'descriptions': [
                    'Pesquisa em inteligência artificial avançada',
                    'Desenvolvimento de algoritmos de machine learning',
                    'Pesquisa em biotecnologia',
                    'Estudos em energia sustentável'
                ],
                'revenue_range': (50000, 1000000)
            }
        }

        template = templates.get(segment, templates['tech'])
        description = random.choice(template['descriptions'])
        revenue_min, revenue_max = template['revenue_range']
        estimated_revenue = random.randint(revenue_min, revenue_max)

        return {
            'market_segment': segment,
            'description': f"{description} - Oportunidade {index}",
            'estimated_revenue': estimated_revenue,
            'risk_level': random.choice(['low', 'medium', 'high']),
            'confidence_score': round(random.uniform(0.5, 0.95), 2),
            'pain_points': [
                'Ineficiência operacional',
                'Falta de automação',
                'Problemas de escalabilidade',
                'Concorrência crescente'
            ][:random.randint(2, 4)]
        }


class OpportunityEvaluationCapability(AgentCapability):
    """Capability for evaluating business opportunities"""

    def __init__(self, evaluate_use_case: EvaluateOpportunityUseCase):
        self.evaluate_use_case = evaluate_use_case

    @property
    def name(self) -> str:
        return "evaluate_opportunity"

    @property
    def description(self) -> str:
        return "Evaluate business opportunity viability"

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute opportunity evaluation"""
        opportunity_data = parameters.get('opportunity_data', {})

        evaluation = await self.evaluate_use_case.execute(opportunity_data)

        return {
            'evaluation': evaluation,
            'is_viable': evaluation.get('is_viable', False),
            'viability_score': evaluation.get('viability_score', 0),
            'recommendations': evaluation.get('recommendations', [])
        }


class SubsidiaryCreationCapability(AgentCapability):
    """Capability for creating subsidiaries"""

    def __init__(self, create_use_case: CreateSubsidiaryUseCase):
        self.create_use_case = create_use_case

    @property
    def name(self) -> str:
        return "create_subsidiary"

    @property
    def description(self) -> str:
        return "Create new subsidiary from evaluated opportunity"

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute subsidiary creation"""
        holding_id = parameters.get('holding_id')
        opportunity_data = parameters.get('opportunity_data', {})
        auto_launch = parameters.get('auto_launch', False)

        from backend.application.use_cases.create_subsidiary_use_case import CreateSubsidiaryRequest

        request = CreateSubsidiaryRequest(
            holding_id=holding_id,
            opportunity_data=opportunity_data,
            auto_launch=auto_launch
        )

        result = await self.create_use_case.execute(request)

        return {
            'success': result.success,
            'message': result.message,
            'subsidiary_created': result.subsidiary is not None,
            'subsidiary_id': str(result.subsidiary.id) if result.subsidiary else None,
            'evaluation': result.evaluation
        }


class AutoEvolutionAgent(BaseAgent):
    """
    Agente especializado em auto-evolução da corporação
    Identifica oportunidades e cria subsidiárias automaticamente
    """

    def __init__(
        self,
        evaluate_use_case: EvaluateOpportunityUseCase,
        create_use_case: CreateSubsidiaryUseCase,
        holding_repo: HoldingRepository,
        opportunity_repo: OpportunityRepository
    ):
        super().__init__(
            name="Auto Evolution Agent",
            role=AgentRole.MANAGEMENT,
            specialization="Corporate Auto-Evolution",
            autonomy_level=85.0  # High autonomy for auto-evolution
        )

        self.evaluate_use_case = evaluate_use_case
        self.create_use_case = create_use_case
        self.holding_repo = holding_repo
        self.opportunity_repo = opportunity_repo

        # Register capabilities
        self.register_capability(OpportunityDiscoveryCapability())
        self.register_capability(OpportunityEvaluationCapability(evaluate_use_case))
        self.register_capability(SubsidiaryCreationCapability(create_use_case))

        # Auto-evolution state
        self.evolution_cycles_completed = 0
        self.last_evolution_check = datetime.utcnow()
        self.evolution_interval_hours = 24  # Check for opportunities daily

    async def execute_custom_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute custom auto-evolution tasks"""
        if task.task_type == "auto_evolution_cycle":
            return await self._execute_evolution_cycle()
        elif task.task_type == "opportunity_pipeline":
            return await self._execute_opportunity_pipeline()
        elif task.task_type == "holding_growth_analysis":
            return await self._execute_growth_analysis()
        else:
            raise ValueError(f"Unknown task type: {task.task_type}")

    async def _execute_evolution_cycle(self) -> Dict[str, Any]:
        """Execute complete auto-evolution cycle"""
        cycle_start = datetime.utcnow()

        results = {
            'cycle_start': cycle_start.isoformat(),
            'opportunities_discovered': 0,
            'opportunities_evaluated': 0,
            'subsidiaries_created': 0,
            'errors': [],
            'recommendations': []
        }

        try:
            # 1. Discover opportunities
            discovery_result = await self.capabilities['discover_opportunities'].execute({
                'market_segments': ['tech', 'finance', 'healthcare', 'ecommerce']
            })

            results['opportunities_discovered'] = discovery_result['opportunities_found']
            opportunities = discovery_result['opportunities']

            # 2. Evaluate each opportunity
            viable_opportunities = []
            for opp_data in opportunities:
                try:
                    eval_result = await self.capabilities['evaluate_opportunity'].execute({
                        'opportunity_data': opp_data
                    })

                    results['opportunities_evaluated'] += 1

                    if eval_result['is_viable']:
                        viable_opportunities.append((opp_data, eval_result))

                except Exception as e:
                    results['errors'].append(f"Evaluation error for {opp_data.get('market_segment')}: {str(e)}")

            # 3. Create subsidiaries for viable opportunities
            holding = await self.holding_repo.get_by_id(self._get_main_holding_id())

            for opp_data, eval_result in viable_opportunities[:2]:  # Limit to 2 per cycle
                try:
                    create_result = await self.capabilities['create_subsidiary'].execute({
                        'holding_id': holding.id,
                        'opportunity_data': opp_data,
                        'auto_launch': False  # Require manual launch for safety
                    })

                    if create_result['success']:
                        results['subsidiaries_created'] += 1

                except Exception as e:
                    results['errors'].append(f"Creation error: {str(e)}")

            # 4. Generate recommendations
            results['recommendations'] = await self._generate_evolution_recommendations(results)

            # 5. Update cycle counter
            self.evolution_cycles_completed += 1
            self.last_evolution_check = datetime.utcnow()

        except Exception as e:
            results['errors'].append(f"Critical evolution cycle error: {str(e)}")

        results['cycle_duration_seconds'] = (datetime.utcnow() - cycle_start).total_seconds()

        return results

    async def _execute_opportunity_pipeline(self) -> Dict[str, Any]:
        """Execute opportunity discovery and evaluation pipeline"""
        # Get viable opportunities from database
        opportunities = await self.opportunity_repo.get_viable_opportunities(threshold=70.0)

        pipeline_results = {
            'pipeline_start': datetime.utcnow().isoformat(),
            'opportunities_in_pipeline': len(opportunities),
            'high_priority_opportunities': 0,
            'recommended_actions': []
        }

        # Analyze pipeline
        for opp in opportunities:
            viability_score = opp.calculate_viability_score()
            if viability_score >= 80:
                pipeline_results['high_priority_opportunities'] += 1

        # Generate actions
        if pipeline_results['high_priority_opportunities'] > 0:
            pipeline_results['recommended_actions'].append(
                "Execute subsidiary creation for high-priority opportunities"
            )

        if pipeline_results['opportunities_in_pipeline'] < 5:
            pipeline_results['recommended_actions'].append(
                "Run additional opportunity discovery cycle"
            )

        return pipeline_results

    async def _execute_growth_analysis(self) -> Dict[str, Any]:
        """Analyze holding growth and generate insights"""
        holding = await self.holding_repo.get_by_id(self._get_main_holding_id())

        analysis = {
            'analysis_date': datetime.utcnow().isoformat(),
            'holding_metrics': {
                'total_subsidiaries': len(holding.subsidiaries),
                'active_subsidiaries': len([s for s in holding.subsidiaries if s.status.value == 'active']),
                'total_revenue': float(holding.total_revenue),
                'average_autonomy': sum(s.autonomy_level for s in holding.subsidiaries) / max(len(holding.subsidiaries), 1)
            },
            'growth_indicators': {},
            'bottlenecks': [],
            'opportunities': []
        }

        # Calculate growth indicators
        active_subs = analysis['holding_metrics']['active_subsidiaries']
        total_subs = analysis['holding_metrics']['total_subsidiaries']

        analysis['growth_indicators'] = {
            'subsidiary_activation_rate': active_subs / max(total_subs, 1),
            'revenue_per_subsidiary': analysis['holding_metrics']['total_revenue'] / max(total_subs, 1),
            'autonomy_maturity': 'high' if analysis['holding_metrics']['average_autonomy'] > 80 else 'medium' if analysis['holding_metrics']['average_autonomy'] > 60 else 'low'
        }

        # Identify bottlenecks
        if analysis['growth_indicators']['subsidiary_activation_rate'] < 0.7:
            analysis['bottlenecks'].append("Low subsidiary activation rate - review launch criteria")

        if analysis['holding_metrics']['average_autonomy'] < 70:
            analysis['bottlenecks'].append("Low autonomy levels - focus on agent training")

        # Identify opportunities
        if total_subs < 10:
            analysis['opportunities'].append("Scale subsidiary creation - current portfolio is small")

        if analysis['holding_metrics']['total_revenue'] < 100000:
            analysis['opportunities'].append("Focus on revenue generation - current revenue is below target")

        return analysis

    async def _generate_evolution_recommendations(self, cycle_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on evolution cycle results"""
        recommendations = []

        if cycle_results['opportunities_discovered'] == 0:
            recommendations.append("Improve opportunity discovery mechanisms")
        elif cycle_results['opportunities_discovered'] > 10:
            recommendations.append("Too many opportunities discovered - refine discovery criteria")

        if cycle_results['subsidiaries_created'] == 0:
            recommendations.append("No subsidiaries created - review opportunity evaluation criteria")
        elif cycle_results['subsidiaries_created'] > 3:
            recommendations.append("High subsidiary creation rate - monitor resource allocation")

        if len(cycle_results['errors']) > 0:
            recommendations.append(f"Address {len(cycle_results['errors'])} errors in evolution process")

        if cycle_results.get('cycle_duration_seconds', 0) > 300:  # 5 minutes
            recommendations.append("Evolution cycle is taking too long - optimize performance")

        recommendations.extend([
            "Monitor subsidiary performance metrics weekly",
            "Review and update opportunity evaluation criteria quarterly",
            "Ensure adequate infrastructure capacity for new subsidiaries"
        ])

        return recommendations

    def _get_main_holding_id(self) -> str:
        """Get the main holding ID (hardcoded for now)"""
        # In production, this would be configurable or discovered
        return "550e8400-e29b-41d4-a716-446655440000"

    async def schedule_evolution_cycle(self) -> None:
        """Schedule the next evolution cycle"""
        if (datetime.utcnow() - self.last_evolution_check).total_seconds() > (self.evolution_interval_hours * 3600):
            task = AgentTask(
                task_type="auto_evolution_cycle",
                description="Execute complete auto-evolution cycle",
                priority=8
            )
            await self.assign_task(task)

    async def get_evolution_status(self) -> Dict[str, Any]:
        """Get current evolution status"""
        return {
            'agent_name': self.name,
            'evolution_cycles_completed': self.evolution_cycles_completed,
            'last_evolution_check': self.last_evolution_check.isoformat(),
            'autonomy_level': self.autonomy_level,
            'performance_score': self.performance_score,
            'capabilities': self.get_capabilities_list(),
            'is_active': self.is_active,
            'next_evolution_due': (
                self.last_evolution_check + timedelta(hours=self.evolution_interval_hours)
            ).isoformat()
        }