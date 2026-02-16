---
task: version-squad
responsavel: squad-evolver
checklist: evolution-tracking-checklist.md
elicit: false
---

# Versionamento de Squad

## Objetivo
Bump de versao semantica na squad com registro de evolucao no squad.yaml e changelog.

## Input
- `{squad}` - Nome da squad
- `{bump_type}` - major | minor | patch | auto

## Procedimento

### 1. Determine Bump Type
Se `auto`:
- Mudancas estruturais (novos agents, tasks removidas) -> MINOR
- Correcoes de conteudo, fixes -> PATCH
- Breaking changes (rename, restructure completa) -> MAJOR

### 2. Calculate New Version
Current: X.Y.Z
- major: X+1.0.0
- minor: X.Y+1.0
- patch: X.Y.Z+1

### 3. Update squad.yaml
Atualizar o campo `version:` no squad.yaml

### 4. Inject Evolution Header
Adicionar ou atualizar bloco de evolucao no squad.yaml:

```yaml
# Evolution Tracking (managed by squad-evolver)
evolution:
  current_version: "X.Y.Z"
  quality_score: {score}
  rating: "{rating}"
  last_audit: "{ISO-date}"
  auditor: "squad-evolver (Prism)"
  lineage:
    - version: "1.0.0"
      score: 72
      rating: "C"
      date: "2026-02-13"
    - version: "1.1.0"
      score: 85
      rating: "A"
      date: "2026-02-14"
```

### 5. Append Changelog
Criar/atualizar `data/changelogs/{squad-name}.changelog.md`:

```markdown
## [{version}] - {date}

**Quality Score:** {before} -> {after} ({delta})
**Rating:** {before_rating} -> {after_rating}
**Auditor:** squad-evolver (Prism)

### Changes
- [{severity}] {descricao do finding corrigido}
- [{severity}] {descricao}

### Dimension Breakdown
| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
| Manifest  | 12/15  | 15/15 | +3    |
| ...       | ...    | ...   | ...   |
```

### 6. Zero Regression Check
- [ ] Novo score >= score anterior
- Se regressao detectada -> ABORTAR version bump
- Registrar warning e listar dimensoes que regrediram

## Output
- Version: {old} -> {new}
- Changelog entry criada
- Evolution header atualizado
