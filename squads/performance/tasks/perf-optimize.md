# Task: Performance Optimization

> Blaze (Performance Engineer) | Sugerir e aplicar otimizacoes baseadas em data

## Objetivo
Com base em profiling data coletado (audit, profile, bundle, queries), sugerir otimizacoes priorizadas e coordenar implementacao.

## Pre-requisito
- Dados de profiling existentes (rodar *audit ou *profile antes)
- Sem dados = sem otimizacao (REGRA DE OURO: medir primeiro)

## Steps

### Step 1: Review Profiling Data
```
- Verificar se existe audit/profile recente
- Se NAO existe: "Preciso de dados primeiro. Execute *audit ou *profile."
- Se existe: carregar findings e metricas
```

### Step 2: Prioritize by Impact
```
- Classificar findings por:
  1. Impacto no usuario (UX-facing primeiro)
  2. Severidade (critical > high > medium > low)
  3. Esforco de implementacao (quick wins primeiro)
  4. Risco (baixo risco primeiro)

- Criar priority matrix:
  | Finding | Impact | Effort | Risk | Priority |
  |---------|--------|--------|------|----------|
```

### Step 3: Generate Optimization Plan
```
Para cada finding priorizado:
- Descricao do problema
- Metrica atual vs target
- Solucao proposta
- Estimated improvement
- Owner (@dev, @data-engineer, @devops)
- Complexidade (fibonacci)
```

### Step 4: Quick Wins First
```
Aplicar quick wins que Blaze pode fazer diretamente:
- Usar performance-optimizer.js para sugestoes AST-based
- Identificar caching opportunities automaticamente
- Sugerir index creation para queries lentas
- Recomendar code splitting para chunks grandes
```

### Step 5: Delegate Complex Optimizations
```
- Code changes → @dev (*optimize-performance)
- Schema/index changes → @data-engineer (*analyze-performance)
- Infrastructure changes → @devops
- Incluir contexto completo no briefing
```

### Step 6: Verify Post-Optimization
```
- Re-executar profiling relevante
- Comparar metricas antes vs depois
- Confirmar improvement sem regressoes
- Atualizar baseline
```

## Output
- Optimization plan priorizado
- Quick wins aplicados
- Delegacoes feitas com briefing
- Before/after metricas (pos-implementacao)

## Integration
- Usa: performance-analyzer.js, performance-optimizer.js
- Delega: @dev, @data-engineer, @devops

---
*Task — Blaze, Performance Engineer*
