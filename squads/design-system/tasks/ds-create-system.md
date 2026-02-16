---
task: Create Design System
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - brand_name: Nome do sistema / marca
  - target_platforms: Plataformas alvo (web, mobile, desktop)
  - color_palette?: Paleta de cores existente
  - typography?: Sistema tipográfico existente
  - existing_assets?: Assets de marca existentes
Saida: |
  - system_path: Caminho completo do sistema criado em library/systems/{name}/
  - token_files: Arquivos de tokens gerados (primitive, semantic, component)
  - component_specs: Especificações de componentes (Tier 1-4)
  - theme_files: Arquivos de temas (light, dark, high-contrast)
  - documentation: Documentação completa do sistema
  - next_steps: Instruções para uso e manutenção
Checklist:
  - "[ ] Validar nome do sistema (kebab-case, não existe)"
  - "[ ] Elicitar contexto e requirements via entrevista"
  - "[ ] Definir arquitetura de tokens (primitive → semantic → component)"
  - "[ ] Gerar paleta de cores completa (50-950 scale)"
  - "[ ] Definir sistema tipográfico (font families, sizes, weights)"
  - "[ ] Criar scale de spacing (4px/8px base, 12+ steps)"
  - "[ ] Especificar componentes Tier 1-4"
  - "[ ] Gerar temas (light, dark, high-contrast)"
  - "[ ] Criar documentação completa"
  - "[ ] Validar consistência entre tokens e componentes"
  - "[ ] Gerar exemplos de uso"
  - "[ ] Executar validação final do sistema"
---

# Task: Create Design System

## Metadata
- **id:** ds-create-system
- **agent:** ds-architect
- **complexity:** F5
- **inputs:** brand_name, target_platforms, color_palette?, typography?, existing_assets?
- **outputs:** Complete Design System in library/systems/{name}/

## Description
Cria um Design System completo do zero, incluindo todos os token sets, component specs, theme definitions, e documentacao.

## Process

### Phase 1: Discovery & Elicitation
1. Identificar o contexto (projeto interno, cliente, produto)
2. Coletar inputs:
   - Nome do sistema / marca
   - Plataformas alvo (web, mobile, desktop)
   - Brand guidelines existentes (cores, tipografia, tom)
   - Referencias visuais (sites, apps, mood boards)
   - Requisitos especiais (dark mode, high contrast, RTL)
3. Definir scope (quais tiers de componentes incluir)

### Phase 2: Token Architecture
1. **Primitive Tokens** - Valores raw
   - Color palette completa (neutrals + brand colors, 50-950 scale)
   - Typography scale (font families, sizes, weights, line-heights)
   - Spacing scale (4px or 8px base, 12 steps minimum)
   - Sizing scale (component heights, widths, icon sizes)
   - Radius scale (none, sm, md, lg, xl, full)
   - Shadow/elevation scale (sm, md, lg, xl)
   - Border widths (1px, 2px)
   - Opacity scale (0, 25, 50, 75, 100)
   - Z-index scale (base, dropdown, sticky, modal, toast)
   - Motion (durations + easings)
   - Breakpoints (sm, md, lg, xl, 2xl)

2. **Semantic Tokens** - Intent-based
   - Colors: primary, secondary, accent, success, warning, error, info
   - Surfaces: background, surface, overlay
   - Text: text-primary, text-secondary, text-disabled, text-inverse
   - Borders: border-default, border-subtle, border-strong
   - Interactive: hover, active, focus, selected, disabled

3. **Component Tokens** - Scoped to components
   - button-bg, button-text, button-border, button-radius
   - input-bg, input-border, input-placeholder, input-focus-ring
   - card-bg, card-border, card-shadow, card-radius
   - (etc per component)

### Phase 3: Component Specification
1. **Tier 1 - Primitives (Atoms)**
   - Button, IconButton
   - Input, TextArea, Select
   - Checkbox, Radio, Switch, Toggle
   - Badge, Tag, Chip
   - Avatar, Icon
   - Divider, Spacer
   - Text, Heading, Label, Caption
   - Link

2. **Tier 2 - Composites (Molecules)**
   - FormField (Label + Input + Error)
   - Card (Header + Body + Footer)
   - Alert, Toast, Banner
   - SearchBar
   - Breadcrumb
   - Pagination
   - Tabs
   - Tooltip, Popover
   - Dropdown Menu

3. **Tier 3 - Patterns (Organisms)**
   - Header / Navbar
   - Sidebar / Navigation
   - DataTable
   - Modal / Dialog
   - Form (multi-field)
   - EmptyState
   - ErrorBoundary

4. **Tier 4 - Layouts (Templates)**
   - PageLayout
   - DashboardLayout
   - AuthLayout
   - SettingsLayout

### Phase 4: Theme Creation
1. Light theme (default)
2. Dark theme
3. High contrast (if requested)
4. Brand variants (if multi-brand)

### Phase 5: Documentation
1. Token reference (all categories with visual samples)
2. Component catalog (props, variants, states, examples)
3. Usage guidelines (Do/Don't patterns)
4. Getting Started guide for devs
5. Migration guide template

### Phase 6: Registration
1. Gerar todos outputs nos formatos configurados (CSS, Tailwind, JSON, etc)
2. Salvar em library/systems/{name}/
3. Atualizar catalog.json
4. Atualizar changelog.md

## Output Structure
```
library/systems/{name}/
├── tokens/
│   ├── primitives.json
│   ├── semantic.json
│   ├── components.json
│   ├── primitives.css
│   ├── semantic.css
│   ├── tailwind.config.js
│   └── _variables.scss
├── components/
│   ├── tier-1-primitives.md
│   ├── tier-2-composites.md
│   ├── tier-3-patterns.md
│   └── tier-4-layouts.md
├── themes/
│   ├── light.css
│   ├── dark.css
│   └── themes.json
├── docs/
│   ├── getting-started.md
│   ├── token-reference.md
│   ├── component-catalog.md
│   ├── usage-guidelines.md
│   └── changelog.md
├── assets/
│   └── (previews, icons, etc)
└── ds-config.json
```

## Quality Criteria
- [ ] All 11 token categories defined
- [ ] Semantic tokens reference primitives (no hardcoded values)
- [ ] All Tier 1 components specified with props + states
- [ ] WCAG AA contrast ratios verified
- [ ] Light + Dark themes functional
- [ ] Documentation complete with examples
- [ ] Registered in catalog.json
