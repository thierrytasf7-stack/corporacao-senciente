# CEO de Planejamento - Squad

**Athena** - Chief Planning Officer da Diana Corporacao Senciente.

Transforma ideias em planos executaveis de excelencia suprema, orquestrando autonomamente toda a equipe de planejamento AIOS.

## O Problema que Resolve

Antes: voce tinha que manualmente ativar cada agente na ordem certa — `@analyst`, depois `@pm`, depois `@architect`, depois `@ux`, depois `@po`, depois `@sm`. Cada um com seus proprios comandos, formatos e contextos.

Agora: voce diz **O QUE** quer construir. Athena decide **COMO**, **QUEM** e **QUANDO**.

## Quick Start

```
# Ativar Athena
/Squads:CeoPlanning-AIOS

# Planejar algo (auto-detecta modo)
*plan Quero um sistema de notificacoes em tempo real

# Ou ser especifico
*plan-greenfield App de delivery para restaurantes locais
*plan-feature Adicionar dark mode no dashboard
*plan-rapid Mudar texto do botao de login
*design-sprint Explorar UX para onboarding de novos usuarios
```

## Modos de Execucao

| Modo | Quando | Tempo | Agentes |
|------|--------|-------|---------|
| **Blitz** | Mudancas pequenas | 30-60min | PM, Architect, SM |
| **Standard** | Features medias | 2-4h | Todos os 6 |
| **Comprehensive** | Projetos grandes | 4-8h | Todos + extras |
| **Design Sprint** | Exploracao | 2-3h | Analyst, UX, PM, SM |

## Equipe sob Comando

| Agente | Nome | Fase |
|--------|------|------|
| @analyst | Atlas | Discovery |
| @pm | Morgan | Strategy |
| @architect | Aria | Architecture |
| @ux-design-expert | Uma | Design |
| @po | Pax | Stories (validation) |
| @sm | River | Stories (creation) |

## Estrutura

```
squads/ceo-planejamento/
├── squad.yaml              # Manifest
├── README.md               # Este arquivo
├── agents/
│   └── ceo-planejamento.md # Definicao do CEO Athena
├── tasks/
│   ├── ceo-plan-greenfield.md
│   ├── ceo-plan-brownfield.md
│   ├── ceo-plan-rapid.md
│   ├── ceo-plan-design-sprint.md
│   ├── ceo-phase-discovery.md
│   ├── ceo-phase-strategy.md
│   ├── ceo-phase-architecture.md
│   ├── ceo-phase-design.md
│   ├── ceo-phase-stories.md
│   ├── ceo-phase-validation.md
│   ├── ceo-status-report.md
│   ├── ceo-delegate.md
│   └── ceo-quality-gate.md
├── workflows/
│   ├── full-planning-cycle.yaml
│   ├── rapid-planning-cycle.yaml
│   └── design-sprint-cycle.yaml
├── checklists/
│   ├── gate-discovery.md
│   ├── gate-strategy.md
│   ├── gate-architecture.md
│   ├── gate-design.md
│   ├── gate-stories.md
│   └── gate-final.md
└── templates/
    ├── masterplan-tmpl.md
    ├── phase-report-tmpl.md
    └── delegation-brief-tmpl.md
```

## Quality Dimensions (Arete Framework)

Cada plano e avaliado em 10 dimensoes com scores de 1-10:

Performance (9) | Scalability (9) | Security (10) | UX Excellence (10) | UI Polish (8) | Accessibility (8) | Maintainability (7) | Testability (7) | Time to Market (7) | Cost Efficiency (6)

Minimum: media ponderada >= 7.0

---

*Athena, CPO | Arete em cada plano*
