# Orchestrate Task

## Purpose
Receive any user task, analyze it, and route to the optimal executor (existing squad or create new one).

## Trigger
User provides any task description to @nexus or Meta-Orchestrator Squad.

## Inputs
- `task_description`: Free-form description of what user wants
- `urgency`: (optional) Time sensitivity
- `preferences`: (optional) User preferences for execution

## Workflow

### Step 1: Parse & Understand
```
ACTION: Deep parse of user request
EXTRACT:
  - Primary domain (tech, legal, creative, business, etc.)
  - Specific requirements
  - Expected outputs
  - Complexity level (simple/medium/complex)
  - Urgency
OUTPUT: Structured task profile
```

### Step 2: Capability Analysis
```
ACTION: Invoke @scanner
COMMAND: *analyze-capabilities {task_profile}
RECEIVE:
  - Required capabilities list
  - Squad match scores
  - Gap analysis
OUTPUT: Capability report
```

### Step 3: Routing Decision
```
IF best_match_score >= 0.7:
  → Proceed to DELEGATION
ELSE IF best_match_score >= 0.5:
  → Ask user: delegate with gaps OR create new squad?
ELSE:
  → Proceed to CREATION
```

### Step 4a: Delegation Path
```
ACTION: Delegate to matched squad
STEPS:
  1. Format task for target squad
  2. Invoke target squad's main agent
  3. Request @sentinel to monitor
  4. Return execution handle to user
OUTPUT: "Task delegated to {squad}. Monitoring active."
```

### Step 4b: Creation Path
```
ACTION: Invoke @forge
COMMAND: *create-squad {domain}
STEPS:
  1. Forge creates new squad
  2. Squad registered in system
  3. Task delegated to new squad
  4. @sentinel monitors
OUTPUT: "Created {new_squad}. Task delegated. Monitoring active."
```

### Step 5: Monitor & Learn
```
PARALLEL:
  - @sentinel tracks execution
  - On completion: @cortex *learn {outcome}
OUTPUT: Execution result + learning recorded
```

## Outputs
- Task routed to appropriate executor
- Monitoring active
- Learning recorded

## Quality Gates
- [ ] Task clearly understood
- [ ] Capabilities correctly analyzed
- [ ] Routing decision justified
- [ ] Execution monitored
- [ ] Outcome learned

## Example

**User Input:**
"I need to create a legal contract for a software development project"

**Orchestration Flow:**
1. Parse: Domain=Legal, Type=Contract, Complexity=Medium
2. Analyze: Requires legal expertise, contract templates
3. Check squads: No legal squad found (score=0.3)
4. Decision: CREATE
5. Forge creates `legal-squad` with contract specialist
6. Delegate to new squad
7. Sentinel monitors
8. Cortex learns: "legal contracts → legal-squad"

---

_Task Version: 1.0_
