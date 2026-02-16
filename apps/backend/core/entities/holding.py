"""
Entidades Core do Domínio - Holding Autônoma
Entities representam objetos de negócio com identidade própria
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID, uuid4

from backend.core.value_objects import (
    BusinessType,
    SubsidiaryStatus,
    AgentRole,
    RevenueTarget,
    AutonomyMetrics,
    LLBProtocol
)


@dataclass
class Holding:
    """
    Entidade raiz da Holding Autônoma
    Representa a Corporação Senciente como um todo
    """
    id: UUID = field(default_factory=uuid4)
    name: str = "Corporação Senciente"
    vision: str = "Holding que constrói empresas automaticamente"
    total_revenue: Decimal = Decimal('0')
    total_assets: Decimal = Decimal('0')
    subsidiaries: List['Subsidiary'] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def add_subsidiary(self, subsidiary: 'Subsidiary') -> None:
        """Adiciona uma subsidiária à holding"""
        if subsidiary not in self.subsidiaries:
            self.subsidiaries.append(subsidiary)
            subsidiary.holding_id = self.id

    def remove_subsidiary(self, subsidiary: 'Subsidiary') -> None:
        """Remove uma subsidiária da holding"""
        if subsidiary in self.subsidiaries:
            self.subsidiaries.remove(subsidiary)
            subsidiary.holding_id = None

    def calculate_total_revenue(self) -> Decimal:
        """Calcula receita total de todas as subsidiárias"""
        return sum(s.current_revenue for s in self.subsidiaries)

    def calculate_total_autonomy(self) -> float:
        """Calcula autonomia média da holding"""
        if not self.subsidiaries:
            return 0.0
        return sum(s.autonomy_level for s in self.subsidiaries) / len(self.subsidiaries)

    def get_active_subsidiaries(self) -> List['Subsidiary']:
        """Retorna subsidiárias ativas"""
        return [s for s in self.subsidiaries if s.status == SubsidiaryStatus.ACTIVE]

    def get_subsidiaries_by_type(self, business_type: BusinessType) -> List['Subsidiary']:
        """Retorna subsidiárias por tipo de negócio"""
        return [s for s in self.subsidiaries if s.business_type == business_type]

    def update_financials(self) -> None:
        """Atualiza métricas financeiras da holding"""
        self.total_revenue = self.calculate_total_revenue()
        self.updated_at = datetime.utcnow()


@dataclass
class Subsidiary:
    """
    Subsidiária autônoma da holding
    Cada subsidiária é uma empresa independente
    """
    id: UUID = field(default_factory=uuid4)
    holding_id: Optional[UUID] = None
    name: str = ""
    business_type: BusinessType = BusinessType.SAAS
    status: SubsidiaryStatus = SubsidiaryStatus.PLANNING
    revenue_target: Optional[RevenueTarget] = None
    current_revenue: Decimal = Decimal('0')
    autonomy_level: float = 0.0  # 0-100%
    agents: List['Agent'] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        """Validações pós-inicialização"""
        if self.autonomy_level < 0 or self.autonomy_level > 100:
            raise ValueError("Autonomy level must be between 0 and 100")

        if self.revenue_target and not self.revenue_target.validate():
            raise ValueError("Invalid revenue target")

    def assign_agent(self, agent: 'Agent') -> None:
        """Atribui um agente à subsidiária"""
        if agent not in self.agents:
            # Remove do agente anterior se existir
            if agent.subsidiary_id:
                # Aqui seria necessário buscar a subsidiária anterior
                pass

            agent.subsidiary_id = self.id
            self.agents.append(agent)

    def remove_agent(self, agent: 'Agent') -> None:
        """Remove um agente da subsidiária"""
        if agent in self.agents:
            self.agents.remove(agent)
            agent.subsidiary_id = None

    def calculate_autonomy_percentage(self) -> float:
        """Calcula autonomia baseada nos agentes"""
        if not self.agents:
            return 0.0
        return sum(a.autonomy_level for a in self.agents) / len(self.agents)

    def update_autonomy_level(self) -> None:
        """Atualiza nível de autonomia da subsidiária"""
        self.autonomy_level = self.calculate_autonomy_percentage()
        self.updated_at = datetime.utcnow()

    def get_agents_by_role(self, role: AgentRole) -> List['Agent']:
        """Retorna agentes por papel"""
        return [a for a in self.agents if a.role == role]

    def calculate_performance_score(self) -> float:
        """Calcula score de performance da subsidiária"""
        if not self.revenue_target:
            return 0.0

        revenue_achievement = float(self.current_revenue / self.revenue_target.monthly_target)
        autonomy_score = self.autonomy_level / 100.0
        agent_efficiency = len(self.agents) / max(1, len(self.agents))  # Placeholder

        # Weighted score
        return min(100.0, (revenue_achievement * 0.5 + autonomy_score * 0.3 + agent_efficiency * 0.2) * 100)

    def is_ready_for_launch(self) -> bool:
        """Verifica se subsidiária está pronta para lançamento"""
        return (
            self.status == SubsidiaryStatus.DEVELOPMENT and
            len(self.agents) >= 3 and  # Mínimo de agentes
            self.autonomy_level >= 60 and  # Autonomia mínima
            self.revenue_target is not None
        )

    def launch(self) -> None:
        """Lança a subsidiária para produção"""
        if self.is_ready_for_launch():
            self.status = SubsidiaryStatus.ACTIVE
            self.updated_at = datetime.utcnow()
        else:
            raise ValueError("Subsidiary not ready for launch")


@dataclass
class Agent:
    """
    Agente IA especializado
    Funcionários digitais da corporação
    """
    id: UUID = field(default_factory=uuid4)
    subsidiary_id: Optional[UUID] = None
    name: str = ""
    role: AgentRole = AgentRole.MANAGEMENT
    specialization: str = ""
    autonomy_level: float = 0.0  # 0-100%
    performance_score: float = 0.0  # 0-100%
    tasks_completed: int = 0
    llb_protocol: LLBProtocol = field(default_factory=lambda: LLBProtocol([], [], []))
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        """Validações pós-inicialização"""
        if self.autonomy_level < 0 or self.autonomy_level > 100:
            raise ValueError("Autonomy level must be between 0 and 100")

        if self.performance_score < 0 or self.performance_score > 100:
            raise ValueError("Performance score must be between 0 and 100")

    def complete_task(self, task_result: dict = None) -> None:
        """Registra conclusão de tarefa"""
        self.tasks_completed += 1

        # Update performance based on task result
        if task_result and 'success' in task_result:
            if task_result['success']:
                self.performance_score = min(100.0, self.performance_score + 1)
            else:
                self.performance_score = max(0.0, self.performance_score - 0.5)

        self.updated_at = datetime.utcnow()

    def add_memory(self, content: str, memory_type: str, metadata: dict = None) -> None:
        """Adiciona memória ao protocolo L.L.B."""
        from backend.core.value_objects import MemoryType

        try:
            mem_type = MemoryType(memory_type.upper())
            self.llb_protocol.add_memory(content, mem_type, metadata)
        except ValueError:
            raise ValueError(f"Invalid memory type: {memory_type}")

    def get_relevant_context(self, query: str, limit: int = 5) -> dict:
        """Busca contexto relevante usando L.L.B."""
        return self.llb_protocol.get_relevant_context(query, limit)

    def calculate_efficiency_score(self) -> float:
        """Calcula eficiência do agente"""
        if self.tasks_completed == 0:
            return 0.0

        # Efficiency = Performance / Tasks Completed (normalized)
        efficiency = (self.performance_score / 100.0) * (self.tasks_completed / max(1, self.tasks_completed))
        return min(100.0, efficiency * 100)

    def level_up_autonomy(self, improvement: float = 5.0) -> None:
        """Aumenta nível de autonomia baseado em performance"""
        if self.performance_score >= 80:  # High performer
            self.autonomy_level = min(100.0, self.autonomy_level + improvement)
        elif self.performance_score >= 60:  # Good performer
            self.autonomy_level = min(100.0, self.autonomy_level + improvement * 0.7)
        else:  # Needs improvement
            self.autonomy_level = max(0.0, self.autonomy_level - improvement * 0.3)

        self.updated_at = datetime.utcnow()

    def is_high_performer(self) -> bool:
        """Verifica se agente é high performer"""
        return (
            self.performance_score >= 85 and
            self.autonomy_level >= 70 and
            self.tasks_completed >= 100
        )

    def needs_training(self) -> bool:
        """Verifica se agente precisa de treinamento"""
        return (
            self.performance_score < 60 or
            self.autonomy_level < 40 or
            (self.tasks_completed > 50 and self.performance_score < 70)
        )


@dataclass
class Opportunity:
    """
    Oportunidade de negócio identificada
    Base para criação de novas subsidiárias
    """
    id: UUID = field(default_factory=uuid4)
    market_segment: str = ""
    opportunity_description: str = ""
    estimated_revenue: Decimal = Decimal('0')
    risk_level: str = "medium"  # "low", "medium", "high"
    confidence_score: float = 0.5  # 0-1
    market_analysis: Optional['MarketAnalysis'] = None
    risk_assessment: Optional['RiskAssessment'] = None
    proposed_subsidiary: Optional[Subsidiary] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def calculate_viability_score(self) -> float:
        """Calcula score de viabilidade da oportunidade"""
        if not self.market_analysis or not self.risk_assessment:
            return self.confidence_score * 50  # Base score

        market_score = self.market_analysis.calculate_opportunity_score()
        risk_penalty = {
            "low": 1.0,
            "medium": 0.8,
            "high": 0.6
        }.get(self.risk_level, 0.7)

        return (market_score * 0.7 + self.confidence_score * 30) * risk_penalty

    def is_viable(self, threshold: float = 60.0) -> bool:
        """Verifica se oportunidade é viável"""
        return self.calculate_viability_score() >= threshold

    def create_subsidiary_template(self) -> Subsidiary:
        """Cria template de subsidiária baseado na oportunidade"""
        if not self.is_viable():
            raise ValueError("Opportunity not viable enough for subsidiary creation")

        # Auto-generate subsidiary details
        business_type = self._infer_business_type()
        name = self._generate_subsidiary_name()
        revenue_target = self._calculate_revenue_target()

        return Subsidiary(
            name=name,
            business_type=business_type,
            revenue_target=revenue_target,
            status=SubsidiaryStatus.PLANNING
        )

    def _infer_business_type(self) -> BusinessType:
        """Infere tipo de negócio da oportunidade"""
        segment_lower = self.market_segment.lower()

        if 'software' in segment_lower or 'app' in segment_lower or 'digital' in segment_lower:
            return BusinessType.SAAS
        elif 'ecommerce' in segment_lower or 'marketplace' in segment_lower:
            return BusinessType.ECOMMERCE
        elif 'trading' in segment_lower or 'finance' in segment_lower:
            return BusinessType.TRADING
        elif 'consulting' in segment_lower or 'services' in segment_lower:
            return BusinessType.CONSULTING
        elif 'research' in segment_lower or 'ai' in segment_lower:
            return BusinessType.RESEARCH
        else:
            return BusinessType.MARKETPLACE  # Default

    def _generate_subsidiary_name(self) -> str:
        """Gera nome para a subsidiária"""
        type_names = {
            BusinessType.SAAS: "Digital Solutions",
            BusinessType.TRADING: "Capital Markets",
            BusinessType.ECOMMERCE: "Market Hub",
            BusinessType.MARKETPLACE: "Exchange Platform",
            BusinessType.CONSULTING: "Advisory Group",
            BusinessType.RESEARCH: "Innovation Lab"
        }

        base_name = type_names.get(self._infer_business_type(), "Innovation Co")
        return f"{self.market_segment.title()} {base_name}"

    def _calculate_revenue_target(self) -> RevenueTarget:
        """Calcula target de receita baseado na oportunidade"""
        monthly_target = self.estimated_revenue / Decimal('12')

        # Growth rate based on market segment
        growth_rates = {
            "tech": 0.15,
            "finance": 0.12,
            "healthcare": 0.10,
            "ecommerce": 0.20,
            "consulting": 0.08
        }

        segment_key = self.market_segment.lower()
        growth_rate = next((rate for key, rate in growth_rates.items() if key in segment_key), 0.10)

        return RevenueTarget(
            monthly_target=monthly_target,
            growth_rate=growth_rate,
            timeframe_months=12
        )