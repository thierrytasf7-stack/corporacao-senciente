#!/usr/bin/env python3
"""
Gera dados mock realistas de tênis para backtest
Cria partidas sintéticas com base em padrões reais
"""

import json
import random
import sys
import os
from datetime import datetime, timedelta

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

random.seed(42)  # Reprodutibilidade

# Dados de exemplo
PLAYER_NAMES = [
    "Novak Djokovic", "Carlos Alcaraz", "Jannik Sinner", "Daniil Medvedev",
    "Alexander Zverev", "Andrey Rublev", "Holger Rune", "Hubert Hurkacz",
    "Casper Ruud", "Stefanos Tsitsipas", "Taylor Fritz", "Alex de Minaur",
    "Grigor Dimitrov", "Tommy Paul", "Ben Shelton", "Karen Khachanov",
    "Iga Swiatek", "Aryna Sabalenka", "Coco Gauff", "Elena Rybakina",
    "Jessica Pegula", "Ons Jabeur", "Marketa Vondrousova", "Maria Sakkari"
]

TOURNAMENTS = [
    "Australian Open", "Roland Garros", "Wimbledon", "US Open",
    "ATP Masters 1000 Indian Wells", "ATP Masters 1000 Miami",
    "ATP Masters 1000 Monte Carlo", "ATP Masters 1000 Madrid",
    "ATP Masters 1000 Rome", "ATP Masters 1000 Shanghai",
    "WTA 1000 Dubai", "WTA 1000 Beijing", "ATP 500 Barcelona",
    "ATP 500 London", "ATP 250 Rotterdam", "ATP 250 Tokyo"
]

SURFACES = ["Hard", "Clay", "Grass"]
SURFACE_WEIGHTS = [0.6, 0.3, 0.1]  # Hard é mais comum

def generate_player_ranking():
    """Gera ranking realista (1-250)"""
    # Distribuição enviesada para rankings melhores
    if random.random() < 0.3:
        return random.randint(1, 20)  # Top 20
    elif random.random() < 0.6:
        return random.randint(21, 100)  # Top 100
    else:
        return random.randint(101, 250)

def generate_odds(player1_rank, player2_rank):
    """Gera odds baseadas no ranking"""
    # Jogador com melhor ranking é favorito
    if player1_rank < player2_rank:
        favorite = 'player1'
        base_odd = 1.3 + (player1_rank / player2_rank) * 0.5
    else:
        favorite = 'player2'
        base_odd = 1.3 + (player2_rank / player1_rank) * 0.5
    
    # Normalizar odds
    odd1 = min(max(base_odd, 1.1), 4.0)
    odd2 = min(max(1 / (odd1 - 1) * 0.9, 1.1), 8.0)
    
    return favorite, round(odd1, 2), round(odd2, 2)

def generate_game_score(favorite_wins_game, is_30_0_trigger=False):
    """Gera placar de game com possível 30-0"""
    # Se é trigger 30-0, favorito reage e vence (premissa da estratégia)
    if is_30_0_trigger:
        # Favorito está perdendo 30-0 mas reage e vence o game
        return {'favorite': 0, 'opponent': 30}, 'favorite'  # favorite vence!
    
    # Possibilidade de 30-0 contra o favorito (sem reação)
    if not favorite_wins_game and random.random() < 0.25:
        # Favorito perde 30-0 e perde o game
        return {'favorite': 0, 'opponent': 30}, 'opponent'
    
    # Placares normais
    scores = [
        (40, 0), (40, 15), (40, 30), (0, 40), (15, 40), (30, 40),
        (0, 15), (15, 0), (30, 15), (15, 30)
    ]
    final_score = random.choice(scores)
    winner = 'favorite' if final_score[0] > final_score[1] else 'opponent'
    
    return {'favorite': final_score[0], 'opponent': final_score[1]}, winner

def generate_sets(winner_index, player1_name, player2_name):
    """Gera sets de uma partida"""
    sets = []
    player1_sets = 0
    player2_sets = 0
    
    # Melhor de 3 ou 5 sets
    max_sets = 5 if random.random() < 0.3 else 3
    needed_sets = max_sets // 2 + 1
    
    set_num = 1
    while player1_sets < needed_sets and player2_sets < needed_sets and set_num <= max_sets:
        # Último set sempre 6-4 ou 7-5/6
        if set_num == max_sets or (player1_sets == needed_sets - 1 or player2_sets == needed_sets - 1):
            if winner_index == 0:
                p1_games = random.choice([6, 7])
                p2_games = random.choice([4, 5]) if p1_games == 6 else 6
            else:
                p2_games = random.choice([6, 7])
                p1_games = random.choice([4, 5]) if p2_games == 6 else 6
        else:
            # Sets normais
            if winner_index == 0:
                p1_games = 6
                p2_games = random.choice([0, 1, 2, 3, 4])
            else:
                p2_games = 6
                p1_games = random.choice([0, 1, 2, 3, 4])
        
        sets.append({
            'setNumber': set_num,
            'player1Games': p1_games,
            'player2Games': p2_games
        })
        
        if p1_games > p2_games:
            player1_sets += 1
        else:
            player2_sets += 1
        
        set_num += 1
    
    return sets, 0 if player1_sets > player2_sets else 1

def generate_games(sets, favorite_index, player1_name, player2_name):
    """Gera games ponto-a-ponto com triggers 30-0"""
    games = []
    game_id = 1
    
    for s in sets:
        set_num = s['setNumber']
        total_games = s['player1Games'] + s['player2Games']
        
        # Alternar saque
        server = 'player1' if set_num % 2 == 1 else 'player2'
        
        for game_num in range(1, total_games + 1):
            # Determinar se favorito vence o game (75% chance no saque)
            favorite_wins = random.random() < 0.75
            
            # Verificar se este é um potencial trigger 30-0 (25% dos casos)
            is_30_0_trigger = random.random() < 0.25
            
            # Gerar placar
            points, winner_rel = generate_game_score(favorite_wins, is_30_0_trigger)
            
            # Mapear para player1/player2
            if server == 'player1':
                p1_points = points['favorite'] if favorite_index == 0 else points['opponent']
                p2_points = points['opponent'] if favorite_index == 0 else points['favorite']
                game_winner = player1_name if winner_rel == 'favorite' else player2_name
            else:
                p2_points = points['favorite'] if favorite_index == 1 else points['opponent']
                p1_points = points['opponent'] if favorite_index == 1 else points['favorite']
                game_winner = player2_name if winner_rel == 'favorite' else player1_name
            
            games.append({
                'gameId': f'g-{set_num}-{game_num}',
                'setNumber': set_num,
                'gameNumber': game_num,
                'server': server,
                'points': {
                    'player1': p1_points,
                    'player2': p2_points
                },
                'winner': game_winner,
                'interrupted': False
            })
            
            # Alternar saque
            server = 'player2' if server == 'player1' else 'player1'
    
    return games

def generate_match(match_id, date):
    """Gera uma partida completa"""
    # Selecionar jogadores
    player1 = random.choice(PLAYER_NAMES)
    player2 = random.choice([p for p in PLAYER_NAMES if p != player1])
    
    # Rankings
    player1_rank = generate_player_ranking()
    player2_rank = generate_player_ranking()
    
    # Odds
    favorite, odd1, odd2 = generate_odds(player1_rank, player2_rank)
    favorite_name = player1 if favorite == 'player1' else player2
    
    # Torneio e superfície
    tournament = random.choice(TOURNAMENTS)
    surface = random.choices(SURFACES, weights=SURFACE_WEIGHTS)[0]
    
    # Sets e vencedor
    sets, winner_index = generate_sets(
        0 if player1_rank < player2_rank else 1,
        player1, player2
    )
    winner_name = player1 if winner_index == 0 else player2
    
    # Games
    games = generate_games(sets, 0 if favorite == 'player1' else 1, player1, player2)
    
    return {
        'matchId': str(match_id),
        'date': date.isoformat(),
        'tournament': tournament,
        'surface': surface,
        'round': random.choice(['1st Round', '2nd Round', '3rd Round', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']),
        'player1': {
            'name': player1,
            'ranking': player1_rank
        },
        'player2': {
            'name': player2,
            'ranking': player2_rank
        },
        'preMatchOdds': {
            'player1': odd1,
            'player2': odd2
        },
        'favorite': favorite,
        'sets': sets,
        'games': games,
        'status': 'completed'
    }

def generate_dataset(num_matches=500, days=180):
    """Gera dataset completo"""
    print(f"\n{'='*60}")
    print(f"GERANDO DADOS MOCK DE TÊNIS")
    print(f"{'='*60}")
    print(f"Partidas: {num_matches}")
    print(f"Período: {days} dias")
    
    matches = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    for i in range(num_matches):
        # Data aleatória no período
        random_days = random.randint(0, days)
        match_date = end_date - timedelta(days=random_days)
        
        match = generate_match(i + 1, match_date)
        matches.append(match)
        
        if (i + 1) % 50 == 0:
            print(f"  Gerados: {i + 1}/{num_matches} partidas")
    
    # Ordenar por data
    matches.sort(key=lambda x: x['date'], reverse=True)
    
    print(f"\n[OK] {len(matches)} partidas geradas")
    return matches

def save_matches(matches, output_file='tennis-matches.json'):
    """Salva partidas em JSON"""
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', output_file)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(matches, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Dados salvos em: {output_path}")
    
    # Estatísticas
    triggers = sum(
        1 for m in matches
        for g in m['games']
        if g['points']['player1'] == 0 and g['points']['player2'] == 30
        or g['points']['player1'] == 30 and g['points']['player2'] == 0
    )
    
    print(f"[OK] Triggers 30-0 encontrados: {triggers}")
    
    return output_path

if __name__ == '__main__':
    # Gerar dataset
    matches = generate_dataset(num_matches=500, days=180)
    
    # Salvar
    output_path = save_matches(matches)
    
    # Copiar para pasta do backtest
    backtest_path = os.path.join(
        os.path.dirname(__file__),
        '..', '..', '..', '..',
        'squads', 'strategy-sports', 'backtest',
        'tennis-favorite-30-0-comeback', 'data', 'matches.json'
    )
    backtest_path = os.path.abspath(backtest_path)
    
    os.makedirs(os.path.dirname(backtest_path), exist_ok=True)
    with open(backtest_path, 'w', encoding='utf-8') as f:
        json.dump(matches, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Dados copiados para backtest: {backtest_path}")
    
    print(f"\n{'='*60}")
    print(f"DADOS MOCK PRONTOS PARA BACKTEST")
    print(f"{'='*60}")
