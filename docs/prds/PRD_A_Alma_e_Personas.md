# PRDs – Eixo A: Alma da Empresa e Personas (10 itens)

Formato: objetivo, requisitos, critérios de aceitação, tarefas e métricas.

## PRD-A1: Manifesto da Alma (missão/valores)
- Objetivo: persistir missão/valores vetorizados para gating de tarefas.
- Requisitos: textos canônicos; embedding 384d (Xenova/bge-small-en-v1.5); categoria `mission/value`.
- Aceitação: similaridade > 0.9 com texto-fonte; consulta `match_corporate_memory` retorna top-3 coerentes.
- Tarefas: redigir manifesto; gerar embeddings; inserir em `corporate_memory`; smoke test de consulta.
- Métricas: recall top-3; cobertura de valores (mín. 5 entradas).

## PRD-A2: Ética & Compliance vetorial
- Objetivo: políticas de uso e restrições vetorizadas.
- Requisitos: categorias `value/long_term_goal`; guardrails de não fazer.
- Aceitação: consultas retornam políticas corretas; trigger de veto em tarefas divergentes.
- Tarefas: catalogar políticas; gerar embeddings; configurar verificação de similaridade.
- Métricas: % de vetos corretos; falsos positivos <10%.

## PRD-A3: Persona Architect seed
- Objetivo: persona com foco em segurança/arquitetura.
- Requisitos: thought_process exemplo; decision_vector; log inicial.
- Aceitação: entrada em `agent_logs`; prompt MPC/LangGraph usa persona.
- Tarefas: redigir persona; gerar embedding; inserir log seed.
- Métricas: aderência de respostas (avaliar 5 cenários).

## PRD-A4: Persona Product seed
- Objetivo: persona orientada a valor/UX.
- Requisitos: thought_process e vetor.
- Aceitação: log seed criado; usado na mesa redonda.
- Tarefas: escrever persona; embedding; inserir.
- Métricas: satisfação de critérios de UX em simulações.

## PRD-A5: Persona Dev seed
- Objetivo: persona de execução/performance/testes.
- Requisitos: thought_process, vetor.
- Aceitação: log seed criado; usado na mesa redonda.
- Tarefas: redigir; embed; inserir.
- Métricas: propostas contendo testes >80% dos casos.

## PRD-A6: Glosário corporativo vetorial
- Objetivo: termos chave com embeddings para consistência.
- Requisitos: >=30 termos; função de busca retorna definição correta.
- Aceitação: top-3 relevância em consultas; variância semântica controlada.
- Tarefas: coletar termos; embed; inserir em `corporate_memory`.
- Métricas: precisão @3 >0.8.

## PRD-A7: Guardrails de “não fazer”
- Objetivo: impedir tarefas divergentes da Alma.
- Requisitos: embeddings dedicados; threshold configurável.
- Aceitação: tarefas com baixa similaridade são sinalizadas/rejeitadas.
- Tarefas: listar anti-padrões; embed; validar veto.
- Métricas: taxa de bloqueio correto; baixo falso positivo.

## PRD-A8: Tom de voz e estilo de código
- Objetivo: padronizar comunicação e padrões de código.
- Requisitos: exemplos canônicos; embeddings.
- Aceitação: consultas retornam exemplos; mesa redonda referencia padrão.
- Tarefas: coletar snippets e guias; embed; inserir.
- Métricas: aderência em revisões >85%.

## PRD-A9: PRDs base (starter pack) vetorizados
- Objetivo: base de PRDs core do produto com vetores alvo.
- Requisitos: 5–10 PRDs iniciais; `task_context` preenchido.
- Aceitação: cada PRD tem `requirements_vector` e `related_files` previstos.
- Tarefas: redigir PRDs; embed; inserir em `task_context`.
- Métricas: similaridade com execuções reais; tempo de ciclo.

## PRD-A10: Checklist de alinhamento automático
- Objetivo: script que checa novo PRD contra Alma/guardrails.
- Requisitos: usa `match_corporate_memory`; threshold configurável.
- Aceitação: gera alerta se similaridade < X; loga resultado.
- Tarefas: implementar script; integrar ao fluxo de criação de PRD.
- Métricas: % PRDs aprovados; incidentes evitados.

