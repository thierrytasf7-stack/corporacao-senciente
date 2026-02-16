# Story Review Checklist

Use this checklist when Claude reviews story summaries from @po-aider and @sm-aider.

---

## 1. Story Completeness

- [ ] Story has a clear name/title
- [ ] Scope is described in 1-2 sentences
- [ ] Risk level is assessed (LOW/MEDIUM/HIGH)
- [ ] Scope is appropriate size (not too big, not too small)

---

## 2. Task Readiness

- [ ] Number of planned tasks is reasonable (ideally 3-8)
- [ ] Each task description is clear
- [ ] Dependencies between tasks are explicit (or none)
- [ ] No single task tries to do too much

---

## 3. Cost Validation

- [ ] All planned tasks are Aider-suitable (code gen, refactoring, testing, docs)
- [ ] No architecture/design/security tasks routed to Aider
- [ ] If escalation needed: it's clearly flagged
- [ ] Cost estimate is $0 for all Aider tasks

---

## 4. Quality Assessment

- [ ] Acceptance criteria are testable
- [ ] Files affected are realistic (≤5)
- [ ] No hidden dependencies or ambiguities
- [ ] Story is decomposable by @sm-aider

---

## 5. Sign-Off

**Review Outcome**:

- [ ] **APPROVED** - Ready to proceed to @sm-aider
- [ ] **CHANGES_REQUESTED** - Send feedback back to @po-aider

**Comments** (if any):
```
[Your feedback here]
```

**Reviewed by**: Claude
**Date**: {AUTO}
**Time**: {AUTO}

---

*Checklist for Claude plan review gate. Used by po-aider workflow.*
