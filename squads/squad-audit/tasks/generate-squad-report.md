---
task: generate-squad-report
responsavel: squad-evolver
checklist: null
elicit: false
---

# Relatorio de Evolucao de Squad

## Objetivo
Gerar relatorio completo de evolucao da squad com historico de versoes, metricas e graficos ASCII.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Load Data
1. Ler squad.yaml (version, evolution header)
2. Ler changelog em `data/changelogs/{squad-name}.changelog.md`
3. Extrair lineage (versao, score, rating, data)

### 2. Evolution Graph (ASCII)
```
Score Evolution: {squad}
100 ┤
 90 ┤                              ●  v1.2.0 (A)
 80 ┤                    ●  v1.1.0 (B)
 70 ┤          ●  v1.0.0 (C)
 60 ┤
 50 ┤ ●  v0.1.0 (D)
    └──────────────────────────────────
      Feb 10   Feb 11   Feb 12   Feb 13
```

### 3. Dimension Radar
```
Dimension Radar: {squad} v{current}

Manifest      [████████████░░░] 12/15
Structure     [████████████████] 10/10
Agents        [████████████░░░] 12/15
Tasks         [██████████████░] 14/15
Workflows     [████████░░░░░░░]  7/10
Checklists    [████████████████] 10/10
Commands      [████████████████]  5/5
Cross-Refs    [██████████████░░]  9/10
Documentation [████████░░░░░░░]  7/10
                                 ──────
                          TOTAL: 86/100 (A)
```

### 4. Improvement Suggestions
Baseado no score atual, sugerir proximos passos:
- Dimensoes com mais espaço de melhoria
- Findings ainda abertos
- Estimativa de score apos melhorias

### 5. Batch Audit Table (para *batch-audit)
Quando chamado via *batch-audit, gerar tabela de TODAS as squads:

```
╔═════════════════════════════════════════════════════╗
║  AIOS SQUAD AUDIT DASHBOARD                        ║
╠═════════════════════════════════════════════════════╣
║  Squad              │ Version │ Score │ Rating │ Δ  ║
║  ──────────────────────────────────────────────────║
║  backend-audit      │ 1.0.0   │  78   │  B     │ - ║
║  frontend-audit     │ 1.2.0   │  91   │  A     │ +5║
║  fullstack-harmony  │ 1.0.0   │  72   │  C     │ - ║
║  agent-audit        │ 1.1.0   │  88   │  A     │ +3║
║  squad-audit        │ 1.0.0   │  85   │  A     │ - ║
╠═════════════════════════════════════════════════════╣
║  Average: 82.8/100 (B)  │  Squads: 5  │  S:0 A:3  ║
╚═════════════════════════════════════════════════════╝
```

## Output
- Evolution graph ASCII
- Dimension radar
- Improvement suggestions
- Batch table (se batch-audit)
