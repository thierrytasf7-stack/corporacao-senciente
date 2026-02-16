---
task: Full Frontend Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - base_url: URL base do frontend (ex: http://localhost:21300)
  - routes: Lista de rotas (opcional, auto-discover se nao fornecido)
  - viewports: Lista de viewports (default: [320, 768, 1024, 1920])
Saida: |
  - findings: Lista de issues encontrados com severity
  - screenshots: Screenshots de cada pagina/viewport
  - report_path: Caminho do relatorio gerado
Checklist:
  - "[ ] Descobrir todas as rotas/abas do frontend"
  - "[ ] Navegar para cada rota"
  - "[ ] Capturar screenshot de cada pagina (desktop)"
  - "[ ] Coletar console errors de cada pagina"
  - "[ ] Coletar network failures de cada pagina"
  - "[ ] Verificar elementos visuais basicos (layout, overflow, imagens)"
  - "[ ] Testar navegacao entre paginas"
  - "[ ] Testar responsividade em 4 viewports"
  - "[ ] Avaliar heuristicas UX (scoring rapido)"
  - "[ ] Verificar acessibilidade basica (keyboard, contraste)"
  - "[ ] Medir tempo de carregamento de cada pagina"
  - "[ ] Classificar todos os findings por severity"
  - "[ ] Gerar relatorio consolidado"
---

# *audit-full

Auditoria completa do frontend - navega TODAS as rotas, testa TODOS os viewports.

## Procedimento

### Fase 1: Descoberta de Rotas
1. Acessar `base_url` via Playwright
2. Coletar todos os links do sidebar/nav
3. Extrair rotas unicas
4. Se `routes` fornecido, usar lista do usuario

### Fase 2: Navegacao e Captura (por rota)
Para cada rota:
1. Navegar via `page.goto(url)`
2. Aguardar `networkidle`
3. Capturar screenshot fullPage em 1920px
4. Coletar `console.error` e `console.warn`
5. Coletar network requests com status >= 400
6. Verificar se pagina renderizou (nao esta em branco)
7. Verificar titulo ou heading principal

### Fase 3: Responsividade
Para cada rota, em cada viewport (320, 768, 1024, 1920):
1. Setar viewport `page.setViewportSize({width, height: 900})`
2. Capturar screenshot
3. Verificar horizontal scroll
4. Verificar overflow de texto/containers

### Fase 4: UX Quick Score
Para o frontend como um todo:
1. Avaliar cada heuristica de Nielsen (1-10)
2. Documentar evidencias positivas e negativas
3. Calcular score medio

### Fase 5: Acessibilidade Quick Check
Para cada rota:
1. Tab through da pagina (keyboard navigation)
2. Verificar focus indicators
3. Verificar contraste de texto principal
4. Verificar alt text de imagens
5. Verificar heading hierarchy

### Fase 6: Performance Quick Check
Para cada rota:
1. Medir tempo de load (navigation → networkidle)
2. Contar requests totais
3. Identificar imagens > 500KB

### Fase 7: Consolidacao
1. Agrupar findings por severity (CRITICAL > HIGH > MEDIUM > LOW)
2. Agrupar por categoria (Visual, Funcional, UX, A11y, Perf, Responsive)
3. Gerar relatorio markdown
4. Listar screenshots capturados

## Output Format

```markdown
# Frontend Audit Report: {app_name}
**URL:** {base_url}
**Data:** {date}
**Rotas auditadas:** {count}

## Sumario Executivo
- CRITICAL: {n} issues
- HIGH: {n} issues
- MEDIUM: {n} issues
- LOW: {n} issues
- UX Score: {score}/10

## Findings por Pagina
### /{route}
| # | Severity | Categoria | Descricao | Fix Sugerido |
|---|----------|-----------|-----------|--------------|
| 1 | CRITICAL | Funcional | Console error: ... | ... |

## Screenshots
- /{route} (1920px): screenshot-{route}-1920.png
- /{route} (320px): screenshot-{route}-320.png
```
