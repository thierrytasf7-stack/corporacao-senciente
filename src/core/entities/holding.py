"""
Holding Entity - Entidade Raiz do Domínio DDD
Representa a Corporação Senciente como uma entidade autônoma
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from ..value_objects.business_type import BusinessType
from ..value_objects.revenue_model import RevenueModel
from ..value_objects.agent_role import AgentRole
from ..value_objects.llb_protocol import LLBProtocol, MemoryType


@dataclass
class Subsidiary:
    """
    Subsidiária criada pela Holding
    Representa uma empresa independente gerenciada pela corporação
    """
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    business_type: BusinessType = BusinessType.SAAS
    revenue_model: RevenueModel = RevenueModel.SUBSCRIPTION
    status: str = "planning"  # planning, development, launched, operational, archived
    mission: str = ""
    vision: str = ""

    # Métricas financeiras
    total_revenue: Decimal = Decimal('0')
    total_profit: Decimal = Decimal('0')
    monthly_recurring_revenue: Decimal = Decimal('0')

    # Métricas operacionais
    active_users: int = 0
    customer_satisfaction_score: float = 0.0
    market_share_percentage: float = 0.0

    # Timeline
    founded_at: datetime = field(default_factory=datetime.utcnow)
    launched_at: Optional[datetime] = None
    updated_at: datetime = field(default_factory=datetime.utcnow)

    # Relacionamentos
    parent_holding_id: UUID = field(default_factory=uuid4)

    # Metadados
    tags: List[str] = field(default_factory=list)
    risk_level: str = "medium"  # low, medium, high, critical
    strategic_importance: int = 5  # 1-10

    def update_financials(self, revenue_delta: Decimal, profit_delta: Decimal):
        """Atualiza métricas financeiras"""
        self.total_revenue += revenue_delta
        self.total_profit += profit_delta
        self.updated_at = datetime.utcnow()

    def update_operational_metrics(self, users: int, satisfaction: float, market_share: float):
        """Atualiza métricas operacionais"""
        self.active_users = users
        self.customer_satisfaction_score = max(0.0, min(5.0, satisfaction))
        self.market_share_percentage = max(0.0, min(100.0, market_share))
        self.updated_at = datetime.utcnow()

    def calculate_roi(self) -> Decimal:
        """Calcula ROI da subsidiária"""
        # Simplificado: Profit / (Revenue - Profit) se Revenue > 0
        if self.total_revenue <= 0:
            return Decimal('0')

        investment = self.total_revenue - self.total_profit
        if investment <= 0:
            return Decimal('999')  # ROI infinito se profit > revenue

        roi = (self.total_profit / investment) * 100
        return Decimal(str(roi)).quantize(Decimal('0.01'))

    def get_health_score(self) -> float:
        """Calcula pontuação de saúde da subsidiária (0-100)"""
        # Fatores: financeiro (40%), operacional (30%), satisfação (20%), crescimento (10%)
        financial_health = min(100.0, float(self.calculate_roi()))
        operational_health = min(100.0, (self.active_users / 1000) * 100)  # Meta: 1000+ usuários
        satisfaction_health = (self.customer_satisfaction_score / 5.0) * 100
        growth_health = min(100.0, self.market_share_percentage * 10)  # Meta: 10% market share

        health_score = (
            financial_health * 0.40 +
            operational_health * 0.30 +
            satisfaction_health * 0.20 +
            growth_health * 0.10
        )

        return round(health_score, 2)

    def is_strategically_important(self) -> bool:
        """Verifica se a subsidiária é estrategicamente importante"""
        return (
            self.strategic_importance >= 7 and
            self.get_health_score() >= 70 and
            self.status == "operational"
        )


@dataclass
class Agent:
    """
    Agente IA da Corporação
    Representa uma unidade de IA especializada
    """
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    role: AgentRole = AgentRole.EXECUTIVE
    status: str = "active"  # active, training, maintenance, retired

    # Capacidades e especialização
    capabilities: List[str] = field(default_factory=list)
    specialization_domain: str = ""
    autonomy_level: int = 5  # 1-10

    # Performance metrics
    performance_score: float = 0.0
    tasks_completed: int = 0
    success_rate: float = 0.0
    average_response_time: float = 0.0

    # Memória e aprendizado
    memory_count: int = 0
    learning_sessions: int = 0
    adaptation_score: float = 0.0

    # Timeline
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_active: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    # Relacionamentos
    assigned_subsidiary_id: Optional[UUID] = None
    supervisor_agent_id: Optional[UUID] = None

    def update_performance(self, score: float, tasks: int, success_rate: float, response_time: float):
        """Atualiza métricas de performance"""
        self.performance_score = max(0.0, min(100.0, score))
        self.tasks_completed += tasks
        self.success_rate = max(0.0, min(1.0, success_rate))
        self.average_response_time = max(0.0, response_time)
        self.last_active = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def add_capability(self, capability: str):
        """Adiciona nova capacidade ao agente"""
        if capability not in self.capabilities:
            self.capabilities.append(capability)
            self.updated_at = datetime.utcnow()

    def increase_autonomy(self, increment: int = 1):
        """Aumenta nível de autonomia"""
        self.autonomy_level = min(10, self.autonomy_level + increment)
        self.updated_at = datetime.utcnow()

    def update_learning_metrics(self, memory_delta: int, sessions_delta: int, adaptation: float):
        """Atualiza métricas de aprendizado"""
        self.memory_count += memory_delta
        self.learning_sessions += sessions_delta
        self.adaptation_score = max(0.0, min(1.0, adaptation))
        self.updated_at = datetime.utcnow()

    def is_high_performer(self) -> bool:
        """Verifica se o agente é um alto performer"""
        return (
            self.performance_score >= 85 and
            self.success_rate >= 0.90 and
            self.adaptation_score >= 0.80
        )

    def requires_maintenance(self) -> bool:
        """Verifica se o agente precisa de manutenção"""
        return (
            self.performance_score < 60 or
            self.success_rate < 0.70 or
            self.adaptation_score < 0.50
        )


@dataclass
class Opportunity:
    """
    Oportunidade de mercado identificada
    Representa uma oportunidade para criação de nova subsidiária
    """
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    description: str = ""
    source: str = ""

    # Métricas de mercado
    tam: Decimal = Decimal('0')  # Total Addressable Market
    sam: Decimal = Decimal('0')  # Serviceable Addressable Market
    som: Decimal = Decimal('0')  # Serviceable Obtainable Market
    growth_rate: Decimal = Decimal('0')

    # Análise
    competition_level: str = "medium"
    market_maturity: str = "growing"
    technical_feasibility: int = 50
    business_feasibility: int = 50
    financial_feasibility: int = 50

    # Recomendações
    recommended_business_type: BusinessType = BusinessType.SAAS
    recommended_revenue_model: RevenueModel = RevenueModel.SUBSCRIPTION

    # Estimativas
    estimated_investment: Decimal = Decimal('0')
    estimated_first_year_revenue: Decimal = Decimal('0')
    estimated_time_to_market: int = 6

    # Status
    status: str = "identified"  # identified, analyzed, approved, rejected
    priority_score: int = 50

    # Timeline
    identified_at: datetime = field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    # Relacionamentos
    identified_by_agent_id: Optional[UUID] = None

    def calculate_overall_score(self) -> int:
        """Calcula pontuação geral da oportunidade"""
        market_score = self._calculate_market_score()
        feasibility_score = (self.technical_feasibility + self.business_feasibility + self.financial_feasibility) // 3

        return min(100, (market_score + feasibility_score) // 2)

    def _calculate_market_score(self) -> int:
        """Calcula pontuação baseada em métricas de mercado"""
        score = 0

        if self.tam >= 1000000000:  # $1B+
            score += 40
        elif self.tam >= 500000000:
            score += 30

        if self.growth_rate >= 50:
            score += 30
        elif self.growth_rate >= 25:
            score += 20

        if self.competition_level == 'low':
            score += 20
        elif self.competition_level == 'medium':
            score += 10

        return min(100, score)

    def calculate_roi_potential(self) -> Decimal:
        """Calcula potencial de ROI"""
        if self.estimated_investment <= 0:
            return Decimal('0')

        net_profit = self.estimated_first_year_revenue - self.estimated_investment
        if self.estimated_investment > 0:
            roi = (net_profit / self.estimated_investment) * 100
            return Decimal(str(roi)).quantize(Decimal('0.01'))

        return Decimal('0')


@dataclass
class Holding:
    """
    A Corporação Senciente como uma Holding Autônoma.
    Gerencia e orquestra múltiplas subsidiárias.
    """
    id: UUID = field(default_factory=uuid4)
    name: str = "Corporação Senciente"
    mission: str = "Gerar receita para auto-desenvolvimento através da criação e gestão de múltiplas empresas (subsidiárias) de forma autônoma."
    vision: str = "Tornar-se a maior holding autônoma do mundo, com um portfólio diversificado de empresas de sucesso."
    status: str = "Operational"
    founded_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    # Portfolio financeiro
    total_revenue: Decimal = Decimal('0')
    total_profit: Decimal = Decimal('0')
    total_investment: Decimal = Decimal('0')
    cash_position: Decimal = Decimal('1000000')  # Capital inicial de $1M

    # Portfolio de subsidiárias
    subsidiaries: List[Subsidiary] = field(default_factory=list)
    active_agents: List[Agent] = field(default_factory=list)
    opportunities_identified: List[Opportunity] = field(default_factory=list)

    # Métricas operacionais
    total_active_users: int = 0
    average_customer_satisfaction: float = 0.0
    innovation_index: float = 0.0

    # Sistema L.L.B. (LangMem, Letta, ByteRover)
    memory_system: Dict[str, List[LLBProtocol]] = field(default_factory=dict)

    def add_subsidiary(self, subsidiary: Subsidiary):
        """Adiciona nova subsidiária ao portfolio"""
        subsidiary.parent_holding_id = self.id
        self.subsidiaries.append(subsidiary)
        self.updated_at = datetime.utcnow()

        # Criar memória episódica da criação
        self._create_memory(
            MemoryType.EPISODIC,
            {
                'event_type': 'subsidiary_creation',
                'description': f'Nova subsidiária {subsidiary.name} adicionada ao portfolio',
                'participants': ['holding_system'],
                'outcome': 'success',
                'lessons_learned': ['Processo de criação automatizado funcionando']
            },
            'holding_system'
        )

    def add_agent(self, agent: Agent):
        """Adiciona novo agente ao sistema"""
        self.active_agents.append(agent)
        self.updated_at = datetime.utcnow()

        # Criar memória episódica da contratação
        self._create_memory(
            MemoryType.EPISODIC,
            {
                'event_type': 'agent_onboarding',
                'description': f'Agente {agent.name} ({agent.role.value}) integrado ao sistema',
                'participants': ['holding_system', 'agent_system'],
                'outcome': 'success',
                'lessons_learned': ['Integração de agentes automatizada']
            },
            'holding_system'
        )

    def identify_opportunity(self, opportunity: Opportunity):
        """Registra nova oportunidade identificada"""
        self.opportunities_identified.append(opportunity)
        self.updated_at = datetime.utcnow()

        # Criar memória semântica da oportunidade
        self._create_memory(
            MemoryType.SEMANTIC,
            {
                'subject': f'Oportunidade de Mercado: {opportunity.title}',
                'facts': [
                    f'TAM: ${opportunity.tam:,.0f}',
                    f'Crescimento: {opportunity.growth_rate}%',
                    f'Concorrência: {opportunity.competition_level}',
                    f'ROI Potencial: {opportunity.calculate_roi_potential()}%'
                ],
                'relationships': {
                    'business_type': opportunity.recommended_business_type.value,
                    'revenue_model': opportunity.recommended_revenue_model.value
                }
            },
            'market_intelligence_agent'
        )

    def update_financials(self, revenue_delta: Decimal, profit_delta: Decimal, investment_delta: Decimal = Decimal('0')):
        """Atualiza posição financeira da holding"""
        self.total_revenue += revenue_delta
        self.total_profit += profit_delta
        self.total_investment += investment_delta
        self.cash_position += (profit_delta - investment_delta)
        self.updated_at = datetime.utcnow()

    def update_operational_metrics(self):
        """Atualiza métricas operacionais agregadas"""
        if not self.subsidiaries:
            return

        total_users = sum(s.active_users for s in self.subsidiaries)
        total_satisfaction = sum(s.customer_satisfaction_score for s in self.subsidiaries)

        self.total_active_users = total_users
        self.average_customer_satisfaction = total_satisfaction / len(self.subsidiaries) if self.subsidiaries else 0.0

        # Calcular índice de inovação baseado na diversidade de tipos de negócio
        business_types = set(s.business_type for s in self.subsidiaries)
        self.innovation_index = min(100.0, len(business_types) * 10.0)

        self.updated_at = datetime.utcnow()

    def get_portfolio_health_score(self) -> float:
        """Calcula saúde geral do portfolio (0-100)"""
        if not self.subsidiaries:
            return 0.0

        # Média ponderada da saúde das subsidiárias
        total_weighted_health = sum(
            subsidiary.get_health_score() * subsidiary.strategic_importance
            for subsidiary in self.subsidiaries
        )
        total_weight = sum(s.strategic_importance for s in self.subsidiaries)

        return round(total_weighted_health / total_weight, 2) if total_weight > 0 else 0.0

    def get_diversification_score(self) -> float:
        """Calcula grau de diversificação do portfolio (0-100)"""
        if not self.subsidiaries:
            return 0.0

        # Diversificação por tipo de negócio
        business_types = len(set(s.business_type for s in self.subsidiaries))

        # Diversificação por modelo de receita
        revenue_models = len(set(s.revenue_model for s in self.subsidiaries))

        # Diversificação por estágio
        stages = len(set(s.status for s in self.subsidiaries))

        diversification = (business_types + revenue_models + stages) / 3.0
        return min(100.0, diversification * 25.0)  # Máximo 100 com 4+ de cada categoria

    def get_agent_performance_score(self) -> float:
        """Calcula performance geral dos agentes (0-100)"""
        if not self.active_agents:
            return 0.0

        high_performers = sum(1 for agent in self.active_agents if agent.is_high_performer())
        return (high_performers / len(self.active_agents)) * 100.0

    def get_innovation_velocity(self) -> float:
        """Calcula velocidade de inovação baseada em oportunidades e subsidiárias criadas"""
        recent_opportunities = sum(1 for opp in self.opportunities_identified
                                 if (datetime.utcnow() - opp.identified_at).days <= 30)
        recent_subsidiaries = sum(1 for sub in self.subsidiaries
                                if (datetime.utcnow() - sub.founded_at).days <= 90)

        return min(100.0, (recent_opportunities + recent_subsidiaries * 2) * 5.0)

    def _create_memory(self, memory_type: MemoryType, content: Dict, owner: str):
        """Cria memória no sistema L.L.B."""
        memory = LLBProtocol(
            memory_type=memory_type,
            content=content,
            owner=owner,
            tags=[memory_type.value, 'holding_event']
        )

        if memory_type.value not in self.memory_system:
            self.memory_system[memory_type.value] = []

        self.memory_system[memory_type.value].append(memory)

    def get_memory_by_type(self, memory_type: MemoryType) -> List[LLBProtocol]:
        """Recupera memórias por tipo"""
        return self.memory_system.get(memory_type.value, [])

    def get_recent_memories(self, days: int = 7) -> List[LLBProtocol]:
        """Recupera memórias recentes"""
        cutoff_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        cutoff_date = cutoff_date.replace(day=cutoff_date.day - days)

        recent_memories = []
        for memories in self.memory_system.values():
            recent_memories.extend([
                memory for memory in memories
                if memory.created_at >= cutoff_date
            ])

        return sorted(recent_memories, key=lambda x: x.created_at, reverse=True)

    def get_executive_summary(self) -> Dict[str, Any]:
        """Gera resumo executivo da holding"""
        return {
            'holding_name': self.name,
            'status': self.status,
            'portfolio_size': len(self.subsidiaries),
            'active_agents': len(self.active_agents),
            'total_revenue': float(self.total_revenue),
            'total_profit': float(self.total_profit),
            'cash_position': float(self.cash_position),
            'portfolio_health_score': self.get_portfolio_health_score(),
            'diversification_score': self.get_diversification_score(),
            'agent_performance_score': self.get_agent_performance_score(),
            'innovation_velocity': self.get_innovation_velocity(),
            'total_active_users': self.total_active_users,
            'average_customer_satisfaction': self.average_customer_satisfaction,
            'opportunities_identified': len(self.opportunities_identified),
            'memory_count': sum(len(memories) for memories in self.memory_system.values())
        }