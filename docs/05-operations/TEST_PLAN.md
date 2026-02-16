# Plano de Testes (RLS/QA)

RLS (pgTAP)
- `supabase/tests/rls_smoke.sql` (anon sem acesso).
- Próximo: casos positivos/negativos por role backend/frontend/service_role.

Similaridade (QA manual/CI leve)
- Ver `docs/QA_SIMILARITY.md`. Executar `npm run check:align` para consultas-chave.

Health
- `npm run health` (RPC + acesso tabelas).
- `npm run reindex` quando índices degradarem.

CI
- Workflow `.github/workflows/ci.yml` roda smoke de check_alignment e RLS pgTAP.


































