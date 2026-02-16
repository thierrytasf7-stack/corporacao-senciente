# Security Gate: Dependencies

Gate de seguranca para dependencias npm.

## Checks

| # | Check | Threshold | Status |
|---|-------|-----------|--------|
| 1 | Zero critical vulnerabilities (npm audit) | 0 | [ ] |
| 2 | Zero high vulnerabilities | 0 | [ ] |
| 3 | Medium vulnerabilities dentro do limite | <= 5 | [ ] |
| 4 | package-lock.json integro | Hash match | [ ] |
| 5 | Nenhum pacote abandonado (>2yr sem update) | 0 critical deps | [ ] |
| 6 | Dependabot alerts resolvidos | 0 open | [ ] |
| 7 | Nenhuma licenca proibida (GPL em projeto MIT) | 0 | [ ] |
| 8 | Nenhuma dependencia com known supply chain attack | 0 | [ ] |

## Gate Decision

| Resultado | Acao |
|-----------|------|
| Todos checks passam | PASS - deps seguras |
| Apenas low/medium findings | WARN - track e fix no sprint |
| Qualquer critical/high CVE | FAIL - fix ou upgrade antes de deploy |
