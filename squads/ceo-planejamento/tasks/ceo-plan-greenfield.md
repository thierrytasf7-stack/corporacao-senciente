# Task: Orchestrate Full Planning (Auto-detect mode)

## Metadata
- agent: ceo-planejamento
- trigger: `*plan` or `*plan-greenfield`
- elicit: true
- mode: auto-detect (blitz/standard/comprehensive)

## Execution Steps

### Step 1: Understand the Request
Ask the user (if not already clear):
```
O que voce quer construir? Descreva em 1-3 frases.
Contexto adicional (se houver): projeto existente? publico-alvo? deadline?
```

### Step 2: Classify & Select Mode
Analyze the request and classify:

| Signal | Mode | Phases |
|--------|------|--------|
| Novo projeto, app, sistema | **Comprehensive** | All 6 phases |
| Nova feature, modulo, integracao | **Standard** | 5-6 phases |
| Ajuste, botao, texto, tweak | **Blitz** | 3 phases |
| Refatoracao, otimizacao | **Standard** | Arch + Stories + Validation |
| Brainstorm, explorar, prototipar | **Design Sprint** | Discovery → Design → Strategy → Stories |

Present classification to user:
```
Classificacao: {mode}
Fases planejadas: {phases}
Agentes envolvidos: {agents}
Tempo estimado: {time}
Posso prosseguir? (ou ajuste o modo)
```

### Step 3: Execute Phase Sequence
For each phase in the selected workflow:

#### 3a. Discovery (if applicable)
- Activate `@analyst` via Skill tool: `Planejamento:Analyst-AIOS`
- Brief Atlas with user request context
- Commands: `*create-project-brief`, `*brainstorm`, `*perform-market-research`
- Validate output against `gate-discovery.md`

#### 3b. Strategy (always)
- Activate `@pm` via Skill tool: `Planejamento:PM-AIOS`
- Brief Morgan with discovery outputs (if any) + user request
- Commands: `*create-prd` (greenfield) or `*create-epic` (brownfield)
- Validate output against `gate-strategy.md`

#### 3c. Architecture (always)
- Activate `@architect` via Skill tool: `Planejamento:Architect-AIOS`
- Brief Aria with PRD/Epic + quality requirements
- Commands: `*create-full-stack-architecture` or `*create-brownfield-architecture`
- Also: `*assess-complexity` for story sizing
- Validate output against `gate-architecture.md`

#### 3d. Design (if has UI)
- Activate `@ux-design-expert` via Skill tool: `Planejamento:UX-AIOS`
- Brief Uma with PRD + Architecture frontend section
- Commands: `*wireframe`, `*create-front-end-spec`
- Validate output against `gate-design.md`

#### 3e. Stories (always)
- Activate `@po` via Skill tool: `Planejamento:PO-AIOS`
- Brief Pax for backlog creation and validation
- Then activate `@sm` via Skill tool: `Planejamento:SM-AIOS`
- Brief River for detailed story creation
- Commands: `*create-story`, `*draft`, `*story-checklist`
- Validate output against `gate-stories.md`

#### 3f. Validation (standard/comprehensive)
- CEO consolidates all outputs
- Generate quality scorecard
- Create masterplan document
- Validate against `gate-final.md`

### Step 4: Deliver Masterplan
Present to user:
```
MASTERPLAN: {project_name}

Modo: {mode}
Fases completadas: {phases_completed}/{phases_total}
Quality Score: {average_score}/10

Artefatos gerados:
- {list of documents}

Stories prontas para @dev:
- {list of stories with priority}

Proximos passos:
1. Revisar masterplan
2. Ajustar se necessario
3. Ativar @dev para implementacao
```

## Quality Requirements
- Cada fase deve passar no quality gate antes de avancar
- Consistencia entre artefatos de fases diferentes
- Zero gaps criticos no masterplan final
- Stories com acceptance criteria testáveis
