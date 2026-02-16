---
task: Performance Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - url: URL da pagina
Saida: |
  - metrics: Core Web Vitals medidos
  - findings: Issues de performance
Checklist:
  - "[ ] Medir tempo total de carregamento (navigation → load)"
  - "[ ] Medir tempo ate networkidle"
  - "[ ] Contar total de requests"
  - "[ ] Contar total de bytes transferidos"
  - "[ ] Identificar requests > 500KB"
  - "[ ] Identificar imagens nao otimizadas"
  - "[ ] Verificar lazy loading de imagens below-the-fold"
  - "[ ] Verificar cache headers"
  - "[ ] Identificar render-blocking resources"
  - "[ ] Medir CLS (layout shifts visiveis)"
---

# *audit-perf

Auditoria de performance frontend.

## Metricas Alvo

| Metrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| Total Load | < 3s | 3s - 5s | > 5s |
| Requests | < 50 | 50-100 | > 100 |

## Procedimento via Playwright

1. **Timing**: Usar Performance API via `page.evaluate(() => performance.timing)`
2. **Requests**: Interceptar via `page.on('request')` e `page.on('response')`
3. **Bundle Size**: Somar bytes de todos os JS/CSS responses
4. **Images**: Listar imagens com tamanho > 500KB
5. **Layout Shifts**: Observar CLS via PerformanceObserver
