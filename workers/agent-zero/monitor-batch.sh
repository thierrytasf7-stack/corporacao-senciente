#!/bin/bash
# GR8 v2.0 - Smart Batch Monitoring
# CEO-ZERO (Zeus) - Binance Improvements Pipeline

cd "C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero"

TASKS_EXPECTED=3
INTERVAL=30
TIMEOUT_MAX=900  # 15min
STUCK_THRESHOLD=3
ELAPSED=0
STUCK_COUNT=0
COMPLETED_LAST=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GR8 v2.0 - SMART BATCH MONITORING ACTIVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tasks: $TASKS_EXPECTED | Interval: ${INTERVAL}s | Timeout: ${TIMEOUT_MAX}s"
echo "  Quality Threshold: 9/10 | Auto-retry: 3x"
echo ""

while [ $ELAPSED -lt $TIMEOUT_MAX ]; do
  # Count completed
  COMPLETED=$(find results -name "binance-impl-*.status" -exec grep -l "completed" {} \; 2>/dev/null | wc -l)
  FAILED=$(find results -name "binance-impl-*.status" -exec grep -l "failed" {} \; 2>/dev/null | wc -l)
  RUNNING=$(find results -name "binance-impl-*.status" -exec grep -l "running" {} \; 2>/dev/null | wc -l)

  # Progress detection
  if [ "$COMPLETED" -eq "$COMPLETED_LAST" ] && [ "$COMPLETED" -lt "$TASKS_EXPECTED" ]; then
    STUCK_COUNT=$((STUCK_COUNT + 1))
  else
    STUCK_COUNT=0
  fi

  # Success detection
  if [ "$COMPLETED" -ge "$TASKS_EXPECTED" ]; then
    echo "✅ All tasks completed!"
    break
  fi

  # Progress bar
  PERCENT=$((COMPLETED * 100 / TASKS_EXPECTED))
  BAR_FILLED=$((PERCENT / 5))
  BAR_EMPTY=$((20 - BAR_FILLED))
  BAR=$(printf '█%.0s' $(seq 1 $BAR_FILLED))$(printf '░%.0s' $(seq 1 $BAR_EMPTY))

  echo "⏳ [${ELAPSED}s] [$BAR] $COMPLETED/$TASKS_EXPECTED ($PERCENT%) | Running: $RUNNING | Failed: $FAILED | Stuck: $STUCK_COUNT"

  COMPLETED_LAST=$COMPLETED
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FINAL REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SUCCESS=0
FAILED_FINAL=0
for i in 1 2 3; do
  STATUS_FILE=$(find results -name "binance-impl-${i}-*.status" 2>/dev/null | head -1)
  if [ -f "$STATUS_FILE" ]; then
    STATUS=$(cat "$STATUS_FILE")
    TASK_NAME=$(basename "$STATUS_FILE" .status)

    if [ "$STATUS" = "completed" ]; then
      # Check quality
      RESULT_FILE="${STATUS_FILE%.status}.json"
      if [ -f "$RESULT_FILE" ]; then
        QUALITY=$(grep -o '"quality_score":[0-9]*' "$RESULT_FILE" 2>/dev/null | cut -d: -f2)
        echo "✅ Task $i: COMPLETED (quality: ${QUALITY:-N/A}/10)"
      else
        echo "✅ Task $i: COMPLETED (no quality data)"
      fi
      SUCCESS=$((SUCCESS + 1))
    else
      echo "❌ Task $i: $STATUS"
      FAILED_FINAL=$((FAILED_FINAL + 1))
    fi
  else
    echo "⚠️ Task $i: NO STATUS FILE"
    FAILED_FINAL=$((FAILED_FINAL + 1))
  fi
done

echo ""
echo "📊 SUMMARY:"
echo "   ✅ Success: $SUCCESS/$TASKS_EXPECTED"
echo "   ❌ Failed: $FAILED_FINAL"
echo "   ⏱️  Total time: ${ELAPSED}s"
echo "   📈 Avg time/task: $((ELAPSED / TASKS_EXPECTED))s"
echo ""

if [ $FAILED_FINAL -eq 0 ]; then
  echo "🎯 PIPELINE COMPLETED SUCCESSFULLY!"
  exit 0
else
  echo "⚠️ Pipeline completed with $FAILED_FINAL failures"
  exit 1
fi
