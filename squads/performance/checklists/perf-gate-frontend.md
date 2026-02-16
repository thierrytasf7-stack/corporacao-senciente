# Performance Gate: Frontend

> Blaze (Performance Engineer) | Checklist de quality gate frontend

## Mandatory Checks

- [ ] **Bundle Size**: Total bundle < 250KB gzipped
- [ ] **Initial JS**: First Load JS < 150KB
- [ ] **Code Splitting**: Rotas principais usam dynamic imports
- [ ] **No Giant Chunks**: Nenhum chunk individual > 100KB
- [ ] **Tree Shaking**: Sem imports de modulo completo desnecessarios
- [ ] **No Dev Dependencies in Prod**: Nenhuma dev dep no bundle final

## Core Web Vitals

- [ ] **LCP**: Largest Contentful Paint < 2.5s
- [ ] **FID/INP**: First Input Delay < 100ms
- [ ] **CLS**: Cumulative Layout Shift < 0.1
- [ ] **TTI**: Time to Interactive < 3.5s

## Lighthouse

- [ ] **Performance Score**: >= 90
- [ ] **No Render-Blocking**: Sem recursos bloqueando render critico
- [ ] **Images Optimized**: Formato moderno (WebP/AVIF), lazy loading
- [ ] **Fonts Optimized**: font-display: swap, preload

## Gate Decision

| Result | Action |
|--------|--------|
| All PASS | Gate APPROVED |
| Web Vitals FAIL only | Gate APPROVED with WARNING |
| Bundle Size FAIL | Gate BLOCKED - reduce bundle |
| Lighthouse < 50 | Gate BLOCKED - critical degradation |

---
*Checklist — Blaze, Performance Engineer*
