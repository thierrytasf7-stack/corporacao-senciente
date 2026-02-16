---
task: Diff Design Systems
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_a: Primeiro Design System (ou versao)
  - system_b: Segundo Design System (ou versao)
  - output_format: Formato do relatorio (markdown | json | html)
  - visual_diff: Incluir diffs visuais? (true | false)
Saida: |
  - diff_report: Relatorio completo de diferencas
  - token_diff: Diff de tokens (added, removed, changed)
  - component_diff: Diff de componentes (props, variants, states)
  - theme_diff: Diff de temas (token remappings)
  - summary: Resumo executivo das principais diferencas
Checklist:
  - "[ ] Carregar ambos os sistemas de design"
  - "[ ] Comparar token por token (added, removed, changed)"
  - "[ ] Comparar specs de componentes (props, variants, states)"
  - "[ ] Comparar themes (token remappings)"
  - "[ ] Gerar relatorio visual de diferencas quando solicitado"
  - "[ ] Validar integridade do relatorio gerado"
  - "[ ] Formatar saida conforme formato solicitado"
---

# Task: Diff Design Systems

## Metadata
- **id:** ds-diff-systems
- **agent:** ds-architect
- **complexity:** F2
- **inputs:** system_a, system_b
- **outputs:** Diff report

## Description
Compara dois Design Systems (ou versoes) e gera relatorio de diferencas em tokens, componentes e temas.

## Process

1. Carregar ambos os sistemas
2. Comparar token por token (added, removed, changed)
3. Comparar component specs (props, variants, states)
4. Comparar themes (token remappings)
5. Gerar relatorio visual de diferencas

## Quality Criteria
- [ ] Token-level diff complete
- [ ] Component-level diff complete
- [ ] Visual diff when possible
