"""
Auto Subsidiary Creator Service
Serviço para criação automática de subsidiárias baseada em oportunidades de mercado
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from ..entities.holding import Holding, Subsidiary, Opportunity
from ..value_objects.business_type import BusinessType
from ..value_objects.revenue_model import RevenueModel, RevenueModelValidator
from ..value_objects.market_opportunity import MarketOpportunity
from ...agents.base.agent_base import BaseAgent
from ...agents.memory.episodic_memory import EpisodicMemorySystem


class AutoSubsidiaryCreator:
    """
    Serviço para criação automática de subsidiárias
    Coordena todo o processo desde avaliação até implementação
    """

    def __init__(self,
                 holding: Holding,
                 blueprint_agent: Optional[BaseAgent] = None,
                 infrastructure_agent: Optional[BaseAgent] = None,
                 memory_system: Optional[EpisodicMemorySystem] = None):
        self.holding = holding
        self.blueprint_agent = blueprint_agent
        self.infrastructure_agent = infrastructure_agent
        self.memory_system = memory_system or EpisodicMemorySystem()

        # Templates de subsidiária por tipo de negócio
        self.subsidiary_templates = self._load_subsidiary_templates()

        # Métricas de criação
        self.creation_attempts = 0
        self.successful_creations = 0
        self.failed_creations = 0

    def _load_subsidiary_templates(self) -> Dict[str, Dict[str, Any]]:
        """Carrega templates de subsidiária"""
        # Templates baseados em tipos de negócio
        templates = {}

        for business_type in BusinessType:
            template = {
                'business_type': business_type,
                'default_revenue_model': self._get_default_revenue_model(business_type),
                'initial_resources': self._get_initial_resources(business_type),
                'scaling_strategy': self._get_scaling_strategy(business_type),
                'risk_factors': self._get_risk_factors(business_type),
                'success_metrics': self._get_success_metrics(business_type)
            }
            templates[business_type.value] = template

        return templates

    def _get_default_revenue_model(self, business_type: BusinessType) -> RevenueModel:
        """Retorna modelo de receita padrão para o tipo de negócio"""
        defaults = {
            BusinessType.SAAS: RevenueModel.FREEMIUM,
            BusinessType.MARKETPLACE: RevenueModel.MARKETPLACE_COMMISSION,
            BusinessType.ECOMMERCE: RevenueModel.TRANSACTION_FEES,
            BusinessType.FINTECH: RevenueModel.TRANSACTION_FEES,
            BusinessType.HEALTHTECH: RevenueModel.SUBSCRIPTION,
            BusinessType.EDTECH: RevenueModel.FREEMIUM,
            BusinessType.PROPTECH: RevenueModel.SUBSCRIPTION,
            BusinessType.AUTOTECH: RevenueModel.SERVICE_BASED,
            BusinessType.GREENTECH: RevenueModel.SUBSCRIPTION,
            BusinessType.WEB3: RevenueModel.TRANSACTION_FEES
        }
        return defaults.get(business_type, RevenueModel.SUBSCRIPTION)

    def _get_initial_resources(self, business_type: BusinessType) -> Dict[str, Any]:
        """Retorna recursos iniciais necessários"""
        resources = {
            BusinessType.SAAS: {
                'team_size': 5,
                'initial_budget': 150000,
                'tech_stack': ['React', 'Node.js', 'PostgreSQL', 'AWS'],
                'timeline_months': 3
            },
            BusinessType.MARKETPLACE: {
                'team_size': 8,
                'initial_budget': 300000,
                'tech_stack': ['React', 'Python', 'PostgreSQL', 'Stripe', 'AWS'],
                'timeline_months': 4
            },
            BusinessType.ECOMMERCE: {
                'team_size': 6,
                'initial_budget': 100000,
                'tech_stack': ['Shopify', 'React', 'Node.js', 'MongoDB'],
                'timeline_months': 2
            },
            BusinessType.FINTECH: {
                'team_size': 10,
                'initial_budget': 400000,
                'tech_stack': ['React', 'Python', 'PostgreSQL', 'Stripe', 'AWS'],
                'timeline_months': 6
            },
            BusinessType.HEALTHTECH: {
                'team_size': 12,
                'initial_budget': 500000,
                'tech_stack': ['React', 'Python', 'PostgreSQL', 'HIPAA Compliant Cloud'],
                'timeline_months': 8
            }
        }
        return resources.get(business_type, {
            'team_size': 5,
            'initial_budget': 150000,
            'tech_stack': ['React', 'Node.js', 'PostgreSQL'],
            'timeline_months': 3
        })

    def _get_scaling_strategy(self, business_type: BusinessType) -> Dict[str, Any]:
        """Retorna estratégia de escalabilidade"""
        strategies = {
            BusinessType.SAAS: {
                'initial_focus': 'product_market_fit',
                'scaling_triggers': ['100_paying_users', 'product_market_fit_validated'],
                'growth_channels': ['content_marketing', 'seo', 'referrals']
            },
            BusinessType.MARKETPLACE: {
                'initial_focus': 'network_liquidity',
                'scaling_triggers': ['1000_transactions_month', 'supply_demand_balance'],
                'growth_channels': ['partnerships', 'market_expansion', 'user_acquisition']
            },
            BusinessType.ECOMMERCE: {
                'initial_focus': 'conversion_optimization',
                'scaling_triggers': ['1000_orders_month', 'positive_unit_economics'],
                'growth_channels': ['paid_ads', 'email_marketing', 'social_commerce']
            }
        }
        return strategies.get(business_type, {
            'initial_focus': 'market_validation',
            'scaling_triggers': ['initial_traction', 'product_market_fit'],
            'growth_channels': ['organic_growth', 'content_marketing']
        })

    def _get_risk_factors(self, business_type: BusinessType) -> List[str]:
        """Retorna fatores de risco"""
        risks = {
            BusinessType.FINTECH: ['regulatory_compliance', 'security_breach', 'market_volatility'],
            BusinessType.HEALTHTECH: ['regulatory_approval', 'data_privacy', 'clinical_validation'],
            BusinessType.WEB3: ['regulatory_uncertainty', 'market_volatility', 'technical_complexity']
        }
        return risks.get(business_type, ['market_risk', 'execution_risk', 'competition'])

    def _get_success_metrics(self, business_type: BusinessType) -> List[str]:
        """Retorna métricas de sucesso"""
        metrics = {
            BusinessType.SAAS: ['monthly_recurring_revenue', 'churn_rate', 'customer_acquisition_cost'],
            BusinessType.MARKETPLACE: ['gmv', 'take_rate', 'network_liquidity', 'user_engagement'],
            BusinessType.ECOMMERCE: ['conversion_rate', 'average_order_value', 'customer_lifetime_value']
        }
        return metrics.get(business_type, ['revenue', 'user_growth', 'profitability'])

    async def evaluate_opportunity(self, opportunity: Opportunity) -> Dict[str, Any]:
        """
        Avalia oportunidade de mercado para criação de subsidiária

        Args:
            opportunity: Oportunidade identificada

        Returns:
            Dict com avaliação completa
        """
        self.creation_attempts += 1

        evaluation = {
            'opportunity_id': opportunity.id,
            'feasibility_score': 0.0,
            'recommended_business_type': None,
            'recommended_revenue_model': None,
            'estimated_initial_investment': Decimal('0'),
            'estimated_first_year_revenue': Decimal('0'),
            'risk_assessment': {},
            'creation_confidence': 0.0,
            'next_steps': [],
            'created_at': datetime.utcnow()
        }

        try:
            # Calcular score de viabilidade
            evaluation['feasibility_score'] = self._calculate_feasibility_score(opportunity)

            # Recomendar tipo de negócio e modelo de receita
            business_recommendation = await self._recommend_business_model(opportunity)
            evaluation.update(business_recommendation)

            # Estimar investimentos e receita
            financial_estimates = self._estimate_financials(opportunity, evaluation['recommended_business_type'])
            evaluation.update(financial_estimates)

            # Avaliar riscos
            evaluation['risk_assessment'] = self._assess_creation_risks(opportunity, evaluation)

            # Calcular confiança de criação
            evaluation['creation_confidence'] = self._calculate_creation_confidence(evaluation)

            # Definir próximos passos
            evaluation['next_steps'] = self._define_next_steps(evaluation)

            # Registrar memória da avaliação
            await self._log_evaluation_memory(opportunity, evaluation)

        except Exception as e:
            evaluation['error'] = str(e)
            evaluation['feasibility_score'] = 0.0

        return evaluation

    def _calculate_feasibility_score(self, opportunity: Opportunity) -> float:
        """Calcula score de viabilidade da oportunidade"""
        # Combinação ponderada dos scores de viabilidade
        weights = {
            'technical': 0.30,
            'business': 0.35,
            'financial': 0.25,
            'market': 0.10
        }

        technical_score = opportunity.technical_feasibility / 100.0
        business_score = opportunity.business_feasibility / 100.0
        financial_score = opportunity.financial_feasibility / 100.0

        # Score de mercado baseado em TAM/SAM/SOM
        market_score = min(1.0, (opportunity.sam / opportunity.tam) * (opportunity.som / opportunity.sam))

        feasibility = (
            technical_score * weights['technical'] +
            business_score * weights['business'] +
            financial_score * weights['financial'] +
            market_score * weights['market']
        )

        return round(feasibility, 3)

    async def _recommend_business_model(self, opportunity: Opportunity) -> Dict[str, Any]:
        """Recomenda tipo de negócio e modelo de receita"""
        # Usar blueprint agent se disponível
        if self.blueprint_agent:
            task = {
                'id': f'blueprint_{opportunity.id}',
                'type': 'business_model_recommendation',
                'description': f'Recomendar modelo de negócio para oportunidade: {opportunity.title}',
                'context': {
                    'market_size': float(opportunity.tam),
                    'growth_rate': float(opportunity.growth_rate),
                    'competition_level': opportunity.competition_level,
                    'market_maturity': opportunity.market_maturity
                }
            }

            result = await self.blueprint_agent.process_task(task)

            if 'recommendation' in result:
                rec = result['recommendation']
                business_type = BusinessType(rec.get('business_type', 'saas'))
                revenue_model = RevenueModel(rec.get('revenue_model', 'subscription'))

                return {
                    'recommended_business_type': business_type,
                    'recommended_revenue_model': revenue_model
                }

        # Fallback: usar recomendação baseada em heurísticas
        business_type = opportunity.recommended_business_type
        revenue_model = opportunity.recommended_revenue_model

        return {
            'recommended_business_type': business_type,
            'recommended_revenue_model': revenue_model
        }

    def _estimate_financials(self, opportunity: Opportunity, business_type: BusinessType) -> Dict[str, Any]:
        """Estima investimentos e receita inicial"""
        template = self.subsidiary_templates.get(business_type.value, {})

        # Investimento inicial do template
        initial_investment = Decimal(str(template.get('initial_resources', {}).get('initial_budget', 150000)))

        # Ajustar baseado na oportunidade
        investment_multiplier = 1.0
        if opportunity.competition_level == 'high':
            investment_multiplier *= 1.5  # Mais investimento em marketing
        if opportunity.technical_feasibility < 70:
            investment_multiplier *= 1.3  # Mais investimento em desenvolvimento

        adjusted_investment = initial_investment * Decimal(str(investment_multiplier))

        # Estimar receita do primeiro ano
        market_size = opportunity.som
        market_share_target = 0.01  # 1% do SOM no primeiro ano
        avg_revenue_per_user = self._get_avg_revenue_per_user(business_type)

        estimated_users = int(market_size * market_share_target / avg_revenue_per_user)
        estimated_revenue = Decimal(str(estimated_users * avg_revenue_per_user))

        return {
            'estimated_initial_investment': adjusted_investment,
            'estimated_first_year_revenue': estimated_revenue,
            'estimated_users_year1': estimated_users
        }

    def _get_avg_revenue_per_user(self, business_type: BusinessType) -> float:
        """Retorna receita média por usuário"""
        revenue_estimates = {
            BusinessType.SAAS: 120.0,  # $120/usuário/mês
            BusinessType.MARKETPLACE: 45.0,  # $45/usuário/mês
            BusinessType.ECOMMERCE: 85.0,  # $85/usuário/mês
            BusinessType.FINTECH: 25.0,   # $25/usuário/mês
            BusinessType.HEALTHTECH: 200.0, # $200/usuário/mês
            BusinessType.EDTECH: 35.0,   # $35/usuário/mês
            BusinessType.PROPTECH: 150.0, # $150/usuário/mês
            BusinessType.AUTOTECH: 300.0, # $300/usuário/mês
            BusinessType.GREENTECH: 75.0, # $75/usuário/mês
            BusinessType.WEB3: 15.0     # $15/usuário/mês
        }
        return revenue_estimates.get(business_type, 50.0)

    def _assess_creation_risks(self, opportunity: Opportunity, evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """Avalia riscos da criação"""
        business_type = evaluation.get('recommended_business_type')
        investment = evaluation.get('estimated_initial_investment', Decimal('0'))

        risks = {
            'market_risk': self._calculate_market_risk(opportunity),
            'execution_risk': self._calculate_execution_risk(opportunity, business_type),
            'financial_risk': self._calculate_financial_risk(investment, self.holding.cash_position),
            'technical_risk': opportunity.technical_feasibility / 100.0,
            'regulatory_risk': self._calculate_regulatory_risk(business_type)
        }

        overall_risk = sum(risks.values()) / len(risks)

        return {
            'detailed_risks': risks,
            'overall_risk_score': overall_risk,
            'risk_level': 'high' if overall_risk > 0.7 else 'medium' if overall_risk > 0.4 else 'low'
        }

    def _calculate_market_risk(self, opportunity: Opportunity) -> float:
        """Calcula risco de mercado"""
        risk = 0.5  # Base

        if opportunity.competition_level == 'high':
            risk += 0.3
        if opportunity.market_maturity == 'nascent':
            risk += 0.2
        if opportunity.growth_rate < 20:
            risk -= 0.1

        return min(1.0, max(0.0, risk))

    def _calculate_execution_risk(self, opportunity: Opportunity, business_type: BusinessType) -> float:
        """Calcula risco de execução"""
        risk = 0.4  # Base

        if opportunity.estimated_time_to_market > 6:
            risk += 0.2
        if business_type and business_type.requires_special_regulatory_approval():
            risk += 0.3

        return min(1.0, max(0.0, risk))

    def _calculate_financial_risk(self, investment: Decimal, available_cash: Decimal) -> float:
        """Calcula risco financeiro"""
        if available_cash <= 0:
            return 1.0

        investment_ratio = float(investment / available_cash)

        if investment_ratio > 0.5:  # Mais de 50% do caixa
            return 0.9
        elif investment_ratio > 0.25:  # Mais de 25% do caixa
            return 0.6
        elif investment_ratio > 0.1:  # Mais de 10% do caixa
            return 0.3
        else:
            return 0.1

    def _calculate_regulatory_risk(self, business_type: BusinessType) -> float:
        """Calcula risco regulatório"""
        high_regulation_types = [BusinessType.FINTECH, BusinessType.HEALTHTECH, BusinessType.WEB3]
        medium_regulation_types = [BusinessType.AUTOTECH, BusinessType.GREENTECH]

        if business_type in high_regulation_types:
            return 0.8
        elif business_type in medium_regulation_types:
            return 0.5
        else:
            return 0.2

    def _calculate_creation_confidence(self, evaluation: Dict[str, Any]) -> float:
        """Calcula confiança na criação bem-sucedida"""
        feasibility = evaluation.get('feasibility_score', 0)
        risk_score = evaluation.get('risk_assessment', {}).get('overall_risk_score', 1.0)

        # Confiança = viabilidade / (viabilidade + risco)
        if feasibility + risk_score == 0:
            return 0.0

        confidence = feasibility / (feasibility + risk_score)
        return round(confidence, 3)

    def _define_next_steps(self, evaluation: Dict[str, Any]) -> List[str]:
        """Define próximos passos baseado na avaliação"""
        confidence = evaluation.get('creation_confidence', 0)
        risk_level = evaluation.get('risk_assessment', {}).get('risk_level', 'high')

        if confidence >= 0.8 and risk_level == 'low':
            return [
                "Aprovar criação da subsidiária",
                "Alocar recursos iniciais",
                "Iniciar desenvolvimento do MVP",
                "Definir equipe e responsabilidades"
            ]
        elif confidence >= 0.6 and risk_level in ['low', 'medium']:
            return [
                "Realizar due diligence adicional",
                "Desenvolver plano de mitigação de riscos",
                "Preparar blueprint detalhado",
                "Avaliar viabilidade técnica aprofundada"
            ]
        elif confidence >= 0.4:
            return [
                "Coletar mais dados de mercado",
                "Realizar pesquisa com potenciais clientes",
                "Refinar estimativas financeiras",
                "Avaliar alternativas de modelo de negócio"
            ]
        else:
            return [
                "Reavaliar premissas da oportunidade",
                "Buscar oportunidades similares de menor risco",
                "Documentar lições aprendidas",
                "Pausar avaliação por período determinado"
            ]

    async def _log_evaluation_memory(self, opportunity: Opportunity, evaluation: Dict[str, Any]):
        """Registra memória da avaliação"""
        event_data = {
            'event_type': 'opportunity_evaluation',
            'description': f'Avaliação da oportunidade: {opportunity.title}',
            'participants': ['auto_subsidiary_creator'],
            'outcome': 'completed' if evaluation.get('creation_confidence', 0) > 0.5 else 'deferred',
            'lessons_learned': [
                f"Score de viabilidade: {evaluation.get('feasibility_score', 0)}",
                f"Confiança de criação: {evaluation.get('creation_confidence', 0)}"
            ]
        }

        context = {
            'opportunity_id': str(opportunity.id),
            'business_type': evaluation.get('recommended_business_type', '').value if evaluation.get('recommended_business_type') else '',
            'estimated_investment': float(evaluation.get('estimated_initial_investment', 0)),
            'risk_level': evaluation.get('risk_assessment', {}).get('risk_level', 'unknown')
        }

        await self.memory_system.store_episodic_memory(
            event_data=event_data,
            owner='auto_subsidiary_creator',
            context=context
        )

    async def create_subsidiary(self, evaluation: Dict[str, Any]) -> Optional[Subsidiary]:
        """
        Cria subsidiária baseada na avaliação

        Args:
            evaluation: Resultado da avaliação da oportunidade

        Returns:
            Subsidiary criada ou None se falhou
        """
        try:
            # Verificar se avaliação permite criação
            confidence = evaluation.get('creation_confidence', 0)
            if confidence < 0.6:
                return None

            # Verificar recursos disponíveis
            investment = evaluation.get('estimated_initial_investment', Decimal('0'))
            if investment > self.holding.cash_position:
                return None

            # Criar subsidiária
            business_type = evaluation.get('recommended_business_type')
            revenue_model = evaluation.get('recommended_revenue_model')

            subsidiary = Subsidiary(
                name=self._generate_subsidiary_name(evaluation),
                business_type=business_type,
                revenue_model=revenue_model,
                parent_holding_id=self.holding.id,
                strategic_importance=self._calculate_strategic_importance(evaluation),
                risk_level=evaluation.get('risk_assessment', {}).get('risk_level', 'medium')
            )

            # Adicionar à holding
            self.holding.add_subsidiary(subsidiary)

            # Atualizar finanças da holding
            self.holding.update_financials(Decimal('0'), Decimal('0'), investment)

            # Registrar criação bem-sucedida
            self.successful_creations += 1
            await self._log_creation_memory(subsidiary, evaluation, True)

            return subsidiary

        except Exception as e:
            self.failed_creations += 1
            await self._log_creation_memory(None, evaluation, False, str(e))
            return None

    def _generate_subsidiary_name(self, evaluation: Dict[str, Any]) -> str:
        """Gera nome para a subsidiária"""
        business_type = evaluation.get('recommended_business_type')
        opportunity_id = evaluation.get('opportunity_id')

        # Lógica simplificada - em produção poderia usar IA para gerar nomes criativos
        type_names = {
            BusinessType.SAAS: "Cloud",
            BusinessType.MARKETPLACE: "Market",
            BusinessType.ECOMMERCE: "Commerce",
            BusinessType.FINTECH: "Finance",
            BusinessType.HEALTHTECH: "Health",
            BusinessType.EDTECH: "Learn",
            BusinessType.PROPTECH: "Property",
            BusinessType.AUTOTECH: "Auto",
            BusinessType.GREENTECH: "Green",
            BusinessType.WEB3: "Chain"
        }

        base_name = type_names.get(business_type, "Corp")
        return f"{base_name} Subsidiary {opportunity_id[:8]}"

    def _calculate_strategic_importance(self, evaluation: Dict[str, Any]) -> int:
        """Calcula importância estratégica (1-10)"""
        confidence = evaluation.get('creation_confidence', 0)
        feasibility = evaluation.get('feasibility_score', 0)
        risk_level = evaluation.get('risk_assessment', {}).get('risk_level', 'high')

        base_score = int((confidence + feasibility) / 2 * 10)

        # Ajustar baseado no risco
        if risk_level == 'low':
            base_score += 1
        elif risk_level == 'high':
            base_score -= 1

        return max(1, min(10, base_score))

    async def _log_creation_memory(self, subsidiary: Optional[Subsidiary],
                                  evaluation: Dict[str, Any], success: bool, error: str = ""):
        """Registra memória da criação"""
        if success and subsidiary:
            event_data = {
                'event_type': 'subsidiary_creation',
                'description': f'Subsidiária criada com sucesso: {subsidiary.name}',
                'participants': ['auto_subsidiary_creator', 'holding_system'],
                'outcome': 'success',
                'lessons_learned': [
                    'Processo de criação automática funcionando',
                    f'Investimento inicial: ${evaluation.get("estimated_initial_investment", 0)}',
                    f'Tipo de negócio: {evaluation.get("recommended_business_type", "").value}'
                ]
            }
        else:
            event_data = {
                'event_type': 'subsidiary_creation_failed',
                'description': f'Falha na criação de subsidiária: {error}',
                'participants': ['auto_subsidiary_creator'],
                'outcome': 'failure',
                'lessons_learned': [
                    f'Motivo da falha: {error}',
                    'Revisar critérios de avaliação',
                    'Melhorar processo de validação de recursos'
                ]
            }

        context = {
            'evaluation_confidence': evaluation.get('creation_confidence', 0),
            'risk_level': evaluation.get('risk_assessment', {}).get('risk_level', 'unknown'),
            'business_type': evaluation.get('recommended_business_type', '').value if evaluation.get('recommended_business_type') else '',
            'investment_amount': float(evaluation.get('estimated_initial_investment', 0))
        }

        await self.memory_system.store_episodic_memory(
            event_data=event_data,
            owner='auto_subsidiary_creator',
            context=context
        )

    def get_creation_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas de criação"""
        return {
            'total_attempts': self.creation_attempts,
            'successful_creations': self.successful_creations,
            'failed_creations': self.failed_creations,
            'success_rate': self.successful_creations / max(1, self.creation_attempts),
            'active_subsidiaries_created': len([s for s in self.holding.subsidiaries if s.status == 'operational'])
        }