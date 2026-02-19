#!/usr/bin/env python3
"""
Exporta dados do PostgreSQL para JSON (formato backtest)

Uso:
  python export-data.py                 # Tênis (padrão)
  python export-data.py --sport nba     # NBA
  python export-data.py --output custom.json  # Arquivo customizado
"""

import os
import sys
import argparse
import psycopg2
import json
from datetime import datetime

# ─── CONFIG ───────────────────────────────────────────────────────────────────
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '21057788',
    'database': 'postgres'
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUTPUT = os.path.join(SCRIPT_DIR, '..', 'data', 'tennis-matches.json')

# ─── EXPORT: TENIS ────────────────────────────────────────────────────────────
def export_tennis_matches(output_file=DEFAULT_OUTPUT, days=None, min_date=None):
    """Exporta partidas de tênis para JSON (formato backtest)"""
    
    conn = psycopg2.connect(**DB_CONFIG)
    
    print(f"📊 Exportando dados de Tênis...")
    
    with conn.cursor() as cur:
        # Query principal
        query = """
            SELECT 
                m.match_id,
                m.match_date,
                m.tournament,
                m.surface,
                m.round_name,
                m.player1_name,
                m.player2_name,
                m.player1_rank,
                m.player2_rank,
                m.winner_name,
                m.status,
                o.player1_odd,
                o.player2_odd,
                json_agg(
                    json_build_object(
                        'set_number', s.set_number,
                        'player1_games', s.player1_games,
                        'player2_games', s.player2_games
                    ) ORDER BY s.set_number
                ) as sets,
                json_agg(
                    DISTINCT jsonb_build_object(
                        'game_id', g.id,
                        'set_number', g.set_number,
                        'game_number', g.game_number,
                        'server', g.server,
                        'player1_points', g.player1_points,
                        'player2_points', g.player2_points,
                        'winner', g.winner
                    )
                ) as games
            FROM tennis_matches m
            LEFT JOIN tennis_odds o ON m.match_id = o.match_id
            LEFT JOIN tennis_sets s ON m.match_id = s.match_id
            LEFT JOIN tennis_games g ON m.match_id = g.match_id
            WHERE m.status = 'Finished'
        """
        
        params = []
        conditions = []
        
        if days:
            conditions.append(f"m.match_date >= NOW() - INTERVAL '{days} days'")
        
        if min_date:
            conditions.append(f"m.match_date >= %s")
            params.append(min_date)
        
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        query += " GROUP BY m.match_id, o.player1_odd, o.player2_odd ORDER BY m.match_date DESC"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        matches = []
        for row in rows:
            match_id = row[0]
            
            # Tratar sets
            sets_raw = row[12] or []
            sets = []
            for s in sets_raw:
                if s and isinstance(s, dict):
                    sets.append({
                        'setNumber': s.get('set_number', 0),
                        'player1Games': s.get('player1_games', 0),
                        'player2Games': s.get('player2_games', 0)
                    })
            
            # Tratar games
            games_raw = row[13] or []
            games = []
            for g in games_raw:
                if g and isinstance(g, dict):
                    games.append({
                        'gameId': f"g-{match_id}-{g.get('set_number', 0)}-{g.get('game_number', 0)}",
                        'setNumber': g.get('set_number', 0),
                        'gameNumber': g.get('game_number', 0),
                        'server': g.get('server', ''),
                        'points': {
                            'player1': g.get('player1_points', 0),
                            'player2': g.get('player2_points', 0)
                        },
                        'winner': g.get('winner', ''),
                        'interrupted': False
                    })
            
            # Montar match no formato do backtest
            match = {
                'matchId': str(match_id),
                'date': row[1].isoformat() if row[1] else None,
                'tournament': row[2] or 'Unknown',
                'surface': row[3] or 'Unknown',
                'round': row[4] or 'Unknown',
                'player1': {
                    'name': row[5] or 'Unknown',
                    'ranking': row[7]
                },
                'player2': {
                    'name': row[6] or 'Unknown',
                    'ranking': row[8]
                },
                'preMatchOdds': {
                    'player1': float(row[11]) if row[11] else None,
                    'player2': float(row[12]) if row[12] else None
                },
                'sets': sets,
                'games': games,
                'status': 'completed' if row[10] == 'Finished' else row[10]
            }
            
            # Calcular odd do favorito
            if match['preMatchOdds']['player1'] and match['preMatchOdds']['player2']:
                if match['preMatchOdds']['player1'] < match['preMatchOdds']['player2']:
                    match['favorite'] = 'player1'
                else:
                    match['favorite'] = 'player2'
            
            matches.append(match)
        
        # Criar diretório de saída
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Salvar JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(matches, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {len(matches)} partidas exportadas para {output_file}")
        print(f"📊 Período: {rows[0][1] if rows and rows[0][1] else 'N/A'} até {rows[-1][1] if rows and rows[-1][1] else 'N/A'}")
    
    conn.close()
    return len(matches)

# ─── EXPORT: NBA ──────────────────────────────────────────────────────────────
def export_nba_games(output_file=None, days=None):
    """Exporta jogos da NBA para JSON"""
    
    if not output_file:
        output_file = os.path.join(SCRIPT_DIR, '..', 'data', 'nba-games.json')
    
    conn = psycopg2.connect(**DB_CONFIG)
    
    print(f"📊 Exportando dados de NBA...")
    
    with conn.cursor() as cur:
        query = """
            SELECT 
                g.game_id,
                g.game_date,
                g.home_team,
                g.away_team,
                g.season,
                s.team_name,
                s.is_home,
                s.q1, s.q2, s.q3, s.q4, s.ot,
                s.final_score,
                s.half_score,
                s.has_quarters
            FROM nba_games g
            JOIN nba_game_scores s ON g.game_id = s.game_id
            WHERE 1=1
        """
        
        params = []
        if days:
            query += " AND g.game_date >= NOW() - INTERVAL '%s days'"
            params.append(days)
        
        query += " ORDER BY g.game_date DESC"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        # Agrupar por game_id
        games_dict = {}
        for row in rows:
            game_id = row[0]
            
            if game_id not in games_dict:
                games_dict[game_id] = {
                    'gameId': str(game_id),
                    'date': row[1].isoformat() if row[1] else None,
                    'homeTeam': row[2],
                    'awayTeam': row[3],
                    'season': row[4],
                    'teams': []
                }
            
            games_dict[game_id]['teams'].append({
                'name': row[5],
                'isHome': row[6],
                'scores': {
                    'q1': row[7] or 0,
                    'q2': row[8] or 0,
                    'q3': row[9] or 0,
                    'q4': row[10] or 0,
                    'ot': row[11] or 0,
                    'final': row[12] or 0,
                    'half': row[13] or 0
                }
            })
        
        games = list(games_dict.values())
        
        # Criar diretório de saída
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Salvar JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(games, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {len(games)} jogos exportados para {output_file}")
    
    conn.close()
    return len(games)

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Export data for backtest')
    parser.add_argument('--sport', choices=['tennis', 'nba'], default='tennis',
                        help='Esporte para exportar (padrão: tennis)')
    parser.add_argument('--output', help='Arquivo de saída')
    parser.add_argument('--days', type=int, help='Dias para exportar')
    parser.add_argument('--min-date', help='Data mínima (YYYY-MM-DD)')
    args = parser.parse_args()
    
    if args.sport == 'tennis':
        export_tennis_matches(
            output_file=args.output or DEFAULT_OUTPUT,
            days=args.days,
            min_date=args.min_date
        )
    elif args.sport == 'nba':
        export_nba_games(
            output_file=args.output,
            days=args.days
        )

if __name__ == '__main__':
    main()
