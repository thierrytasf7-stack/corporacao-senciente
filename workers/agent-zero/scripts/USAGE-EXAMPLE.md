# GR8 v2.0 - USAGE EXAMPLES

## Exemplo Completo: Waves 7-11 com Smart Monitoring

### Cenário
16 tasks pendentes (Waves 7-11) precisam executar com monitoramento autônomo completo.

---

## PHASE 1: Dispatch com Logs Individuais

```bash
# ✅ v2.0: Logs individuais para error analysis
cd workers/agent-zero

# Criar diretório de logs se não existe
mkdir -p logs

# Dispatch com logging
for task in queue/wave*.json; do
  task_id=$(basename "$task" .json)
  echo "📤 Dispatching: $task_id"
  node lib/delegate.js --task-file "$task" > "logs/${task_id}.log" 2>&1 &
done

wait
echo "✅ Dispatch completo - 16 tasks em paralelo"
```

---

## PHASE 2: Smart Monitor v2.0

```bash
cd workers/agent-zero/scripts

# v2.0: 30s interval, 900s timeout, auto-retry, auto-decompose
bash batch-monitor.sh 16 30 900
```

---

**Output completo em**: `workers/agent-zero/scripts/USAGE-EXAMPLE.md` (este arquivo)

**Status**: ✅ READY
**Version**: GR8 v2.0
