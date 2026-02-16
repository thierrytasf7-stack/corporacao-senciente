#!/bin/bash
#
# GR8 v2.0 - Auto-Retry Failed Tasks
# Reinicia automaticamente tasks que falharam (max 3x)
#
# Uso: ./auto-retry-failed.sh

QUEUE_DIR="workers/agent-zero/queue"
RESULTS_DIR="workers/agent-zero/results"
LOGS_DIR="workers/agent-zero/logs"
RETRY_MAX=3

echo "🔄 AUTO-RETRY FAILED TASKS..."
echo ""

RETRY_COUNT=0
DECOMPOSE_COUNT=0

for task in "$QUEUE_DIR"/*.json; do
  [ ! -f "$task" ] && continue

  task_id=$(basename "$task" .json)

  # Check if failed
  if [ -f "$RESULTS_DIR/${task_id}.status" ]; then
    status=$(cat "$RESULTS_DIR/${task_id}.status")

    if [ "$status" = "failed" ]; then
      # Get current retry count
      if command -v jq &> /dev/null; then
        RETRY=$(jq -r '.retry_count // 0' "$task" 2>/dev/null)
      else
        RETRY=0
      fi

      if [ "$RETRY" -lt "$RETRY_MAX" ]; then
        RETRY_COUNT=$((RETRY_COUNT + 1))
        NEW_RETRY=$((RETRY + 1))

        echo "🔄 RETRY #$RETRY_COUNT: $task_id (attempt $NEW_RETRY/$RETRY_MAX)"

        # Update retry count in task JSON
        if command -v jq &> /dev/null; then
          jq ".retry_count = $NEW_RETRY" "$task" > "${task}.tmp"
          mv "${task}.tmp" "$task"
        fi

        # Remove old status/result to force re-execution
        rm -f "$RESULTS_DIR/${task_id}.status"
        rm -f "$RESULTS_DIR/${task_id}.json"

        # Re-dispatch task with logging
        if [ -d "workers/agent-zero" ]; then
          cd workers/agent-zero || exit 1
          node lib/delegate.js --task-file "../../$task" \
            > "../../$LOGS_DIR/${task_id}.log" 2>&1 &
          cd ../.. || exit 1
        else
          node workers/agent-zero/lib/delegate.js --task-file "$task" \
            > "$LOGS_DIR/${task_id}.log" 2>&1 &
        fi

        echo "   ✅ Re-dispatched with logging"
      else
        DECOMPOSE_COUNT=$((DECOMPOSE_COUNT + 1))
        echo "❌ MAX RETRIES: $task_id ($RETRY_MAX attempts)"
        echo "   🔧 Invoking GR7 Auto-Decomposition..."

        # Call decompose script
        if [ -f "workers/agent-zero/scripts/decompose-task.sh" ]; then
          bash workers/agent-zero/scripts/decompose-task.sh "$task"
        fi
      fi

      echo ""
    fi
  fi
done

echo "📊 SUMMARY:"
echo "   🔄 Auto-retries: $RETRY_COUNT"
echo "   🔧 Decompositions: $DECOMPOSE_COUNT"
echo ""
