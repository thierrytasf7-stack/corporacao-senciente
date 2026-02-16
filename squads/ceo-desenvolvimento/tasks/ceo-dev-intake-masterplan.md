# Task: Intake Masterplan & Create Sprint Plan

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*execute`
- elicit: true

## Execution Steps

### Step 1: Receive Masterplan
Accept masterplan from:
- Athena (CEO-Planejamento) via `*execute` with masterplan context
- User providing a story list or requirements directly
- Existing stories in `docs/stories/`

### Step 2: Extract & Classify Stories
For each story in the masterplan:
```
Story ID | Title | Complexity | Has DB? | Dependencies | Assigned To
---------|-------|-----------|---------|-------------|------------
```

Classification routing:
- Fibonacci 1-2 → dev-aider + qa-aider + deploy-aider
- Fibonacci 3 → dev-aider (fallback Dex) + qa-aider
- Fibonacci 5 → Dex + Quinn (light) + Gage
- Fibonacci 8 → Dex (*build-autonomous) + Quinn (full) + Gage
- Fibonacci 13+ → Dex (worktree) + Quinn (full+NFR) + Gage (release)

### Step 3: Dependency Analysis
Build DAG (Directed Acyclic Graph):
- Stories that MUST be sequential (shared files, DB deps)
- Stories that CAN run in parallel (independent)
- Stories that need @data-engineer FIRST

### Step 4: Sprint Planning
Group stories into sprints:
- Sprint capacity based on complexity sum
- Dependencies respected (topological sort)
- Parallel groups identified
- DB stories scheduled first

### Step 5: Present Sprint Plan
```
═══════════════════════════════════════════
  PROMETHEUS - SPRINT PLAN
═══════════════════════════════════════════

Sprint 1: {name}
  [DB] Story 1.1: {title} → @data-engineer → @dev → @qa → @devops
  [||] Story 1.2: {title} → @dev-aider → @qa-aider (parallel)
  [||] Story 1.3: {title} → @dev Dex → @qa Quinn (parallel)
  [>>] Story 1.4: {title} → depends on 1.1 → @dev Dex

Sprint 2: {name}
  ...

Total: {n} stories, {points} points, {sprints} sprints
Estimated: {time}
Cost optimization: {n} stories via Aiders ($0)

Aprovar e iniciar execucao?
═══════════════════════════════════════════
```

### Step 6: Execute (on approval)
Start sprint-execution-cycle workflow.
