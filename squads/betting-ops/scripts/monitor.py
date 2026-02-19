#!/usr/bin/env python3
"""
Monitor de Paper Trading
Gera alertas e relatórios automáticos

Uso:
  python monitor.py                    # Rodar contínuo
  python monitor.py --report           # Gerar relatório diário
  python monitor.py --alert            # Verificar alertas
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ─── CONFIG ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(SCRIPT_DIR, 'data', 'paper-trading-state.json')
ALERTS_FILE = os.path.join(SCRIPT_DIR, 'data', 'alerts-log.md')
REPORTS_DIR = os.path.join(SCRIPT_DIR, 'data', 'reports')

# ─── FUNÇÕES ──────────────────────────────────────────────────────────────────

def load_state() -> Dict[str, Any]:
    """Carrega estado atual"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def check_alerts(state: Dict[str, Any]) -> list:
    """Verifica alertas ativos"""
    alerts = []
    m = state['metrics']
    
    # Win Rate baixo
    if m['winRate'] < 70 and m['totalBets'] >= 50:
        alerts.append({
            'level': '⚠️',
            'type': 'WIN_RATE_LOW',
            'message': f"Win Rate {m['winRate']:.2f}% abaixo de 70% (50 apostas)",
            'action': 'Revisar estratégia'
        })
    
    # Drawdown alto
    if m['maxDrawdown'] > 5:
        alerts.append({
            'level': '⚠️',
            'type': 'DRAWDOWN_HIGH',
            'message': f"Drawdown {m['maxDrawdown']:.2f}% acima de 5%",
            'action': 'Reduzir stake'
        })
    
    # Stop loss diário
    today_profit = sum(
        b['profit'] for b in state['bets']
        if b['executedAt'].startswith(datetime.now().strftime('%Y-%m-%d'))
    )
    if today_profit < -10:
        alerts.append({
            'level': '🔴',
            'type': 'STOP_LOSS_DAILY',
            'message': f"Stop loss diário atingido ({today_profit:+.2f})",
            'action': 'Parar apostas hoje'
        })
    
    # Sequência de derrotas
    if m['currentStreak'] < -3:
        alerts.append({
            'level': '⚠️',
            'type': 'LOSS_STREAK',
            'message': f"Sequência de {abs(m['currentStreak'])} derrotas",
            'action': 'Avaliar pausa'
        })
    
    # Win Rate excelente
    if m['winRate'] > 80 and m['totalBets'] >= 100:
        alerts.append({
            'level': '✅',
            'type': 'WIN_RATE_EXCELLENT',
            'message': f"Win Rate {m['winRate']:.2f}% excelente (100+ apostas)",
            'action': 'Continuar monitoramento'
        })
    
    # ROI excelente
    if m['roi'] > 50 and m['totalBets'] >= 100:
        alerts.append({
            'level': '✅',
            'type': 'ROI_EXCELLENT',
            'message': f"ROI {m['roi']:.2f}% excelente (100+ apostas)",
            'action': 'Considerar aumento gradual de stake'
        })
    
    return alerts

def log_alerts(alerts: list):
    """Registra alertas em arquivo"""
    os.makedirs(os.path.dirname(ALERTS_FILE), exist_ok=True)
    
    with open(ALERTS_FILE, 'a', encoding='utf-8') as f:
        f.write(f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        
        if alerts:
            for alert in alerts:
                f.write(f"- {alert['level']} **{alert['type']}**: {alert['message']}\n")
                f.write(f"  - Ação: {alert['action']}\n")
        else:
            f.write("- ✅ Sem alertas ativos\n")
        
        f.write("\n")

def generate_daily_report(state: Dict[str, Any]):
    """Gera relatório diário"""
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    today = datetime.now().strftime('%Y-%m-%d')
    report_file = os.path.join(REPORTS_DIR, f'daily-{today}.md')
    
    # Filtrar apostas de hoje
    today_bets = [
        b for b in state['bets']
        if b['executedAt'].startswith(today)
    ]
    
    # Calcular métricas do dia
    today_wins = sum(1 for b in today_bets if b['result'] == 'WIN')
    today_losses = len(today_bets) - today_wins
    today_win_rate = today_wins / len(today_bets) * 100 if today_bets else 0
    today_profit = sum(b['profit'] for b in today_bets)
    
    # Gerar relatório
    report = f"""# Relatório Diário: Paper Trading

**Data:** {today}  
**Estratégia:** {state['strategy']}  
**Status:** {state['status']}

---

## Resumo do Dia

| Métrica | Valor |
|---------|-------|
| Total de Apostas | {len(today_bets)} |
| Vitórias | {today_wins} |
| Derrotas | {today_losses} |
| Win Rate | {today_win_rate:.2f}% |
| Lucro | {today_profit:+.2f} unidades |

---

## Apostas do Dia

| Hora | Torneio | Jogadores | Odd | Stake | Resultado | Lucro | Bankroll |
|------|---------|-----------|-----|-------|-----------|-------|----------|
"""
    
    for bet in today_bets:
        timestamp = bet['executedAt'].replace('T', ' ').split('.')[0]
        result_emoji = '✅' if bet['result'] == 'WIN' else '❌'
        report += (
            f"| {timestamp} | {bet['tournament']} | {bet['player1']} vs {bet['player2']} | "
            f"{bet['odd']:.2f} | {bet['stake']:.1f} | {result_emoji} {bet['result']} | "
            f"{bet['profit']:+.2f} | {bet['bankrollAfter']:.2f} |\n"
        )
    
    report += f"""
---

## Métricas Acumuladas

| Métrica | Valor |
|---------|-------|
| Total Apostas (geral) | {state['metrics']['totalBets']} |
| Win Rate (geral) | {state['metrics']['winRate']:.2f}% |
| ROI (geral) | {state['metrics']['roi']:.2f}% |
| Lucro Total | {state['metrics']['totalProfit']:+.2f} |
| Bankroll Atual | {state['bankroll']['current']:.2f} |
| Max Drawdown | {state['metrics']['maxDrawdown']:.2f}% |

---

## Observações

[Adicionar observações sobre o dia, decisões tomadas, aprendizados]

---

**Gerado em:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"[OK] Relatório diário gerado: {report_file}")
    return report_file

def print_status(state: Dict[str, Any], alerts: list):
    """Imprime status com alertas"""
    print("\n" + "="*60)
    print("MONITOR: Paper Trading")
    print("="*60)
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Status: {state['status']}")
    print("-"*60)
    
    m = state['metrics']
    print(f"Bankroll: {state['bankroll']['current']:.2f}")
    print(f"Total Apostas: {m['totalBets']}")
    print(f"Win Rate: {m['winRate']:.2f}%")
    print(f"ROI: {m['roi']:.2f}%")
    print(f"Lucro Total: {m['totalProfit']:+.2f}")
    print("-"*60)
    
    # Alertas
    print("\nALERTAS:")
    if alerts:
        for alert in alerts:
            print(f"  {alert['level']} {alert['message']}")
            print(f"     → {alert['action']}")
    else:
        print("  ✅ Sem alertas ativos")
    
    print("="*60)

# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Monitor de Paper Trading')
    parser.add_argument('--report', action='store_true', help='Gerar relatório diário')
    parser.add_argument('--alert', action='store_true', help='Verificar alertas')
    
    args = parser.parse_args()
    
    # Carregar estado
    state = load_state()
    
    if not state:
        print("[ERRO] Nenhum estado encontrado. Execute o bot primeiro.")
        sys.exit(1)
    
    # Verificar alertas
    alerts = check_alerts(state)
    
    if args.alert:
        print_status(state, alerts)
        log_alerts(alerts)
        print(f"\n[OK] {len(alerts)} alertas verificados")
    
    if args.report:
        generate_daily_report(state)
        print("[OK] Relatório diário gerado")
    
    if not args.alert and not args.report:
        # Modo padrão: mostra status e alertas
        print_status(state, alerts)
        log_alerts(alerts)
