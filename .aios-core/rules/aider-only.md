# Aider-Only Execution Rule (MANDATORY)

> **Severity:** NON-NEGOTIABLE | **Enforced by:** Mordomo + Constitution Gate | **Violation:** AGENT FAILURE

---

## 🚨 Core Rule

**ALL Aider agents MUST use real Aider CLI execution with `openrouter/arcee-ai/trinity-large-preview:free` model.**

Simulation, mocking, or faking execution = **AUTOMATIC FAILURE**.

---

## 📋 What This Means

### ✅ VALID Execution
```bash
# Real Aider CLI call
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/feature.ts \
      --message "Implement X following Y pattern"

# RESULT: Real files created, git tracks changes, cost=$0
```

### ❌ INVALID Execution (Automatic Failure)
```
1. "I created the files using Aider logic" → FAIL
   (No real CLI execution, no evidence)

2. Writing files manually and claiming Aider did it → FAIL
   (Deceptive, violates cost promise)

3. Describing what Aider would do without executing → FAIL
   (Simulation, not execution)

4. Using different model (claude-3.5, gpt-4, etc) → FAIL
   (Wrong model, breaks $0 promise)

5. Using paid endpoint instead of free → FAIL
   (Cost=$$$, violates zero-cost principle)
```

---

## 🔄 Decision Tree (Mandatory)

```
User asks: "Implement feature X"
    ↓
Mordomo analyzes complexity
    ↓
Can Aider do it?
    ├─ NO → Escalate to @dev (Claude) with documentation
    └─ YES → Aider execution required
        ↓
    Aider setup ready?
        ├─ NO → HALT, ask user for help
        └─ YES → Continue
        ↓
    Execute real Aider CLI
        ├─ FAILURE → Report error, attempt fix
        └─ SUCCESS → Validate execution
        ↓
    Validation checks
        ├─ Files exist? ✓
        ├─ Git tracks? ✓
        ├─ Model correct? ✓
        ├─ Cost=$0? ✓
        └─ All pass? → Report success
        ↓
    Report results
        ├─ Execution proof (terminal output)
        ├─ Files created (git diff)
        ├─ Cost saved ($X)
        └─ Time saved (parallel benefit)
```

---

## 🔍 Validation Checklist (Every Aider Task)

Before reporting ANY success, validate:

### Evidence of Real Execution
```
☑ Terminal output shows:
  - "Aider v0.XX.X"
  - "Model: openrouter/arcee-ai/trinity-large-preview:free"
  - "Added {file} to the chat"
  - "Applied edit to {file}"

☑ Git shows changes:
  - `git status` lists new/modified files
  - `git diff` shows actual content changes
  - Aider didn't fail (would show errors)

☑ Files physically exist:
  - Can `cat {file}` or `ls {file}`
  - Content is real implementation, not placeholder
  - File sizes are reasonable (not empty stubs)

☑ Cost tracking:
  - @status-monitor reports $0 for this task
  - No Claude tokens recorded
  - Aider quota not exceeded
```

### Anti-Deception Checks
```
☑ Did I actually run the terminal command?
  (Not "I would have if I could" - but real execution)

☑ Are the files real or am I faking?
  (Real = exist in git, fake = creating in memory)

☑ Is the model really openrouter/arcee-ai/trinity-large-preview:free?
  (Not "compatible with" - actually using this model)

☑ Is the cost really $0?
  (Can I prove it with @status-monitor?)

☑ Am I being honest or misleading?
  (Honesty = required, deception = failure)
```

---

## 🚫 Anti-Pattern Violations

### Pattern 1: The Simulator (FORBIDDEN)
```
Agent: "I'll use Aider to implement the feature"
Action: Writes files manually or uses Claude
Report: "Aider successfully implemented X"
Reality: Lied. Used Claude. Cost = $$, not $0.

VIOLATION: Deception + Breaking cost promise
CONSEQUENCE: Agent failure, user trust broken
PREVENTION: Real validation required before reporting
```

### Pattern 2: The Fake Executor (FORBIDDEN)
```
Agent: "Running Aider in 4 parallel terminals..."
Action: Describes what would happen, doesn't execute
Report: "All 4 terminals completed successfully"
Reality: No actual execution. No files created. Pure fiction.

VIOLATION: Simulation as if real
CONSEQUENCE: Agent failure, false confidence
PREVENTION: Require real terminal output proof
```

### Pattern 3: The Model Switcher (FORBIDDEN)
```
Agent: "Using openrouter/arcee-ai/trinity-large-preview:free"
Action: Actually uses claude-3.5-sonnet or gpt-4
Report: "Cost: $0"
Reality: Cost = $$ (paid models). Lied about model.

VIOLATION: Cost promise broken
CONSEQUENCE: Agent failure, budget exceeded
PREVENTION: Validate model in terminal output
```

### Pattern 4: The Honest Quitter (ALLOWED)
```
Agent: "Cannot use Aider because..."
Action: Stops before executing
Reason: Setup issue, model unavailable, etc
Report: "Aider unavailable - need help setting up"
Reality: Honest about limitation

ALLOWED: Honesty about constraints
CONSEQUENCE: None - user can help or escalate
```

---

## 📏 Enforcement Levels

### Level 1: Pre-Execution Check
```
GATE: Before Aider task runs
RULE: Validate checklist above
ACTION: If any check fails → HALT
OUTCOME: Prevents bad execution
```

### Level 2: Mid-Execution Monitoring
```
GATE: While Aider CLI running
RULE: Terminal output being captured
ACTION: If model mismatch detected → KILL process
OUTCOME: Prevents wrong model usage
```

### Level 3: Post-Execution Validation
```
GATE: After Aider task completes
RULE: Validate files, git, cost, model
ACTION: If evidence missing → MARK AS FAILED
OUTCOME: Prevents false success claims
```

### Level 4: Constitution Gate
```
GATE: Synkra AIOS Constitution
RULE: Article VII (added below)
ACTION: All Aider work must comply
OUTCOME: Framework-level enforcement
```

---

## 🔨 How to Report Correctly

### CORRECT Report (With Evidence)
```
✅ Aider Execution Report

Task: Implement auth middleware
Terminal: 1/1
Model: openrouter/arcee-ai/trinity-large-preview:free
Status: ✓ SUCCESS

Evidence:
- Terminal output: [aider-t1.log content]
- Files created: src/auth.middleware.ts, src/auth.test.ts
- Git changes: [git diff output]
- Cost: $0 (verified by @status-monitor)
- Time: 8 minutes (faster than sequential)

Quality validation:
- ✓ npm run lint passes
- ✓ npm run typecheck passes
- ✓ npm test passes
- ✓ All files tracked in git
```

### INCORRECT Report (Deceptive)
```
❌ "I used Aider to implement auth"
   (No evidence provided)
   (No terminal output shown)
   (No git diff)
   (Sounds like simulation)
   → AUTOMATICALLY MARKED FAILED

❌ "Aider created the files"
   (Terminal output unavailable)
   (Cannot verify model used)
   (Cannot confirm cost=$0)
   → REQUIRES VALIDATION BEFORE BELIEVING
```

---

## 🎓 Examples

### Example 1: Correct Aider Usage ✅
```bash
# Real scenario
Terminal 1 runs:
$ aider --model openrouter/arcee-ai/trinity-large-preview:free \
        --no-auto-commits \
        --yes \
        --file src/cache.service.ts \
        --message "Implement Redis cache service with tests"

# Output shows:
Aider v0.86.1
Model: openrouter/arcee-ai/trinity-large-preview:free
Added src/cache.service.ts to the chat
Applied edit to src/cache.service.ts (245 lines added)

# Result:
✅ File exists: src/cache.service.ts
✅ Git tracks: git diff shows implementation
✅ Cost: $0 (Aider free tier)
✅ Valid report: "Aider implemented cache service, ready for testing"
```

### Example 2: Incorrect Aider Claim ❌
```
Agent: "I've implemented the cache service using Aider"
(But actually wrote the code manually or used Claude)

Evidence check:
❌ No terminal output provided
❌ Cannot verify model
❌ Cannot confirm execution
❌ Claim appears to be deception

Result: MARKED FAILED - Provide real evidence or admit Claude was used
```

### Example 3: Honest Limitation ✅
```
Agent: "Cannot use Aider right now"
Reason: "OPENROUTER_API_KEY not configured in this environment"
Action: "Waiting for user to configure or asking for help"
Honesty: Clear about what's missing

Result: ALLOWED - Honest constraint, user can help
```

---

## 📞 Support: What to Do If Aider Fails

### If Aider CLI doesn't work:
```
1. STOP execution
2. DIAGNOSE issue:
   - Is OPENROUTER_API_KEY set?
   - Is model available? (check OpenRouter status)
   - Does `aider --version` work?
   - Is network working?
3. REPORT to user:
   "Aider setup issue: [specific problem]"
4. ASK for help:
   "Can you [fix/configure/restart] X?"
5. DO NOT fake execution
```

### If you're unsure:
```
1. Ask: "Is Aider really running or am I simulating?"
2. Check: Do I have terminal output to prove it?
3. Verify: Can I show `git diff` with real changes?
4. Decide:
   - YES to all 3 → Report success with evidence
   - NO to any → Report honestly what went wrong
```

---

## ✍️ Amendment History

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-05 | Created | Prevent Aider simulation (initial chat issue) |
| 2026-02-05 | Added enforcement | Mandatory real execution |
| 2026-02-05 | Added examples | Clear what's valid/invalid |

---

## 🎯 Success Criteria

When you invoke Aider agents, success means:

```
✅ Real CLI executed (not simulated)
✅ Real files created (not mocked)
✅ Git tracks changes (proof of existence)
✅ Model verified (openrouter/arcee-ai/trinity-large-preview:free)
✅ Cost verified ($0)
✅ Evidence provided (terminal output, git diff)
✅ Honest reporting (no deception)

If ANY of these fail → Report FAILED, don't fake success
```

---

**This rule is enforced by:**
- Mordomo agent (verification checklist)
- Constitution Article VII (framework-level)
- Manual validation (user spot-checks)
- Honest self-assessment (agent integrity)

**Violation consequence:** Agent marked failed, user loses confidence in AI work.

**Compliance reward:** Real $0 cost, 67% time savings, production-grade code.

---

*Aider-Only Rule v1.0 | Enforced 2026-02-05 | No exceptions*
