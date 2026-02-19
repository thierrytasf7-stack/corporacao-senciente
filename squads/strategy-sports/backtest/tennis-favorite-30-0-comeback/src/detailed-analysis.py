#!/usr/bin/env python3
"""
Análise Detalhada do Backtest
Gera análises por superfície, torneio, odds range, etc.
"""

import json
import sys
import os
from datetime import datetime
from collections import defaultdict

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_results(filepath: str):
    """Carrega resultados do backtest"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_by_surface(bets: list) -> dict:
    """Análise por superfície"""
    surface_data = defaultdict(lambda: {'bets': 0, 'wins': 0, 'profit': 0})
    
    for bet in bets:
        surface = bet.get('surface', 'Unknown')
        surface_data[surface]['bets'] += 1
        if bet['result'] == 'WIN':
            surface_data[surface]['wins'] += 1
        surface_data[surface]['profit'] += bet['profit']
    
    # Calcular métricas
    results = {}
    for surface, data in surface_data.items():
        results[surface] = {
            'bets': data['bets'],
            'wins': data['wins'],
            'losses': data['bets'] - data['wins'],
            'winRate': round(data['wins'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
            'profit': round(data['profit'], 2),
            'roi': round(data['profit'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
        }
    
    return results

def analyze_by_tournament(bets: list, top_n: int = 10) -> dict:
    """Análise por torneio (top N)"""
    tournament_data = defaultdict(lambda: {'bets': 0, 'wins': 0, 'profit': 0})
    
    for bet in bets:
        tournament = bet.get('tournament', 'Unknown')
        tournament_data[tournament]['bets'] += 1
        if bet['result'] == 'WIN':
            tournament_data[tournament]['wins'] += 1
        tournament_data[tournament]['profit'] += bet['profit']
    
    # Ordenar por número de apostas e pegar top N
    sorted_tournaments = sorted(
        tournament_data.items(),
        key=lambda x: x[1]['bets'],
        reverse=True
    )[:top_n]
    
    results = {}
    for tournament, data in sorted_tournaments:
        results[tournament] = {
            'bets': data['bets'],
            'wins': data['wins'],
            'losses': data['bets'] - data['wins'],
            'winRate': round(data['wins'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
            'profit': round(data['profit'], 2),
            'roi': round(data['profit'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
        }
    
    return results

def analyze_by_odds_range(bets: list) -> dict:
    """Análise por faixa de odds"""
    ranges = {
        '1.70-1.80': (1.70, 1.80),
        '1.80-1.90': (1.80, 1.90),
        '1.90-2.00': (1.90, 2.00),
        '2.00-2.10': (2.00, 2.10),
    }
    
    range_data = {name: {'bets': 0, 'wins': 0, 'profit': 0} for name in ranges}
    
    for bet in bets:
        odd = bet.get('odd', 0)
        for range_name, (min_odd, max_odd) in ranges.items():
            if min_odd <= odd < max_odd:
                range_data[range_name]['bets'] += 1
                if bet['result'] == 'WIN':
                    range_data[range_name]['wins'] += 1
                range_data[range_name]['profit'] += bet['profit']
                break
    
    # Calcular métricas
    results = {}
    for range_name, data in range_data.items():
        results[range_name] = {
            'bets': data['bets'],
            'wins': data['wins'],
            'losses': data['bets'] - data['wins'],
            'winRate': round(data['wins'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
            'profit': round(data['profit'], 2),
            'roi': round(data['profit'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
        }
    
    return results

def analyze_by_month(bets: list) -> dict:
    """Análise por mês"""
    month_data = defaultdict(lambda: {'bets': 0, 'wins': 0, 'profit': 0})
    
    for bet in bets:
        date_str = bet.get('date', '')[:7]  # YYYY-MM
        if date_str:
            month_data[date_str]['bets'] += 1
            if bet['result'] == 'WIN':
                month_data[date_str]['wins'] += 1
            month_data[date_str]['profit'] += bet['profit']
    
    # Calcular métricas
    results = {}
    for month, data in sorted(month_data.items()):
        results[month] = {
            'bets': data['bets'],
            'wins': data['wins'],
            'losses': data['bets'] - data['wins'],
            'winRate': round(data['wins'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
            'profit': round(data['profit'], 2),
            'roi': round(data['profit'] / data['bets'] * 100, 2) if data['bets'] > 0 else 0,
        }
    
    return results

def analyze_streaks(bets: list) -> dict:
    """Análise de sequências"""
    current_win_streak = 0
    current_loss_streak = 0
    max_win_streak = 0
    max_loss_streak = 0
    
    win_streaks = []
    loss_streaks = []
    
    for bet in bets:
        if bet['result'] == 'WIN':
            current_win_streak += 1
            current_loss_streak = 0
            if current_win_streak > max_win_streak:
                max_win_streak = current_win_streak
        else:
            current_loss_streak += 1
            current_win_streak = 0
            if current_loss_streak > max_loss_streak:
                max_loss_streak = current_loss_streak
    
    return {
        'longestWinStreak': max_win_streak,
        'longestLossStreak': max_loss_streak,
        'avgWinStreak': round(sum(win_streaks) / len(win_streaks), 2) if win_streaks else 0,
        'avgLossStreak': round(sum(loss_streaks) / len(loss_streaks), 2) if loss_streaks else 0,
    }

def generate_report(analysis: dict, output_dir: str):
    """Gera relatório de análise detalhada"""
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'detailed-analysis.md')
    
    report = "# Análise Detalhada do Backtest\n\n"
    report += "**Estratégia:** Tennis Favorite 30-0 Comeback\n"
    report += f"**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    # Por Superfície
    report += "## Análise por Superfície\n\n"
    report += "| Superfície | Apostas | Vitórias | Derrotas | Win Rate | Lucro | ROI |\n"
    report += "|------------|---------|----------|----------|----------|-------|-----|\n"
    
    for surface, data in analysis['surface'].items():
        report += f"| {surface} | {data['bets']} | {data['wins']} | {data['losses']} | {data['winRate']:.2f}% | {data['profit']:.2f} | {data['roi']:.2f}% |\n"
    
    report += "\n"
    
    # Por Torneio
    report += "## Análise por Torneio (Top 10)\n\n"
    report += "| Torneio | Apostas | Vitórias | Derrotas | Win Rate | Lucro | ROI |\n"
    report += "|---------|---------|----------|----------|----------|-------|-----|\n"
    
    for tournament, data in analysis['tournament'].items():
        report += f"| {tournament} | {data['bets']} | {data['wins']} | {data['losses']} | {data['winRate']:.2f}% | {data['profit']:.2f} | {data['roi']:.2f}% |\n"
    
    report += "\n"
    
    # Por Faixa de Odds
    report += "## Análise por Faixa de Odds\n\n"
    report += "| Odds | Apostas | Vitórias | Derrotas | Win Rate | Lucro | ROI |\n"
    report += "|------|---------|----------|----------|----------|-------|-----|\n"
    
    for odds_range, data in analysis['oddsRange'].items():
        report += f"| {odds_range} | {data['bets']} | {data['wins']} | {data['losses']} | {data['winRate']:.2f}% | {data['profit']:.2f} | {data['roi']:.2f}% |\n"
    
    report += "\n"
    
    # Por Mês
    report += "## Análise por Mês\n\n"
    report += "| Mês | Apostas | Vitórias | Derrotas | Win Rate | Lucro | ROI |\n"
    report += "|-----|---------|----------|----------|----------|-------|-----|\n"
    
    for month, data in analysis['month'].items():
        report += f"| {month} | {data['bets']} | {data['wins']} | {data['losses']} | {data['winRate']:.2f}% | {data['profit']:.2f} | {data['roi']:.2f}% |\n"
    
    report += "\n"
    
    # Sequências
    report += "## Sequências\n\n"
    report += f"- **Maior Sequência de Vitórias:** {analysis['streaks']['longestWinStreak']}\n"
    report += f"- **Maior Sequência de Derrotas:** {analysis['streaks']['longestLossStreak']}\n"
    
    # Salvar
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"[OK] Análise detalhada salva: {output_path}")
    return output_path

if __name__ == '__main__':
    print("\n" + "="*60)
    print("ANÁLISE DETALHADA DO BACKTEST")
    print("="*60)
    
    # Carregar resultados
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backtest_dir = os.path.dirname(script_dir)
    results_path = os.path.join(backtest_dir, 'output', 'results.json')
    
    print(f"\nCarregando resultados: {results_path}")
    results = load_results(results_path)
    bets = results.get('bets', [])
    
    print(f"[OK] {len(bets)} apostas carregadas")
    
    # Executar análises
    print("\nExecutando análises...")
    
    print("  - Por superfície...")
    surface_analysis = analyze_by_surface(bets)
    
    print("  - Por torneio...")
    tournament_analysis = analyze_by_tournament(bets, top_n=10)
    
    print("  - Por faixa de odds...")
    odds_range_analysis = analyze_by_odds_range(bets)
    
    print("  - Por mês...")
    month_analysis = analyze_by_month(bets)
    
    print("  - Sequências...")
    streaks_analysis = analyze_streaks(bets)
    
    # Gerar relatório
    output_dir = os.path.join(backtest_dir, 'output')
    generate_report({
        'surface': surface_analysis,
        'tournament': tournament_analysis,
        'oddsRange': odds_range_analysis,
        'month': month_analysis,
        'streaks': streaks_analysis,
    }, output_dir)
    
    # Imprimir resumo
    print("\n" + "="*60)
    print("RESUMO DAS ANÁLISES")
    print("="*60)
    
    print("\nPor Superfície:")
    for surface, data in surface_analysis.items():
        print(f"  {surface}: {data['bets']} apostas, {data['winRate']:.2f}% win rate, {data['profit']:.2f} lucro")
    
    print("\nPor Faixa de Odds:")
    for odds_range, data in odds_range_analysis.items():
        print(f"  {odds_range}: {data['bets']} apostas, {data['winRate']:.2f}% win rate, {data['profit']:.2f} lucro")
    
    print("\n" + "="*60)
    print("ANÁLISE CONCLUÍDA")
    print("="*60)
