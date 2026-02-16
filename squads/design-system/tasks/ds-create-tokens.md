---
task: Create/Expand Design Tokens
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System (obrigatorio)
  - categories[]: Categorias de tokens a criar/expandir (obrigatorio)
  - base_colors?: Cores base para categoria Color (opcional)
  - typography?: Configuracao tipografica (opcional)
Saida: |
  - token_files: Arquivos de tokens gerados (CSS, JSON, Tailwind, SCSS)
  - token_manifest: Manifest com todas as definicoes de tokens
  - documentation: Documentacao atualizada dos tokens
Checklist:
  - "[ ] Validar nome do Design System"
  - "[ ] Validar categorias solicitadas"
  - "[ ] Para cada categoria: definir primitive values"
  - "[ ] Para cada categoria: mapear semantic aliases"
  - "[ ] Para cada categoria: criar component-level bindings"
  - "[ ] Gerar outputs em todos os formatos configurados"
  - "[ ] Validar naming conventions (kebab-case)"
  - "[ ] CSS vars prefixados com --ds-"
  - "[ ] Semantic tokens referenciam primitives"
  - "[ ] Atualizar documentacao de tokens"
---

# Task: Create/Expand Design Tokens

## Metadata
- **id:** ds-create-tokens
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name, categories[], base_colors?, typography?
- **outputs:** Token files (CSS, JSON, Tailwind, SCSS)

## Description
Cria ou expande token sets para um Design System. Suporta criacao individual de categorias ou batch completo.

## Process

1. Identificar DS alvo (existente ou novo)
2. Determinar categorias a criar/expandir
3. Para cada categoria:
   - Definir primitive values
   - Mapear semantic aliases
   - Criar component-level bindings
4. Gerar outputs em todos os formatos configurados
5. Validar naming conventions
6. Atualizar documentacao de tokens

## Token Categories Reference

### Color (obrigatorio)
```
primitive: gray-50..950, blue-50..950, red-50..950, green-50..950, yellow-50..950, purple-50..950
semantic: primary, secondary, accent, success, warning, error, info, surface, background, text-primary, text-secondary
component: button-bg, input-border, card-bg, link-color, etc
```

### Typography (obrigatorio)
```
font-family: sans, serif, mono
font-size: xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36), 5xl(48)
font-weight: light(300), regular(400), medium(500), semibold(600), bold(700)
line-height: tight(1.25), normal(1.5), relaxed(1.75)
letter-spacing: tight(-0.025em), normal(0), wide(0.025em)
```

### Spacing (obrigatorio)
```
0(0), px(1px), 0.5(2), 1(4), 1.5(6), 2(8), 2.5(10), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96)
```

### Sizing
```
component heights: xs(24), sm(32), md(40), lg(48), xl(56)
icon sizes: xs(16), sm(20), md(24), lg(32)
```

### Radius
```
none(0), sm(4), md(8), lg(12), xl(16), 2xl(24), full(9999)
```

### Shadow
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Border
```
width: thin(1px), medium(2px)
style: solid, dashed
```

### Opacity
```
0(0), 5(0.05), 10(0.1), 25(0.25), 50(0.5), 75(0.75), 100(1)
```

### Z-Index
```
base(0), dropdown(1000), sticky(1100), overlay(1200), modal(1300), popover(1400), toast(1500)
```

### Motion
```
duration: instant(0), fast(100ms), normal(200ms), slow(300ms), slower(500ms)
easing: ease-in, ease-out, ease-in-out, spring
```

### Breakpoints
```
sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
```

## Quality Criteria
- [ ] Naming follows kebab-case convention
- [ ] CSS vars prefixed with --ds-
- [ ] Semantic tokens reference primitives
- [ ] All requested categories complete
- [ ] Outputs in configured formats (CSS, JSON, Tailwind)
