---
task: Create Icon System
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do sistema de design (obrigatorio)
  - icon_style?: Estilo dos icones (outline, solid, duotone) (opcional)
  - icon_set?: Fonte de icones (Lucide, Heroicons, Phosphor, custom) (opcional)
Saida: |
  - icon_system_spec: Especificacao completa do sistema de icones
  - icon_guidelines: Documentacao de uso e guidelines
  - icon_assets: Arquivos de icones organizados
Checklist:
  - "[ ] Definir icon style (outline, solid, duotone)"
  - "[ ] Definir sizing scale: xs:16px, sm:20px, md:24px, lg:32px"
  - "[ ] Definir color behavior: inherit currentColor + semantic coloring"
  - "[ ] Definir spacing rules (icon + text gap)"
  - "[ ] Definir icon set source (Lucide, Heroicons, Phosphor, custom)"
  - "[ ] Criar guidelines de quando usar qual icone"
  - "[ ] Documentar accessibility (aria-hidden + text labels)"
  - "[ ] Criar icon naming convention"
  - "[ ] Validar consistencia do sistema"
---

# Task: Create Icon System

## Metadata
- **id:** ds-create-icons
- **agent:** ds-architect
- **complexity:** F2
- **inputs:** system_name, icon_style?, icon_set?
- **outputs:** Icon system spec + guidelines

## Description
Define e organiza o sistema de icones do Design System. Inclui sizing, spacing, color, e guidelines de uso.

## Process

1. Definir icon style (outline, solid, duotone)
2. Definir sizing scale:
   - xs: 16px (inline text)
   - sm: 20px (buttons, inputs)
   - md: 24px (standalone)
   - lg: 32px (feature highlight)
3. Definir color behavior:
   - Inherit currentColor (default)
   - Semantic coloring (success=green, error=red)
4. Definir spacing rules (icon + text gap)
5. Definir icon set source (Lucide, Heroicons, Phosphor, custom)
6. Criar guidelines de quando usar qual icone
7. Documentar accessibility (aria-hidden + text labels)

## Quality Criteria
- [ ] Consistent sizing scale defined
- [ ] Color inherits from parent (currentColor)
- [ ] Accessibility: aria-hidden + screen reader text
- [ ] Icon naming convention documented
- [ ] Guidelines for icon selection
