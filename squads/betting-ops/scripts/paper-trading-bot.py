#!/usr/bin/env python3
"""
Bot de Paper Trading: Tennis Favorite 30-0 Comeback
Monitora triggers e executa apostas simuladas

Uso:
  python paper-trading-bot.py              # Rodar contínuo
  python paper-trading-bot.py --once       # Uma execução
  python paper-trading-bot.py --simulate   # Simular com dados mock
"""

import os
import sys
import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ─── CONFIG ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(SCRIPT_DIR, 'data', 'paper-trading-state.json')
LOG_FILE = os.path.join(SCRIPT_DIR, 'data', 'paper-trading-log.md')
DATA_FILE = os.path.join(SCRIPT_DIR, '..', '..', 'modules', 'betting-platform', 'backend', 'data', 'tennis-matches.json')

# Parâmetros da estratégia
CONFIG = {
    'minOdds': 1.70,
    'maxOdds': 2.10,
    'stake': 1.0,
    'maxBetsPerDay': 20,
    'stopLossDaily': 10.0,
}

# ─── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────────

def load_state() -> Dict[str, Any]:
    """Carrega estado atual do paper trading"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Estado inicial
    return {
        'strategy': 'tennis-favorite-30-0-comeback',
        'status': 'active',
        'startedAt': datetime.now().isoformat(),
        'bankroll': {
            'initial': 1000.0,
            'current': 1000.0,
            'currency': 'units'
        },
        'parameters': CONFIG,
        'metrics': {
            'totalBets': 0,
            'wins': 0,
            'losses': 0,
            'winRate': 0,
            'totalProfit': 0,
            'roi': 0,
            'maxDrawdown': 0,
            'currentStreak': 0,
            'longestWinStreak': 0,
            'longestLossStreak': 0
        },
        'bets': [],
        'dailyLogs': []
    }

def save_state(state: Dict[str, Any]):
    """Salva estado atual"""
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def load_mock_data() -> List[Dict[str, Any]]:
    """Carrega dados mock para simulação"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def generate_simulated_match() -> Dict[str, Any]:
    """Gera partida simulada para teste"""
    players = [
        "Djokovic", "Alcaraz", "Sinner", "Medvedev", "Zverev",
        "Rublev", "Rune", "Hurkacz", "Ruud", "Tsitsipas"
    ]
    
    player1 = random.choice(players)
    player2 = random.choice([p for p in players if p != player1])
    
    rank1 = random.randint(1, 50)
    rank2 = random.randint(1, 50)
    
    # Favorito tem menor odd
    if rank1 < rank2:
        favorite = 'player1'
        odd1 = round(1.3 + (rank1 / rank2) * 0.5, 2)
        odd2 = round(1 / (odd1 - 1) * 0.9, 2)
    else:
        favorite = 'player2'
        odd2 = round(1.3 + (rank2 / rank1) * 0.5, 2)
        odd1 = round(1 / (odd2 - 1) * 0.9, 2)
    
    # Gerar games com triggers 30-0
    games = []
    set_num = 1
    game_num = 0
    
    for i in range(15):  # 15 games por set
        game_num += 1
        server = 'player1' if (set_num + game_num) % 2 == 0 else 'player2'
        
        # 20% de chance de trigger 30-0
        is_trigger = random.random() < 0.2
        
        if is_trigger and server == favorite:
            # Trigger: favorito perde 30-0 mas reage e vence
            points = {'player1': 0, 'player2': 30} if server == 'player1' else {'player1': 30, 'player2': 0}
            winner = player1 if server == 'player1' else player2  # Favorito vence
        else:
            # Game normal
            p1_pts = random.choice([0, 15, 30, 40])
            p2_pts = random.choice([0, 15, 30, 40])
            points = {'player1': p1_pts, 'player2': p2_pts}
            winner = player1 if p1_pts > p2_pts else player2
        
        games.append({
            'gameId': f'g-{set_num}-{game_num}',
            'setNumber': set_num,
            'gameNumber': game_num,
            'server': server,
            'points': points,
            'winner': winner,
            'interrupted': False
        })
    
    return {
        'matchId': f'sim-{datetime.now().strftime("%Y%m%d%H%M%S")}',
        'date': datetime.now().isoformat(),
        'tournament': random.choice(['ATP Dubai', 'WTA Dubai', 'ATP Indian Wells', 'Challenger']),
        'surface': random.choice(['Hard', 'Clay', 'Grass']),
        'round': random.choice(['1st Round', '2nd Round', 'Quarter-finals']),
        'player1': {'name': player1, 'ranking': rank1},
        'player2': {'name': player2, 'ranking': rank2},
        'preMatchOdds': {'player1': min(odd1, odd2), 'player2': max(odd1, odd2)},
        'favorite': favorite,
        'sets': [],
        'games': games,
        'status': 'live'
    }

def detect_triggers(matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detecta triggers 30-0 em partidas"""
    triggers = []
    
    for match in matches:
        favorite = match.get('favorite')
        if not favorite:
            continue
        
        for game in match.get('games', []):
            # Verificar se favorito está sacando
            server = game.get('server')
            if server != favorite:
                continue
            
            # Verificar placar 30-0 contra favorito
            points = game.get('points', {})
            opp = 'player2' if favorite == 'player1' else 'player1'
            
            if points.get(favorite, 0) == 0 and points.get(opp, 0) == 30:
                triggers.append({
                    'match': match,
                    'game': game,
                    'favorite': favorite,
                    'timestamp': datetime.now().isoformat()
                })
    
    return triggers

def execute_bet(trigger: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, Any]:
    """Executa aposta simulada"""
    match = trigger['match']
    game = trigger['game']
    favorite = trigger['favorite']
    
    # Obter nome do favorito
    favorite_name = match['player1']['name'] if favorite == 'player1' else match['player2']['name']
    opponent_name = match['player2']['name'] if favorite == 'player1' else match['player1']['name']
    
    # Simular odd (baseada no ranking)
    p1_rank = match['player1'].get('ranking', 50)
    p2_rank = match['player2'].get('ranking', 50)
    
    if favorite == 'player1':
        base_odd = 1.5 + (p2_rank / p1_rank) * 0.3 if p1_rank > 0 else 1.8
    else:
        base_odd = 1.5 + (p1_rank / p2_rank) * 0.3 if p2_rank > 0 else 1.8
    
    live_odd = round(min(max(base_odd + random.uniform(-0.1, 0.3), CONFIG['minOdds']), CONFIG['maxOdds']), 2)
    
    # Verificar se odd está na faixa
    if live_odd < CONFIG['minOdds'] or live_odd > CONFIG['maxOdds']:
        return None
    
    # Determinar resultado (favorito vence o game após 30-0)
    # Premissa: favorito reage e vence 75% das vezes
    won = random.random() < 0.75
    
    # Calcular profit
    stake = CONFIG['stake']
    profit = stake * (live_odd - 1) if won else -stake
    
    # Atualizar bankroll
    state['bankroll']['current'] += profit
    
    # Criar registro da aposta
    bet = {
        'id': f"bet-{len(state['bets']) + 1}",
        'timestamp': trigger['timestamp'],
        'executedAt': datetime.now().isoformat(),
        'matchId': match['matchId'],
        'tournament': match['tournament'],
        'surface': match['surface'],
        'player1': match['player1']['name'],
        'player2': match['player2']['name'],
        'favorite': favorite_name,
        'opponent': opponent_name,
        'odd': live_odd,
        'stake': stake,
        'result': 'WIN' if won else 'LOSS',
        'profit': round(profit, 2),
        'bankrollAfter': round(state['bankroll']['current'], 2),
        'gameServer': favorite,
        'triggerScore': '30-0',
    }
    
    # Atualizar métricas
    state['metrics']['totalBets'] += 1
    if won:
        state['metrics']['wins'] += 1
        state['metrics']['currentStreak'] += 1
        if state['metrics']['currentStreak'] > state['metrics']['longestWinStreak']:
            state['metrics']['longestWinStreak'] = state['metrics']['currentStreak']
    else:
        state['metrics']['losses'] += 1
        state['metrics']['currentStreak'] -= 1
        if abs(state['metrics']['currentStreak']) > state['metrics']['longestLossStreak']:
            state['metrics']['longestLossStreak'] = abs(state['metrics']['currentStreak'])
    
    # Calcular win rate e ROI
    total_bets = state['metrics']['totalBets']
    state['metrics']['winRate'] = round(state['metrics']['wins'] / total_bets * 100, 2) if total_bets > 0 else 0
    total_profit = sum(b['profit'] for b in state['bets']) + profit
    state['metrics']['totalProfit'] = round(total_profit, 2)
    state['metrics']['roi'] = round(total_profit / (total_bets * stake) * 100, 2) if total_bets > 0 else 0
    
    # Calcular drawdown
    peak = max([b['bankrollAfter'] for b in state['bets']] + [state['bankroll']['initial']])
    current_drawdown = (peak - state['bankroll']['current']) / peak * 100
    if current_drawdown > state['metrics']['maxDrawdown']:
        state['metrics']['maxDrawdown'] = round(current_drawdown, 2)
    
    return bet

def update_log(state: Dict[str, Any], bet: Dict[str, Any] = None):
    """Atualiza arquivo de log"""
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    # Carregar log atual
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    else:
        lines = []
    
    # Se for nova aposta, adicionar à tabela
    if bet:
        # Encontrar linha da tabela
        for i, line in enumerate(lines):
            if line.startswith('| Data/Hora |'):
                # Inserir após o cabeçalho
                timestamp = bet['executedAt'].replace('T', ' ').split('.')[0]
                result_emoji = '✅' if bet['result'] == 'WIN' else '❌'
                new_row = (
                    f"| {timestamp} | {bet['tournament']} | {bet['player1']} vs {bet['player2']} | "
                    f"{bet['odd']:.2f} | {bet['stake']:.1f} | {result_emoji} {bet['result']} | "
                    f"{bet['profit']:+.2f} | {bet['bankrollAfter']:.2f} |\n"
                )
                lines.insert(i + 1, new_row)
                break
    
    # Atualizar métricas no log
    for i, line in enumerate(lines):
        if line.startswith('- **Total Apostas:**'):
            lines[i] = f"- **Total Apostas:** {state['metrics']['totalBets']}\n"
        elif line.startswith('- **Vitórias:**'):
            lines[i] = f"- **Vitórias:** {state['metrics']['wins']}\n"
        elif line.startswith('- **Derrotas:**'):
            lines[i] = f"- **Derrotas:** {state['metrics']['losses']}\n"
        elif line.startswith('- **Win Rate:**'):
            lines[i] = f"- **Win Rate:** {state['metrics']['winRate']:.2f}%\n"
        elif line.startswith('- **ROI:**'):
            lines[i] = f"- **ROI:** {state['metrics']['roi']:.2f}%\n"
        elif line.startswith('- **Bankroll Atual:**'):
            lines[i] = f"- **Bankroll Atual:** {state['bankroll']['current']:.2f}\n"
        elif line.startswith('- **Lucro Hoje:**'):
            today_profit = sum(b['profit'] for b in state['bets'] if b['executedAt'].startswith(datetime.now().strftime('%Y-%m-%d')))
            lines[i] = f"- **Lucro Hoje:** {today_profit:+.2f}\n"
    
    # Salvar log
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def print_status(state: Dict[str, Any]):
    """Imprime status atual"""
    m = state['metrics']
    b = state['bankroll']
    
    print("\n" + "="*60)
    print("PAPER TRADING: Tennis Favorite 30-0 Comeback")
    print("="*60)
    print(f"Status: {state['status']}")
    print(f"Início: {state['startedAt']}")
    print("-"*60)
    print(f"Bankroll: {b['current']:.2f} (Inicial: {b['initial']:.2f})")
    print(f"Total Apostas: {m['totalBets']}")
    print(f"Vitórias: {m['wins']} | Derrotas: {m['losses']}")
    print(f"Win Rate: {m['winRate']:.2f}%")
    print(f"ROI: {m['roi']:.2f}%")
    print(f"Lucro Total: {m['totalProfit']:+.2f}")
    print(f"Max Drawdown: {m['maxDrawdown']:.2f}%")
    print(f"Sequência Atual: {m['currentStreak']:+d}")
    print("-"*60)
    
    # Verificar alertas
    if m['winRate'] < 70 and m['totalBets'] >= 50:
        print("⚠️ ALERTA: Win Rate abaixo de 70%")
    if m['maxDrawdown'] > 5:
        print("⚠️ ALERTA: Drawdown acima de 5%")
    if m['totalProfit'] < -CONFIG['stopLossDaily']:
        print("🔴 STOP LOSS DIÁRIO ATINGIDO")
    
    print("="*60)

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def run_once(simulate: bool = False):
    """Executa uma vez"""
    print("\n[Paper Trading Bot] Executando...")
    
    # Carregar estado
    state = load_state()
    
    # Carregar ou gerar dados
    if simulate:
        print("  - Gerando partida simulada...")
        matches = [generate_simulated_match()]
    else:
        print("  - Carregando dados mock...")
        matches = load_mock_data()
        if not matches:
            print("  - Nenhum dado encontrado, gerando simulado...")
            matches = [generate_simulated_match()]
    
    # Detectar triggers
    print("  - Detectando triggers 30-0...")
    triggers = detect_triggers(matches)
    print(f"  - {len(triggers)} triggers encontrados")
    
    # Executar apostas
    bets_executed = 0
    for trigger in triggers:
        # Verificar limites
        today_bets = [b for b in state['bets'] if b['executedAt'].startswith(datetime.now().strftime('%Y-%m-%d'))]
        if len(today_bets) >= CONFIG['maxBetsPerDay']:
            print("  - Limite diário de apostas atingido")
            break
        
        if state['metrics']['totalProfit'] < -CONFIG['stopLossDaily']:
            print("  - Stop loss diário atingido")
            break
        
        # Executar aposta
        bet = execute_bet(trigger, state)
        if bet:
            state['bets'].append(bet)
            bets_executed += 1
            print(f"  - Aposta executada: {bet['favorite']} @ {bet['odd']:.2f} = {bet['result']} ({bet['profit']:+.2f})")
    
    # Salvar estado
    save_state(state)
    
    # Atualizar log
    if bets_executed > 0:
        update_log(state, state['bets'][-1])
    
    # Imprimir status
    print_status(state)
    
    return bets_executed

def run_continuous(simulate: bool = False, interval: int = 60):
    """Executa continuamente"""
    print("\n[Paper Trading Bot] Iniciando modo contínuo...")
    print(f"  - Intervalo: {interval} segundos")
    print(f"  - Simulação: {simulate}")
    print("  - Pressione Ctrl+C para parar")
    
    iteration = 0
    try:
        while True:
            iteration += 1
            print(f"\n--- Iteração {iteration} ---")
            
            bets = run_once(simulate)
            
            if bets == 0:
                print("  - Nenhuma aposta executada nesta iteração")
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n\n[Paper Trading Bot] Parado pelo usuário")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Paper Trading Bot')
    parser.add_argument('--once', action='store_true', help='Executar uma vez')
    parser.add_argument('--simulate', action='store_true', help='Usar dados simulados')
    parser.add_argument('--continuous', action='store_true', help='Executar continuamente')
    parser.add_argument('--interval', type=int, default=60, help='Intervalo em segundos (contínuo)')
    
    args = parser.parse_args()
    
    if args.continuous:
        run_continuous(simulate=args.simulate, interval=args.interval)
    else:
        run_once(simulate=args.simulate)
