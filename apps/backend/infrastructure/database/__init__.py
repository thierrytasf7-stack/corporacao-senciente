"""
Database Infrastructure Layer
Supports both Supabase (pgvector) and Qdrant vector databases.
"""

from backend.infrastructure.database.connection import (
    SupabaseConnection,
    get_database_connection,
    init_database,
    close_database,
    check_database_health,
    store_vector_embedding,
    search_similar_vectors
)

from backend.infrastructure.database.qdrant_adapter import (
    QdrantAdapter,
    QdrantConfig,
    VectorPoint,
    SearchResult,
    get_qdrant_adapter,
    init_qdrant,
    close_qdrant,
    PgVectorToQdrantMigrator
)

__all__ = [
    # Supabase/pgvector
    'SupabaseConnection',
    'get_database_connection',
    'init_database',
    'close_database',
    'check_database_health',
    'store_vector_embedding',
    'search_similar_vectors',
    
    # Qdrant
    'QdrantAdapter',
    'QdrantConfig',
    'VectorPoint',
    'SearchResult',
    'get_qdrant_adapter',
    'init_qdrant',
    'close_qdrant',
    'PgVectorToQdrantMigrator'
]
