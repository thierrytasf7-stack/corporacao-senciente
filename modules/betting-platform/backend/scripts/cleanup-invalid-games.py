#!/usr/bin/env python3
"""
Limpa jogos invalidos (home_team = away_team) do PostgreSQL
"""
import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '21057788',
    'database': 'postgres'
}

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

print("Limpando jogos com home_team = away_team...")

# Deletar scores primeiro (FK)
cur.execute("""
    DELETE FROM nba_game_scores 
    WHERE game_id IN (
        SELECT game_id FROM nba_games WHERE home_team = away_team
    )
""")
deleted_scores = cur.rowcount

# Deletar jogos
cur.execute("DELETE FROM nba_games WHERE home_team = away_team")
deleted_games = cur.rowcount

conn.commit()

print(f"  Scores removidos: {deleted_scores}")
print(f"  Jogos removidos: {deleted_games}")

# Verificar se ainda existe algum
cur.execute("SELECT COUNT(*) FROM nba_games WHERE home_team = away_team")
remaining = cur.fetchone()[0]

print(f"  Jogos invalidos restantes: {remaining}")

# Estatisticas finais
cur.execute("SELECT COUNT(*) FROM nba_games")
total_games = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM nba_game_scores")
total_scores = cur.fetchone()[0]

print(f"\nEstatisticas apos limpeza:")
print(f"  Total jogos: {total_games}")
print(f"  Total scores: {total_scores}")

conn.close()
print("\nLimpeza concluida!")
