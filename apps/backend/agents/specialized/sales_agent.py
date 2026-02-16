"""
Sales Agent Avançado
Agente especializado em vendas e conversão de leads
"""

import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging
from dataclasses import dataclass

from backend.agents.base.agent_base import BaseAgent
from backend.core.value_objects import BusinessType, AgentRole
from backend.infrastructure.database.connection import get_database_connection

logger = logging.getLogger(__name__)


@dataclass
class LeadScore:
    """Scoring de lead"""
    score: int = 0
    qualification: str = "cold"  # cold, warm, hot
    buying_stage: str = "awareness"  # awareness, interest, consideration, decision
    next_action: str = ""
    priority: str = "low"

    def update_score(self, factors: Dict[str, int]):
        """Atualizar score baseado em fatores"""
        for factor, weight in factors.items():
            self.score += weight

        # Atualizar qualificação baseada no score
        if self.score >= 70:
            self.qualification = "hot"
            self.priority = "high"
        elif self.score >= 40:
            self.qualification = "warm"
            self.priority = "medium"
        else:
            self.qualification = "cold"
            self.priority = "low"


@dataclass
class SalesPipeline:
    """Pipeline de vendas"""
    stages: List[str] = None
    conversion_rates: Dict[str, float] = None
    average_deal_size: Decimal = Decimal('0')
    sales_cycle_length: int = 0  # dias

    def __post_init__(self):
        if self.stages is None:
            self.stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
        if self.conversion_rates is None:
            self.conversion_rates = {
                "Lead_Qualified": 0.3,
                "Qualified_Proposal": 0.6,
                "Proposal_Negotiation": 0.8,
                "Negotiation_Closed": 0.7
            }


class SalesAgent(BaseAgent):
    """
    Agente de Vendas Avançado
    Especializado em conversão de leads e gestão de pipeline
    """

    def __init__(self, agent_id: str, subsidiary_id: str = None):
        super().__init__(
            agent_id=agent_id,
            name="Sales Agent",
            role=AgentRole.SALES,
            subsidiary_id=subsidiary_id,
            specialization="Lead Conversion & Sales Pipeline Management"
        )

        # Capacidades específicas de vendas
        self.capabilities = [
            "lead_qualification",
            "pipeline_management",
            "sales_automation",
            "negotiation_support",
            "follow_up_sequences",
            "deal_closing",
            "customer_relationship_management",
            "revenue_forecasting",
            "sales_analytics",
            "objection_handling",
            "proposal_generation",
            "contract_management"
        ]

        # Estratégias de vendas por tipo de negócio
        self.sales_strategies = {
            BusinessType.SAAS: {
                "sales_cycle": 45,  # dias
                "deal_size": Decimal('15000'),  # ARR
                "qualification_criteria": ["Budget", "Authority", "Need", "Timeline"],
                "key_objections": ["Price", "Competition", "Implementation"],
                "success_factors": ["Product fit", "ROI demonstration", "References"]
            },
            BusinessType.ECOMMERCE: {
                "sales_cycle": 7,  # dias
                "deal_size": Decimal('2500'),  # Annual
                "qualification_criteria": ["Budget", "Urgency", "Competition"],
                "key_objections": ["Shipping", "Returns", "Trust"],
                "success_factors": ["Social proof", "Free trials", "Competitive pricing"]
            },
            BusinessType.MARKETPLACE: {
                "sales_cycle": 30,  # dias
                "deal_size": Decimal('50000'),  # Annual
                "qualification_criteria": ["Market size", "Network effects", "Competition"],
                "key_objections": ["Chicken and egg", "Trust", "Competition"],
                "success_factors": ["Critical mass", "Trust signals", "Network value"]
            },
            BusinessType.FINTECH: {
                "sales_cycle": 90,  # dias
                "deal_size": Decimal('75000'),  # Annual
                "qualification_criteria": ["Compliance", "Security", "Budget", "Timeline"],
                "key_objections": ["Regulation", "Security", "Integration"],
                "success_factors": ["Compliance certifications", "Security audits", "Scalability"]
            }
        }

    async def qualify_lead(self, lead_data: Dict[str, Any],
                          qualification_criteria: Dict[str, Any]) -> LeadScore:
        """
        Qualificar lead baseado em critérios específicos

        Args:
            lead_data: Dados do lead
            qualification_criteria: Critérios de qualificação

        Returns:
            LeadScore com qualificação completa
        """
        await self.reflect("Qualificando lead para vendas")

        lead_score = LeadScore()

        # Fatores de scoring
        scoring_factors = {}

        # BANT criteria (Budget, Authority, Need, Timeline)
        if lead_data.get("budget_available", False):
            scoring_factors["budget"] = 25

        if lead_data.get("decision_maker", False):
            scoring_factors["authority"] = 20

        if lead_data.get("clear_need", False):
            scoring_factors["need"] = 15

        if lead_data.get("timeline_urgency", False):
            scoring_factors["timeline"] = 10

        # Company size and industry fit
        company_size = lead_data.get("company_size", 0)
        if company_size > 100:
            scoring_factors["company_size"] = 15
        elif company_size > 50:
            scoring_factors["company_size"] = 10
        elif company_size > 10:
            scoring_factors["company_size"] = 5

        # Industry alignment
        target_industries = qualification_criteria.get("target_industries", [])
        if lead_data.get("industry") in target_industries:
            scoring_factors["industry_fit"] = 10

        # Engagement level
        engagement_score = lead_data.get("engagement_score", 0)
        if engagement_score > 80:
            scoring_factors["engagement"] = 15
        elif engagement_score > 50:
            scoring_factors["engagement"] = 10
        elif engagement_score > 20:
            scoring_factors["engagement"] = 5

        # Buying stage assessment
        lead_score.buying_stage = self._assess_buying_stage(lead_data)

        # Next action recommendation
        lead_score.next_action = self._recommend_next_action(lead_score.buying_stage, lead_score.score)

        # Aplicar scoring
        lead_score.update_score(scoring_factors)

        await self.learn("Lead qualificado", {
            "lead_id": lead_data.get("id"),
            "score": lead_score.score,
            "qualification": lead_score.qualification,
            "buying_stage": lead_score.buying_stage,
            "next_action": lead_score.next_action
        })

        return lead_score

    async def manage_sales_pipeline(self, subsidiary_id: str,
                                   pipeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerenciar pipeline de vendas completo

        Args:
            subsidiary_id: ID da subsidiária
            pipeline_data: Dados do pipeline

        Returns:
            Pipeline gerenciado e otimizado
        """
        await self.reflect("Gerenciando pipeline de vendas")

        # Criar pipeline
        pipeline = SalesPipeline(
            average_deal_size=Decimal(str(pipeline_data.get("average_deal_size", 15000))),
            sales_cycle_length=pipeline_data.get("sales_cycle_length", 45)
        )

        # Analisar pipeline atual
        current_pipeline = pipeline_data.get("current_deals", [])
        pipeline_analysis = await self._analyze_pipeline_health(current_pipeline, pipeline)

        # Otimizações recomendadas
        optimizations = await self._generate_pipeline_optimizations(pipeline_analysis)

        # Forecast de receita
        revenue_forecast = await self._calculate_revenue_forecast(current_pipeline, pipeline)

        result = {
            "subsidiary_id": subsidiary_id,
            "pipeline_stages": pipeline.stages,
            "current_deals": len(current_pipeline),
            "pipeline_health": pipeline_analysis,
            "optimizations": optimizations,
            "revenue_forecast": revenue_forecast,
            "conversion_rates": pipeline.conversion_rates,
            "average_deal_size": float(pipeline.average_deal_size),
            "sales_cycle_days": pipeline.sales_cycle_length
        }

        await self.learn("Pipeline de vendas gerenciado", result)
        return result

    async def execute_sales_automation(self, lead_id: str,
                                     sales_strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executar automação de vendas completa

        Args:
            lead_id: ID do lead
            sales_strategy: Estratégia de vendas

        Returns:
            Resultado da automação
        """
        await self.reflect("Executando automação de vendas")

        # Buscar dados do lead
        lead_data = await self._get_lead_data(lead_id)

        # Qualificar lead
        qualification = await self.qualify_lead(lead_data, sales_strategy.get("qualification_criteria", {}))

        if qualification.qualification == "cold":
            # Nurturing sequence para leads frios
            nurturing_result = await self._execute_nurturing_sequence(lead_id, lead_data)
            return {
                "action": "nurturing",
                "qualification": qualification.qualification,
                "sequence_started": True,
                "expected_follow_up": nurturing_result.get("next_contact")
            }

        # Para leads quentes, executar processo de vendas
        sales_process = await self._execute_sales_process(lead_id, lead_data, sales_strategy)

        result = {
            "lead_id": lead_id,
            "qualification": qualification.qualification,
            "sales_process": sales_process,
            "next_steps": sales_process.get("next_actions", []),
            "probability": sales_process.get("win_probability", 0),
            "expected_close_date": sales_process.get("expected_close_date")
        }

        await self.learn("Automação de vendas executada", result)
        return result

    async def handle_objections(self, objection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tratar objeções de vendas

        Args:
            objection_data: Dados da objeção

        Returns:
            Estratégia de tratamento
        """
        await self.reflect("Tratando objeção de vendas")

        objection_type = objection_data.get("objection_type", "")
        deal_context = objection_data.get("deal_context", {})

        # Estratégias de tratamento por tipo de objeção
        objection_strategies = {
            "price_too_high": {
                "response": "Demonstrar ROI e valor lifetime",
                "tactics": ["ROI calculator", "Competitor comparison", "Payment plans"],
                "success_rate": 0.65
            },
            "not_ready_to_buy": {
                "response": "Educar sobre benefícios e reduzir riscos",
                "tactics": ["Educational content", "Free trial", "Success stories"],
                "success_rate": 0.55
            },
            "competition": {
                "response": "Diferenciação por vantagens únicas",
                "tactics": ["Feature comparison", "Case studies", "Unique value props"],
                "success_rate": 0.70
            },
            "implementation_concerns": {
                "response": "Demonstrar facilidade de implementação",
                "tactics": ["Implementation timeline", "Support packages", "Training programs"],
                "success_rate": 0.60
            },
            "authority_issues": {
                "response": "Escalar para stakeholder certo",
                "tactics": ["Stakeholder mapping", "Executive sponsorship", "Reference calls"],
                "success_rate": 0.75
            }
        }

        strategy = objection_strategies.get(objection_type, {
            "response": "Investigar objeção específica",
            "tactics": ["Discovery questions", "Active listening", "Empathy"],
            "success_rate": 0.50
        })

        # Personalizar baseado no contexto
        personalized_strategy = await self._personalize_objection_strategy(strategy, deal_context)

        result = {
            "objection_type": objection_type,
            "strategy": personalized_strategy,
            "response_script": await self._generate_response_script(objection_type, deal_context),
            "follow_up_actions": personalized_strategy.get("follow_up_actions", []),
            "expected_success_rate": strategy.get("success_rate", 0.5)
        }

        await self.learn("Objeção tratada", result)
        return result

    async def generate_proposal(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerar proposta comercial completa

        Args:
            deal_data: Dados do negócio

        Returns:
            Proposta gerada
        """
        await self.reflect("Gerando proposta comercial")

        # Análise do negócio
        deal_analysis = await self._analyze_deal_requirements(deal_data)

        # Estrutura da proposta
        proposal = {
            "proposal_id": f"prop_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "client_info": deal_data.get("client_info", {}),
            "executive_summary": await self._generate_executive_summary(deal_analysis),
            "solution_overview": await self._describe_solution(deal_data),
            "pricing_structure": await self._calculate_pricing_structure(deal_data),
            "implementation_plan": await self._create_implementation_plan(deal_analysis),
            "roi_analysis": await self._calculate_roi_projection(deal_data),
            "terms_and_conditions": await self._generate_contract_terms(deal_data),
            "next_steps": self._define_proposal_next_steps(),
            "validity_period": 30,  # dias
            "created_at": datetime.utcnow().isoformat()
        }

        # Salvar proposta
        await self._save_proposal(proposal)

        await self.learn("Proposta gerada", {
            "proposal_id": proposal["proposal_id"],
            "deal_value": deal_data.get("expected_value", 0),
            "client": deal_data.get("client_info", {}).get("company", "Unknown")
        })

        return proposal

    async def forecast_revenue(self, subsidiary_id: str,
                             historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Prever receita baseada em dados históricos

        Args:
            subsidiary_id: ID da subsidiária
            historical_data: Dados históricos de vendas

        Returns:
            Forecast de receita
        """
        await self.reflect("Prevendo receita futura")

        # Análise de tendências
        trend_analysis = self._analyze_sales_trends(historical_data)

        # Modelos de forecast
        forecast_models = {
            "conservative": self._calculate_conservative_forecast(trend_analysis),
            "realistic": self._calculate_realistic_forecast(trend_analysis),
            "optimistic": self._calculate_optimistic_forecast(trend_analysis)
        }

        # Fatores de risco
        risk_factors = self._assess_forecast_risks(historical_data)

        # Cenários de receita
        revenue_scenarios = {
            "monthly": {},
            "quarterly": {},
            "annual": {}
        }

        for period in ["monthly", "quarterly", "annual"]:
            for model, forecast in forecast_models.items():
                revenue_scenarios[period][model] = forecast.get(period, 0)

        result = {
            "subsidiary_id": subsidiary_id,
            "forecast_period": "12 months",
            "trend_analysis": trend_analysis,
            "revenue_scenarios": revenue_scenarios,
            "risk_factors": risk_factors,
            "confidence_intervals": self._calculate_confidence_intervals(forecast_models),
            "key_assumptions": self._list_forecast_assumptions(),
            "recommendations": self._generate_forecast_recommendations(trend_analysis)
        }

        await self.learn("Forecast de receita gerado", result)
        return result

    # Métodos auxiliares

    def _assess_buying_stage(self, lead_data: Dict[str, Any]) -> str:
        """Avaliar estágio de compra do lead"""
        engagement_level = lead_data.get("engagement_score", 0)
        interactions = lead_data.get("total_interactions", 0)
        timeline = lead_data.get("decision_timeline", "")

        if engagement_level > 80 and interactions > 10 and timeline:
            return "decision"
        elif engagement_level > 60 and interactions > 5:
            return "consideration"
        elif engagement_level > 30:
            return "interest"
        else:
            return "awareness"

    def _recommend_next_action(self, buying_stage: str, score: int) -> str:
        """Recomendar próxima ação baseada no estágio"""
        actions = {
            "awareness": "Enviar conteúdo educativo",
            "interest": "Agendar demo ou webinar",
            "consideration": "Enviar proposta personalizada",
            "decision": "Negociar termos e fechar negócio"
        }

        base_action = actions.get(buying_stage, "Continuar nurturing")

        if score > 70:
            return f"URGENTE: {base_action}"
        elif score > 40:
            return f"PRIORIDADE: {base_action}"
        else:
            return f"NURTURING: {base_action}"

    async def _analyze_pipeline_health(self, deals: List[Dict[str, Any]],
                                     pipeline: SalesPipeline) -> Dict[str, Any]:
        """Analisar saúde do pipeline"""
        total_deals = len(deals)
        if total_deals == 0:
            return {"status": "empty", "recommendations": ["Adicionar mais leads ao pipeline"]}

        # Contagem por estágio
        stage_counts = {}
        for stage in pipeline.stages:
            stage_counts[stage] = 0

        for deal in deals:
            stage = deal.get("stage", "Lead")
            stage_counts[stage] = stage_counts.get(stage, 0) + 1

        # Métricas de saúde
        health_metrics = {
            "total_deals": total_deals,
            "deals_by_stage": stage_counts,
            "pipeline_velocity": self._calculate_pipeline_velocity(deals),
            "conversion_efficiency": self._calculate_conversion_efficiency(stage_counts, pipeline),
            "time_to_close": self._calculate_average_time_to_close(deals),
            "deal_size_distribution": self._analyze_deal_sizes(deals)
        }

        # Diagnóstico
        diagnosis = []
        if stage_counts.get("Closed Won", 0) < total_deals * 0.1:
            diagnosis.append("Taxa de fechamento baixa - revisar processo de qualificação")

        if health_metrics["time_to_close"] > pipeline.sales_cycle_length * 1.5:
            diagnosis.append("Ciclos de vendas muito longos - otimizar processo")

        return {
            "metrics": health_metrics,
            "diagnosis": diagnosis,
            "recommendations": self._generate_pipeline_recommendations(health_metrics)
        }

    async def _generate_pipeline_optimizations(self, pipeline_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar otimizações para o pipeline"""
        optimizations = []

        metrics = pipeline_analysis.get("metrics", {})

        # Otimizações baseadas em métricas
        if metrics.get("conversion_efficiency", 0) < 0.3:
            optimizations.append({
                "type": "qualification_improvement",
                "priority": "high",
                "action": "Implementar processo de qualificação mais rigoroso",
                "expected_impact": "+25% conversion efficiency"
            })

        if metrics.get("pipeline_velocity", 0) < 0.7:
            optimizations.append({
                "type": "velocity_acceleration",
                "priority": "medium",
                "action": "Reduzir tempo entre estágios do pipeline",
                "expected_impact": "+30% pipeline velocity"
            })

        return optimizations

    async def _calculate_revenue_forecast(self, deals: List[Dict[str, Any]],
                                        pipeline: SalesPipeline) -> Dict[str, Any]:
        """Calcular forecast de receita"""
        # Pipeline atual
        current_revenue = sum(deal.get("value", 0) for deal in deals if deal.get("stage") == "Closed Won")

        # Forecast baseado em conversões esperadas
        forecast = {
            "current_month": current_revenue,
            "next_month": self._project_monthly_revenue(deals, pipeline, 1),
            "quarter_end": self._project_quarterly_revenue(deals, pipeline),
            "year_end": self._project_annual_revenue(deals, pipeline)
        }

        return forecast

    async def _execute_nurturing_sequence(self, lead_id: str,
                                        lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Executar sequência de nurturing"""
        sequence = {
            "sequence_type": "cold_lead_nurturing",
            "steps": [
                {
                    "day": 0,
                    "action": "Email de boas-vindas",
                    "content": "Introdução aos benefícios"
                },
                {
                    "day": 7,
                    "action": "Conteúdo educativo",
                    "content": "Guia completo sobre o problema"
                },
                {
                    "day": 14,
                    "action": "Case study",
                    "content": "Exemplo de sucesso similar"
                },
                {
                    "day": 21,
                    "action": "Oferta especial",
                    "content": "Desconto para primeira implementação"
                }
            ],
            "next_contact": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }

        return sequence

    async def _execute_sales_process(self, lead_id: str, lead_data: Dict[str, Any],
                                   strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Executar processo completo de vendas"""
        process = {
            "current_stage": "initial_contact",
            "next_actions": [
                {
                    "action": "Agendar demo",
                    "priority": "high",
                    "timeline": "Próximos 2 dias"
                },
                {
                    "action": "Preparar proposta personalizada",
                    "priority": "medium",
                    "timeline": "Após demo"
                }
            ],
            "win_probability": 0.65,
            "expected_close_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "key_milestones": [
                {"milestone": "Demo realizada", "date": "Em 1 semana"},
                {"milestone": "Objeções endereçadas", "date": "Em 2 semanas"},
                {"milestone": "Proposta enviada", "date": "Em 3 semanas"},
                {"milestone": "Negociação final", "date": "Em 4 semanas"}
            ]
        }

        return process

    async def _personalize_objection_strategy(self, base_strategy: Dict[str, Any],
                                            deal_context: Dict[str, Any]) -> Dict[str, Any]:
        """Personalizar estratégia de objeção"""
        personalized = base_strategy.copy()

        # Adicionar ações de follow-up baseadas no contexto
        follow_up_actions = []

        if deal_context.get("deal_size", 0) > 50000:
            follow_up_actions.append("Envolver executive sponsor")

        if deal_context.get("competition_mentioned"):
            follow_up_actions.append("Preparar competitive analysis")

        personalized["follow_up_actions"] = follow_up_actions
        return personalized

    async def _generate_response_script(self, objection_type: str,
                                      deal_context: Dict[str, Any]) -> str:
        """Gerar script de resposta para objeção"""
        scripts = {
            "price_too_high": """
Cliente: "O preço está muito alto."

Resposta: "Entendo sua preocupação com o investimento. Na verdade, nossos clientes tipicamente veem retorno sobre o investimento em 3-6 meses. Vamos analisar juntos: considerando que você economizaria X horas por semana e reduziria Y em custos operacionais, o ROI seria de aproximadamente Z%. Posso mostrar como outros clientes similares conseguiram isso?"
            """,
            "not_ready_to_buy": """
Cliente: "Não estamos prontos para implementar agora."

Resposta: "Faz sentido planejar com cuidado. Muitos dos nossos clientes começaram exatamente assim - testando primeiro com um projeto piloto. Que tal começarmos pequeno? Podemos implementar em uma área específica e expandir conforme vocês virem os resultados. Assim, vocês têm controle total sobre o ritmo."
            """
        }

        return scripts.get(objection_type, "Script personalizado necessário para esta objeção.")

    async def _analyze_deal_requirements(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analisar requisitos do negócio"""
        return {
            "deal_size": deal_data.get("expected_value", 0),
            "implementation_complexity": "medium",
            "timeline_requirements": deal_data.get("timeline", "3 months"),
            "customization_needs": deal_data.get("customization", "minimal"),
            "support_level": "standard"
        }

    async def _generate_executive_summary(self, deal_analysis: Dict[str, Any]) -> str:
        """Gerar resumo executivo da proposta"""
        return f"""
Esta proposta apresenta uma solução abrangente para otimizar seus processos de negócio,
gerando um retorno estimado de R$ {deal_analysis['deal_size']:,} em valor presente.
A implementação será realizada em {deal_analysis['timeline_requirements']},
com suporte completo durante todo o processo.
        """

    async def _describe_solution(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Descrever solução proposta"""
        return {
            "core_solution": "Plataforma de automação empresarial",
            "key_features": ["Process automation", "AI-driven insights", "Real-time monitoring"],
            "benefits": ["50% reduction in manual tasks", "Improved decision making", "Scalable operations"],
            "differentiation": ["Proprietary AI technology", "Enterprise security", "Dedicated support"]
        }

    async def _calculate_pricing_structure(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular estrutura de preços"""
        base_value = deal_data.get("expected_value", 15000)
        return {
            "base_price": base_value,
            "discount_applied": 0,
            "final_price": base_value,
            "payment_terms": "50% upfront, 50% upon completion",
            "billing_cycle": "monthly",
            "currency": "BRL"
        }

    async def _create_implementation_plan(self, deal_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Criar plano de implementação"""
        return [
            {
                "phase": "Planning & Requirements",
                "duration": "2 weeks",
                "deliverables": ["Requirements document", "Project timeline", "Team assignments"]
            },
            {
                "phase": "Development & Configuration",
                "duration": "6 weeks",
                "deliverables": ["Custom solution", "Integration setup", "Testing environment"]
            },
            {
                "phase": "Deployment & Training",
                "duration": "2 weeks",
                "deliverables": ["Go-live support", "User training", "Documentation"]
            }
        ]

    async def _calculate_roi_projection(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular projeção de ROI"""
        investment = deal_data.get("expected_value", 15000)
        monthly_benefits = investment * 0.15  # 15% de economia mensal

        return {
            "investment": investment,
            "monthly_benefits": monthly_benefits,
            "payback_period_months": round(investment / monthly_benefits, 1),
            "roi_12_months": round((monthly_benefits * 12 - investment) / investment * 100, 1),
            "roi_24_months": round((monthly_benefits * 24 - investment) / investment * 100, 1)
        }

    async def _generate_contract_terms(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Gerar termos contratuais"""
        return {
            "contract_duration": "12 months",
            "termination_clauses": "30 days written notice",
            "intellectual_property": "Client retains all rights",
            "confidentiality": "Standard NDA terms",
            "support_sla": "99.9% uptime guarantee",
            "payment_terms": "Net 30 days"
        }

    def _define_proposal_next_steps(self) -> List[str]:
        """Definir próximos passos da proposta"""
        return [
            "Agendar reunião para apresentação detalhada",
            "Preparar demo ao vivo da plataforma",
            "Discutir cronograma de implementação",
            "Negociar termos específicos do contrato"
        ]

    def _analyze_sales_trends(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analisar tendências de vendas"""
        if not historical_data:
            return {"trend": "insufficient_data"}

        # Calcular médias móveis
        monthly_sales = {}
        for deal in historical_data:
            month = deal.get("close_date", "")[:7]  # YYYY-MM
            monthly_sales[month] = monthly_sales.get(month, 0) + deal.get("value", 0)

        months = sorted(monthly_sales.keys())[-6:]  # Últimos 6 meses
        values = [monthly_sales[m] for m in months]

        # Calcular tendência
        if len(values) >= 2:
            growth_rate = (values[-1] - values[0]) / values[0] if values[0] > 0 else 0
            trend = "growing" if growth_rate > 0.1 else "stable" if growth_rate > -0.1 else "declining"
        else:
            trend = "insufficient_data"

        return {
            "trend": trend,
            "growth_rate": growth_rate if 'growth_rate' in locals() else 0,
            "average_monthly": sum(values) / len(values) if values else 0,
            "best_month": months[values.index(max(values))] if values else None,
            "seasonality": self._detect_seasonality(values)
        }

    def _calculate_conservative_forecast(self, trend_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular forecast conservador"""
        base_monthly = trend_analysis.get("average_monthly", 0)
        return {
            "monthly": base_monthly * 0.9,  # -10%
            "quarterly": base_monthly * 0.9 * 3,
            "annual": base_monthly * 0.9 * 12
        }

    def _calculate_realistic_forecast(self, trend_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular forecast realista"""
        base_monthly = trend_analysis.get("average_monthly", 0)
        growth_factor = 1 + (trend_analysis.get("growth_rate", 0) * 0.5)  # 50% da tendência histórica
        return {
            "monthly": base_monthly * growth_factor,
            "quarterly": base_monthly * growth_factor * 3,
            "annual": base_monthly * growth_factor * 12
        }

    def _calculate_optimistic_forecast(self, trend_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular forecast otimista"""
        base_monthly = trend_analysis.get("average_monthly", 0)
        growth_factor = 1 + trend_analysis.get("growth_rate", 0)  # 100% da tendência histórica
        return {
            "monthly": base_monthly * growth_factor * 1.2,  # +20% adicional
            "quarterly": base_monthly * growth_factor * 1.2 * 3,
            "annual": base_monthly * growth_factor * 1.2 * 12
        }

    def _assess_forecast_risks(self, historical_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Avaliar riscos do forecast"""
        risks = []

        # Análise de volatilidade
        values = [deal.get("value", 0) for deal in historical_data[-12:]]
        if values:
            avg = sum(values) / len(values)
            variance = sum((v - avg) ** 2 for v in values) / len(values)
            std_dev = variance ** 0.5
            cv = std_dev / avg if avg > 0 else 0

            if cv > 0.5:  # Coeficiente de variação alto
                risks.append({
                    "type": "high_volatility",
                    "severity": "high",
                    "description": f"Alta volatilidade nas vendas (CV: {cv:.2f})",
                    "mitigation": "Diversificar fontes de receita"
                })

        # Análise de concentração
        if len(historical_data) > 0:
            top_client_percentage = max([deal.get("percentage_of_total", 0) for deal in historical_data], default=0)
            if top_client_percentage > 0.3:  # >30% de um cliente
                risks.append({
                    "type": "client_concentration",
                    "severity": "medium",
                    "description": f"Concentração alta em poucos clientes ({top_client_percentage:.1%})",
                    "mitigation": "Expandir base de clientes"
                })

        return risks

    def _calculate_confidence_intervals(self, forecast_models: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular intervalos de confiança"""
        conservative = forecast_models["conservative"]["monthly"]
        optimistic = forecast_models["optimistic"]["monthly"]
        realistic = forecast_models["realistic"]["monthly"]

        return {
            "monthly": {
                "low": conservative * 0.8,
                "realistic": realistic,
                "high": optimistic * 1.2,
                "confidence": "70%"
            }
        }

    def _list_forecast_assumptions(self) -> List[str]:
        """Listar premissas do forecast"""
        return [
            "Tendências históricas se mantêm",
            "Não há mudanças significativas no mercado",
            "Taxa de conversão permanece constante",
            "Não há entrada de novos concorrentes",
            "Orçamento de marketing permanece igual"
        ]

    def _generate_forecast_recommendations(self, trend_analysis: Dict[str, Any]) -> List[str]:
        """Gerar recomendações baseadas no forecast"""
        recommendations = []

        if trend_analysis.get("trend") == "declining":
            recommendations.append("Revisar estratégia de preços")
            recommendations.append("Investir em marketing para aumentar awareness")

        if trend_analysis.get("seasonality"):
            recommendations.append("Preparar para sazonalidade identificada")

        if trend_analysis.get("growth_rate", 0) < 0.05:
            recommendations.append("Acelerar esforços de vendas")

        return recommendations

    def _calculate_pipeline_velocity(self, deals: List[Dict[str, Any]]) -> float:
        """Calcular velocidade do pipeline"""
        if not deals:
            return 0

        # Deals que avançaram de estágio recentemente
        recent_advancements = sum(1 for deal in deals if deal.get("last_stage_change_days", 30) < 7)
        return recent_advancements / len(deals)

    def _calculate_conversion_efficiency(self, stage_counts: Dict[str, int],
                                       pipeline: SalesPipeline) -> float:
        """Calcular eficiência de conversão"""
        qualified = stage_counts.get("Qualified", 0)
        leads = stage_counts.get("Lead", 0)

        if leads == 0:
            return 0

        return qualified / leads

    def _calculate_average_time_to_close(self, deals: List[Dict[str, Any]]) -> float:
        """Calcular tempo médio para fechar negócio"""
        closed_deals = [deal for deal in deals if deal.get("stage") == "Closed Won"]

        if not closed_deals:
            return 0

        total_days = sum(deal.get("time_to_close_days", 0) for deal in closed_deals)
        return total_days / len(closed_deals)

    def _analyze_deal_sizes(self, deals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analisar distribuição de tamanhos dos negócios"""
        values = [deal.get("value", 0) for deal in deals]

        if not values:
            return {"distribution": "no_data"}

        avg = sum(values) / len(values)
        min_val = min(values)
        max_val = max(values)

        return {
            "average": avg,
            "minimum": min_val,
            "maximum": max_val,
            "distribution": "normal" if max_val / min_val < 10 else "wide_range"
        }

    def _generate_pipeline_recommendations(self, metrics: Dict[str, Any]) -> List[str]:
        """Gerar recomendações para o pipeline"""
        recommendations = []

        if metrics.get("conversion_efficiency", 0) < 0.3:
            recommendations.append("Melhorar processo de qualificação de leads")

        if metrics.get("time_to_close", 0) > 60:
            recommendations.append("Otimizar ciclo de vendas")

        return recommendations

    def _detect_seasonality(self, values: List[float]) -> Optional[str]:
        """Detectar sazonalidade nos dados"""
        if len(values) < 6:
            return None

        # Análise simples de padrões sazonais
        recent_avg = sum(values[-3:]) / 3
        older_avg = sum(values[:-3]) / len(values[:-3])

        if recent_avg > older_avg * 1.2:
            return "increasing_trend"
        elif recent_avg < older_avg * 0.8:
            return "decreasing_trend"

        return None

    def _project_monthly_revenue(self, deals: List[Dict[str, Any]],
                               pipeline: SalesPipeline, months_ahead: int) -> Decimal:
        """Projetar receita mensal"""
        # Lógica simplificada de projeção
        current_pipeline_value = sum(deal.get("value", 0) for deal in deals
                                   if deal.get("stage") in ["Proposal", "Negotiation"])

        conversion_rate = pipeline.conversion_rates.get("Negotiation_Closed", 0.7)
        projected_closes = current_pipeline_value * Decimal(str(conversion_rate))

        return projected_closes / Decimal('3')  # Distribui por 3 meses

    def _project_quarterly_revenue(self, deals: List[Dict[str, Any]],
                                 pipeline: SalesPipeline) -> Decimal:
        """Projetar receita trimestral"""
        monthly = self._project_monthly_revenue(deals, pipeline, 1)
        return monthly * 3

    def _project_annual_revenue(self, deals: List[Dict[str, Any]],
                              pipeline: SalesPipeline) -> Decimal:
        """Projetar receita anual"""
        monthly = self._project_monthly_revenue(deals, pipeline, 1)
        return monthly * 12

    # Métodos de persistência (simulados)
    async def _get_lead_data(self, lead_id: str) -> Dict[str, Any]:
        """Buscar dados do lead"""
        # Simulação
        return {
            "id": lead_id,
            "name": "João Silva",
            "company": "TechCorp",
            "job_title": "CTO",
            "company_size": 150,
            "industry": "Technology",
            "budget_available": True,
            "decision_maker": True,
            "clear_need": True,
            "timeline_urgency": True,
            "engagement_score": 75
        }

    async def _save_proposal(self, proposal: Dict[str, Any]):
        """Salvar proposta"""
        # Simulação de persistência
        pass