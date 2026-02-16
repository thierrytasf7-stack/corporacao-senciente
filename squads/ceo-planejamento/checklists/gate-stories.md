# Quality Gate: Stories Phase

## Mandatory - Per Story (all must pass)
- [ ] Clear title following convention
- [ ] Description with context and objective
- [ ] Acceptance criteria (specific, testable, measurable)
- [ ] Complexity estimate (fibonacci: 1, 2, 3, 5, 8, 13)
- [ ] Dependencies listed (if any)

## Quality Checks - Per Story (3+ must pass)
- [ ] File list with expected changes
- [ ] Edge cases identified
- [ ] Error handling specified
- [ ] CodeRabbit integration section populated
- [ ] Quality gates defined (lint, typecheck, tests)
- [ ] Non-functional requirements referenced

## Backlog Checks (all must pass)
- [ ] Stories cover ALL PRD/Epic features
- [ ] No orphan features (in PRD but not stories)
- [ ] No phantom features (in stories but not PRD)
- [ ] Priority order makes sense (dependencies respected)
- [ ] Sprint plan reasonable (capacity considered)

## Consistency Checks (all must pass)
- [ ] Stories reference architecture decisions correctly
- [ ] Stories reference design spec (if UI)
- [ ] Technical terms consistent across stories
- [ ] Estimation scale consistent

## Gate Decision
- **PASS**: All mandatory + backlog + consistency checks pass
- **ITERATE**: Ask @sm to fix story quality, @po to fix backlog
- **ESCALATE**: Scope gap between PRD and stories → realign
