---
task: audit-cross-references
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Cross-References

## Objetivo
Verificar que TODOS os componentes listados em squad.yaml existem fisicamente em disco, e vice-versa.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Agents Cross-Ref (3pts)
- [ ] Todos agents em `components.agents` existem em `agents/` (1.5pts)
- [ ] Todos `.md` files em `agents/` estao listados em `components.agents` (1.5pts)

### 2. Tasks Cross-Ref (3pts)
- [ ] Todos tasks em `components.tasks` existem em `tasks/` (1.5pts)
- [ ] Todos `.md` files em `tasks/` estao listados em `components.tasks` (1.5pts)

### 3. Workflows Cross-Ref (2pts)
- [ ] Todos workflows em `components.workflows` existem em `workflows/` (1pt)
- [ ] Todos `.yaml` files em `workflows/` estao listados em `components.workflows` (1pt)

### 4. Checklists & Templates Cross-Ref (2pts)
- [ ] Todos checklists em `components.checklists` existem em `checklists/` (0.5pt)
- [ ] Todos `.md` files em `checklists/` estao listados em `components.checklists` (0.5pt)
- [ ] Todos templates em `components.templates` existem em `templates/` (0.5pt)
- [ ] Todos files em `templates/` estao listados em `components.templates` (0.5pt)

### Cross-Ref Table
Gerar tabela consolidada:

```
| Component Type | In Manifest | On Disk | Match |
|---------------|-------------|---------|-------|
| agents        | 1           | 1       | ✓     |
| tasks         | 13          | 13      | ✓     |
| workflows     | 1           | 1       | ✓     |
| checklists    | 4           | 4       | ✓     |
| templates     | 3           | 3       | ✓     |
```

### Discrepancy Types
- **PHANTOM**: Listado em manifest mas nao existe em disco
- **ORPHAN**: Existe em disco mas nao listado em manifest
- Ambos sao findings (PHANTOM = HIGH, ORPHAN = MEDIUM)

## Output
- Score: X/10
- Cross-reference table
- Lista de phantoms e orphans por tipo
- Findings com severity
