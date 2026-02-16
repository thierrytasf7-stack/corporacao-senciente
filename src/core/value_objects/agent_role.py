"""
Agent Role Value Object
Funções e responsabilidades dos agentes IA
"""

from enum import Enum
from typing import Dict, List, Any
from pydantic import BaseModel, Field


class AgentRole(Enum):
    """Funções dos agentes IA"""
    MARKETING = "marketing"
    SALES = "sales"
    OPERATIONS = "operations"
    SUPPORT = "support"
    DEVELOPMENT = "development"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    FINANCE = "finance"
    RESEARCH = "research"
    EXECUTIVE = "executive"

    def get_capabilities(self) -> List[str]:
        """Capacidades específicas da função"""
        capabilities_map = {
            AgentRole.MARKETING: [
                "campaign_creation",
                "audience_targeting",
                "content_optimization",
                "social_media_management",
                "seo_optimization",
                "lead_generation",
                "brand_management"
            ],
            AgentRole.SALES: [
                "lead_qualification",
                "pipeline_management",
                "negotiation_support",
                "proposal_generation",
                "customer_relationship_management",
                "revenue_forecasting",
                "deal_closing"
            ],
            AgentRole.OPERATIONS: [
                "process_optimization",
                "resource_management",
                "capacity_planning",
                "quality_assurance",
                "workflow_automation",
                "performance_monitoring",
                "bottleneck_analysis"
            ],
            AgentRole.SUPPORT: [
                "customer_service",
                "issue_resolution",
                "knowledge_base_management",
                "ticket_routing",
                "satisfaction_monitoring",
                "feedback_analysis"
            ],
            AgentRole.DEVELOPMENT: [
                "code_generation",
                "testing_automation",
                "deployment_management",
                "performance_optimization",
                "security_implementation",
                "documentation_generation"
            ],
            AgentRole.SECURITY: [
                "threat_detection",
                "vulnerability_assessment",
                "security_monitoring",
                "incident_response",
                "compliance_monitoring",
                "access_control"
            ],
            AgentRole.COMPLIANCE: [
                "regulatory_monitoring",
                "audit_preparation",
                "policy_enforcement",
                "risk_assessment",
                "documentation_management",
                "reporting_automation"
            ],
            AgentRole.FINANCE: [
                "financial_analysis",
                "budget_management",
                "revenue_optimization",
                "cost_control",
                "forecasting",
                "reporting"
            ],
            AgentRole.RESEARCH: [
                "market_analysis",
                "competitive_intelligence",
                "trend_identification",
                "innovation_scouting",
                "data_analysis",
                "strategic_planning"
            ],
            AgentRole.EXECUTIVE: [
                "strategic_planning",
                "performance_monitoring",
                "decision_support",
                "stakeholder_communication",
                "risk_management",
                "resource_allocation"
            ]
        }

        return capabilities_map.get(self, [])

    def get_autonomy_level(self) -> int:
        """Nível de autonomia recomendado (1-10)"""
        autonomy_levels = {
            AgentRole.MARKETING: 7,
            AgentRole.SALES: 6,
            AgentRole.OPERATIONS: 8,
            AgentRole.SUPPORT: 9,
            AgentRole.DEVELOPMENT: 5,
            AgentRole.SECURITY: 9,
            AgentRole.COMPLIANCE: 7,
            AgentRole.FINANCE: 6,
            AgentRole.RESEARCH: 8,
            AgentRole.EXECUTIVE: 4
        }

        return autonomy_levels.get(self, 5)

    def get_required_skills(self) -> List[str]:
        """Habilidades técnicas necessárias"""
        skill_requirements = {
            AgentRole.MARKETING: [
                "content_creation",
                "data_analysis",
                "campaign_management",
                "audience_segmentation"
            ],
            AgentRole.SALES: [
                "negotiation",
                "relationship_building",
                "market_intelligence",
                "presentation_skills"
            ],
            AgentRole.OPERATIONS: [
                "process_optimization",
                "resource_management",
                "quality_control",
                "project_management"
            ],
            AgentRole.SUPPORT: [
                "customer_service",
                "problem_solving",
                "communication",
                "empathy"
            ],
            AgentRole.DEVELOPMENT: [
                "programming",
                "system_design",
                "testing",
                "deployment"
            ],
            AgentRole.SECURITY: [
                "threat_analysis",
                "risk_assessment",
                "security_protocols",
                "incident_response"
            ],
            AgentRole.COMPLIANCE: [
                "regulatory_knowledge",
                "audit_procedures",
                "documentation",
                "risk_management"
            ],
            AgentRole.FINANCE: [
                "financial_analysis",
                "budgeting",
                "forecasting",
                "reporting"
            ],
            AgentRole.RESEARCH: [
                "data_analysis",
                "market_research",
                "competitive_analysis",
                "trend_analysis"
            ],
            AgentRole.EXECUTIVE: [
                "strategic_thinking",
                "decision_making",
                "leadership",
                "communication"
            ]
        }

        return skill_requirements.get(self, [])

    def get_interaction_patterns(self) -> Dict[str, Any]:
        """Padrões de interação com outros agentes"""
        interaction_patterns = {
            AgentRole.MARKETING: {
                "primary_collaborators": [AgentRole.SALES, AgentRole.RESEARCH],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["market_data", "customer_feedback", "competitive_analysis"],
                "output_consumers": ["sales_team", "executives", "customers"]
            },
            AgentRole.SALES: {
                "primary_collaborators": [AgentRole.MARKETING, AgentRole.SUPPORT, AgentRole.FINANCE],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["lead_data", "customer_interactions", "market_intelligence"],
                "output_consumers": ["finance_team", "executives", "customers"]
            },
            AgentRole.OPERATIONS: {
                "primary_collaborators": [AgentRole.DEVELOPMENT, AgentRole.SECURITY, AgentRole.SUPPORT],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["system_metrics", "process_data", "performance_logs"],
                "output_consumers": ["development_team", "executives", "support_team"]
            },
            AgentRole.SUPPORT: {
                "primary_collaborators": [AgentRole.OPERATIONS, AgentRole.SALES],
                "reporting_to": [AgentRole.OPERATIONS],
                "information_sources": ["customer_tickets", "system_logs", "user_feedback"],
                "output_consumers": ["customers", "operations_team", "development_team"]
            },
            AgentRole.DEVELOPMENT: {
                "primary_collaborators": [AgentRole.OPERATIONS, AgentRole.SECURITY],
                "reporting_to": [AgentRole.OPERATIONS],
                "information_sources": ["requirements", "system_architecture", "user_stories"],
                "output_consumers": ["operations_team", "testing_team", "users"]
            },
            AgentRole.SECURITY: {
                "primary_collaborators": [AgentRole.DEVELOPMENT, AgentRole.COMPLIANCE],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["threat_intelligence", "security_logs", "vulnerability_scans"],
                "output_consumers": ["development_team", "executives", "compliance_team"]
            },
            AgentRole.COMPLIANCE: {
                "primary_collaborators": [AgentRole.SECURITY, AgentRole.FINANCE],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["regulatory_updates", "audit_logs", "policy_documents"],
                "output_consumers": ["executives", "legal_team", "operations_team"]
            },
            AgentRole.FINANCE: {
                "primary_collaborators": [AgentRole.SALES, AgentRole.EXECUTIVE],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["financial_data", "revenue_reports", "budget_documents"],
                "output_consumers": ["executives", "board_members", "investors"]
            },
            AgentRole.RESEARCH: {
                "primary_collaborators": [AgentRole.MARKETING, AgentRole.EXECUTIVE],
                "reporting_to": [AgentRole.EXECUTIVE],
                "information_sources": ["market_data", "industry_reports", "academic_papers"],
                "output_consumers": ["executives", "strategy_team", "product_team"]
            },
            AgentRole.EXECUTIVE: {
                "primary_collaborators": [AgentRole.FINANCE, AgentRole.RESEARCH],
                "reporting_to": [],  # Top level
                "information_sources": ["all_department_reports", "market_intelligence", "stakeholder_feedback"],
                "output_consumers": ["board_members", "investors", "all_departments"]
            }
        }

        return interaction_patterns.get(self, {
            "primary_collaborators": [],
            "reporting_to": [],
            "information_sources": [],
            "output_consumers": []
        })

    def get_performance_metrics(self) -> List[str]:
        """Métricas de performance específicas da função"""
        metrics_map = {
            AgentRole.MARKETING: [
                "lead_generation_rate",
                "campaign_roi",
                "brand_awareness_score",
                "content_engagement_rate",
                "conversion_rate"
            ],
            AgentRole.SALES: [
                "conversion_rate",
                "average_deal_size",
                "sales_cycle_length",
                "customer_acquisition_cost",
                "customer_lifetime_value"
            ],
            AgentRole.OPERATIONS: [
                "process_efficiency",
                "cost_per_transaction",
                "quality_score",
                "throughput_rate",
                "bottleneck_resolution_time"
            ],
            AgentRole.SUPPORT: [
                "first_response_time",
                "resolution_time",
                "customer_satisfaction_score",
                "ticket_volume_handled",
                "self_service_rate"
            ],
            AgentRole.DEVELOPMENT: [
                "code_quality_score",
                "deployment_frequency",
                "mean_time_to_recovery",
                "test_coverage",
                "technical_debt_reduction"
            ],
            AgentRole.SECURITY: [
                "threat_detection_rate",
                "incident_response_time",
                "vulnerability_remediation_time",
                "security_incident_count",
                "compliance_score"
            ],
            AgentRole.COMPLIANCE: [
                "audit_success_rate",
                "regulatory_compliance_score",
                "policy_adherence_rate",
                "risk_mitigation_effectiveness",
                "documentation_completeness"
            ],
            AgentRole.FINANCE: [
                "budget_accuracy",
                "forecast_accuracy",
                "cost_savings_achieved",
                "roi_on_investments",
                "financial_reporting_timeliness"
            ],
            AgentRole.RESEARCH: [
                "insight_quality_score",
                "market_prediction_accuracy",
                "innovation_success_rate",
                "competitive_intelligence_value",
                "strategic_impact_score"
            ],
            AgentRole.EXECUTIVE: [
                "strategic_alignment_score",
                "decision_quality_rating",
                "stakeholder_satisfaction",
                "organizational_performance",
                "future_readiness_score"
            ]
        }

        return metrics_map.get(self, ["task_completion_rate", "quality_score", "efficiency_rating"])

    def requires_human_oversight(self) -> bool:
        """Verifica se a função requer supervisão humana"""
        high_supervision_roles = [
            AgentRole.EXECUTIVE,
            AgentRole.FINANCE,
            AgentRole.SECURITY,
            AgentRole.COMPLIANCE
        ]

        return self in high_supervision_roles

    def get_learning_priority(self) -> int:
        """Prioridade de aprendizado (1-10, onde 10 é máxima prioridade)"""
        priority_map = {
            AgentRole.EXECUTIVE: 10,
            AgentRole.SECURITY: 9,
            AgentRole.COMPLIANCE: 8,
            AgentRole.FINANCE: 8,
            AgentRole.RESEARCH: 7,
            AgentRole.DEVELOPMENT: 7,
            AgentRole.OPERATIONS: 6,
            AgentRole.SALES: 6,
            AgentRole.MARKETING: 5,
            AgentRole.SUPPORT: 4
        }

        return priority_map.get(self, 5)


class AgentRoleValidator:
    """Validador para funções de agentes"""

    @staticmethod
    def validate_agent_role(role: str) -> AgentRole:
        """Valida e converte string para AgentRole"""
        try:
            return AgentRole(role.lower())
        except ValueError:
            raise ValueError(f"Função de agente inválida: {role}")

    @staticmethod
    def get_supported_roles() -> List[str]:
        """Retorna lista de funções suportadas"""
        return [role.value for role in AgentRole]

    @staticmethod
    def get_role_display_name(role: AgentRole) -> str:
        """Retorna nome de exibição da função"""
        display_names = {
            AgentRole.MARKETING: "Marketing",
            AgentRole.SALES: "Vendas",
            AgentRole.OPERATIONS: "Operações",
            AgentRole.SUPPORT: "Suporte",
            AgentRole.DEVELOPMENT: "Desenvolvimento",
            AgentRole.SECURITY: "Segurança",
            AgentRole.COMPLIANCE: "Compliance",
            AgentRole.FINANCE: "Financeiro",
            AgentRole.RESEARCH: "Pesquisa",
            AgentRole.EXECUTIVE: "Executivo"
        }

        return display_names.get(role, role.value.title())