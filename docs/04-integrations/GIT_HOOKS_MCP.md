## Git Hooks + MCP/GitKraken

### Objetivo
Automatizar registro vetorial de histórico e reforçar padrões de mensagem/issue, usando hooks locais e o servidor GitKraken MCP para contexto seguro.

### Hooks prontos
- `hooks/commit-msg.{ps1,sh}`: exige tag `[PRD-XYZ]`, `[SEC]`, `[OBS]`, `[TASK-123]` etc.
- `hooks/post-commit.{ps1,sh}`: roda `node scripts/commit_to_supabase.js` (salva `git show -1 --stat` em `corporate_memory` categoria history).
- `hooks/post-merge.{ps1,sh}`: pode rodar `commit_to_supabase` e atualizar changelog.

Instalação (bash):
```
cp hooks/commit-msg.sh .git/hooks/commit-msg && chmod +x .git/hooks/commit-msg
cp hooks/post-commit.sh .git/hooks/post-commit && chmod +x .git/hooks/post-commit
cp hooks/post-merge.sh .git/hooks/post-merge && chmod +x .git/hooks/post-merge
```
No Windows (pwsh), copie os `.ps1` equivalentes para `.git/hooks/`.

### Integração MCP (GitKraken)
- Use MCP para trazer contexto: status, últimos commits, diff de arquivo, blame.
- Antes de `@board_meeting`: peça via MCP “últimos 3 commits com arquivos tocados”.
- Ao abrir PR: inclua referência de issue/PRD e checklist de testes.

### Scripts relacionados
- Histórico multi-commit: `npm run ingest:history` (respeita `BLOCK_TEMPLATE_INGEST=true` no template).
- Diff/PR: `npm run ingest:summary -- --range "HEAD~1..HEAD"` ou apontando PR.
- QA vetorial: `npm run qa:sim`; alinhamento: `npm run check:align -- "pergunta"`.

### Requisitos de ambiente
- `.env` ou `env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_MODEL=Xenova/bge-small-en-v1.5`, `EMBEDDING_DIM=384`.
- Não expor `service_role` em frontend; uso local/backstage apenas.





























