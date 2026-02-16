# Governança e rotação de chaves

Princípios
- Service role só no backend/automation. Frontend: publishable/anon limitados.
- Rotação trimestral ou após incidente.

Checklist de rotação
1) Gerar novas chaves no Supabase (anon/publishable/service_role).
2) Atualizar `.env`/`env.local` e secrets CI.
3) Revogar chaves antigas no painel.
4) Rodar smoke: `npm run health`, `npm run check:align "smoke prd"`.

Grok
- Guardar `GROK_API_KEY` apenas em backend/CI secrets.
- Configurar timeout/retries/fallback model; rotacionar se suspeita de vazamento.

Auditoria
- Manter log de quem atualizou secrets (CI ou infra).
- Playbook de incidente: ver `docs/RUNBOOK_INCIDENTES.md`.


































