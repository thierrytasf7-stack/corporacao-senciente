---
task: Adapt Design System to New Brand
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do sistema de design existente
  - new_brand_colors: Objeto com novas cores primarias da marca
  - new_typography?: Configuracao tipografica nova (opcional)
  - new_radius?: Configuracao de raio de borda nova (opcional)
Saida: |
  - updated_theme: Tema atualizado com novos tokens de marca
  - migration_notes: Documentacao das mudancas realizadas
  - before_after_preview: Comparativo visual antes/depois
Checklist:
  - "[ ] Identificar todos os tokens brand-dependent"
  - "[ ] Substituir primitive colors da marca"
  - "[ ] Recalcular semantic mappings"
  - "[ ] Verificar contrast ratios com novos valores"
  - "[ ] Ajustar component tokens afetados"
  - "[ ] Gerar preview comparativo (before/after)"
  - "[ ] Documentar mudancas"
---

# Task: Adapt Design System to New Brand

## Metadata
- **id:** ds-adapt-brand
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name, new_brand_colors, new_typography?, new_radius?
- **outputs:** Updated theme + migration notes

## Description
Adapta um DS existente para uma nova marca. Mantém a estrutura/components e troca tokens de brand.

## Process

1. Identificar todos os tokens brand-dependent
2. Substituir primitive colors da marca
3. Recalcular semantic mappings
4. Verificar contrast ratios com novos valores
5. Ajustar component tokens afetados
6. Gerar preview comparativo (before/after)
7. Documentar mudancas

## Quality Criteria
- [ ] All brand tokens updated
- [ ] Contrast ratios maintained (WCAG AA)
- [ ] Before/after comparison documented
- [ ] No structural changes (only tokens)
