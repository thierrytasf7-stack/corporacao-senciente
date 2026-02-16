# Task: Invoke AIDER-AIOS

> **Phase:** execution
> **Owner Agent:** @aider-dev
> **Squad:** dev-aider

---

## Purpose

Invoke AIDER-AIOS as a subprocess tool to execute code implementation tasks using free Arcee Trinity model. This task bridges Claude AIOS and AIDER-AIOS, allowing cost-optimized development without leaving the AIOS workflow.

---

## Prerequisites

1. ✓ AIDER-AIOS cloned locally (reference: `../../AIDER-AIOS/`)
2. ✓ Python 3.8+ installed
3. ✓ OpenRouter API key configured (OPENROUTER_API_KEY env var)
4. ✓ Aider CLI installed (`pip install aider-chat`)
5. ✓ Task analyzed & approved by @aider-optimizer

---

## Execution Flow

### Step 1: Validate Environment

```bash
# Check AIDER-AIOS exists
ls -la ../../AIDER-AIOS/

# Check Python
python --version  # Should be 3.8+

# Check Aider installed
aider --version

# Check OpenRouter API key
echo $OPENROUTER_API_KEY  # Should have value
```

**If any check fails:** HALT and report to user

---

### Step 2: Parse Task Requirements

From the task request, extract:
- `TASK_DESCRIPTION`: What to implement
- `FILE_TARGETS`: Which files to modify/create
- `QUALITY_CRITERIA`: What "done" looks like
- `CONTEXT_NEEDED`: Relevant code examples/patterns

Example:
```
TASK_DESCRIPTION: "Add authentication middleware to Express API"
FILE_TARGETS: ["src/middleware/auth.js", "src/routes/api.js"]
QUALITY_CRITERIA: ["TypeScript passes", "Tests pass", "Follows error handling pattern"]
CONTEXT_NEEDED: [Show existing middleware pattern, Show existing error handler]
```

---

### Step 3: Optimize Prompt for Aider

Free models (4k context) need optimized prompts. Transform requirements:

**RULE 1: Be Specific, Not Vague**
```
❌ BAD: "Make the auth better"
✓ GOOD: "Add JWT validation to check token expiration and signature"
```

**RULE 2: Reference Line Numbers**
```
❌ BAD: "Fix the validation function"
✓ GOOD: "In src/auth.js lines 45-60, add validation for email format using regex: /^[^@]+@[^@]+\\.[^@]+$/"
```

**RULE 3: Provide Examples**
```
❌ BAD: "Add error handling"
✓ GOOD: "Add try-catch like: try { ... } catch(e) { logger.error('Failed to auth', {error: e.message}); throw new Error('Auth failed'); }"
```

**RULE 4: One Change Per Request**
```
❌ BAD: "Refactor auth, add tests, optimize queries, fix linting"
✓ GOOD: "Step 1: Add JWT validation (lines 45-60). Then we'll test. Then optimize."
```

**RULE 5: Be Explicit About Output**
```
❌ BAD: "Write a function"
✓ GOOD: "Write function: async function validateToken(token: string): Promise<User> { ... }"
       "Should throw Error if invalid, return User object if valid"
```

---

### Step 4: Prepare Aider Session

```bash
# Navigate to AIDER-AIOS directory
cd ../../AIDER-AIOS/aios-core

# Start Aider with files to edit
aider \
  --model arcee-ai/trinity-large-preview:free \
  --api-key $OPENROUTER_API_KEY \
  {FILE_1} {FILE_2} ... \
  --message "{OPTIMIZED_PROMPT}"
```

**Alternative: Interactive Mode**
```bash
aider --model arcee-ai/trinity-large-preview:free \
  --api-key $OPENROUTER_API_KEY \
  {FILES}

# Then in Aider, type:
# {OPTIMIZED_PROMPT}
# /diff         # Review changes
# /commit       # Commit with message
# /exit         # Exit when done
```

---

### Step 5: Monitor Execution

While Aider runs:

1. **Watch output** for model responses
2. **Check quality** of generated code:
   - Does it follow existing patterns?
   - Are there obvious errors?
   - Does it handle errors?
3. **Stop if needed**: Interrupt and adjust prompt if going wrong

Aider commands during execution:
```
/add {file}           # Add file to context
/drop {file}          # Remove file from context
/diff                 # Show pending changes
/undo                 # Undo last change
/commit "{message}"   # Commit changes
/clear                # Clear conversation
```

---

### Step 6: Validate Output

After Aider completes:

```bash
# 1. Verify files created/modified
git status

# 2. Lint check
npm run lint

# 3. Type check
npm run typecheck

# 4. Run tests
npm test

# 5. Review diff
git diff HEAD
```

**Success criteria:**
- ✓ All files pass linting
- ✓ TypeScript compilation succeeds
- ✓ All tests pass
- ✓ Code follows patterns
- ✓ No critical security issues

**If validation fails:**
- Review error messages
- Adjust approach
- Return to Aider for fix (Step 4)

---

### Step 7: Commit & Report Results

```bash
# Commit with aider-dev attribution
git add .
git commit -m "feat: {TASK_DESCRIPTION} (via Aider-Dev)

- Implemented via AIDER-AIOS with Arcee Trinity 127B
- Model: arcee-ai/trinity-large-preview:free
- Cost: \$0 (completely free)
- Files modified: {FILE_COUNT}
- Tests passed: {TEST_COUNT}

Co-Authored-By: Aider-Dev <aider@aios-cost-optimized>"
```

Generate report:
```
═══════════════════════════════════════════════════════════
AIDER-AIOS EXECUTION REPORT
═══════════════════════════════════════════════════════════

Task: {TASK_DESCRIPTION}
Model: Arcee Trinity 127B (FREE via OpenRouter)
Status: ✓ COMPLETED

Files Modified:
  - {FILE_1}: {LINES_ADDED} added, {LINES_REMOVED} removed
  - {FILE_2}: {LINES_ADDED} added, {LINES_REMOVED} removed

Quality Checks:
  ✓ Linting: PASSED
  ✓ TypeScript: PASSED
  ✓ Tests: {PASSED_COUNT}/{TOTAL_COUNT} passed
  ✓ Security: No critical issues

Cost Analysis:
  Model Cost: $0 (100% free)
  Execution Time: {MINUTES} minutes
  Cost vs Claude: Claude would cost ~${ESTIMATED_CLAUDE_COST}
  Savings: ${ESTIMATED_CLAUDE_COST}

Next Steps:
  1. Review code in PR/branch
  2. Run integration tests if needed
  3. Merge when approved

═══════════════════════════════════════════════════════════
```

---

## Error Handling

### Error 1: OPENROUTER_API_KEY not set

```
Error: "No API key found"
Action: HALT
Message: "OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable"
Resolution: "User must configure API key first"
```

### Error 2: Model rate limited or unavailable

```
Error: "API rate limit exceeded" or "Model not available"
Action: FALLBACK to backup model (Qwen 2.5)
Command: aider --model qwen/qwen2.5-7b-instruct:free ...
Message: "Trinity limited, using Qwen backup. Quality similar, proceeding."
```

### Error 3: File conflicts (merge issues)

```
Error: "Cannot add file - conflicts exist"
Action: HALT
Message: "Git conflicts detected. Resolve manually before continuing"
Resolution: "User resolves conflicts, then restart Aider"
```

### Error 4: Generated code fails tests

```
Error: "npm test failed"
Action: Return to Aider with error details
Message: "Tests failed. Showing Aider the error for fix..."
Aider Command: "/clear" then explain error clearly
Follow: Return to Step 5 (validate output)
```

### Error 5: Generated code has linting errors

```
Error: "npm run lint has 5 errors"
Action: Use Aider's auto-fix
Command: "npm run lint --fix" then aider to review
Message: "Linting errors found. Fixing..."
```

---

## Example: Real Execution

### Scenario: Add User CRUD API

**Input:**
```
Task: Implement user CRUD API endpoints
Files: src/api/users/create.js, src/api/users/read.js, src/api/users/update.js, src/api/users/delete.js
Quality: Must pass all tests, follow Express pattern
Context: Show existing auth middleware pattern
```

**Step 3: Optimize Prompt**
```
You are implementing Express API endpoints for user CRUD operations.

REQUIREMENTS:
1. Create POST /api/users - accepts {name, email}, validates email format
2. Read GET /api/users/:id - returns user with {id, name, email, createdAt}
3. Update PATCH /api/users/:id - updates {name, email}, validates
4. Delete DELETE /api/users/:id - soft delete (marks as deleted)

PATTERN TO FOLLOW:
See existing src/api/auth/login.js for error handling pattern:
  try { ... } catch(error) { logger.error('...'); throw new ApiError(...); }

VALIDATION:
- Email format: /^[^@]+@[^@]+\.[^@]+$/
- Name: not empty, max 100 chars

ERROR HANDLING:
- Invalid input → throw ApiError(400, 'Invalid input')
- Not found → throw ApiError(404, 'User not found')
- Duplicate email → throw ApiError(409, 'Email already exists')

OUTPUT:
- Write as CommonJS (module.exports)
- Add JSDoc comments
- Export functions: createUser, readUser, updateUser, deleteUser
```

**Step 4: Aider Execution**
```bash
aider --model arcee-ai/trinity-large-preview:free \
  src/api/users/create.js \
  src/api/users/read.js \
  src/api/users/update.js \
  src/api/users/delete.js \
  --message "{OPTIMIZED_PROMPT}"
```

**Aider Output:** [Generates 4 files with CRUD implementation]

**Step 5: Validation**
```bash
npm run lint    # ✓ PASSED
npm run typecheck  # ✓ PASSED
npm test -- api.test.js  # ✓ PASSED (12/12 tests)
```

**Step 7: Report**
```
═══════════════════════════════════════════════════════════
AIDER-AIOS EXECUTION REPORT
═══════════════════════════════════════════════════════════

Task: Implement user CRUD API (4 endpoints)
Model: Arcee Trinity 127B (FREE)
Status: ✓ COMPLETED

Files Created:
  ✓ src/api/users/create.js (68 lines)
  ✓ src/api/users/read.js (45 lines)
  ✓ src/api/users/update.js (62 lines)
  ✓ src/api/users/delete.js (38 lines)

Quality:
  ✓ Lint: PASSED
  ✓ Tests: 12/12 passed
  ✓ Code: Follows Express pattern

Cost:
  Model: FREE (100%)
  Time: 8 minutes
  Claude cost: ~$15 (saved!)

═══════════════════════════════════════════════════════════
```

---

## Integration Points

### Called By
- @aider-dev when task suitable for Aider

### Calls
- Python wrapper: `scripts/aider-invoke.js`
- Aider CLI: subprocess execution

### Outputs To
- Modified source files
- Git commits
- Cost report

---

## Success Criteria

- ✓ All code quality checks pass
- ✓ All tests pass
- ✓ Cost report generated
- ✓ Commit message accurate
- ✓ 0 manual intervention needed
- ✓ Quality matches or exceeds expectations

---

## Metadata

```yaml
task: invoke-aider
squad: dev-aider
owner: @aider-dev
estimated_time: "30-45 minutes"
difficulty: STANDARD
tags:
  - aider-integration
  - cost-optimization
  - subprocess
  - free-models
  - arcee-trinity
```
