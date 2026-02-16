---
task: optimize-squad
responsavel: squad-evolver
checklist: null
elicit: true
---

# Otimizacao de Squad

## Objetivo
Gerar e aplicar otimizacoes na squad baseado nos findings da auditoria.

## Input
- `{squad}` - Nome da squad
- Resultados da auditoria (findings por dimensao)

## Procedimento

### 1. Prioritize Findings
Ordenar findings por impacto:
1. **CRITICAL** - Corrigir PRIMEIRO (bloqueiam funcionamento)
2. **HIGH** - Corrigir em seguida (afetam qualidade significativamente)
3. **MEDIUM** - Melhorias recomendadas
4. **LOW** - Nice to have

### 2. Generate Optimization Plan
Para cada finding, gerar:
```
FINDING: {descricao}
SEVERITY: {CRITICAL|HIGH|MEDIUM|LOW}
DIMENSION: {dimensao afetada}
CURRENT: {estado atual}
PROPOSED: {estado proposto}
IMPACT: +{X}pts na dimensao
```

### 3. Present Plan (ELICITATION)
Apresentar plano ao usuario:
```
Optimization Plan for {squad}:
Current Score: {X}/100 ({rating})
Projected Score: {Y}/100 ({new_rating})
Delta: +{Y-X}pts

Optimizations ({n} total):
1. [CRITICAL] {descricao} (+{X}pts)
2. [HIGH] {descricao} (+{X}pts)
...

Apply all? (y/n/select)
```

### 4. Apply Optimizations
Para cada otimizacao aprovada:
1. Executar a correcao no arquivo correspondente
2. Verificar que a correcao nao quebrou nada
3. Registrar: finding, fix aplicado, pts ganhos

### 5. Zero Regression Gate
ANTES de aplicar qualquer mudanca:
- Calcular score atual
- Apos CADA mudanca, recalcular
- Se score diminuiu -> REVERTER e reportar

### 6. Re-Audit
Apos otimizacoes aplicadas:
1. Executar mini-audit nas dimensoes afetadas
2. Confirmar novo score
3. Verificar zero regression

## Output
- Lista de otimizacoes aplicadas com before/after
- Score: antes -> depois
- Delta por dimensao
