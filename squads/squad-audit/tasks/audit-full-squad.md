---
task: audit-full-squad
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria Completa de Squad AIOS

## Objetivo
Executar auditoria completa de uma squad AIOS cobrindo TODAS as 9 dimensoes de qualidade, gerando quality score (0-100) e rating.

## Input
- `{squad}` - Nome da squad (ex: backend-audit, frontend-audit)

## Procedimento

### Fase 0: Locate & Parse
1. Localizar squad em `squads/{squad}/`
2. Verificar que `squad.yaml` existe
3. Parsear YAML - se invalido, CRITICAL e abortar
4. Extrair lista de components (agents, tasks, workflows, checklists, templates)

### Fase 1-9: Executar Dimensoes
Executar CADA dimensao na ordem:

| # | Dimensao | Task | Max |
|---|----------|------|-----|
| 1 | Manifest Validity | audit-manifest.md | 15 |
| 2 | Structure Completeness | audit-structure.md | 10 |
| 3 | Agents Quality | audit-agents-quality.md | 15 |
| 4 | Tasks Coverage | audit-tasks-coverage.md | 15 |
| 5 | Workflows Integrity | audit-workflows-integrity.md | 10 |
| 6 | Checklists & Templates | audit-checklists-templates.md | 10 |
| 7 | Command Registration | audit-command-registration.md | 5 |
| 8 | Cross-References | audit-cross-references.md | 10 |
| 9 | Documentation | audit-documentation.md | 10 |

### Fase 10: Score Calculation
1. Somar pontos de cada dimensao
2. Calcular quality_score (0-100)
3. Determinar rating:

| Score | Rating | Significado |
|-------|--------|-------------|
| 95-100 | S | Exemplar - referencia para outras squads |
| 85-94 | A | Excelente - producao ready |
| 75-84 | B | Bom - melhorias menores necessarias |
| 65-74 | C | Aceitavel - otimizacoes recomendadas |
| 50-64 | D | Abaixo do padrao - melhorias urgentes |
| 0-49 | F | Critico - rewrite/reestruturacao necessaria |

### Fase 11: Report
Apresentar resultado no formato:

```
+==========================================+
|  SQUAD AUDIT REPORT: {squad}            |
+==========================================+
|  Quality Score: {score}/100 ({rating})  |
+==========================================+
|  Dimension Breakdown:                   |
|  +- Manifest Validity:    {x}/15        |
|  +- Structure:            {x}/10        |
|  +- Agents Quality:       {x}/15        |
|  +- Tasks Coverage:       {x}/15        |
|  +- Workflows Integrity:  {x}/10        |
|  +- Checklists/Templates: {x}/10        |
|  +- Command Registration: {x}/5         |
|  +- Cross-References:     {x}/10        |
|  +- Documentation:        {x}/10        |
+==========================================+
|  Findings: {n} CRITICAL, {n} HIGH,      |
|            {n} MEDIUM, {n} LOW          |
+==========================================+
```

Listar findings por severity (CRITICAL primeiro).

### Fase 12: Recommendations
Gerar lista priorizada de acoes corretivas:
1. **CRITICAL** - Bloqueia uso da squad em producao. Corrigir imediatamente.
2. **HIGH** - Impacta qualidade significativamente. Corrigir antes do proximo release.
3. **MEDIUM** - Melhorias recomendadas. Incluir no proximo sprint.
4. **LOW** - Nice-to-have. Backlog para melhoria continua.

## Output
- Quality score (0-100)
- Rating (S/A/B/C/D/F)
- Breakdown por dimensao
- Lista de findings com severity
- Sugestoes de otimizacao priorizadas
