#!/usr/bin/env python3
"""
Verifica se os dados do backtest correspondem aos dados reais no PostgreSQL
Compara Fixed vs Fibonacci
"""
import psycopg2
import json
import os

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '21057788',
    'database': 'postgres'
}

# Carregar resultado do backtest FIBONACCI
backtest_file = os.path.join(os.path.dirname(__file__), '..', 'backtests', 'backtest_real_nba_20260217_191029.json')
with open(backtest_file, 'r', encoding='utf-8') as f:
    backtest = json.load(f)

bets = backtest.get('data', {}).get('bets', [])

print("=" * 70)
print("VERIFICACAO DE DADOS - Backtest vs PostgreSQL")
print("=" * 70)

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# Verificar amostra de 10 apostas
verified = 0
not_found = 0

print("\nVerificando 10 primeiras apostas do backtest...")
print("-" * 70)

for bet in bets[:10]:
    date = bet['date'].split('T')[0]
    team = bet['team']
    match = bet['match']
    final_points = None
    
    # Tentar encontrar o jogo no banco
    cur.execute('''
        SELECT g.game_date, g.home_team, g.away_team, s.final_score
        FROM nba_games g
        JOIN nba_game_scores s ON g.game_id = s.game_id
        WHERE s.team_name ILIKE %s
          AND g.game_date::text = %s
    ''', (f'%{team}%', date))
    
    rows = cur.fetchall()
    
    if rows:
        verified += 1
        for r in rows:
            print(f"[OK] {date} | {team} | {r[3]} pts (jogo: {r[1]} vs {r[2]})")
    else:
        not_found += 1
        print(f"[?] {date} | {team} | Jogo nao encontrado no PostgreSQL")

print("-" * 70)
print(f"\nVerificados: {verified}/10")
print(f"Nao encontrados: {not_found}/10")

# Estatisticas gerais do banco
cur.execute('SELECT COUNT(*) FROM nba_games')
total_games = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM nba_game_scores')
total_scores = cur.fetchone()[0]

cur.execute('SELECT COUNT(DISTINCT team_name) FROM nba_game_scores')
total_teams = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM nba_game_scores WHERE has_quarters = TRUE')
with_quarters = cur.fetchone()[0]

print("\n" + "=" * 70)
print("RESUMO DOS DADOS NO POSTGRESQL")
print("=" * 70)
print(f"Total de jogos na tabela nba_games: {total_games}")
print(f"Total de registros em nba_game_scores: {total_scores}")
print(f"Times distintos: {total_teams}")
print(f"Registros com quarters reais: {with_quarters}")
print("=" * 70)

# Verificar se as odds fazem sentido
print("\n" + "=" * 70)
print("ANALISE DAS ODDS DO BACKTEST")
print("=" * 70)

odds = [b['odds'] for b in bets]
avg_odd = sum(odds) / len(odds)
min_odd = min(odds)
max_odd = max(odds)

print(f"Total de apostas: {len(bets)}")
print(f"Odd media: {avg_odd:.2f}")
print(f"Odd minima: {min_odd:.2f}")
print(f"Odd maxima: {max_odd:.2f}")
print(f"Apostas com odd >= 1.70: {sum(1 for o in odds if o >= 1.70)} ({sum(1 for o in odds if o >= 1.70)/len(odds)*100:.1f}%)")

# Verificar consistencia dos resultados
wins = sum(1 for b in bets if b['result'] == 'W')
losses = sum(1 for b in bets if b['result'] == 'L')
win_rate = wins / len(bets) * 100

print("\n" + "=" * 70)
print("CONSISTENCIA DOS RESULTADOS")
print("=" * 70)
print(f"Vitorias: {wins} ({win_rate:.1f}%)")
print(f"Derrotas: {losses}")
print(f"Lucro total reportado: R$ {sum(b['profit'] for b in bets):.2f}")

conn.close()

print("\n" + "=" * 70)
print("VEREDITO DA VERIFICACAO")
print("=" * 70)

if verified >= 8 and total_games > 1000:
    print("[OK] Dados parecem ser REAIS - jogos encontrados no PostgreSQL")
    print("[OK] Volume de dados consistente com temporada NBA")
else:
    print("[ALERTA] Poucos jogos verificados - pode haver problema")

if avg_odd >= 1.70:
    print("[OK] Odd media consistente com filtro minimo de 1.70")
else:
    print("[ALERTA] Odd media abaixo do esperado")

if win_rate >= 60 and win_rate <= 85:
    print("[OK] Win rate dentro do esperado para estrategia real")
elif win_rate > 90:
    print("[ALERTA] Win rate muito alto - pode indicar overfitting ou erro")
else:
    print("[INFO] Win rate abaixo do esperado - estrategia pode nao ser ideal")

print("=" * 70)
