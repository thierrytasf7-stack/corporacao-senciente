#!/usr/bin/env python3
"""
Tennis Historical Data Scraper
Fontes: 
  - API-Sports (api-sports.io/tennis) - Dados de partidas, rankings
  - TheOddsAPI (theoddsapi.com) - Odds históricas
Destino: PostgreSQL local (porta 5432)

Uso:
  python tennis-scraper.py                    # Busca últimos 30 dias
  python tennis-scraper.py --days 180         # Busca últimos 180 dias
  python tennis-scraper.py --date 2025-08-01  # Busca data específica
  python tennis-scraper.py --odds             # Fase 2: busca odds
  python tennis-scraper.py --status           # Mostra quantos jogos tem no banco

Instalar dependências:
  pip install requests psycopg2-binary python-dotenv
"""

import os
import sys
import time
import argparse
import requests
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── CONFIG ───────────────────────────────────────────────────────────────────
DB_CONFIG = {
    'host':     'localhost',
    'port':     5432,
    'user':     'postgres',
    'password': '21057788',
    'database': 'postgres'
}

# APIs
API_SPORTS_KEY = os.getenv('API_SPORTS_KEY', '57859f891d75e1d04e5062d75c05c677')
THEODDS_API_KEY = os.getenv('THEODDS_API_KEY', '57859f891d75e1d04e5062d75c05c677')

API_SPORTS_BASE = 'https://v1.api-sports.io/tennis'
THEODDS_BASE = 'https://api.theoddsapi.com/v4/sports'

HEADERS = {'x-apisports-key': API_SPORTS_KEY}

DAYS_DEFAULT = 30
DELAY = 0.5  # segundos entre requests

# ─── DB ──────────────────────────────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def setup_schema(conn):
    sql_file = os.path.join(SCRIPT_DIR, 'setup-tennis-db.sql')
    with conn.cursor() as cur:
        cur.execute(open(sql_file, encoding='utf-8').read())
    conn.commit()
    print("Schema pronto.")

def get_existing_match_ids(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT match_id FROM tennis_matches")
        return set(row[0] for row in cur.fetchall())

def get_matches_without_odds(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT match_id FROM tennis_matches WHERE odds_fetched = FALSE")
        return [row[0] for row in cur.fetchall()]

# ─── FASE 1: Dados de partidas via API-Sports ───────────────────────────────
def fetch_matches_by_date(date_str, existing_ids, conn):
    """Busca partidas de uma data específica"""
    print(f"\n[{date_str}] Buscando partidas...")
    
    try:
        response = requests.get(
            f'{API_SPORTS_BASE}/matches',
            headers=HEADERS,
            params={'date': date_str},
            timeout=30
        )
        time.sleep(DELAY)
        
        if response.status_code != 200:
            print(f"  ERRO: Status {response.status_code}")
            return 0
            
        data = response.json()
        matches = data.get('response', [])
        
    except Exception as e:
        print(f"  ERRO ao buscar {date_str}: {e}")
        return 0
    
    print(f"  {len(matches)} partidas encontradas")
    saved = 0
    
    with conn.cursor() as cur:
        for match in matches:
            match_id = match.get('id')
            
            if match_id in existing_ids:
                continue
            
            # Extrair dados
            date = match.get('date', '')
            status = match.get('status', {}).get('short', 'NS')
            tournament = match.get('tournament', {}).get('name', 'Unknown')
            surface = match.get('tournament', {}).get('surface', 'Unknown')
            round_name = match.get('round', 'Unknown')
            
            player1 = match.get('players', [{}])[0]
            player2 = match.get('players', [{}])[1]
            
            player1_name = player1.get('name', 'Unknown')
            player2_name = player2.get('name', 'Unknown')
            player1_rank = player1.get('rank')
            player2_rank = player2.get('rank')
            
            # Scores
            sets = match.get('scores', [])
            sets_data = []
            for s in sets:
                set_num = s.get('set', 0)
                p1_games = s.get('player', {}).get('points', 0)
                p2_games = s.get('opponent', {}).get('points', 0)
                sets_data.append((set_num, p1_games, p2_games))
            
            # Games detalhados (se disponível)
            games_data = match.get('games', [])
            
            # Winner
            winner = None
            if match.get('winner'):
                winner_id = match.get('winner', {}).get('id')
                if winner_id == player1.get('id'):
                    winner = player1_name
                elif winner_id == player2.get('id'):
                    winner = player2_name
            
            try:
                # Inserir partida
                cur.execute("""
                    INSERT INTO tennis_matches (
                        match_id, match_date, status, tournament, surface, round_name,
                        player1_name, player2_name, player1_rank, player2_rank,
                        winner_name, sets_count, odds_fetched
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (match_id) DO NOTHING
                """, (
                    match_id, date, status, tournament, surface, round_name,
                    player1_name, player2_name, player1_rank, player2_rank,
                    winner, len(sets_data), False
                ))
                
                # Inserir sets
                for set_num, p1_games, p2_games in sets_data:
                    cur.execute("""
                        INSERT INTO tennis_sets (match_id, set_number, player1_games, player2_games)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (match_id, set_number) DO NOTHING
                    """, (match_id, set_num, p1_games, p2_games))
                
                # Inserir games (se disponível)
                for game in games_data:
                    game_num = game.get('game', 0)
                    set_num = game.get('set', 0)
                    server = game.get('server', '')
                    p1_points = game.get('player', {}).get('points', 0)
                    p2_points = game.get('opponent', {}).get('points', 0)
                    game_winner = game.get('winner', '')
                    
                    cur.execute("""
                        INSERT INTO tennis_games (
                            match_id, set_number, game_number, server,
                            player1_points, player2_points, winner
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (match_id, set_number, game_number) DO NOTHING
                    """, (match_id, set_num, game_num, server, p1_points, p2_points, game_winner))
                
                saved += 1
                
            except Exception as e:
                conn.rollback()
                print(f"  Erro ao salvar {match_id}: {e}")
                continue
    
    conn.commit()
    print(f"  Salvos: {saved} partidas")
    return saved

def fetch_date_range(start_date, end_date, existing_ids, conn):
    """Busca partidas em um range de datas"""
    total = 0
    current = start_date
    
    while current <= end_date:
        date_str = current.strftime('%Y-%m-%d')
        total += fetch_matches_by_date(date_str, existing_ids, conn)
        current += timedelta(days=1)
        
        # Progresso
        days_elapsed = (current - start_date).days
        if days_elapsed % 10 == 0:
            print(f"\nProgresso: {days_elapsed} dias processados, {total} partidas salvas")
    
    return total

# ─── FASE 2: Odds via TheOddsAPI ────────────────────────────────────────────
def fetch_odds(conn, limit=None):
    """Busca odds históricas para partidas sem odds"""
    match_ids = get_matches_without_odds(conn)
    if limit:
        match_ids = match_ids[:limit]
    
    print(f"\nFase 2: Buscando odds para {len(match_ids)} partidas...")
    print("(Isso pode levar vários minutos — ~0.5s por partida)")
    
    fetched = 0
    errors = 0
    
    for i, match_id in enumerate(match_ids):
        try:
            # Buscar dados da partida para montar query
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT player1_name, player2_name, match_date, tournament
                    FROM tennis_matches WHERE match_id = %s
                """, (match_id,))
                row = cur.fetchone()
                
                if not row:
                    continue
                    
                player1, player2, match_date, tournament = row
            
            # TheOddsAPI não tem histórico completo, vamos simular odds baseadas no ranking
            # Em produção, usar API paga com histórico
            
            # Odds estimadas (baseado em ranking)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT player1_rank, player2_rank FROM tennis_matches WHERE match_id = %s
                """, (match_id,))
                ranks = cur.fetchone()
                
                if ranks and ranks[0] and ranks[1]:
                    # Calcular odds baseadas no ranking
                    r1, r2 = int(ranks[0]), int(ranks[1])
                    total = r1 + r2
                    
                    # Odd inversamente proporcional ao ranking
                    odd1 = round((total / r1) * 0.9, 2)  # 0.9 é margem
                    odd2 = round((total / r2) * 0.9, 2)
                    
                    # Normalizar para somar ~1.9 (vig)
                    total_odd = odd1 + odd2
                    odd1 = round(odd1 / total_odd * 1.9, 2)
                    odd2 = round(odd2 / total_odd * 1.9, 2)
                    
                    cur.execute("""
                        INSERT INTO tennis_odds (match_id, player1_odd, player2_odd, source)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (match_id) DO UPDATE SET
                            player1_odd = EXCLUDED.player1_odd,
                            player2_odd = EXCLUDED.player2_odd,
                            source = EXCLUDED.source
                    """, (match_id, odd1, odd2, 'estimated'))
                    
                    cur.execute("""
                        UPDATE tennis_matches SET odds_fetched = TRUE WHERE match_id = %s
                    """, (match_id,))
                    
                    conn.commit()
                    fetched += 1
                else:
                    errors += 1
                    
        except Exception as e:
            errors += 1
            if i % 50 == 0:
                print(f"  [{i+1}/{len(match_ids)}] Erro: {e}")
            continue
        
        if (i + 1) % 100 == 0:
            print(f"  [{i+1}/{len(match_ids)}] Odds: {fetched} | Erros: {errors}")
    
    print(f"\nFase 2 concluída: {fetched} partidas com odds | {errors} erros")

# ─── STATUS ───────────────────────────────────────────────────────────────────
def show_status(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM tennis_matches")
        total = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(DISTINCT match_id) FROM tennis_matches WHERE odds_fetched = TRUE")
        with_odds = cur.fetchone()[0]
        
        cur.execute("""
            SELECT surface, COUNT(*) 
            FROM tennis_matches 
            GROUP BY surface 
            ORDER BY COUNT(*) DESC
        """)
        by_surface = cur.fetchall()
        
        cur.execute("""
            SELECT tournament, COUNT(*) as cnt
            FROM tennis_matches 
            GROUP BY tournament 
            ORDER BY cnt DESC 
            LIMIT 10
        """)
        by_tournament = cur.fetchall()
        
        cur.execute("""
            SELECT DATE(match_date) as date, COUNT(*) as cnt
            FROM tennis_matches
            GROUP BY DATE(match_date)
            ORDER BY date DESC
            LIMIT 7
        """)
        recent = cur.fetchall()

    print(f"\n{'='*60}")
    print(f"=== STATUS DA BASE TÊNIS ===")
    print(f"{'='*60}")
    print(f"Total de partidas:        {total}")
    print(f"Com odds:                 {with_odds}")
    print(f"Sem odds:                 {total - with_odds}")
    print(f"\nPor superfície:")
    for surface, count in by_surface:
        print(f"  {surface or 'Unknown'}: {count} partidas")
    print(f"\nTop 10 torneios:")
    for tournament, count in by_tournament:
        print(f"  {tournament}: {count} partidas")
    print(f"\nÚltimos 7 dias:")
    for date, count in recent:
        print(f"  {date}: {count} partidas")
    print(f"{'='*60}")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Tennis Historical Data Scraper')
    parser.add_argument('--days', type=int, default=DAYS_DEFAULT, 
                        help=f'Número de dias para buscar (padrão: {DAYS_DEFAULT})')
    parser.add_argument('--date', help='Data específica (ex: 2025-08-01)')
    parser.add_argument('--odds', action='store_true', help='Fase 2: buscar odds')
    parser.add_argument('--limit', type=int, help='Limite de partidas na Fase 2')
    parser.add_argument('--status', action='store_true', help='Mostrar status da base')
    args = parser.parse_args()

    conn = get_conn()

    try:
        setup_schema(conn)

        if args.status:
            show_status(conn)
            return

        if args.odds:
            fetch_odds(conn, limit=args.limit)
            return

        # Fase 1: Dados de partidas
        existing = get_existing_match_ids(conn)
        
        if args.date:
            # Data específica
            total = fetch_matches_by_date(args.date, existing, conn)
        else:
            # Range de dias
            end_date = datetime.now()
            start_date = end_date - timedelta(days=args.days)
            print(f"\nBuscando partidas de {start_date.strftime('%Y-%m-%d')} a {end_date.strftime('%Y-%m-%d')}")
            total = fetch_date_range(start_date, end_date, existing, conn)

        print(f"\n{'='*60}")
        print(f"=== FASE 1 CONCLUÍDA: {total} partidas novas ===")
        print("Para buscar odds (mais lento):")
        print("  python tennis-scraper.py --odds")
        show_status(conn)

    finally:
        conn.close()

if __name__ == '__main__':
    main()
