"""
LLB Protocol Value Object
Protocolo LangMem, Letta, ByteRover para memória e cognição
"""

from enum import Enum
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4


class MemoryType(Enum):
    """Tipos de memória no protocolo L.L.B."""
    EPISODIC = "episodic"          # Memória episódica (eventos específicos)
    SEMANTIC = "semantic"          # Memória semântica (conhecimento factual)
    PROCEDURAL = "procedural"      # Memória procedural (habilidades/processos)
    EMOTIONAL = "emotional"        # Memória emocional (sentimentos associados)
    META_LEARNING = "meta_learning" # Memória meta (aprendizado sobre aprendizado)
    KNOWLEDGE_TRANSFER = "knowledge_transfer" # Transferência de conhecimento
    FEDERATED_LEARNING = "federated_learning" # Aprendizado federado
    CONTEXTUAL_ADAPTATION = "contextual_adaptation" # Adaptação contextual
    EMERGENT_INSIGHTS = "emergent_insights" # Insights emergentes


class MemoryPriority(Enum):
    """Prioridade da memória"""
    CRITICAL = "critical"      # Essencial para operações
    HIGH = "high"             # Alta prioridade
    MEDIUM = "medium"         # Prioridade média
    LOW = "low"              # Baixa prioridade
    ARCHIVAL = "archival"    # Arquivamento


class MemoryStatus(Enum):
    """Status da memória"""
    ACTIVE = "active"         # Ativa e acessível
    DECAYING = "decaying"     # Em processo de decaimento
    CONSOLIDATED = "consolidated" # Consolidada em conhecimento
    ARCHIVED = "archived"     # Arquivada
    FORGOTTEN = "forgotten"   # Esquecida/perdida


class LLBProtocol(BaseModel):
    """Protocolo L.L.B. para armazenamento e recuperação de memória"""
    id: str = Field(default_factory=lambda: str(uuid4()), description="ID único da memória")
    memory_type: MemoryType = Field(..., description="Tipo de memória")
    priority: MemoryPriority = Field(default=MemoryPriority.MEDIUM, description="Prioridade da memória")

    # Conteúdo da memória
    content: Dict[str, Any] = Field(..., description="Conteúdo estruturado da memória")
    context: Dict[str, Any] = Field(default_factory=dict, description="Contexto associado")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadados adicionais")

    # Controle temporal
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Quando foi criada")
    accessed_at: datetime = Field(default_factory=datetime.utcnow, description="Último acesso")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Última atualização")
    expires_at: Optional[datetime] = Field(None, description="Quando expira")

    # Controle de qualidade
    confidence_score: float = Field(default=1.0, description="Pontuação de confiança (0-1)", ge=0, le=1)
    relevance_score: float = Field(default=1.0, description="Pontuação de relevância (0-1)", ge=0, le=1)
    decay_factor: float = Field(default=0.0, description="Fator de decaimento (0-1)", ge=0, le=1)

    # Relacionamentos
    related_memories: List[str] = Field(default_factory=list, description="IDs de memórias relacionadas")
    tags: List[str] = Field(default_factory=list, description="Tags para categorização")

    # Controle de acesso
    access_permissions: Dict[str, Any] = Field(default_factory=dict, description="Permissões de acesso")
    owner: str = Field(..., description="Proprietário da memória")

    # Status e controle
    status: MemoryStatus = Field(default=MemoryStatus.ACTIVE, description="Status atual da memória")
    version: int = Field(default=1, description="Versão da memória")

    def calculate_importance_score(self) -> float:
        """Calcula pontuação de importância da memória"""
        # Fórmula: (prioridade + confiança + relevância) / 3 * (1 - decay_factor)
        priority_weights = {
            MemoryPriority.CRITICAL: 1.0,
            MemoryPriority.HIGH: 0.8,
            MemoryPriority.MEDIUM: 0.6,
            MemoryPriority.LOW: 0.4,
            MemoryPriority.ARCHIVAL: 0.2
        }

        priority_score = priority_weights.get(self.priority, 0.5)
        base_score = (priority_score + self.confidence_score + self.relevance_score) / 3
        importance_score = base_score * (1 - self.decay_factor)

        return max(0.0, min(1.0, importance_score))

    def should_consolidate(self) -> bool:
        """Verifica se a memória deve ser consolidada"""
        # Consolidar se importância alta e acessada recentemente
        importance = self.calculate_importance_score()
        days_since_access = (datetime.utcnow() - self.accessed_at).days

        return importance >= 0.7 and days_since_access <= 30

    def should_archive(self) -> bool:
        """Verifica se a memória deve ser arquivada"""
        importance = self.calculate_importance_score()
        days_since_access = (datetime.utcnow() - self.accessed_at).days

        return importance < 0.3 and days_since_access > 90

    def apply_decay(self, current_time: datetime = None) -> None:
        """Aplica decaimento natural da memória"""
        if current_time is None:
            current_time = datetime.utcnow()

        # Diferentes taxas de decaimento por tipo de memória
        decay_rates = {
            MemoryType.EPISODIC: 0.02,      # Decai rápido
            MemoryType.SEMANTIC: 0.005,     # Decai devagar
            MemoryType.PROCEDURAL: 0.001,   # Muito estável
            MemoryType.EMOTIONAL: 0.01,     # Decai moderadamente
            MemoryType.META_LEARNING: 0.003, # Relativamente estável
            MemoryType.KNOWLEDGE_TRANSFER: 0.007,
            MemoryType.FEDERATED_LEARNING: 0.004,
            MemoryType.CONTEXTUAL_ADAPTATION: 0.008,
            MemoryType.EMERGENT_INSIGHTS: 0.006
        }

        base_decay = decay_rates.get(self.memory_type, 0.01)
        days_since_creation = (current_time - self.created_at).days
        days_since_access = (current_time - self.accessed_at).days

        # Decaimento baseado em tempo e uso
        time_decay = min(0.5, days_since_creation * base_decay / 365)
        access_decay = min(0.3, days_since_access * base_decay / 30)

        self.decay_factor = min(0.9, self.decay_factor + time_decay + access_decay)

        # Atualizar status baseado no decaimento
        if self.decay_factor >= 0.7:
            self.status = MemoryStatus.DECAYING
        elif self.decay_factor >= 0.9:
            self.status = MemoryStatus.FORGOTTEN

    def access_memory(self) -> None:
        """Registra acesso à memória"""
        self.accessed_at = datetime.utcnow()

        # Reduzir decaimento com acesso
        self.decay_factor = max(0, self.decay_factor - 0.05)

        # Aumentar relevância com acesso frequente
        self.relevance_score = min(1.0, self.relevance_score + 0.01)

    def update_content(self, new_content: Dict[str, Any], updated_by: str) -> None:
        """Atualiza conteúdo da memória"""
        self.content.update(new_content)
        self.updated_at = datetime.utcnow()
        self.version += 1

        # Registrar atualização nos metadados
        if 'update_history' not in self.metadata:
            self.metadata['update_history'] = []

        self.metadata['update_history'].append({
            'timestamp': self.updated_at.isoformat(),
            'updated_by': updated_by,
            'version': self.version
        })

    def add_relationship(self, related_memory_id: str, relationship_type: str = "related") -> None:
        """Adiciona relacionamento com outra memória"""
        if related_memory_id not in self.related_memories:
            self.related_memories.append(related_memory_id)

        # Adicionar aos metadados
        if 'relationships' not in self.metadata:
            self.metadata['relationships'] = {}

        self.metadata['relationships'][related_memory_id] = {
            'type': relationship_type,
            'added_at': datetime.utcnow().isoformat()
        }

    def get_memory_summary(self) -> Dict[str, Any]:
        """Retorna resumo da memória para indexação"""
        return {
            'id': self.id,
            'type': self.memory_type.value,
            'priority': self.priority.value,
            'importance_score': self.calculate_importance_score(),
            'status': self.status.value,
            'tags': self.tags,
            'created_at': self.created_at.isoformat(),
            'accessed_at': self.accessed_at.isoformat(),
            'content_preview': str(self.content)[:200] + "..." if len(str(self.content)) > 200 else str(self.content)
        }

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário para serialização"""
        return {
            'id': self.id,
            'memory_type': self.memory_type.value,
            'priority': self.priority.value,
            'content': self.content,
            'context': self.context,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'accessed_at': self.accessed_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'confidence_score': self.confidence_score,
            'relevance_score': self.relevance_score,
            'decay_factor': self.decay_factor,
            'related_memories': self.related_memories,
            'tags': self.tags,
            'access_permissions': self.access_permissions,
            'owner': self.owner,
            'status': self.status.value,
            'version': self.version
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LLBProtocol':
        """Cria instância a partir de dicionário"""
        # Converter strings para enums
        data['memory_type'] = MemoryType(data['memory_type'])
        data['priority'] = MemoryPriority(data['priority'])
        data['status'] = MemoryStatus(data['status'])

        # Converter strings ISO para datetime
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['accessed_at'] = datetime.fromisoformat(data['accessed_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        if data.get('expires_at'):
            data['expires_at'] = datetime.fromisoformat(data['expires_at'])

        return cls(**data)

    class Config:
        """Configuração Pydantic"""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class MemoryRetrievalQuery(BaseModel):
    """Query para recuperação de memórias"""
    query_type: str = Field(..., description="Tipo de query (semantic, temporal, contextual)")
    content_filter: Dict[str, Any] = Field(default_factory=dict, description="Filtros de conteúdo")
    context_filter: Dict[str, Any] = Field(default_factory=dict, description="Filtros de contexto")
    metadata_filter: Dict[str, Any] = Field(default_factory=dict, description="Filtros de metadados")
    memory_types: List[MemoryType] = Field(default_factory=list, description="Tipos de memória a incluir")
    priority_filter: List[MemoryPriority] = Field(default_factory=list, description="Prioridades a incluir")
    status_filter: List[MemoryStatus] = Field(default_factory=list, description="Status a incluir")
    min_importance_score: float = Field(default=0.0, description="Pontuação mínima de importância", ge=0, le=1)
    max_decay_factor: float = Field(default=1.0, description="Fator máximo de decaimento", ge=0, le=1)
    limit: int = Field(default=10, description="Número máximo de resultados", gt=0)
    sort_by: str = Field(default="importance_score", description="Campo para ordenação")
    sort_order: str = Field(default="desc", description="Ordem de ordenação (asc/desc)")


class MemoryConsolidationResult(BaseModel):
    """Resultado da consolidação de memórias"""
    consolidated_memory: LLBProtocol = Field(..., description="Memória consolidada")
    source_memories: List[str] = Field(..., description="IDs das memórias fonte")
    consolidation_method: str = Field(..., description="Método de consolidação usado")
    confidence_score: float = Field(..., description="Pontuação de confiança da consolidação", ge=0, le=1)
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Quando foi consolidada")


class LLBProtocolManager:
    """Gerenciador do protocolo L.L.B."""

    def __init__(self):
        self.memory_types = list(MemoryType)
        self.priority_levels = list(MemoryPriority)
        self.status_levels = list(MemoryStatus)

    def create_episodic_memory(self, event_data: Dict[str, Any], owner: str) -> LLBProtocol:
        """Cria memória episódica"""
        content = {
            'event_type': event_data.get('event_type', 'unknown'),
            'description': event_data.get('description', ''),
            'participants': event_data.get('participants', []),
            'outcome': event_data.get('outcome', ''),
            'lessons_learned': event_data.get('lessons_learned', [])
        }

        context = {
            'timestamp': event_data.get('timestamp', datetime.utcnow()),
            'location': event_data.get('location', 'unknown'),
            'emotional_context': event_data.get('emotional_context', 'neutral')
        }

        return LLBProtocol(
            memory_type=MemoryType.EPISODIC,
            priority=self._infer_priority_from_event(event_data),
            content=content,
            context=context,
            owner=owner,
            tags=['episodic', event_data.get('event_type', 'unknown')]
        )

    def create_semantic_memory(self, knowledge_data: Dict[str, Any], owner: str) -> LLBProtocol:
        """Cria memória semântica"""
        content = {
            'subject': knowledge_data.get('subject', ''),
            'facts': knowledge_data.get('facts', []),
            'relationships': knowledge_data.get('relationships', {}),
            'verification_status': knowledge_data.get('verification_status', 'unverified')
        }

        context = {
            'domain': knowledge_data.get('domain', 'general'),
            'source_reliability': knowledge_data.get('source_reliability', 'unknown'),
            'last_verified': knowledge_data.get('last_verified')
        }

        return LLBProtocol(
            memory_type=MemoryType.SEMANTIC,
            priority=self._infer_priority_from_knowledge(knowledge_data),
            content=content,
            context=context,
            owner=owner,
            tags=['semantic', knowledge_data.get('domain', 'general')]
        )

    def create_procedural_memory(self, process_data: Dict[str, Any], owner: str) -> LLBProtocol:
        """Cria memória procedural"""
        content = {
            'process_name': process_data.get('process_name', ''),
            'steps': process_data.get('steps', []),
            'required_resources': process_data.get('required_resources', []),
            'success_criteria': process_data.get('success_criteria', []),
            'common_pitfalls': process_data.get('common_pitfalls', [])
        }

        context = {
            'applicability_domain': process_data.get('applicability_domain', 'general'),
            'complexity_level': process_data.get('complexity_level', 'medium'),
            'execution_frequency': process_data.get('execution_frequency', 'occasional')
        }

        return LLBProtocol(
            memory_type=MemoryType.PROCEDURAL,
            priority=self._infer_priority_from_process(process_data),
            content=content,
            context=context,
            owner=owner,
            tags=['procedural', process_data.get('process_name', 'unknown')]
        )

    def _infer_priority_from_event(self, event_data: Dict[str, Any]) -> MemoryPriority:
        """Infere prioridade baseada no tipo de evento"""
        event_type = event_data.get('event_type', '')

        critical_events = ['system_failure', 'security_breach', 'major_decision']
        high_events = ['project_completion', 'strategy_change', 'partnership_formation']

        if any(critical in event_type.lower() for critical in critical_events):
            return MemoryPriority.CRITICAL
        elif any(high in event_type.lower() for high in high_events):
            return MemoryPriority.HIGH
        else:
            return MemoryPriority.MEDIUM

    def _infer_priority_from_knowledge(self, knowledge_data: Dict[str, Any]) -> MemoryPriority:
        """Infere prioridade baseada no conhecimento"""
        domain = knowledge_data.get('domain', '')

        critical_domains = ['security', 'compliance', 'strategy']
        high_domains = ['technology', 'market_intelligence', 'finance']

        if any(critical in domain.lower() for critical in critical_domains):
            return MemoryPriority.CRITICAL
        elif any(high in domain.lower() for high in high_domains):
            return MemoryPriority.HIGH
        else:
            return MemoryPriority.MEDIUM

    def _infer_priority_from_process(self, process_data: Dict[str, Any]) -> MemoryPriority:
        """Infere prioridade baseada no processo"""
        complexity = process_data.get('complexity_level', 'medium')
        frequency = process_data.get('execution_frequency', 'occasional')

        if complexity == 'high' or frequency == 'daily':
            return MemoryPriority.HIGH
        elif complexity == 'low' and frequency == 'rare':
            return MemoryPriority.LOW
        else:
            return MemoryPriority.MEDIUM

    def get_memory_statistics(self, memories: List[LLBProtocol]) -> Dict[str, Any]:
        """Calcula estatísticas das memórias"""
        stats = {
            'total_memories': len(memories),
            'by_type': {},
            'by_priority': {},
            'by_status': {},
            'average_importance': 0.0,
            'average_decay': 0.0,
            'active_memories': 0
        }

        for memory in memories:
            # Por tipo
            mem_type = memory.memory_type.value
            stats['by_type'][mem_type] = stats['by_type'].get(mem_type, 0) + 1

            # Por prioridade
            priority = memory.priority.value
            stats['by_priority'][priority] = stats['by_priority'].get(priority, 0) + 1

            # Por status
            status = memory.status.value
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

            # Estatísticas numéricas
            stats['average_importance'] += memory.calculate_importance_score()
            stats['average_decay'] += memory.decay_factor

            if memory.status == MemoryStatus.ACTIVE:
                stats['active_memories'] += 1

        if memories:
            stats['average_importance'] /= len(memories)
            stats['average_decay'] /= len(memories)

        return stats