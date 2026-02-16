"""
Value Objects para o domínio da Holding Autônoma
Value Objects são objetos imutáveis que representam conceitos de domínio
"""

from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
from uuid import uuid4


class BusinessType(Enum):
    """Tipos de negócio para subsidiárias"""
    SAAS = "saas"
    TRADING = "trading"
    ECOMMERCE = "ecommerce"
    MARKETPLACE = "marketplace"
    CONSULTING = "consulting"
    RESEARCH = "research"


class SubsidiaryStatus(Enum):
    """Status possíveis de uma subsidiária"""
    PLANNING = "planning"
    DEVELOPMENT = "development"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class AgentRole(Enum):
    """Papéis possíveis para agentes"""
    MARKETING = "marketing"
    SALES = "sales"
    DEVELOPMENT = "development"
    OPERATIONS = "operations"
    FINANCE = "finance"
    RESEARCH = "research"
    MANAGEMENT = "management"


class MemoryType(Enum):
    """Tipos de memória para agentes"""
    LANG = "lang"  # Memória de longo prazo (wisdom)
    LETTA = "letta"  # Memória de curto prazo (state)
    BYTEROVER = "byterover"  # Memória de ação (tools)
    EPISODIC = "episodic"  # Memória episódica
    SEMANTIC = "semantic"  # Memória semântica


class MemoryPriority(Enum):
    """Prioridade de memória"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class MemoryStatus(Enum):
    """Status de memória"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    PENDING = "pending"
    CONSOLIDATING = "consolidating"
    DELETED = "deleted"


@dataclass(frozen=True)
class RevenueTarget:
    """Target de receita para uma subsidiária"""
    monthly_target: Decimal
    growth_rate: float  # Percentage per month (0.0 to 1.0)
    timeframe_months: int

    def calculate_total_target(self) -> Decimal:
        """Calculate total revenue target over timeframe"""
        principal = self.monthly_target * self.timeframe_months
        growth_factor = (1 + self.growth_rate) ** self.timeframe_months
        return principal * Decimal(str(growth_factor))

    def validate(self) -> bool:
        """Validate revenue target constraints"""
        return (
            self.monthly_target > 0 and
            0 <= self.growth_rate <= 2.0 and  # Max 200% growth per month
            1 <= self.timeframe_months <= 120  # 1 month to 10 years
        )


@dataclass(frozen=True)
class AutonomyMetrics:
    """Métricas de autonomia de agentes e subsidiárias"""
    decision_accuracy: float  # 0-100%
    human_intervention_rate: float  # 0-100%
    task_completion_rate: float  # 0-100%
    error_recovery_time_seconds: float

    def calculate_overall_score(self) -> float:
        """Calculate weighted autonomy score"""
        if not self._is_valid():
            return 0.0

        weights = {
            'decision_accuracy': 0.4,
            'human_intervention_rate': -0.3,  # Negative because lower is better
            'task_completion_rate': 0.2,
            'error_recovery_time_seconds': -0.1  # Negative because lower is better
        }

        score = (
            self.decision_accuracy * weights['decision_accuracy'] +
            (100 - self.human_intervention_rate) * abs(weights['human_intervention_rate']) +
            self.task_completion_rate * weights['task_completion_rate'] +
            max(0, 100 - self.error_recovery_time_seconds) * abs(weights['error_recovery_time_seconds'])
        )

        return min(100.0, max(0.0, score))

    def _is_valid(self) -> bool:
        """Validate autonomy metrics"""
        return (
            0 <= self.decision_accuracy <= 100 and
            0 <= self.human_intervention_rate <= 100 and
            0 <= self.task_completion_rate <= 100 and
            self.error_recovery_time_seconds >= 0
        )


@dataclass(frozen=True)
class MarketAnalysis:
    """Análise de mercado para oportunidades de subsidiárias"""
    market_size: Decimal  # TAM (Total Addressable Market)
    market_growth_rate: float  # Annual growth rate (0.0 to 1.0)
    competition_level: str  # "low", "medium", "high"
    entry_barriers: str  # "low", "medium", "high"
    customer_pain_points: list[str]
    estimated_market_share: float  # 0-100%

    def calculate_opportunity_score(self) -> float:
        """Calculate opportunity viability score"""
        if not self._is_valid():
            return 0.0

        # Market attractiveness (40%)
        market_score = min(100, float(self.market_size) / 1000000)  # Scale by $1M

        # Competition factor (30%)
        competition_multiplier = {
            "low": 1.0,
            "medium": 0.7,
            "high": 0.4
        }.get(self.competition_level, 0.5)

        # Entry barriers factor (20%)
        barrier_multiplier = {
            "low": 1.0,
            "medium": 0.8,
            "high": 0.6
        }.get(self.entry_barriers, 0.7)

        # Pain points factor (10%)
        pain_score = min(100, len(self.customer_pain_points) * 20)

        total_score = (
            market_score * 0.4 +
            (market_score * competition_multiplier) * 0.3 +
            (market_score * barrier_multiplier) * 0.2 +
            pain_score * 0.1
        )

        return min(100.0, max(0.0, total_score))

    def _is_valid(self) -> bool:
        """Validate market analysis data"""
        return (
            self.market_size > 0 and
            0 <= self.market_growth_rate <= 2.0 and
            self.competition_level in ["low", "medium", "high"] and
            self.entry_barriers in ["low", "medium", "high"] and
            len(self.customer_pain_points) > 0 and
            0 <= self.estimated_market_share <= 100
        )


@dataclass(frozen=True)
class RiskAssessment:
    """Avaliação de risco para oportunidades"""
    technical_risk: str  # "low", "medium", "high"
    market_risk: str  # "low", "medium", "high"
    financial_risk: str  # "low", "medium", "high"
    operational_risk: str  # "low", "medium", "high"
    mitigation_strategies: list[str]

    def calculate_overall_risk(self) -> str:
        """Calculate overall risk level"""
        risk_levels = [self.technical_risk, self.market_risk,
                      self.financial_risk, self.operational_risk]

        # Count high risks
        high_count = risk_levels.count("high")
        medium_count = risk_levels.count("medium")

        if high_count >= 2:
            return "high"
        elif high_count == 1 or medium_count >= 2:
            return "medium"
        else:
            return "low"

    def get_required_capital(self, opportunity_size: Decimal) -> Decimal:
        """Estimate required capital based on risk"""
        base_multiplier = {
            "low": 0.3,      # 30% of opportunity size
            "medium": 0.5,   # 50% of opportunity size
            "high": 0.8      # 80% of opportunity size
        }.get(self.calculate_overall_risk(), 0.5)

        return opportunity_size * Decimal(str(base_multiplier))


@dataclass(frozen=True)
class SubsidiaryTemplate:
    """Template para criação de subsidiárias"""
    business_type: BusinessType
    name_template: str
    description_template: str
    required_agents: list[AgentRole]
    initial_infrastructure: dict
    monetization_strategy: str
    success_metrics: list[str]

    def generate_name(self, market_segment: str) -> str:
        """Generate subsidiary name from template"""
        return self.name_template.format(market_segment=market_segment)

    def generate_description(self, market_segment: str, opportunity: str) -> str:
        """Generate subsidiary description from template"""
        return self.description_template.format(
            market_segment=market_segment,
            opportunity=opportunity
        )


@dataclass(frozen=True)
class LLBProtocol:
    """Protocolo L.L.B. (LangMem, Letta, ByteRover)"""
    lang_memories: list[dict]  # Long-term wisdom
    letta_memories: list[dict]  # Short-term state
    byterover_tools: list[dict]  # Action tools

    def get_relevant_context(self, query: str, limit: int = 5) -> dict:
        """Get relevant context for a query using L.L.B."""
        # This would implement semantic search across memories
        # For now, return structured context
        return {
            "wisdom": self.lang_memories[:limit],
            "state": self.letta_memories[:limit//2],
            "tools": self.byterover_tools[:limit//2]
        }

    def add_memory(self, content: str, memory_type: MemoryType, metadata: dict = None):
        """Add new memory to appropriate layer"""
        memory_entry = {
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        if memory_type == MemoryType.LANG:
            self.lang_memories.append(memory_entry)
        elif memory_type == MemoryType.LETTA:
            self.letta_memories.append(memory_entry)
        elif memory_type == MemoryType.BYTEROVER:
            self.byterover_tools.append(memory_entry)


@dataclass
class MemoryRetrievalQuery:
    """Query para recuperação de memória"""
    query_text: str
    memory_types: List[MemoryType] = field(default_factory=lambda: [MemoryType.LANG])
    priority_filter: Optional[MemoryPriority] = None
    limit: int = 10
    time_range_hours: Optional[int] = None
    include_archived: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert query to dictionary"""
        return {
            "query_text": self.query_text,
            "memory_types": [mt.value for mt in self.memory_types],
            "priority_filter": self.priority_filter.value if self.priority_filter else None,
            "limit": self.limit,
            "time_range_hours": self.time_range_hours,
            "include_archived": self.include_archived
        }


@dataclass
class MemoryConsolidationResult:
    """Resultado de consolidação de memória"""
    consolidated_count: int
    archived_count: int
    deleted_count: int
    new_patterns_discovered: int
    consolidation_time_ms: float
    errors: List[str] = field(default_factory=list)

    def is_successful(self) -> bool:
        """Check if consolidation was successful"""
        return len(self.errors) == 0

    def summary(self) -> str:
        """Get summary of consolidation"""
        return (
            f"Consolidated: {self.consolidated_count}, "
            f"Archived: {self.archived_count}, "
            f"Deleted: {self.deleted_count}, "
            f"New patterns: {self.new_patterns_discovered}, "
            f"Time: {self.consolidation_time_ms:.2f}ms"
        )


class LLBProtocolManager:
    """Gerenciador do Protocolo L.L.B."""

    def __init__(self):
        self.protocols: Dict[str, LLBProtocol] = {}
        self.consolidation_history: List[MemoryConsolidationResult] = []

    def create_protocol(self, agent_id: str) -> LLBProtocol:
        """Create a new L.L.B. protocol for an agent"""
        protocol = LLBProtocol(
            lang_memories=[],
            letta_memories=[],
            byterover_tools=[]
        )
        self.protocols[agent_id] = protocol
        return protocol

    def get_protocol(self, agent_id: str) -> Optional[LLBProtocol]:
        """Get L.L.B. protocol for an agent"""
        return self.protocols.get(agent_id)

    def store_memory(
        self,
        agent_id: str,
        content: str,
        memory_type: MemoryType,
        priority: MemoryPriority = MemoryPriority.MEDIUM,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Store memory in agent's protocol"""
        protocol = self.protocols.get(agent_id)
        if not protocol:
            protocol = self.create_protocol(agent_id)

        memory_id = str(uuid4())
        memory_entry = {
            "id": memory_id,
            "content": content,
            "priority": priority.value,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        if memory_type == MemoryType.LANG:
            protocol.lang_memories.append(memory_entry)
        elif memory_type == MemoryType.LETTA:
            protocol.letta_memories.append(memory_entry)
        elif memory_type == MemoryType.BYTEROVER:
            protocol.byterover_tools.append(memory_entry)

        return memory_id

    def retrieve_memories(
        self,
        agent_id: str,
        query: MemoryRetrievalQuery
    ) -> List[Dict[str, Any]]:
        """Retrieve memories based on query"""
        protocol = self.protocols.get(agent_id)
        if not protocol:
            return []

        results = []

        for memory_type in query.memory_types:
            if memory_type == MemoryType.LANG:
                results.extend(protocol.lang_memories)
            elif memory_type == MemoryType.LETTA:
                results.extend(protocol.letta_memories)
            elif memory_type == MemoryType.BYTEROVER:
                results.extend(protocol.byterover_tools)

        # Apply priority filter
        if query.priority_filter:
            results = [
                r for r in results
                if r.get("priority") == query.priority_filter.value
            ]

        # Apply limit
        return results[:query.limit]

    def consolidate_memories(self, agent_id: str) -> MemoryConsolidationResult:
        """Consolidate memories for an agent"""
        import time
        start_time = time.time()

        protocol = self.protocols.get(agent_id)
        if not protocol:
            return MemoryConsolidationResult(
                consolidated_count=0,
                archived_count=0,
                deleted_count=0,
                new_patterns_discovered=0,
                consolidation_time_ms=0,
                errors=["Protocol not found"]
            )

        # Simple consolidation: remove duplicates and old low-priority memories
        consolidated = 0
        archived = 0
        deleted = 0
        patterns = 0

        # For now, just count as we're not doing actual consolidation
        total_memories = (
            len(protocol.lang_memories) +
            len(protocol.letta_memories) +
            len(protocol.byterover_tools)
        )

        elapsed_ms = (time.time() - start_time) * 1000

        result = MemoryConsolidationResult(
            consolidated_count=consolidated,
            archived_count=archived,
            deleted_count=deleted,
            new_patterns_discovered=patterns,
            consolidation_time_ms=elapsed_ms
        )

        self.consolidation_history.append(result)
        return result