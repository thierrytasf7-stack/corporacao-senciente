"""
Database Connection Pool - Singleton para acesso ao banco
"""
import os
import asyncpg
from typing import Optional

_db_pool: Optional[asyncpg.Pool] = None


async def init_db_pool():
    """Inicializar pool de conexões"""
    global _db_pool

    if _db_pool is None:
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = int(os.getenv('DB_PORT', '5432'))
        db_name = os.getenv('DB_NAME', 'diana_db')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', 'postgres')

        _db_pool = await asyncpg.create_pool(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            min_size=2,
            max_size=10
        )

    return _db_pool


async def get_db_connection():
    """Obter conexão do pool (cria pool se não existir)"""
    global _db_pool

    if _db_pool is None:
        await init_db_pool()

    return _db_pool


async def close_db_pool():
    """Fechar pool de conexões"""
    global _db_pool

    if _db_pool is not None:
        await _db_pool.close()
        _db_pool = None


class DatabaseConnection:
    """Wrapper para conexão de banco simplificada"""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def execute_query(self, query: str, *args):
        """Executar query e retornar múltiplos resultados"""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]

    async def execute_query_single(self, query: str, *args):
        """Executar query e retornar um resultado"""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None

    async def execute_command(self, query: str, *args):
        """Executar comando (INSERT, UPDATE, DELETE)"""
        async with self.pool.acquire() as conn:
            await conn.execute(query, *args)
