# GitKraken MCP – Guia de Uso (Contexto Git + IDE)

## Objetivo
Dar ao assistente/IDE contexto real de Git (commits, diffs, PRs, issues) de forma segura, usando o servidor GitKraken MCP já ativo.

## Comandos úteis (via chat/IDE)
- Status: “listar status do repo” → equivale a `git status`.
- Log: “últimos 5 commits com arquivos tocados”.
- Diff: “diff do último commit” ou “diff do arquivo X”.
- Blame: “blame da linha N do arquivo X”.
- PRs/Issues (se integrados no GitKraken): “listar PRs abertos”, “criar PR com título/descrição”.
- Branch/checkout (com confirmação): “criar branch feature/foo a partir de main” (só execute com confirmação).

## Boas práticas
- Sempre peça confirmação antes de comandos destrutivos (reset/revert).
- Use o MCP para trazer contexto antes de planejar (`@board_meeting`) e antes de debug (`@debug_vector`).
- Para mensagens de commit/PR, inclua referência a PRD/issue (ex.: `[PRD-A3]`, `[SEC]`, `[OBS]`).

## Integração com memória vetorial
- Pós-commit: script `npm run commit:log` captura `git show -1 --stat` e grava em Supabase (categoria `history` em `corporate_memory`).
- Boardroom: inclua no prompt os commits relevantes retornados pelo MCP para alimentar a decisão multiagente.

## Segurança
- Não exponha service_role em hooks do frontend; use apenas no backend/scripts locais.
- Deixe o MCP pedir confirmação para push/PR/merge.
































