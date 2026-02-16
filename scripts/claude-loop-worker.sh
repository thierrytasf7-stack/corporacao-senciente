#!/bin/bash
# claude-loop-worker.sh - Loop SEMPRE RODANDO que exec Claude instantaneamente
# Overhead mínimo: só bash poll (0.001s) vs startup Python daemon (0.1s)

WORKER=${1:-sentinela}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QUEUE_DIR="$ROOT/.queue/$WORKER"
OUTPUT_DIR="$ROOT/.output/$WORKER"
SESSION_FILE="$ROOT/.session_$WORKER.txt"

# Criar dirs
mkdir -p "$QUEUE_DIR" "$OUTPUT_DIR"

# Limpar env CLAUDECODE* (nested session check)
unset $(env | grep ^CLAUDECODE | cut -d= -f1)

# Definir bash path para Claude (PATH CORRETO: usr/bin, não bin!)
export CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'

cd "$ROOT"

log() {
    echo "[$(date +%H:%M:%S)] [LOOP-$WORKER] $*"
}

log "Bash loop worker iniciado (PID: $$)"
log "Monitorando: $QUEUE_DIR"
log "(Ctrl+C para sair)"
echo

task_count=0

while true; do
    # Buscar próximo prompt (FIFO)
    prompt_file=$(ls -1 "$QUEUE_DIR"/*.prompt 2>/dev/null | sort | head -1)

    if [ -n "$prompt_file" ]; then
        task_count=$((task_count + 1))

        log "TASK #$task_count: $(basename "$prompt_file")"

        # Ler prompt
        prompt=$(<"$prompt_file")

        # Session ID
        session_id=""
        if [ -f "$SESSION_FILE" ]; then
            session_id=$(<"$SESSION_FILE")
        fi

        # Executar Claude (ZERO delay - bash já está rodando!)
        log "Executando Claude ($( wc -c <<< "$prompt") chars)..."

        if [ -n "$session_id" ]; then
            output=$(claude --dangerously-skip-permissions -p "$prompt" --resume "$session_id" 2>&1)
        else
            output=$(claude --dangerously-skip-permissions -p "$prompt" 2>&1)
        fi

        # Salvar output
        echo "$output" > "$OUTPUT_DIR/task_$task_count.txt"

        # Latest symlink
        rm -f "$OUTPUT_DIR/latest.txt"
        ln -s "task_$task_count.txt" "$OUTPUT_DIR/latest.txt" 2>/dev/null || \
            cp "$OUTPUT_DIR/task_$task_count.txt" "$OUTPUT_DIR/latest.txt"

        # Done marker
        touch "$OUTPUT_DIR/task_$task_count.done"

        # Extrair session ID se novo
        if [ -z "$session_id" ]; then
            new_session=$(echo "$output" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
            if [ -n "$new_session" ]; then
                echo "$new_session" > "$SESSION_FILE"
                log "Session salva: ${new_session:0:12}..."
            fi
        fi

        # Remover prompt processado
        rm "$prompt_file"

        log "TASK #$task_count CONCLUIDA ($(wc -c < "$OUTPUT_DIR/task_$task_count.txt") bytes)"
        echo
    fi

    # Poll rápido (0.5s)
    sleep 0.5
done
