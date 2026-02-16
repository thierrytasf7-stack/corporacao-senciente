# Task: Bundle Analysis

> Blaze (Performance Engineer) | Analisar bundle size do frontend

## Objetivo
Analisar bundle size do frontend (Next.js dashboard), identificar dependencias pesadas, oportunidades de code splitting e tree-shaking.

## Steps

### Step 1: Build Analysis
```
- cd apps/dashboard
- npm run build (capturar output)
- Registrar:
  - Total bundle size
  - Per-route chunk sizes
  - Shared chunks
  - First Load JS size
```

### Step 2: Dependency Analysis
```
- Analisar package.json para dependencias pesadas
- Identificar:
  - Libs > 50KB que poderiam ser lazy loaded
  - Duplicatas de funcionalidade (ex: moment + dayjs)
  - Polyfills desnecessarios
  - Dev dependencies vazando para prod
- Verificar imports desnecessarios em componentes
```

### Step 3: Code Splitting Check
```
- Verificar dynamic imports (next/dynamic)
- Rotas com lazy loading?
- Componentes pesados com dynamic import?
- Verificar se pages/ ou app/ usa proper splitting
```

### Step 4: Tree Shaking Verification
```
- Imports nomeados vs default exports
- Barrel files (index.ts re-exports) causando bundle bloat?
- Side-effect imports desnecessarios
- Verificar sideEffects em package.json
```

### Step 5: Asset Optimization
```
- Imagens: formato (WebP/AVIF?), responsive, lazy loading
- Fonts: subset, display swap, preload
- CSS: unused styles, critical CSS extraction
- SVGs: inline vs sprite vs component
```

### Step 6: Budget Comparison
```
- Total bundle vs budget (< 250KB gzipped)
- Initial JS vs budget (< 150KB)
- Per-route budget check
- Gerar relatorio de compliance
```

## Output
- Bundle size breakdown por chunk
- Top 10 dependencias por tamanho
- Oportunidades de reducao priorizadas
- Comparacao com performance budgets
- Action items para @dev

---
*Task — Blaze, Performance Engineer*
