# Entrevista de Adaptação para novo MVP (Trigger inicial)

Use este roteiro em chat (10 interações). Finalidade: coletar briefing mínimo para reconfigurar o template PSCC (memória vetorial, personas, tasks, docs) a um novo MVP.

## Instruções de uso
- Faça as 10 perguntas em sequência (um turno por pergunta).
- Capture respostas concisas; se a resposta vier longa, peça bullets.
- Ao final, preencha seeds e PRDs conforme o mapeamento abaixo e rode: `npm run seed`.

## Roteiro (10 perguntas vitais)
1) Missão e resultado desejado do produto? (1-2 frases de impacto)
2) Público-alvo e mercado? (segmentos, persona primária)
3) Feature core do MVP (única) e métrica de sucesso?
4) Restrições de segurança/privacidade? (dados sensíveis, compliance)
5) Tom de voz e estilo de código preferido? (curto/longo, formal/informal)
6) Anti-padrões a evitar? (arquitetura, libs proibidas, UX proibida)
7) Ritmo de entrega e prioridades? (velocidade vs qualidade, testes obrigatórios)
8) Infra/ambiente alvo? (Vercel/Docker, edge vs server, integrações críticas)
9) Observabilidade/logs desejados? (métricas, traces, logs estruturados)
10) PRDs/epics iniciais (3-10) e arquivos tocados previstos?

## Como aplicar as respostas
- Q1/Q2 → `seeds/corporate_memory.yaml` (mission/value) e `docs/REQUIREMENTS.md` ajustes de contexto.
- Q3/Q10 → `seeds/task_context.yaml` (`task_description`, `related_files`) e PRDs em `docs/prds/`.
- Q4/Q6 → Guardrails em `seeds/corporate_memory.yaml` (value/guardrails) + RLS em `docs/prds/PRD_D_RLS_e_Seguranca.md`.
- Q5 → Tom/estilo em `seeds/corporate_memory.yaml` (value: tom_de_voz, estilo_de_codigo).
- Q7 → Prioridades/status default em `task_context` e critérios de aceitação nos PRDs.
- Q8 → `docs/prds/PRD_C_Docker_Compose.md` (serviços, proxy, seeds) e README.
- Q9 → Observabilidade/logging em `PRD_C` e em `docs/BOARDROOM_GROK.md` (logs da mesa).

## Passos práticos pós-entrevista
1) Atualizar seeds YAML (mission/values/guardrails/tom + tasks).
2) Revisar PRDs base em `docs/prds/` com o contexto coletado.
3) `npm run seed` para reindexar vetores.
4) `npm run check:align -- "novo PRD"` para validar alinhamento.
5) `npm run board:meeting -- "feature core"` para gerar plano com Grok + memória.

## Próximos passos/PRDs pendentes ao montar novo MVP
- Especializar `PRD_A_Alma_e_Personas.md` com missão/valores/guardrails do novo produto.
- Ajustar `PRD_B_Mesa_Redonda.md` para refletir critérios de decisão do cliente.
- Atualizar `PRD_C_Docker_Compose.md` com integrações reais (APIs, auth, proxy).
- Refinar `PRD_D_RLS_e_Seguranca.md` com políticas específicas e dados sensíveis.
- Gerar issues/tarefas em `task_context` para cada PRD priorizado pelo cliente.


































