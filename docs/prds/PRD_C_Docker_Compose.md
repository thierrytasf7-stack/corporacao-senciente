# PRDs – Eixo C: Docker Compose / Serviços auxiliares (10 itens)

## PRD-C1: Compose base com Supabase/pgvector (ou stub)
- Objetivo: ambiente local completo.
- Requisitos: db com pgvector; portas configuráveis; healthchecks.
- Aceitação: `docker compose up` sobe db e responde a conexões.
- Tarefas: service db; init scripts; volumes; healthcheck.

## PRD-C2: Serviço LangGraph runner
- Objetivo: orquestrar nós/flows.
- Requisitos: imagem com deps; hot-reload opcional; porta exposta.
- Aceitação: endpoint de health; roda flow de teste.
- Tarefas: Dockerfile; service; envs; teste de fluxo.

## PRD-C3: Gateway MCP
- Objetivo: expor RPCs e auth ao IDE.
- Requisitos: segura; mapeia funções match_*; protege service_role.
- Aceitação: chamadas MCP funcionam; logs presentes.
- Tarefas: imagem; config; rota de status.

## PRD-C4: Worker de embeddings (fila)
- Objetivo: processar textos/diffs assíncronos.
- Requisitos: fila (Redis/NATS/Sidekiq-like); idempotência.
- Aceitação: job enfileirado → embedding persistido.
- Tarefas: service da fila; worker; testes de throughput.

## PRD-C5: Scheduler @update_memory
- Objetivo: rodar após commits/merges.
- Requisitos: integração git hook ou webhook; cron interno.
- Aceitação: job executa e grava em `corporate_memory`.
- Tarefas: definir trigger; script; logs.

## PRD-C6: Observabilidade (Prom/Grafana/Tempo)
- Objetivo: métricas e traces mínimos.
- Requisitos: exporters básicos; dashboards seed.
- Aceitação: painel sobe; métricas de latência e erro.
- Tarefas: adicionar serviços; config dashboards.

## PRD-C7: Log sink (Loki/ELK-lite)
- Objetivo: centralizar logs de agentes e gateway.
- Requisitos: retenção curta; label por serviço.
- Aceitação: consultas por agente/flow.
- Tarefas: adicionar serviço; drivers de log; doc de uso.

## PRD-C8: Reverse proxy TLS local (Caddy/Traefik)
- Objetivo: roteamento e TLS dev.
- Requisitos: certificados locais; roteamento por host.
- Aceitação: proxy funcional; serviços atrás do proxy.
- Tarefas: config caddy/traefik; middleware básicos.

## PRD-C9: Seeds automáticos
- Objetivo: aplicar `schema.sql` e seeds de personas/Alma.
- Requisitos: script de init; idempotente.
- Aceitação: ao subir compose, dados seed disponíveis.
- Tarefas: script init; ordem de execução; validação.

## PRD-C10: Makefile/NPM scripts
- Objetivo: UX rápida (up/down/reset).
- Requisitos: comandos `make up/down/seed/logs`.
- Aceitação: scripts funcionam cross-platform (bash/pwsh).
- Tarefas: escrever targets; testar em Win/Unix.

