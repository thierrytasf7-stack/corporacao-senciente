---
task: Generate Changelog
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*changelog"
Entrada: |
  - since: Desde quando (tag, commit, date) default: last tag
  - format: Formato (keep-a-changelog | simple) default: keep-a-changelog
Saida: |
  - changelog: Changelog gerado
  - stats: Commits por categoria
Checklist:
  - "[ ] Determinar range de commits"
  - "[ ] Parsear conventional commits"
  - "[ ] Agrupar por categoria"
  - "[ ] Gerar changelog formatado"
  - "[ ] Atualizar CHANGELOG.md"
---

# *changelog - Generate Changelog

Gera changelog a partir de git history usando conventional commits.

## Flow

```
1. Determine commit range
   ├── If --since tag → from tag to HEAD
   ├── If --since date → from date to HEAD
   ├── If --since commit → from commit to HEAD
   └── Default: last tag to HEAD (or last 50 commits)

2. Parse commits
   ├── Extract conventional commit prefix (feat/fix/docs/etc)
   ├── Extract scope (agents, cli, dashboard, etc)
   ├── Extract description
   ├── Extract breaking changes (BREAKING CHANGE:)
   └── Group by category

3. Generate changelog
   ├── Format: Keep a Changelog (keepachangelog.com)
   ├── Categories: Added, Changed, Deprecated, Removed, Fixed, Security
   ├── Map: feat→Added, fix→Fixed, docs→Changed, refactor→Changed
   ├── Breaking changes highlighted
   └── Date and version header

4. Output
   ├── Prepend to existing CHANGELOG.md
   ├── Or display in terminal
   └── Show stats (commits per category)
```

## Category Mapping

| Commit Prefix | Changelog Category |
|---------------|-------------------|
| feat | Added |
| fix | Fixed |
| docs | Changed (Documentation) |
| refactor | Changed |
| test | Changed (Tests) |
| chore | Changed (Maintenance) |
| BREAKING CHANGE | Removed/Changed (highlighted) |
| security | Security |
