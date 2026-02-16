#!/bin/bash
#
# BATCH EXECUTOR WITH GR8 MONITORING (CEO-ZERO Template)
#
# Template para CEO-ZERO executar batches com monitoramento automático
# Substitua {TASKS} e {QUEUE_DIR} conforme necessário
#
# Uso: source batch-executor-with-monitor.sh
# Ou: bash batch-executor-with-monitor.sh
#

# ============================================================
# CONFIGURATION
# ============================================================

QUEUE_DIR="${1:-workers/agent-zero/queue}"
RESULTS_DIR="workers/agent-zero/results"
TASKS_PATTERN="${2:-*.json}"

# GR8 Parameters
GR8_INTERVAL_SEC=60
GR8_TIMEOUT_SEC=600

# ============================================================
# FUNCTIONS
# ============================================================

batch_dispatch() {
  local pattern="$1"
  local count=0

  echo "⚡ BATCH DISPATCH - GR8 MONITORING ATIVADO"
  echo "   Pattern: $QUEUE_DIR/$pattern"
  echo ""

  # Find all matching task files
  for task_file in "$QUEUE_DIR"/$pattern; do
    if [ -f "$task_file" ]; then
      echo "   📤 Disparando: $(basename "$task_file")"
      node lib/delegate.js --task-file "$task_file" > /dev/null 2>&1 &
      count=$((count + 1))
    fi
  done

  echo ""
  echo "✅ $count tasks disparadas. Aguardando conclusão..."
  echo ""

  wait  # Aguarda background jobs finalizarem

  echo "✅ Todos background jobs retornaram (wait completo)"
}

batch_monitor() {
  local tasks_expected=$1
  local interval=${GR8_INTERVAL_SEC}
  local timeout_max=${GR8_TIMEOUT_SEC}
  local elapsed=0
  local completed_last=0

  echo "⚡ GR8 BATCH MONITOR INICIADO"
  echo "   Tasks esperadas: $tasks_expected"
  echo "   Check interval: ${interval}s"
  echo "   Timeout máximo: ${timeout_max}s"
  echo ""

  # Loop de monitoramento
  while true; do
    # Contar tasks completadas
    completed=$(find "$RESULTS_DIR"/*.status -type f 2>/dev/null | wc -l)

    # Status visual (progress bar)
    progress=$((completed * 100 / tasks_expected))
    bars=$((progress / 5))
    empty=$((20 - bars))

    # Build progress bar
    progress_bar="["
    for ((i=0; i<bars; i++)); do progress_bar+="█"; done
    for ((i=0; i<empty; i++)); do progress_bar+="░"; done
    progress_bar+="]"

    echo "⏳ [$elapsed/$timeout_max] $progress_bar $completed/$tasks_expected ($progress%)"

    # Se todas as tasks terminaram
    if [ "$completed" -ge "$tasks_expected" ]; then
      echo ""
      echo "✅ SUCESSO! Todas as $completed tasks completadas em ${elapsed}s"
      batch_consolidate "$completed"
      return 0
    fi

    # Se timeout excedido
    if [ "$elapsed" -ge "$timeout_max" ]; then
      echo ""
      echo "⚠️ TIMEOUT APÓS ${elapsed}s"
      echo "   Completadas: $completed/$tasks_expected"
      echo "   Pendentes: $((tasks_expected - completed))"
      batch_consolidate "$completed"
      return 1
    fi

    # Sleep até próximo check
    completed_last=$completed
    sleep "$interval"
    elapsed=$((elapsed + interval))
  done
}

batch_consolidate() {
  local completed=$1

  echo ""
  echo "📊 CONSOLIDADO FINAL:"

  local succeeded=0
  local failed=0

  for status_file in "$RESULTS_DIR"/*.status; do
    if [ -f "$status_file" ]; then
      status=$(cat "$status_file")
      if [ "$status" = "completed" ]; then
        succeeded=$((succeeded + 1))
      else
        failed=$((failed + 1))
      fi
    fi
  done

  echo "   ✅ Sucesso: $succeeded"
  echo "   ❌ Falhas: $failed"
  if [ "$succeeded" -gt 0 ]; then
    echo "   📈 Taxa sucesso: $((succeeded * 100 / (succeeded + failed)))%"
  fi

  echo ""
  echo "📁 ARQUIVOS CRIADOS:"
  local json_count=$(find "$RESULTS_DIR"/*.json -type f 2>/dev/null | wc -l)
  local status_count=$(find "$RESULTS_DIR"/*.status -type f 2>/dev/null | wc -l)

  echo "   JSON results: $json_count"
  echo "   Status files: $status_count"
}

# ============================================================
# MAIN EXECUTION
# ============================================================

# Count tasks to execute
task_count=$(find "$QUEUE_DIR"/$TASKS_PATTERN -type f 2>/dev/null | wc -l)

if [ "$task_count" -eq 0 ]; then
  echo "❌ Nenhuma task encontrada em $QUEUE_DIR/$TASKS_PATTERN"
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "⚡ CEO-ZERO BATCH EXECUTOR v1.0 (com GR8)"
echo "════════════════════════════════════════════════════════"
echo "📂 Queue: $QUEUE_DIR"
echo "📊 Tasks: $task_count"
echo "🔄 Interval: ${GR8_INTERVAL_SEC}s"
echo "⏱️ Timeout: ${GR8_TIMEOUT_SEC}s"
echo "════════════════════════════════════════════════════════"
echo ""

# Execute batch with monitoring
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 1
batch_dispatch "$TASKS_PATTERN"
batch_monitor "$task_count"

echo ""
echo "════════════════════════════════════════════════════════"
echo "⚡ CEO-ZERO BATCH EXECUTOR COMPLETO"
echo "════════════════════════════════════════════════════════"
