---
template: squad-templates
id: squad-templates
name: Squad Templates
description: Templates para criação de squads
version: 1.0.0
---

# Squad Templates

Templates para criação de squads no AIOS.

## Available Templates

### Basic Template

**Template:** `basic-template.md`

**Description:** Estrutura mínima para squads simples.

**Components:**
- 1 agent
- 1 task
- Configuração básica

### ETL Template

**Template:** `etl-template.md`

**Description:** Template para processamento de dados.

**Components:**
- 2 agents
- 3 tasks
- Scripts de utilidade

### Agent-Only Template

**Template:** `agent-only-template.md`

**Description:** Template apenas com agentes.

**Components:**
- 2 agents
- Sem tasks
- Configuração mínima

### Sector Template

**Template:** `sector-template.md`

**Description:** Template para squads setoriais.

**Components:**
- Agentes específicos do setor
- Tasks setoriais
- Integração com Aider

## Template Structure

### squad.yaml Template

```yaml
name: {{SQUAD_NAME}}
version: 1.0.0
description: {{DESCRIPTION}}
author: {{AUTHOR}}
license: {{LICENSE}}
slashPrefix: {{SLASH_PREFIX}}

aios:
  minVersion: "2.1.0"
  type: squad

components:
  tasks: []
  agents: []
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

config:
  extends: {{CONFIG_MODE}}
  coding-standards: {{CODING_STANDARDS}}
  tech-stack: {{TECH_STACK}}
  source-tree: {{SOURCE_TREE}}

dependencies:
  node: []
  python: []
  squads: []

tags:
  - {{TAGS}}
```

### Agent Template

```yaml
---
agent:
  name: {{AGENT_NAME}}
  id: {{AGENT_ID}}
  title: {{AGENT_TITLE}}
  icon: "🤖"
  whenToUse: "{{WHEN_TO_USE}}"

persona:
  role: {{ROLE}}
  style: {{STYLE}}
  focus: {{FOCUS}}

commands:
  - name: help
    description: "Show available commands"
  - name: {{COMMAND_NAME}}
    description: "{{COMMAND_DESCRIPTION}}"
    task: {{TASK_FILE}}
---
```

### Task Template

```yaml
---
task: {{TASK_NAME}}
responsavel: "@{{AGENT_ID}}"
responsavel_type: Agent
atomic_layer: task
Entrada: |
  - campo: {{INPUT_PARAM}}
    tipo: {{INPUT_TYPE}}
    origem: {{INPUT_SOURCE}}
    obrigatorio: {{INPUT_REQUIRED}}
    validacao: "{{INPUT_VALIDATION}}"
Saida: |
  - campo: {{OUTPUT_PARAM}}
    tipo: {{OUTPUT_TYPE}}
    destino: {{OUTPUT_DESTINATION}}
    persistido: {{OUTPUT_PERSISTED}}
Checklist:
  - "[ ] {{CHECKLIST_ITEM}}"
---

# {{TASK_NAME}}

## Description

{{TASK_DESCRIPTION}}

## Execution Steps

### Step 1: Initialize

```javascript
// Implementation here
```

### Step 2: Process

```javascript
// Implementation here
```

### Step 3: Complete

```javascript
// Implementation here
```

## Error Handling

```yaml
error: {{ERROR_CODE}}
cause: {{ERROR_CAUSE}}
resolution: {{ERROR_RESOLUTION}}
```

## Metadata

```yaml
story: {{STORY_ID}}
version: 1.0.0
created: {{CREATED_DATE}}
author: {{AUTHOR}}
```
