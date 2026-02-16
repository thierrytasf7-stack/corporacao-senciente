# Task: Core Web Vitals & Lighthouse

> Blaze (Performance Engineer) | LCP, FID, CLS, TTI, Lighthouse score

## Objetivo
Medir Core Web Vitals e Lighthouse performance score do frontend. Comparar com budgets e gerar plano de otimizacao.

## Steps

### Step 1: Verify Frontend Running
```
- Verificar se dashboard esta rodando em localhost:21300
- Se nao, instruir: cd apps/dashboard && npm run dev
- Aguardar servidor estar ready
```

### Step 2: Lighthouse Audit
```
- Executar Lighthouse via CLI ou Playwright:
  - lighthouse http://localhost:21300 --output=json --chrome-flags="--headless"
  - OU via playwright: navegar e capturar metricas
- Capturar scores:
  - Performance score (target: >= 90)
  - Accessibility score
  - Best Practices score
  - SEO score
```

### Step 3: Core Web Vitals
```
- Largest Contentful Paint (LCP)
  - Target: < 2.5s | Critical: > 4.0s
  - Identificar elemento LCP
- First Input Delay (FID) / Interaction to Next Paint (INP)
  - Target: < 100ms | Critical: > 300ms
  - Identificar handlers lentos
- Cumulative Layout Shift (CLS)
  - Target: < 0.1 | Critical: > 0.25
  - Identificar elementos que causam shift
- Time to Interactive (TTI)
  - Target: < 3.5s | Critical: > 7.0s
```

### Step 4: Analyze Opportunities
```
- Render-blocking resources
- Unused JavaScript/CSS
- Image optimization opportunities
- Text compression (gzip/brotli)
- Cache policy recommendations
- Font loading impact
```

### Step 5: Budget Comparison
```
| Metric | Atual | Budget | Status |
|--------|-------|--------|--------|
| LCP    | ?     | < 2.5s | ?      |
| FID    | ?     | < 100ms| ?      |
| CLS    | ?     | < 0.1  | ?      |
| TTI    | ?     | < 3.5s | ?      |
| Score  | ?     | >= 90  | ?      |
```

### Step 6: Action Plan
```
- Priorizar por impacto no score
- Quick wins vs investimentos maiores
- Atribuir owner (@dev para code, @devops para infra)
```

## Output
- Lighthouse report completo
- Core Web Vitals medidos vs budgets
- Top opportunities priorizadas por impacto
- Action items com estimated impact

---
*Task — Blaze, Performance Engineer*
