---
task: Create Development Story
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*story"
Entrada: |
  - title: Titulo da story
  - type: Tipo (feature | fix | optimization | refactor | security)
  - description: Descricao do que precisa ser feito
Saida: |
  - story_path: Caminho da story gerada
Checklist:
  - "[ ] Determinar tipo da story"
  - "[ ] Carregar SMART_STORY_TEMPLATE.md"
  - "[ ] Preencher com informacoes fornecidas"
  - "[ ] Gerar acceptance criteria"
  - "[ ] Salvar em docs/stories/active/"
---

# *story - Create Development Story

Cria story de desenvolvimento usando SMART_STORY_TEMPLATE.md.

## Flow

```
1. Collect story info
   ├── Title
   ├── Type: feature | fix | optimization | refactor | security
   ├── Description
   ├── Acceptance criteria
   └── Estimated complexity (S/M/L/XL)

2. Load template
   └── docs/templates/SMART_STORY_TEMPLATE.md

3. Generate story
   ├── Fill template variables
   ├── Generate timestamp-based filename
   ├── Add acceptance criteria as checklist
   └── Add context sections

4. Save
   ├── Path: docs/stories/active/{type}_{timestamp}_{id}.md
   └── Display path
```

## Naming Convention

Pattern: `{type}_genesis_{YYYYMMDDHHMMSS}_{id}.md`

Follows existing pattern from Genesis Observer stories.
