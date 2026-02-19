#!/usr/bin/env python3
"""
Backtest Real - Live Over Points para TODOS os times da NBA
Dados reais do PostgreSQL (nba_api)
"""
import urllib.request
import json
import sys
from datetime import datetime

# Suporte a UTF-8 no Windows
sys.stdout.reconfigure(encoding='utf-8')

URL = "http://localhost:21370/api/backtest/real"

payload = {
    "strategyId": "live-over-points",
    "config": {
        "targetTeam": "ALL",
        "dateRange": {
            "start": "2024-10-01",
            "end": "2025-06-30"
        },
        "initialBankroll": 1000,
        "stakingStrategy": "fibonacci",  # FIXED ou FIBONACCI
        "bettingParams": {
            "lookbackGames": 10,
            "thresholdPct": 0.85,
            "minOdds": 1.70
        }
    }
}

print("=" * 70)
print("[NBA] BACKTEST REAL - Live Over Points | Temporada 2024-25")
print("=" * 70)
print(f"Periodo: 2024-10-01 -> 2025-06-30")
print(f"Banca: R$ 1.000 | Threshold: 85% | Odd minima: 1.70")
print(f"Staking: FIBONACCI (2% base unit)")
print("=" * 70)
print("\nRodando backtest com dados reais da NBA...\n")

try:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req, timeout=300) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    if not result.get('success'):
        print(f"❌ ERRO: {result.get('error', {})}")
        exit(1)
    
    data = result.get('data', {})
    metrics = data.get('metrics', {})
    teamStats = data.get('teamStats', {})
    bets = data.get('bets', [])
    
    # Ranking por ROI
    print("\n" + "=" * 70)
    print("RANKING POR ROI (dados REAIS da NBA)")
    print("=" * 70)
    print(f"{'#':<3} {'Time':<30} {'Opp':<5} {'W':<4} {'L':<4} {'Win%':<7} {'ROI':<8} {'Lucro':<10}")
    print("-" * 70)
    
    sorted_teams = sorted(teamStats.items(), key=lambda x: x[1]['profit'], reverse=True)
    
    for i, (team, stats) in enumerate(sorted_teams, 1):
        opps = stats['betCount']
        if opps == 0:
            continue
        w = stats['wins']
        l = stats['losses']
        winrate = w / opps * 100 if opps > 0 else 0
        roi = stats['profit'] / 1000 * 100  # baseado na banca inicial
        profit = stats['profit']
        marker = " *" if opps >= 5 and winrate >= 70 else ""
        print(f"{i:<3} {team:<30} {opps:<5} {w:<4} {l:<4} {winrate:<6.1f}% {roi:<+8.1f}% {profit:<+10.2f}{marker}")
    
    print("-" * 70)
    
    # Consolidado geral
    total_opps = metrics.get('betCount', 0)
    total_wins = metrics.get('wins', 0)
    total_losses = metrics.get('losses', 0)
    total_profit = metrics.get('totalProfit', 0)
    winrate = metrics.get('winRate', 0) * 100
    roi = metrics.get('roi', 0) * 100
    final_bankroll = metrics.get('finalBankroll', 0)
    avg_odds = metrics.get('avgOdds', 0)
    avg_stake = metrics.get('avgStake', 0)
    max_dd = metrics.get('maxDrawdown', 0)
    sharpe = metrics.get('sharpeRatio', 0)
    staking = metrics.get('stakingStrategy', 'fixed')
    
    print("\n" + "=" * 70)
    print("CONSOLIDADO GERAL (DADOS REAIS)")
    print("=" * 70)
    print(f"Times analisados:        {metrics.get('teamsAnalyzed', 0)}")
    print(f"Total oportunidades:     {total_opps}")
    print(f"Vencedoras:              {total_wins} ({winrate:.1f}% win rate)")
    print(f"Perdedoras:              {total_losses}")
    print(f"Odd media:               {avg_odds:.2f}")
    print(f"Aposta media:            R$ {avg_stake:.2f}")
    print(f"Lucro total:             R$ {total_profit:+.2f}")
    print(f"Banca final:             R$ {final_bankroll:.2f}")
    print(f"ROI:                     {roi:+.1f}%")
    print(f"Max Drawdown:            R$ {max_dd:.2f}")
    print(f"Sharpe Ratio:            {sharpe:.2f}")
    print(f"Staking Strategy:        {staking.upper()}")
    print("=" * 70)
    
    # Veredito
    print("\n" + "=" * 70)
    print("VEREDITO")
    print("=" * 70)
    
    if total_profit > 0:
        print("[OK] LUCRATIVO - Estrategia validada com dados reais!")
    else:
        print("[ALERTA] PREJUDICIAL - Estrategia nao se sustentou com dados reais")
    
    # Top picks
    top_teams = [t for t, s in sorted_teams if s['betCount'] >= 5 and s['wins'] / s['betCount'] >= 0.70][:3]
    if top_teams:
        print("\nTOP PICKS para Live Over Points:")
        for team in top_teams:
            stats = teamStats[team]
            wr = stats['wins'] / stats['betCount'] * 100
            print(f"   * {team}: {stats['wins']}/{stats['betCount']} ({wr:.0f}% win rate, R$ {stats['profit']:+.2f})")
    
    print("=" * 70)
    
    # Salvar resultado completo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backtest_real_nba_{timestamp}.json"
    
    # Salvar na pasta de backtests
    import os
    backtest_dir = os.path.join(os.path.dirname(__file__), '..', 'backtests')
    os.makedirs(backtest_dir, exist_ok=True)
    filepath = os.path.join(backtest_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Resultado completo salvo em: {filepath}")
    print("=" * 70)
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
