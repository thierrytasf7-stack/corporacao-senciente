---
task: Responsive Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - url: URL da pagina ou base_url
  - viewports: [320, 375, 768, 1024, 1920] (default)
Saida: |
  - screenshots: Screenshot por viewport
  - findings: Issues de responsividade
Checklist:
  - "[ ] Screenshot em cada viewport"
  - "[ ] Verificar horizontal scroll indesejado"
  - "[ ] Verificar texto truncado ou overflow"
  - "[ ] Verificar touch targets >= 44px em mobile"
  - "[ ] Verificar menu mobile (hamburger) funciona"
  - "[ ] Verificar tabelas sao responsivas"
  - "[ ] Verificar imagens redimensionam corretamente"
  - "[ ] Verificar sidebar colapsa em mobile"
  - "[ ] Verificar modais cabem na tela mobile"
  - "[ ] Verificar fontes legíveis em mobile (>= 14px)"
---

# *audit-responsive

Teste de responsividade em multiplos viewports.

## Viewports Testados

| Viewport | Device | Width |
|----------|--------|-------|
| XS | iPhone SE | 320px |
| SM | iPhone 14 | 375px |
| MD | iPad | 768px |
| LG | Desktop | 1024px |
| XL | Wide Desktop | 1920px |

## Procedimento via Playwright

Para cada viewport:
1. `page.setViewportSize({ width: W, height: 900 })`
2. `page.goto(url)`, esperar `networkidle`
3. Screenshot fullPage: `page.screenshot({ fullPage: true, path: ... })`
4. Verificar horizontal scroll: `page.evaluate(() => document.body.scrollWidth > window.innerWidth)`
5. Verificar overflow: `page.evaluate(() => ...)` nos containers principais
6. Em mobile (< 768): verificar hamburger menu, sidebar collapse
