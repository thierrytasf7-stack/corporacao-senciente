# Task: Run QA Validation

> **Phase**: Validation
> **Owner Agent**: @qa-aider
> **Squad**: dev-aider

---

## Purpose

Execute lint, typecheck, and test commands. Generate concise QA summary for Claude sign-off.

---

## Execution Flow

### Step 1: Verify Implementation Complete

Check `git status`:
- [ ] Changes exist (not empty)
- [ ] All code files are present

### Step 2: Run QA Suite

Invoke `node scripts/qa-runner.js --full`:

```bash
1. npm run lint       (capture: pass/fail, error count)
2. npm run typecheck  (capture: pass/fail, error count)
3. npm test           (capture: pass/fail, tests count)
```

Fail-fast: stop on first failure.

### Step 3: Capture Results

Record for each check:
- Exit code (0=pass, non-zero=fail)
- Last 5 lines of output (for failures)
- Jest summary (for tests)

### Step 4: Populate QA Summary

Fill `templates/qa-summary-tmpl.md` with:
- Lint: ✅ PASS | ❌ FAIL
- Typecheck: ✅ PASS | ❌ FAIL
- Tests: ✅ PASS | ❌ FAIL
- Overall: ALL_PASS | BLOCKED

If BLOCKED: include failure details + recommended action.

### Step 5: HALT for Claude Sign-Off

Display summary:

```
✅ QA Complete

Summary: qa-summary-{story}.md

Claude action: Type APPROVED (ready to deploy) or BLOCKED (investigate)
```

---

## Error Handling

### Lint fails

Show error context. Recommend @dev to fix.

### Tests timeout

Check if test suite is flaky. Retry or escalate.

### Typecheck succeeds but tests fail

This is normal. Recommend @dev to debug.

---

## Success Criteria

- [ ] All three checks executed
- [ ] Summary populated
- [ ] Claude can make go/no-go decision from summary alone
- [ ] Failure details (if any) are actionable

---

*Task definition for @qa-aider *validate command.*
