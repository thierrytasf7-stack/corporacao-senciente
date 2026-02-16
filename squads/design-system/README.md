# Design System Squad

**Agent:** Pixel (DS Architect)
**Team:** Design
**Icon:** 🎨

Squad especializada em criar, documentar, manter e evoluir Design Systems completos.

## Ativacao

```
/Design:DesignSystem-AIOS
```

## Comandos

### Criacao
| Comando | Descricao | Complexidade |
|---------|-----------|-------------|
| `*create-system` | DS completo do zero | F5 |
| `*create-tokens` | Criar/expandir tokens | F3 |
| `*create-components` | Specs de componentes | F3 |
| `*create-theme` | Tema (dark, brand, etc) | F3 |
| `*create-icons` | Icon system | F2 |

### Documentacao
| Comando | Descricao | Complexidade |
|---------|-----------|-------------|
| `*document` | Docs completa do DS | F3 |
| `*usage-guide` | Guia para devs | F2 |
| `*storybook` | Storybook stories | F3 |

### Audit
| Comando | Descricao | Complexidade |
|---------|-----------|-------------|
| `*audit` | Audit de consistencia | F3 |
| `*audit-a11y` | Audit WCAG | F3 |
| `*diff` | Comparar 2 sistemas | F2 |
| `*migrate` | Migrar versao | F4 |

### Cliente
| Comando | Descricao | Complexidade |
|---------|-----------|-------------|
| `*client-system` | DS para cliente | F4 |
| `*adapt-brand` | Adaptar marca | F3 |

### Gestao
| Comando | Descricao |
|---------|-----------|
| `*catalog` | Listar todos os DS |
| `*status` | Status do DS ativo |
| `*help` | Referencia |
| `*exit` | Sair |

## Estrutura

```
squads/design-system/
├── agents/          # Pixel (DS Architect)
├── tasks/           # 14 tasks especializadas
├── templates/       # 5 templates (token, component, theme, audit, client)
├── checklists/      # 4 quality gates
├── workflows/       # 3 workflows (full creation, audit, client onboarding)
├── config/          # Defaults e configuracoes
├── library/         # Biblioteca de Design Systems criados
│   ├── systems/     # DS por projeto/cliente
│   ├── catalog.json # Index central
│   └── changelog.md # Historico
├── squad.yaml       # Definicao do squad
└── README.md        # Este arquivo
```

## Library Organization

Todos os Design Systems criados ficam organizados em `library/systems/`:

```
library/systems/
├── diana-core/      # DS principal do projeto Diana
├── client-{name}/   # DS por cliente
└── _base/           # Template base reutilizavel
```

## Quality Gates

1. **Token Gate** - Completude e naming dos tokens
2. **Component Gate** - Props, states, a11y dos componentes
3. **Accessibility Gate** - WCAG AA compliance
4. **Documentation Gate** - Docs e changelog atualizados
