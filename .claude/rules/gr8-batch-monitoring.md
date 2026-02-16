# GR8 v2.0 - SMART AUTONOMOUS BATCH MONITORING

**Status:** ✅ ACTIVE | **Severity:** CRITICAL | **Version:** 2.0 | **Applies to:** CEO-ZERO + Agent Zero

---

## 🚨 NON-NEGOTIABLE: Max 2 Concurrent Batches

**REGRA INEGOCIÁVEL:** Agent Zero DEVE rodar com `max_concurrent_batches: 2` (NUNCA superior).

**Evidência:**
- ✅ 2 batches simultâneos = 100% sucesso, score 8.4/10
- ❌ 3+ batches = 47% sucesso, score 6.1/10, rate limits

**Enforcement:** GR8 v2.0 verifica config ANTES de iniciar. Se > 2, HALT e alerta.

**Detalhes:** `.claude/rules/agent-zero-concurrency.md`

---

## RULE STATEMENT v2.0

Quando batches com múltiplas tasks estiverem rodando, CEO-ZERO deve **MONITORAR AUTONOMAMENTE** até 100% conclusão com:

1. **Progress Detection** - Detecta se está progredindo (não travado)
2. **Error Analysis** - Analisa logs/outputs para detectar erros
3. **Stuck Detection** - Detecta se travou sem progresso
4. **Auto-Retry** - Reinicia tasks travadas automaticamente
5. **Auto-Decompose** - Quebra em subtasks após 3 falhas (via GR7)
6. **Quality Gates** - Valida qualidade durante execução

**CEO-ZERO NUNCA abandona batches. CEO-ZERO SEMPRE garante qualidade do início ao fim.**

---

## MONITORING WORKFLOW v2.0

### Phase 1: Batch Dispatch
```bash
cd workers/agent-zero
for task in queue/wave*.json; do
  node lib/delegate.js --task-file "$task" > "logs/$(basename $task .json).log" 2>&1 &
done
wait
```

**IMPORTANTE**: Logs individuais (não /dev/null) para error analysis.

### Phase 2: Smart Monitor Loop
```bash
TASKS_EXPECTED=9
INTERVAL=30              # Check a cada 30 segundos (v2: mais frequente)
TIMEOUT_MAX=900          # Timeout global 15 min (v2: mais generoso)
STUCK_THRESHOLD=3        # Stuck após 3 checks sem progresso
RETRY_MAX=3              # Retry até 3x por task
ELAPSED=0
STUCK_COUNT=0
COMPLETED_LAST=0

while [ $ELAPSED -lt $TIMEOUT_MAX ]; do
  COMPLETED=$(find workers/agent-zero/results/*.status -type f | wc -l)

  # ✅ Progress Detection
  if [ "$COMPLETED" -eq "$COMPLETED_LAST" ]; then
    STUCK_COUNT=$((STUCK_COUNT + 1))
    echo "⚠️  No progress detected ($STUCK_COUNT/$STUCK_THRESHOLD checks)"
  else
    STUCK_COUNT=0
  fi

  # 🔄 Auto-Retry if Stuck
  if [ "$STUCK_COUNT" -ge "$STUCK_THRESHOLD" ]; then
    echo "🔄 STUCK DETECTED! Analyzing errors..."
    ./scripts/analyze-stuck-tasks.sh
    ./scripts/auto-retry-failed.sh
    STUCK_COUNT=0
  fi

  # 📊 Error Analysis (every check)
  FAILED=$(grep -l "failed\|error" workers/agent-zero/results/*.status 2>/dev/null | wc -l)
  if [ "$FAILED" -gt 0 ]; then
    echo "⚠️  $FAILED tasks with errors - analyzing..."
    ./scripts/analyze-errors.sh
  fi

  # ✅ Success Detection
  if [ "$COMPLETED" -ge "$TASKS_EXPECTED" ]; then
    echo "✅ All tasks completed!"
    break
  fi

  # Progress report
  echo "⏳ [$ELAPSED/$TIMEOUT_MAX]s [$COMPLETED/$TASKS_EXPECTED] (stuck: $STUCK_COUNT)"

  COMPLETED_LAST=$COMPLETED
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done
```

### Phase 3: Quality Validation
```bash
# Validate all completed tasks
for result in workers/agent-zero/results/*.json; do
  SCORE=$(jq -r '.quality_score // 0' "$result")
  if [ "$SCORE" -lt 7 ]; then
    echo "⚠️  Low quality detected: $(basename $result) (score: $SCORE/10)"
    # Invoke GR7 decompose
    ./scripts/decompose-low-quality.sh "$result"
  fi
done
```

### Phase 4: Auto-Decompose Failed Tasks
```bash
# Find tasks that failed 3+ times
for task in workers/agent-zero/results/*.json; do
  ATTEMPTS=$(jq -r '.retry_count // 0' "$task")
  if [ "$ATTEMPTS" -ge 3 ]; then
    echo "🔄 Task failed 3x - invoking GR7 Auto-Decomposition..."
    ./scripts/decompose-task.sh "$task"
  fi
done
```

---

## GR8 v2.0 PARAMETERS

| Parâmetro | v1.0 | v2.0 | Razão |
|-----------|------|------|-------|
| `GR8_INTERVAL_SEC` | 60 | 30 | Check mais frequente para detectar stuck |
| `GR8_TIMEOUT_SEC` | 600 | 900 | Tasks I/O podem demorar (web scrape, PDF) |
| `GR8_STUCK_THRESHOLD` | N/A | 3 | Stuck após 3 checks sem progresso |
| `GR8_RETRY_MAX` | N/A | 3 | Max retries automáticos por task |
| `GR8_QUALITY_THRESHOLD` | N/A | 7 | Score mínimo aceitável (0-10) |
| `GR8_DECOMPOSE_AFTER` | N/A | 3 | Decompose após 3 falhas |
| `GR8_LOG_INDIVIDUAL` | false | true | Logs individuais para error analysis |

---

## v2.0 NEW CAPABILITIES

### 1. Progress Detection
**Detecta se está PROGREDINDO, não só se terminou.**

```bash
if [ "$COMPLETED" -eq "$COMPLETED_LAST" ]; then
  STUCK_COUNT=$((STUCK_COUNT + 1))
  if [ "$STUCK_COUNT" -ge 3 ]; then
    echo "🚨 STUCK: No progress in $(($STUCK_COUNT * $INTERVAL))s"
    # Analyze what's hanging
    ps aux | grep "node.*delegate" | grep -v grep
    # Check individual task logs
    tail -20 logs/*.log
  fi
fi
```

### 2. Error Analysis
**Analisa LOGS e STATUS FILES para detectar padrões de erro.**

```bash
# Patterns comuns de erro
grep -E "error|failed|timeout|exception|ECONNREFUSED|429" \
  workers/agent-zero/logs/*.log > errors.txt

# Categorize errors
grep "timeout" errors.txt | wc -l  # Network timeouts
grep "429" errors.txt | wc -l      # Rate limits
grep "ENOENT" errors.txt | wc -l   # File not found
```

### 3. Auto-Retry
**Reinicia tasks travadas automaticamente.**

```bash
# Find tasks em queue mas sem status file
for task in queue/*.json; do
  task_id=$(basename "$task" .json)
  if [ ! -f "results/${task_id}.status" ]; then
    RETRY=$(jq -r '.retry_count // 0' "$task")
    if [ "$RETRY" -lt 3 ]; then
      echo "🔄 Retrying: $task_id (attempt $((RETRY + 1))/3)"
      # Update retry count
      jq ".retry_count = $((RETRY + 1))" "$task" > "${task}.tmp"
      mv "${task}.tmp" "$task"
      # Re-dispatch
      node lib/delegate.js --task-file "$task" > "logs/${task_id}.log" 2>&1 &
    fi
  fi
done
```

### 4. Auto-Decompose (GR7 Integration)
**Quebra tasks complexas em subtasks após 3 falhas.**

```bash
decompose_task() {
  local task_file=$1
  local task_id=$(basename "$task_file" .json)

  echo "🔧 DECOMPOSING: $task_id (failed 3x)"

  # Extract task description
  DESC=$(jq -r '.prompt' "$task_file")

  # Call GR7 decomposition
  cat > "queue/decompose-${task_id}.json" <<EOF
{
  "id": "decompose-${task_id}",
  "agent": "sm",
  "task_type": "decompose-story",
  "model": "arcee-ai/trinity-large-preview:free",
  "aios_guide_path": ".aios-core/development/agents/sm.md",
  "prompt": "Decompor task em 3-5 subtasks atômicas: $DESC",
  "acceptance_criteria": [
    "Cada subtask < 30 min",
    "Subtasks independentes",
    "Clear success criteria"
  ]
}
EOF

  # Dispatch decomposition
  node lib/delegate.js --task-file "queue/decompose-${task_id}.json" &
}
```

### 5. Quality Gates
**Valida qualidade DURANTE execução, não só ao final.**

```bash
validate_quality() {
  local result_file=$1

  # Extract quality score (if present)
  SCORE=$(jq -r '.quality_score // null' "$result_file")

  if [ "$SCORE" = "null" ]; then
    echo "⚠️  No quality score - requesting self-review"
    # Trigger self-review task
    return 1
  fi

  if [ "$SCORE" -lt 7 ]; then
    echo "❌ QUALITY FAIL: score=$SCORE (threshold: 7)"
    return 1
  fi

  echo "✅ Quality OK: score=$SCORE"
  return 0
}

# Apply during monitoring
for result in results/*.json; do
  if ! validate_quality "$result"; then
    # Mark for rework
    task_id=$(basename "$result" .json)
    echo "rework" > "results/${task_id}.status"
  fi
done
```

### 6. Health Checks
**Monitora saúde do sistema durante batch.**

```bash
check_system_health() {
  # CPU usage
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  if (( $(echo "$CPU > 80" | bc -l) )); then
    echo "⚠️  High CPU: ${CPU}%"
  fi

  # Memory
  MEM=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
  if (( $(echo "$MEM > 90" | bc -l) )); then
    echo "⚠️  High Memory: ${MEM}%"
  fi

  # Disk space
  DISK=$(df -h . | tail -1 | awk '{print $5}' | cut -d'%' -f1)
  if [ "$DISK" -gt 90 ]; then
    echo "⚠️  Low Disk: ${DISK}% used"
  fi

  # Process count
  PROCS=$(ps aux | grep "node.*delegate" | grep -v grep | wc -l)
  echo "📊 Health: CPU=${CPU}% MEM=${MEM}% Disk=${DISK}% Processes=${PROCS}"
}
```

---

## v2.0 SCRIPTS

### analyze-stuck-tasks.sh
```bash
#!/bin/bash
# Analyze which tasks are stuck and why

echo "🔍 ANALYZING STUCK TASKS..."

# Find tasks in queue without status
for task in workers/agent-zero/queue/*.json; do
  task_id=$(basename "$task" .json)
  if [ ! -f "workers/agent-zero/results/${task_id}.status" ]; then
    echo "⚠️  STUCK: $task_id"

    # Check log for errors
    if [ -f "workers/agent-zero/logs/${task_id}.log" ]; then
      echo "   Last 10 lines of log:"
      tail -10 "workers/agent-zero/logs/${task_id}.log" | sed 's/^/     /'
    fi

    # Check if process still running
    if ps aux | grep -q "[n]ode.*${task_id}"; then
      echo "   Status: RUNNING (hung?)"
    else
      echo "   Status: NOT RUNNING (crashed?)"
    fi
  fi
done
```

### auto-retry-failed.sh
```bash
#!/bin/bash
# Auto-retry failed or stuck tasks

echo "🔄 AUTO-RETRY FAILED TASKS..."

for task in workers/agent-zero/queue/*.json; do
  task_id=$(basename "$task" .json)

  # Check if failed
  if [ -f "workers/agent-zero/results/${task_id}.status" ]; then
    status=$(cat "workers/agent-zero/results/${task_id}.status")
    if [ "$status" = "failed" ]; then
      RETRY=$(jq -r '.retry_count // 0' "$task")
      if [ "$RETRY" -lt 3 ]; then
        echo "🔄 Retrying: $task_id (attempt $((RETRY + 1)))"
        # Update retry count
        jq ".retry_count = $((RETRY + 1))" "$task" > "${task}.tmp"
        mv "${task}.tmp" "$task"
        # Re-dispatch
        node workers/agent-zero/lib/delegate.js --task-file "$task" \
          > "workers/agent-zero/logs/${task_id}.log" 2>&1 &
      else
        echo "❌ Max retries reached: $task_id - invoking decompose"
        bash workers/agent-zero/scripts/decompose-task.sh "$task"
      fi
    fi
  fi
done
```

### decompose-task.sh
```bash
#!/bin/bash
# GR7 Auto-Decomposition for failed tasks

task_file=$1
task_id=$(basename "$task_file" .json)

echo "🔧 GR7 DECOMPOSE: $task_id"

# Extract original prompt
DESC=$(jq -r '.prompt' "$task_file")
CRITERIA=$(jq -r '.acceptance_criteria | join(", ")' "$task_file")

# Create decomposition task
cat > "workers/agent-zero/queue/decompose-${task_id}.json" <<EOF
{
  "id": "decompose-${task_id}",
  "agent": "sm",
  "task_type": "decompose-task",
  "model": "arcee-ai/trinity-large-preview:free",
  "tools_required": ["file_read", "file_write"],
  "aios_guide_path": ".aios-core/development/agents/sm.md",
  "prompt": "Task failed 3x. Decompose into 3-5 atomic subtasks: ${DESC}",
  "acceptance_criteria": [
    "3-5 subtasks criadas",
    "Cada subtask independente",
    "Criteria originais preservados: ${CRITERIA}",
    "Subtasks < 30 min cada"
  ],
  "max_tool_iterations": 8,
  "self_review": true,
  "quality_threshold": 8
}
EOF

# Dispatch decomposition
node workers/agent-zero/lib/delegate.js \
  --task-file "workers/agent-zero/queue/decompose-${task_id}.json" &

echo "✅ Decomposition task dispatched"
```

---

## INTEGRATION WITH CEO-ZERO

### Activation Workflow
```python
# CEO-ZERO detecta batch N≥3
if tasks_count >= 3:
    # Phase 1: Dispatch com logs individuais
    for task in tasks:
        dispatch_with_logging(task)

    # Phase 2: Smart Monitor v2.0
    monitor_config = {
        "interval": 30,
        "timeout": 900,
        "stuck_threshold": 3,
        "retry_max": 3,
        "quality_threshold": 7,
        "auto_retry": True,
        "auto_decompose": True
    }
    smart_monitor(tasks, monitor_config)

    # Phase 3: Quality Gates
    validate_all_outputs()

    # Phase 4: Auto-Decompose failures
    decompose_failed_tasks()

    # Phase 5: Final Report
    generate_consolidated_report()
```

---

## FAILURE SCENARIOS v2.0

### Scenario 1: Task Stuck (No Progress)
```
⚠️  STUCK DETECTED: No progress in 90s (3 checks)
🔍 Analyzing stuck tasks...
   STUCK: wave7-analytics-router
   Last log: "Waiting for API response..."
   Status: RUNNING (hung on network call)

🔄 ACTION: Kill hung process + Retry
   ✅ Process killed (PID 12345)
   ✅ Retry dispatched (attempt 2/3)
```

### Scenario 2: Multiple Errors
```
⚠️  3 tasks with errors - analyzing...
📊 ERROR BREAKDOWN:
   - Network timeout: 2 tasks
   - Rate limit 429: 1 task

🔄 ACTION: Auto-retry with backoff
   ✅ wave7-analytics-router: retry in 30s
   ✅ wave8-migration-runner: retry in 60s (rate limit)
```

### Scenario 3: Low Quality Output
```
❌ QUALITY FAIL: wave9-error-handler (score: 5/10)
   Issues:
   - Missing error cases
   - No tests included

🔄 ACTION: Rework request
   ✅ Added to rework queue
   ✅ Detailed feedback appended to prompt
```

### Scenario 4: Task Failed 3x
```
❌ MAX RETRIES: wave10-bundle-optimization (3 attempts)
   Errors:
   - Attempt 1: Missing webpack config
   - Attempt 2: Dependency conflict
   - Attempt 3: Build timeout

🔧 ACTION: GR7 Auto-Decomposition
   ✅ Decomposing into 4 subtasks:
      1. Install webpack dependencies
      2. Create base config
      3. Add optimization plugins
      4. Test bundle build
   ✅ Subtasks dispatched
```

---

## REPORTING FORMAT v2.0

### During Monitoring (Enhanced)
```
⏳ [90/900]s [████████░░░░░░░░░░░░] 6/16 (38%) | Stuck: 0 | Errors: 1
   📊 Health: CPU=45% MEM=62% Disk=35% Processes=16
   ⚠️  1 error detected: wave8-migration-runner (rate limit)
   🔄 Auto-retry scheduled: +60s (backoff)

⏳ [120/900]s [████████████░░░░░░░░] 9/16 (56%) | Stuck: 0 | Errors: 0
   ✅ wave8-migration-runner: retry succeeded
   📈 Progress: +3 tasks completed (+50% vs last check)
```

### Final Report (Enhanced)
```
✅ BATCH COMPLETED: 16/16 tasks em 480s

📊 CONSOLIDADO FINAL:
   ✅ Sucesso direto: 12/16 (75%)
   🔄 Sucesso após retry: 3/16 (19%)
   ❌ Falhas (decomposed): 1/16 (6%)

📈 QUALIDADE:
   Average score: 8.2/10
   High quality (≥8): 13/16 (81%)
   Reworks needed: 2/16 (12%)

🔄 AÇÕES AUTÔNOMAS:
   Auto-retries: 5
   Decompositions (GR7): 1
   Quality reworks: 2

⏱️ PERFORMANCE:
   Tempo total: 480s (8 min)
   Tempo médio/task: 30s
   Stuck detections: 2 (resolved)

📁 ARQUIVOS:
   JSON results: 16
   Status files: 16
   Logs: 16
   Decomposed subtasks: 4
```

---

## WHEN TO APPLY GR8 v2.0

✅ **APPLY v2.0:**
- Batch paralelo N ≥ 3 tasks
- Tasks I/O (web scraping, PDF generation, DB queries)
- Pipeline crítico (betting, trading, prod deployment)
- Operações 24/7 daemon
- Tasks com histórico de falhas

✅ **v2.0 vs v1.0:**
- v1.0: Simple monitor (só conta completadas)
- v2.0: Smart monitor (progress, errors, retry, decompose, quality)

---

## RELATED PROTOCOLS

- **GR6**: Full Autonomy - Aplicar sem perguntar
- **GR7**: Auto-Decomposition - Quebrar tasks complexas
- **GR8 v2.0**: Smart Batch Monitoring - Este protocol
- **Token Economy**: Minimize Opus overhead, maximize Zero autonomy

---

## ENFORCEMENT

- ✅ Mandatory para N ≥ 3 tasks paralelo
- ✅ Non-negotiable (Golden Rules)
- ✅ Audit: Todas batches DEVEM ter GR8 v2.0
- ✅ Violation: Batch sem monitoring = CRÍTICO
- ✅ v2.0 Requirement: Logs individuais (não /dev/null)

---

## CHANGELOG

### v2.0 (15 FEV 2026)
- ✅ Progress Detection (stuck threshold)
- ✅ Error Analysis (log parsing)
- ✅ Auto-Retry (max 3 attempts)
- ✅ Auto-Decompose (GR7 integration)
- ✅ Quality Gates (score validation)
- ✅ Health Checks (CPU/Mem/Disk)
- ✅ Individual logs (error analysis)
- ✅ Frequency: 60s → 30s checks
- ✅ Timeout: 600s → 900s (I/O tasks)

### v1.0 (15 FEV 2026)
- ✅ Basic monitoring (count status files)
- ✅ Progress bar visual
- ✅ Timeout global
- ✅ Consolidation report

---

*GR8 v2.0 | Smart Autonomous Batch Monitoring | CEO-ZERO + Agent Zero*
*Efetivo: 15 FEV 2026 | Autoria: Zeus (CEO-ZERO) + User Request*
