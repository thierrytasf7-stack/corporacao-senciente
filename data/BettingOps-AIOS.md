# Operações de apostas esportivas ao vivo com gestão de bankroll e análise de odds. Ex: @betting-ceo daily briefing

```yaml
squad:
  name: betting-ops
  id: BettingOps
  icon: '🎯'
  title: "Betting Operations Squad"

  description: |-
    Squad especializado em operações de apostas esportivas ao vivo.
    Coordena execução de apostas, análise de odds, gestão de bankroll e monitoramento.

  agents:
    - betting-ceo: Coordenador de operações
    - bettor: Executor de apostas
    - odds-analyst: Analista de odds/valor
    - bankroll-manager: Gestor de capital

  workflows:
    - live-betting-cycle: Ciclo de apostas ao vivo
    - pre-match-analysis: Análise pré-jogo
    - bankroll-management: Gestão de bankroll

dependencies:
  agents:
    - squads/betting-ops/agents/betting-ceo.md
```

---

Load and activate the agent defined in: `squads/betting-ops/agents/betting-ceo.md`

## Quick Start

```bash
/BET-SPORTS:BettingOps-AIOS
*daily-briefing
*portfolio-review
```

## Comandos Disponíveis

- `*daily-briefing` - Relatório diário de operações
- `*portfolio-review` - Revisão de posições abertas
- `*strategy-decision` - Decisões estratégicas de betting