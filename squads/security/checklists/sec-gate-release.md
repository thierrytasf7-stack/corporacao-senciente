# Security Gate: Release

Gate final de seguranca para release. Consolida todos os gates.

## Pre-conditions

- [ ] Code security gate: PASS
- [ ] Dependencies gate: PASS
- [ ] API security gate: PASS (ou WARN com tracking)
- [ ] Secret scan: CLEAN (zero secrets no codigo)

## Final Checks

| # | Check | Status |
|---|-------|--------|
| 1 | SAST scan limpo (zero critical/high) | [ ] |
| 2 | npm audit limpo (zero critical/high) | [ ] |
| 3 | Secret scan limpo (zero findings) | [ ] |
| 4 | API security score >= 80 | [ ] |
| 5 | Security headers corretos | [ ] |
| 6 | No new security regressions vs baseline | [ ] |
| 7 | Dependabot alerts resolvidos | [ ] |
| 8 | .env files nao commitados | [ ] |
| 9 | .gitignore inclui patterns de segredos | [ ] |
| 10 | Threat model atualizado (se feature nova) | [ ] |

## Gate Decision

| Resultado | Acao |
|-----------|------|
| Todos PASS | RELEASE AUTORIZADO |
| 1-2 WARN (medium/low) | Release com tracking |
| Qualquer FAIL | BLOQUEADO - resolver antes de release |

## Sign-off

```
Security Engineer: _____________ Data: ___/___/______
Gate Result: [ ] PASS  [ ] WARN  [ ] FAIL
Notas: _______________________________________________
```
