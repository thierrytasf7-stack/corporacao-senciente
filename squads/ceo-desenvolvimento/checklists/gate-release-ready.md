# Quality Gate: Release Ready

## Mandatory (all must pass)
- [ ] All sprint stories QA-approved
- [ ] All tests pass (unit + integration + e2e)
- [ ] Build succeeds (production)
- [ ] CodeRabbit pre-PR validation (0 CRITICAL)
- [ ] No merge conflicts
- [ ] Version bump appropriate (semantic)

## Pre-push
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] @devops *pre-push completed

## Gate Decision
- **SHIP**: All pass → @devops push + PR + release
- **HOLD**: Issues found → resolve before shipping
