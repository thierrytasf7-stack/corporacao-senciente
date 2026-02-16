---
task: UX Heuristics Audit
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - base_url: URL do frontend
Saida: |
  - scorecard: Score 1-10 para cada heuristica
  - total_score: Media geral
  - findings: Issues UX com evidencias
Checklist:
  - "[ ] H1 - Visibilidade do status do sistema"
  - "[ ] H2 - Correspondencia sistema-mundo real"
  - "[ ] H3 - Controle e liberdade do usuario"
  - "[ ] H4 - Consistencia e padroes"
  - "[ ] H5 - Prevencao de erros"
  - "[ ] H6 - Reconhecimento vs memoria"
  - "[ ] H7 - Flexibilidade e eficiencia"
  - "[ ] H8 - Design estetico e minimalista"
  - "[ ] H9 - Recuperacao de erros"
  - "[ ] H10 - Ajuda e documentacao"
---

# *audit-ux

Review UX usando as 10 heuristicas de Jakob Nielsen.

## Criterios de Avaliacao

Para cada heuristica, score 1-10:

### H1 - Visibilidade do Status do Sistema
- O sistema informa o usuario sobre o que esta acontecendo?
- Ha loading indicators? Progress bars? Confirmacoes de acao?
- Breadcrumbs ou indicacao de localizacao na navegacao?

### H2 - Correspondencia Sistema-Mundo Real
- A linguagem e familiar ao usuario (nao jargao tecnico)?
- Icons sao reconheciveis?
- Ordem de informacao segue logica natural?

### H3 - Controle e Liberdade do Usuario
- O usuario pode desfazer acoes?
- Ha botao de cancelar em dialogos?
- Ha saida clara de qualquer fluxo?

### H4 - Consistencia e Padroes
- Botoes tem estilo consistente?
- Mesma acao usa mesmo padrao em todas as paginas?
- Terminologia consistente?

### H5 - Prevencao de Erros
- Formularios tem validacao antes de submit?
- Acoes destrutivas pedem confirmacao?
- Campos tem formato esperado indicado?

### H6 - Reconhecimento vs Memoria
- Informacao necessaria esta visivel (nao escondida)?
- Opcoes sao visiveis (nao precisam ser lembradas)?
- Contexto anterior e mantido durante navegacao?

### H7 - Flexibilidade e Eficiencia
- Ha atalhos para usuarios experientes?
- Acoes frequentes sao acessiveis rapidamente?
- O sistema se adapta a diferentes niveis de experiencia?

### H8 - Design Estetico e Minimalista
- Apenas informacao relevante na tela?
- Sem ruido visual ou elementos desnecessarios?
- Hierarquia visual clara (o mais importante se destaca)?

### H9 - Recuperacao de Erros
- Mensagens de erro sao claras e em linguagem simples?
- Erros indicam o que deu errado E como resolver?
- O sistema oferece recuperacao (retry, rollback)?

### H10 - Ajuda e Documentacao
- Ha tooltips em elementos nao-obvios?
- Ha onboarding ou guia para novos usuarios?
- Help e acessivel de qualquer pagina?

## Output

```markdown
## UX Scorecard

| # | Heuristica | Score | Observacoes |
|---|-----------|-------|-------------|
| H1 | Visibilidade do Status | 7/10 | Loading ok, falta breadcrumb |
| ... | ... | ... | ... |
| **Media** | | **6.5/10** | |
```
