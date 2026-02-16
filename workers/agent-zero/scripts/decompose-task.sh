#!/bin/bash
#
# GR8 v2.0 - Auto-Decompose Failed Task (GR7 Integration)
# Quebra task complexa em subtasks atômicas após 3 falhas
#
# Uso: ./decompose-task.sh <task_file>

task_file=$1

if [ ! -f "$task_file" ]; then
  echo "❌ Task file not found: $task_file"
  exit 1
fi

task_id=$(basename "$task_file" .json)

echo "🔧 GR7 AUTO-DECOMPOSITION: $task_id"
echo ""

# Extract original prompt and criteria
if command -v jq &> /dev/null; then
  DESC=$(jq -r '.prompt' "$task_file" 2>/dev/null)
  CRITERIA=$(jq -r '.acceptance_criteria | join(", ")' "$task_file" 2>/dev/null)
  AGENT=$(jq -r '.agent // "dev"' "$task_file" 2>/dev/null)
else
  echo "⚠️  jq not found - using simplified decomposition"
  DESC="Complex task"
  CRITERIA="Original criteria"
  AGENT="dev"
fi

echo "📋 Original task: $DESC"
echo "📋 Original criteria: $CRITERIA"
echo ""

# Create decomposition task for Agent Zero
DECOMPOSE_FILE="workers/agent-zero/queue/decompose-${task_id}.json"

cat > "$DECOMPOSE_FILE" <<EOF
{
  "id": "decompose-${task_id}",
  "agent": "sm",
  "task_type": "decompose-task",
  "model": "arcee-ai/trinity-large-preview:free",
  "tools_required": ["file_read", "file_write"],
  "aios_guide_path": ".aios-core/development/agents/sm.md",
  "prompt": "Task '${task_id}' failed 3x. Decompose into 3-5 atomic subtasks. Original: ${DESC}",
  "acceptance_criteria": [
    "3-5 subtasks criadas",
    "Cada subtask independente",
    "Cada subtask < 30 min",
    "Criteria preservados: ${CRITERIA}",
    "Saved to workers/agent-zero/queue/subtask-${task_id}-*.json"
  ],
  "context_files": [
    "${task_file}"
  ],
  "max_tool_iterations": 10,
  "self_review": true,
  "quality_threshold": 8
}
EOF

echo "✅ Decomposition task created: $DECOMPOSE_FILE"
echo ""

# Dispatch decomposition task
if [ -d "workers/agent-zero" ]; then
  cd workers/agent-zero || exit 1
  echo "🚀 Dispatching decomposition task..."
  node lib/delegate.js --task-file "../../$DECOMPOSE_FILE" \
    > "../../workers/agent-zero/logs/decompose-${task_id}.log" 2>&1 &
  cd ../.. || exit 1
else
  echo "🚀 Dispatching decomposition task..."
  node workers/agent-zero/lib/delegate.js --task-file "$DECOMPOSE_FILE" \
    > "workers/agent-zero/logs/decompose-${task_id}.log" 2>&1 &
fi

echo "✅ Decomposition task dispatched"
echo "📋 Monitor log: workers/agent-zero/logs/decompose-${task_id}.log"
echo ""
echo "⏳ Subtasks will be created in queue/ after decomposition completes"
echo ""
