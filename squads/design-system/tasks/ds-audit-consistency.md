---
task: Audit Design System Consistency
responsavel: "@ds-architect"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - system_name: Nome do Design System ou codebase a ser auditado
  - codebase_path: Caminho para o codebase (opcional, se não for sistema existente)
Saida: |
  - audit_report: Relatório completo de auditoria em formato markdown
  - findings: Array de descobertas categorizadas por severidade
  - score: Pontuação de consistência (0-100)
  - recommendations: Lista de recomendações acionáveis
Checklist:
  - "[ ] Validar se system_name ou codebase_path foi fornecido"
  - "[ ] Executar audit de Token Consistency"
  - "[ ] Executar audit de Component Consistency"
  - "[ ] Executar audit de Theme Consistency"
  - "[ ] Executar audit de Documentation Consistency"
  - "[ ] Calcular score geral (0-100)"
  - "[ ] Categorizar findings por Critical/Warning/Info"
  - "[ ] Gerar recomendações acionáveis"
  - "[ ] Formatar output em markdown conforme especificado"
---

# Task: Audit Design System Consistency

## Metadata
- **id:** ds-audit-consistency
- **agent:** ds-architect
- **complexity:** F3
- **inputs:** system_name OR codebase_path
- **outputs:** Audit report with findings + recommendations

## Description
Audita consistencia de um Design System ou codebase contra o DS definido. Identifica desvios, valores hardcoded, tokens nao usados, e componentes fora do padrao.

## Audit Checks

### Token Consistency
- [ ] CSS hardcoded values que deveriam ser tokens
- [ ] Tokens definidos mas nunca usados
- [ ] Tokens usados mas nao definidos
- [ ] Naming convention violations
- [ ] Valores magicos (numeros sem significado semantico)

### Component Consistency
- [ ] Componentes que reimplementam atoms do DS
- [ ] Props que divergem da spec
- [ ] Styles inline que deveriam usar tokens
- [ ] Componentes sem estados definidos no DS

### Theme Consistency
- [ ] Tokens sem variante dark
- [ ] Contrast ratios below WCAG AA
- [ ] Hardcoded colors que nao mudam com tema

### Documentation Consistency
- [ ] Componentes sem documentacao
- [ ] Tokens sem descricao
- [ ] Exemplos desatualizados

## Output
```markdown
# DS Audit Report - {system_name}
**Date:** {date}
**Score:** {score}/100

## Summary
- {n} hardcoded values found
- {n} unused tokens
- {n} undocumented components
- {n} accessibility violations

## Findings
### Critical
...
### Warning
...
### Info
...

## Recommendations
1. ...
```

## Quality Criteria
- [ ] All audit checks executed
- [ ] Findings categorized by severity
- [ ] Actionable recommendations provided
- [ ] Score calculated
