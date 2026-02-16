---
task: Create Component Specifications
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do sistema de design (obrigatorio)
  - components: Array de componentes a serem especificados (obrigatorio)
  - tier?: Tier do sistema (opcional, default: 'core')
Saida: |
  - specs_path: Caminho onde as specs foram salvas
  - component_count: Numero de componentes processados
  - validation_results: Resultados da validacao das specs
  - next_steps: Instrucoes para proximos passos
Checklist:
  - "[ ] Validar nome do sistema de design"
  - "[ ] Validar array de componentes (nao vazio)"
  - "[ ] Identificar DS ativo e seus tokens"
  - "[ ] Para cada componente, definir Props API (TypeScript interface)"
  - "[ ] Para cada componente, definir Variants (visual variations)"
  - "[ ] Para cada componente, definir Sizes (se aplicavel)"
  - "[ ] Para cada componente, definir States (default, hover, active, focus, disabled, loading, error)"
  - "[ ] Para cada componente, mapear Tokens usados (quais CSS vars)"
  - "[ ] Para cada componente, definir Accessibility (ARIA, keyboard, screen reader)"
  - "[ ] Para cada componente, criar Usage Examples (code snippets)"
  - "[ ] Para cada componente, definir Do/Don't patterns"
  - "[ ] Validar specs contra quality gates"
  - "[ ] Adicionar specs ao component catalog"
  - "[ ] Gerar documentacao consolidada"
---

# Task: Create Component Specifications

## Metadata
- **id:** ds-create-components
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name, components[], tier?
- **outputs:** Component specs in system docs

## Description
Cria especificacoes detalhadas de componentes seguindo o Design System ativo. Cada spec inclui props API, variants, states, accessibility requirements, e exemplos de uso.

## Process

1. Identificar DS ativo e seus tokens
2. Para cada componente:
   a. Definir **Props API** (TypeScript interface)
   b. Definir **Variants** (visual variations)
   c. Definir **Sizes** (if applicable)
   d. Definir **States** (default, hover, active, focus, disabled, loading, error)
   e. Mapear **Tokens** usados (quais CSS vars)
   f. Definir **Accessibility** (ARIA, keyboard, screen reader)
   g. Criar **Usage Examples** (code snippets)
   h. Definir **Do/Don't** patterns
3. Validar contra quality gates
4. Adicionar ao component catalog

## Component Spec Template

```markdown
## ComponentName

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Visual variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Component size |
| disabled | boolean | false | Disabled state |

### Variants
- **primary** - High emphasis actions
- **secondary** - Medium emphasis
- **ghost** - Low emphasis

### States
- default → hover → active → focus → disabled → loading

### Tokens Used
- `--ds-button-bg`: Background color
- `--ds-button-text`: Text color
- `--ds-button-radius`: Border radius
- `--ds-button-height-{size}`: Height by size

### Accessibility
- role="button"
- aria-disabled when disabled
- aria-busy when loading
- Focus visible ring (--ds-focus-ring)
- Keyboard: Enter/Space to activate

### Usage
\`\`\`tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="ghost" disabled>Cancel</Button>
\`\`\`

### Do / Don't
- DO: Use primary for the main CTA per section
- DON'T: Use more than one primary button per view
```

## Quality Criteria
- [ ] TypeScript interface defined for props
- [ ] All visual states documented
- [ ] Only DS tokens used (no hardcoded values)
- [ ] Keyboard navigation specified
- [ ] ARIA attributes defined
- [ ] Usage examples included
