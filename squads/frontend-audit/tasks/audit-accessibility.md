---
task: Accessibility Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - url: URL da pagina ou base_url para todas
Saida: |
  - a11y_findings: Issues de acessibilidade
  - wcag_level: Nivel de conformidade atingido
Checklist:
  - "[ ] Navegacao completa via Tab"
  - "[ ] Focus indicators visiveis em todos elementos interativos"
  - "[ ] Contraste de texto principal >= 4.5:1 (AA)"
  - "[ ] Todas as imagens tem alt text"
  - "[ ] Heading hierarchy correta (h1 > h2 > h3)"
  - "[ ] Formularios tem labels associados"
  - "[ ] Botoes e links tem texto acessivel"
  - "[ ] Modais capturam e retornam foco"
  - "[ ] Skip navigation link presente"
  - "[ ] ARIA roles usados corretamente"
  - "[ ] Touch targets >= 44px"
  - "[ ] Nenhuma informacao transmitida so por cor"
---

# *audit-a11y

Auditoria de acessibilidade baseada em WCAG 2.1 nivel AA.

## Procedimento via Playwright

1. **Keyboard Navigation**: Usar `page.keyboard.press('Tab')` repetidamente, verificar se foco e visivel e atinge todos os elementos interativos
2. **Focus Indicators**: Screenshot de cada elemento focado, verificar se ring/outline e visivel
3. **Contraste**: Extrair cor de texto e background dos elementos principais, calcular ratio
4. **Alt Text**: `page.locator('img').evaluateAll(imgs => imgs.map(i => ({src: i.src, alt: i.alt})))`
5. **Headings**: `page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(...)` verificar hierarquia
6. **Form Labels**: Verificar cada input tem label associado (for/id ou wrapper)
7. **ARIA**: Verificar aria-label, aria-describedby, role em elementos custom
8. **Modal Focus Trap**: Se ha modais, abrir e verificar que Tab nao sai do modal
