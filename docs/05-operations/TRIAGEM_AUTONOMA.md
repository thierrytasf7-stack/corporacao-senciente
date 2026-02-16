## Triagem Autônoma (Template)

> Objetivo: guiar um novo projeto para a corporação senciente (ind. 5.0 → 6.0 → 7.0) em fluxo único. Use Jira para issues/fluxos e Confluence para documentação. GitKraken/MCP dá contexto de git.

### 1) Briefing guiado (Jira – issue inicial)
- Problema/oportunidade
- Público-alvo/persona
- Resultado desejado (métricas de sucesso)
- Restrições (regulatórias, prazo, custo, stack)
- Riscos/guardrails: segurança, privacidade, ética, RLS

### 2) Triagem de credenciais (Jira subtarefa)
- Inventário de contas (cloud, Git, CI/CD, observabilidade, billing)
- Responsáveis e cofre de segredos definido
- Domínios/DNS, certificados, OAuth apps
- Accessos mínimos e roles (service_role nunca exposto)

### 3) Benchmark (3 concorrentes) + decisão
- Selecionar 3 referências de mercado (links, features, pricing)
- Comparar 3-5 critérios-chave
- Posicionamento escolhido + porquê
- Ações imediatas para diferenciação

### 4) Definir 10 etapas principais (Jira épico + tasks)
- Decompor em 10 passos rastreáveis (descoberta → entrega → observabilidade)
- Cada passo com owner, DoD, teste mínimo, risco/mitigação
- Vincular a PRDs/Confluence

### 5) Definir/ajustar agentes
- Architect, Product, Dev, DevEx, Metrics, Entity (+ novos se necessários)
- Escopos, entradas/saídas, guardrails, gatilhos MCP
- Consciência: apontar para docs de cultura/valores/guardrails

### 6) START (auto-cultivo/execução)
- Checklist antes do start: credenciais ok, RLS ok, hooks Git ok, seeds/QA ok
- Rodar boardroom (@board_meeting) com contexto de benchmark e metas
- Iniciar execução: criar branch/PRs, tasks Jira; registrar decisões em Confluence
- Observabilidade: ativar logs/métricas; registrar retro/lessons

### Documentos de apoio (referenciar via MCP)
- Cultura/valores/guardrails (seeds + Confluence)
- RLS/sensibilidade (políticas e uso seguro)
- Fluxo START resumido
- Padrões de código, testes, observabilidade

### Sugestão de estrutura no Confluence
- Página raiz: “Aupoeises – Corpo e Mente” (missão/visão 6.0/7.0, cultura, guardrails)
- Seção “Triagem Autônoma”: subpáginas para Briefing, Credenciais, Benchmark, Etapas (10), Agentes, START
- Seção “Agentes”: papéis, entradas/saídas, triggers MCP
- Seção “Evolução”: retro, lições, roadmap de autoevolução

### Sugestão de issues iniciais no Jira
- Épico: “Onboarding Autônomo do Novo Projeto”
- Tasks:
  - Briefing guiado (checklist)
  - Triagem de credenciais
  - Benchmark 3 concorrentes + decisão
  - Definir 10 etapas principais
  - Definir/agentes necessários
  - START (execução): boardroom + setup de métricas/observabilidade

