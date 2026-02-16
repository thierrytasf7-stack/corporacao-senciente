"""
Qdrant Vector Database Adapter
Industry 6.0/7.0 Ready - High Performance Vector Storage

Replaces pgvector with Qdrant for improved performance:
- ~50ms latency (vs ~200ms pgvector)
- Native HNSW indexing
- Horizontal scaling support
- Mem0 integration ready
"""

import os
import asyncio
from typing import Optional, Dict, Any, List, Union
from dataclasses import dataclass, field
from datetime import datetime
import hashlib
import json


@dataclass
class VectorPoint:
    """Represents a vector point in Qdrant"""
    id: str
    vector: List[float]
    payload: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'vector': self.vector,
            'payload': self.payload
        }


@dataclass
class SearchResult:
    """Search result from Qdrant"""
    id: str
    score: float
    payload: Dict[str, Any]
    vector: Optional[List[float]] = None


class QdrantConfig:
    """Qdrant configuration"""
    
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        api_key: Optional[str] = None,
        https: bool = True,
        timeout: int = 30
    ):
        self.host = host or os.getenv('QDRANT_HOST', 'localhost')
        self.port = port or int(os.getenv('QDRANT_PORT', '6333'))
        self.api_key = api_key or os.getenv('QDRANT_API_KEY')
        self.https = https
        self.timeout = timeout
        
    @property
    def url(self) -> str:
        protocol = 'https' if self.https else 'http'
        return f"{protocol}://{self.host}:{self.port}"


class QdrantAdapter:
    """
    Qdrant Vector Database Adapter
    
    Features:
    - Async operations for high throughput
    - Automatic collection management
    - Mem0 integration support
    - Migration utilities from pgvector
    """
    
    def __init__(self, config: Optional[QdrantConfig] = None):
        self.config = config or QdrantConfig()
        self._client = None
        self._collections: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self) -> None:
        """Initialize Qdrant client connection"""
        try:
            # Import qdrant-client if available
            from qdrant_client import QdrantClient
            from qdrant_client.http.models import Distance, VectorParams
            
            self._client = QdrantClient(
                host=self.config.host,
                port=self.config.port,
                api_key=self.config.api_key,
                timeout=self.config.timeout
            )
            
            # Test connection
            collections = self._client.get_collections()
            print(f"[QdrantAdapter] Connected to Qdrant at {self.config.url}")
            print(f"[QdrantAdapter] Available collections: {len(collections.collections)}")
            
        except ImportError:
            print("[QdrantAdapter] WARNING: qdrant-client not installed. Using mock mode.")
            self._client = MockQdrantClient()
        except Exception as e:
            print(f"[QdrantAdapter] WARNING: Could not connect to Qdrant: {e}")
            print("[QdrantAdapter] Falling back to mock mode for development.")
            self._client = MockQdrantClient()
    
    async def disconnect(self) -> None:
        """Close Qdrant connection"""
        if self._client and hasattr(self._client, 'close'):
            self._client.close()
        self._client = None
        print("[QdrantAdapter] Disconnected from Qdrant")
    
    async def ensure_collection(
        self,
        name: str,
        vector_size: int = 384,
        distance: str = "Cosine"
    ) -> bool:
        """
        Ensure a collection exists, create if not
        
        Args:
            name: Collection name
            vector_size: Dimension of vectors (default 384 for MiniLM)
            distance: Distance metric (Cosine, Euclid, Dot)
        """
        if not self._client:
            await self.connect()
            
        try:
            from qdrant_client.http.models import Distance, VectorParams
            
            distance_map = {
                'Cosine': Distance.COSINE,
                'Euclid': Distance.EUCLID,
                'Dot': Distance.DOT
            }
            
            # Check if collection exists
            collections = self._client.get_collections().collections
            exists = any(c.name == name for c in collections)
            
            if not exists:
                self._client.create_collection(
                    collection_name=name,
                    vectors_config=VectorParams(
                        size=vector_size,
                        distance=distance_map.get(distance, Distance.COSINE)
                    )
                )
                print(f"[QdrantAdapter] Created collection: {name}")
            
            self._collections[name] = {
                'vector_size': vector_size,
                'distance': distance
            }
            
            return True
            
        except ImportError:
            # Mock mode
            self._collections[name] = {
                'vector_size': vector_size,
                'distance': distance
            }
            return True
        except Exception as e:
            print(f"[QdrantAdapter] Error ensuring collection: {e}")
            return False
    
    async def upsert(
        self,
        collection_name: str,
        points: List[VectorPoint]
    ) -> bool:
        """
        Upsert vectors into collection
        
        Args:
            collection_name: Target collection
            points: List of VectorPoint objects
        """
        if not self._client:
            await self.connect()
            
        try:
            from qdrant_client.http.models import PointStruct
            
            qdrant_points = [
                PointStruct(
                    id=self._hash_id(p.id),
                    vector=p.vector,
                    payload={**p.payload, '_original_id': p.id}
                )
                for p in points
            ]
            
            self._client.upsert(
                collection_name=collection_name,
                points=qdrant_points
            )
            
            return True
            
        except ImportError:
            # Mock mode - store in memory
            if not hasattr(self, '_mock_storage'):
                self._mock_storage = {}
            if collection_name not in self._mock_storage:
                self._mock_storage[collection_name] = {}
            
            for p in points:
                self._mock_storage[collection_name][p.id] = p
            
            return True
        except Exception as e:
            print(f"[QdrantAdapter] Upsert error: {e}")
            return False
    
    async def search(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.7,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """
        Search for similar vectors
        
        Args:
            collection_name: Collection to search
            query_vector: Query embedding
            limit: Max results
            score_threshold: Minimum similarity score
            filter_conditions: Optional payload filters
        """
        if not self._client:
            await self.connect()
            
        try:
            results = self._client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=self._build_filter(filter_conditions) if filter_conditions else None
            )
            
            return [
                SearchResult(
                    id=r.payload.get('_original_id', str(r.id)),
                    score=r.score,
                    payload=r.payload,
                    vector=r.vector if hasattr(r, 'vector') else None
                )
                for r in results
            ]
            
        except Exception as e:
            print(f"[QdrantAdapter] Search error: {e}")
            return []
    
    async def delete(
        self,
        collection_name: str,
        ids: List[str]
    ) -> bool:
        """Delete vectors by ID"""
        if not self._client:
            await self.connect()
            
        try:
            from qdrant_client.http.models import PointIdsList
            
            hashed_ids = [self._hash_id(id) for id in ids]
            
            self._client.delete(
                collection_name=collection_name,
                points_selector=PointIdsList(points=hashed_ids)
            )
            
            return True
            
        except Exception as e:
            print(f"[QdrantAdapter] Delete error: {e}")
            return False
    
    async def get_collection_info(self, collection_name: str) -> Dict[str, Any]:
        """Get collection statistics"""
        if not self._client:
            await self.connect()
            
        try:
            info = self._client.get_collection(collection_name)
            return {
                'name': collection_name,
                'vectors_count': info.vectors_count,
                'points_count': info.points_count,
                'status': info.status.value if hasattr(info.status, 'value') else str(info.status),
                'config': {
                    'vector_size': info.config.params.vectors.size,
                    'distance': str(info.config.params.vectors.distance)
                }
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _hash_id(self, id: str) -> int:
        """Convert string ID to integer hash for Qdrant"""
        return int(hashlib.sha256(id.encode()).hexdigest()[:16], 16)
    
    def _build_filter(self, conditions: Dict[str, Any]):
        """Build Qdrant filter from conditions dict"""
        try:
            from qdrant_client.http.models import Filter, FieldCondition, MatchValue
            
            must_conditions = []
            for key, value in conditions.items():
                must_conditions.append(
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value)
                    )
                )
            
            return Filter(must=must_conditions) if must_conditions else None
            
        except ImportError:
            return None


class MockQdrantClient:
    """Mock Qdrant client for development/testing without Qdrant server"""
    
    def __init__(self):
        self._storage: Dict[str, Dict[str, Any]] = {}
        self._collections: Dict[str, Dict[str, Any]] = {}
        print("[MockQdrantClient] Running in mock mode")
    
    def get_collections(self):
        class MockCollections:
            def __init__(self, collections):
                self.collections = [
                    type('obj', (object,), {'name': name})()
                    for name in collections.keys()
                ]
        return MockCollections(self._collections)
    
    def create_collection(self, collection_name: str, vectors_config: Any):
        self._collections[collection_name] = {
            'config': vectors_config,
            'created_at': datetime.utcnow().isoformat()
        }
        self._storage[collection_name] = {}
    
    def get_collection(self, collection_name: str):
        class MockInfo:
            def __init__(self, name, storage):
                self.name = name
                self.vectors_count = len(storage.get(name, {}))
                self.points_count = len(storage.get(name, {}))
                self.status = 'green'
                self.config = type('obj', (object,), {
                    'params': type('obj', (object,), {
                        'vectors': type('obj', (object,), {
                            'size': 384,
                            'distance': 'Cosine'
                        })()
                    })()
                })()
        return MockInfo(collection_name, self._storage)
    
    def upsert(self, collection_name: str, points: List[Any]):
        if collection_name not in self._storage:
            self._storage[collection_name] = {}
        
        for point in points:
            self._storage[collection_name][point.id] = {
                'vector': point.vector,
                'payload': point.payload
            }
    
    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.0,
        query_filter: Any = None
    ) -> List[Any]:
        """Simple cosine similarity search"""
        if collection_name not in self._storage:
            return []
        
        results = []
        for id, data in self._storage[collection_name].items():
            score = self._cosine_similarity(query_vector, data['vector'])
            if score >= score_threshold:
                results.append(type('obj', (object,), {
                    'id': id,
                    'score': score,
                    'payload': data['payload'],
                    'vector': data['vector']
                })())
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]
    
    def delete(self, collection_name: str, points_selector: Any):
        if collection_name in self._storage:
            for point_id in points_selector.points:
                self._storage[collection_name].pop(point_id, None)
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if len(a) != len(b):
            return 0.0
        
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x ** 2 for x in a) ** 0.5
        norm_b = sum(x ** 2 for x in b) ** 0.5
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)
    
    def close(self):
        pass


# Global Qdrant adapter instance
_qdrant_adapter: Optional[QdrantAdapter] = None


def get_qdrant_adapter() -> QdrantAdapter:
    """Get global Qdrant adapter instance"""
    global _qdrant_adapter
    
    if _qdrant_adapter is None:
        _qdrant_adapter = QdrantAdapter()
    
    return _qdrant_adapter


async def init_qdrant() -> None:
    """Initialize Qdrant connection"""
    adapter = get_qdrant_adapter()
    await adapter.connect()
    
    # Ensure default collections exist
    await adapter.ensure_collection('agent_memories', vector_size=384)
    await adapter.ensure_collection('corporate_knowledge', vector_size=384)
    await adapter.ensure_collection('decision_history', vector_size=384)


async def close_qdrant() -> None:
    """Close Qdrant connection"""
    adapter = get_qdrant_adapter()
    await adapter.disconnect()


# Migration utilities
class PgVectorToQdrantMigrator:
    """
    Migrates embeddings from Supabase pgvector to Qdrant
    
    Usage:
        migrator = PgVectorToQdrantMigrator(supabase_conn, qdrant_adapter)
        await migrator.migrate_table('agent_logs', 'decision_vector', 'agent_memories')
    """
    
    def __init__(self, supabase_connection, qdrant_adapter: QdrantAdapter):
        self.supabase = supabase_connection
        self.qdrant = qdrant_adapter
        self.migrated_count = 0
        self.error_count = 0
    
    async def migrate_table(
        self,
        source_table: str,
        vector_column: str,
        target_collection: str,
        batch_size: int = 100
    ) -> Dict[str, int]:
        """
        Migrate vectors from pgvector table to Qdrant collection
        
        Args:
            source_table: Source PostgreSQL table
            vector_column: Column containing vectors
            target_collection: Target Qdrant collection
            batch_size: Records per batch
        """
        print(f"[Migrator] Starting migration: {source_table} -> {target_collection}")
        
        # Ensure target collection exists
        await self.qdrant.ensure_collection(target_collection, vector_size=384)
        
        # Get total count
        count_result = await self.supabase.execute_query(
            f"SELECT COUNT(*) as total FROM {source_table} WHERE {vector_column} IS NOT NULL"
        )
        total = count_result[0]['total'] if count_result else 0
        
        print(f"[Migrator] Found {total} records to migrate")
        
        offset = 0
        while offset < total:
            # Fetch batch
            batch = await self.supabase.execute_query(f"""
                SELECT id, {vector_column}, *
                FROM {source_table}
                WHERE {vector_column} IS NOT NULL
                ORDER BY id
                LIMIT {batch_size} OFFSET {offset}
            """)
            
            if not batch:
                break
            
            # Convert to VectorPoints
            points = []
            for row in batch:
                try:
                    vector = row[vector_column]
                    if isinstance(vector, str):
                        vector = json.loads(vector)
                    
                    # Create payload from row data
                    payload = {k: v for k, v in dict(row).items() if k != vector_column}
                    
                    points.append(VectorPoint(
                        id=str(row['id']),
                        vector=vector,
                        payload=payload
                    ))
                except Exception as e:
                    print(f"[Migrator] Error processing row {row.get('id')}: {e}")
                    self.error_count += 1
            
            # Upsert to Qdrant
            success = await self.qdrant.upsert(target_collection, points)
            
            if success:
                self.migrated_count += len(points)
                print(f"[Migrator] Migrated {self.migrated_count}/{total} records")
            
            offset += batch_size
        
        return {
            'total': total,
            'migrated': self.migrated_count,
            'errors': self.error_count
        }
