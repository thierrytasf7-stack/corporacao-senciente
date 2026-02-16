# Boardroom MCP com Grok + Xenova (Nível 9)

> Nota: o schema atual usa embeddings 384d (Xenova bge-small-en-v1.5). Ajuste `EMBEDDING_DIM=384` e reexecute seeds/migrations se vier de versão 768d.

Conceito: agentes dissociados via MCP, Grok para opiniões divergentes, Xenova para vetores locais (Supabase pgvector).

Fluxo resumido
1) Trigger `@board_meeting`.
2) MCP chama em paralelo:
   - Arquiteto (Grok, temp ~0.15): foco em segurança/arquitetura.
   - Produto (Grok, temp ~0.85): foco em UX/inovação.
   - Memória: `match_corporate_memory` e `match_task_context` via embedding Xenova (768d).
3) Síntese (CEO) no Grok: harmoniza, gera decisão e plano curto.

Script incluído
- `scripts/board_meeting_grok.js`
  - Usa `@xenova/transformers` para embedding (bge-small-en-v1.5, 768d).
  - Chama Grok em `https://api.x.ai/v1/chat/completions`.
  - Consulta Supabase RPC `match_*`.
  - Saída: opiniões separadas + síntese final; loga tempo total; retries e timeout via env.
  - Sugestão futura: logar síntese em `agent_logs` com tag boardroom (ciclo 2).
  - Modo dry-run: basta não ativar gravação (default). Para persistir, descomente bloco no script.

Ambiente
- `.env`: `GROK_API_KEY`, `GROK_MODEL=grok-beta`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MCP_EMBEDDING_MODEL=Xenova/bge-small-en-v1.5`, `EMBEDDING_DIM=768`.

Uso rápido
- `npm run board:meeting -- "Implementar login social sem senha"`
- Pré-requisitos: schema aplicado com vector(768), seeds carregados.

Racional
- Evita “câmara de eco” (agentes separados).
- Grok traz criatividade/caos; Xenova garante custo zero para vetores.
- Memória Supabase garante precedentes e alinhamento à Alma.

