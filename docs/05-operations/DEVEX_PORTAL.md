# Portal DevEx – Corporação Autônoma (Template)

## Objetivo
Ser o ponto único de onboarding e operação: fluxos, checklists, agentes, comandos e métricas.

## Onboarding rápido
1) Clone o template; copie `docs/env.example` → `.env` ou `env.local`; preencha SUPABASE_*, GROK_*, GEMINI_* (não commitar).  
2) Aplique schema/migrations no Supabase; `npm run seed`.  
3) Hooks: já instalados em `.git/hooks/` (pwsh). Se usar bash/WSL: `chmod +x .git/hooks/post-commit .git/hooks/post-merge .git/hooks/commit-msg`.  
4) Boardroom: opcional `LOG_BOARDROOM=true` para registrar síntese em `agent_logs`.  
5) Observabilidade (dev): `docker-compose -f docker-compose.observability.yml up -d` e acessar Grafana/Prom/Loki.  
6) Projeto derivado: `npm run ingest:history` (com `INGEST_COMMITS`) e `npm run ingest:diff -- HEAD~1..HEAD` para PRs específicos.

## Golden paths
- Planejamento: `@board_meeting` + `@git_context` (via GitKraken MCP) + memória vetorial.
- Execução: commits com tag `[PRD-XYZ]/[ISSUE-123]/[SEC]/[OBS]/[TASK-123]`; post-commit registra histórico em Supabase.
- QA rápido: `npm run check:align` com consultas de `docs/QA_SIMILARITY.md`; CI opcional `RUN_QA_SIM=true`.
- Segurança/RLS: policies finas, pgTAP smoke e fine (set `RUN_RLS_FINE=true` em CI).
- Observabilidade: compose de logs/métricas; monitorar latência de embedding, RPCs e boardroom.

## Agentes (resumo)
- DevEx: guia onboarding, golden paths, hooks/CI, guardrails.  
- Métricas (DORA): coleta/alerta de lead time, deploy freq, MTTR, change fail rate; latência/recall vetorial.  
+- Entidade/Autoridade: entrevista de cadastros (cloud/DNS/GitHub org/Vercel/billing/segredos), planeja o “mapa de contas” da empresa.
- Boardroom: Architect/Product/Dev (+ fallback Gemini) com memória vetorial e logs opcionais.

## Comandos essenciais
- Seeds: `npm run seed`
- Boardroom: `npm run board:meeting -- "feature"`
- Alinhamento: `echo "PRD" | npm run check:align`
- Histórico: `npm run ingest:history` (não usar no template) / `npm run ingest:diff -- HEAD~1..HEAD`
- Saúde: `npm run health`, `npm run reindex`

## CI (GitHub Actions)
- Sempre: lint placeholder + check_alignment smoke.
- Opcional: RLS fine (`RUN_RLS_FINE=true`), QA similarity (`RUN_QA_SIM=true`).

## Observabilidade
- Compose em `docker-compose.observability.yml`; ver `docs/OBS_STACK_LOCAL.md` para checklist.
- Métricas recomendadas: latência embeddings, RPC `match_*`, tempo de boardroom, retries Grok/Gemini, seeds/ingest.































