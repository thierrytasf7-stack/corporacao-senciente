# Hooks Git (padrão)

## post-commit (sugerido)
Templates prontos:
- `hooks/post-commit.ps1` (Windows/pwsh)
- `hooks/post-commit.sh` (bash)

Use copiando para `.git/hooks/post-commit` e ajustando permissão (chmod +x no bash).

Função: roda `node scripts/commit_to_supabase.js` para registrar o último commit no Supabase (categoria history). Opcional: rodar `npm run seed` se mexer em seeds/PRDs.

## post-merge (opcional)
- Atualizar `docs/CHANGELOG.md`.
- Rodar `node scripts/commit_to_supabase.js` para registrar resumo do merge.

## commit-msg (opcional, recomendada)
Templates:
- `hooks/commit-msg.ps1` (pwsh)
- `hooks/commit-msg.sh` (bash)

Valida que a mensagem de commit contém uma tag de referência `[PRD-XYZ]` ou `[SEC]/[OBS]/[TASK-123]/[ISSUE-123]`. Copie para `.git/hooks/commit-msg` e (bash) `chmod +x`.

## Notas
- Necessário `.env` ou `env.local` com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
- O script registra apenas o último commit (`git show -1 --stat`) na categoria `history`.
- Para ingestão histórica (multi-commit): `npm run ingest:history` (usa env INGEST_COMMITS, padrão 20).
- Em repositório template ("Coorporacao autonoma"), não rodar ingestão histórica. Ao clonar para um MVP real, execute `npm run ingest:history` para indexar o histórico do novo projeto.

