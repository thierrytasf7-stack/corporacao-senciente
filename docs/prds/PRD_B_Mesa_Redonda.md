# PRDs – Eixo B: Mesa Redonda LangGraph/MCP (10 itens)

Formato: objetivo, requisitos, critérios de aceitação, tarefas, métricas.

## PRD-B1: Pipeline de embeddings (diff/PRD)
- Objetivo: gerar embedding do estado atual (diff/PRD) para decisões.
- Requisitos: modelo definido no env; suporte a texto grande; fallback chunking.
- Aceitação: embedding gerado <1s p/ 4k tokens; armazenado opcionalmente.
- Tarefas: implementar extrator de diffs/PRDs; chamar provedor; testes.
- Métricas: latência; custo; taxa de erro <1%.

## PRD-B2: Nó Architect
- Objetivo: agente focado em segurança/arquitetura.
- Requisitos: prompt persona; input embeddings; output opinião vetorial+texto.
- Aceitação: gera decisão com peso de segurança; log em `agent_logs`.
- Tarefas: configurar nó; integrar fetch persona; testes de simulação.
- Métricas: recall de riscos reportados.

## PRD-B3: Nó Product
- Objetivo: agente de valor/UX.
- Requisitos: prompt; saída vetorial+plano UX.
- Aceitação: logs criados; ponderação aplicada.
- Tarefas: implementar nó; validar em 5 cenários.
- Métricas: cobertura de UX e valor.

## PRD-B4: Nó Dev
- Objetivo: execução/performance/testes.
- Requisitos: plano técnico curto; sugestões de testes.
- Aceitação: logs com recomendações de testes.
- Tarefas: implementar nó; avaliar em cenários de refator/feature.
- Métricas: % de planos com testes >80%.

## PRD-B5: Agregador ponderado
- Objetivo: combinar opiniões vetoriais com regra de desempate pró-segurança.
- Requisitos: média ponderada; detecta divergência alta e reequilibra pesos.
- Aceitação: retorna plano unificado; grava decisão final.
- Tarefas: implementar agregador; definir thresholds; testes A/B.
- Métricas: redução de conflitos; tempo de convergência.

## PRD-B6: Seleção de tarefa próxima (`@next_step_vector`)
- Objetivo: buscar `task_context` mais similar ao estado atual.
- Requisitos: usa RPC `match_task_context`; status `pending`.
- Aceitação: retorna top-1 consistente; atualiza status -> `coding`.
- Tarefas: integrar RPC; aplicar filtro; testes de similaridade.
- Métricas: precisão@1; tempo de decisão.

## PRD-B7: Executor de plano (checklist)
- Objetivo: gerar checklist acionável a partir da decisão.
- Requisitos: passos curtos, arquivos previstos, testes sugeridos.
- Aceitação: checklist com 3–7 itens; ligado a `related_files`.
- Tarefas: template de saída; integração LangGraph; logging.
- Métricas: % passos concluídos sem replanejar.

## PRD-B8: Logger vetorial pós-decisão
- Objetivo: registrar raciocínio final em `agent_logs`.
- Requisitos: thought_process, decision_vector, agente = “Board”.
- Aceitação: log por ciclo; consultável via RPC `match_agent_logs`.
- Tarefas: implementar gravação; teste de consulta.
- Métricas: cobertura 100%; busca <300ms.

## PRD-B9: Hook de status/arquivos
- Objetivo: atualizar `task_context.status` e `related_files`.
- Requisitos: transação única; validação de status.
- Aceitação: mudança atômica; audit trail opcional.
- Tarefas: criar RPC ou direto SQL; testes de concorrência.
- Métricas: consistência; erros <1%.

## PRD-B10: Modo simulação (what-if)
- Objetivo: rodar mesa redonda sem aplicar mudanças, só relatar.
- Requisitos: flag dry-run; não grava status; apenas log de simulação.
- Aceitação: relatório consolidado; nenhuma escrita em tabelas principais.
- Tarefas: implementar switch; diferenciar prefixo nos logs.
- Métricas: uso em discovery; zero efeitos colaterais.

