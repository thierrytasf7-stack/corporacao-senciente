#!/usr/bin/env python3
"""
NBA Historical Data Scraper
Fonte: nba_api (wrapper oficial não-oficial para stats.nba.com)
Destino: PostgreSQL local (porta 5432)

Uso:
  python nba-scraper.py              # Busca todas as temporadas
  python nba-scraper.py --season 2024-25
  python nba-scraper.py --quarters   # Fase 2: enriquece com Q1-Q4 reais
  python nba-scraper.py --status     # Mostra quantos jogos tem no banco

Instalar dependências:
  pip install nba_api psycopg2-binary
"""

import os
import sys
import time
import argparse
import psycopg2

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    from nba_api.stats.endpoints import LeagueGameFinder, BoxScoreSummaryV2
except ImportError:
    print("ERRO: nba_api nao instalado.")
    print("Execute: pip install nba_api psycopg2-binary")
    sys.exit(1)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
DB_CONFIG = {
    'host':     'localhost',
    'port':     5432,
    'user':     'postgres',
    'password': '21057788',
    'database': 'postgres'
}

SEASONS = ['2022-23', '2023-24', '2024-25']
DELAY   = 0.65   # segundos entre requests (respeitar rate limit NBA API)

# ─── DB ──────────────────────────────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def setup_schema(conn):
    sql_file = os.path.join(SCRIPT_DIR, 'setup-nba-db.sql')
    with conn.cursor() as cur:
        cur.execute(open(sql_file, encoding='utf-8').read())
    conn.commit()
    print("Schema pronto.")

def get_existing_game_ids(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT game_id FROM nba_games")
        return set(row[0] for row in cur.fetchall())

def get_games_without_quarters(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT game_id FROM nba_game_scores WHERE has_quarters = FALSE")
        return [row[0] for row in cur.fetchall()]

# ─── FASE 1: Final scores via LeagueGameFinder ───────────────────────────────
def fetch_season(season, existing_ids, conn):
    print(f"\n[{season}] Buscando lista de jogos...")

    try:
        finder = LeagueGameFinder(
            season_nullable=season,
            league_id_nullable='00',
            season_type_nullable='Regular Season',
            timeout=30
        )
        df = finder.get_data_frames()[0]
        time.sleep(DELAY)
    except Exception as e:
        print(f"  ERRO ao buscar {season}: {e}")
        return 0

    # Agrupa por game_id (cada jogo aparece 2x no df)
    games = {}
    for _, row in df.iterrows():
        gid = row['GAME_ID']
        if gid in existing_ids:
            continue
        if gid not in games:
            games[gid] = {'date': row['GAME_DATE'], 'season': season, 'teams': []}

        matchup = str(row.get('MATCHUP', ''))
        is_home = 'vs.' in matchup
        games[gid]['teams'].append({
            'name':     row['TEAM_NAME'],
            'is_home':  is_home,
            'final':    int(row.get('PTS', 0) or 0),
        })

    print(f"  {len(games)} jogos novos para salvar...")
    saved = 0

    with conn.cursor() as cur:
        for gid, g in games.items():
            if len(g['teams']) < 2:
                continue

            home = next((t for t in g['teams'] if t['is_home']), g['teams'][0])
            away = next((t for t in g['teams'] if not t['is_home']), g['teams'][1])

            # VALIDACAO: Evitar home_team = away_team
            if home['name'] == away['name']:
                print(f"  [SKIP] {gid}: times iguais ({home['name']})")
                continue

            # Estimar half_score: times da NBA marcam ~49% dos pontos no 1o tempo
            # (será substituido por valor real na Fase 2)
            home_half = round(home['final'] * 0.49)
            away_half = round(away['final'] * 0.49)

            try:
                cur.execute("""
                    INSERT INTO nba_games (game_id, game_date, home_team, away_team, season)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (game_id) DO NOTHING
                """, (gid, g['date'], home['name'], away['name'], season))

                for t, half in [(home, home_half), (away, away_half)]:
                    cur.execute("""
                        INSERT INTO nba_game_scores
                            (game_id, team_name, is_home, q1, q2, q3, q4, ot, final_score, half_score, has_quarters)
                        VALUES (%s, %s, %s, 0, 0, 0, 0, 0, %s, %s, FALSE)
                        ON CONFLICT (game_id, team_name) DO NOTHING
                    """, (gid, t['name'], t['is_home'], t['final'], half))

                saved += 1
            except Exception as e:
                conn.rollback()
                print(f"  Erro ao salvar {gid}: {e}")
                continue

        conn.commit()

    print(f"  Salvos: {saved} jogos")
    return saved

# ─── FASE 2: Enriquecer com Q1-Q4 reais via BoxScoreSummaryV2 ────────────────
def enrich_quarters(conn, limit=None):
    game_ids = get_games_without_quarters(conn)
    if limit:
        game_ids = game_ids[:limit]

    print(f"\nFase 2: Enriquecendo {len(game_ids)} jogos com scores por quarto...")
    print("(Isso pode levar varios minutos — ~0.7s por jogo)")

    enriched = 0
    errors   = 0

    for i, gid in enumerate(game_ids):
        try:
            box = BoxScoreSummaryV2(game_id=gid, timeout=30)
            ls  = box.get_data_frames()[5]   # LineScore
            time.sleep(DELAY)
        except Exception as e:
            errors += 1
            if i % 50 == 0:
                print(f"  [{i+1}/{len(game_ids)}] Erro: {e}")
            continue

        if ls is None or len(ls) < 2:
            continue

        with conn.cursor() as cur:
            # Busca nomes reais salvos na Fase 1 (evita mismatch "LA" vs "Los Angeles")
            cur.execute("SELECT team_name FROM nba_game_scores WHERE game_id=%s", (gid,))
            saved_names = [r[0] for r in cur.fetchall()]

            for _, row in ls.iterrows():
                abbrev = str(row.get('TEAM_ABBREVIATION', '')).upper()
                nickname = str(row.get('TEAM_NICKNAME', '')).lower()
                # Matcheia pelo nome salvo usando abreviação ou nickname
                team = next(
                    (n for n in saved_names if abbrev in n.upper() or nickname in n.lower()),
                    None
                )
                if not team:
                    continue  # não encontrou — pula sem corromper dados

                q1   = int(row.get('PTS_QTR1', 0) or 0)
                q2   = int(row.get('PTS_QTR2', 0) or 0)
                q3   = int(row.get('PTS_QTR3', 0) or 0)
                q4   = int(row.get('PTS_QTR4', 0) or 0)
                ot   = int(row.get('PTS_OT1',  0) or 0)
                half = q1 + q2

                cur.execute("""
                    UPDATE nba_game_scores
                    SET q1=%s, q2=%s, q3=%s, q4=%s, ot=%s, half_score=%s, has_quarters=TRUE
                    WHERE game_id=%s AND team_name=%s
                """, (q1, q2, q3, q4, ot, half, gid, team))

            conn.commit()
            enriched += 1

        if (i + 1) % 100 == 0:
            print(f"  [{i+1}/{len(game_ids)}] Enriquecidos: {enriched} | Erros: {errors}")

    print(f"\nFase 2 concluida: {enriched} jogos com Q1-Q4 reais | {errors} erros")

# ─── STATUS ───────────────────────────────────────────────────────────────────
def show_status(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM nba_games")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(DISTINCT game_id) FROM nba_game_scores WHERE has_quarters = TRUE")
        with_q = cur.fetchone()[0]
        cur.execute("SELECT season, COUNT(*) FROM nba_games GROUP BY season ORDER BY season")
        by_season = cur.fetchall()

    print(f"\n=== STATUS DA BASE NBA ===")
    print(f"Total de jogos:          {total}")
    print(f"Com quarters reais (Q1-Q4): {with_q}")
    print(f"Apenas final (estimado):    {total - with_q}")
    print(f"\nPor temporada:")
    for s, c in by_season:
        print(f"  {s}: {c} jogos")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='NBA Historical Data Scraper')
    parser.add_argument('--season',   help='Temporada específica (ex: 2024-25)')
    parser.add_argument('--quarters', action='store_true', help='Fase 2: enriquecer com Q1-Q4')
    parser.add_argument('--limit',    type=int, help='Limite de jogos na Fase 2')
    parser.add_argument('--status',   action='store_true', help='Mostrar status da base')
    args = parser.parse_args()

    conn = get_conn()

    try:
        setup_schema(conn)

        if args.status:
            show_status(conn)
            return

        if args.quarters:
            enrich_quarters(conn, limit=args.limit)
            return

        # Fase 1: final scores
        seasons = [args.season] if args.season else SEASONS
        existing = get_existing_game_ids(conn)
        total = 0
        for season in seasons:
            total += fetch_season(season, existing, conn)

        print(f"\n=== FASE 1 CONCLUIDA: {total} jogos novos ===")
        print("Para enriquecer com Q1-Q4 reais (mais lento):")
        print("  python nba-scraper.py --quarters")
        show_status(conn)

    finally:
        conn.close()

if __name__ == '__main__':
    main()
