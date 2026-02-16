---
task: Security Regression Check
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*regression"
Entrada: |
  - baseline: Relatorio baseline para comparacao (default: last report)
  - scope: Escopo (full | code | deps)
Saida: |
  - new_findings: Vulnerabilidades NOVAS (nao existiam no baseline)
  - fixed_findings: Vulnerabilidades CORRIGIDAS (existiam, nao mais)
  - recurring: Vulnerabilidades RECORRENTES
  - gate: PASS (no new critical/high) | FAIL (new critical/high found)
Checklist:
  - "[ ] Carregar baseline (ultimo report)"
  - "[ ] Executar scan atual"
  - "[ ] Comparar findings: new vs fixed vs recurring"
  - "[ ] Determinar gate result"
  - "[ ] Reportar diferencas"
---

# *regression - Security Regression Check

Verificar se novas vulnerabilidades foram introduzidas comparando com baseline.

## Flow

```
1. Load baseline
   ├── Last security report (if saved)
   ├── Or run fresh baseline scan
   └── Extract findings list with hashes

2. Run current scan
   ├── Same scope as baseline
   ├── Collect current findings
   └── Hash each finding (file + pattern + line_context)

3. Compare
   ├── NEW: findings in current but NOT in baseline
   ├── FIXED: findings in baseline but NOT in current
   ├── RECURRING: findings in BOTH
   └── Calculate delta

4. Gate decision
   ├── Any NEW critical/high → FAIL (block release)
   ├── Only NEW medium/low → WARN
   ├── No new findings → PASS
   └── Fixed findings → positive metric

5. Report
   ├── Summary: +X new, -Y fixed, Z recurring
   ├── Detail NEW findings (highest priority)
   ├── Celebrate FIXED findings
   └── Track RECURRING (needs attention)
```
