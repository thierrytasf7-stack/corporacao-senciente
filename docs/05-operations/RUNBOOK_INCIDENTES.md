# Runbook de incidentes (Ciclo 1)

1) Vazamento de chave
- Rotacionar GROK_API_KEY e SUPABASE_SERVICE_ROLE_KEY.
- Revogar publishable/anon se expostos.
- Atualizar `.env`/`env.local`, reiniciar serviços.

2) RLS violada / acesso indevido
- Conferir policies em `supabase/migrations/20251210_rls_policies.sql`.
- Aplicar migrations, rodar `supabase/tests/rls_smoke.sql` (pgTAP).
- Auditar quem acessou (logs Supabase), avaliar reset de tokens.

3) Índices vetoriais degradados
- Rodar `npm run reindex` (ou `psql -f scripts/reindex_ivfflat.sql`).
- Ajustar `ivfflat.probes` se recall baixo; aumentar lists se base cresceu.

4) Falha no board meeting (LLM)
- Checar GROK timeout/retry em `.env`.
- Se indisponível, alternar para fallback (futuro ciclo 4).

5) Embeddings inconsistentes
- Re-rodar `npm run seed`.
- Validar `npm run check:align "PRD de teste"` e comparar similaridade.


































