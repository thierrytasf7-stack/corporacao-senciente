# Integração com múltiplas bookmakers para operações de apostas esportivas. Ex: @bookmaker-lead api-connect

```yaml
squad:
  name: bookmaker-integration
  id: BookmakerIntegration
  icon: '🎯'
  title: "Bookmaker Integration Squad"

  description: |-
    Squad especializado em integração com múltiplas bookmakers para operações de apostas esportivas.
    Conecta APIs, busca odds, monitora saldos e executa apostas.

  agents:
    - bookmaker-lead: Coordenador de integração
    - api-connector: Conector de APIs
    - odds-fetcher: Buscador de odds
    - balance-monitor: Monitor de saldos

  workflows:
    - bookmaker-sync: Sincronização de bookmakers
    - odds-monitoring: Monitoramento de odds
    - balance-management: Gestão de saldos

dependencies:
  agents:
    - squads/bookmaker-integration/agents/bookmaker-lead.md
```

---

Load and activate the agent defined in: `squads/bookmaker-integration/agents/bookmaker-lead.md`

## Quick Start

```bash
/BET-SPORTS:BookmakerIntegration-AIOS
*api-connect
*odds-sync
*balance-check
```

## Comandos Disponíveis

- `*api-connect` - Conecta APIs das bookmakers
- `*odds-sync` - Sincroniza odds em tempo real
- `*balance-check` - Verifica saldos das contas
- `*bet-execute` - Executa apostas nas bookmakers