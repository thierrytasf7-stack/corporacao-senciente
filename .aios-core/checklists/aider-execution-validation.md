# Aider Execution Validation Checklist

**Purpose:** Validate that Aider CLI was REALLY executed, not simulated.

**Used by:** Mordomo agent (mandatory before reporting success)

**Severity:** NON-NEGOTIABLE - All checks MUST pass or execution is marked FAILED

---

## 📋 Pre-Execution Checklist

Execute this BEFORE running any Aider task:

### Environment
- [ ] `OPENROUTER_API_KEY` environment variable is set
- [ ] `aider --version` command works (CLI installed)
- [ ] Model available: `openrouter/arcee-ai/trinity-large-preview:free` (check OpenRouter status)
- [ ] Git repository is clean (can create commits)
- [ ] Working directory is correct (you know where files will be created)
- [ ] Network connection is stable (can reach OpenRouter)
- [ ] Terminal is ready (for capturing output)

### Configuration
- [ ] Model string is EXACTLY: `openrouter/arcee-ai/trinity-large-preview:free`
- [ ] NOT using: claude-3, gpt-4, paid models, different endpoints
- [ ] Flags prepared: `--no-auto-commits --yes --file --message`
- [ ] Output directory writable (logs, terminal output)
- [ ] File paths correct (absolute paths preferred)

### Decision
- [ ] This task IS suitable for Aider (not a Claude-only task)
- [ ] Complexity is STANDARD or SIMPLE (not COMPLEX/architectural)
- [ ] No ambiguity about approach (clear requirements)
- [ ] Success criteria are testable (not subjective)

**If ANY check fails:** HALT - Report to user: "Cannot proceed with Aider: [reason]"

---

## 🔧 Execution Checklist

Execute this DURING Aider CLI run:

### Terminal Capture
- [ ] Terminal output is being captured (to file or log)
- [ ] Can see: "Aider vX.XX.X"
- [ ] Can see: Model line with exact model name
- [ ] Can see: File operations ("Added X to chat", "Applied edit to Y")
- [ ] Can see: Token usage and messages
- [ ] Terminal did NOT close/crash prematurely

### Aider Behavior
- [ ] Aider started successfully (no immediate error)
- [ ] Aider accepted the file arguments
- [ ] Aider processed the message prompt
- [ ] Aider did NOT reject model (would show authentication error)
- [ ] Output shows actual work being done (not stalled)
- [ ] Process completed (did not hang or timeout)

### File Operations
- [ ] Aider reported creating/modifying files
- [ ] File count matches expectations
- [ ] No obvious errors in output
- [ ] Aider did NOT refuse task (would say "cannot" or "refused")

**If ANY check fails during execution:** Document the error, do NOT claim success

---

## ✅ Post-Execution Validation

Execute this AFTER Aider CLI completes (MANDATORY before reporting):

### Terminal Output Analysis
- [ ] Saved terminal output to file/log
- [ ] Output contains: "Aider vX.XX.X"
- [ ] Output contains: "Model: openrouter/arcee-ai/trinity-large-preview:free"
- [ ] Output contains: "Tokens: [number] sent, [number] received"
- [ ] Output shows file modifications (not empty output)
- [ ] Output does NOT show errors/failures
- [ ] Model output is visible (actual AI responses, not just "done")

**Evidence template:**
```
Terminal Output (from Aider):
═══════════════════════════════════════
Aider v0.86.1
Model: openrouter/arcee-ai/trinity-large-preview:free
Git repo: .git with X files
Added src/feature.ts to the chat
Applied edit to src/feature.ts (156 lines added)
Tokens: 4.2k sent, 1.8k received
═══════════════════════════════════════
```

### File System Verification
- [ ] Files were actually created on disk
- [ ] Can list files with `ls` or `find`
- [ ] File sizes are reasonable (not empty stubs)
- [ ] File content is real implementation (not placeholder)
- [ ] Can read file content with `cat` or editor

**Verification commands:**
```bash
# Verify files exist and have content
ls -lah src/feature.ts
wc -l src/feature.ts

# Verify content is real
head -20 src/feature.ts
cat src/feature.ts | grep -c "function"
```

### Git Tracking
- [ ] `git status` shows created/modified files
- [ ] `git diff` shows actual code changes
- [ ] Changes are not empty or trivial (significant implementation)
- [ ] Files are ready to commit
- [ ] Git did NOT refuse changes (syntax/encoding issues)

**Verification commands:**
```bash
# Show what changed
git status

# Show the diff
git diff src/feature.ts | head -50

# Verify substantial changes
git diff --stat
```

### Cost Verification
- [ ] Terminal output does NOT mention Claude costs
- [ ] Terminal shows: "Model: openrouter/arcee-ai/trinity-large-preview:free"
- [ ] @status-monitor reports: $0 for this task
- [ ] No Claude tokens consumed (verify in logs)
- [ ] Aider quota still available

**Verification with @status-monitor:**
```bash
# This would be a Mordomo command
@status-monitor *session-costs

# Should show:
Aider tasks: N × $0 = $0
Claude tasks: 0 × $X = $0
Total: $0 ✓
```

### Quality Validation (if applicable)
- [ ] Code passes linting (if was implementation task)
- [ ] TypeScript compiles (if was TS implementation)
- [ ] Tests pass (if was testing task)
- [ ] No obvious bugs in the code

---

## 🚫 ANTI-DECEPTION CHECKS

These checks specifically catch simulation/faking:

### Check 1: Real vs Simulated
```
Question: Did Aider REALLY run or did I describe what would happen?

Evidence of REAL:
✓ Terminal output with model name
✓ Files actually exist on disk
✓ Git shows real changes
✓ Content is implementation, not comments

Evidence of FAKE/SIMULATED:
✗ No terminal output
✗ Files created manually or in-memory
✗ Git has no changes
✗ Content is placeholder or description
```

### Check 2: Model Verification
```
Question: Is this REALLY openrouter/arcee-ai/trinity-large-preview:free?

Evidence of REAL:
✓ Terminal output says: "Model: openrouter/arcee-ai/trinity-large-preview:free"
✓ Can verify API key is for OpenRouter
✓ No error messages about authentication
✓ Tokens show reasonable numbers for free tier

Evidence of WRONG MODEL:
✗ Terminal shows: "Model: claude-3-5-sonnet"
✗ Terminal shows: "Model: gpt-4"
✗ Different model name than expected
✗ Cost is not $0
```

### Check 3: Cost Verification
```
Question: Is the cost REALLY $0?

Evidence of $0:
✓ Terminal: "openrouter/arcee-ai/trinity-large-preview:free"
✓ @status-monitor: "$0"
✓ No Claude tokens logged
✓ No payment required (using free tier)

Evidence of COST PAID:
✗ Terminal: different model (non-free)
✗ @status-monitor: "$X"
✗ Claude tokens logged
✗ Paid API endpoint used
```

### Check 4: Honesty Check
```
Question: Am I being honest about what happened?

Honest statements:
✓ "Aider CLI executed successfully"
✓ "Files created: [list], verified with git"
✓ "Cost: $0 (verified with terminal output)"
✓ "Cannot use Aider right now because [reason]"

Dishonest statements:
✗ "I used Aider" (without evidence)
✗ "Files were created" (not verified)
✗ "Cost is $0" (not verified)
✗ Claiming success when execution didn't work
```

---

## 📊 Validation Score

After post-execution checks, calculate score:

```
PERFECT VALIDATION: 100/100 points
- ✓ Terminal output exists (20 pts)
- ✓ Model correct (20 pts)
- ✓ Files exist on disk (20 pts)
- ✓ Git shows changes (20 pts)
- ✓ Cost is $0 (20 pts)

ACCEPTABLE VALIDATION: 80-99/100 points
- ✓ Most checks pass
- Some evidence missing but understandable
- Can report success with caveat

FAILED VALIDATION: <80/100 points
- Multiple checks failed
- Cannot verify execution really happened
- MUST report as FAILED
- Cannot claim success
```

---

## 📝 Reporting Template

Use this when reporting Aider execution:

### SUCCESS Report
```
✅ Aider Execution Report

Task: [Brief description]
Terminals: 1 (or 1-4 if parallel)
Model: openrouter/arcee-ai/trinity-large-preview:free
Status: ✓ SUCCESS

Evidence:
✓ Terminal output: [snippet showing model, tokens]
✓ Files created: [list file paths]
✓ Git diff: [summary of changes]
✓ Cost: $0 (verified)
✓ Quality: [lint/test/typecheck status]

Time: [X minutes]
Savings: [time or cost saved vs Claude]

Validation Score: 100/100
→ Ready for production
```

### FAILED Report
```
❌ Aider Execution Report

Task: [Brief description]
Terminals: 1
Model: Intended to be openrouter/arcee-ai/trinity-large-preview:free
Status: ✗ FAILED

Why Failed:
[List specific checks that failed]

Evidence Missing:
- Terminal output not captured
- OR: Files not created
- OR: Model was different
- OR: Cannot verify cost=$0

Validation Score: 35/100
→ Cannot claim success
→ Alternative: [escalate to Claude, ask for help, etc]
```

### HONEST LIMITATION Report
```
⏸ Aider Execution Report

Task: [Brief description]
Status: ⏸ NOT ATTEMPTED

Reason: [Specific limitation]

Examples:
- "OPENROUTER_API_KEY not configured"
- "Aider CLI not installed"
- "Model not available in this region"
- "Network connectivity issue"

Solution: [What needs to be fixed]

Validation Score: 0/100 (not applicable)
→ Honest about constraint
→ No deception
→ User can help resolve
```

---

## 🔄 Validation Workflow (Mandatory)

1. **Before:** Run pre-execution checklist
   - Stops bad executions before they happen

2. **During:** Capture all terminal output
   - Proves execution happened

3. **After:** Run post-execution validation
   - Verifies success or failure

4. **Report:** Use appropriate template
   - Clear about what happened

5. **Archive:** Save validation evidence
   - Proves compliance for audit

---

## 🎯 Success Criteria

Validation is SUCCESSFUL when:

```
ALL of the following are true:

1. ✓ Terminal output captured and shows Aider running
2. ✓ Model line shows: openrouter/arcee-ai/trinity-large-preview:free
3. ✓ Files actually exist on disk (not simulated)
4. ✓ Git status shows real changes
5. ✓ Git diff shows substantial implementation
6. ✓ Cost verified as $0
7. ✓ No deception detected
8. ✓ Quality checks pass (if applicable)
9. ✓ Honest reporting (not exaggerated)
10. ✓ Validation score ≥80/100

If ANY of these fail → Mark execution as FAILED
Do NOT report success when validation fails
```

---

## ⚠️ Failure Handling

If validation FAILS:

```
1. DO NOT report success
   (Even if most checks passed)

2. DO report honestly
   "Aider execution FAILED because: [specific reason]"

3. DO provide proof
   "Validation check #5 failed: [evidence]"

4. DO offer solution
   "Next steps: [what to try next]"

5. DO NOT blame user
   "Setup issue" is OK, but work to fix it together
```

---

## 📚 References

- Constitution Principle VII: Aider-First Obligation
- Rules: `.aios-core/rules/aider-only.md`
- Mordomo guide: `.aios-core/MORDOMO-GUIDE.md`
- Mordomo agent: `.aios-core/development/agents/mordomo.md`

---

**Checklist Version:** 1.0
**Effective Date:** 2026-02-05
**Enforcement:** MANDATORY for all Aider tasks
**Last Updated:** 2026-02-05

---

*Validation is not optional - it's how we ensure real execution, $0 costs, and honest reporting.*
