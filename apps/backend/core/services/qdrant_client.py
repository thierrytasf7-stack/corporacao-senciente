"""
Qdrant Vector Store Client
Cliente para indexação e busca vetorial usando Qdrant
"""

import os
from typing import List, Dict, Optional, Any
from datetime import datetime
import hashlib

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        PointStruct,
        Filter,
        FieldCondition,
        MatchValue,
        SearchRequest
    )
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("⚠️  qdrant-client não instalado. Execute: pip install qdrant-client")


class QdrantVectorStore:
    """Cliente Qdrant para Diana Truth Base"""

    def __init__(
        self,
        host: str = None,
        port: int = None,
        collection_name: str = "diana-truth-base",
        vector_size: int = 1536,
        distance: str = "Cosine"
    ):
        """
        Inicializar cliente Qdrant

        Args:
            host: Host do Qdrant (default: localhost)
            port: Porta do Qdrant (default: 21360 via env)
            collection_name: Nome da coleção (default: diana-truth-base)
            vector_size: Dimensão dos embeddings (1536 para OpenAI ada-002)
            distance: Métrica de distância (Cosine, Euclidean, Dot)
        """
        if not QDRANT_AVAILABLE:
            raise ImportError("qdrant-client não instalado")

        self.host = host or os.getenv("QDRANT_HOST", "localhost")
        self.port = port or int(os.getenv("DIANA_QDRANT_PORT", "21360"))
        self.collection_name = collection_name
        self.vector_size = vector_size
        self.distance = distance

        # Conectar ao Qdrant
        self.client = QdrantClient(host=self.host, port=self.port)
        self._ensure_collection()

    def _ensure_collection(self):
        """Garantir que a coleção existe"""
        try:
            # Verificar se coleção existe
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)

            if not exists:
                print(f"📦 Criando coleção {self.collection_name}...")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE if self.distance == "Cosine" else Distance.EUCLID
                    )
                )
                print(f"✅ Coleção {self.collection_name} criada")
            else:
                print(f"✅ Coleção {self.collection_name} já existe")

        except Exception as e:
            print(f"❌ Erro ao criar coleção: {e}")
            raise

    def index_documents(
        self,
        documents: List[Dict[str, Any]],
        batch_size: int = 100
    ) -> Dict[str, Any]:
        """
        Indexar documentos no Qdrant

        Args:
            documents: Lista de docs com {id, vector, metadata}
            batch_size: Tamanho do batch para upload

        Returns:
            Estatísticas da indexação
        """
        if not documents:
            return {"indexed": 0, "errors": 0}

        points = []
        errors = 0

        for doc in documents:
            try:
                # Gerar ID único se não fornecido
                doc_id = doc.get("id")
                if not doc_id:
                    content_hash = hashlib.md5(
                        doc.get("content", "").encode()
                    ).hexdigest()
                    doc_id = f"doc_{content_hash}"

                # Criar point
                point = PointStruct(
                    id=doc_id,
                    vector=doc["vector"],
                    payload={
                        "content": doc.get("content", ""),
                        "file": doc.get("file", "unknown"),
                        "section": doc.get("section", ""),
                        "timestamp": doc.get("timestamp", datetime.utcnow().isoformat()),
                        **doc.get("metadata", {})
                    }
                )
                points.append(point)

                # Upload em batches
                if len(points) >= batch_size:
                    self.client.upsert(
                        collection_name=self.collection_name,
                        points=points
                    )
                    points = []

            except Exception as e:
                print(f"❌ Erro ao indexar documento: {e}")
                errors += 1

        # Upload batch final
        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

        indexed = len(documents) - errors
        print(f"✅ Indexados {indexed} documentos ({errors} erros)")

        return {
            "indexed": indexed,
            "errors": errors,
            "collection": self.collection_name,
            "timestamp": datetime.utcnow().isoformat()
        }

    def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.8,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Buscar documentos similares

        Args:
            query_vector: Vetor de embedding da query
            limit: Número máximo de resultados
            score_threshold: Threshold mínimo de similaridade
            filters: Filtros de metadata (ex: {"file": "axiom_001.md"})

        Returns:
            Lista de documentos ranqueados por similaridade
        """
        try:
            # Construir filtros se fornecidos
            filter_obj = None
            if filters:
                conditions = [
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value)
                    )
                    for key, value in filters.items()
                ]
                filter_obj = Filter(must=conditions) if conditions else None

            # Buscar
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=filter_obj
            )

            # Formatar resultados
            documents = []
            for hit in results:
                documents.append({
                    "id": hit.id,
                    "score": hit.score,
                    "content": hit.payload.get("content", ""),
                    "file": hit.payload.get("file", ""),
                    "section": hit.payload.get("section", ""),
                    "metadata": {
                        k: v for k, v in hit.payload.items()
                        if k not in ["content", "file", "section"]
                    }
                })

            return documents

        except Exception as e:
            print(f"❌ Erro na busca: {e}")
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas da coleção"""
        try:
            collection_info = self.client.get_collection(self.collection_name)
            return {
                "collection": self.collection_name,
                "vectors_count": collection_info.vectors_count,
                "indexed_vectors_count": collection_info.indexed_vectors_count,
                "points_count": collection_info.points_count,
                "status": collection_info.status,
                "vector_size": self.vector_size,
                "distance_metric": self.distance
            }
        except Exception as e:
            print(f"❌ Erro ao obter stats: {e}")
            return {}

    def delete_collection(self):
        """Deletar coleção (usar com cuidado!)"""
        try:
            self.client.delete_collection(self.collection_name)
            print(f"🗑️  Coleção {self.collection_name} deletada")
        except Exception as e:
            print(f"❌ Erro ao deletar coleção: {e}")

    def health_check(self) -> bool:
        """Verificar saúde da conexão"""
        try:
            # Tentar obter info da coleção
            self.client.get_collection(self.collection_name)
            return True
        except Exception as e:
            print(f"❌ Health check falhou: {e}")
            return False
