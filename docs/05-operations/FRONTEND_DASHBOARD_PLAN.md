# Plano Frontend – Dashboard da Corporação Autônoma

## Objetivo
Interface única para gestão da empresa: abas por setor/agente, métricas, insights, histórico e metas.

## Estrutura de informação
- Setores/Agentes (abas):
  - Produto/UX
  - Engenharia/Plataforma (DevEx/SRE/Security)
  - Dados/IA (vetores/RAG)
  - Métricas/DORA
  - QA/Confiabilidade
  - Segurança/Compliance
  - FinOps/LLM
  - Entidade/Autoridade (cadastros/contas/domínios)
  - Boardroom (decisões)
- Fontes de dados:
  - Supabase: `corporate_memory` (history, mission/value, guardrails), `agent_logs` (boardroom, DevEx, Métricas), `task_context` (PRDs/issues).
  - GitKraken MCP: commits/PRs diffs (puxar via backend ou script) para exibir histórico recente.
  - Observabilidade (se ativado): métricas de latência embeddings/boardroom/LLM; DORA (via Git/CI).
  - Logs JSON (LLM calls, alignment) exportáveis para Prom/Loki.

## Páginas/Abas (conteúdo)
- Overview (home): cards com estado geral (DORA, latência vetorial, número de tasks por status, alertas de alignment).
- Boardroom: últimas sínteses, opiniões de Architect/Product/Dev, link para logs em `agent_logs`.
- DevEx/Engenharia: saúde de hooks/CI, passos de onboarding, comandos rápidos, alertas de env/hooks.
- Métricas/DORA: gráficos simples (lead time, deploy freq, MTTR, change fail rate), contagem de fallback LLM.
- Dados/IA: latência embeddings, recall QA, thresholds, lists/probes recomendados.
- FinOps/LLM: contagem de chamadas Grok/Gemini, retries/fallback, estimativa de custo (se disponível).
- Segurança/Compliance: guardrails, sensibilidade (RLS), auditoria (quando implementada).
- Entidade/Autoridade: checklist de cadastros (cloud/DNS/orgs), status e pendências.
- Produto/UX e QA: PRDs atuais (`task_context`), status e próximos passos.

## Newsroom / Boardroom Live
- Feed de decisões do boardroom (últimas sínteses Grok/Gemini) com timestamp.
- Botão “Rodar mesa” (aciona backend/CI; requer confirmação).
- Destaque de divergências entre agentes e próximos passos sugeridos.

## Opiniões cruzadas (feedback 360 por setor)
- Para cada aba/setor, painel com notas/opiniões dos agentes (Architect/Product/Dev/DevEx/Métricas/Entidade).
- Mostrar conflito/divergência e peso de segurança (Architect) quando divergente.

## Painel de estado/alertas
- Cards: DORA (lead time, deploy freq, MTTR, change fail rate), latência embeddings/boardroom, retries/fallback LLM, QA recall, RLS status.
- Lista de alertas: alignment falho, QA falho, fallback LLM alto, probes/lists desajustado, hooks/CI com erro.

## Timeline, históricos e futuros/utopias
- Timeline de commits/diffs/PR summaries (ingest:summary).
- Histórico de decisões do boardroom e logs `agent_logs`.
- “Futuros/Utopias”: campo para visões/estratégias; vincular a tasks/PRDs.

## Ações rápidas e “Ask an agent”
- Botões: boardroom, check_alignment, qa:sim, autotune (relatório), ingest:summary/diff.
- “Ask an agent” contextual: escolha agente + contexto da aba e obtenha resposta.

## Dados e endpoints (sugestão)
- Backend (Node) ou edge API para ler:
  - `/api/memory?category=history|value|mission`
  - `/api/agent-logs?agent=Boardroom|DevEx|Metrics`
  - `/api/tasks?status=...`
  - `/api/metrics/llm` (ler logs JSON ou armazenar em tabela futura)
  - `/api/metrics/dora` (derivado de Git/CI)
- Tabelas existentes usadas diretamente (Supabase client no frontend com RLS?):
  - `corporate_memory` (RLS já filtra sensibilidade low para anon/auth; use service role no backend para full).
  - `agent_logs` (restrito; backend com service role).
  - `task_context` (leitura low sensibilidade).

## Componentes UI (sugestão)
- Layout com abas + cards + tabelas + gráficos (latência/contagens).
- Cards: alertas de alignment, falhas QA, fallback LLM, status RLS tests.
- Tabelas: tasks/PRDs, logs de boardroom, histórico de commits/diffs sumarizados.
- Gráficos simples: linhas/barras (latência embeddings/boardroom), gauges (DORA).

## Roadmap incremental
1) Versão estática: ler Supabase (read-only) e exibir cards/tabelas principais.
2) Incluir métricas LLM (logs JSON → endpoint simples) e QA batch.
3) Acrescentar DORA (simples, derivado de timestamps de commits/PRs) e FinOps LLM (contagem de chamadas).
4) Integração com observabilidade (Prom/Loki) para métricas reais.
5) Ações rápidas: disparar boardroom, check_alignment, ingest summary via botões (protegido/confirmado).

## Notas de segurança
- Frontend deve usar backend/service role para dados sensíveis (agent_logs, history) e aplicar filtros/transformações.
- Não expor chaves no frontend; usar endpoints protegidos.

