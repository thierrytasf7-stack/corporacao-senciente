# Template de prompts/triggers MCP

Use como system prompt/base do servidor MCP ou `.cursorrules` (ajuste vocabulário e limites do modelo).

## Triggers
- `@update_memory`: “Analise diff do último commit + issue resolvida. Gere resumo do aprendizado e insira em `corporate_memory` com embedding.”
- `@next_step_vector`: “Busque em `task_context` a tarefa `pending` mais similar ao estado atual (diff/PRD). Retorne próxima ação lógica e arquivos tocados.”
- `@debug_vector`: “Para um erro atual, procure vetores similares em `corporate_memory` e `agent_logs`. Sugira solução baseada em experiências passadas.”
- `@board_meeting`: “Simule Architect/Product/Dev. Compare opiniões; se conflito alto, priorize segurança do Architect. Entregue plano unificado.”
- `@evolve_self`: “Leia docs/código principal. Ache discrepâncias com a Alma da Empresa. Sugira issue de refatoração/upgrade com justificativa vetorial.”
- `@git_context`: “Use GitKraken MCP para obter commits/diffs/PRs recentes da branch atual. Resuma e alimente a decisão/plano. Não execute push/reset sem confirmação.”

## Regras operacionais
- Sempre validar alinhamento com a Alma da Empresa (similaridade mínima).
- Registrar decisões em `agent_logs` com vetor da opinião final.
- Atualizar `task_context.status` conforme avanço: `planning` → `coding` → `review` → `done`.
- Evitar ações sem evidência vetorial; citar origem (PRD, memória, log).
- Antes de planejar/decidir, consultar Git via MCP (commits/PRs relevantes) para evitar drift.

## Integração com Supabase
- Usar funções RPC de similaridade de `supabase/schema.sql`.
- Em produção, executar apenas com `service_role` no backend. Frontend usa `publishable/anon` limitado.

