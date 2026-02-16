# Políticas finas (planejamento)

Objetivo: granularidade por role.

Roles sugeridos
- service_role (backend/automation)
- backend (API server)
- frontend (publishable/anon)

Tabelas
- corporate_memory: leitura parcial para frontend/backend (sensibilidade=low); escrita só service_role.
- agent_logs: leitura/escrita apenas backend/service_role. Sem frontend.
- task_context: leitura filtrada para frontend/backend (sensibilidade=low e status != done); escrita backend/service_role.

RPCs
- match_*: permitir backend/service_role; bloquear frontend ou limitar por categoria/status.

Próximos passos
- Criar policies específicas por role; adicionar testes pgTAP positivos/negativos.
- Coluna sensibilidade (low/medium/high) adicionada em corporate_memory e task_context; políticas aplicadas (migr. 20251211_rls_fine).



