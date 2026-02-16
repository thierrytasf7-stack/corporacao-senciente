---
task: audit-workflows-integrity
responsavel: squad-evolver
checklist: null
elicit: false
---

# Auditoria de Integridade dos Workflows

## Objetivo
Validar que workflows sao YAML validos, formam DAG sem ciclos, e referenciam tasks existentes.

## Input
- `{squad}` - Nome da squad

## Procedimento

### 1. YAML Validity (2pts)
Para cada workflow listado em squad.yaml components.workflows:
- [ ] Arquivo existe em `workflows/` (1pt)
- [ ] YAML parseable sem erros de sintaxe (1pt)

### 2. Task References (3pts)
Para cada `step` no workflow:
- [ ] O campo `task` referencia uma task que existe em `tasks/` (3pts)
- Penalidade: -1pt por referencia quebrada (min 0)

### 3. DAG Validation (2pts)
Verificar que `depends_on` forma um grafo aciclico dirigido:
1. Construir grafo de dependencias
2. Executar deteccao de ciclos (DFS ou topological sort)
- [ ] Zero ciclos detectados (2pts)
- Se ciclo: 0pts + CRITICAL finding

### 4. Input/Output (1pt)
- [ ] Workflow tem secao `input:` com parametros documentados (0.5pt)
- [ ] Workflow tem secao `output:` com deliverables documentados (0.5pt)

### 5. Flow Coverage (2pts)
- [ ] Workflow cobre o fluxo principal da squad (audit completo) (1pt)
- [ ] Todos os steps tem `id` e `phase` (1pt)

## Anti-Patterns a Detectar
- Steps sem depends_on (exceto o primeiro)
- Steps com depends_on apontando para id inexistente
- Workflow com step unico (deveria ser task, nao workflow)
- Steps duplicados

## Output
- Score: X/10
- DAG visualization (text-based)
- Broken references list
- Findings com severity
