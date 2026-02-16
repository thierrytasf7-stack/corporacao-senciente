# QA Summary Sign-Off Checklist

Use this checklist when Claude reviews QA summaries from @qa-aider.

---

## 1. Checks Ran Successfully

- [ ] Lint check executed and result recorded
- [ ] Typecheck executed and result recorded
- [ ] Test suite executed and result recorded
- [ ] No command timeouts or execution errors

---

## 2. Results Are Valid

- [ ] All three checks passed (ALL_PASS), OR
- [ ] Failures are documented with specific error details
- [ ] Error messages are clear and actionable
- [ ] Test counts are reasonable (not zero tests)

---

## 3. Code Quality

- [ ] Lint errors: none (✅ PASS)
- [ ] Type errors: none (✅ PASS)
- [ ] Test failures: none (✅ PASS)
- [ ] Code follows project patterns

---

## 4. Escalation Path (if blocked)

- [ ] If failures exist, recommended action is specified
- [ ] Action is one of:
  - [ ] "Fix in code, then re-run qa-aider"
  - [ ] "Flaky test, retry"
  - [ ] "Infrastructure issue, contact devops"
  - [ ] Other: {describe}

---

## 5. Sign-Off

**QA Outcome**:

- [ ] **APPROVED** - Ready for @deploy-aider to push
- [ ] **BLOCKED** - Issues need investigation before deploy

**Comments** (if any):
```
[Your review notes]
```

**Reviewed by**: Claude QA
**Date**: {AUTO}
**Time**: {AUTO}

---

*Checklist for Claude QA sign-off gate. Used by qa-aider workflow.*
