"""
watcher-ipc.py - Watcher com comunicação inter-processo (IPC)
Comunicação sistêmica: Watcher escreve arquivo → Wrapper lê → stdin Claude
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
COMMAND_FILE = ROOT / f".claude_cmd_{WORKER_NAME}.txt"  # IPC com wrapper
LOCK_FILE = ROOT / f".claude_cmd_{WORKER_NAME}.lock"

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
    print(f"[{ts}] [IPC-WATCHER] {msg}", flush=True)

def get_counter():
    if COUNTER_FILE.exists():
        try:
            return int(COUNTER_FILE.read_text().strip())
        except:
            pass
    return 0

def set_counter(n):
    COUNTER_FILE.write_text(str(n))

def send_command_to_claude(text):
    """Envia comando para wrapper via arquivo (IPC)"""
    try:
        # Aguardar lock ser liberado
        timeout = 10
        waited = 0
        while LOCK_FILE.exists() and waited < timeout:
            time.sleep(0.1)
            waited += 0.1

        if LOCK_FILE.exists():
            log("TIMEOUT aguardando lock. Comando pode falhar.")

        # Escrever comando
        COMMAND_FILE.write_text(text, encoding='utf-8')
        log(f"Comando enviado via IPC ({len(text)} chars)")

        # Aguardar wrapper DETECTAR comando (lock aparece = detectado)
        waited = 0
        while not LOCK_FILE.exists() and waited < 3:
            time.sleep(0.1)
            waited += 0.1

        if LOCK_FILE.exists():
            log("Comando detectado pelo wrapper!")
            return True
        elif not COMMAND_FILE.exists():
            log("Comando ja processado!")
            return True
        else:
            log("AVISO: Wrapper nao detectou comando em 3s")
            return False

    except Exception as e:
        log(f"Erro ao enviar comando: {e}")
        return False

def main():
    os.chdir(ROOT)

    print("\n" + "="*60)
    print(f"  WATCHER IPC - {WORKER_NAME.upper()}")
    print(f"  Comunicacao sistemica via IPC (inter-process)")
    print("="*60 + "\n")

    # Delay inicial
    delay = DELAYS.get(WORKER_NAME, 0)
    if delay:
        log(f"Aguardando {delay}s (Claude inicializar)...")
        for i in range(delay // 30):
            time.sleep(30)
            elapsed = (i + 1) * 30
            remaining = delay - elapsed
            log(f"  {elapsed}s/{delay}s (faltam {remaining}s)")
        if delay % 30:
            time.sleep(delay % 30)

    # Enviar CEO-ZERO inicial
    log("Enviando CEO-ZERO via IPC...")
    if send_command_to_claude(CEO_MESSAGE):
        log("CEO-ZERO enviado!")
    else:
        log("AVISO: Falha ao enviar CEO-ZERO")

    time.sleep(5)

    log("Iniciando monitoramento de triggers...")
    print()

    task_count = get_counter()

    # Loop principal
    while True:
        try:
            # LOOP CONTINUO: processa todas as tasks pendentes sem delay
            tasks_processed = False

            while TRIGGER_FILE.exists() and PROMPT_FILE.exists():
                task_count += 1
                tasks_processed = True

                log(f"TRIGGER #{task_count} DETECTADO!")

                prompt = PROMPT_FILE.read_text(encoding='utf-8')

                if send_command_to_claude(prompt):
                    TRIGGER_FILE.unlink()
                    set_counter(task_count)
                    log(f"Task #{task_count} enviada via IPC!")

                    # Aguardar wrapper sinalizar conclusão (lock liberado)
                    wait_time = 0
                    while LOCK_FILE.exists() and wait_time < 300:  # Max 5min
                        time.sleep(1)
                        wait_time += 1

                    log(f"Task #{task_count} CONCLUIDA pelo wrapper!")

                    # A cada 10 tasks, reativar CEO-ZERO
                    if task_count % REACTIVATE_INTERVAL == 0:
                        log(f"Task #{task_count} - Reativando CEO-ZERO...")
                        time.sleep(3)
                        send_command_to_claude(CEO_MESSAGE)

                    # Verificar IMEDIATAMENTE se há próximo trigger
                    # (sem sleep - processamento contínuo)
                    time.sleep(0.5)  # Breve pausa para sentinela gerar próximo
                    continue

                else:
                    log("Falha ao enviar. Trigger mantido.")
                    break

            # Se não há mais triggers, aguardar polling normal
            if not tasks_processed:
                time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            log("Encerrando watcher...")
            break
        except Exception as e:
            log(f"Erro no loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
