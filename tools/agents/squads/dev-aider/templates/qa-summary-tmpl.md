# QA Summary: {STORY_NAME}

**Lint**: ✅ PASS | ❌ FAIL {if FAIL: N errors}

**Typecheck**: ✅ PASS | ❌ FAIL {if FAIL: N errors}

**Tests**: ✅ PASS | ❌ FAIL {if FAIL: N failed / M total}

**Overall**: ✅ ALL_PASS | ❌ BLOCKED

---

## If BLOCKED:

**Failures**:
{List each failure with 1-2 line description}

**Recommended Action**:
- If code issues: Escalate to @dev-aider or @dev for fixes, then re-run
- If infrastructure/flaky: Describe issue and suggested resolution

---

## If ALL_PASS:

**Ready for**: @deploy-aider (git push)

**Quality Metrics**:
- Tests passed: X / Y
- Code follows lint: ✅
- Types correct: ✅

---

## Claude Action

Read the summary above. Based on your review:

- Type `APPROVED` if all checks pass and code looks good to deploy
- Type `BLOCKED` if you want to investigate failures before proceeding

---

*QA summary for sign-off. Full test output available if needed.*
