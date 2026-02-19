#!/usr/bin/env python3
"""
Dashboard de Paper Trading
Gera visão geral em tempo real

Uso:
  python dashboard.py              # Dashboard simples
  python dashboard.py --json       # Output JSON
"""

import os
import sys
import json
from datetime import datetime, timedelta

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ─── CONFIG ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(SCRIPT_DIR, 'data', 'paper-trading-state.json')

# ─── FUNÇÕES ──────────────────────────────────────────────────────────────────

def load_state():
    """Carrega estado atual"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def print_dashboard(state: dict):
    """Imprime dashboard formatado"""
    m = state['metrics']
    b = state['bankroll']
    
    # Calcular apostas de hoje
    today = datetime.now().strftime('%Y-%m-%d')
    today_bets = [bet for bet in state['bets'] if bet['executedAt'].startswith(today)]
    today_profit = sum(bet['profit'] for bet in today_bets)
    
    # Calcular apostas da semana
    week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    week_bets = [bet for bet in state['bets'] if bet['executedAt'] >= week_ago]
    week_profit = sum(bet['profit'] for bet in week_bets)
    
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print("\n" + "═"*70)
    print("  DASHBOARD: Paper Trading - Tennis Favorite 30-0 Comeback")
    print("═"*70)
    print(f"  Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Status: {state['status'].upper()}")
    print("═"*70)
    
    print("\n  💰 BANKROLL")
    print("  " + "─"*68)
    print(f"  Inicial:      R$ {b['initial']:>10.2f}  |  Atual:    R$ {b['current']:>10.2f}")
    print(f"  Lucro Total:  R$ {m['totalProfit']:>+10.2f}  |  ROI:      {m['roi']:>+9.2f}%")
    
    print("\n  📊 MÉTRICAS GERAIS")
    print("  " + "─"*68)
    print(f"  Total Apostas:  {m['totalBets']:>6}  |  Win Rate:   {m['winRate']:>6.2f}%")
    print(f"  Vitórias:       {m['wins']:>6}  |  Derrotas:   {m['losses']:>6}")
    print(f"  Max Drawdown:   {m['maxDrawdown']:>6.2f}%  |  Sharpe:     {m.get('sharpe', 0):>6.2f}")
    
    print("\n  📈 SEQUÊNCIAS")
    print("  " + "─"*68)
    streak_icon = "🔥" if m['currentStreak'] > 0 else "❄️"
    print(f"  Sequência Atual:   {streak_icon} {m['currentStreak']:>+4}")
    print(f"  Maior Win Streak:  🔥 +{m['longestWinStreak']}")
    print(f"  Maior Loss Streak: ❄️ {m['longestLossStreak']:+d}")
    
    print("\n  📅 HOJE")
    print("  " + "─"*68)
    print(f"  Apostas:  {len(today_bets):>3}  |  Lucro:  R$ {today_profit:>+8.2f}")
    
    print("\n  📊 ESTA SEMANA")
    print("  " + "─"*68)
    print(f"  Apostas:  {len(week_bets):>3}  |  Lucro:  R$ {week_profit:>+8.2f}")
    
    print("\n  🎯 METAS (4 SEMANAS)")
    print("  " + "─"*68)
    win_rate_status = "✅" if m['winRate'] > 75 else "⏳"
    roi_status = "✅" if m['roi'] > 50 else "⏳"
    print(f"  Win Rate:  {m['winRate']:>6.2f}%  {win_rate_status}  (Target: > 75%)")
    print(f"  ROI:       {m['roi']:>6.2f}%  {roi_status}  (Target: > 50%)")
    
    # Barra de progresso
    total_weeks = 4
    weeks_complete = min(int(m['totalBets'] / 100), total_weeks)
    progress = "█" * weeks_complete + "░" * (total_weeks - weeks_complete)
    print(f"\n  Progresso: [{progress}] {weeks_complete}/{total_weeks} semanas")
    
    print("\n  🚨 ÚLTIMOS ALERTAS")
    print("  " + "─"*68)
    alerts_file = os.path.join(SCRIPT_DIR, 'data', 'alerts-log.md')
    if os.path.exists(alerts_file):
        with open(alerts_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()[-6:]  # Últimos 6 alertas
            for line in lines:
                if line.strip() and not line.startswith('#'):
                    print(f"  {line.strip()}")
    else:
        print("  Nenhum alerta registrado")
    
    print("\n  ⚡ COMANDOS RÁPIDOS")
    print("  " + "─"*68)
    print("  python paper-trading-bot.py --continuous  - Iniciar bot")
    print("  python monitor.py --alert               - Ver alertas")
    print("  python monitor.py --report              - Gerar relatório")
    print("  start.bat                               - Menu interativo")
    
    print("\n" + "═"*70)
    print("  Atualização automática a cada 60s (Ctrl+C para sair)")
    print("═"*70 + "\n")

def print_json(state: dict):
    """Output em JSON"""
    print(json.dumps(state, indent=2))

# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Dashboard de Paper Trading')
    parser.add_argument('--json', action='store_true', help='Output JSON')
    parser.add_argument('--watch', action='store_true', help='Atualizar continuamente')
    parser.add_argument('--interval', type=int, default=60, help='Intervalo em segundos')
    
    args = parser.parse_args()
    
    state = load_state()
    
    if not state:
        print("[ERRO] Nenhum estado encontrado. Execute o bot primeiro.")
        sys.exit(1)
    
    if args.json:
        print_json(state)
    elif args.watch:
        import time
        try:
            while True:
                print_dashboard(state)
                time.sleep(args.interval)
                state = load_state()  # Recarregar estado
        except KeyboardInterrupt:
            print("\nDashboard encerrado.")
    else:
        print_dashboard(state)
