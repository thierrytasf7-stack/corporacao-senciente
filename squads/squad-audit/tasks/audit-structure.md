---
task: audit-structure
responsavel: squad-evolver
checklist: structure-checklist.md
elicit: false
---

# Auditoria de Estrutura de Diretorios

## Objetivo
Validar que a squad segue a estrutura padrao AIOS com todos os diretorios obrigatorios e opcionais corretos.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Root Files (4pts)
- [ ] `squad.yaml` existe na raiz (2pts)
- [ ] `README.md` existe na raiz (2pts)

### 2. Required Directories (4pts)
- [ ] `agents/` existe com pelo menos 1 `.md` file (2pts)
- [ ] `tasks/` existe com pelo menos 1 `.md` file (2pts)

### 3. Optional Directories (2pts)
Verificar se diretorios referenciados em squad.yaml existem:
- [ ] `workflows/` se workflows listados em components (0.5pt)
- [ ] `checklists/` se checklists listados em components (0.5pt)
- [ ] `templates/` se templates listados em components (0.5pt)
- [ ] `config/`, `data/`, `scripts/`, `tools/` se usados (0.5pt)

### 4. Naming Convention
- Todos os files usam kebab-case
- Extensoes corretas (.md para agents/tasks, .yaml para workflows)
- Sem files orfaos na raiz (exceto squad.yaml e README.md)

### 5. Anti-Patterns
- [ ] Sem diretorios vazios referenciados em squad.yaml
- [ ] Sem files duplicados
- [ ] Sem arquivos temporarios (.tmp, .bak, ~)

## Output
- Score: X/10
- Lista de checks passed/failed
- Findings com severity
