#!/usr/bin/env python3
"""
Backtest Engine: Tennis Favorite 30-0 Comeback
Executa backtest completo da estratégia
"""

import json
import sys
import os
from datetime import datetime
from typing import List, Dict, Any

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuração
CONFIG = {
    'strategy': {
        'trigger': 'exact_30-0',
        'minOdds': 1.70,
        'maxOdds': 2.10,
    },
    'management': {
        'stakeType': 'fixed',
        'stakeValue': 1.0,
        'bankroll': 1000,
    },
    'validation': {
        'targetROI': 0.05,
        'targetWinRate': 0.48,
        'targetProfitFactor': 1.10,
        'maxDrawdown': 0.25,
        'minBets': 50,
    }
}

def load_matches(filepath: str) -> List[Dict[str, Any]]:
    """Carrega partidas do JSON"""
    print(f"\nCarregando dados de: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        matches = json.load(f)
    
    print(f"[OK] {len(matches)} partidas carregadas")
    return matches

def detect_triggers(matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detecta triggers 30-0 onde favorito está sacando"""
    print("\nDetectando triggers (30-0 contra favorito no saque)...")
    
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
            
            # Verificar placar exato 30-0 contra favorito
            points = game.get('points', {})
            fav_points = points.get(favorite, 0)
            opp = 'player2' if favorite == 'player1' else 'player1'
            opp_points = points.get(opp, 0)
            
            # Exato 30-0 contra favorito
            if fav_points == 0 and opp_points == 30:
                triggers.append({
                    'match': match,
                    'game': game,
                    'favorite': favorite,
                    'server': server,
                })
    
    print(f"[OK] {len(triggers)} triggers detectados")
    return triggers

def execute_bets(triggers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Executa apostas simuladas"""
    print("\nExecutando apostas simuladas...")
    
    import random
    random.seed(42)
    
    bets = []
    bankroll = CONFIG['management']['bankroll']
    stake = CONFIG['management']['stakeValue']
    min_odd = CONFIG['strategy']['minOdds']
    max_odd = CONFIG['strategy']['maxOdds']
    
    for trigger in triggers:
        match = trigger['match']
        game = trigger['game']
        favorite = trigger['favorite']  # 'player1' ou 'player2'
        
        # Obter nome do favorito
        favorite_name = match['player1']['name'] if favorite == 'player1' else match['player2']['name']
        
        # Determinar resultado baseado no winner do game
        game_winner = game.get('winner', '')
        
        # Verificar se favorito venceu o game (comparar nomes)
        won = game_winner == favorite_name
        
        # Simular odd baseada no ranking
        p1_rank = match['player1'].get('ranking', 50)
        p2_rank = match['player2'].get('ranking', 50)
        
        # Calcular odd simulada (favorito tem odd menor)
        if favorite == 'player1':
            base_odd = 1.5 + (p2_rank / p1_rank) * 0.3 if p1_rank > 0 else 1.8
        else:
            base_odd = 1.5 + (p1_rank / p2_rank) * 0.3 if p2_rank > 0 else 1.8
        
        # Adicionar variação e clamp para faixa válida
        live_odd = base_odd + random.uniform(-0.1, 0.3)
        live_odd = round(min(max(live_odd, min_odd), max_odd), 2)
        
        # Calcular profit
        profit = stake * (live_odd - 1) if won else -stake
        bankroll += profit
        
        bet = {
            'matchId': match['matchId'],
            'date': match['date'],
            'tournament': match['tournament'],
            'surface': match['surface'],
            'favorite': favorite,
            'favoriteName': favorite_name,
            'opponent': match['player2']['name'] if favorite == 'player1' else match['player1']['name'],
            'odd': live_odd,
            'stake': stake,
            'result': 'WIN' if won else 'LOSS',
            'profit': round(profit, 2),
            'bankrollAfter': round(bankroll, 2),
        }
        
        bets.append(bet)
    
    print(f"[OK] {len(bets)} apostas executadas")
    return bets

def calculate_metrics(bets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calcula métricas do backtest"""
    print("\nCalculando métricas...")
    
    if not bets:
        return {'error': 'Nenhuma aposta executada'}
    
    total_bets = len(bets)
    wins = sum(1 for b in bets if b['result'] == 'WIN')
    losses = total_bets - wins
    win_rate = wins / total_bets if total_bets > 0 else 0
    
    total_profit = sum(b['profit'] for b in bets)
    total_staked = total_bets * CONFIG['management']['stakeValue']
    roi = total_profit / total_staked if total_staked > 0 else 0
    
    gross_profit = sum(b['profit'] for b in bets if b['profit'] > 0)
    gross_loss = abs(sum(b['profit'] for b in bets if b['profit'] < 0))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0
    
    # Calcular drawdown máximo
    bankroll = CONFIG['management']['bankroll']
    peak = bankroll
    max_drawdown = 0
    
    for bet in bets:
        bankroll += bet['profit']
        if bankroll > peak:
            peak = bankroll
        drawdown = (peak - bankroll) / peak if peak > 0 else 0
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    # Sequências
    longest_win_streak = 0
    longest_loss_streak = 0
    current_win = 0
    current_loss = 0
    
    for bet in bets:
        if bet['result'] == 'WIN':
            current_win += 1
            current_loss = 0
            longest_win_streak = max(longest_win_streak, current_win)
        else:
            current_loss += 1
            current_win = 0
            longest_loss_streak = max(longest_loss_streak, current_loss)
    
    final_bankroll = CONFIG['management']['bankroll'] + total_profit
    
    metrics = {
        'totalMatches': len(set(b['matchId'] for b in bets)),
        'totalBets': total_bets,
        'wins': wins,
        'losses': losses,
        'winRate': round(win_rate * 100, 2),
        'totalProfit': round(total_profit, 2),
        'roi': round(roi * 100, 2),
        'profitFactor': round(profit_factor, 2),
        'maxDrawdown': round(max_drawdown * 100, 2),
        'sharpeRatio': round(roi / (max_drawdown if max_drawdown > 0 else 1), 2),
        'finalBankroll': round(final_bankroll, 2),
        'longestWinStreak': longest_win_streak,
        'longestLossStreak': longest_loss_streak,
    }
    
    print_metrics(metrics)
    return metrics

def print_metrics(metrics: Dict[str, Any]):
    """Imprime métricas formatadas"""
    print("\n" + "="*60)
    print("METRICAS DO BACKTEST")
    print("="*60)
    print(f"Total de Apostas: {metrics.get('totalBets', 0)}")
    print(f"Vitorias: {metrics.get('wins', 0)}")
    print(f"Derrotas: {metrics.get('losses', 0)}")
    print(f"Win Rate: {metrics.get('winRate', 0):.2f}%")
    print("-"*60)
    print(f"Lucro Total: {metrics.get('totalProfit', 0):.2f} unidades")
    print(f"ROI: {metrics.get('roi', 0):.2f}%")
    print(f"Profit Factor: {metrics.get('profitFactor', 0):.2f}")
    print(f"Max Drawdown: {metrics.get('maxDrawdown', 0):.2f}%")
    print(f"Sharpe Ratio: {metrics.get('sharpeRatio', 0):.2f}")
    print(f"Bankroll Final: {metrics.get('finalBankroll', 0):.2f}")
    print("-"*60)
    print(f"Maior Sequência de Vitorias: {metrics.get('longestWinStreak', 0)}")
    print(f"Maior Sequência de Derrotas: {metrics.get('longestLossStreak', 0)}")
    print("="*60)

def generate_recommendation(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """Gera recomendação baseada nas métricas"""
    print("\nGerando recomendação...")
    
    targets = CONFIG['validation']
    score = 0
    notes = []
    
    # Pontuação por métrica
    roi_score = min(100, (metrics['roi'] / (targets['targetROI'] * 100)) * 100)
    winrate_score = min(100, (metrics['winRate'] / (targets['targetWinRate'] * 100)) * 100)
    pf_score = min(100, (metrics['profitFactor'] / targets['targetProfitFactor']) * 100)
    dd_score = max(0, 100 - (metrics['maxDrawdown'] / (targets['maxDrawdown'] * 100)) * 100)
    
    # Pesos
    score = (
        roi_score * 0.30 +
        winrate_score * 0.25 +
        pf_score * 0.20 +
        dd_score * 0.15 +
        (100 if metrics['totalBets'] >= targets['minBets'] else 0) * 0.10
    )
    
    score = min(100, score)
    
    # Determinar status
    if score >= 80 and metrics['roi'] > targets['targetROI'] * 100 and metrics['winRate'] > targets['targetWinRate'] * 100:
        status = 'APPROVED'
        confidence = 'HIGH'
        notes.append('Estrategia aprovada para producao')
        notes.append('Todos os criterios principais atendidos')
    elif score >= 60:
        status = 'CONDITIONAL'
        confidence = 'MEDIUM'
        notes.append('Alguns criterios atendidos')
        notes.append('Requer otimizacao adicional')
    else:
        status = 'REJECTED'
        confidence = 'LOW'
        notes.append('Criterios nao atendidos')
        notes.append('Revisar logica ou coletar mais dados')
    
    # Próximos passos
    if status == 'APPROVED':
        next_steps = [
            'Iniciar paper trading',
            'Configurar monitoramento em tempo real',
            'Definir limites de producao'
        ]
    elif status == 'CONDITIONAL':
        next_steps = [
            'Otimizar parametros (odds, stake)',
            'Expandir periodo de teste',
            'Analisar subgrupos por superficie/torneio'
        ]
    else:
        next_steps = [
            'Revisar logica da estrategia',
            'Coletar mais dados historicos',
            'Considerar ajustes no trigger'
        ]
    
    recommendation = {
        'status': status,
        'confidence': confidence,
        'score': round(score, 1),
        'notes': notes,
        'nextSteps': next_steps,
    }
    
    print(f"[OK] Recomendacao: {status} (Score: {score:.1f})")
    return recommendation

def generate_report(metrics: Dict[str, Any], recommendation: Dict[str, Any], output_dir: str):
    """Gera relatório Markdown"""
    print("\nGerando relatorio...")
    
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'report.md')
    
    targets = CONFIG['validation']
    
    report = f"""# Relatorio de Backtest: Tennis Favorite 30-0 Comeback

**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Status:** {recommendation['status']}  
**Confianca:** {recommendation['confidence']}  
**Score:** {recommendation['score']}/100

---

## Resumo Executivo

| Metrica | Valor | Target | Status |
|---------|-------|--------|--------|
| ROI | {metrics['roi']:.2f}% | > {targets['targetROI']*100:.0f}% | {'[OK]' if metrics['roi'] > targets['targetROI']*100 else '[FAIL]'} |
| Win Rate | {metrics['winRate']:.2f}% | > {targets['targetWinRate']*100:.0f}% | {'[OK]' if metrics['winRate'] > targets['targetWinRate']*100 else '[FAIL]'} |
| Profit Factor | {metrics['profitFactor']:.2f} | > {targets['targetProfitFactor']:.2f} | {'[OK]' if metrics['profitFactor'] > targets['targetProfitFactor'] else '[FAIL]'} |
| Max Drawdown | {metrics['maxDrawdown']:.2f}% | < {targets['maxDrawdown']*100:.0f}% | {'[OK]' if metrics['maxDrawdown'] < targets['maxDrawdown']*100 else '[FAIL]'} |
| Total Apostas | {metrics['totalBets']} | >= {targets['minBets']} | {'[OK]' if metrics['totalBets'] >= targets['minBets'] else '[FAIL]'} |

---

## Metricas Completas

### Estratégia (Logica)
- Total de Partidas: {metrics.get('totalMatches', 0)}
- Total de Apostas: {metrics['totalBets']}
- Triggers Detectados: {metrics['totalBets']} (100% conversao)

### Gestao (Performance)
- Vitorias: {metrics['wins']}
- Derrotas: {metrics['losses']}
- Win Rate: {metrics['winRate']:.2f}%
- Lucro Total: {metrics['totalProfit']:.2f} unidades
- ROI: {metrics['roi']:.2f}%
- Profit Factor: {metrics['profitFactor']:.2f}
- Max Drawdown: {metrics['maxDrawdown']:.2f}%
- Sharpe Ratio: {metrics['sharpeRatio']:.2f}
- Bankroll Inicial: {CONFIG['management']['bankroll']}
- Bankroll Final: {metrics['finalBankroll']:.2f}

### Sequencias
- Maior Sequencia de Vitorias: {metrics['longestWinStreak']}
- Maior Sequencia de Derrotas: {metrics['longestLossStreak']}

---

## Recomendacao Final

**Status:** {recommendation['status']}  
**Confianca:** {recommendation['confidence']}  
**Score:** {recommendation['score']}/100

### Notas
"""
    
    for note in recommendation['notes']:
        report += f"- {note}\n"
    
    report += "\n### Próximos Passos\n"
    for i, step in enumerate(recommendation['nextSteps'], 1):
        report += f"{i}. {step}\n"
    
    report += f"""
---

## Configuracao Utilizada

```yaml
Estrategia: Tennis Favorite 30-0 Comeback
Gatilho: Exato 30-0 contra favorito no saque
Odd Minima: {CONFIG['strategy']['minOdds']}
Odd Maxima: {CONFIG['strategy']['maxOdds']}
Stake: {CONFIG['management']['stakeValue']} unidades (fixa)
Bankroll: {CONFIG['management']['bankroll']}
```

---

**Gerado em:** {datetime.now().isoformat()}  
**Strategy-Sports Squad** - CEO-BET Domain
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"[OK] Relatorio gerado: {output_path}")
    return output_path

# Import random para simulação de odds
import random

if __name__ == '__main__':
    print("\n" + "="*60)
    print("BACKTEST: Tennis Favorite 30-0 Comeback")
    print("="*60)
    
    # Caminhos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backtest_dir = os.path.dirname(script_dir)
    data_path = os.path.join(backtest_dir, 'data', 'matches.json')
    output_dir = os.path.join(backtest_dir, 'output')
    
    # 1. Carregar dados
    matches = load_matches(data_path)
    
    # 2. Detectar triggers
    triggers = detect_triggers(matches)
    
    # 3. Executar apostas
    bets = execute_bets(triggers)
    
    if not bets:
        print("\n[ERRO] Nenhuma aposta executada. Verifique parâmetros.")
        sys.exit(1)
    
    # 4. Calcular métricas
    metrics = calculate_metrics(bets)
    
    # 5. Gerar recomendação
    recommendation = generate_recommendation(metrics)
    
    # 6. Gerar relatório
    report_path = generate_report(metrics, recommendation, output_dir)
    
    # Salvar resultados brutos
    results_path = os.path.join(output_dir, 'results.json')
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump({
            'metrics': metrics,
            'recommendation': recommendation,
            'config': CONFIG,
            'bets': bets,
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Resultados salvos: {results_path}")
    
    print("\n" + "="*60)
    print("BACKTEST CONCLUÍDO")
    print("="*60)
    print(f"Status: {recommendation['status']}")
    print(f"Score: {recommendation['score']}/100")
    print(f"Relatório: {report_path}")
    print("="*60 + "\n")
