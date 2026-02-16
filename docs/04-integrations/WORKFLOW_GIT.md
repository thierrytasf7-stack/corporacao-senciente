# Workflow Git + MCP + Vetores

## Objetivo
Padronizar uso de Git com GitKraken MCP e alimentação da memória vetorial (Supabase) para histórico/decisão.

## Hooks sugeridos
- `post-commit`: roda `npm run commit:log` (grava resumo do commit em Supabase, categoria history) e, opcionalmente, `npm run seed` se mexer em seeds/PRDs.
- `post-merge`: atualizar `docs/CHANGELOG.md` e registrar resumo vetorial do merge (pode reusar `commit:log`).

## Passo a passo operacional
1) Antes de codar: usar GitKraken MCP para ver commits/PRs/issues relacionados.
2) Planejar (`@board_meeting`): incluir contexto de commits/diffs fornecido pelo MCP.
3) Codar e commitar com mensagem contendo PRD/issue (ex.: `[PRD-B5] cache ponderado`).
4) Pós-commit: `npm run commit:log` (hook opcional) grava resumo vetorial no Supabase.
5) PR: use GitKraken MCP para gerar descrição com diffs reais.
6) Merge: atualizar changelog e, se possível, registrar embedding do merge.
7) Histórico inicial: se for um novo projeto clonado deste template, rode `npm run ingest:history` (defina `INGEST_COMMITS`) para indexar commits reais do MVP; não rode no repo template.
8) Diffs/PRs: para indexar um diff específico, use `npm run ingest:diff -- HEAD~1..HEAD` (ou outro range). Útil para PRs ou merges específicos.
9) Resumo de PR/diff: `npm run ingest:summary -- HEAD~1..HEAD` grava resumo + arquivos tocados em `corporate_memory` para busca futura.

## Customização por projeto
- Ajuste caminhos/arquivos de seeds ou PRDs que devem disparar `npm run seed`.
- Se quiser impedir gravação automática, deixe o hook só com `commit:log` e rode `seed` manualmente.

## Estrutura de memória
- `corporate_memory` categoria `history`: resumos de commits/merges.
- `agent_logs`: pode receber logs de boardroom (ativar no script se quiser).
- `task_context`: continua para PRDs/issues vetorizados.

