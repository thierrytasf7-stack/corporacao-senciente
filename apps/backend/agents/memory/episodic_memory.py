"""
Episodic Memory Implementation
Implementação da memória episódica no protocolo L.L.B.
"""

import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from uuid import uuid4

# from ..base.agent_base import BaseAgent  # Removed to avoid circular import
from backend.core.value_objects import (
    LLBProtocol, MemoryType, MemoryPriority, MemoryStatus,
    MemoryRetrievalQuery, MemoryConsolidationResult, LLBProtocolManager
)


class EpisodicMemorySystem:
    """
    Sistema de Memória Episódica
    Gerencia memórias de eventos específicos e experiências
    """

    def __init__(self, storage_path: str = "data/memory/episodic", max_memories: int = 10000):
        self.storage_path = storage_path
        self.max_memories = max_memories
        self.memories: Dict[str, LLBProtocol] = {}
        self.llb_manager = LLBProtocolManager()

        # Criar diretório se não existir
        os.makedirs(storage_path, exist_ok=True)

        # Carregar memórias existentes
        self._load_memories()

    def _load_memories(self):
        """Carrega memórias do armazenamento persistente"""
        try:
            for filename in os.listdir(self.storage_path):
                if filename.endswith('.json'):
                    filepath = os.path.join(self.storage_path, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        memory = LLBProtocol.from_dict(data)
                        self.memories[str(memory.id)] = memory
        except Exception as e:
            print(f"Erro ao carregar memórias episódicas: {e}")

    def _save_memory(self, memory: LLBProtocol):
        """Salva memória no armazenamento persistente"""
        try:
            filename = f"{memory.id}.json"
            filepath = os.path.join(self.storage_path, filename)

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(memory.to_dict(), f, indent=2, default=str)
        except Exception as e:
            print(f"Erro ao salvar memória episódica: {e}")

    def _cleanup_old_memories(self):
        """Remove memórias antigas se exceder o limite"""
        if len(self.memories) <= self.max_memories:
            return

        # Ordenar por importância e data de acesso
        sorted_memories = sorted(
            self.memories.values(),
            key=lambda m: (m.calculate_importance_score(), m.accessed_at),
            reverse=True
        )

        # Manter apenas as mais importantes
        memories_to_keep = sorted_memories[:self.max_memories]
        memories_to_remove = sorted_memories[self.max_memories:]

        # Remover arquivos das memórias antigas
        for memory in memories_to_remove:
            try:
                filename = f"{memory.id}.json"
                filepath = os.path.join(self.storage_path, filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                del self.memories[str(memory.id)]
            except Exception as e:
                print(f"Erro ao remover memória antiga: {e}")

    async def store_episodic_memory(self,
                                  event_data: Dict[str, Any],
                                  owner: str,
                                  context: Optional[Dict[str, Any]] = None,
                                  priority: MemoryPriority = MemoryPriority.MEDIUM) -> LLBProtocol:
        """
        Armazena uma nova memória episódica

        Args:
            event_data: Dados do evento ocorrido
            owner: Proprietário da memória
            context: Contexto adicional do evento
            priority: Prioridade da memória

        Returns:
            LLBProtocol: Memória criada
        """
        # Criar memória usando o manager L.L.B.
        memory = self.llb_manager.create_episodic_memory(event_data, owner)
        memory.priority = priority

        # Adicionar contexto adicional se fornecido
        if context:
            memory.context.update(context)

        # Adicionar metadados específicos de memória episódica
        memory.metadata.update({
            'event_category': event_data.get('event_type', 'unknown'),
            'emotional_valence': event_data.get('emotional_context', 'neutral'),
            'social_context': event_data.get('participants', []),
            'temporal_context': {
                'event_timestamp': event_data.get('timestamp', datetime.utcnow().isoformat()),
                'storage_timestamp': datetime.utcnow().isoformat()
            }
        })

        # Armazenar na memória volátil
        self.memories[str(memory.id)] = memory

        # Persistir
        self._save_memory(memory)

        # Limpeza se necessário
        self._cleanup_old_memories()

        return memory

    async def retrieve_episodic_memories(self,
                                       query: MemoryRetrievalQuery,
                                       agent: Optional[Any] = None) -> List[LLBProtocol]:
        """
        Recupera memórias episódicas baseadas em consulta

        Args:
            query: Consulta de recuperação
            agent: Agente solicitante (para personalização)

        Returns:
            List[LLBProtocol]: Memórias encontradas
        """
        # Filtrar apenas memórias episódicas
        episodic_memories = [
            memory for memory in self.memories.values()
            if memory.memory_type == MemoryType.EPISODIC and
               memory.status == MemoryStatus.ACTIVE
        ]

        # Aplicar filtros da query
        filtered_memories = self._apply_query_filters(episodic_memories, query)

        # Ordenar por relevância
        filtered_memories.sort(
            key=lambda m: self._calculate_episodic_relevance(m, query, agent),
            reverse=True
        )

        # Aplicar limite
        result = filtered_memories[:query.limit]

        # Registrar acesso
        for memory in result:
            memory.access_memory()
            self._save_memory(memory)

        return result

    def _apply_query_filters(self, memories: List[LLBProtocol], query: MemoryRetrievalQuery) -> List[LLBProtocol]:
        """Aplica filtros da query às memórias"""
        filtered = []

        for memory in memories:
            # Filtro de prioridade
            if query.priority_filter and memory.priority.value not in query.priority_filter:
                continue

            # Filtro de status
            if query.status_filter and memory.status.value not in query.status_filter:
                continue

            # Filtro de importância mínima
            if memory.calculate_importance_score() < query.min_importance_score:
                continue

            # Filtro de decaimento máximo
            if memory.decay_factor > query.max_decay_factor:
                continue

            # Filtros de conteúdo específicos para episódico
            if query.content_filter:
                if not self._matches_episodic_content(memory, query.content_filter):
                    continue

            # Filtros de contexto
            if query.context_filter:
                if not self._matches_context(memory, query.context_filter):
                    continue

            # Filtros de metadados
            if query.metadata_filter:
                if not self._matches_metadata(memory, query.metadata_filter):
                    continue

            filtered.append(memory)

        return filtered

    def _matches_episodic_content(self, memory: LLBProtocol, content_filter: Dict[str, Any]) -> bool:
        """Verifica se memória episódica corresponde ao filtro de conteúdo"""
        content = memory.content

        # Filtros específicos de eventos episódicos
        if 'event_type' in content_filter:
            if content.get('event_type') != content_filter['event_type']:
                return False

        if 'participants' in content_filter:
            required_participants = set(content_filter['participants'])
            memory_participants = set(content.get('participants', []))
            if not required_participants.issubset(memory_participants):
                return False

        if 'emotional_context' in content_filter:
            if content.get('emotional_context') != content_filter['emotional_context']:
                return False

        if 'outcome' in content_filter:
            if content_filter['outcome'] not in content.get('outcome', ''):
                return False

        return True

    def _matches_context(self, memory: LLBProtocol, context_filter: Dict[str, Any]) -> bool:
        """Verifica se memória corresponde ao filtro de contexto"""
        context = memory.context

        for key, value in context_filter.items():
            if key not in context or context[key] != value:
                return False

        return True

    def _matches_metadata(self, memory: LLBProtocol, metadata_filter: Dict[str, Any]) -> bool:
        """Verifica se memória corresponde ao filtro de metadados"""
        metadata = memory.metadata

        for key, value in metadata_filter.items():
            if key not in metadata or metadata[key] != value:
                return False

        return True

    def _calculate_episodic_relevance(self,
                                    memory: LLBProtocol,
                                    query: MemoryRetrievalQuery,
                                    agent: Optional[Any] = None) -> float:
        """
        Calcula relevância de uma memória episódica para a query
        """
        relevance = memory.calculate_importance_score()

        # Bonus por similaridade temporal (eventos recentes são mais relevantes)
        days_since_event = (datetime.utcnow() - memory.created_at).days
        temporal_bonus = max(0, 1.0 - (days_since_event / 365))  # Decai ao longo de 1 ano
        relevance += temporal_bonus * 0.2

        # Bonus por similaridade emocional (se agente fornecido)
        if agent and hasattr(agent, 'emotional_state'):
            memory_emotion = memory.metadata.get('emotional_valence', 'neutral')
            agent_emotion = getattr(agent, 'emotional_state', 'neutral')
            if memory_emotion == agent_emotion:
                relevance += 0.3

        # Bonus por similaridade social (se agente fornecido)
        if agent and hasattr(agent, 'social_context'):
            memory_participants = set(memory.metadata.get('social_context', []))
            agent_context = set(getattr(agent, 'social_context', []))
            overlap = len(memory_participants.intersection(agent_context))
            social_bonus = min(0.4, overlap * 0.1)
            relevance += social_bonus

        return min(1.0, relevance)

    async def consolidate_episodic_memories(self,
                                          memory_ids: List[str],
                                          consolidation_type: str = "pattern_extraction") -> MemoryConsolidationResult:
        """
        Consolida múltiplas memórias episódicas em uma memória semântica

        Args:
            memory_ids: IDs das memórias a consolidar
            consolidation_type: Tipo de consolidação

        Returns:
            MemoryConsolidationResult: Resultado da consolidação
        """
        # Buscar memórias
        memories_to_consolidate = [
            self.memories[mid] for mid in memory_ids
            if mid in self.memories and self.memories[mid].memory_type == MemoryType.EPISODIC
        ]

        if len(memories_to_consolidate) < 2:
            raise ValueError("Pelo menos 2 memórias são necessárias para consolidação")

        # Extrair padrões comuns
        consolidated_content = self._extract_patterns_from_episodic_memories(
            memories_to_consolidate, consolidation_type
        )

        # Criar memória semântica consolidada
        consolidated_memory = LLBProtocol(
            memory_type=MemoryType.SEMANTIC,
            priority=MemoryPriority.HIGH,
            content=consolidated_content,
            context={
                'consolidation_type': consolidation_type,
                'source_memories_count': len(memories_to_consolidate),
                'time_period': self._calculate_time_period(memories_to_consolidate)
            },
            owner='episodic_memory_system',
            tags=['consolidated', 'episodic_to_semantic', consolidation_type]
        )

        # Adicionar metadados de consolidação
        consolidated_memory.metadata.update({
            'consolidation_info': {
                'method': consolidation_type,
                'timestamp': datetime.utcnow().isoformat(),
                'source_memory_types': list(set(m.memory_type.value for m in memories_to_consolidate))
            }
        })

        # Calcular confiança baseada na consistência dos padrões
        confidence = self._calculate_consolidation_confidence(memories_to_consolidate)
        consolidated_memory.confidence_score = confidence

        # Armazenar memória consolidada
        self.memories[str(consolidated_memory.id)] = consolidated_memory
        self._save_memory(consolidated_memory)

        # Marcar memórias fonte como consolidadas
        for memory in memories_to_consolidate:
            memory.status = MemoryStatus.CONSOLIDATED
            memory.add_relationship(str(consolidated_memory.id), 'consolidated_into')
            self._save_memory(memory)

        return MemoryConsolidationResult(
            consolidated_memory=consolidated_memory,
            source_memories=memory_ids,
            consolidation_method=consolidation_type,
            confidence_score=confidence,
            created_at=datetime.utcnow()
        )

    def _extract_patterns_from_episodic_memories(self,
                                               memories: List[LLBProtocol],
                                               consolidation_type: str) -> Dict[str, Any]:
        """Extrai padrões das memórias episódicas"""
        if consolidation_type == "pattern_extraction":
            return self._extract_behavioral_patterns(memories)
        elif consolidation_type == "lesson_learning":
            return self._extract_lessons_learned(memories)
        elif consolidation_type == "outcome_analysis":
            return self._extract_outcome_patterns(memories)
        else:
            return self._extract_general_patterns(memories)

    def _extract_behavioral_patterns(self, memories: List[LLBProtocol]) -> Dict[str, Any]:
        """Extrai padrões comportamentais"""
        event_types = {}
        outcomes = {}
        emotional_patterns = {}

        for memory in memories:
            content = memory.content

            # Contar tipos de evento
            event_type = content.get('event_type', 'unknown')
            event_types[event_type] = event_types.get(event_type, 0) + 1

            # Contar outcomes
            outcome = content.get('outcome', 'unknown')
            outcomes[outcome] = outcomes.get(outcome, 0) + 1

            # Padrões emocionais
            emotion = memory.metadata.get('emotional_valence', 'neutral')
            emotional_patterns[emotion] = emotional_patterns.get(emotion, 0) + 1

        return {
            'subject': 'Padrões Comportamentais Consolidado',
            'facts': [
                f"Principais tipos de evento: {', '.join(f'{k} ({v})' for k, v in event_types.items())}",
                f"Padrões de resultado: {', '.join(f'{k} ({v})' for k, v in outcomes.items())}",
                f"Padrões emocionais: {', '.join(f'{k} ({v})' for k, v in emotional_patterns.items())}"
            ],
            'relationships': {
                'behavioral_patterns': list(event_types.keys()),
                'outcome_patterns': list(outcomes.keys()),
                'emotional_patterns': list(emotional_patterns.keys())
            }
        }

    def _extract_lessons_learned(self, memories: List[LLBProtocol]) -> Dict[str, Any]:
        """Extrai lições aprendidas"""
        all_lessons = []
        for memory in memories:
            lessons = memory.content.get('lessons_learned', [])
            all_lessons.extend(lessons)

        # Consolidar lições similares
        consolidated_lessons = self._consolidate_similar_lessons(all_lessons)

        return {
            'subject': 'Lições Aprendidas Consolidado',
            'facts': consolidated_lessons,
            'relationships': {
                'lesson_categories': self._categorize_lessons(consolidated_lessons),
                'application_domains': ['operational', 'strategic', 'technical']
            }
        }

    def _extract_outcome_patterns(self, memories: List[LLBProtocol]) -> Dict[str, Any]:
        """Extrai padrões de resultado"""
        success_factors = {}
        failure_factors = {}

        for memory in memories:
            content = memory.content
            outcome = content.get('outcome', '').lower()

            if 'success' in outcome or 'positive' in outcome:
                factors = content.get('success_factors', [])
                for factor in factors:
                    success_factors[factor] = success_factors.get(factor, 0) + 1
            elif 'failure' in outcome or 'negative' in outcome:
                factors = content.get('failure_factors', [])
                for factor in factors:
                    failure_factors[factor] = failure_factors.get(factor, 0) + 1

        return {
            'subject': 'Padrões de Resultado Consolidado',
            'facts': [
                f"Fatores de sucesso: {', '.join(f'{k} ({v})' for k, v in success_factors.items())}",
                f"Fatores de falha: {', '.join(f'{k} ({v})' for k, v in failure_factors.items())}"
            ],
            'relationships': {
                'success_drivers': list(success_factors.keys()),
                'failure_causes': list(failure_factors.keys()),
                'outcome_predictors': list(set(success_factors.keys()) | set(failure_factors.keys()))
            }
        }

    def _extract_general_patterns(self, memories: List[LLBProtocol]) -> Dict[str, Any]:
        """Extrai padrões gerais"""
        # Implementação simplificada
        return {
            'subject': 'Padrões Gerais Consolidado',
            'facts': ['Padrões identificados através de análise estatística'],
            'relationships': {
                'general_patterns': ['temporal', 'contextual', 'behavioral']
            }
        }

    def _consolidate_similar_lessons(self, lessons: List[str]) -> List[str]:
        """Consolida lições similares"""
        # Implementação simplificada - em produção usaria NLP
        unique_lessons = list(set(lessons))
        return unique_lessons[:10]  # Limitar a 10 lições principais

    def _categorize_lessons(self, lessons: List[str]) -> List[str]:
        """Categoriza lições"""
        # Implementação simplificada
        return ['operational', 'strategic', 'technical']

    def _calculate_time_period(self, memories: List[LLBProtocol]) -> str:
        """Calcula período temporal coberto pelas memórias"""
        if not memories:
            return "unknown"

        timestamps = [m.created_at for m in memories]
        start_date = min(timestamps)
        end_date = max(timestamps)

        days_diff = (end_date - start_date).days

        if days_diff < 7:
            return "week"
        elif days_diff < 30:
            return "month"
        elif days_diff < 365:
            return "year"
        else:
            return "multi_year"

    def _calculate_consolidation_confidence(self, memories: List[LLBProtocol]) -> float:
        """Calcula confiança da consolidação baseada na consistência"""
        if len(memories) < 2:
            return 0.5

        # Calcular consistência dos tipos de evento
        event_types = [m.content.get('event_type', 'unknown') for m in memories]
        unique_events = len(set(event_types))
        consistency = 1.0 - (unique_events / len(memories))

        # Fator de qualidade das memórias
        avg_confidence = sum(m.confidence_score for m in memories) / len(memories)

        return min(1.0, (consistency + avg_confidence) / 2)

    async def get_memory_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas do sistema de memória episódica"""
        memories_list = list(self.memories.values())

        stats = self.llb_manager.get_memory_statistics(memories_list)
        stats.update({
            'episodic_specific': {
                'total_episodic_memories': len([m for m in memories_list if m.memory_type == MemoryType.EPISODIC]),
                'active_episodic_memories': len([m for m in memories_list if m.memory_type == MemoryType.EPISODIC and m.status == MemoryStatus.ACTIVE]),
                'recent_events_7d': len([m for m in memories_list if m.memory_type == MemoryType.EPISODIC and (datetime.utcnow() - m.created_at).days <= 7]),
                'emotional_distribution': self._get_emotional_distribution(memories_list)
            }
        })

        return stats

    def _get_emotional_distribution(self, memories: List[LLBProtocol]) -> Dict[str, int]:
        """Retorna distribuição emocional das memórias"""
        emotions = {}
        for memory in memories:
            if memory.memory_type == MemoryType.EPISODIC:
                emotion = memory.metadata.get('emotional_valence', 'neutral')
                emotions[emotion] = emotions.get(emotion, 0) + 1

        return emotions

    async def cleanup_expired_memories(self):
        """Remove memórias expiradas"""
        current_time = datetime.utcnow()
        expired_ids = []

        for memory_id, memory in self.memories.items():
            if memory.expires_at and current_time > memory.expires_at:
                expired_ids.append(memory_id)

        for memory_id in expired_ids:
            memory = self.memories[memory_id]
            memory.status = MemoryStatus.FORGOTTEN
            self._save_memory(memory)
            # Não remover completamente, apenas marcar como forgotten