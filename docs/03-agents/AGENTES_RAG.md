## Agentes, Vetores e Guardrails (384d)

### Camadas vetoriais (Supabase pgvector 384d)
- `corporate_memory`: missão/valores/alertas/dna. Categoria: mission | value | long_term_goal | other | history | alert.
- `agent_logs`: opinião/decisão dos agentes (decision_vector).
- `task_context`: alvo técnico por tarefa/PRD; status tracking; related_files.

### Agentes
- Architect: segurança, arquitetura, RLS, custo/latência.
- Product: valor de usuário, UX, clareza de problema/aceitação.
- Dev: execução rápida, qualidade, testes, performance.
- DevEx: onboarding, DX, hooks, golden paths.
- Metrics: DORA, custo LLM, latência e recall vetorial.
- Entity: cadastros/autorizações/domínios.

### Mecanismo de decisão (mesa curta)
1) Buscar contexto: `match_corporate_memory` + `match_task_context`.
2) Cada agente gera opinião vetorial; divergência alta → peso maior para Architect.
3) Síntese curta com próximos passos rastreáveis.
4) Registrar em `agent_logs` (sugerido: LOG_BOARDROOM=true).

### Prevenção de drift
- Comparar embedding de diff/PR/PRD com `task_context.requirements_vector`.
- Se similaridade cair, replanejar antes de codar mais.

### Fluxo operacional (scripts)
- Boardroom: `npm run board:meeting -- "objetivo"` (Grok + fallback Gemini; embeddings Xenova 384d).
- Histórico: `npm run ingest:history` (usa INGEST_COMMITS; respeita BLOCK_TEMPLATE_INGEST).
- Diff/PR: `npm run ingest:summary -- --range "HEAD~1..HEAD"` (ou apontar PR).
- Commit único: `npm run commit:log`.
- QA vetorial: `npm run qa:sim` ou `npm run check:align -- "pergunta"`.

### Guardrails
- Sensibilidade: anon/auth só leem `sensitivity=low`; `agent_logs` restrito a service_role.
- Nunca expor `service_role` em frontend/hooks.
- Bloqueio template: set `BLOCK_TEMPLATE_INGEST=true` no repositório base.
- PII/segredos: não inserir em memória vetorial; mascarar antes de salvar.

### Embeddings locais
- Modelo: `Xenova/bge-small-en-v1.5` (384d).
- Env esperados: `EMBEDDING_MODEL`, `EMBEDDING_DIM=384`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

