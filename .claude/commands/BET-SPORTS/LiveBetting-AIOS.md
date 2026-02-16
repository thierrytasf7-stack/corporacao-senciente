# Operações de apostas esportivas ao vivo com gestão de risco instantânea. Ex: @live-lead daily briefing

```yaml
squad:
  name: live-betting
  id: LiveBetting
  icon: '🚀'
  title: "Live Betting Operations Squad"

  description: |-
    Squad especializado em operações de apostas esportivas ao vivo.
    Coordena execução instantânea de apostas, análise de odds em tempo real,
    gestão de bankroll e monitoramento de eventos ao vivo.

  agents:
    - live-lead: Coordenador de operações ao vivo
    - match-monitor: Monitor de eventos ao vivo
    - instant-bettor: Executor de apostas instantâneas
    - risk-calculator: Calculador de risco em tempo real

  workflows:
    - live-betting-cycle: Ciclo de apostas ao vivo
    - risk-management: Gestão de risco instantânea
    - market-analysis: Análise de mercados ao vivo

dependencies:
  agents:
    - squads/live-betting/agents/live-lead.md
```

---

Load and activate the agent defined in: `squads/live-betting/agents/live-lead.md`

## Quick Start

```bash
/BET-SPORTS:LiveBetting-AIOS
*daily-briefing
*strategy-decision
*portfolio-review
```