"""
watcher-auto.py - Watcher 100% AUTOMATICO
Detecta triggers e envia AUTOMATICAMENTE para Claude usando pyautogui
"""
import os
import sys
import time
import pyperclip
import pyautogui
from datetime import datetime

# Config
WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRIGGER_FILE = os.path.join(ROOT, f".trigger_{WORKER_NAME}")
PROMPT_FILE = os.path.join(ROOT, f".prompt_{WORKER_NAME}.txt")
COUNTER_FILE = os.path.join(ROOT, f".counter_{WORKER_NAME}.txt")

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

# Delays
DELAYS = {"sentinela": 90, "escrivao": 210, "revisador": 330}
POLL_INTERVAL = 2
REACTIVATE_INTERVAL = 10

# Configuração pyautogui
pyautogui.PAUSE = 0.5  # Pausa entre comandos
pyautogui.FAILSAFE = True  # Move mouse para canto para abortar

def log(msg, color=None):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [AUTO] {msg}", flush=True)

def get_counter():
    if os.path.exists(COUNTER_FILE):
        try:
            with open(COUNTER_FILE, 'r') as f:
                return int(f.read().strip())
        except:
            pass
    return 0

def set_counter(n):
    with open(COUNTER_FILE, 'w') as f:
        f.write(str(n))

def send_to_claude(text):
    """Envia texto para Claude AUTOMATICAMENTE"""
    try:
        # 1. Copiar para clipboard
        pyperclip.copy(text)
        log(f"Texto copiado ({len(text)} chars)")

        # 2. Navegar para pane do Claude
        # Windows Terminal: Ctrl+Shift+] vai para próximo pane
        # Watcher está na pane 2, Claude na pane 3
        # Então: 1x Ctrl+Shift+] vai para Claude
        log("Navegando para pane Claude...")
        pyautogui.hotkey('ctrl', 'shift', ']')
        time.sleep(0.5)

        # 3. Colar (Ctrl+V)
        log("Colando texto...")
        pyautogui.hotkey('ctrl', 'v')
        time.sleep(0.3)

        # 4. Enviar (Enter)
        log("Enviando Enter...")
        pyautogui.press('enter')
        time.sleep(0.3)

        # 5. Voltar para pane do watcher
        # Ctrl+Shift+[ vai para pane anterior
        log("Voltando para watcher...")
        pyautogui.hotkey('ctrl', 'shift', '[')
        time.sleep(0.3)

        log("Texto enviado com SUCESSO!")
        return True

    except Exception as e:
        log(f"ERRO ao enviar: {e}")
        return False

def main():
    os.chdir(ROOT)

    print("\n" + "="*60)
    print(f"  WATCHER AUTOMATICO - {WORKER_NAME.upper()}")
    print(f"  Envia triggers para Claude SEM INTERVENCAO MANUAL")
    print("="*60 + "\n")

    # Delay inicial
    delay = DELAYS.get(WORKER_NAME, 0)
    if delay:
        log(f"Aguardando {delay}s (Claude inicializar + CEO ativar)...")
        for i in range(delay // 30):
            time.sleep(30)
            elapsed = (i + 1) * 30
            remaining = delay - elapsed
            log(f"  {elapsed}s/{delay}s (faltam {remaining}s)")
        if delay % 30:
            time.sleep(delay % 30)

    # Enviar CEO-ZERO inicial
    log("Enviando CEO-ZERO automaticamente...")
    if send_to_claude(CEO_MESSAGE):
        log("CEO-ZERO ativado!")
    else:
        log("AVISO: Falha ao enviar CEO-ZERO. Tentando continuar...")

    time.sleep(5)

    log("Iniciando monitoramento de triggers...")
    print()

    task_count = get_counter()

    # Loop principal
    while True:
        try:
            if os.path.exists(TRIGGER_FILE):
                if os.path.exists(PROMPT_FILE):
                    task_count += 1

                    log(f"TRIGGER #{task_count} DETECTADO!")

                    with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
                        prompt = f.read()

                    if send_to_claude(prompt):
                        # Remover trigger
                        os.remove(TRIGGER_FILE)
                        set_counter(task_count)
                        log(f"Task #{task_count} processada!")

                        # A cada 10 tasks, reativar CEO-ZERO
                        if task_count % REACTIVATE_INTERVAL == 0:
                            log(f"Task #{task_count} - Reativando CEO-ZERO...")
                            time.sleep(3)
                            send_to_claude(CEO_MESSAGE)
                    else:
                        log("Falha ao enviar. Trigger mantido para retry.")
                else:
                    # Trigger sem prompt
                    os.remove(TRIGGER_FILE)

            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            log("Encerrando watcher...")
            break
        except Exception as e:
            log(f"Erro no loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
