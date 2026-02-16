# Task: Delegate to Specific Agent

## Metadata
- agent: ceo-planejamento
- trigger: `*delegate @agent task`

## Execution

### Step 1: Parse Delegation
Extract from user command:
- Target agent: @analyst | @pm | @architect | @ux-design-expert | @po | @sm
- Task description: what needs to be done
- Context: any relevant previous outputs

### Step 2: Brief the Agent
Activate the agent via corresponding Skill:

| Agent | Skill |
|-------|-------|
| @analyst | `Planejamento:Analyst-AIOS` |
| @pm | `Planejamento:PM-AIOS` |
| @architect | `Planejamento:Architect-AIOS` |
| @ux-design-expert | `Planejamento:UX-AIOS` |
| @po | `Planejamento:PO-AIOS` |
| @sm | `Planejamento:SM-AIOS` |

### Step 3: Provide Context
Include in briefing:
- What: the specific task
- Why: the objective
- Context: relevant outputs from current planning session
- Constraints: any decisions already made
- Quality: relevant quality dimensions

### Step 4: Collect & Validate
- Collect agent output
- Validate against relevant quality gate
- Report result to user
