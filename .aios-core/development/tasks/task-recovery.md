# Task Recovery

**Purpose:** Perform a safe rollback of failed/stuck tasks to the backlog, enriching them with error context to ensure the next attempt solves the root cause.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: taskRecovery()
responsible: @mordomo
responsible_type: Agent
atomic_layer: Orchestration
elicit: false

inputs:
- field: stuck_terminals
  type: list
  required: true
  description: "Output from terminalHealthCheck"

outputs:
- field: recovery_log
  type: markdown
  description: "Log of tasks moved to backlog"
```

---

## Recovery Protocol

1. **Task Identification:** Match terminal IDs/PIDs to active tasks in `.aios/status.json` or `docs/stories/`.
2. **Context Enrichment:**
    - Capture the last 50 lines of the terminal log.
    - Identify the specific error or behavior that caused the crash.
3. **Status Update:**
    - Change status from `executing` to `backlog`.
    - Update task notes: `[RECOVERY] Task failed due to {reason}. Must fix {error_pattern} before resuming.`
4. **Prioritization:** Mark the task for immediate attention or as a "blocker" until the environment/bug is fixed.

---

## Acceptance Criteria

- [ ] Each stuck task moved to backlog.
- [ ] Log context successfully attached to the task description/notes.
- [ ] No data loss in the task story or metadata.

---

## Metadata

```yaml
version: 1.0.0
agent: mordomo
tags: [orchestration, self-healing, recovery]
```
