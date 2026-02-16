"""
Subsidiary Creation Service - Serviço de Domínio
Implementa a lógica de negócio para criação automática de subsidiárias
"""

from typing import Dict, Any, List, Optional
from uuid import uuid4
from datetime import datetime

from backend.core.entities.holding import Holding, Subsidiary, Opportunity
from backend.core.value_objects import (
    BusinessType, SubsidiaryStatus, RevenueTarget,
    MarketAnalysis, RiskAssessment, SubsidiaryTemplate
)
from backend.infrastructure.database.holding_repository import (
    SubsidiaryRepository, OpportunityRepository
)


class SubsidiaryCreationService:
    """
    Serviço responsável pela criação automática de subsidiárias
    Implementa regras de negócio para avaliar viabilidade e criar subsidiárias
    """

    def __init__(
        self,
        subsidiary_repo: SubsidiaryRepository,
        opportunity_repo: OpportunityRepository
    ):
        self.subsidiary_repo = subsidiary_repo
        self.opportunity_repo = opportunity_repo

        # Templates pré-definidos para diferentes tipos de negócio
        self.subsidiary_templates = self._load_subsidiary_templates()

    async def evaluate_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Avalia uma oportunidade de negócio para criação de subsidiária

        Args:
            opportunity_data: Dados da oportunidade identificada

        Returns:
            Dict com avaliação completa da oportunidade
        """
        # Criar entidade Opportunity
        opportunity = Opportunity(
            id=uuid4(),
            market_segment=opportunity_data['market_segment'],
            opportunity_description=opportunity_data['description'],
            estimated_revenue=opportunity_data.get('estimated_revenue', 10000),
            risk_level=opportunity_data.get('risk_level', 'medium'),
            confidence_score=opportunity_data.get('confidence_score', 0.7)
        )

        # Análise de mercado automática
        market_analysis = await self._analyze_market(opportunity)

        # Avaliação de risco
        risk_assessment = await self._assess_risks(opportunity, market_analysis)

        # Atualizar opportunity com análises
        opportunity.market_analysis = market_analysis
        opportunity.risk_assessment = risk_assessment

        # Calcular score de viabilidade
        viability_score = opportunity.calculate_viability_score()

        # Determinar se é viável
        is_viable = viability_score >= 60.0  # Threshold configurável

        return {
            'opportunity': opportunity,
            'market_analysis': market_analysis,
            'risk_assessment': risk_assessment,
            'viability_score': viability_score,
            'is_viable': is_viable,
            'recommendations': self._generate_recommendations(
                opportunity, viability_score, is_viable
            )
        }

    async def create_subsidiary_from_opportunity(
        self,
        holding: Holding,
        opportunity: Opportunity
    ) -> Subsidiary:
        """
        Cria uma subsidiária baseada em uma oportunidade avaliada

        Args:
            holding: Holding que será dona da subsidiária
            opportunity: Oportunidade viável para criação

        Returns:
            Subsidiary criada e configurada
        """
        if not opportunity.is_viable():
            raise ValueError(f"Oportunidade não é viável: {opportunity.calculate_viability_score()}")

        # Selecionar template apropriado
        template = self._select_template(opportunity)

        # Gerar nome e descrição
        name = template.generate_name(opportunity.market_segment)
        description = template.generate_description(
            opportunity.market_segment,
            opportunity.opportunity_description
        )

        # Criar revenue target baseado na oportunidade
        revenue_target = self._calculate_revenue_target(opportunity)

        # Criar subsidiária
        subsidiary = Subsidiary(
            id=uuid4(),
            holding_id=holding.id,
            name=name,
            business_type=template.business_type,
            status=SubsidiaryStatus.PLANNING,
            revenue_target=revenue_target,
            current_revenue=0,
            autonomy_level=0.0  # Inicia com autonomia baixa
        )

        # Persistir subsidiária
        saved_subsidiary = await self.subsidiary_repo.save(subsidiary)

        # Adicionar à holding
        holding.add_subsidiary(saved_subsidiary)

        return saved_subsidiary

    async def assign_initial_agents(self, subsidiary: Subsidiary) -> None:
        """
        Atribui agentes iniciais para uma nova subsidiária

        Args:
            subsidiary: Subsidiária recém-criada
        """
        template = self.subsidiary_templates.get(subsidiary.business_type)

        if not template:
            # Fallback para agentes básicos
            required_roles = [AgentRole.MARKETING, AgentRole.SALES, AgentRole.DEVELOPMENT]
        else:
            required_roles = template.required_agents

        # Aqui seria implementada a lógica para criar agentes
        # Por enquanto, apenas registra que agentes são necessários
        subsidiary.needed_agents = required_roles

    async def launch_subsidiary(self, subsidiary: Subsidiary) -> Subsidiary:
        """
        Lança uma subsidiária para produção

        Args:
            subsidiary: Subsidiária pronta para lançamento

        Returns:
            Subsidiary lançada
        """
        # Verificar se está pronta para lançamento
        if not subsidiary.is_ready_for_launch():
            raise ValueError("Subsidiária não está pronta para lançamento")

        # Mudar status para ACTIVE
        subsidiary.status = SubsidiaryStatus.ACTIVE
        subsidiary.updated_at = datetime.utcnow()

        # Persistir mudanças
        launched_subsidiary = await self.subsidiary_repo.save(subsidiary)

        return launched_subsidiary

    async def _analyze_market(self, opportunity: Opportunity) -> MarketAnalysis:
        """
        Análise automática de mercado para uma oportunidade
        """
        # Simulação de análise de mercado
        # Em produção, isso usaria APIs de dados de mercado, análise de concorrência, etc.

        market_size = opportunity.estimated_revenue * 100  # Estimativa simplificada
        growth_rate = 0.15  # 15% crescimento médio

        # Determinar nível de competição baseado no segmento
        competition_levels = {
            'tech': 'high',
            'finance': 'high',
            'healthcare': 'medium',
            'ecommerce': 'high',
            'consulting': 'medium'
        }

        segment_key = opportunity.market_segment.lower()
        competition = next(
            (level for key, level in competition_levels.items() if key in segment_key),
            'medium'
        )

        # Pontos de dor comuns por segmento
        pain_points_map = {
            'tech': ['Integração complexa', 'Curva de aprendizado', 'Custos altos'],
            'finance': ['Regulamentação', 'Conformidade', 'Riscos de mercado'],
            'healthcare': ['Privacidade de dados', 'Regulamentação', 'Integração com sistemas'],
            'ecommerce': ['Concorrência', 'Logística', 'Experiência do usuário'],
            'consulting': ['Qualificação', 'Escalabilidade', 'Medição de ROI']
        }

        pain_points = pain_points_map.get(segment_key, ['Problemas genéricos'])

        return MarketAnalysis(
            market_size=market_size,
            market_growth_rate=growth_rate,
            competition_level=competition,
            entry_barriers='medium',  # Assumindo médio para simplificar
            customer_pain_points=pain_points,
            estimated_market_share=15.0  # 15% share estimado
        )

    async def _assess_risks(
        self,
        opportunity: Opportunity,
        market_analysis: MarketAnalysis
    ) -> RiskAssessment:
        """
        Avaliação de riscos para uma oportunidade
        """
        # Avaliação simplificada baseada no mercado
        technical_risk = 'low' if market_analysis.competition_level == 'low' else 'medium'
        market_risk = market_analysis.competition_level
        financial_risk = 'medium'  # Sempre médio para novos negócios
        operational_risk = 'medium'

        # Estratégias de mitigação baseadas nos riscos
        mitigation_strategies = []

        if market_risk == 'high':
            mitigation_strategies.extend([
                'Diferenciação por tecnologia proprietária',
                'Foco em nicho específico',
                'Parcerias estratégicas'
            ])

        if technical_risk == 'medium':
            mitigation_strategies.extend([
                'Equipe técnica experiente',
                'Arquitetura escalável',
                'Testes extensivos'
            ])

        mitigation_strategies.extend([
            'Diversificação de receita',
            'Monitoramento contínuo',
            'Planos de contingência'
        ])

        return RiskAssessment(
            technical_risk=technical_risk,
            market_risk=market_risk,
            financial_risk=financial_risk,
            operational_risk=operational_risk,
            mitigation_strategies=mitigation_strategies
        )

    def _load_subsidiary_templates(self) -> Dict[BusinessType, SubsidiaryTemplate]:
        """Carrega templates pré-definidos para subsidiárias"""
        return {
            BusinessType.SAAS: SubsidiaryTemplate(
                business_type=BusinessType.SAAS,
                name_template="{market_segment} SaaS Platform",
                description_template="Plataforma SaaS inovadora para {market_segment}, resolvendo {opportunity} com tecnologia de ponta.",
                required_agents=[
                    AgentRole.DEVELOPMENT,
                    AgentRole.MARKETING,
                    AgentRole.SALES,
                    AgentRole.OPERATIONS
                ],
                initial_infrastructure={
                    'database': 'PostgreSQL',
                    'hosting': 'AWS/GCP',
                    'cdn': 'Cloudflare',
                    'monitoring': 'Custom dashboard'
                },
                monetization_strategy="Freemium → Pro → Enterprise tiers",
                success_metrics=[
                    'Monthly Recurring Revenue',
                    'Customer Acquisition Cost',
                    'Churn Rate',
                    'Feature Adoption'
                ]
            ),

            BusinessType.TRADING: SubsidiaryTemplate(
                business_type=BusinessType.TRADING,
                name_template="{market_segment} Trading Solutions",
                description_template="Soluções avançadas de trading para {market_segment}, automatizando {opportunity} com algoritmos de alta performance.",
                required_agents=[
                    AgentRole.FINANCE,
                    AgentRole.DEVELOPMENT,
                    AgentRole.OPERATIONS,
                    AgentRole.RISK_MANAGEMENT
                ],
                initial_infrastructure={
                    'trading_api': 'Broker APIs',
                    'database': 'Time-series DB',
                    'real_time': 'WebSocket connections',
                    'security': 'Financial-grade encryption'
                },
                monetization_strategy="Performance fees + Subscription",
                success_metrics=[
                    'Return on Investment',
                    'Sharpe Ratio',
                    'Maximum Drawdown',
                    'Win Rate'
                ]
            ),

            BusinessType.ECOMMERCE: SubsidiaryTemplate(
                business_type=BusinessType.ECOMMERCE,
                name_template="{market_segment} Commerce Hub",
                description_template="Plataforma de e-commerce completa para {market_segment}, solucionando {opportunity} com experiência excepcional.",
                required_agents=[
                    AgentRole.MARKETING,
                    AgentRole.SALES,
                    AgentRole.OPERATIONS,
                    AgentRole.DEVELOPMENT
                ],
                initial_infrastructure={
                    'ecommerce_platform': 'Custom built',
                    'payment_gateway': 'Stripe + local',
                    'inventory_system': 'Real-time sync',
                    'shipping_integration': 'Multiple carriers'
                },
                monetization_strategy="Commission + Subscription",
                success_metrics=[
                    'Gross Merchandise Value',
                    'Conversion Rate',
                    'Average Order Value',
                    'Customer Lifetime Value'
                ]
            ),

            BusinessType.CONSULTING: SubsidiaryTemplate(
                business_type=BusinessType.CONSULTING,
                name_template="{market_segment} Advisory Group",
                description_template="Consultoria especializada em {market_segment}, transformando {opportunity} com expertise e metodologia proprietária.",
                required_agents=[
                    AgentRole.MANAGEMENT,
                    AgentRole.SALES,
                    AgentRole.RESEARCH,
                    AgentRole.OPERATIONS
                ],
                initial_infrastructure={
                    'crm': 'Custom CRM',
                    'project_management': 'Agile tools',
                    'knowledge_base': 'Expert systems',
                    'client_portal': 'Secure access'
                },
                monetization_strategy="Hourly rates + Retainer",
                success_metrics=[
                    'Client Satisfaction',
                    'Project Success Rate',
                    'Revenue per Consultant',
                    'Repeat Business Rate'
                ]
            ),

            BusinessType.RESEARCH: SubsidiaryTemplate(
                business_type=BusinessType.RESEARCH,
                name_template="{market_segment} Innovation Lab",
                description_template="Laboratório de inovação em {market_segment}, avançando {opportunity} com pesquisa de ponta e desenvolvimento.",
                required_agents=[
                    AgentRole.RESEARCH,
                    AgentRole.DEVELOPMENT,
                    AgentRole.MANAGEMENT,
                    AgentRole.FINANCE
                ],
                initial_infrastructure={
                    'research_platform': 'AI-powered tools',
                    'data_lake': 'Big data storage',
                    'compute_cluster': 'GPU/TPU access',
                    'collaboration_tools': 'Research platforms'
                },
                monetization_strategy="Licensing + Grants + Consulting",
                success_metrics=[
                    'Publications',
                    'Patents Filed',
                    'Funding Secured',
                    'Technology Transfers'
                ]
            )
        }

    def _select_template(self, opportunity: Opportunity) -> SubsidiaryTemplate:
        """Seleciona template apropriado baseado na oportunidade"""
        # Lógica simplificada - em produção seria mais sofisticada
        segment_lower = opportunity.market_segment.lower()

        if 'software' in segment_lower or 'app' in segment_lower or 'digital' in segment_lower:
            return self.subsidiary_templates[BusinessType.SAAS]
        elif 'trading' in segment_lower or 'finance' in segment_lower or 'invest' in segment_lower:
            return self.subsidiary_templates[BusinessType.TRADING]
        elif 'ecommerce' in segment_lower or 'commerce' in segment_lower or 'marketplace' in segment_lower:
            return self.subsidiary_templates[BusinessType.ECOMMERCE]
        elif 'consulting' in segment_lower or 'advisory' in segment_lower or 'services' in segment_lower:
            return self.subsidiary_templates[BusinessType.CONSULTING]
        elif 'research' in segment_lower or 'innovation' in segment_lower or 'lab' in segment_lower:
            return self.subsidiary_templates[BusinessType.RESEARCH]
        else:
            # Default para SaaS
            return self.subsidiary_templates[BusinessType.SAAS]

    def _calculate_revenue_target(self, opportunity: Opportunity) -> RevenueTarget:
        """Calcula target de receita baseado na oportunidade"""
        # Target mensal baseado na estimativa anual
        monthly_target = opportunity.estimated_revenue / 12

        # Taxa de crescimento baseada no segmento
        growth_rates = {
            'tech': 0.15,
            'finance': 0.12,
            'healthcare': 0.10,
            'ecommerce': 0.20,
            'consulting': 0.08,
            'research': 0.05
        }

        segment_key = opportunity.market_segment.lower()
        growth_rate = next(
            (rate for key, rate in growth_rates.items() if key in segment_key),
            0.10  # Default 10%
        )

        return RevenueTarget(
            monthly_target=monthly_target,
            growth_rate=growth_rate,
            timeframe_months=12
        )

    def _generate_recommendations(
        self,
        opportunity: Opportunity,
        viability_score: float,
        is_viable: bool
    ) -> List[str]:
        """Gera recomendações baseadas na avaliação"""
        recommendations = []

        if not is_viable:
            recommendations.append("Oportunidade não atende critérios mínimos de viabilidade")
            recommendations.append("Considere pivotar para segmento com menor competição")
            recommendations.append("Avalie redução do escopo inicial")

        if viability_score < 70:
            recommendations.append("Melhore análise de mercado com dados mais precisos")
            recommendations.append("Considere parcerias estratégicas para reduzir riscos")
            recommendations.append("Implemente MVP para validar hipóteses")

        if opportunity.market_analysis:
            if opportunity.market_analysis.competition_level == 'high':
                recommendations.append("Diferenciação tecnológica é crítica para sucesso")
                recommendations.append("Considere nicho específico dentro do segmento")

            if opportunity.market_analysis.market_size < 1000000:  # $1M
                recommendations.append("Mercado relativamente pequeno - considere expansão geográfica")

        recommendations.append("Monitore métricas de sucesso semanalmente")
        recommendations.append("Prepare plano de contingência para cenários adversos")

        return recommendations