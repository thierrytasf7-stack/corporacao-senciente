#!/bin/bash
#
# GR8 v2.0 - Smart Autonomous Batch Monitor
# Monitoramento inteligente com progress detection, error analysis, auto-retry
#
# Uso: ./batch-monitor.sh <tasks_esperadas> [interval_segundos] [timeout_segundos]
#
# Exemplo:
#   ./batch-monitor.sh 16 30 900  # 16 tasks, check a cada 30s, timeout 15min
#

TASKS_EXPECTED=${1:-3}
INTERVAL=${2:-30}              # v2.0: 30s (era 60s)
TIMEOUT_MAX=${3:-900}          # v2.0: 900s (era 600s)
STUCK_THRESHOLD=3              # v2.0: NEW - stuck após 3 checks
RETRY_MAX=3                    # v2.0: NEW - max retries

RESULTS_DIR="workers/agent-zero/results"
LOGS_DIR="workers/agent-zero/logs"
SCRIPTS_DIR="workers/agent-zero/scripts"

ELAPSED=0
COMPLETED_LAST=0
STUCK_COUNT=0
TOTAL_RETRIES=0
TOTAL_DECOMPOSITIONS=0

echo "⚡ GR8 v2.0 SMART BATCH MONITOR INICIADO"
echo "   Tasks esperadas: $TASKS_EXPECTED"
echo "   Check interval: ${INTERVAL}s (v2.0: progress detection)"
echo "   Timeout máximo: ${TIMEOUT_MAX}s"
echo "   Stuck threshold: $STUCK_THRESHOLD checks"
echo "   Auto-retry: ENABLED (max $RETRY_MAX attempts)"
echo "   Auto-decompose: ENABLED (via GR7)"
echo ""

# Loop de monitoramento inteligente
while true; do
  # Contar tasks completadas
  COMPLETED=$(find "$RESULTS_DIR"/*.status -type f 2>/dev/null | wc -l)

  # ✅ v2.0: Progress Detection
  if [ "$COMPLETED" -eq "$COMPLETED_LAST" ]; then
    STUCK_COUNT=$((STUCK_COUNT + 1))
    if [ "$STUCK_COUNT" -ge "$STUCK_THRESHOLD" ]; then
      echo ""
      echo "🚨 STUCK DETECTED: No progress in $(($STUCK_COUNT * $INTERVAL))s"

      # Analyze stuck tasks
      if [ -f "$SCRIPTS_DIR/analyze-stuck-tasks.sh" ]; then
        bash "$SCRIPTS_DIR/analyze-stuck-tasks.sh"
      fi

      # Auto-retry failed tasks
      if [ -f "$SCRIPTS_DIR/auto-retry-failed.sh" ]; then
        bash "$SCRIPTS_DIR/auto-retry-failed.sh"
        TOTAL_RETRIES=$((TOTAL_RETRIES + 1))
      fi

      STUCK_COUNT=0
      echo ""
    fi
  else
    STUCK_COUNT=0
  fi

  # 📊 v2.0: Error Analysis
  FAILED=$(grep -l "failed" "$RESULTS_DIR"/*.status 2>/dev/null | wc -l)
  if [ "$FAILED" -gt 0 ]; then
    echo "⚠️  $FAILED tasks with 'failed' status"
  fi

  # Status visual (progress bar)
  PROGRESS=$((COMPLETED * 100 / TASKS_EXPECTED))
  [ "$PROGRESS" -gt 100 ] && PROGRESS=100
  BARS=$((PROGRESS / 5))
  EMPTY=$((20 - BARS))
  PROGRESS_BAR=$(printf '█%.0s' $(seq 1 $BARS) 2>/dev/null)$(printf '░%.0s' $(seq 1 $EMPTY) 2>/dev/null)

  # v2.0: Enhanced progress report
  echo "⏳ [$ELAPSED/$TIMEOUT_MAX]s $PROGRESS_BAR $COMPLETED/$TASKS_EXPECTED ($PROGRESS%) | Stuck: $STUCK_COUNT | Errors: $FAILED"

  # Se todas as tasks terminaram
  if [ "$COMPLETED" -ge "$TASKS_EXPECTED" ]; then
    echo ""
    echo "✅ SUCESSO! Todas as $COMPLETED tasks completadas em ${ELAPSED}s"

    # v2.0: Consolidar resultados com qualidade
    SUCCEEDED=0
    FAILED_FINAL=0
    TOTAL_QUALITY=0
    QUALITY_COUNT=0

    for status_file in "$RESULTS_DIR"/*.status; do
      if [ -f "$status_file" ]; then
        status=$(cat "$status_file")
        if [ "$status" = "completed" ]; then
          SUCCEEDED=$((SUCCEEDED + 1))

          # Check quality score if available
          result_file="${status_file%.status}.json"
          if [ -f "$result_file" ] && command -v jq &> /dev/null; then
            SCORE=$(jq -r '.quality_score // null' "$result_file" 2>/dev/null)
            if [ "$SCORE" != "null" ]; then
              TOTAL_QUALITY=$((TOTAL_QUALITY + SCORE))
              QUALITY_COUNT=$((QUALITY_COUNT + 1))
            fi
          fi
        else
          FAILED_FINAL=$((FAILED_FINAL + 1))
        fi
      fi
    done

    echo ""
    echo "📊 CONSOLIDADO FINAL (v2.0):"
    echo "   ✅ Sucesso: $SUCCEEDED/$COMPLETED"
    echo "   ❌ Falhas: $FAILED_FINAL/$COMPLETED"
    if [ "$COMPLETED" -gt 0 ]; then
      echo "   📈 Taxa sucesso: $((SUCCEEDED * 100 / COMPLETED))%"
    fi

    # v2.0: Quality metrics
    if [ "$QUALITY_COUNT" -gt 0 ]; then
      AVG_QUALITY=$((TOTAL_QUALITY / QUALITY_COUNT))
      echo ""
      echo "📈 QUALIDADE:"
      echo "   Average score: ${AVG_QUALITY}/10"
      echo "   Tasks with scores: $QUALITY_COUNT/$SUCCEEDED"
    fi

    # v2.0: Autonomous actions summary
    echo ""
    echo "🔄 AÇÕES AUTÔNOMAS:"
    echo "   Auto-retry cycles: $TOTAL_RETRIES"
    echo "   Decompositions (GR7): $TOTAL_DECOMPOSITIONS"

    echo ""
    break
  fi

  # Se timeout excedido
  if [ "$ELAPSED" -ge "$TIMEOUT_MAX" ]; then
    echo ""
    echo "⚠️ TIMEOUT APÓS ${ELAPSED}s"
    echo "   Completadas: $COMPLETED/$TASKS_EXPECTED"
    echo "   Pendentes: $((TASKS_EXPECTED - COMPLETED))"

    # v2.0: Final analysis on timeout
    if [ -f "$SCRIPTS_DIR/analyze-stuck-tasks.sh" ]; then
      echo ""
      echo "🔍 Final stuck analysis:"
      bash "$SCRIPTS_DIR/analyze-stuck-tasks.sh"
    fi

    echo ""
    break
  fi

  # Sleep até próximo check
  COMPLETED_LAST=$COMPLETED
  sleep "$INTERVAL"
  ELAPSED=$((ELAPSED + INTERVAL))
done

# v2.0: Listar arquivos criados (enhanced)
echo ""
echo "📁 ARQUIVOS CRIADOS:"
JSON_COUNT=$(ls -1 "$RESULTS_DIR"/*.json 2>/dev/null | wc -l)
STATUS_COUNT=$(ls -1 "$RESULTS_DIR"/*.status 2>/dev/null | wc -l)
LOG_COUNT=$(ls -1 "$LOGS_DIR"/*.log 2>/dev/null | wc -l)

echo "   JSON results: $JSON_COUNT"
echo "   Status files: $STATUS_COUNT"
echo "   Logs: $LOG_COUNT"

# v2.0: Check for decomposed subtasks
SUBTASK_COUNT=$(ls -1 workers/agent-zero/queue/subtask-*.json 2>/dev/null | wc -l)
if [ "$SUBTASK_COUNT" -gt 0 ]; then
  echo "   Decomposed subtasks: $SUBTASK_COUNT"
fi

echo ""
echo "✅ GR8 v2.0 Smart Monitor concluído"
echo ""
