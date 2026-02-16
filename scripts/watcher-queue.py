"""
watcher-queue.py - Watcher que enfileira prompts para daemon processar
Comunicação: Sentinela → trigger → watcher → .queue/*.prompt → daemon
"""
import os
import sys
import time
from pathlib import Path
from datetime import datetime

WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = Path(__file__).parent.parent

# Arquivos de comunicação
TRIGGER_FILE = ROOT / f".trigger_{WORKER_NAME}"
PROMPT_FILE = ROOT / f".prompt_{WORKER_NAME}.txt"
COUNTER_FILE = ROOT / f".counter_{WORKER_NAME}.txt"
QUEUE_DIR = ROOT / ".queue" / WORKER_NAME
OUTPUT_DIR = ROOT / ".output" / WORKER_NAME

ROLES = {
    "sentinela": "Genesis - gera stories de evolucao senciente",
    "escrivao": "Trabalhador - implementa stories do backlog",
    "revisador": "Revisor - revisa e aprova stories completadas"
}

CEO_MESSAGE = f"""Voce e o worker '{WORKER_NAME}' da Diana Corporacao Senciente.
Papel: {ROLES.get(WORKER_NAME, "Worker")}

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero com custo minimo.
Use *fire para tasks simples e *batch para multiplas.
Delegue para Agent Zero sempre que possivel (modelos free).

Confirme ativacao respondendo: WORKER {WORKER_NAME.upper()} ONLINE"""

DELAYS = {"sentinela": 90, "escrivao": 210, "revisador": 330}
POLL_INTERVAL = 2
REACTIVATE_INTERVAL = 10

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [WATCHER-{WORKER_NAME.upper()}] {msg}", flush=True)

def get_counter():
    if COUNTER_FILE.exists():
        try:
            return int(COUNTER_FILE.read_text().strip())
        except:
            pass
    return 0

def set_counter(n):
    COUNTER_FILE.write_text(str(n))

def send_to_queue(prompt):
    """Enfileira prompt para daemon processar"""
    # Criar diretório de fila se não existe
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)

    # Criar arquivo com timestamp (FIFO order)
    timestamp = int(time.time() * 1000)
    prompt_file = QUEUE_DIR / f"{timestamp}.prompt"

    try:
        prompt_file.write_text(prompt, encoding='utf-8')
        log(f"Prompt enfileirado: {prompt_file.name} ({len(prompt)} chars)")
        return prompt_file
    except Exception as e:
        log(f"ERRO ao enfileirar: {e}")
        return None

def wait_for_completion(task_num, timeout=300):
    """Aguarda daemon processar e sinalizar conclusão"""
    done_file = OUTPUT_DIR / f"task_{task_num}.done"

    waited = 0
    while not done_file.exists() and waited < timeout:
        time.sleep(1)
        waited += 1

    if done_file.exists():
        log(f"Task #{task_num} CONCLUIDA pelo daemon!")
        return True
    else:
        log(f"TIMEOUT aguardando task #{task_num}")
        return False

def main():
    os.chdir(ROOT)

    print("\n" + "="*70)
    print(f"  WATCHER QUEUE - {WORKER_NAME.upper()}")
    print(f"  Comunicacao: trigger → queue → daemon")
    print("="*70 + "\n")

    # Delay inicial
    delay = DELAYS.get(WORKER_NAME, 0)
    if delay:
        log(f"Aguardando {delay}s (daemon inicializar)...")
        for i in range(delay // 30):
            time.sleep(30)
            elapsed = (i + 1) * 30
            remaining = delay - elapsed
            log(f"  {elapsed}s/{delay}s (faltam {remaining}s)")
        if delay % 30:
            time.sleep(delay % 30)

    # Enviar CEO-ZERO inicial
    log("Enviando CEO-ZERO inicial...")
    if send_to_queue(CEO_MESSAGE):
        # Aguardar processamento
        time.sleep(3)
        wait_for_completion(1, timeout=60)
    else:
        log("AVISO: Falha ao enviar CEO-ZERO")

    time.sleep(5)

    log("Iniciando monitoramento de triggers...")
    print()

    task_count = get_counter()
    ceo_task_offset = 1  # CEO-ZERO foi task #1

    # Loop principal
    while True:
        try:
            # LOOP CONTINUO: processa todas as tasks pendentes
            while TRIGGER_FILE.exists() and PROMPT_FILE.exists():
                task_count += 1
                daemon_task_num = task_count + ceo_task_offset

                log(f"TRIGGER #{task_count} DETECTADO!")

                prompt = PROMPT_FILE.read_text(encoding='utf-8')

                # Enfileirar
                if send_to_queue(prompt):
                    # Remover trigger
                    TRIGGER_FILE.unlink()
                    set_counter(task_count)

                    # Aguardar daemon concluir
                    wait_for_completion(daemon_task_num, timeout=300)

                    # A cada 10 tasks, reativar CEO-ZERO
                    if task_count % REACTIVATE_INTERVAL == 0:
                        log(f"Task #{task_count} - Reativando CEO-ZERO...")
                        time.sleep(3)
                        send_to_queue(CEO_MESSAGE)
                        ceo_task_offset += 1

                    # Breve pausa para sentinela gerar próximo
                    time.sleep(0.5)
                else:
                    log("Falha ao enfileirar. Trigger mantido.")
                    break

            # Polling normal se não há triggers
            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            log("Encerrando watcher...")
            break
        except Exception as e:
            log(f"Erro no loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
