"""
Database Connection Layer
Camada de conexão com o banco de dados Supabase (REST API)
"""

import os
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

# Importar cliente Supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Aviso: supabase-py nao instalado. Usando modo simulado.")


class DatabaseConnection:
    """Gerenciador de conexões com o Supabase"""

    def __init__(self):
        self.client: Optional[Client] = None
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')

    async def initialize_pool(self, min_size: int = 5, max_size: int = 20) -> None:
        """Inicializa o cliente Supabase"""
        if not SUPABASE_AVAILABLE:
            print("Cliente Supabase nao disponivel - usando modo simulado")
            return

        if not self.supabase_url or not self.supabase_key:
            print("Configuracao Supabase incompleta - usando modo simulado")
            return

        try:
            self.client = create_client(self.supabase_url, self.supabase_key)
            print("Cliente Supabase inicializado com sucesso")
        except Exception as e:
            print(f"Erro ao inicializar cliente Supabase: {e}")
            self.client = None

    async def close_pool(self) -> None:
        """Fecha a conexão (não aplicável para Supabase REST)"""
        self.client = None
        print("Cliente Supabase desconectado")

    @asynccontextmanager
    async def get_connection(self):
        """Context manager para obter cliente Supabase"""
        if not self.client:
            await self.initialize_pool()

        # Para Supabase, não há pool de conexões real
        yield self.client

    async def execute_query(self, table: str, **filters) -> list:
        """Executa query SELECT no Supabase"""
        if not self.client:
            return []

        try:
            query = self.client.table(table).select('*')

            # Aplicar filtros
            for key, value in filters.items():
                query = query.eq(key, value)

            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Erro ao executar query: {e}")
            return []

    async def execute_command(self, operation: str, table: str, data: Dict[str, Any]) -> bool:
        """Executa operações INSERT/UPDATE/DELETE no Supabase"""
        if not self.client:
            return False

        try:
            if operation == 'insert':
                result = self.client.table(table).insert(data).execute()
                return bool(result.data)
            elif operation == 'update':
                # Assumindo que data contém 'id' para filtro
                record_id = data.pop('id', None)
                if record_id:
                    result = self.client.table(table).update(data).eq('id', record_id).execute()
                    return bool(result.data)
            elif operation == 'delete':
                record_id = data.get('id')
                if record_id:
                    result = self.client.table(table).delete().eq('id', record_id).execute()
                    return True

            return False
        except Exception as e:
            print(f"Erro ao executar comando: {e}")
            return False

    async def execute_transaction(self, queries: list) -> None:
        """Executa múltiplas operações (Supabase não suporta transações reais)"""
        # Supabase não suporta transações multi-table reais via REST
        # Executar sequencialmente
        for operation, table, data in queries:
            success = await self.execute_command(operation, table, data)
            if not success:
                raise Exception(f"Falha na operacao: {operation} em {table}")

    async def health_check(self) -> Dict[str, Any]:
        """Verifica saúde da conexão com o Supabase"""
        if not self.client:
            return {
                'status': 'unhealthy',
                'error': 'Cliente Supabase nao inicializado'
            }

        try:
            # Tentar uma query simples
            result = self.client.table('system_metrics').select('count').limit(1).execute()
            return {
                'status': 'healthy',
                'version': 'Supabase REST API',
                'timestamp': None,
                'tables_available': True
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }


# Instância global da conexão
db_connection = DatabaseConnection()


async def get_database_connection() -> DatabaseConnection:
    """Factory function para obter instância da conexão"""
    return db_connection


async def initialize_database() -> None:
    """Inicializa banco de dados e conexões"""
    await db_connection.initialize_pool()


async def close_database() -> None:
    """Fecha conexões do banco de dados"""
    await db_connection.close_pool()