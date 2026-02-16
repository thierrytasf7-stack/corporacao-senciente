"""
Database Connection Layer
Handles connections to PostgreSQL via Supabase
"""

import os
import asyncpg
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from backend.infrastructure.database.holding_repository import DatabaseConnection


class SupabaseConnection(DatabaseConnection):
    """Supabase database connection implementation"""

    def __init__(
        self,
        url: Optional[str] = None,
        service_role_key: Optional[str] = None
    ):
        # Get from environment variables or parameters
        self.url = url or os.getenv('SUPABASE_URL')
        self.service_role_key = service_role_key or os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not self.url or not self.service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

        # Connection pool
        self._pool: Optional[asyncpg.Pool] = None

    async def connect(self) -> None:
        """Create connection pool"""
        if self._pool:
            return

        try:
            self._pool = await asyncpg.create_pool(
                self.url,
                password=self.service_role_key,
                min_size=5,
                max_size=20,
                command_timeout=60,
                server_settings={
                    'search_path': 'public'
                }
            )
            print("✅ Connected to Supabase PostgreSQL")
        except Exception as e:
            print(f"❌ Failed to connect to Supabase: {str(e)}")
            raise

    async def disconnect(self) -> None:
        """Close connection pool"""
        if self._pool:
            await self._pool.close()
            self._pool = None
            print("✅ Disconnected from Supabase")

    def connection(self):
        """Get connection from pool"""
        if not self._pool:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._pool

    @asynccontextmanager
    async def get_connection(self):
        """Context manager for database connections"""
        if not self._pool:
            await self.connect()

        async with self._pool.acquire() as conn:
            yield conn

    async def execute_query(self, query: str, *args) -> list:
        """Execute a query and return results"""
        async with self.get_connection() as conn:
            return await conn.fetch(query, *args)

    async def execute_query_single(self, query: str, *args) -> Optional[dict]:
        """Execute a query and return single result"""
        async with self.get_connection() as conn:
            return await conn.fetchrow(query, *args)

    async def execute_command(self, command: str, *args) -> str:
        """Execute a command (INSERT, UPDATE, DELETE)"""
        async with self.get_connection() as conn:
            return await conn.execute(command, *args)

    async def health_check(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            result = await self.execute_query_single("SELECT NOW(), version()")
            return {
                'status': 'healthy',
                'timestamp': result['now'],
                'version': result['version'],
                'pool_size': self._pool._holders if self._pool else 0
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }


# Global connection instance
_db_connection: Optional[SupabaseConnection] = None


def get_database_connection() -> SupabaseConnection:
    """Get global database connection instance"""
    global _db_connection

    if _db_connection is None:
        _db_connection = SupabaseConnection()

    return _db_connection


async def init_database() -> None:
    """Initialize database connection"""
    db = get_database_connection()
    await db.connect()


async def close_database() -> None:
    """Close database connection"""
    db = get_database_connection()
    await db.disconnect()


async def check_database_health() -> Dict[str, Any]:
    """Check database health status"""
    try:
        db = get_database_connection()
        return await db.health_check()
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }


# Vector operations for Supabase
async def store_vector_embedding(
    table: str,
    id_column: str,
    id_value: Any,
    embedding: list,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """Store vector embedding in database"""
    db = get_database_connection()

    # Update the embedding column
    query = f"""
    UPDATE {table}
    SET embedding = $1
    WHERE {id_column} = $2
    """

    await db.execute_command(query, embedding, id_value)


async def search_similar_vectors(
    table: str,
    embedding_column: str,
    query_embedding: list,
    limit: int = 5,
    threshold: float = 0.7
) -> list:
    """Search for similar vectors using cosine similarity"""
    db = get_database_connection()

    query = f"""
    SELECT *,
           1 - ({embedding_column} <=> $1) as similarity
    FROM {table}
    WHERE 1 - ({embedding_column} <=> $1) > $2
    ORDER BY {embedding_column} <=> $1
    LIMIT $3
    """

    return await db.execute_query(query, query_embedding, threshold, limit)


async def get_vector_by_id(
    table: str,
    id_column: str,
    id_value: Any,
    embedding_column: str = 'embedding'
) -> Optional[list]:
    """Get vector embedding by ID"""
    db = get_database_connection()

    query = f"""
    SELECT {embedding_column}
    FROM {table}
    WHERE {id_column} = $1
    """

    result = await db.execute_query_single(query, id_value)
    return result[embedding_column] if result else None


# Utility functions for common operations
async def ensure_tables_exist() -> None:
    """Ensure all required tables exist"""
    db = get_database_connection()

    # Check if holdings table exists
    result = await db.execute_query("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'holdings'
        )
    """)

    if not result[0]['exists']:
        print("⚠️  Required tables not found. Please run database migrations first.")
        raise RuntimeError("Database not initialized. Run migrations first.")


async def get_table_stats() -> Dict[str, Any]:
    """Get statistics about database tables"""
    db = get_database_connection()

    stats = {}

    tables = ['holdings', 'subsidiaries', 'agents', 'agent_memories', 'subsidiary_opportunities']

    for table in tables:
        try:
            result = await db.execute_query_single(f"SELECT COUNT(*) as count FROM {table}")
            stats[table] = result['count']
        except Exception as e:
            stats[table] = f"Error: {str(e)}"

    return stats