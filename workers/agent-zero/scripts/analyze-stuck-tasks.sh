#!/bin/bash
#
# GR8 v2.0 - Analyze Stuck Tasks
# Detecta quais tasks estão travadas e por quê
#
# Uso: ./analyze-stuck-tasks.sh

QUEUE_DIR="workers/agent-zero/queue"
RESULTS_DIR="workers/agent-zero/results"
LOGS_DIR="workers/agent-zero/logs"

echo "🔍 ANALYZING STUCK TASKS..."
echo ""

STUCK_COUNT=0

# Find tasks in queue without status
for task in "$QUEUE_DIR"/*.json; do
  [ ! -f "$task" ] && continue

  task_id=$(basename "$task" .json)

  # Check if status file exists
  if [ ! -f "$RESULTS_DIR/${task_id}.status" ]; then
    STUCK_COUNT=$((STUCK_COUNT + 1))
    echo "⚠️  STUCK #$STUCK_COUNT: $task_id"

    # Check if log exists
    if [ -f "$LOGS_DIR/${task_id}.log" ]; then
      echo "   📋 Last 5 lines of log:"
      tail -5 "$LOGS_DIR/${task_id}.log" | sed 's/^/      /'

      # Analyze errors in log
      if grep -qE "error|failed|timeout|exception" "$LOGS_DIR/${task_id}.log"; then
        echo "   🚨 ERRORS DETECTED in log:"
        grep -iE "error|failed|timeout|exception" "$LOGS_DIR/${task_id}.log" | tail -3 | sed 's/^/      /'
      fi

      # Check for specific patterns
      if grep -q "ECONNREFUSED" "$LOGS_DIR/${task_id}.log"; then
        echo "   ⚠️  Issue: Connection refused (server down?)"
      fi
      if grep -q "429" "$LOGS_DIR/${task_id}.log"; then
        echo "   ⚠️  Issue: Rate limit (API throttling)"
      fi
      if grep -q "ENOENT" "$LOGS_DIR/${task_id}.log"; then
        echo "   ⚠️  Issue: File not found"
      fi
    else
      echo "   ⚠️  No log file found (task never started?)"
    fi

    # Check if process still running
    if ps aux | grep -q "[n]ode.*${task_id}"; then
      echo "   🔄 Status: RUNNING (may be hung)"

      # Get process PID
      PID=$(ps aux | grep "[n]ode.*${task_id}" | awk '{print $2}' | head -1)
      echo "   🔢 PID: $PID"

      # Check how long it's been running
      ELAPSED=$(ps -p "$PID" -o etimes= 2>/dev/null)
      if [ -n "$ELAPSED" ]; then
        echo "   ⏱️  Running for: ${ELAPSED}s"
        if [ "$ELAPSED" -gt 600 ]; then
          echo "   ⚠️  WARNING: Running > 10 min (likely stuck)"
        fi
      fi
    else
      echo "   ❌ Status: NOT RUNNING (crashed or never started)"
    fi

    # Get retry count
    if command -v jq &> /dev/null; then
      RETRY=$(jq -r '.retry_count // 0' "$task" 2>/dev/null)
      echo "   🔁 Retry count: $RETRY/3"
    fi

    echo ""
  fi
done

if [ "$STUCK_COUNT" -eq 0 ]; then
  echo "✅ No stuck tasks detected"
else
  echo "📊 SUMMARY: $STUCK_COUNT stuck tasks found"
fi

echo ""
