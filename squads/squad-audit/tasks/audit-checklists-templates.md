---
task: audit-checklists-templates
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Checklists e Templates

## Objetivo
Verificar que checklists e templates referenciados existem em disco e tem conteudo adequado.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Checklists Existence (3pts)
Para cada checklist em squad.yaml components.checklists:
- [ ] Arquivo existe em `checklists/` (3pts)
- Penalidade: -1pt por checklist missing (min 0)

### 2. Templates Existence (3pts)
Para cada template em squad.yaml components.templates:
- [ ] Arquivo existe em `templates/` (3pts)
- Penalidade: -1pt por template missing (min 0)

### 3. Checklist Quality (2pts)
Para cada checklist existente:
- [ ] Tem items concretos em formato checkbox `- [ ]` (1pt)
- [ ] Items sao especificos e verificaveis (nao genericos) (1pt)

### 4. Template Quality (2pts)
Para cada template existente:
- [ ] Tem placeholders marcados `{variable}` ou `{{variable}}` (1pt)
- [ ] Template e usavel como base (tem estrutura, nao esta vazio) (1pt)

### Cross-Check
- Verificar que checklists referenciados em task frontmatter (`checklist:` field) existem
- Verificar que templates usados em tasks/workflows existem

## Output
- Score: X/10
- Table: Component -> Type -> Status (EXISTS/MISSING)
- Quality assessment per checklist/template
- Findings com severity
