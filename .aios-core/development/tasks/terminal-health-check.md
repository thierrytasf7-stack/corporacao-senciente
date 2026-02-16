# Terminal Health Check

**Purpose:** Monitor active worker terminals to detect frozen processes, infinite loops, or execution errors.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: terminalHealthCheck()
responsible: @status-monitor
responsible_type: Agent
atomic_layer: Monitoring
elicit: false

outputs:
- field: stuck_terminals
  type: list
  description: "List of terminal IDs and PIDs that are FROZEN, LOOPING or in ERROR"
```

---

## Detection Logic

1. **Active Check:** Query `worker-status` (Kanban de Terminais).
2. **Heuristics for Failure:**
    - **FROZEN:** No output change for > 3 minutes while status is `RUNNING`.
    - **LOOPING:** Repeated error patterns in logs within short intervals.
    - **ERROR:** Process exited with non-zero code but task remains in `executing`.
    - **TIMEOUT:** Execution time exceeds task estimate by 200%.
3. **Validation:** Cross-reference with OS process list (PID check).

---

## Acceptance Criteria

- [ ] All active worker terminals scanned.
- [ ] Stuck terminals correctly identified with reason.
- [ ] Report generated for the `task_recovery` step.

---

## Metadata

```yaml
version: 1.0.0
agent: status-monitor
tags: [monitoring, terminals, health]
```
