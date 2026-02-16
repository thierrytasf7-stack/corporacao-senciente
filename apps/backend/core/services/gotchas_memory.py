"""
Gotchas Memory Service - Sistema de Memória de Padrões OAIOS v3.0

Sistema de memória que armazena padrões, erros comuns e soluções
para evolução autônoma do sistema.

Baseado no gotchas-memory.js do aios-core.
"""

import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class GotchaCategory(str, Enum):
    """Categorias de gotchas."""
    ERROR = "error"           # Erros encontrados e soluções
    PATTERN = "pattern"       # Padrões de código/arquitetura
    OPTIMIZATION = "optimization"  # Otimizações aplicadas
    INSIGHT = "insight"       # Insights do sistema
    WARNING = "warning"       # Avisos para evitar problemas


class Gotcha:
    """Representa um gotcha (padrão/erro/solução aprendido)."""
    
    def __init__(
        self,
        id: str,
        title: str,
        description: str,
        category: GotchaCategory,
        context: str,
        solution: Optional[str] = None,
        tags: Optional[List[str]] = None,
        created_at: Optional[str] = None,
        relevance_score: float = 1.0,
        usage_count: int = 0
    ):
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.context = context
        self.solution = solution
        self.tags = tags or []
        self.created_at = created_at or datetime.now().isoformat()
        self.relevance_score = relevance_score
        self.usage_count = usage_count
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category.value if isinstance(self.category, GotchaCategory) else self.category,
            "context": self.context,
            "solution": self.solution,
            "tags": self.tags,
            "created_at": self.created_at,
            "relevance_score": self.relevance_score,
            "usage_count": self.usage_count
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Gotcha":
        return cls(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            category=GotchaCategory(data.get("category", "insight")),
            context=data.get("context", ""),
            solution=data.get("solution"),
            tags=data.get("tags", []),
            created_at=data.get("created_at"),
            relevance_score=data.get("relevance_score", 1.0),
            usage_count=data.get("usage_count", 0)
        )


class GotchasMemory:
    """
    Sistema de Memória de Padrões da Corporação Senciente.
    
    Armazena e recupera gotchas para:
    - Evitar erros repetidos
    - Aplicar padrões aprendidos
    - Otimizar decisões futuras
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        self.storage_path = storage_path or os.path.join(
            os.path.dirname(__file__),
            "..", "..", "..", "data", "gotchas.json"
        )
        self.gotchas: Dict[str, Gotcha] = {}
        self._counter = 0
        self._load()
    
    def _load(self):
        """Carrega gotchas do arquivo."""
        try:
            path = Path(self.storage_path)
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.gotchas = {
                        k: Gotcha.from_dict(v)
                        for k, v in data.get("gotchas", {}).items()
                    }
                    self._counter = data.get("counter", 0)
                    logger.info(f"GotchasMemory: {len(self.gotchas)} gotchas carregados")
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                self._save()
        except Exception as e:
            logger.error(f"Erro ao carregar GotchasMemory: {e}")
            self.gotchas = {}
    
    def _save(self):
        """Salva gotchas no arquivo."""
        try:
            path = Path(self.storage_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            data = {
                "counter": self._counter,
                "gotchas": {k: v.to_dict() for k, v in self.gotchas.items()},
                "updated_at": datetime.now().isoformat()
            }
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Erro ao salvar GotchasMemory: {e}")
    
    def add(
        self,
        title: str,
        description: str,
        category: GotchaCategory,
        context: str,
        solution: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Gotcha:
        """
        Adiciona um novo gotcha à memória.
        
        Args:
            title: Título do gotcha
            description: Descrição detalhada
            category: Categoria (error, pattern, optimization, insight, warning)
            context: Contexto onde foi encontrado
            solution: Solução aplicada (opcional)
            tags: Tags para busca (opcional)
        """
        self._counter += 1
        gotcha_id = f"GOTCHA-{self._counter:04d}"
        
        gotcha = Gotcha(
            id=gotcha_id,
            title=title,
            description=description,
            category=category,
            context=context,
            solution=solution,
            tags=tags
        )
        
        self.gotchas[gotcha_id] = gotcha
        self._save()
        
        logger.info(f"GotchasMemory: Gotcha {gotcha_id} adicionado - {title}")
        return gotcha
    
    def search(
        self,
        query: str,
        category: Optional[GotchaCategory] = None,
        limit: int = 5
    ) -> List[Gotcha]:
        """
        Busca gotchas relevantes por query.
        
        Args:
            query: Termo de busca
            category: Filtrar por categoria
            limit: Limite de resultados
        """
        query_lower = query.lower()
        results = []
        
        for gotcha in self.gotchas.values():
            if category and gotcha.category != category:
                continue
            
            # Calcular score de relevância
            score = 0
            
            if query_lower in gotcha.title.lower():
                score += 3
            
            if query_lower in gotcha.description.lower():
                score += 2
            
            if query_lower in gotcha.context.lower():
                score += 1
            
            for tag in gotcha.tags:
                if query_lower in tag.lower():
                    score += 1
            
            if score > 0:
                results.append((score, gotcha))
        
        # Ordenar por score
        results.sort(key=lambda x: x[0], reverse=True)
        
        # Incrementar uso
        for _, gotcha in results[:limit]:
            gotcha.usage_count += 1
        
        self._save()
        
        return [g for _, g in results[:limit]]
    
    def get_by_category(self, category: GotchaCategory, limit: int = 10) -> List[Gotcha]:
        """Obtém gotchas por categoria."""
        results = [g for g in self.gotchas.values() if g.category == category]
        results.sort(key=lambda g: g.usage_count, reverse=True)
        return results[:limit]
    
    def get_all(self, limit: int = 50) -> List[Gotcha]:
        """Obtém todos os gotchas."""
        results = list(self.gotchas.values())
        results.sort(key=lambda g: g.created_at, reverse=True)
        return results[:limit]
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas da memória."""
        stats = {
            "total": len(self.gotchas),
            "by_category": {}
        }
        
        for gotcha in self.gotchas.values():
            cat = gotcha.category.value if isinstance(gotcha.category, GotchaCategory) else gotcha.category
            if cat not in stats["by_category"]:
                stats["by_category"][cat] = 0
            stats["by_category"][cat] += 1
        
        return stats


# Singleton
_gotchas_memory: Optional[GotchasMemory] = None


def get_gotchas_memory() -> GotchasMemory:
    """Obtém a instância singleton do GotchasMemory."""
    global _gotchas_memory
    if _gotchas_memory is None:
        _gotchas_memory = GotchasMemory()
    return _gotchas_memory


# Auto-adicionar gotchas iniciais do AIOS
def seed_initial_gotchas():
    """Semeia gotchas iniciais do conhecimento AIOS."""
    memory = get_gotchas_memory()
    
    if memory.gotchas:
        return  # Já tem gotchas
    
    initial_gotchas = [
        {
            "title": "Fallback de modelo IA",
            "description": "Sempre implementar fallback entre modelos IA (DashScope → OpenRouter)",
            "category": GotchaCategory.PATTERN,
            "context": "Serviços de IA como Qwen/Aider",
            "solution": "Tentar modelo principal, capturar erro 403/401, fallar para alternativo",
            "tags": ["ia", "fallback", "resiliência"]
        },
        {
            "title": "Mensagens interativas WhatsApp",
            "description": "Baileys requer objetos com buttonId e buttonText, não strings simples",
            "category": GotchaCategory.ERROR,
            "context": "WhatsApp Bridge com Baileys",
            "solution": "Usar {buttonId: 'id', buttonText: {displayText: 'text'}}",
            "tags": ["whatsapp", "baileys", "buttons"]
        },
        {
            "title": "Loop 24/7 com async",
            "description": "Usar asyncio.create_task para não bloquear o event loop",
            "category": GotchaCategory.PATTERN,
            "context": "Orquestrador de tarefas",
            "solution": "asyncio.create_task(loop()) em vez de await direto",
            "tags": ["async", "loop", "orchestrator"]
        },
        {
            "title": "Retry com backoff exponencial",
            "description": "Implementar retry com delay crescente para evitar sobrecarga",
            "category": GotchaCategory.OPTIMIZATION,
            "context": "Chamadas de API externas",
            "solution": "delay = base_delay * (2 ** attempt)",
            "tags": ["retry", "resilience", "api"]
        }
    ]
    
    for gotcha_data in initial_gotchas:
        memory.add(**gotcha_data)
    
    logger.info(f"GotchasMemory: {len(initial_gotchas)} gotchas iniciais adicionados")
