# Task: Execute Single Story

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*execute-story {id}`

## Execution Steps

### Step 1: Load Story
Read story from `docs/stories/{id}` or provided context.
Extract: acceptance criteria, complexity, dependencies, file list.

### Step 2: Pre-flight
- [ ] Acceptance criteria are clear and testable
- [ ] Complexity estimated (fibonacci)
- [ ] No blocking dependencies unresolved
- [ ] Branch created (if needed)

### Step 3: Database First (if applicable)
If story mentions schema/table/migration/query/RLS:
1. Activate @data-engineer via Skill: `Desenvolvimento:DataEngineer-AIOS`
2. `*snapshot` (backup)
3. `*create-schema` or `*apply-migration`
4. `*security-audit`
5. Confirm DB ready before proceeding

### Step 4: Implementation
Select agent by complexity:
- **Fibonacci 1-3:** Activate @dev-aider via Skill: `Aider:Dev-Aider`
- **Fibonacci 5+:** Activate @dev via Skill: `Desenvolvimento:Dev-AIOS`

Execute: `*develop {story-id}`
- Dev implements all acceptance criteria
- Writes tests (unit + integration minimum)
- CodeRabbit pre-commit review (light, 2 iter, CRITICAL only)
- Updates story checkboxes and file list

### Step 5: QA Review
Select agent by complexity:
- **Fibonacci 1-3:** Activate @qa-aider via Skill: `Aider:QA-Aider`
- **Fibonacci 5+:** Activate @qa via Skill: `Desenvolvimento:QA-AIOS`

Execute:
- `*code-review` or `*review-build` (10-phase for complex)
- CodeRabbit full (3 iter, CRITICAL+HIGH)
- If issues found: `*create-fix-request` → dev `*apply-qa-fixes`
- QA Loop: repeat until PASS or max 5 iterations
- `*gate` → APPROVED / NEEDS_REVISION / BLOCKED

If BLOCKED: escalate via `*unblock`

### Step 6: Ship
Activate @devops via Skill: `Operacoes:DevOps-AIOS`
- `*pre-push` (lint, typecheck, all tests, build)
- `*push` (to remote)
- `*create-pr` (if PR workflow)

### Step 7: Confirm
```
Story {id}: SHIPPED ✓
Implementation: @{dev_agent}
QA: @{qa_agent} ({iterations} iterations)
Ship: @devops
```
