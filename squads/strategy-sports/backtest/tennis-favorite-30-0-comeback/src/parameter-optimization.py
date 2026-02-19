#!/usr/bin/env python3
"""
Otimização de Parâmetros
Testa variações de odds mín/máx, stake, etc.
"""

import json
import sys
import os
import random
from itertools import product

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_matches(filepath: str):
    """Carrega partidas"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def run_backtest_params(matches: list, min_odd: float, max_odd: float, stake: float) -> dict:
    """Executa backtest com parâmetros específicos"""
    random.seed(42)
    
    bankroll = 1000
    total_bets = 0
    wins = 0
    total_profit = 0
    
    for match in matches:
        favorite = match.get('favorite')
        if not favorite:
            continue
        
        for game in match.get('games', []):
            # Verificar trigger 30-0
            server = game.get('server')
            if server != favorite:
                continue
            
            points = game.get('points', {})
            opp = 'player2' if favorite == 'player1' else 'player1'
            
            if points.get(favorite, 0) != 0 or points.get(opp, 0) != 30:
                continue
            
            # Simular odd
            p1_rank = match['player1'].get('ranking', 50)
            p2_rank = match['player2'].get('ranking', 50)
            
            if favorite == 'player1':
                base_odd = 1.5 + (p2_rank / p1_rank) * 0.3 if p1_rank > 0 else 1.8
            else:
                base_odd = 1.5 + (p1_rank / p2_rank) * 0.3 if p2_rank > 0 else 1.8
            
            live_odd = base_odd + random.uniform(-0.1, 0.3)
            live_odd = round(min(max(live_odd, min_odd), max_odd), 2)
            
            if live_odd < min_odd or live_odd > max_odd:
                continue
            
            # Resultado
            favorite_name = match['player1']['name'] if favorite == 'player1' else match['player2']['name']
            game_winner = game.get('winner', '')
            won = game_winner == favorite_name
            
            # Calcular
            total_bets += 1
            if won:
                wins += 1
                profit = stake * (live_odd - 1)
            else:
                profit = -stake
            
            total_profit += profit
            bankroll += profit
    
    win_rate = wins / total_bets * 100 if total_bets > 0 else 0
    roi = total_profit / (total_bets * stake) * 100 if total_bets > 0 else 0
    
    return {
        'minOdd': min_odd,
        'maxOdd': max_odd,
        'stake': stake,
        'totalBets': total_bets,
        'wins': wins,
        'winRate': round(win_rate, 2),
        'totalProfit': round(total_profit, 2),
        'roi': round(roi, 2),
        'finalBankroll': round(1000 + total_profit, 2),
    }

def optimize(matches: list):
    """Testa múltiplas combinações de parâmetros"""
    print("\n" + "="*60)
    print("OTIMIZAÇÃO DE PARÂMETROS")
    print("="*60)
    
    # Parâmetros para testar
    min_odds = [1.60, 1.70, 1.80]
    max_odds = [2.00, 2.10, 2.20]
    stakes = [0.5, 1.0, 2.0]
    
    results = []
    total_combinations = len(min_odds) * len(max_odds) * len(stakes)
    
    print(f"\nTestando {total_combinations} combinações...\n")
    
    for i, (min_odd, max_odd, stake) in enumerate(product(min_odds, max_odds, stakes)):
        result = run_backtest_params(matches, min_odd, max_odd, stake)
        results.append(result)
        
        if (i + 1) % 3 == 0:
            print(f"  Progresso: {i+1}/{total_combinations}")
    
    # Ordenar por ROI
    results.sort(key=lambda x: x['roi'], reverse=True)
    
    # Imprimir top 5
    print("\n" + "="*60)
    print("TOP 5 COMBINAÇÕES")
    print("="*60)
    print("\n| Rank | Min Odd | Max Odd | Stake | Bets | Win Rate | ROI | Lucro |")
    print("|------|---------|---------|-------|------|----------|-----|-------|")
    
    for i, r in enumerate(results[:5], 1):
        print(f"| {i} | {r['minOdd']:.2f} | {r['maxOdd']:.2f} | {r['stake']:.1f} | {r['totalBets']} | {r['winRate']:.2f}% | {r['roi']:.2f}% | {r['totalProfit']:.2f} |")
    
    # Melhor resultado
    best = results[0]
    print("\n" + "="*60)
    print("MELHOR COMBINAÇÃO")
    print("="*60)
    print(f"Min Odd: {best['minOdd']}")
    print(f"Max Odd: {best['maxOdd']}")
    print(f"Stake: {best['stake']}")
    print(f"Total Bets: {best['totalBets']}")
    print(f"Win Rate: {best['winRate']:.2f}%")
    print(f"ROI: {best['roi']:.2f}%")
    print(f"Lucro: {best['totalProfit']:.2f}")
    print(f"Bankroll Final: {best['finalBankroll']:.2f}")
    
    # Salvar resultados
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'parameter-optimization.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'best': best,
            'top5': results[:5],
            'all': results,
        }, f, indent=2)
    
    print(f"\n[OK] Resultados salvos: {output_path}")
    
    return results

if __name__ == '__main__':
    # Carregar dados
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backtest_dir = os.path.dirname(script_dir)
    data_path = os.path.join(backtest_dir, 'data', 'matches.json')
    
    print(f"\nCarregando dados: {data_path}")
    matches = load_matches(data_path)
    print(f"[OK] {len(matches)} partidas carregadas")
    
    # Otimizar
    results = optimize(matches)
    
    print("\n" + "="*60)
    print("OTIMIZAÇÃO CONCLUÍDA")
    print("="*60)
