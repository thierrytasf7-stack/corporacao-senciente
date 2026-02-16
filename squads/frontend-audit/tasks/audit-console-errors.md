---
task: Console & Network Error Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - url: URL ou base_url
  - routes: Lista de rotas (opcional)
Saida: |
  - console_errors: Lista de console.error com stack trace
  - console_warnings: Lista de console.warn
  - network_failures: Lista de requests 4xx/5xx
Checklist:
  - "[ ] Interceptar console.error em cada pagina"
  - "[ ] Interceptar console.warn em cada pagina"
  - "[ ] Interceptar network requests com status >= 400"
  - "[ ] Agrupar erros duplicados (mesmo message)"
  - "[ ] Classificar severity por impacto"
  - "[ ] Identificar erros que bloqueiam funcionalidade"
---

# *audit-errors

Detecta console errors, warnings e network failures.

## Procedimento via Playwright

```javascript
// Setup listeners ANTES de navegar
const errors = [];
const warnings = [];
const networkFailures = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push({ text: msg.text(), url: page.url() });
  if (msg.type() === 'warning') warnings.push({ text: msg.text(), url: page.url() });
});

page.on('response', response => {
  if (response.status() >= 400) {
    networkFailures.push({
      url: response.url(),
      status: response.status(),
      page: page.url()
    });
  }
});

// Navegar para cada rota
for (const route of routes) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}
```

## Classificacao

- **CRITICAL**: Erros que causam tela branca ou funcionalidade quebrada
- **HIGH**: Erros frequentes (> 3x na mesma pagina) ou 5xx responses
- **MEDIUM**: Warnings repetitivos, 404 em assets
- **LOW**: Warnings informativos, deprecated APIs
