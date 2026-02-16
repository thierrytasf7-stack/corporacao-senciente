# Cost-Routing Strategies for Dev-Aider Squad

## Purpose

This guide helps all dev-aider agents decide when to route work to Aider (free models) vs Claude Opus (paid). The decisions are based on task complexity, required quality, and previous experience with Trinity 127B.

---

## The 4 Routing Questions

Before invoking Aider, ask these 4 questions in order. If ANY answer is "yes" to escalation items, route to Claude:

1. **Complexity Check**: Is this COMPLEX (>8 hours estimated) OR does it require coordinating changes across 5+ files?
   - YES → Escalate to Claude
   - NO → Continue to question 2

2. **Domain Check**: Is this architecture, system design, security-critical decision, or novel algorithm?
   - YES → Escalate to Claude
   - NO → Continue to question 3

3. **Reasoning Check**: Does this require deep reasoning about trade-offs, performance analysis, or multi-step problem solving?
   - YES → Escalate to Claude
   - NO → Continue to question 4

4. **Quality Check**: Is the quality bar CRITICAL (security, production reliability, financial accuracy)?
   - YES → Escalate to Claude
   - NO → Use Aider (FREE!)

---

## Task-Type Matrix

### ✅ Perfect for Aider (Quality 8-9/10)

| Task Type | Complexity | Files | Expected Quality | Notes |
|-----------|-----------|-------|------------------|-------|
| **Implementation** | SIMPLE/STANDARD | 1-3 | 9/10 | API endpoints, features, form logic |
| **Refactoring** | SIMPLE/STANDARD | 1-3 | 9/10 | Rename variables, split functions, restructure |
| **Testing** | SIMPLE/STANDARD | 1-3 | 8-9/10 | Unit tests, integration tests, fixtures |
| **Documentation** | ANY | 1-2 | 9/10 | Code comments, README, docstrings |
| **Bug Fixing** | SIMPLE | 1-3 | 8/10 | Off-by-one, missing validation, typos |
| **Config Changes** | ANY | 1 | 9/10 | env files, YAML, JSON config |

**Decision**: Use Aider whenever task is in this table. Savings: 100% on all these tasks.

---

### ⚠️ Consider Aider (Quality 6-8/10)

| Task Type | Complexity | Files | Quality Risk | Recommendation |
|-----------|-----------|-------|--------------|-----------------|
| **Complex Logic** | STANDARD | 3-5 | Need careful review | Use Aider, then have Claude review if critical |
| **Refactoring** | COMPLEX | 5+ | Edge cases missed | Use Aider, run full test suite |
| **Bug Fixing** | COMPLEX | 3-5 | Might miss root cause | Use Aider with detailed error context |
| **Performance** | STANDARD | 2-4 | Optimization might not be optimal | Use Aider, measure results |

**Decision**: Use Aider IF you're willing to review/test the output carefully. Savings: 80% but requires validation.

---

### ❌ Must Use Claude

| Task Type | Complexity | Why |
|-----------|-----------|-----|
| **Architecture** | COMPLEX | Requires holistic thinking about system design |
| **Security** | ANY | Mistakes have severe consequences |
| **System Design** | COMPLEX | Trade-off analysis is critical |
| **Novel Algorithms** | COMPLEX | Trinity is not strong at creative problem-solving |
| **Multi-File Coordination** | 5+ files | Context window too small to see full picture |

**Decision**: Escalate to Claude immediately. Quality > Cost for these.

---

## Phase-Specific Routing

### Story Creation Phase (@po-aider)

**Text-heavy, conceptual work.** Trinity excels here because:
- Requirements gathering is mostly structured text input
- Story generation is well-bounded (story template)
- No code execution needed
- Output can be reviewed/edited by human before proceeding

**Aider Suitability**: ✅ EXCELLENT (Quality 9/10)

### Task Decomposition Phase (@sm-aider)

**Breaking stories into tasks.** This is a decomposition task:
- Input: story document (text)
- Task: partition into atomic pieces
- Output: structured task list
- No coding required

**Aider Suitability**: ✅ EXCELLENT (Quality 9/10)

### Implementation Phase (@dev-aider)

**Actual code generation.** Use the Task-Type Matrix above. Most implementations are SIMPLE/STANDARD:

- CRUD endpoints → Aider ✅
- Form validation → Aider ✅
- Database queries → Aider ✅
- Error handling → Aider ✅
- Test generation → Aider ✅

Exceptions:
- Complex algorithm with edge cases → Consider Claude
- Security-critical code → Must use Claude
- Performance-critical loop → Might need Claude

### Validation Phase (@qa-aider)

**Running lint/typecheck/tests.** This is NOT an Aider task -- it's local command execution:
- `npm run lint` - local
- `npm run typecheck` - local
- `npm test` - local

Aider's role: analyze output and generate summary. ✅ EXCELLENT

### Deploy Phase (@deploy-aider)

**Git operations and deployment checks.** Local commands:
- `git status`, `git add`, `git commit` - local
- Pre-deploy validation - local
- Report generation - local

Aider's role: none here. Pure orchestration. ✅ PERFECT

---

## Monthly Impact Example

**Scenario: 20 tasks per month**

### All Claude Approach
- 20 tasks × $10 average = $200/month = $2,400/year

### Dev-Aider Approach (optimal routing)
- 15 Aider tasks × $0 = $0
- 3 Claude tasks × $10 = $30
- 2 mixed (Aider then Claude review) × $5 = $10
- **Total: $40/month = $480/year**

### Savings: $1,920/year (80% reduction) with SAME quality

---

## When in Doubt

**Rule of Thumb**: If you can test it automatically (unit tests pass, lint passes, typecheck passes), Aider probably got it right. If the work requires judgment calls or trade-off decisions, use Claude.

---

## Escalation Path

If Aider gets stuck or produces low-quality output:

1. **First**: Review the output. Was the prompt clear? Try again with a better prompt.
2. **Second**: Maybe it's a COMPLEX task. Check the 4 routing questions again.
3. **Third**: Escalate to `@dev` agent. Include what Aider tried and why it didn't work.

---

*Cost-optimized development: Maximum value = Best quality at lowest cost*
