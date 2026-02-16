"""
Revenue Model Value Object
Modelos de receita suportados pelas subsidiárias
"""

from enum import Enum
from typing import Dict, List, Any
from pydantic import BaseModel, Field
from decimal import Decimal


class RevenueModel(Enum):
    """Modelos de receita disponíveis"""
    FREEMIUM = "freemium"
    SUBSCRIPTION = "subscription"
    TRANSACTION_FEES = "transaction_fees"
    LICENSING = "licensing"
    ADVERTISING = "advertising"
    MARKETPLACE_COMMISSION = "marketplace_commission"
    DATA_MONETIZATION = "data_monetization"
    SERVICE_BASED = "service_based"
    HYBRID = "hybrid"

    def get_revenue_characteristics(self) -> Dict[str, Any]:
        """Características de receita do modelo"""
        characteristics = {
            RevenueModel.FREEMIUM: {
                "conversion_rate_target": 0.05,  # 5% dos usuários gratuitos convertem
                "ltv_cac_ratio_target": 3.0,
                "churn_rate_target": 0.15,  # 15% churn mensal
                "paywall_features": ["advanced_analytics", "unlimited_storage", "priority_support"],
                "pricing_tiers": [0, 29, 99, 299],  # USD/mês
                "scalability_factors": ["user_base", "conversion_optimization", "feature_adoption"]
            },
            RevenueModel.SUBSCRIPTION: {
                "conversion_rate_target": 0.10,  # 10% dos visitantes convertem
                "ltv_cac_ratio_target": 4.0,
                "churn_rate_target": 0.08,  # 8% churn mensal
                "paywall_features": ["core_functionality", "advanced_features", "premium_support"],
                "pricing_tiers": [19, 49, 149, 499],  # USD/mês
                "scalability_factors": ["user_growth", "feature_expansion", "market_penetration"]
            },
            RevenueModel.TRANSACTION_FEES: {
                "conversion_rate_target": 0.08,
                "ltv_cac_ratio_target": 5.0,
                "churn_rate_target": 0.12,
                "paywall_features": ["transaction_processing", "fraud_protection", "reporting"],
                "pricing_tiers": [0.029, 0.039, 0.059],  # % por transação
                "scalability_factors": ["transaction_volume", "market_share", "regulatory_compliance"]
            },
            RevenueModel.LICENSING: {
                "conversion_rate_target": 0.03,
                "ltv_cac_ratio_target": 6.0,
                "churn_rate_target": 0.05,
                "paywall_features": ["api_access", "white_label", "custom_integration"],
                "pricing_tiers": [500, 2000, 10000],  # USD/mês
                "scalability_factors": ["integration_complexity", "market_adoption", "support_demand"]
            },
            RevenueModel.ADVERTISING: {
                "conversion_rate_target": 0.02,
                "ltv_cac_ratio_target": 2.0,
                "churn_rate_target": 0.25,
                "paywall_features": ["ad_free_experience", "premium_content", "analytics"],
                "pricing_tiers": [0, 4.99, 9.99],  # USD/mês
                "scalability_factors": ["user_engagement", "audience_quality", "advertiser_demand"]
            },
            RevenueModel.MARKETPLACE_COMMISSION: {
                "conversion_rate_target": 0.15,
                "ltv_cac_ratio_target": 7.0,
                "churn_rate_target": 0.18,
                "paywall_features": ["featured_listings", "analytics", "priority_matching"],
                "pricing_tiers": [0.05, 0.10, 0.20],  # % da transação
                "scalability_factors": ["gmv", "network_liquidity", "matching_efficiency"]
            },
            RevenueModel.DATA_MONETIZATION: {
                "conversion_rate_target": 0.04,
                "ltv_cac_ratio_target": 8.0,
                "churn_rate_target": 0.10,
                "paywall_features": ["raw_data_export", "custom_analytics", "api_limits"],
                "pricing_tiers": [99, 499, 2499],  # USD/mês
                "scalability_factors": ["data_volume", "data_quality", "privacy_compliance"]
            },
            RevenueModel.SERVICE_BASED: {
                "conversion_rate_target": 0.06,
                "ltv_cac_ratio_target": 3.5,
                "churn_rate_target": 0.20,
                "paywall_features": ["basic_service", "premium_service", "dedicated_support"],
                "pricing_tiers": [500, 1500, 5000],  # USD/mês
                "scalability_factors": ["service_complexity", "client_base", "operational_efficiency"]
            },
            RevenueModel.HYBRID: {
                "conversion_rate_target": 0.08,
                "ltv_cac_ratio_target": 4.5,
                "churn_rate_target": 0.12,
                "paywall_features": ["combined_benefits", "flexible_pricing", "custom_solutions"],
                "pricing_tiers": [49, 199, 999],  # USD/mês
                "scalability_factors": ["market_demand", "competitive_positioning", "operational_flexibility"]
            }
        }

        return characteristics.get(self, {})

    def get_estimated_arpu(self) -> Decimal:
        """ARPU (Average Revenue Per User) estimado"""
        arpu_estimates = {
            RevenueModel.FREEMIUM: Decimal('15.50'),
            RevenueModel.SUBSCRIPTION: Decimal('89.00'),
            RevenueModel.TRANSACTION_FEES: Decimal('45.00'),
            RevenueModel.LICENSING: Decimal('1250.00'),
            RevenueModel.ADVERTISING: Decimal('4.20'),
            RevenueModel.MARKETPLACE_COMMISSION: Decimal('67.50'),
            RevenueModel.DATA_MONETIZATION: Decimal('350.00'),
            RevenueModel.SERVICE_BASED: Decimal('1200.00'),
            RevenueModel.HYBRID: Decimal('145.00')
        }

        return arpu_estimates.get(self, Decimal('50.00'))

    def get_estimated_ltv(self) -> Decimal:
        """LTV (Lifetime Value) estimado baseado no ARPU e churn"""
        arpu = self.get_estimated_arpu()
        characteristics = self.get_revenue_characteristics()
        churn_rate = characteristics.get('churn_rate_target', 0.15)

        # LTV = ARPU / Churn Rate (simplificado)
        if churn_rate > 0:
            return Decimal(str(arpu / churn_rate)).quantize(Decimal('0.01'))
        return Decimal('0')

    def get_optimal_customer_segments(self) -> List[str]:
        """Segmentos de clientes ideais para este modelo"""
        segments = {
            RevenueModel.FREEMIUM: [
                "startups", "individual_professionals", "small_teams",
                "educational_institutions", "non_profit_organizations"
            ],
            RevenueModel.SUBSCRIPTION: [
                "small_medium_businesses", "growing_startups", "professional_services",
                "consulting_firms", "managed_service_providers"
            ],
            RevenueModel.TRANSACTION_FEES: [
                "ecommerce_businesses", "payment_processors", "financial_services",
                "marketplaces", "logistics_companies"
            ],
            RevenueModel.LICENSING: [
                "large_enterprises", "system_integrators", "technology_vendors",
                "platform_providers", "government_agencies"
            ],
            RevenueModel.ADVERTISING: [
                "media_companies", "content_publishers", "social_networks",
                "gaming_companies", "entertainment_businesses"
            ],
            RevenueModel.MARKETPLACE_COMMISSION: [
                "two_sided_marketplaces", "service_marketplaces", "product_marketplaces",
                "freelance_platforms", "booking_platforms"
            ],
            RevenueModel.DATA_MONETIZATION: [
                "data_providers", "analytics_companies", "research_organizations",
                "marketing_agencies", "consulting_firms"
            ],
            RevenueModel.SERVICE_BASED: [
                "professional_services", "consulting_firms", "implementation_partners",
                "managed_services", "outsourcing_companies"
            ],
            RevenueModel.HYBRID: [
                "diversified_businesses", "platform_companies", "enterprise_software",
                "cloud_services", "digital_transformation_consultants"
            ]
        }

        return segments.get(self, ["general_businesses"])

    def get_scaling_strategy(self) -> Dict[str, Any]:
        """Estratégia de escalabilidade para o modelo"""
        strategies = {
            RevenueModel.FREEMIUM: {
                "focus_areas": ["conversion_optimization", "feature_gating", "user_engagement"],
                "critical_metrics": ["conversion_rate", "feature_adoption", "user_engagement"],
                "bottlenecks": ["server_capacity", "support_costs", "free_user_abuse"],
                "optimization_levers": ["pricing_experiments", "feature_optimization", "support_automation"]
            },
            RevenueModel.SUBSCRIPTION: {
                "focus_areas": ["customer_acquisition", "retention_optimization", "upselling"],
                "critical_metrics": ["monthly_churn", "expansion_revenue", "customer_ltv"],
                "bottlenecks": ["sales_capacity", "onboarding_process", "contract_complexity"],
                "optimization_levers": ["sales_automation", "self_service_onboarding", "contract_simplification"]
            },
            RevenueModel.TRANSACTION_FEES: {
                "focus_areas": ["volume_growth", "fee_optimization", "risk_management"],
                "critical_metrics": ["transaction_volume", "fee_income", "chargeback_rate"],
                "bottlenecks": ["processing_capacity", "fraud_detection", "regulatory_compliance"],
                "optimization_levers": ["infrastructure_scaling", "ai_fraud_detection", "compliance_automation"]
            },
            RevenueModel.LICENSING: {
                "focus_areas": ["enterprise_sales", "integration_support", "customization"],
                "critical_metrics": ["deal_size", "sales_cycle", "customer_satisfaction"],
                "bottlenecks": ["sales_team_capacity", "technical_resources", "contract_negotiations"],
                "optimization_levers": ["sales_enablement", "technical_pre_sales", "contract_automation"]
            },
            RevenueModel.ADVERTISING: {
                "focus_areas": ["audience_growth", "engagement_optimization", "advertiser_acquisition"],
                "critical_metrics": ["daily_active_users", "engagement_rate", "arpu_from_ads"],
                "bottlenecks": ["content_creation", "audience_quality", "advertiser_relations"],
                "optimization_levers": ["content_automation", "audience_targeting", "advertiser_platform"]
            },
            RevenueModel.MARKETPLACE_COMMISSION: {
                "focus_areas": ["network_growth", "liquidity_optimization", "trust_building"],
                "critical_metrics": ["gmv", "take_rate", "network_liquidity_score"],
                "bottlenecks": ["supply_demand_imbalance", "trust_issues", "operational_complexity"],
                "optimization_levers": ["network_growth_initiatives", "reputation_system", "process_automation"]
            },
            RevenueModel.DATA_MONETIZATION: {
                "focus_areas": ["data_quality", "privacy_compliance", "api_development"],
                "critical_metrics": ["data_volume", "api_usage", "revenue_per_data_point"],
                "bottlenecks": ["data_collection", "privacy_regulations", "api_performance"],
                "optimization_levers": ["data_pipeline_automation", "privacy_by_design", "api_optimization"]
            },
            RevenueModel.SERVICE_BASED: {
                "focus_areas": ["service_delivery", "client_relationships", "operational_efficiency"],
                "critical_metrics": ["project_completion_rate", "client_satisfaction", "profit_margin"],
                "bottlenecks": ["resource_capacity", "project_complexity", "client_expectations"],
                "optimization_levers": ["resource_planning", "process_standardization", "client_communication"]
            },
            RevenueModel.HYBRID: {
                "focus_areas": ["model_optimization", "customer_segmentation", "revenue_diversification"],
                "critical_metrics": ["revenue_mix", "customer_segment_performance", "overall_ltv"],
                "bottlenecks": ["model_complexity", "segment_conflicts", "operational_overhead"],
                "optimization_levers": ["revenue_model_testing", "segment_optimization", "process_integration"]
            }
        }

        return strategies.get(self, {
            "focus_areas": ["general_growth"],
            "critical_metrics": ["revenue", "customers"],
            "bottlenecks": ["capacity"],
            "optimization_levers": ["automation"]
        })

    def requires_subscription_billing(self) -> bool:
        """Verifica se o modelo requer sistema de cobrança por assinatura"""
        subscription_models = [
            RevenueModel.FREEMIUM,
            RevenueModel.SUBSCRIPTION,
            RevenueModel.LICENSING,
            RevenueModel.SERVICE_BASED,
            RevenueModel.HYBRID
        ]

        return self in subscription_models

    def has_transaction_processing(self) -> bool:
        """Verifica se o modelo envolve processamento de transações"""
        transaction_models = [
            RevenueModel.TRANSACTION_FEES,
            RevenueModel.MARKETPLACE_COMMISSION,
            RevenueModel.HYBRID
        ]

        return self in transaction_models

    def get_revenue_predictability(self) -> str:
        """Nível de previsibilidade da receita"""
        predictability_map = {
            RevenueModel.FREEMIUM: "medium",
            RevenueModel.SUBSCRIPTION: "high",
            RevenueModel.TRANSACTION_FEES: "medium",
            RevenueModel.LICENSING: "high",
            RevenueModel.ADVERTISING: "low",
            RevenueModel.MARKETPLACE_COMMISSION: "medium",
            RevenueModel.DATA_MONETIZATION: "medium",
            RevenueModel.SERVICE_BASED: "medium",
            RevenueModel.HYBRID: "high"
        }

        return predictability_map.get(self, "medium")

    def get_customer_acquisition_cost_target(self) -> Decimal:
        """CAC (Customer Acquisition Cost) alvo baseado no LTV"""
        ltv = self.get_estimated_ltv()
        ltv_cac_ratio = self.get_revenue_characteristics().get('ltv_cac_ratio_target', 3.0)

        if ltv_cac_ratio > 0:
            return Decimal(str(ltv / ltv_cac_ratio)).quantize(Decimal('0.01'))
        return Decimal('0')


class RevenueModelValidator:
    """Validador para modelos de receita"""

    @staticmethod
    def validate_revenue_model(model: str) -> RevenueModel:
        """Valida e converte string para RevenueModel"""
        try:
            return RevenueModel(model.lower())
        except ValueError:
            raise ValueError(f"Modelo de receita inválido: {model}")

    @staticmethod
    def get_supported_models() -> List[str]:
        """Retorna lista de modelos suportados"""
        return [model.value for model in RevenueModel]

    @staticmethod
    def get_model_display_name(model: RevenueModel) -> str:
        """Retorna nome de exibição do modelo"""
        display_names = {
            RevenueModel.FREEMIUM: "Freemium",
            RevenueModel.SUBSCRIPTION: "Assinatura",
            RevenueModel.TRANSACTION_FEES: "Taxas por Transação",
            RevenueModel.LICENSING: "Licenciamento",
            RevenueModel.ADVERTISING: "Publicidade",
            RevenueModel.MARKETPLACE_COMMISSION: "Comissão de Marketplace",
            RevenueModel.DATA_MONETIZATION: "Monetização de Dados",
            RevenueModel.SERVICE_BASED: "Baseado em Serviços",
            RevenueModel.HYBRID: "Híbrido"
        }

        return display_names.get(model, model.value.title())

    @staticmethod
    def recommend_revenue_model_for_business_type(business_type: str) -> List[RevenueModel]:
        """Recomenda modelos de receita para um tipo de negócio"""
        from .business_type import BusinessType, BusinessTypeValidator

        try:
            bt = BusinessTypeValidator.validate_business_type(business_type)
        except ValueError:
            return [RevenueModel.SUBSCRIPTION]  # Default

        recommendations = {
            BusinessType.SAAS: [RevenueModel.FREEMIUM, RevenueModel.SUBSCRIPTION, RevenueModel.HYBRID],
            BusinessType.MARKETPLACE: [RevenueModel.MARKETPLACE_COMMISSION, RevenueModel.SUBSCRIPTION],
            BusinessType.ECOMMERCE: [RevenueModel.TRANSACTION_FEES, RevenueModel.SUBSCRIPTION],
            BusinessType.FINTECH: [RevenueModel.TRANSACTION_FEES, RevenueModel.SUBSCRIPTION],
            BusinessType.HEALTHTECH: [RevenueModel.SUBSCRIPTION, RevenueModel.LICENSING],
            BusinessType.EDTECH: [RevenueModel.FREEMIUM, RevenueModel.SUBSCRIPTION],
            BusinessType.PROPTECH: [RevenueModel.SUBSCRIPTION, RevenueModel.LICENSING],
            BusinessType.AUTOTECH: [RevenueModel.SUBSCRIPTION, RevenueModel.SERVICE_BASED],
            BusinessType.GREENTECH: [RevenueModel.SUBSCRIPTION, RevenueModel.DATA_MONETIZATION],
            BusinessType.WEB3: [RevenueModel.TRANSACTION_FEES, RevenueModel.DATA_MONETIZATION]
        }

        return recommendations.get(bt, [RevenueModel.SUBSCRIPTION])