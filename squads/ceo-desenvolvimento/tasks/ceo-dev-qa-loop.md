# Task: QA Review Loop

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*qa-loop {story}`

## Execution
QA loop orchestration (references qa-loop.yaml workflow):

### Iteration 1
1. @qa `*code-review {story}` or `*review-build`
2. CodeRabbit full review (3 iter, CRITICAL+HIGH)
3. If PASS → done
4. If issues: @qa `*create-fix-request`

### Fix Cycle (max 5 iterations)
5. @dev `*apply-qa-fixes`
6. @qa re-review
7. Repeat until PASS or max iterations

### Escalation
- After 5 iterations: escalate to user
- If BLOCKED: escalate immediately
- Track iteration count and issues resolved

### Gate
- @qa `*gate` → APPROVED / NEEDS_REVISION / BLOCKED
- APPROVED → proceed to ship
- NEEDS_REVISION → one more iteration
- BLOCKED → escalate
