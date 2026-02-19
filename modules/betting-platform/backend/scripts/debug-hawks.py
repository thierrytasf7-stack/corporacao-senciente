#!/usr/bin/env python3
"""
Debug: Verificar dados do Atlanta Hawks no PostgreSQL
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

print("=" * 70)
print("DEBUG: Dados do Atlanta Hawks no PostgreSQL")
print("=" * 70)

# Buscar todos os jogos do Atlanta Hawks
cur.execute("""
SELECT g.game_date, g.home_team, g.away_team, s.team_name, s.final_score, s.half_score
FROM nba_games g
JOIN nba_game_scores s ON g.game_id = s.game_id
WHERE s.team_name ILIKE '%Hawks%'
ORDER BY g.game_date
LIMIT 20
""")

rows = cur.fetchall()
print(f"\nEncontrados {len(rows)} jogos (mostrando primeiros 20):")
print("-" * 70)
print(f"{'Data':<12} | {'Casa':<25} | {'Visitante':<25} | {'Time':<20} | {'Final':>5} | {'Half':>4}")
print("-" * 70)

for r in rows:
    print(f"{str(r[0]):<12} | {r[1]:<25} | {r[2]:<25} | {r[3]:<20} | {r[4]:>5} | {r[5]:>4}")

# Verificar jogo especifico de 2024-12-14
print("\n" + "=" * 70)
print("Jogo em 2024-12-14:")
print("=" * 70)

cur.execute("""
SELECT g.game_id, g.game_date, g.home_team, g.away_team, s.team_name, s.final_score, s.half_score
FROM nba_games g
JOIN nba_game_scores s ON g.game_id = s.game_id
WHERE g.game_date::text = '2024-12-14' AND s.team_name ILIKE '%Hawks%'
""")

rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"Game ID: {r[0]}")
        print(f"  {r[1]}: {r[2]} vs {r[3]}")
        print(f"  Time: {r[4]} | Score: {r[5]} | Half: {r[6]}")
else:
    print("Nenhum jogo encontrado em 2024-12-14")

# Verificar se ha jogo com home_team = away_team
print("\n" + "=" * 70)
print("Verificando jogos com time duplicado:")
print("=" * 70)

cur.execute("""
SELECT game_date, home_team, away_team 
FROM nba_games 
WHERE home_team = away_team
LIMIT 5
""")

rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"  {r[0]}: {r[1]} vs {r[2]}")
else:
    print("Nenhum jogo com time duplicado encontrado")

conn.close()
print("\n" + "=" * 70)
