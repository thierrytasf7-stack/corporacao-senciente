# Frontend Audit Squad

Squad especialista em auditoria completa de frontends via Playwright.

## Agente

| Nome | Persona | Foco |
|------|---------|------|
| **@frontend-auditor** | Lupe (Inspector) | Debug visual, UX/UI, A11y, Performance, Responsividade |

## Comandos

```
*audit-full {url}       # Auditoria completa de todas as abas
*audit-page {url}       # Auditar pagina especifica
*audit-ux {url}         # Review UX (Nielsen heuristics)
*audit-a11y {url}       # Acessibilidade WCAG 2.1 AA
*audit-perf {url}       # Performance e Core Web Vitals
*audit-responsive {url} # Responsividade multi-device
*audit-errors {url}     # Console errors e network
*report                 # Gerar relatorio final
```

## Dimensoes de Auditoria

| Dimensao | O que verifica |
|----------|----------------|
| Visual | Layout, overflow, imagens, cores, fontes |
| Funcional | Links, botoes, formularios, estados, console errors |
| UX | 10 heuristicas de Nielsen (score 1-10) |
| Acessibilidade | WCAG 2.1 AA (teclado, contraste, ARIA, semantica) |
| Performance | Core Web Vitals (LCP, FID, CLS), bundle size |
| Responsividade | 5 viewports (320px a 1920px) |

## Severidades

- **CRITICAL**: App crasha, tela branca, funcionalidade bloqueada
- **HIGH**: Feature importante nao funciona, layout severamente quebrado
- **MEDIUM**: Issues em viewport especifico, falta feedback visual
- **LOW**: Melhorias cosmeticas, hover states, micro-interacoes

## Uso

```
/FrontendAudit:agents:frontend-auditor
*audit-full http://localhost:21300
```

## Estrutura

```
squads/frontend-audit/
├── squad.yaml                    # Manifest
├── README.md                     # Este arquivo
├── agents/
│   └── frontend-auditor.md       # Lupe - Frontend Inspector
├── tasks/
│   ├── audit-full-frontend.md    # Auditoria completa
│   ├── audit-single-page.md      # Pagina especifica
│   ├── audit-ux-heuristics.md    # UX Nielsen
│   ├── audit-accessibility.md    # WCAG 2.1 AA
│   ├── audit-performance.md      # Core Web Vitals
│   ├── audit-responsive.md       # Multi-viewport
│   ├── audit-console-errors.md   # Console & network
│   └── generate-audit-report.md  # Relatorio final
├── workflows/
│   └── full-audit-workflow.yaml  # Workflow completo 7 fases
├── checklists/
│   ├── ux-heuristics-checklist.md
│   ├── accessibility-checklist.md
│   ├── performance-checklist.md
│   └── responsive-checklist.md
└── templates/
    └── audit-report-tmpl.md      # Template do relatorio
```
