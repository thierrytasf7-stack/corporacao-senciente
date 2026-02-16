# Task: Parallel Execution with Multiple Aider Terminals

> **Phase:** execution
> **Owner Agent:** @mordomo
> **Cost:** $0 (all via Aider)

---

## Purpose

Execute multiple independent tasks simultaneously by spawning parallel Aider CLI terminals. This dramatically increases throughput when tasks have no dependencies on each other.

---

## Prerequisites

1. ✓ Tasks decomposed into independent subtasks
2. ✓ Dependencies mapped (DAG - Directed Acyclic Graph)
3. ✓ Aider CLI installed (`pip install aider-chat`)
4. ✓ OPENROUTER_API_KEY configured
5. ✓ Maximum 4 parallel terminals (resource constraint)

---

## Execution Flow

### Step 1: Analyze Task Dependencies

Create a dependency graph:

```
Task A: auth.service.ts     → independent (can start immediately)
Task B: auth.test.ts        → independent (can start immediately)
Task C: jwt.utils.ts        → independent (can start immediately)
Task D: auth.middleware.ts  → depends on A, C
Task E: routes.ts           → depends on D
```

Dependency Graph:
```
    A ───┐
         ├──→ D ──→ E
    C ───┘

    B (independent, can run anytime)
```

### Step 2: Group into Parallel Batches

```yaml
batch_1:  # No dependencies - run in PARALLEL
  - task: A (auth.service.ts)
  - task: B (auth.test.ts)
  - task: C (jwt.utils.ts)
  parallel: true
  max_concurrent: 3

batch_2:  # Depends on batch_1 - SEQUENTIAL after batch_1
  - task: D (auth.middleware.ts)
  parallel: false
  wait_for: [A, C]

batch_3:  # Depends on batch_2 - SEQUENTIAL after batch_2
  - task: E (routes.ts)
  parallel: false
  wait_for: [D]
```

### Step 3: Spawn Parallel Workers

For each task in parallel batch, open a new terminal/process:

```bash
# Terminal 1 (Worker 1)
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/auth/auth.service.ts \
      --message "Create auth.service.ts with JWT validation. Include: login(), logout(), validateToken(). Use bcrypt for password hashing."

# Terminal 2 (Worker 2) - RUNS IN PARALLEL
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/auth/auth.test.ts \
      --message "Create auth.test.ts with Jest tests for auth.service. Include: login success, login failure, token validation, logout."

# Terminal 3 (Worker 3) - RUNS IN PARALLEL
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/auth/jwt.utils.ts \
      --message "Create jwt.utils.ts with: generateToken(), verifyToken(), refreshToken(). Use jsonwebtoken library."
```

### Step 4: Monitor Workers

Track status of all parallel workers:

```javascript
// Conceptual monitoring
const workers = [
  { id: 1, task: 'auth.service.ts', status: 'running', startTime: Date.now() },
  { id: 2, task: 'auth.test.ts', status: 'running', startTime: Date.now() },
  { id: 3, task: 'jwt.utils.ts', status: 'running', startTime: Date.now() },
];

// Poll for completion every 5 seconds
setInterval(() => {
  workers.forEach(w => {
    // Check if Aider process completed
    if (processCompleted(w.id)) {
      w.status = 'completed';
      w.endTime = Date.now();
    }
  });

  // If all completed, proceed to next batch
  if (workers.every(w => w.status === 'completed')) {
    executeNextBatch();
  }
}, 5000);
```

### Step 5: Wait for Batch Completion

Before starting dependent tasks:

```bash
# Wait for all workers in batch to complete
while [ $(jobs -r | wc -l) -gt 0 ]; do
  echo "Waiting for parallel workers..."
  sleep 5
done

echo "Batch 1 complete! Starting batch 2..."
```

### Step 6: Execute Next Batch

Once dependencies are satisfied:

```bash
# Terminal 1 (Sequential - depends on A, C)
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/auth/auth.middleware.ts \
      --message "Create auth.middleware.ts that uses auth.service and jwt.utils. Include: authRequired(), optionalAuth()."
```

### Step 7: Merge and Validate Results

After all batches complete:

```bash
# Check all files were created
ls -la src/auth/

# Run lint
npm run lint

# Run tests
npm test

# Git status
git status
```

---

## Parallel Execution Rules

### Maximum Concurrency

| Resource | Limit | Reason |
|----------|-------|--------|
| Terminals | 4 | OS/memory constraints |
| API calls | 4 | OpenRouter rate limits |
| File locks | 1 per file | Prevent conflicts |

### Task Independence Criteria

A task is INDEPENDENT if:
- ✓ Does not read files created by other pending tasks
- ✓ Does not modify files modified by other pending tasks
- ✓ Does not depend on output of other pending tasks
- ✓ Can be validated independently

### Conflict Prevention

NEVER run in parallel:
- ❌ Two tasks modifying same file
- ❌ Task that reads file being written by another
- ❌ Tasks with explicit dependencies

---

## Example: Full Parallel Orchestration

```
INPUT: "Implement user CRUD API with tests"

ANALYSIS:
- create.ts (independent)
- read.ts (independent)
- update.ts (independent)
- delete.ts (independent)
- user.test.ts (depends on all above)
- routes.ts (depends on all CRUD files)

EXECUTION PLAN:
┌─────────────────────────────────────────────────────────┐
│ BATCH 1 (PARALLEL - 4 workers)                          │
│                                                          │
│ Terminal 1: aider → create.ts                           │
│ Terminal 2: aider → read.ts                             │
│ Terminal 3: aider → update.ts                           │
│ Terminal 4: aider → delete.ts                           │
│                                                          │
│ [All running simultaneously]                             │
│ Estimated time: ~2 minutes (vs 8 minutes sequential)    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ BATCH 2 (SEQUENTIAL - depends on batch 1)               │
│                                                          │
│ Terminal 1: aider → user.test.ts                        │
│                                                          │
│ Estimated time: ~2 minutes                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ BATCH 3 (SEQUENTIAL - depends on batch 1)               │
│                                                          │
│ Terminal 1: aider → routes.ts                           │
│                                                          │
│ Estimated time: ~1 minute                               │
└─────────────────────────────────────────────────────────┘

TOTAL TIME: ~5 minutes (vs ~13 minutes sequential)
SPEEDUP: 62% faster
COST: $0 (all via Aider)
```

---

## Error Handling

### Worker Failure

```
If worker fails:
1. Log error with details
2. Mark task as FAILED
3. Continue other parallel workers
4. After batch completes, retry failed task
5. If retry fails 3x, escalate to user
```

### Timeout

```
If worker exceeds 10 minutes:
1. Log warning
2. Check if Aider is stuck
3. Option: kill and restart
4. Option: wait longer for complex tasks
```

### Conflict Detected

```
If file conflict detected:
1. HALT all workers modifying same file
2. Complete one, then restart others
3. Log conflict for future prevention
```

---

## Cost Report Template

```
════════════════════════════════════════════════════════════
PARALLEL EXECUTION REPORT
════════════════════════════════════════════════════════════

Tasks Executed: 6
Parallel Batches: 3
Workers Used: 4 (max)

Time Analysis:
  Sequential estimate: 13 minutes
  Parallel actual: 5 minutes
  Time saved: 8 minutes (62%)

Cost Analysis:
  Aider (6 tasks × $0): $0
  Claude equivalent: ~$30
  Savings: $30 (100%)

Quality Checks:
  ✓ Lint: PASSED
  ✓ Tests: 24/24 passed
  ✓ TypeScript: PASSED

════════════════════════════════════════════════════════════
```

---

## Metadata

```yaml
task: parallel-execution
owner: @mordomo
estimated_time: "varies by task count"
difficulty: STANDARD
tags:
  - parallel
  - performance
  - aider
  - multi-terminal
  - orchestration
```
