#!/usr/bin/env python3
"""
Database Migration Script for Hallucination Logs
Cria a tabela hallucination_logs no banco de dados
"""

import asyncio
import sys
import os

# Adicionar backend ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.database.connection import get_database_connection
from infrastructure.database.hallucination_logs import HallucinationDatabaseMigration


async def run_migration():
    """Executar migração"""
    print("🚀 Running Hallucination Logs Migration...\n")

    db = get_database_connection()

    try:
        # Conectar ao banco
        print("📦 Connecting to database...")
        await db.connect()
        print("✅ Connected!\n")

        # Criar tabela
        print("📝 Creating hallucination_logs table...")
        create_sql = HallucinationDatabaseMigration.get_create_table_sql()

        async with db.get_connection() as conn:
            await conn.execute(create_sql)

        print("✅ Table created successfully!\n")

        # Verificar tabela
        print("🔍 Verifying table...")
        verify_query = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'hallucination_logs'
        )
        """
        result = await db.execute_query_single(verify_query)

        if result and result.get('exists'):
            print("✅ Table verified - migration successful!\n")

            # Listar índices
            print("📊 Indexes created:")
            indexes_query = """
            SELECT indexname FROM pg_indexes
            WHERE tablename = 'hallucination_logs'
            """
            indexes = await db.execute_query(indexes_query)
            for idx in indexes:
                print(f"  - {idx['indexname']}")

            return True
        else:
            print("❌ Table verification failed!")
            return False

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    finally:
        await db.disconnect()


async def rollback_migration():
    """Reverter migração"""
    print("⚠️  Rolling back migration...\n")

    db = get_database_connection()

    try:
        await db.connect()
        print("📦 Connected to database\n")

        print("🗑️  Dropping hallucination_logs table...")
        drop_sql = HallucinationDatabaseMigration.get_drop_table_sql()

        async with db.get_connection() as conn:
            await conn.execute(drop_sql)

        print("✅ Table dropped successfully!")
        return True

    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        return False
    finally:
        await db.disconnect()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("HALLUCINATION LOGS DATABASE MIGRATION")
    print("="*80 + "\n")

    action = "run"
    if len(sys.argv) > 1:
        action = sys.argv[1].lower()

    if action == "rollback":
        success = asyncio.run(rollback_migration())
    else:
        success = asyncio.run(run_migration())

    print("\n" + "="*80)
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed!")
    print("="*80 + "\n")

    sys.exit(0 if success else 1)
