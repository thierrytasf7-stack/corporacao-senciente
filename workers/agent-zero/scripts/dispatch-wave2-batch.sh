#!/bin/bash
# Wave 2 - Batch Paralelo (5 tasks)

cd workers/agent-zero

echo "[WAVE 2] Dispatching 5 tasks in parallel..."

node delegate.js --file queue/wave2-backend-security.json > /dev/null 2>&1 &
PID1=$!

node delegate.js --file queue/wave2-backend-performance.json > /dev/null 2>&1 &
PID2=$!

node delegate.js --file queue/wave2-frontend-security.json > /dev/null 2>&1 &
PID3=$!

node delegate.js --file queue/wave2-frontend-ux.json > /dev/null 2>&1 &
PID4=$!

node delegate.js --file queue/wave2-compliance.json > /dev/null 2>&1 &
PID5=$!

echo "[WAVE 2] 5 tasks dispatched (PIDs: $PID1 $PID2 $PID3 $PID4 $PID5)"

# GR8 Monitoring Loop
TASKS_EXPECTED=5
INTERVAL=30
TIMEOUT_MAX=600
ELAPSED=0

echo "[WAVE 2] Monitoring until 100% complete..."

while [ $ELAPSED -lt $TIMEOUT_MAX ]; do
  COMPLETED=$(find results/wave2-*.status -type f 2>/dev/null | wc -l)

  if [ "$COMPLETED" -ge "$TASKS_EXPECTED" ]; then
    echo "✅ [WAVE 2] All $COMPLETED tasks completed!"
    break
  fi

  echo "⏳ [WAVE 2] [$ELAPSED/$TIMEOUT_MAX]s - $COMPLETED/$TASKS_EXPECTED tasks done"
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

# Report
echo ""
echo "📊 [WAVE 2] CONSOLIDADO:"
ls -lah results/wave2-*.status 2>/dev/null | wc -l
echo " tasks completed"
