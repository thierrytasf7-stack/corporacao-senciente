---
name: workflow-composer
description: Compõe workflows AIOS combinando agents, tasks e skills.
  Ativa quando o usuário quer criar um workflow multi-step,
  orquestrar agents, ou automatizar processos complexos.
---

# Workflow Composer — Compositor de Workflows AIOS

## O que é um Workflow AIOS
Um workflow é uma sequência de steps executados por diferentes agents, cada step com inputs, outputs e condições. Definido em YAML.

## Estrutura de Workflow

```yaml
workflow:
  id: meu-workflow
  name: Nome Descritivo
  version: "1.0"
  description: O que este workflow faz

  # Agents envolvidos
  agents:
    - id: analyst
      role: Pesquisa inicial
    - id: architect
      role: Design da solução
    - id: dev
      role: Implementação
    - id: qa
      role: Validação

  # Steps sequenciais
  steps:
    - id: research
      agent: analyst
      task: analyze-market
      inputs:
        topic: "{{ workflow.params.topic }}"
      outputs:
        - research_report

    - id: design
      agent: architect
      task: create-architecture
      depends_on: [research]
      inputs:
        research: "{{ steps.research.outputs.research_report }}"
      outputs:
        - architecture_doc

    - id: implement
      agent: dev
      task: implement-feature
      depends_on: [design]
      inputs:
        spec: "{{ steps.design.outputs.architecture_doc }}"

    - id: validate
      agent: qa
      task: run-quality-gates
      depends_on: [implement]
```

## Workflows Existentes no AIOS
| Workflow | Propósito |
|----------|-----------|
| `greenfield-fullstack` | Projeto novo do zero |
| `brownfield-fullstack` | Melhorias em projeto existente |
| `brownfield-discovery` | Descoberta e análise de codebase |
| `story-development-cycle` | Ciclo completo de story |
| `design-system-build-quality` | Design system com qualidade |

## Combinando com Skills
Skills podem ser referenciadas em steps para dar contexto extra:
```yaml
steps:
  - id: review
    agent: qa
    task: code-review
    skills: [code-review-aios]  # Skill carregada como contexto
```

## Modos de Execução
1. **Guided** (`--mode=guided`) — Claude troca de persona a cada step
2. **Engine** (`--mode=engine`) — Spawna subagents reais (experimental)

## Regras
- Sempre defina `depends_on` para steps que precisam de output anterior
- Cada step deve ter outputs claros
- Use `{{ }}` para interpolação de variáveis
- Workflows vivem em `.aios-core/development/workflows/`
