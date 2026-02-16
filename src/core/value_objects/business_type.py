"""
Business Type Value Object
Tipos de negócio suportados pela Corporação Senciente
"""

from enum import Enum
from typing import Dict, Any
from pydantic import BaseModel, Field


class BusinessType(Enum):
    """Tipos de negócio suportados"""
    SAAS = "saas"
    MARKETPLACE = "marketplace"
    ECOMMERCE = "ecommerce"
    FINTECH = "fintech"
    HEALTHTECH = "healthtech"
    EDTECH = "edtech"
    PROPTECH = "proptech"
    AUTOTECH = "autotech"
    GREENTECH = "greentech"
    WEB3 = "web3"

    def get_characteristics(self) -> Dict[str, Any]:
        """Características específicas do tipo de negócio"""
        characteristics = {
            BusinessType.SAAS: {
                "cycle_length_days": 45,
                "deal_size_usd": 15000,
                "qualification_criteria": ["budget", "authority", "need", "timeline"],
                "scaling_factors": ["user_growth", "feature_complexity", "database_load"],
                "key_metrics": ["monthly_recurring_revenue", "churn_rate", "customer_lifetime_value"]
            },
            BusinessType.MARKETPLACE: {
                "cycle_length_days": 60,
                "deal_size_usd": 50000,
                "qualification_criteria": ["market_size", "network_effects", "competition"],
                "scaling_factors": ["transaction_volume", "user_base", "geographic_expansion"],
                "key_metrics": ["gmv", "take_rate", "network_liquidity"]
            },
            BusinessType.ECOMMERCE: {
                "cycle_length_days": 30,
                "deal_size_usd": 2500,
                "qualification_criteria": ["budget", "urgency", "competition"],
                "scaling_factors": ["order_volume", "product_catalog", "shipping_coverage"],
                "key_metrics": ["conversion_rate", "average_order_value", "customer_acquisition_cost"]
            },
            BusinessType.FINTECH: {
                "cycle_length_days": 90,
                "deal_size_usd": 75000,
                "qualification_criteria": ["compliance", "security", "budget", "timeline"],
                "scaling_factors": ["transaction_volume", "regulatory_complexity", "user_growth"],
                "key_metrics": ["transaction_success_rate", "compliance_score", "security_incidents"]
            },
            BusinessType.HEALTHTECH: {
                "cycle_length_days": 120,
                "deal_size_usd": 100000,
                "qualification_criteria": ["regulatory_approval", "clinical_validation", "budget"],
                "scaling_factors": ["user_base", "data_volume", "regulatory_complexity"],
                "key_metrics": ["clinical_outcomes", "regulatory_compliance", "data_privacy_score"]
            },
            BusinessType.EDTECH: {
                "cycle_length_days": 60,
                "deal_size_usd": 25000,
                "qualification_criteria": ["student_base", "curriculum_alignment", "budget"],
                "scaling_factors": ["user_growth", "content_volume", "geographic_expansion"],
                "key_metrics": ["student_engagement", "learning_outcomes", "completion_rates"]
            },
            BusinessType.PROPTECH: {
                "cycle_length_days": 75,
                "deal_size_usd": 40000,
                "qualification_criteria": ["property_portfolio", "technology_fit", "roi_expectations"],
                "scaling_factors": ["property_count", "data_complexity", "integration_requirements"],
                "key_metrics": ["occupancy_rate", "operational_efficiency", "cost_savings"]
            },
            BusinessType.AUTOTECH: {
                "cycle_length_days": 90,
                "deal_size_usd": 80000,
                "qualification_criteria": ["fleet_size", "technology_readiness", "safety_requirements"],
                "scaling_factors": ["vehicle_count", "data_volume", "regulatory_complexity"],
                "key_metrics": ["safety_incidents", "operational_efficiency", "cost_per_mile"]
            },
            BusinessType.GREENTECH: {
                "cycle_length_days": 45,
                "deal_size_usd": 30000,
                "qualification_criteria": ["sustainability_goals", "regulatory_requirements", "budget"],
                "scaling_factors": ["impact_scale", "data_volume", "stakeholder_complexity"],
                "key_metrics": ["carbon_reduction", "sustainability_score", "regulatory_compliance"]
            },
            BusinessType.WEB3: {
                "cycle_length_days": 60,
                "deal_size_usd": 35000,
                "qualification_criteria": ["blockchain_expertise", "regulatory_compliance", "user_base"],
                "scaling_factors": ["transaction_volume", "network_complexity", "regulatory_evolution"],
                "key_metrics": ["transaction_success", "network_adoption", "regulatory_compliance"]
            }
        }

        return characteristics.get(self, {})

    def get_estimated_tam(self) -> int:
        """Estimativa de TAM (Total Addressable Market) em USD"""
        tam_estimates = {
            BusinessType.SAAS: 50000000,
            BusinessType.MARKETPLACE: 30000000,
            BusinessType.ECOMMERCE: 40000000,
            BusinessType.FINTECH: 35000000,
            BusinessType.HEALTHTECH: 25000000,
            BusinessType.EDTECH: 20000000,
            BusinessType.PROPTECH: 15000000,
            BusinessType.AUTOTECH: 20000000,
            BusinessType.GREENTECH: 18000000,
            BusinessType.WEB3: 12000000
        }

        return tam_estimates.get(self, 10000000)

    def get_growth_rate(self) -> float:
        """Taxa de crescimento estimada do mercado"""
        growth_rates = {
            BusinessType.SAAS: 0.25,  # 25% CAGR
            BusinessType.MARKETPLACE: 0.30,
            BusinessType.ECOMMERCE: 0.20,
            BusinessType.FINTECH: 0.35,
            BusinessType.HEALTHTECH: 0.28,
            BusinessType.EDTECH: 0.32,
            BusinessType.PROPTECH: 0.22,
            BusinessType.AUTOTECH: 0.40,
            BusinessType.GREENTECH: 0.45,
            BusinessType.WEB3: 0.60
        }

        return growth_rates.get(self, 0.25)

    def requires_special_regulatory_approval(self) -> bool:
        """Verifica se o tipo de negócio requer aprovações regulatórias especiais"""
        regulated_businesses = [
            BusinessType.FINTECH,
            BusinessType.HEALTHTECH,
            BusinessType.AUTOTECH,
            BusinessType.WEB3
        ]

        return self in regulated_businesses

    def get_ideal_subsidiary_size(self) -> Dict[str, Any]:
        """Tamanho ideal de subsidiária para este tipo de negócio"""
        size_profiles = {
            BusinessType.SAAS: {
                "initial_team": 5,
                "initial_budget": 150000,
                "time_to_first_revenue": 3,  # meses
                "scaling_threshold": 100  # usuários pagantes
            },
            BusinessType.MARKETPLACE: {
                "initial_team": 8,
                "initial_budget": 300000,
                "time_to_first_revenue": 4,
                "scaling_threshold": 1000  # transações/mês
            },
            BusinessType.ECOMMERCE: {
                "initial_team": 6,
                "initial_budget": 100000,
                "time_to_first_revenue": 2,
                "scaling_threshold": 500  # pedidos/mês
            },
            BusinessType.FINTECH: {
                "initial_team": 10,
                "initial_budget": 400000,
                "time_to_first_revenue": 6,
                "scaling_threshold": 10000  # transações/mês
            },
            BusinessType.HEALTHTECH: {
                "initial_team": 12,
                "initial_budget": 500000,
                "time_to_first_revenue": 8,
                "scaling_threshold": 100  # usuários clínicos
            }
        }

        return size_profiles.get(self, {
            "initial_team": 5,
            "initial_budget": 150000,
            "time_to_first_revenue": 3,
            "scaling_threshold": 100
        })


class BusinessTypeValidator:
    """Validador para tipos de negócio"""

    @staticmethod
    def validate_business_type(business_type: str) -> BusinessType:
        """Valida e converte string para BusinessType"""
        try:
            return BusinessType(business_type.lower())
        except ValueError:
            raise ValueError(f"Tipo de negócio inválido: {business_type}")

    @staticmethod
    def get_supported_business_types() -> list:
        """Retorna lista de tipos de negócio suportados"""
        return [bt.value for bt in BusinessType]

    @staticmethod
    def get_business_type_display_name(business_type: BusinessType) -> str:
        """Retorna nome de exibição do tipo de negócio"""
        display_names = {
            BusinessType.SAAS: "SaaS",
            BusinessType.MARKETPLACE: "Marketplace",
            BusinessType.ECOMMERCE: "E-commerce",
            BusinessType.FINTECH: "Fintech",
            BusinessType.HEALTHTECH: "Healthtech",
            BusinessType.EDTECH: "Edtech",
            BusinessType.PROPTECH: "Proptech",
            BusinessType.AUTOTECH: "Autotech",
            BusinessType.GREENTECH: "Greentech",
            BusinessType.WEB3: "Web3"
        }

        return display_names.get(business_type, business_type.value.title())