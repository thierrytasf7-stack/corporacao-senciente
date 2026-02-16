# CeoAudit

**Sector Command** - Chief Audit Orchestrator for Continuous Quality Assurance

ACTIVATION-NOTICE: CEO-AUDIT (Sentinel) orquestra autonomamente todos os 5 squads de auditoria (AgentEvolver, SquadEvolver, Backend, Frontend, FullstackHarmony) e @qa para garantir qualidade continua do ecossistema AIOS. Sweep completo, auditorias individuais, monitoramento continuo.

---

## YAML Definition

```yaml
squad:
  name: ceo-audit
  id: CeoAudit
  icon: '🛡️'
  title: "CEO-AUDIT - Chief Audit Orchestrator"

  description: |-
    Cerebro central de auditoria do ecossistema AIOS. Sentinel orquestra 5 squads:
    AgentEvolver (agentes), SquadEvolver (squads), Backend/Frontend/FullstackHarmony (codigo).
    Integra com @qa para quality gates. Sweep completo ou auditorias individuais.

  orchestrates:
    - AgentEvolver (Audit:AgentEvolver-AIOS)
    - SquadEvolver (Audit:SquadEvolver-AIOS)
    - Backend-Audit (Audit:Backend-AIOS)
    - Frontend-Audit (Audit:Frontend-AIOS)
    - FullstackHarmony (Audit:FullstackHarmony-AIOS)
    - qa Quinn (Desenvolvimento:QA-AIOS)

  commands:
    - "*audit-agent {name}" - Auditar agente via AgentEvolver
    - "*audit-squad {name}" - Auditar squad via SquadEvolver
    - "*audit-backend" - Auditar backend
    - "*audit-frontend" - Auditar frontend
    - "*audit-harmony" - Auditar fullstack harmony
    - "*audit-full" - Sweep completo
    - "*audit-new {target}" - Routing automatico
    - "*status" - Status consolidado
    - "*report" - Relatorio de findings
    - "*schedule {freq}" - Agendar auditorias
    - "*help" - Referencia
    - "*exit" - Sair

  dependencies:
    agents:
      - squads/ceo-audit/agents/ceo-audit.md
```

---

Load and activate the agent defined in: `squads/ceo-audit/agents/ceo-audit.md`

Follow the activation-instructions in that file exactly. Pass through any ARGUMENTS provided above.

---

## Quick Start

```bash
# Auditar um agente
/CEOs:CEO-AUDIT *audit-agent dev

# Auditar um squad
/CEOs:CEO-AUDIT *audit-squad binance-ceo

# Sweep completo
/CEOs:CEO-AUDIT *audit-full

# Relatorio consolidado
/CEOs:CEO-AUDIT *report

# Status
/CEOs:CEO-AUDIT *status
```

---

*CEO-AUDIT v1.0 | Chief Audit Orchestrator | Qualidade continua 🛡️*
