# Story: [NOME_DA_STORY]

**Status:** [TODO | IN_PROGRESS | AI_REVIEW | HUMAN_REVIEW | PR_CREATED | DONE | ERROR]
**Squad Responsável:** [NOME_DO_SQUAD]
**Squad Repository:** [DIREÇÃO_DO_REPOSITÓRIO_OU_PASTA]
**Força de Trabalho:** [AGENTE_ÚNICO | SQUAD_COMPLETO | MULTI_AGENTES]
**Dificuldade:** [EASY (Direct) | MEDIUM (Structured) | HARD (Chain of Thought)]
**Priority:** [LOW | MEDIUM | HIGH]

## 🎯 Objetivo
[Descrição clara do objetivo final]

## ✅ Critérios de Aceitação (DoD)
- [ ] [Critério 1]
- [ ] [Critério 2]

---

## 🤖 Aider Prompt (Instruction & Role-Play)
> **CONTEXTO PARA O TRABALHADOR:**
```text
ADOPT ROLE: [Atuar como o Squad/Agente X conforme definido acima].
LOCATION: Use files within [SQUAD_REPOSITORY].
THINKING_MODE: [IF HARD: "Think step by step and analyze all side effects before coding" | ELSE: "Be direct and efficient"].

TASK:
1. [Ação 1]
2. [Ação 2]

STANDARD: AIOS Technical Specification v2
```

## 🛡️ AI Review Prompt (QA & Validation)
> **CRITÉRIOS DE QUALIDADE:**
```text
1. No linter errors (npm run lint)
2. Unit tests passing (npm test)
3. Role consistency (Check if the code follows the squad's specific patterns)
```

## 🚀 PR Prompt (Documentation)
> **DOCUMENTAÇÃO FINAL:**
```text
feat([escopo]): [descrição resumida]
- Squad: [NOME_DO_SQUAD]
- Impact: [Baixo | Médio | Alto]
```