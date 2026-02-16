# Task: Aider to Claude Handoff

> **Phase**: Escalation
> **Owner Agent**: @aider-dev
> **Squad**: dev-aider

---

## Purpose

Escalate work from Aider (free) to @dev (Claude Opus) when Aider hits limits.

---

## Execution Flow

### Step 1: Detect Failure

Aider failed to generate acceptable code:
- Test failures persist after retries
- Code quality is too low
- Task is actually more complex than estimated

### Step 2: Document What Was Tried

Create handoff document:
- What task was attempted
- What approach Aider took
- What went wrong (specific failures)
- What context Claude needs

### Step 3: Suggest @dev Activation

Display:

```
Escalating to @dev for assistance.
Activate: /AIOS:agents:dev

Include this context: [handoff-doc.md]
```

### Step 4: Halt

Wait for user to activate @dev.

---

## Success Criteria

- [ ] Handoff document is clear
- [ ] Context is sufficient for @dev to proceed
- [ ] Next steps are obvious

---

*Escalation task. Bridges Aider and Claude environments.*
