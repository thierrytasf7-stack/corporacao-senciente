---
task: audit-manifest
responsavel: squad-evolver
checklist: manifest-checklist.md
elicit: false
---

# Auditoria de Manifest (squad.yaml)

## Objetivo
Validar o squad.yaml contra schema AIOS e verificar completude de todos os campos obrigatorios.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. File Check (2pts)
- [ ] `squad.yaml` existe na raiz da squad
- [ ] YAML e parseavel sem erros de sintaxe

### 2. Required Fields (5pts)
- [ ] `name`: presente, kebab-case, unico (2pts)
- [ ] `version`: presente, formato semver X.Y.Z (2pts)
- [ ] `description`: presente, > 20 caracteres, descritiva (1pt)

### 3. Metadata Fields (3pts)
- [ ] `author`: presente (1pt)
- [ ] `license`: presente (1pt)
- [ ] `slashPrefix`: presente, PascalCase (1pt)

### 4. AIOS Block (2pts)
- [ ] `aios.minVersion`: presente, semver valido (1pt)
- [ ] `aios.type`: valor e `squad` (1pt)

### 5. Components Block (2pts)
- [ ] `components.agents`: lista com pelo menos 1 agente (1pt)
- [ ] `components.tasks`: lista com pelo menos 1 task (1pt)

### 6. Tags (1pt)
- [ ] `tags`: lista com 3+ tags relevantes (1pt)

## Severity Guide
- **CRITICAL**: YAML invalido, name/version missing
- **HIGH**: description/author missing, components vazios
- **MEDIUM**: slashPrefix missing, tags < 3
- **LOW**: license missing, description curta

## Output
- Score: X/15
- Lista de checks passed/failed
- Findings com severity
