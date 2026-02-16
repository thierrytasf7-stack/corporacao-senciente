"""
Marketing Agent Avançado
Agente especializado em marketing digital e geração de leads
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
class CampaignMetrics:
    """Métricas de campanha de marketing"""
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: Decimal = Decimal('0')
    revenue: Decimal = Decimal('0')
    roi: float = 0.0

    @property
    def ctr(self) -> float:
        """Click-through rate"""
        return (self.clicks / self.impressions) * 100 if self.impressions > 0 else 0

    @property
    def conversion_rate(self) -> float:
        """Conversion rate"""
        return (self.conversions / self.clicks) * 100 if self.clicks > 0 else 0

    @property
    def cpa(self) -> Decimal:
        """Cost per acquisition"""
        return self.cost / self.conversions if self.conversions > 0 else Decimal('0')


class MarketingAgent(BaseAgent):
    """
    Agente de Marketing Avançado
    Especializado em geração de leads e otimização de campanhas
    """

    def __init__(self, agent_id: str, subsidiary_id: str = None):
        super().__init__(
            agent_id=agent_id,
            name="Marketing Agent",
            role=AgentRole.MARKETING,
            subsidiary_id=subsidiary_id,
            specialization="Digital Marketing & Lead Generation"
        )

        # Capacidades específicas do marketing
        self.capabilities = [
            "campaign_creation",
            "audience_targeting",
            "content_optimization",
            "a_b_testing",
            "performance_analytics",
            "lead_scoring",
            "conversion_optimization",
            "social_media_automation",
            "email_marketing",
            "seo_optimization",
            "paid_ads_management",
            "influencer_outreach"
        ]

        # Estratégias de marketing por tipo de negócio
        self.business_strategies = {
            BusinessType.SAAS: {
                "channels": ["LinkedIn", "Google Ads", "Content Marketing", "SEO"],
                "target_audience": "Empresas B2B, CTOs, Founders",
                "content_focus": "ROI, escalabilidade, integração",
                "pricing_strategy": "Freemium → Premium → Enterprise"
            },
            BusinessType.ECOMMERCE: {
                "channels": ["Facebook Ads", "Instagram", "TikTok", "Google Shopping"],
                "target_audience": "Consumidores finais",
                "content_focus": "Qualidade, preço, entrega rápida",
                "pricing_strategy": "Descontos dinâmicos, upsell"
            },
            BusinessType.MARKETPLACE: {
                "channels": ["SEO", "PPC", "Partnerships", "PR"],
                "target_audience": "Compradores e vendedores",
                "content_focus": "Liquidez, confiança, diversidade",
                "pricing_strategy": "Comissões otimizadas"
            },
            BusinessType.FINTECH: {
                "channels": ["LinkedIn", "Financial blogs", "Regulatory compliance"],
                "target_audience": "Profissionais financeiros, empresas",
                "content_focus": "Segurança, compliance, inovação",
                "pricing_strategy": "Enterprise focus, compliance-driven"
            }
        }

    async def analyze_market_opportunity(self, business_type: BusinessType,
                                       market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analisar oportunidade de mercado para marketing

        Args:
            business_type: Tipo de negócio
            market_data: Dados do mercado

        Returns:
            Análise de oportunidade
        """
        await self.reflect("Analisando oportunidade de mercado para marketing")

        strategy = self.business_strategies.get(business_type, {})

        analysis = {
            "market_size": market_data.get("tam", 0),
            "competition_level": self._assess_competition(market_data),
            "target_audience_size": self._estimate_audience_size(market_data),
            "channel_effectiveness": self._analyze_channel_effectiveness(strategy),
            "marketing_budget_needed": self._calculate_marketing_budget(market_data),
            "estimated_customer_acquisition_cost": self._estimate_cac(market_data),
            "go_to_market_strategy": self._create_gtm_strategy(strategy, market_data),
            "recommended_channels": strategy.get("channels", []),
            "content_strategy": self._develop_content_strategy(strategy),
            "conversion_funnel": self._design_conversion_funnel(strategy),
            "success_probability": self._calculate_success_probability(market_data)
        }

        await self.learn("Análise de mercado concluída", analysis)
        return analysis

    async def create_marketing_campaign(self, subsidiary_info: Dict[str, Any],
                                       target_audience: Dict[str, Any],
                                       budget: Decimal) -> Dict[str, Any]:
        """
        Criar campanha de marketing completa

        Args:
            subsidiary_info: Informações da subsidiária
            target_audience: Público-alvo
            budget: Orçamento disponível

        Returns:
            Campanha completa
        """
        await self.reflect("Criando campanha de marketing abrangente")

        business_type = BusinessType(subsidiary_info.get("business_type", "saas"))
        strategy = self.business_strategies.get(business_type, {})

        campaign = {
            "campaign_id": f"cmp_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "name": self._generate_campaign_name(subsidiary_info, target_audience),
            "objective": self._determine_campaign_objective(subsidiary_info),
            "target_audience": target_audience,
            "budget": budget,
            "channels": self._select_optimal_channels(strategy, budget, target_audience),
            "content_plan": await self._create_content_plan(subsidiary_info, strategy),
            "creative_assets": await self._design_creative_assets(subsidiary_info),
            "landing_pages": await self._create_landing_pages(subsidiary_info),
            "email_sequences": await self._design_email_sequences(target_audience),
            "social_media_plan": self._create_social_media_plan(strategy),
            "paid_ads_strategy": self._develop_paid_ads_strategy(budget, target_audience),
            "seo_strategy": await self._create_seo_strategy(subsidiary_info),
            "analytics_setup": self._setup_campaign_analytics(),
            "timeline": self._create_campaign_timeline(budget),
            "success_metrics": self._define_success_metrics(subsidiary_info),
            "budget_allocation": self._allocate_budget_across_channels(budget, strategy)
        }

        # Armazenar campanha no banco de dados
        await self._save_campaign(campaign)

        await self.learn("Campanha de marketing criada", campaign)
        return campaign

    async def optimize_campaign_performance(self, campaign_id: str,
                                          current_metrics: CampaignMetrics) -> Dict[str, Any]:
        """
        Otimizar performance da campanha baseada em métricas

        Args:
            campaign_id: ID da campanha
            current_metrics: Métricas atuais

        Returns:
            Recomendações de otimização
        """
        await self.reflect("Otimizando performance da campanha")

        optimizations = {
            "campaign_id": campaign_id,
            "current_performance": {
                "ctr": current_metrics.ctr,
                "conversion_rate": current_metrics.conversion_rate,
                "cpa": float(current_metrics.cpa),
                "roi": current_metrics.roi
            },
            "recommendations": [],
            "budget_adjustments": [],
            "creative_changes": [],
            "targeting_refinements": [],
            "channel_shifts": []
        }

        # Análise de CTR
        if current_metrics.ctr < 2.0:
            optimizations["recommendations"].append({
                "type": "creative_optimization",
                "priority": "high",
                "action": "Melhorar headlines e calls-to-action",
                "expected_impact": "+50% CTR"
            })

        # Análise de conversão
        if current_metrics.conversion_rate < 3.0:
            optimizations["recommendations"].append({
                "type": "landing_page_optimization",
                "priority": "high",
                "action": "Otimizar landing pages e formulários",
                "expected_impact": "+100% conversion rate"
            })

        # Análise de CPA
        if current_metrics.cpa > Decimal('50'):
            optimizations["recommendations"].append({
                "type": "targeting_refinement",
                "priority": "medium",
                "action": "Refinar segmentação de audiência",
                "expected_impact": "-30% CPA"
            })

        # Ajustes de orçamento baseados em performance
        optimizations["budget_adjustments"] = self._calculate_budget_reallocations(current_metrics)

        await self.learn("Otimização de campanha aplicada", optimizations)
        return optimizations

    async def generate_leads(self, campaign_id: str, target_count: int,
                           criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Gerar leads qualificados através de múltiplos canais

        Args:
            campaign_id: ID da campanha
            target_count: Número alvo de leads
            criteria: Critérios de qualificação

        Returns:
            Lista de leads gerados
        """
        await self.reflect("Gerando leads qualificados")

        leads = []

        # Estratégias de geração de leads
        strategies = [
            self._generate_content_leads,
            self._generate_social_leads,
            self._generate_email_leads,
            self._generate_ppc_leads,
            self._generate_seo_leads
        ]

        leads_per_strategy = target_count // len(strategies)

        for strategy_func in strategies:
            strategy_leads = await strategy_func(campaign_id, leads_per_strategy, criteria)
            leads.extend(strategy_leads)

            # Verificar se atingiu meta
            if len(leads) >= target_count:
                break

        # Scoring de leads
        scored_leads = await self._score_leads(leads, criteria)

        # Salvar leads no banco
        await self._save_leads(campaign_id, scored_leads)

        await self.learn(f"{len(scored_leads)} leads gerados", {
            "campaign_id": campaign_id,
            "target_count": target_count,
            "actual_count": len(scored_leads),
            "qualification_criteria": criteria
        })

        return scored_leads[:target_count]

    async def execute_automated_marketing(self, subsidiary_id: str) -> Dict[str, Any]:
        """
        Executar marketing automatizado completo

        Args:
            subsidiary_id: ID da subsidiária

        Returns:
            Resultado da execução automatizada
        """
        await self.reflect("Executando marketing automatizado")

        # Buscar informações da subsidiária
        subsidiary_info = await self._get_subsidiary_info(subsidiary_id)

        # Análise de mercado
        market_analysis = await self.analyze_market_opportunity(
            BusinessType(subsidiary_info.get("business_type", "saas")),
            subsidiary_info.get("market_data", {})
        )

        # Criar campanha
        campaign = await self.create_marketing_campaign(
            subsidiary_info,
            market_analysis.get("target_audience", {}),
            Decimal(str(market_analysis.get("marketing_budget_needed", 1000)))
        )

        # Iniciar geração de leads
        leads = await self.generate_leads(
            campaign["campaign_id"],
            100,  # Meta inicial de 100 leads
            {"business_type": subsidiary_info.get("business_type")}
        )

        result = {
            "subsidiary_id": subsidiary_id,
            "campaign_created": campaign["campaign_id"],
            "market_analysis": market_analysis,
            "leads_generated": len(leads),
            "automated_actions": [
                "Market analysis completed",
                "Campaign strategy developed",
                "Content plan created",
                "Lead generation initiated",
                "Analytics tracking enabled"
            ],
            "next_steps": [
                "Monitor campaign performance",
                "Optimize based on metrics",
                "Scale successful channels",
                "Nurture qualified leads"
            ]
        }

        await self.learn("Marketing automatizado executado", result)
        return result

    # Métodos auxiliares

    def _assess_competition(self, market_data: Dict[str, Any]) -> str:
        """Avaliar nível de competição"""
        competitors = market_data.get("competitors", 0)
        if competitors < 5:
            return "low"
        elif competitors < 20:
            return "medium"
        else:
            return "high"

    def _estimate_audience_size(self, market_data: Dict[str, Any]) -> int:
        """Estimar tamanho da audiência"""
        tam = market_data.get("tam", 1000000)
        penetration = market_data.get("market_penetration", 0.1)
        return int(tam * penetration)

    def _analyze_channel_effectiveness(self, strategy: Dict[str, Any]) -> Dict[str, float]:
        """Analisar efetividade dos canais"""
        channels = strategy.get("channels", [])
        effectiveness = {}

        # Simulação baseada em dados históricos
        channel_scores = {
            "LinkedIn": 8.5,
            "Google Ads": 9.0,
            "Facebook Ads": 7.8,
            "Content Marketing": 8.2,
            "SEO": 9.5,
            "Email Marketing": 8.0
        }

        for channel in channels:
            effectiveness[channel] = channel_scores.get(channel, 5.0)

        return effectiveness

    def _calculate_marketing_budget(self, market_data: Dict[str, Any]) -> Decimal:
        """Calcular orçamento necessário de marketing"""
        tam = market_data.get("tam", 1000000)
        cac_target = market_data.get("target_cac", 50)

        # Orçamento baseado em TAM e CAC desejado
        return Decimal(str(tam * 0.01 * cac_target))  # 1% do TAM × CAC

    def _estimate_cac(self, market_data: Dict[str, Any]) -> Decimal:
        """Estimar custo de aquisição de cliente"""
        competition = self._assess_competition(market_data)
        base_cac = {
            "low": Decimal('30'),
            "medium": Decimal('60'),
            "high": Decimal('120')
        }
        return base_cac.get(competition, Decimal('60'))

    def _create_gtm_strategy(self, strategy: Dict[str, Any],
                           market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar estratégia go-to-market"""
        return {
            "launch_sequence": ["MVP", "Beta", "Public Launch", "Scale"],
            "channel_priority": strategy.get("channels", [])[:3],
            "messaging_focus": strategy.get("content_focus", ""),
            "pricing_strategy": strategy.get("pricing_strategy", ""),
            "timeline_months": 6,
            "success_metrics": ["CAC < $50", "Conversion > 5%", "MRR > $10K"]
        }

    def _develop_content_strategy(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Desenvolver estratégia de conteúdo"""
        return {
            "content_pillars": [
                "ROI e resultados",
                "Casos de sucesso",
                "Tendências do mercado",
                "Guias práticos"
            ],
            "content_types": ["Blog posts", "Videos", "Webinars", "Infográficos"],
            "publishing_frequency": "2x/semana",
            "distribution_channels": strategy.get("channels", []),
            "seo_focus": True
        }

    def _design_conversion_funnel(self, strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Desenhar funil de conversão"""
        return [
            {
                "stage": "Awareness",
                "channels": ["SEO", "Content", "Social"],
                "goal": "Impressions",
                "target_metric": "100K/month"
            },
            {
                "stage": "Interest",
                "channels": ["Email", "Blog", "Webinars"],
                "goal": "Leads",
                "target_metric": "5K/month"
            },
            {
                "stage": "Consideration",
                "channels": ["Demo", "Case studies", "Consultation"],
                "goal": "Qualified leads",
                "target_metric": "500/month"
            },
            {
                "stage": "Decision",
                "channels": ["Sales calls", "Proposals", "Trials"],
                "goal": "Customers",
                "target_metric": "50/month"
            }
        ]

    def _calculate_success_probability(self, market_data: Dict[str, Any]) -> float:
        """Calcular probabilidade de sucesso"""
        base_probability = 0.7

        # Ajustes baseados em fatores
        competition_factor = {"low": 1.2, "medium": 1.0, "high": 0.8}
        competition = self._assess_competition(market_data)

        tam_factor = min(1.5, market_data.get("tam", 1000000) / 10000000)  # Max 1.5x para TAM > $10M

        return base_probability * competition_factor.get(competition, 1.0) * tam_factor

    async def _create_content_plan(self, subsidiary_info: Dict[str, Any],
                                 strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Criar plano de conteúdo"""
        content_plan = []
        content_types = ["blog_post", "social_media", "email", "video", "webinar"]

        for i in range(12):  # 12 semanas
            week_content = {
                "week": i + 1,
                "content": []
            }

            for content_type in content_types:
                if i % 3 == 0 or content_type in ["blog_post", "social_media"]:  # Frequência variável
                    week_content["content"].append({
                        "type": content_type,
                        "topic": f"{strategy.get('content_focus', 'Business')} - Semana {i+1}",
                        "target_audience": strategy.get('target_audience', 'Business users'),
                        "goal": "Lead generation",
                        "channels": ["Website", "LinkedIn", "Twitter"]
                    })

            content_plan.append(week_content)

        return content_plan

    async def _design_creative_assets(self, subsidiary_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Designar assets criativos"""
        return [
            {
                "type": "logo",
                "description": f"Logo da {subsidiary_info.get('name', 'Subsidiária')}",
                "usage": ["Website", "Social media", "Business cards"],
                "colors": ["#1f2937", "#3b82f6", "#10b981"]
            },
            {
                "type": "brand_guidelines",
                "description": "Guia de identidade visual",
                "usage": ["Marketing materials", "Presentations"],
                "elements": ["Typography", "Color palette", "Imagery style"]
            },
            {
                "type": "hero_banner",
                "description": "Banner principal do website",
                "usage": ["Homepage", "Landing pages"],
                "dimensions": ["1920x1080", "1200x600"]
            }
        ]

    async def _create_landing_pages(self, subsidiary_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Criar landing pages"""
        return [
            {
                "name": "Homepage",
                "url": "/",
                "purpose": "Brand awareness",
                "conversion_goal": "Newsletter signup",
                "elements": ["Hero section", "Features", "Testimonials", "CTA"]
            },
            {
                "name": "Product Demo",
                "url": "/demo",
                "purpose": "Lead generation",
                "conversion_goal": "Demo request",
                "elements": ["Video demo", "Features list", "Contact form"]
            },
            {
                "name": "Pricing",
                "url": "/pricing",
                "purpose": "Revenue generation",
                "conversion_goal": "Free trial signup",
                "elements": ["Pricing table", "Feature comparison", "FAQ"]
            }
        ]

    async def _design_email_sequences(self, target_audience: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Designar sequências de email"""
        return [
            {
                "name": "Welcome Series",
                "trigger": "New signup",
                "emails": [
                    {"day": 0, "subject": "Bem-vindo! Vamos começar", "goal": "Engagement"},
                    {"day": 3, "subject": "Dica #1: Como maximizar resultados", "goal": "Education"},
                    {"day": 7, "subject": "Seu progresso na primeira semana", "goal": "Retention"}
                ]
            },
            {
                "name": "Nurture Campaign",
                "trigger": "Inactive user",
                "emails": [
                    {"day": 0, "subject": "Sentimos sua falta!", "goal": "Re-engagement"},
                    {"day": 7, "subject": "Novos recursos disponíveis", "goal": "Feature adoption"},
                    {"day": 14, "subject": "Oferta especial para você", "goal": "Conversion"}
                ]
            }
        ]

    def _create_social_media_plan(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Criar plano de mídia social"""
        return {
            "platforms": ["LinkedIn", "Twitter", "Facebook"],
            "posting_schedule": {
                "LinkedIn": "3x/week",
                "Twitter": "5x/week",
                "Facebook": "2x/week"
            },
            "content_mix": {
                "educational": 40,
                "promotional": 30,
                "engagement": 20,
                "user_generated": 10
            },
            "hashtag_strategy": ["#BusinessAutomation", "#AISolutions", "#TechInnovation"]
        }

    def _develop_paid_ads_strategy(self, budget: Decimal,
                                 target_audience: Dict[str, Any]) -> Dict[str, Any]:
        """Desenvolver estratégia de anúncios pagos"""
        return {
            "platforms": ["Google Ads", "LinkedIn Ads", "Facebook Ads"],
            "budget_allocation": {
                "Google Ads": budget * 0.4,
                "LinkedIn Ads": budget * 0.4,
                "Facebook Ads": budget * 0.2
            },
            "targeting": {
                "job_titles": ["CEO", "CTO", "Founder"],
                "company_size": "50-1000",
                "industries": ["Technology", "Consulting", "Manufacturing"]
            },
            "ad_formats": ["Search", "Display", "Video", "Lead gen forms"],
            "bidding_strategy": "Target CPA",
            "target_cpa": 50.0
        }

    async def _create_seo_strategy(self, subsidiary_info: Dict[str, Any]) -> Dict[str, Any]:
        """Criar estratégia SEO"""
        return {
            "keyword_research": {
                "primary_keywords": [subsidiary_info.get('name', 'business automation')],
                "secondary_keywords": ["AI solutions", "business intelligence"],
                "long_tail_keywords": ["how to automate business processes", "AI for small businesses"]
            },
            "on_page_optimization": {
                "title_tags": True,
                "meta_descriptions": True,
                "header_tags": True,
                "internal_linking": True
            },
            "off_page_optimization": {
                "backlink_building": True,
                "social_signals": True,
                "local_citations": False
            },
            "content_strategy": {
                "blog_posts": "2/week",
                "pillar_content": "1/month",
                "guest_posting": "2/month"
            }
        }

    def _setup_campaign_analytics(self) -> Dict[str, Any]:
        """Configurar analytics da campanha"""
        return {
            "tools": ["Google Analytics", "Facebook Pixel", "LinkedIn Insight Tag"],
            "tracking_parameters": ["utm_source", "utm_medium", "utm_campaign"],
            "conversion_goals": ["Lead generation", "Trial signup", "Purchase"],
            "attribution_model": "First-click attribution",
            "reporting_frequency": "Daily"
        }

    def _create_campaign_timeline(self, budget: Decimal) -> Dict[str, Any]:
        """Criar timeline da campanha"""
        return {
            "total_duration_weeks": 12,
            "phases": [
                {"name": "Setup", "duration": 1, "budget_percent": 10},
                {"name": "Launch", "duration": 4, "budget_percent": 60},
                {"name": "Optimization", "duration": 4, "budget_percent": 20},
                {"name": "Scale", "duration": 3, "budget_percent": 10}
            ],
            "milestones": [
                {"week": 2, "goal": "First 100 leads"},
                {"week": 6, "goal": "1000 leads, positive ROI"},
                {"week": 12, "goal": "5000 leads, profitable campaign"}
            ]
        }

    def _define_success_metrics(self, subsidiary_info: Dict[str, Any]) -> Dict[str, Any]:
        """Definir métricas de sucesso"""
        return {
            "primary_metrics": {
                "cac": "< $50",
                "conversion_rate": "> 3%",
                "roi": "> 300%"
            },
            "secondary_metrics": {
                "ctr": "> 2%",
                "engagement_rate": "> 5%",
                "bounce_rate": "< 30%"
            },
            "business_metrics": {
                "leads_generated": "> 100/month",
                "qualified_leads": "> 20/month",
                "customers_acquired": "> 5/month"
            },
            "tracking_period": "Monthly",
            "benchmark_against": "Industry averages"
        }

    def _allocate_budget_across_channels(self, budget: Decimal,
                                       strategy: Dict[str, Any]) -> Dict[str, Decimal]:
        """Alocar orçamento entre canais"""
        channels = strategy.get("channels", [])
        if not channels:
            return {}

        # Alocação básica igualitária
        per_channel = budget / len(channels)
        allocation = {}

        for channel in channels:
            allocation[channel] = per_channel

        return allocation

    def _generate_campaign_name(self, subsidiary_info: Dict[str, Any],
                              target_audience: Dict[str, Any]) -> str:
        """Gerar nome da campanha"""
        business_type = subsidiary_info.get("business_type", "business")
        audience = target_audience.get("primary_segment", "professionals")

        return f"{business_type.title()} Growth - {audience.title()} Campaign"

    def _determine_campaign_objective(self, subsidiary_info: Dict[str, Any]) -> str:
        """Determinar objetivo da campanha"""
        business_type = subsidiary_info.get("business_type", "saas")

        objectives = {
            "saas": "Lead generation and trial signups",
            "ecommerce": "Direct sales and traffic",
            "marketplace": "User acquisition on both sides",
            "fintech": "Lead generation with compliance focus"
        }

        return objectives.get(business_type, "Brand awareness and lead generation")

    def _select_optimal_channels(self, strategy: Dict[str, Any], budget: Decimal,
                               target_audience: Dict[str, Any]) -> List[str]:
        """Selecionar canais ótimos"""
        all_channels = strategy.get("channels", [])
        audience_type = target_audience.get("type", "b2b")

        # Filtrar canais baseado no orçamento
        if budget < Decimal('1000'):
            return all_channels[:2]  # Apenas 2 canais para orçamento pequeno
        elif budget < Decimal('5000'):
            return all_channels[:3]  # 3 canais para orçamento médio
        else:
            return all_channels  # Todos os canais

    def _calculate_budget_reallocations(self, metrics: CampaignMetrics) -> List[Dict[str, Any]]:
        """Calcular realocações de orçamento"""
        reallocations = []

        # Lógica baseada em performance
        if metrics.ctr > 3.0:
            reallocations.append({
                "channel": "High CTR channel",
                "action": "Increase budget",
                "percentage": 20
            })

        if metrics.conversion_rate < 2.0:
            reallocations.append({
                "channel": "Low converting channel",
                "action": "Decrease budget",
                "percentage": -15
            })

        return reallocations

    async def _score_leads(self, leads: List[Dict[str, Any]],
                         criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Aplicar scoring aos leads"""
        scored_leads = []

        for lead in leads:
            score = 0

            # Scoring baseado em critérios
            if lead.get("company_size", 0) > 50:
                score += 20  # Empresa maior

            if lead.get("job_title", "").lower() in ["ceo", "cto", "founder"]:
                score += 30  # Cargo de decisão

            if lead.get("industry") == criteria.get("target_industry"):
                score += 15  # Indústria correta

            if lead.get("previous_interactions", 0) > 0:
                score += 10  # Já interagiu antes

            lead["score"] = score
            lead["qualification"] = "hot" if score > 50 else "warm" if score > 25 else "cold"

            scored_leads.append(lead)

        # Ordenar por score
        scored_leads.sort(key=lambda x: x["score"], reverse=True)

        return scored_leads

    # Métodos de geração de leads (simulados para demonstração)
    async def _generate_content_leads(self, campaign_id: str, count: int,
                                    criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar leads através de content marketing"""
        leads = []
        for i in range(count // 4):  # 25% dos leads vêm do content
            leads.append({
                "source": "Content Marketing",
                "campaign_id": campaign_id,
                "name": f"Lead {i+1}",
                "email": f"lead{i}@company.com",
                "company": f"Company {i+1}",
                "job_title": "Marketing Manager",
                "company_size": 150,
                "industry": "Technology"
            })
        return leads

    async def _generate_social_leads(self, campaign_id: str, count: int,
                                   criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar leads através de social media"""
        leads = []
        for i in range(count // 3):  # 33% dos leads vêm do social
            leads.append({
                "source": "Social Media",
                "campaign_id": campaign_id,
                "name": f"Social Lead {i+1}",
                "email": f"social{i}@company.com",
                "company": f"Social Company {i+1}",
                "job_title": "CEO",
                "company_size": 50,
                "industry": "Consulting"
            })
        return leads

    async def _generate_email_leads(self, campaign_id: str, count: int,
                                  criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar leads através de email marketing"""
        leads = []
        for i in range(count // 6):  # 16% dos leads vêm do email
            leads.append({
                "source": "Email Marketing",
                "campaign_id": campaign_id,
                "name": f"Email Lead {i+1}",
                "email": f"email{i}@company.com",
                "company": f"Email Company {i+1}",
                "job_title": "CTO",
                "company_size": 500,
                "industry": "Finance"
            })
        return leads

    async def _generate_ppc_leads(self, campaign_id: str, count: int,
                                criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar leads através de PPC"""
        leads = []
        for i in range(count // 4):  # 25% dos leads vêm do PPC
            leads.append({
                "source": "PPC/Google Ads",
                "campaign_id": campaign_id,
                "name": f"PPC Lead {i+1}",
                "email": f"ppc{i}@company.com",
                "company": f"PPC Company {i+1}",
                "job_title": "Founder",
                "company_size": 25,
                "industry": "E-commerce"
            })
        return leads

    async def _generate_seo_leads(self, campaign_id: str, count: int,
                                criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gerar leads através de SEO"""
        leads = []
        for i in range(count // 12):  # 8% dos leads vêm do SEO
            leads.append({
                "source": "SEO/Organic Search",
                "campaign_id": campaign_id,
                "name": f"SEO Lead {i+1}",
                "email": f"seo{i}@company.com",
                "company": f"SEO Company {i+1}",
                "job_title": "Operations Manager",
                "company_size": 75,
                "industry": "Manufacturing"
            })
        return leads

    # Métodos de persistência (simulados)
    async def _save_campaign(self, campaign: Dict[str, Any]):
        """Salvar campanha no banco"""
        logger.info(f"Salvando campanha: {campaign['campaign_id']}")

    async def _save_leads(self, campaign_id: str, leads: List[Dict[str, Any]]):
        """Salvar leads no banco"""
        logger.info(f"Salvando {len(leads)} leads da campanha {campaign_id}")

    async def _get_subsidiary_info(self, subsidiary_id: str) -> Dict[str, Any]:
        """Buscar informações da subsidiária"""
        # Simulação
        return {
            "id": subsidiary_id,
            "name": "TechFlow Solutions",
            "business_type": "saas",
            "market_data": {
                "tam": 5000000,
                "competitors": 15,
                "target_cac": 45
            }
        }