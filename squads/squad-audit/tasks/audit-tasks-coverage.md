---
task: audit-tasks-coverage
responsavel: squad-evolver
checklist: tasks-coverage-checklist.md
elicit: false
---

# Auditoria de Cobertura de Tasks

## Objetivo
Verificar que cada command dos agentes tem task correspondente, sem orphans nem phantoms.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. Command-Task Mapping (5pts)
Para cada agente da squad:
1. Extrair lista de `commands` do YAML do agente
2. Extrair lista de `dependencies.tasks` do YAML do agente
3. Para cada command principal (excluindo help/exit):
   - [ ] Existe task correspondente em dependencies.tasks
   - [ ] O file da task existe em `tasks/`

Score: (commands com task / total commands principais) * 5

### 2. Orphan Detection (3pts)
Tasks que existem em disco mas NAO sao referenciadas:
1. Listar todos `.md` files em `tasks/`
2. Cruzar com `components.tasks` do squad.yaml
3. Cruzar com `dependencies.tasks` de cada agente
- [ ] Zero tasks orfas (files em disco sem referencia) = 3pts
- Penalidade: -1pt por task orfa (min 0)

### 3. Phantom Detection (3pts)
Tasks referenciadas mas que NAO existem em disco:
1. Listar todas tasks em `components.tasks` do squad.yaml
2. Verificar se cada uma existe em `tasks/`
- [ ] Zero tasks fantasma (referenciadas mas inexistentes) = 3pts
- Penalidade: -1pt por task fantasma (min 0)

### 4. Task Frontmatter (2pts)
Para cada task existente:
- [ ] Tem frontmatter YAML com `task:` field (0.5pt)
- [ ] Tem `responsavel:` apontando para agente valido (0.5pt)
- [ ] Tem `checklist:` referenciando checklist ou null (0.5pt)
- [ ] Tem `elicit:` field (0.5pt)

### 5. Task Quality (2pts)
- [ ] Tasks tem procedimento detalhado (nao apenas titulo) (1pt)
- [ ] Tasks tem secao Output descrevendo deliverable (1pt)

## Output
- Score: X/15
- Mapping table: Command -> Task -> Status (OK/ORPHAN/PHANTOM)
- Lista de orphans e phantoms
- Findings com severity
