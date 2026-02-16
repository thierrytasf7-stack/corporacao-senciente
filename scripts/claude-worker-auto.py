"""
claude-worker-auto.py - Worker automatizado com CEO-ZERO cíclico
Arquitetura: Inicia Claude CLI, ativa CEO-ZERO, processa triggers automaticamente.
A cada 10 tasks: clear + reativa CEO-ZERO.
"""
import os
import sys
import time
import subprocess
import threading
from pathlib import Path
from datetime import datetime

# Configuração
WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = Path(__file__).parent.parent
TRIGGER_FILE = ROOT / f".trigger_{WORKER_NAME}"
PROMPT_FILE = ROOT / f".prompt_{WORKER_NAME}.txt"
LOCK_FILE = ROOT / f".worker_{WORKER_NAME}.lock"
SESSION_FILE = ROOT / f".session_{WORKER_NAME}.txt"
COUNTER_FILE = ROOT / f".counter_{WORKER_NAME}.txt"

MODEL = "claude-sonnet-4-5-20250929"
REACTIVATE_INTERVAL = 10  # A cada 10 tasks, reativa CEO-ZERO
INIT_DELAY = 60  # Aguarda Claude iniciar (segundos) - AUMENTADO para garantir inicializacao completa
CEO_ACTIVATION_DELAY = 30  # Aguarda CEO-ZERO ativar (segundos)
POLL_INTERVAL = 2  # Polling de triggers (segundos)

# Delays escalonados para inicialização sequencial (evita sobrecarga)
STARTUP_DELAYS = {
    "sentinela": 0,      # Genesis inicia primeiro (imediato)
    "escrivao": 120,     # Aguarda 2 min (Genesis completar)
    "revisador": 240,    # Aguarda 4 min (Genesis + Escrivao)
    "corp": 0            # Corp independente (pode iniciar junto)
}

# Mensagens de ativação CEO-ZERO
CEO_INIT_MESSAGE = """Voce e o worker '{worker}' da Diana Corporacao Senciente.
Papel: {role}

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero com custo minimo.
Use *fire para tasks simples e *batch para multiplas.
Delegue para Agent Zero sempre que possivel (modelos free).

Confirme ativacao respondendo: WORKER {worker} ONLINE"""

WORKER_ROLES = {
    "sentinela": "Genesis - gera stories de evolucao senciente",
    "escrivao": "Trabalhador - implementa stories do backlog",
    "revisador": "Revisor - revisa e aprova stories completadas",
    "corp": "Orquestrador corporativo geral"
}


class ClaudeWorker:
    def __init__(self, worker_name):
        self.worker_name = worker_name
        self.role = WORKER_ROLES.get(worker_name, "Worker generico")
        self.task_count = self.load_counter()
        self.session_id = self.load_session_id()
        self.process = None
        self.running = True

    def load_counter(self):
        """Carrega contador de tasks processadas."""
        if COUNTER_FILE.exists():
            try:
                return int(COUNTER_FILE.read_text().strip())
            except:
                pass
        return 0

    def save_counter(self):
        """Salva contador de tasks."""
        COUNTER_FILE.write_text(str(self.task_count))

    def load_session_id(self):
        """Carrega session ID persistente."""
        if SESSION_FILE.exists():
            return SESSION_FILE.read_text().strip()
        return None

    def save_session_id(self, session_id):
        """Salva session ID."""
        SESSION_FILE.write_text(session_id)
        self.session_id = session_id

    def log(self, msg, level="INFO"):
        """Log com timestamp."""
        ts = datetime.now().strftime("%H:%M:%S")
        prefix = f"[{ts}] [{self.worker_name.upper()}]"
        print(f"{prefix} {msg}", flush=True)

    def send_to_claude(self, message):
        """Envia mensagem para Claude via stdin."""
        if self.process and self.process.poll() is None:
            try:
                self.process.stdin.write(message + "\n")
                self.process.stdin.flush()
                return True
            except Exception as e:
                self.log(f"Erro ao enviar para Claude: {e}", "ERROR")
                return False
        return False

    def start_claude(self):
        """Inicia processo Claude interativo."""
        self.log("Iniciando Claude CLI...")

        # Limpar env vars conflitantes
        env = os.environ.copy()
        for key in list(env.keys()):
            if key.startswith("CLAUDECODE"):
                del env[key]
        env["CLAUDE_CODE_GIT_BASH_PATH"] = "D:\\Git\\bin\\bash.exe"

        # Comando Claude
        cmd = ["claude", "--model", MODEL, "--dangerously-skip-permissions"]
        if self.session_id:
            cmd.extend(["--resume", self.session_id])

        # Iniciar processo (stdout/stderr vão direto pro terminal para visualização)
        try:
            self.process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                # NÃO capturar stdout/stderr - deixa Claude escrever direto no terminal
                text=True,
                env=env,
                cwd=str(ROOT)
            )

            self.log("Claude CLI iniciado com sucesso")
            return True
        except Exception as e:
            self.log(f"Erro ao iniciar Claude: {e}", "ERROR")
            return False

    def read_output(self):
        """Lê output do Claude (thread separada) - NÃO USADO na versão atual."""
        # Stdout/stderr agora vão direto pro terminal, não precisamos ler
        pass

    def activate_ceo_zero(self):
        """Ativa CEO-ZERO no início ou após 10 tasks."""
        self.log("Ativando CEO-ZERO...")
        ceo_msg = CEO_INIT_MESSAGE.format(
            worker=self.worker_name.upper(),
            role=self.role
        )
        self.send_to_claude(ceo_msg)

    def process_trigger(self):
        """Processa trigger quando disponível."""
        if not TRIGGER_FILE.exists():
            return False

        # Verificar lock
        if LOCK_FILE.exists():
            age = time.time() - LOCK_FILE.stat().st_mtime
            if age < 600:  # 10 min timeout
                return False
            LOCK_FILE.unlink()  # Lock expirado

        # Ler prompt
        if not PROMPT_FILE.exists():
            self.log("Trigger sem prompt, ignorando", "WARN")
            TRIGGER_FILE.unlink()
            return False

        prompt = PROMPT_FILE.read_text(encoding='utf-8')

        # Criar lock
        LOCK_FILE.write_text(datetime.now().isoformat())

        # Processar
        self.log(f"Processando task #{self.task_count + 1}...")
        self.send_to_claude(prompt)

        # Remover trigger
        TRIGGER_FILE.unlink()

        # Incrementar contador
        self.task_count += 1
        self.save_counter()

        # A cada 10 tasks, limpar e reativar CEO-ZERO
        if self.task_count % REACTIVATE_INTERVAL == 0:
            self.log(f"Task #{self.task_count} - Limpando contexto e reativando CEO-ZERO")
            time.sleep(2)  # Aguarda resposta anterior
            self.send_to_claude("clear")
            time.sleep(2)
            self.activate_ceo_zero()
            time.sleep(10)  # Aguarda reativação

        # Aguardar processamento antes de remover lock
        time.sleep(5)

        if LOCK_FILE.exists():
            LOCK_FILE.unlink()

        return True

    def run(self):
        """Loop principal do worker."""
        self.log(f"Worker automatizado iniciado - Papel: {self.role}")
        self.log(f"Contador atual: {self.task_count} tasks processadas")

        # 0. Delay escalonado (evita sobrecarga de inicialização simultânea)
        startup_delay = STARTUP_DELAYS.get(self.worker_name, 0)
        if startup_delay > 0:
            self.log(f"Aguardando {startup_delay}s para inicializacao sequencial...")
            self.log(f"  (Evita sobrecarga - workers inicializam em ordem: Genesis → Escrivao → Revisador)")
            for i in range(startup_delay // 30):
                time.sleep(30)
                elapsed = (i + 1) * 30
                remaining = startup_delay - elapsed
                self.log(f"  Aguardando... {elapsed}s/{startup_delay}s (faltam {remaining}s)")
            # Segundos restantes
            if startup_delay % 30 > 0:
                time.sleep(startup_delay % 30)
            self.log(f"Delay de startup concluido. Iniciando worker...")

        # 1. Iniciar Claude
        if not self.start_claude():
            self.log("Falha ao iniciar Claude, encerrando", "ERROR")
            return

        # 2. Aguardar inicialização (1 minuto para garantir)
        self.log(f"Aguardando {INIT_DELAY}s para Claude inicializar completamente...")
        for i in range(INIT_DELAY // 10):
            time.sleep(10)
            self.log(f"  Inicializando... {(i+1)*10}s/{INIT_DELAY}s")

        # 3. Ativar CEO-ZERO
        self.activate_ceo_zero()
        self.log(f"Aguardando {CEO_ACTIVATION_DELAY}s para CEO-ZERO ativar...")
        time.sleep(CEO_ACTIVATION_DELAY)

        # 4. Loop de processamento de triggers
        self.log("Iniciando processamento de triggers...")
        while self.running:
            try:
                # Verificar se Claude ainda está rodando
                if self.process.poll() is not None:
                    self.log("Claude encerrado, reiniciando...", "WARN")
                    if not self.start_claude():
                        break
                    time.sleep(INIT_DELAY)
                    self.activate_ceo_zero()
                    time.sleep(CEO_ACTIVATION_DELAY)

                # Processar trigger se disponível
                self.process_trigger()

                # Polling
                time.sleep(POLL_INTERVAL)

            except KeyboardInterrupt:
                self.log("Encerrando worker...")
                self.running = False
            except Exception as e:
                self.log(f"Erro no loop: {e}", "ERROR")
                time.sleep(5)

        # Cleanup
        if self.process:
            self.process.terminate()
            self.process.wait(timeout=5)

        if LOCK_FILE.exists():
            LOCK_FILE.unlink()

        self.log("Worker encerrado")


def main():
    if len(sys.argv) < 2:
        print("Uso: python claude-worker-auto.py <worker-name>")
        print("Workers: sentinela, escrivao, revisador, corp")
        sys.exit(1)

    worker = ClaudeWorker(sys.argv[1])
    worker.run()


if __name__ == "__main__":
    main()
