# Task: CEO-ZERO Execute Story

## Metadata
- **task_id:** ceo-zero-execute-story
- **agent:** ceo-zero
- **type:** orchestration
- **elicit:** true

## Description

Executa uma story completa decompondo em tasks e roteando cada uma para o executor otimo.

## Steps

### Step 1: Load Story

Ler story de `docs/stories/active/` ou path fornecido pelo usuario.
Extrair:
- Titulo e descricao
- Acceptance criteria
- Tasks/checklist items
- Fibonacci complexity (se disponivel)

### Step 2: Decompose Tasks

Para cada item do checklist da story, classificar:
- Complexidade individual
- Tipo (implement, test, docs, etc)
- Dependencias entre tasks

### Step 3: Plan Execution

Criar execution plan:
```
Story: {titulo}
├── Task 1: {desc} → Agent Zero (complexity: 2, type: implement)
├── Task 2: {desc} → Agent Zero (complexity: 1, type: test)
├── Task 3: {desc} → AIOS @qa (complexity: 5, type: review)
└── Task 4: {desc} → AIOS @devops (type: deploy)
```

Apresentar plan ao usuario para aprovacao.

### Step 4: Execute Plan

Executar tasks na ordem de dependencias:
1. Tasks independentes em paralelo (batch no Agent Zero)
2. Tasks dependentes em sequencia
3. Review sempre apos implementation
4. Deploy sempre por ultimo

Para cada task, usar *delegate protocol.

### Step 5: Consolidate

- Verificar todos os acceptance criteria atendidos
- Calcular economia total da story
- Atualizar checkboxes da story
- Reportar resultado

## Output Format

```
⚡ Story Execution Complete
├── Tasks: {total} ({zero_count} Agent Zero / {aios_count} AIOS)
├── Quality: {avg_score}/10
├── Time: {total_time}
├── Cost: ${aios_cost} (saved ${savings} vs all-Opus)
└── Status: {PASS|PARTIAL|FAIL}
```
