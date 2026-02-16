# Task: Execute Complete Sprint

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*execute-sprint`

## Execution Steps

### Step 1: Load Sprint Plan
Read sprint plan (from intake or existing plan).
Order stories by dependency DAG.

### Step 2: Execute DB Stories First
For all stories with database changes:
- @data-engineer handles ALL DB prep before any dev starts
- Migrations applied, security audited, snapshots taken

### Step 3: Execute Story Groups
For each dependency group:

**Parallel Group** (independent stories):
- Create worktrees via @devops
- Execute each story pipeline in parallel
- Merge results after all complete

**Sequential Group** (dependent stories):
- Execute story-pipeline one at a time
- Validate each before starting next

### Step 4: Integration Check
After all stories complete:
- Merge all branches
- Run full test suite
- Verify no integration regressions
- Resolve conflicts (if any)

### Step 5: Sprint Release
- @devops `*pre-push` → `*push` → `*create-pr` → `*release`
- Generate release notes
- Update all story statuses to SHIPPED

### Step 6: Sprint Summary
```
═══════════════════════════════════════════
  SPRINT COMPLETE
═══════════════════════════════════════════
Stories shipped: {n}/{total}
Via Aiders: {n} ($0 savings)
Via AIOS: {n}
QA iterations: {avg} average
Blockers resolved: {n}
Time: {duration}
═══════════════════════════════════════════
```
