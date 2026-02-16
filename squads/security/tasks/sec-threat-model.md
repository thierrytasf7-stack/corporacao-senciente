---
task: Threat Modeling
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*threat-model"
Entrada: |
  - feature: Nome da feature ou sistema a modelar
  - docs: Documentacao relevante (PRD, story, architecture)
  - scope: Escopo do modelo (feature | service | system)
Saida: |
  - threat_model: Documento STRIDE completo
  - threats: Lista de ameacas identificadas
  - mitigations: Mitigacoes recomendadas
  - priority: Ordem de implementacao dos mitigacoes
Checklist:
  - "[ ] Entender a feature/sistema (ler docs)"
  - "[ ] Identificar assets (dados sensiveis, funcionalidades criticas)"
  - "[ ] Mapear trust boundaries"
  - "[ ] Aplicar STRIDE a cada componente"
  - "[ ] Classificar riscos (likelihood x impact)"
  - "[ ] Definir mitigacoes"
  - "[ ] Gerar documento usando template"
---

# *threat-model - Threat Modeling

Criar threat model usando STRIDE para feature ou sistema.

## STRIDE Framework

| Categoria | Pergunta | Exemplo |
|-----------|----------|---------|
| **S**poofing | Alguem pode se passar por outro? | Fake auth token, IP spoofing |
| **T**ampering | Alguem pode alterar dados? | Man-in-the-middle, DB manipulation |
| **R**epudiation | Alguem pode negar acoes? | Missing audit logs, unsigned actions |
| **I**nformation Disclosure | Dados podem vazar? | Error messages, API responses |
| **D**enial of Service | Servico pode ser derrubado? | DDoS, resource exhaustion |
| **E**levation of Privilege | Alguem pode escalar acesso? | Admin bypass, IDOR |

## Flow

```
1. Understand the target
   ├── Read feature docs (PRD, story, architecture)
   ├── Identify data flows (input → process → output)
   ├── Identify sensitive data (PII, credentials, financial)
   └── Identify external interfaces (APIs, users, 3rd party)

2. Map trust boundaries
   ├── User → Frontend (untrusted → semi-trusted)
   ├── Frontend → Backend API (semi-trusted → trusted)
   ├── Backend → Database (trusted → trusted)
   ├── Backend → External APIs (trusted → untrusted)
   └── CI/CD → Production (build → deploy)

3. Apply STRIDE to each boundary
   ├── For each boundary crossing, ask all 6 STRIDE questions
   ├── For each threat, assess:
   │   ├── Likelihood: HIGH | MEDIUM | LOW
   │   ├── Impact: CRITICAL | HIGH | MEDIUM | LOW
   │   └── Risk = Likelihood × Impact
   └── Document each threat with scenario

4. Define mitigations
   ├── For each threat, propose mitigation
   ├── Map to existing security controls
   ├── Identify gaps requiring new controls
   └── Prioritize by risk score

5. Generate document
   ├── Use sec-threat-model-tmpl.md template
   ├── Include data flow diagram (text-based)
   ├── Include threat table with STRIDE
   ├── Include mitigation plan with priority
   └── Include residual risk assessment
```

## Risk Matrix

| | Low Impact | Medium Impact | High Impact | Critical Impact |
|---|---|---|---|---|
| **High Likelihood** | Medium | High | Critical | Critical |
| **Medium Likelihood** | Low | Medium | High | Critical |
| **Low Likelihood** | Low | Low | Medium | High |
