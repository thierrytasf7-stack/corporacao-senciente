#!/usr/bin/env python3
"""
Mostra amostra detalhada das apostas com Fibonacci
"""
import json
import os

backtest_file = os.path.join(os.path.dirname(__file__), '..', 'backtests', 'backtest_real_nba_20260217_191029.json')
with open(backtest_file, 'r', encoding='utf-8') as f:
    backtest = json.load(f)

bets = backtest.get('data', {}).get('bets', [])

# Analise de stakes
stakes = {}
for b in bets:
    stake = round(b['stake'])
    stakes[stake] = stakes.get(stake, 0) + 1

print('=' * 80)
print('DISTRIBUICAO DE STAKES - FIBONACCI')
print('=' * 80)
print(f"{'Stake':>10} | {'Ocorrencias':>12} | {'%':>8} | {'Valor Total':>12}")
print('-' * 80)

total_bets = len(bets)
for stake in sorted(stakes.keys()):
    count = stakes[stake]
    pct = count / total_bets * 100
    total_value = stake * count
    print(f"R$ {stake:>8.0f} | {count:>12} | {pct:>7.1f}% | R$ {total_value:>10.0f}")

print('-' * 80)
print(f"{'TOTAL':>10} | {total_bets:>12} | {'100%':>8} | R$ {sum(b['stake'] for b in bets):>10.0f}")
print('=' * 80)

# Amostras de sequencias
print('\nAMOSTRA DE 20 APOSTAS (todas as colunas):')
print('=' * 80)
print(f"{'#':<3} | {'Time':<25} | {'Data':<12} | {'Stake':>8} | {'Odd':>5} | {'Result':<6} | {'Profit':>10} | {'Banca':>12}")
print('-' * 80)

for i, b in enumerate(bets[:20], 1):
    print(f"{i:<3} | {b['team']:<25} | {b['date'].split('T')[0]:<12} | R$ {b['stake']:>6.2f} | {b['odds']:>5.2f} | {b['result']:<6} | R$ {b['profit']:>+8.2f} | R$ {b['bankrollAfter']:>10.2f}")

print('-' * 80)
print('=' * 80)
