#!/usr/bin/env python3
"""
Database Migration Script - Versão Síncrona
Cria a tabela hallucination_logs no banco de dados
"""

import os
import sys
import psycopg2

# Adicionar backend ao path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.dirname(backend_dir))

# Import direto evitando circular imports
import importlib.util
spec = importlib.util.spec_from_file_location(
    "hallucination_logs",
    os.path.join(backend_dir, "infrastructure", "database", "hallucination_logs.py")
)
hallucination_logs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hallucination_logs)

HallucinationDatabaseMigration = hallucination_logs.HallucinationDatabaseMigration


def run_migration():
    """Executar migração"""
    print("[RUN] Running Hallucination Logs Migration...\n")

    # Conectar ao banco
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', '5432'))
    db_name = os.getenv('DB_NAME', 'diana_db')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')

    try:
        print(f"[CONNECT] Connecting to database {db_name}@{db_host}:{db_port}...")
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        print("[OK] Connected!\n")

        cursor = conn.cursor()

        # Criar tabela
        print("[CREATE] Creating hallucination_logs table...")
        create_sql = HallucinationDatabaseMigration.get_create_table_sql()

        cursor.execute(create_sql)
        conn.commit()

        print("[OK] Table created successfully!\n")

        # Verificar tabela
        print("[VERIFY] Verifying table...")
        verify_query = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'hallucination_logs'
        )
        """
        cursor.execute(verify_query)
        result = cursor.fetchone()

        if result and result[0]:
            print("[OK] Table verified - migration successful!\n")

            # Listar índices
            print("[INDEXES] Indexes created:")
            indexes_query = """
            SELECT indexname FROM pg_indexes
            WHERE tablename = 'hallucination_logs'
            ORDER BY indexname
            """
            cursor.execute(indexes_query)
            indexes = cursor.fetchall()
            for idx in indexes:
                print(f"  - {idx[0]}")

            cursor.close()
            conn.close()
            return True
        else:
            print("[ERROR] Table verification failed!")
            cursor.close()
            conn.close()
            return False

    except psycopg2.Error as e:
        print(f"[ERROR] Migration failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False


def rollback_migration():
    """Reverter migração"""
    print("[WARN] Rolling back migration...\n")

    # Conectar ao banco
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', '5432'))
    db_name = os.getenv('DB_NAME', 'diana_db')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')

    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        print("[CONNECT] Connected to database\n")

        cursor = conn.cursor()

        print("[DROP] Dropping hallucination_logs table...")
        drop_sql = HallucinationDatabaseMigration.get_drop_table_sql()

        cursor.execute(drop_sql)
        conn.commit()

        print("[OK] Table dropped successfully!")

        cursor.close()
        conn.close()
        return True

    except psycopg2.Error as e:
        print(f"[ERROR] Rollback failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*80)
    print("HALLUCINATION LOGS DATABASE MIGRATION")
    print("="*80 + "\n")

    action = "run"
    if len(sys.argv) > 1:
        action = sys.argv[1].lower()

    if action == "rollback":
        success = rollback_migration()
    else:
        success = run_migration()

    print("\n" + "="*80)
    if success:
        print("[OK] Migration completed successfully!")
    else:
        print("[ERROR] Migration failed!")
    print("="*80 + "\n")

    sys.exit(0 if success else 1)
