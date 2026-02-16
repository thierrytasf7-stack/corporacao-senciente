---
task: Regenerate Documentation Index
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*index"
Entrada: |
  - scope: Escopo (full | category) default: full
Saida: |
  - index_path: docs/INDEX.md
  - sections_count: Total de secoes indexadas
Checklist:
  - "[ ] Scan todos os .md files em docs/"
  - "[ ] Extrair titulo (H1 ou frontmatter title)"
  - "[ ] Agrupar por diretorio/categoria"
  - "[ ] Gerar INDEX.md formatado"
  - "[ ] Incluir timestamp de geracao"
---

# *index - Regenerate Documentation Index

Regenera docs/INDEX.md escaneando toda a arvore docs/.

## Flow

```
1. Scan docs/ recursively
   ├── Find all *.md files
   ├── Exclude: _archive/, node_modules/
   └── Extract path relative to docs/

2. For each file, extract:
   ├── Title (first H1, or frontmatter title)
   ├── Category (parent directory)
   ├── Last modified date
   └── Status (from frontmatter if available)

3. Group by category
   ├── Sort categories alphabetically
   ├── Sort files within category by title
   └── Build hierarchy

4. Generate INDEX.md
   ├── Header with generation timestamp
   ├── Table of contents
   ├── For each category: heading + file list
   ├── Stats summary at bottom
   └── Replace existing INDEX.md

5. Report
   ├── Total files indexed
   ├── Categories found
   ├── New files since last index
   └── Removed files since last index
```

## Existing INDEX.md

- Path: `docs/INDEX.md`
- Last generated: 2025-12-24
- Sections: 252
- Needs refresh (2+ months old)
