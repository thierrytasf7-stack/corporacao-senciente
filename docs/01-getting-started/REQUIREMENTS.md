# Requisitos do PSCC (MVP dinâmico e atômico)

## Funcionais
- Persistir memórias institucionais, logs de agentes e contexto de tarefas em vetores.
- Orquestrar agentes (Architect/Product/Dev) via sistema próprio de orquestração (scripts/evolution_loop.js) com votação e reconciliação, integrado com MCP.
- Versionar decisões e diffs para alimentar memória corporativa.
- Buscar similaridade vetorial para: alinhamento estratégico, próxima ação de tarefa e debug histórico.

**Nota de Arquitetura:** O sistema utiliza orquestração própria implementada em `scripts/evolution_loop.js` para coordenar múltiplos agentes. Este sistema permite controle total sobre o fluxo de decisão, execução e validação, sendo mais leve e específico para as necessidades do projeto do que frameworks genéricos como LangGraph.

## Não funcionais
- Segurança: RLS no Supabase, chaves segregadas (frontend usa publishable/anon; backend usa service role).
- Observabilidade: logs dos agentes + rastreio de decisões (agent_logs).
- Evolutividade: fácil replicar para novas empresas trocando apenas seeds da memória e chaves.
- Performance: índices IVFFlat em vetores, `ivfflat.probes` conforme carga; ajustar lists/probes por volume (ex.: lists 200, probes 10–20).
- Operação: healthcheck (`npm run health`), reindex (`npm run reindex`), CI com smoke de alinhamento e pgTAP.
- Observabilidade futura: stack Loki/Prom/Grafana (ver `docs/OBS_STACK_LOCAL.md`), métricas de embeddings/mesa e RPCs.

## Convenções
- Dimensão de embedding: 384 (Xenova/bge-small-en-v1.5; ajuste se mudar modelo).
- Categorias de memória: `mission`, `value`, `long_term_goal`.
- Status de tarefa: `planning`, `coding`, `review`, `done`.
- Personas fixas: Architect (segurança/arquitetura), Product (valor/UX), Dev (execução/perf).

## Fluxo mínimo de uso
1) Definir “Alma da Empresa” em `corporate_memory`.
2) Carregar personas em `agent_logs` seeds ou contexto externo do orquestrador.
3) Registrar PRDs/Issues em `task_context` com embedding alvo.
4) Rodar `@board_meeting` → gerar plano → `@next_step_vector` para ações.
5) Após entrega/commit, rodar `@update_memory` para consolidar aprendizado.

## Entregáveis obrigatórios no repositório
- README (visão, setup, triggers).
- SQL de schema Supabase + funções de similaridade.
- Template de MCP/system prompt com triggers.
- Guia de agentes/personas e vetores.

