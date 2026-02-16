# QA de Similaridade (mini dataset)

Use para smoke manual/CI de recall:

Consultas e expectativas:
1) "login social sem senha" → deve trazer tasks/PRDs ligados a autenticação (task_context starter pack).
2) "mesa redonda agentes" → deve trazer board_meeting/agent_logs.
3) "guardrails segurança" → deve puxar corporate_memory de ética/anti-padrões.
4) "observabilidade loki grafana" → deve relacionar docs de OBS_STACK_LOCAL/PRD_C.
5) "persona developer testes performance" → deve trazer agent_logs Dev.
6) "valores missão inovacao" → deve trazer corporate_memory mission/value.
7) "docker compose prom loki grafana" → deve trazer PRD_C e OBS_STACK_LOCAL.
8) "RLS sensibilidade low anon" → deve trazer PRD_D/RLS docs.

Modo de uso:
- `echo "login social sem senha" | npm run check:align`
- Validar se topMemory/topTask retornam itens coerentes. Ajustar seeds se falhar.
- Em CI (leve): rodar 2–3 consultas críticas e verificar se topMemory não é vazio.



