---
task: Generate Documentation
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*generate"
Entrada: |
  - type: Tipo do doc (adr | guide | api | story | report)
  - title: Titulo do documento
  - context: Contexto adicional (feature, decisao, etc.)
Saida: |
  - doc_path: Caminho do documento gerado
  - doc_content: Conteudo gerado
Checklist:
  - "[ ] Determinar tipo de doc"
  - "[ ] Carregar template correto"
  - "[ ] Coletar informacoes necessarias"
  - "[ ] Gerar documento preenchido"
  - "[ ] Validar frontmatter"
  - "[ ] Salvar no path correto"
  - "[ ] Atualizar INDEX.md (se necessario)"
---

# *generate - Generate Documentation

Gera documentacao a partir de templates existentes.

## Templates Disponíveis

| Tipo | Template | Output Path |
|------|----------|-------------|
| ADR | docs-adr-tmpl.md | docs/architecture/adr/ADR-{NNN}-{title}.md |
| Guide | docs-guide-tmpl.md | docs/guides/{topic}.md |
| API | aios-doc-template.md (API section) | docs/api/{service}.md |
| Story | SMART_STORY_TEMPLATE.md | docs/stories/active/{type}_{id}.md |
| Report | report_template.md | docs/reports/{title}.md |

## Flow

```
1. Determine doc type
   ├── If specified → validate type
   └── If not → prompt user (numbered list)

2. Load appropriate template
   ├── ADR → squads/docs-generator/templates/docs-adr-tmpl.md
   ├── Guide → squads/docs-generator/templates/docs-guide-tmpl.md
   ├── API → .aios-core/development/templates/aios-doc-template.md
   ├── Story → docs/templates/SMART_STORY_TEMPLATE.md
   └── Report → docs/templates/report_template.md

3. Collect information
   ├── Title (required)
   ├── Context/description
   ├── Author (git config user.name)
   ├── Date (today)
   └── Type-specific fields

4. Generate document
   ├── Fill template variables
   ├── Add frontmatter (title, date, status, author)
   ├── Generate content sections
   └── Add placeholder TODOs for incomplete sections

5. Save and register
   ├── Save to correct path
   ├── Update INDEX.md reference (if applicable)
   └── Display success with file path
```
