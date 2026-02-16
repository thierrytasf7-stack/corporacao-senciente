#!/usr/bin/env bash
# BATCH 2 - Execute 5 tasks in parallel with max 5 concurrent

cd /c/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero

# Run tasks in background
node delegate.js --file queue/subtask-7.json > results/batch-2-task-7.log 2>&1 &
PID1=$!

node delegate.js --file queue/subtask-8.json > results/batch-2-task-8.log 2>&1 &
PID2=$!

node delegate.js --file queue/subtask-9.json > results/batch-2-task-9.log 2>&1 &
PID3=$!

node delegate.js --file queue/subtask-10.json > results/batch-2-task-10.log 2>&1 &
PID4=$!

node delegate.js --file queue/subtask-11.json > results/batch-2-task-11.log 2>&1 &
PID5=$!

echo "BATCH 2 started:"
echo "  Task 7 (Strategies Page): PID $PID1"
echo "  Task 8 (Backtest Page): PID $PID2"
echo "  Task 9 (Reports Page): PID $PID3"
echo "  Task 10 (tRPC Integration): PID $PID4"
echo "  Task 11 (Dark Mode + Responsive): PID $PID5"
echo ""
echo "Waiting for all tasks to complete..."

# Wait for all
wait $PID1 $PID2 $PID3 $PID4 $PID5

echo ""
echo "BATCH 2 completed!"
echo "Check results in workers/agent-zero/results/batch-2-task-*.log"
