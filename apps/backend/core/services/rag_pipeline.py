"""
RAG Pipeline - Retrieve-Then-Generate
Pipeline completo de RAG para correção de fatos baseada na Truth Base
"""

import os
import json
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from .qdrant_client import QdrantVectorStore
from .embedder import EmbedderService


class RAGPipeline:
    """Pipeline RAG para Diana Truth Base"""

    def __init__(
        self,
        qdrant_client: Optional[QdrantVectorStore] = None,
        embedder: Optional[EmbedderService] = None,
        cache_ttl_days: int = 7
    ):
        """
        Inicializar pipeline RAG

        Args:
            qdrant_client: Cliente Qdrant (cria novo se não fornecido)
            embedder: Serviço de embeddings (cria novo se não fornecido)
            cache_ttl_days: TTL do cache em dias
        """
        self.qdrant = qdrant_client or QdrantVectorStore()
        self.embedder = embedder or EmbedderService()
        self.cache_ttl_days = cache_ttl_days

        # Cache em memória (Redis seria melhor para produção)
        self._cache: Dict[str, Dict[str, Any]] = {}

        # Estatísticas
        self.stats = {
            "queries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_latency_ms": 0
        }

    def _cache_key(self, query: str, filters: Optional[Dict] = None) -> str:
        """Gerar chave de cache para query"""
        cache_str = f"{query}_{json.dumps(filters or {}, sort_keys=True)}"
        return hashlib.md5(cache_str.encode()).hexdigest()

    def _is_cache_valid(self, cached_item: Dict[str, Any]) -> bool:
        """Verificar se item em cache ainda é válido"""
        cached_at = datetime.fromisoformat(cached_item["cached_at"])
        ttl = timedelta(days=self.cache_ttl_days)
        return datetime.utcnow() - cached_at < ttl

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.8,
        filters: Optional[Dict[str, Any]] = None,
        use_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Recuperar documentos relevantes da Truth Base

        Args:
            query: Query em linguagem natural
            top_k: Número de documentos a retornar
            score_threshold: Threshold mínimo de similaridade
            filters: Filtros de metadata
            use_cache: Usar cache se disponível

        Returns:
            Lista de documentos ranqueados
        """
        start_time = datetime.utcnow()

        # Verificar cache
        cache_key = self._cache_key(query, filters)
        if use_cache and cache_key in self._cache:
            cached = self._cache[cache_key]
            if self._is_cache_valid(cached):
                self.stats["cache_hits"] += 1
                self.stats["queries"] += 1
                print(f"💾 Cache HIT: {query[:50]}...")
                return cached["documents"]

        self.stats["cache_misses"] += 1

        # Gerar embedding da query
        try:
            query_vector = self.embedder.embed_text_sync(query)
        except Exception as e:
            print(f"❌ Erro ao gerar embedding: {e}")
            return []

        # Buscar no Qdrant
        documents = self.qdrant.search(
            query_vector=query_vector,
            limit=top_k,
            score_threshold=score_threshold,
            filters=filters
        )

        # Salvar em cache
        if use_cache:
            self._cache[cache_key] = {
                "documents": documents,
                "cached_at": datetime.utcnow().isoformat(),
                "query": query
            }

        # Atualizar stats
        latency = (datetime.utcnow() - start_time).total_seconds() * 1000
        self.stats["total_latency_ms"] += latency
        self.stats["queries"] += 1

        print(f"🔍 Retrieved {len(documents)} docs em {latency:.0f}ms")
        return documents

    def generate_with_context(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        include_citations: bool = True
    ) -> Dict[str, Any]:
        """
        Gerar prompt com contexto dos documentos retriados

        Args:
            query: Query original
            retrieved_docs: Documentos retriados
            include_citations: Incluir citações no prompt

        Returns:
            Prompt formatado + metadata
        """
        # Construir contexto
        context_parts = []

        for i, doc in enumerate(retrieved_docs):
            citation = f"[Fonte: {doc['file']}#{doc.get('section', 'N/A')}]"
            content = doc["content"]

            context_parts.append(
                f"--- DOCUMENTO {i+1} (Score: {doc['score']:.2f}) ---\n"
                f"{content}\n"
                f"{citation if include_citations else ''}\n"
            )

        context = "\n".join(context_parts)

        # Construir prompt
        prompt = f"""Você deve responder baseado APENAS nos documentos da Truth Base fornecidos abaixo.

CONTEXTO DA TRUTH BASE:
{context}

QUERY: {query}

INSTRUÇÕES:
- Responda APENAS com informações presentes nos documentos acima
- Se a resposta não estiver nos documentos, diga "Não há informação sobre isso na Truth Base"
- Inclua citações no formato [Fonte: arquivo#seção] ao final de cada parágrafo
- Seja factual e preciso

RESPOSTA:"""

        return {
            "prompt": prompt,
            "context": context,
            "num_sources": len(retrieved_docs),
            "sources": [
                {
                    "file": doc["file"],
                    "section": doc.get("section", ""),
                    "score": doc["score"]
                }
                for doc in retrieved_docs
            ]
        }

    def retrieve_then_generate(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.8,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Pipeline completo: retrieve + generate

        Args:
            query: Query em linguagem natural
            top_k: Número de documentos
            score_threshold: Threshold de similaridade
            filters: Filtros de metadata

        Returns:
            Prompt formatado + metadata + fontes
        """
        # Step 1: Retrieve
        documents = self.retrieve(
            query=query,
            top_k=top_k,
            score_threshold=score_threshold,
            filters=filters
        )

        if not documents:
            return {
                "prompt": f"Não foram encontrados documentos relevantes na Truth Base para: {query}",
                "context": "",
                "num_sources": 0,
                "sources": []
            }

        # Step 2: Generate
        result = self.generate_with_context(query, documents)

        return result

    def fact_override(
        self,
        topic: str,
        new_content: str,
        file_path: str = "Axioms/Truth_Base/overrides.json",
        section: str = "override"
    ) -> Dict[str, Any]:
        """
        Permitir Criador corrigir fatos em tempo real

        Args:
            topic: Tópico sendo corrigido
            new_content: Novo conteúdo factual
            file_path: Path do arquivo de override
            section: Seção para metadata

        Returns:
            Resultado da indexação
        """
        # Gerar embedding
        embedding = self.embedder.embed_text_sync(new_content)

        # Criar documento
        doc_id = f"override_{hashlib.md5(topic.encode()).hexdigest()}"
        document = {
            "id": doc_id,
            "content": new_content,
            "vector": embedding,
            "file": file_path,
            "section": section,
            "metadata": {
                "topic": topic,
                "override": True,
                "created_at": datetime.utcnow().isoformat()
            }
        }

        # Indexar
        result = self.qdrant.index_documents([document])

        # Persistir override em arquivo JSON
        self._persist_override(topic, new_content, file_path)

        print(f"✅ Fact override aplicado: {topic}")
        return result

    def _persist_override(self, topic: str, content: str, file_path: str):
        """Persistir override em JSON"""
        try:
            # Carregar overrides existentes
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    overrides = json.load(f)
            else:
                overrides = {}

            # Adicionar novo override
            overrides[topic] = {
                "content": content,
                "updated_at": datetime.utcnow().isoformat()
            }

            # Salvar
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(overrides, f, indent=2, ensure_ascii=False)

            print(f"💾 Override persistido em {file_path}")

        except Exception as e:
            print(f"❌ Erro ao persistir override: {e}")

    def extract_citations(self, response: str) -> List[str]:
        """
        Extrair citações do formato [Fonte: arquivo#seção]

        Args:
            response: Resposta gerada

        Returns:
            Lista de citações encontradas
        """
        import re
        pattern = r'\[Fonte: ([^\]]+)\]'
        citations = re.findall(pattern, response)
        return citations

    def validate_citations(self, response: str) -> Dict[str, Any]:
        """
        Validar se citações estão corretas

        Args:
            response: Resposta com citações

        Returns:
            Estatísticas de validação
        """
        citations = self.extract_citations(response)
        valid = []
        invalid = []

        for citation in citations:
            # Verificar se arquivo existe
            parts = citation.split("#")
            file_part = parts[0] if parts else ""

            # Buscar na Truth Base
            # TODO: Implementar busca real por arquivo
            # Por agora, assumir válido se segue padrão
            if file_part.startswith("Axioms/") or file_part.startswith("override"):
                valid.append(citation)
            else:
                invalid.append(citation)

        total = len(citations)
        accuracy = (len(valid) / total * 100) if total > 0 else 0

        return {
            "total_citations": total,
            "valid": len(valid),
            "invalid": len(invalid),
            "accuracy_percent": accuracy,
            "invalid_citations": invalid
        }

    def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas do pipeline"""
        cache_hit_rate = (
            self.stats["cache_hits"] / self.stats["queries"] * 100
            if self.stats["queries"] > 0 else 0
        )

        avg_latency = (
            self.stats["total_latency_ms"] / self.stats["queries"]
            if self.stats["queries"] > 0 else 0
        )

        return {
            **self.stats,
            "cache_hit_rate_percent": cache_hit_rate,
            "avg_latency_ms": avg_latency,
            "cache_size": len(self._cache),
            "qdrant_stats": self.qdrant.get_stats(),
            "embedder_stats": self.embedder.get_stats()
        }

    def clear_cache(self):
        """Limpar cache"""
        self._cache.clear()
        print("🗑️  Cache limpo")
