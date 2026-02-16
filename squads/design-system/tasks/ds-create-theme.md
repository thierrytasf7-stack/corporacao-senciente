---
task: Create Theme Variant
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System existente
  - theme_type: Tipo de tema (dark|high-contrast|brand)
  - brand_colors?: Cores da marca (obrigatorio para brand themes)
Saida: |
  - theme_css_path: Caminho do arquivo CSS gerado
  - theme_config_path: Caminho do arquivo JSON de configuracao
  - theme_name: Nome do tema criado
  - validation_report: Relatorio de validacao de contrastes
Checklist:
  - "[ ] Validar Design System existente"
  - "[ ] Determinar tipo de tema (dark|high-contrast|brand)"
  - "[ ] Carregar tokens semanticos do DS"
  - "[ ] Remapear semantic tokens para novos primitive values"
  - "[ ] Ajustar surface colors (bg, surface, overlay)"
  - "[ ] Ajustar text colors (primary, secondary, disabled)"
  - "[ ] Ajustar border colors"
  - "[ ] Ajustar shadow adjustments (dark = glow-based)"
  - "[ ] Verificar contrast ratios (WCAG AA minimo)"
  - "[ ] Gerar CSS com media query / class toggle"
  - "[ ] Gerar JSON de configuracao do tema"
  - "[ ] Testar todos os componentes no novo tema"
  - "[ ] Documentar diferencas e limitacoes"
---

# Task: Create Theme Variant

## Metadata
- **id:** ds-create-theme
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name, theme_type (dark|high-contrast|brand), brand_colors?
- **outputs:** Theme CSS file + theme config JSON

## Description
Cria uma variante de tema para um Design System existente. Remapeia semantic tokens para novos primitive values mantendo a estrutura intacta.

## Process

1. Carregar DS existente e seus tokens
2. Identificar tipo de tema:
   - **dark**: Inverter surfaces, ajustar contrasts
   - **high-contrast**: Maximizar contrasts para WCAG AAA
   - **brand**: Remapear brand colors mantendo neutrals
3. Remapear semantic tokens:
   - Surface colors (bg, surface, overlay)
   - Text colors (primary, secondary, disabled)
   - Border colors
   - Shadow adjustments (dark = glow-based, not shadow-based)
4. Verificar contrast ratios (WCAG AA minimo)
5. Gerar CSS com media query / class toggle
6. Testar todos os componentes no novo tema
7. Documentar diferencas

## Output Format
```css
/* themes/dark.css */
[data-theme="dark"] {
  --ds-color-background: var(--ds-color-gray-950);
  --ds-color-surface: var(--ds-color-gray-900);
  --ds-color-text-primary: var(--ds-color-gray-50);
  --ds-color-text-secondary: var(--ds-color-gray-400);
  --ds-color-border-default: var(--ds-color-gray-800);
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Auto dark mode */
  }
}
```

## Quality Criteria
- [ ] All semantic tokens remapped
- [ ] Contrast ratios >= 4.5:1 (normal text)
- [ ] Contrast ratios >= 3:1 (large text)
- [ ] Supports prefers-color-scheme
- [ ] Supports data-theme attribute toggle
- [ ] Components visually verified in new theme
