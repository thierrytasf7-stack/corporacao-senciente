## Boardroom (Decisão Multiagente)

### Objetivo
Orquestrar Architect/Product/Dev (e opcionais DevEx/Metrics) com memória vetorial e Grok (+ fallback Gemini) para produzir decisão curta, rastreável e segura.

### Fluxo
1) Trigger `@board_meeting` ou `npm run board:meeting -- "objetivo"`.
2) Coleta contexto:
   - `match_corporate_memory`, `match_task_context` (vector 384d, Xenova).
   - Opcional: commits/diffs via GitKraken MCP ou `npm run commit:log`.
3) Opiniões:
   - Architect: segurança/arquitetura/RLS/custos.
   - Product: UX/valor/risco negócio.
   - Dev: execução/testes/perf.
4) Síntese (CEO): convergência; se conflito, prevalece segurança.
5) Registro (opcional): LOG_BOARDROOM=true grava em `agent_logs` com categoria boardroom.

### Script
- `scripts/board_meeting_grok.js`
  - Embeddings: `@xenova/transformers` (bge-small-en-v1.5, 384d).
  - LLM primário: Grok (`GROK_API_KEY`, `GROK_MODEL=grok-beta`).
  - Fallback: Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`).
  - Flags: `TIMEOUT_MS`, `RETRY=2`, `LOG_BOARDROOM` (persistência), `METRIC_LOG_LLM` (custos/latência).

### Boas práticas
- Antes de rodar: garanta seeds aplicados (`npm run seed`) e RLS ativa.
- Limite contexto: só incluir diffs/commits relevantes.
- Evite PII/segredos no prompt.
- Revisar decisão: criar issue/PR vinculada para rastreabilidade.

### Comandos úteis
- `npm run board:meeting -- "Habilitar login magic link"`
- `npm run board:meeting -- "Ajustar probes ivfflat para recall"` (após autotune)





























