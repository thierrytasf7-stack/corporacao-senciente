# Operações de apostas esportivas ao vivo com gestão de bankroll e análise de odds. Ex: @live-lead live briefing

```yaml
squad:
  name: live-betting
  id: LiveBetting
  icon: '&#127919;'
  title: "Live Betting Squad"

  description: |-
    Squad especializado em operações de apostas esportivas ao vivo.
    Coordena execução de apostas, análise de odds, gestão de bankroll e monitoramento.

  agents:
    - live-lead: Coordenador de operações
    - match-monitor: Monitor de partidas
    - instant-bettor: Executor de apostas
    - risk-calculator: Calculador de risco

  workflows:
    - live-betting-cycle: Ciclo de apostas ao vivo
    - pre-match-analysis: Análise pré-jogo
    - bankroll-management: Gestão de bankroll

dependencies:
  agents:
    - squads/live-betting/agents/live-lead.md
```

---

Load and activate the agent defined in: `squads/live-betting/agents/live-lead.md`

## Quick Start

```bash
/BET-SPORTS:LiveBetting-AIOS
*live-briefing
*strategy-decision
```