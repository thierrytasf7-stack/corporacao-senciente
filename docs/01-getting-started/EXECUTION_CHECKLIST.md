## Checklist de Execução / Configuração

### Ambiente
- [ ] Criar `env.local` (ou `.env`) a partir de `docs/env.example`.
- [ ] Definir `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_MODEL=Xenova/bge-small-en-v1.5`, `EMBEDDING_DIM=384`.
- [ ] Definir chaves LLM: `GROK_API_KEY` (primário) e `GEMINI_API_KEY` (fallback).
- [ ] Setar `BLOCK_TEMPLATE_INGEST=true` quando estiver no repositório template.

### Banco / Supabase
- [ ] Aplicar `supabase/schema.sql`.
- [ ] Aplicar migrations em `supabase/migrations` (inclui RLS fina, audit_log, vector 384d).
- [ ] Confirmar pgTAP instalado (para testes RLS).

### Dados / Vetores
- [ ] Rodar seeds: `npm run seed` (idempotente, 384d).
- [ ] Ingest histórico (apenas em MVP real): `npm run ingest:history` com `INGEST_COMMITS`.
- [ ] Ingest diff/PR (se precisar): `npm run ingest:summary -- --range "HEAD~1..HEAD"`.
- [ ] Registrar commit mais recente (opcional): `npm run commit:log`.

### Testes / Qualidade
- [ ] RLS smoke: `npm run test:rls:smoke` (ou rodar sql em `supabase/tests/rls_smoke.sql`).
- [ ] RLS fina: `npm run test:rls:fine` (ou `supabase/tests/rls_fine.sql`).
- [ ] QA vetorial: `npm run qa:sim`.
- [ ] Alinhamento pontual: `npm run check:align -- "pergunta"`.
- [ ] Autotune (opcional): `npm run autotune` e depois reindex (`scripts/reindex_ivfflat.sql`).

### Hooks / Git / MCP
- [ ] Copiar hooks de `hooks/*.sh` ou `*.ps1` para `.git/hooks/` e dar permissão (bash).
- [ ] Validar commit-msg (precisa tag `[PRD-XYZ]` etc.).
- [ ] Configurar MCP Supabase correto no `mcp.json` (projeto ffdszaiarxstxbafvedi).
- [ ] Usar GitKraken MCP para status/log/diff antes de `@board_meeting`.

### Boardroom / Agentes
- [ ] Rodar `npm run board:meeting -- "objetivo"` para validar fluxo Grok+Gemini+Xenova.
- [ ] Se quiser persistir decisão: `LOG_BOARDROOM=true`.

### Observabilidade (opcional)
- [ ] Subir stack local: `docker-compose -f docker-compose.observability.yml up -d`.
- [ ] Configurar Prometheus (prometheus.yml) e Loki/Grafana.

### Frontend (esqueleto)
- [ ] `cd frontend && npm install && npm start` (usa backend seguro para dados; não expor service_role).





























