#!/usr/bin/env python3
"""
Setup inicial: Cria schema e testa APIs
"""

import psycopg2
import os
import sys

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '21057788',
    'database': 'postgres'
}

SQL_FILE = os.path.join(os.path.dirname(__file__), 'setup-tennis-db.sql')

def setup_schema():
    """Cria schema do banco de dados"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("[OK] Conectado ao PostgreSQL")
        
        with conn.cursor() as cur:
            with open(SQL_FILE, 'r', encoding='utf-8') as f:
                sql = f.read()
            
            cur.execute(sql)
            conn.commit()
            print("[OK] Schema criado com sucesso")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"[ERRO] Erro ao conectar ao PostgreSQL: {e}")
        print("[AVISO] PostgreSQL nao esta rodando ou credenciais incorretas")
        return False

if __name__ == '__main__':
    setup_schema()
