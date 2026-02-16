# Process Cleanup

**Purpose:** Safely terminate stuck or zombie worker processes after recovery has been performed.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: processCleanup()
responsible: @deploy-aider
responsible_type: Agent
atomic_layer: Infrastructure
elicit: false

inputs:
- field: targets
  type: list
  required: true
  description: "List of PIDs/Terminal IDs to terminate"

outputs:
- field: cleanup_report
  type: markdown
```

---

## Cleanup Logic

1. **Signal:** Send `SIGTERM` to the identified PIDs.
2. **Verification:** Wait 5 seconds; if process persists, send `SIGKILL`.
3. **Registry Update:** Remove the terminal entry from the Kanban/`worker-status`.
4. **Log Archiving:** Move the log file of the terminated session to `logs/terminal/archived/`.

---

## Acceptance Criteria

- [ ] All target processes terminated.
- [ ] No resources (ports/memory) leaked.
- [ ] Terminal Kanban updated (worker-status is clean).

---

## Metadata

```yaml
version: 1.0.0
agent: deploy-aider
tags: [infrastructure, cleanup, devops]
```
