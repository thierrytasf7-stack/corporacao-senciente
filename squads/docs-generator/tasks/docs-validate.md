---
task: Validate Documentation
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*validate"
Entrada: |
  - scope: Escopo (full | path) default: docs/
  - checks: Checks a executar (links | metadata | freshness | all) default: all
Saida: |
  - findings: Lista de problemas encontrados
  - metrics: Metricas de qualidade
  - gate: PASS | WARN | FAIL
Checklist:
  - "[ ] Verificar broken links internos"
  - "[ ] Verificar frontmatter obrigatorio"
  - "[ ] Verificar freshness (<90 days)"
  - "[ ] Verificar formatacao (headers, code blocks)"
  - "[ ] Verificar orphaned docs"
  - "[ ] Gerar relatorio de qualidade"
---

# *validate - Validate Documentation

Valida qualidade dos docs: links, metadata, freshness, formatting.

## Checks

### 1. Broken Links
```
- Internal links: [text](./relative/path.md) → file exists?
- Anchor links: [text](#section) → heading exists?
- Image references: ![alt](./img/path.png) → file exists?
- External links: [text](https://...) → optional HTTP check
```

### 2. Frontmatter
```
Required fields:
  - title (or H1 heading)
  - date (ISO 8601 or readable)
  - status (draft | published | deprecated)

Optional but recommended:
  - author
  - category
  - tags
```

### 3. Freshness
```
- Files not modified in >90 days → STALE
- Files not modified in >180 days → VERY STALE
- Files not modified in >365 days → CONSIDER ARCHIVING
```

### 4. Formatting
```
- H1 used only once per file
- Code blocks have language tag (```js, ```bash)
- Tables properly formatted
- No trailing whitespace in headers
- Consistent heading hierarchy (no H1→H3 skip)
```

### 5. Orphaned Docs
```
- Files not referenced from INDEX.md
- Files not linked from any other doc
- Files in _archive/ that shouldn't be
```

## Gate Decision

| Condition | Result |
|-----------|--------|
| 0 broken links, all metadata OK | PASS |
| <5 minor issues (formatting) | WARN |
| Broken links or missing metadata | FAIL |
