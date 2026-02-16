# PRDs – Eixo D: RLS, Roles e Segurança (10 itens)

## PRD-D1: Matriz de roles
- Objetivo: definir privilégios (anon/publishable/service_role/automation).
- Requisitos: tabela de permissões por ação/tabela/RPC.
- Aceitação: matriz documentada e aplicada.
- Tarefas: mapear ações; validar com time.

## PRD-D2: RLS corporate_memory
- Objetivo: restringir leitura/escrita.
- Requisitos: só service_role escreve; leitura limitada por role backend.
- Aceitação: políticas ativas; testes aprovados.
- Tarefas: criar policies; pgTAP.

## PRD-D3: RLS agent_logs
- Objetivo: logs privados.
- Requisitos: escrita por backend/automation; leitura restrita.
- Aceitação: políticas aprovadas; testes.
- Tarefas: policies; testes.

## PRD-D4: RLS task_context
- Objetivo: proteger PRDs/issues.
- Requisitos: frontend só leitura filtrada; backend escreve.
- Aceitação: políticas + testes; status transitions seguras.
- Tarefas: policies; triggers de validação.

## PRD-D5: Policies para RPC match_*
- Objetivo: proteger funções de similaridade.
- Requisitos: apenas roles permitidas; limites de uso.
- Aceitação: chamadas negadas para roles indevidas.
- Tarefas: policies em funções; testes.

## PRD-D6: Filtros por status/arquivos
- Objetivo: limitar leitura de tarefas por contexto.
- Requisitos: filtro por status e related_files quando frontend.
- Aceitação: consultas retornam apenas permitido.
- Tarefas: policy com check; testes.

## PRD-D7: Testes automatizados RLS
- Objetivo: pgTAP ou scripts SQL.
- Requisitos: casos positivos/negativos por role.
- Aceitação: suite passa em CI.
- Tarefas: escrever testes; rodar em pipeline.

## Ações já feitas (Ciclo 1)
- Policies mínimas: somente `service_role` para todas as ações em `corporate_memory`, `agent_logs`, `task_context` (`supabase/migrations/20251210_rls_policies.sql`).
- Smoke pgTAP: `supabase/tests/rls_smoke.sql` (verifica anon sem privilégios).

## Próximos passos (ciclos seguintes)
- Policies finas por role (frontend leitura filtrada, backend escrita).
- Testes pgTAP positivos/negativos por role.
- Auditoria (tabela audit_log) e classificação de sensibilidade por registro.
- Adicionar campo de sensibilidade (ex.: low/medium/high) em `corporate_memory` e `task_context` para filtrar retornos ao frontend. (Feito em migração 20251211_rls_fine)
- Políticas aplicadas: anon/auth só leem sensibilidade low e status != done em task_context; service_role full; agent_logs restrito a service_role.

## PRD-D8: Rotação de chaves
- Objetivo: playbook e scripts para rotacionar chaves.
- Requisitos: checklist e automação mínima.
- Aceitação: rotação testada em staging.
- Tarefas: script/cli; doc.

## PRD-D9: Auditoria mínima
- Objetivo: quem/quando alterou status/tabelas.
- Requisitos: triggers de audit; tabela audit_log.
- Aceitação: registros consistentes; consulta rápida.
- Tarefas: criar tabela audit; triggers; testes.

## PRD-D10: Playbook de incidentes
- Objetivo: resposta rápida a vazamentos/abuso.
- Requisitos: passos para revogar chaves, bloquear roles, reindexar vetores.
- Aceitação: documento validado; exercício simulado.
- Tarefas: escrever playbook; rodar simulação.

