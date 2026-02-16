# Docs Gate: Quality

Gate de qualidade para documentacao.

## Checks

| # | Check | Threshold | Status |
|---|-------|-----------|--------|
| 1 | Zero broken internal links | 0 | [ ] |
| 2 | Todos os docs tem titulo (H1 ou frontmatter) | 100% | [ ] |
| 3 | Docs modificados <90 dias | >= 70% | [ ] |
| 4 | Code blocks tem language tag | >= 90% | [ ] |
| 5 | Heading hierarchy consistente (sem skip) | >= 95% | [ ] |
| 6 | INDEX.md atualizado (<7 dias) | Yes | [ ] |
| 7 | Nenhum doc orphaned (sem referencia) | 0 | [ ] |
| 8 | CHANGELOG.md atualizado para release atual | Yes | [ ] |

## Gate Decision

| Resultado | Acao |
|-----------|------|
| Todos checks passam | PASS - docs com qualidade |
| 1-2 issues menores | WARN - fix no proximo sprint |
| Broken links ou stale content | FAIL - fix antes de release |
