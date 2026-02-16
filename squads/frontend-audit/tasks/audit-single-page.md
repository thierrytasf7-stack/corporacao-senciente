---
task: Single Page Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - url: URL completa da pagina
  - depth: shallow | deep (default: deep)
Saida: |
  - findings: Issues da pagina
  - screenshots: Screenshots multi-viewport
Checklist:
  - "[ ] Navegar para a pagina"
  - "[ ] Capturar screenshot desktop"
  - "[ ] Coletar console errors/warnings"
  - "[ ] Coletar network failures"
  - "[ ] Verificar todos os elementos interativos (botoes, links, forms)"
  - "[ ] Testar hover states"
  - "[ ] Testar estados (loading, empty, error se aplicavel)"
  - "[ ] Verificar responsividade em 4 viewports"
  - "[ ] Verificar acessibilidade (teclado, contraste)"
  - "[ ] Classificar findings"
---

# *audit-page

Audita uma unica pagina em profundidade.

## Procedimento

1. **Navegacao**: `page.goto(url)`, esperar `networkidle`
2. **Visual**: Screenshot fullPage, verificar layout
3. **Console**: Coletar errors, warnings
4. **Network**: Listar failed requests (4xx, 5xx)
5. **Interatividade**: Clicar cada botao/link visivel, verificar resultado
6. **Estados**: Se ha loading spinner, verificar transicao. Se lista vazia, verificar empty state
7. **Responsividade**: Screenshot em 320px, 768px, 1024px, 1920px
8. **Acessibilidade**: Tab navigation, focus ring, aria-labels
9. **Consolidar**: Listar findings com severity
