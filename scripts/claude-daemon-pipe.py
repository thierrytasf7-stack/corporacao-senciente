"""
claude-daemon-pipe.py - Claude SEMPRE ABERTO usando Named Pipes Windows
Comunicação: Named Pipe (IPC nativo Windows) + subprocess stdin
Thread 1: Escuta Named Pipe → comandos
Thread 2: Lê stdout Claude → arquivos
"""
import os
import sys
import time
import subprocess
import threading
import win32pipe
import win32file
import pywintypes
from pathlib import Path
from datetime import datetime
from queue import Queue, Empty

WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = Path(__file__).parent.parent
QUEUE_DIR = ROOT / ".queue" / WORKER_NAME
OUTPUT_DIR = ROOT / ".output" / WORKER_NAME
PIPE_NAME = f"\\\\.\\pipe\\diana_claude_{WORKER_NAME}"

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [DAEMON-{WORKER_NAME.upper()}] {msg}", flush=True)

class ClaudeDaemonPipe:
    def __init__(self):
        # Criar diretórios
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # Limpar env vars
        for key in list(os.environ.keys()):
            if key.startswith("CLAUDECODE"):
                del os.environ[key]
        os.environ["CLAUDE_CODE_GIT_BASH_PATH"] = "D:\\Git\\bin\\bash.exe"

        os.chdir(ROOT)

        log(f"Iniciando Claude daemon com Named Pipe: {PIPE_NAME}")

        # Iniciar Claude subprocess
        claude_cmd = os.path.expanduser('~/.local/bin/claude')
        try:
            self.process = subprocess.Popen(
                [claude_cmd, '--dangerously-skip-permissions'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=str(ROOT),
                env=os.environ
            )
            log(f"Claude iniciado (PID: {self.process.pid})")
        except Exception as e:
            log(f"ERRO ao iniciar Claude: {e}")
            raise

        self.task_count = 0
        self.current_output = []
        self.output_lock = threading.Lock()
        self.output_queue = Queue()

        # Thread para ler stdout
        self.reader_thread = threading.Thread(target=self._read_stdout, daemon=True)
        self.reader_thread.start()
        log("Thread leitura stdout iniciada")

        # Thread para escutar Named Pipe
        self.pipe_thread = threading.Thread(target=self._pipe_listener, daemon=True)
        self.pipe_thread.start()
        log("Thread Named Pipe iniciada")

    def _read_stdout(self):
        """Lê stdout do Claude continuamente"""
        try:
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    with self.output_lock:
                        self.current_output.append(line)
                        self.output_queue.put(line)
        except Exception as e:
            log(f"Thread stdout encerrou: {e}")

    def _pipe_listener(self):
        """Escuta Named Pipe para comandos"""
        while True:
            try:
                # Criar Named Pipe
                pipe = win32pipe.CreateNamedPipe(
                    PIPE_NAME,
                    win32pipe.PIPE_ACCESS_DUPLEX,
                    win32pipe.PIPE_TYPE_MESSAGE | win32pipe.PIPE_WAIT,
                    1,  # Max instances
                    65536,  # Out buffer size
                    65536,  # In buffer size
                    0,  # Default timeout
                    None  # Security attributes
                )

                log("Named Pipe criado. Aguardando conexão...")

                # Aguardar cliente conectar
                win32pipe.ConnectNamedPipe(pipe, None)
                log("Cliente conectado ao pipe!")

                # Ler comando do pipe
                result, data = win32file.ReadFile(pipe, 64*1024)
                command = data.decode('utf-8')

                log(f"Comando recebido via pipe ({len(command)} chars)")

                # Enviar para Claude
                self.send_to_claude(command)

                # Fechar pipe
                win32file.CloseHandle(pipe)

            except Exception as e:
                log(f"Erro no pipe listener: {e}")
                time.sleep(1)

    def send_to_claude(self, prompt):
        """Envia prompt para stdin do Claude"""
        try:
            self.process.stdin.write(prompt + '\n')
            self.process.stdin.flush()
            log(f"Prompt enviado para Claude ({len(prompt)} chars)")
            return True
        except Exception as e:
            log(f"ERRO ao enviar: {e}")
            return False

    def wait_for_completion(self, timeout=300):
        """Aguarda conclusão (idle detection)"""
        idle_threshold = 3
        start_time = time.time()
        last_output_time = time.time()

        while (time.time() - start_time) < timeout:
            try:
                self.output_queue.get(timeout=0.5)
                last_output_time = time.time()
            except Empty:
                if (time.time() - last_output_time) >= idle_threshold:
                    return True
        return False

    def process_queue(self):
        """Loop processando fila (usando Named Pipe agora)"""
        log("Aguardando Claude inicializar...")
        time.sleep(3)
        log("Claude pronto! Processando via Named Pipe...")
        print()

        while True:
            try:
                # Verificar se Claude vivo
                if self.process.poll() is not None:
                    log("ERRO: Claude encerrado!")
                    break

                # Buscar prompts na fila
                prompts = sorted(QUEUE_DIR.glob("*.prompt"))

                if prompts:
                    self.task_count += 1
                    prompt_file = prompts[0]

                    log(f"TASK #{self.task_count}: {prompt_file.name}")

                    prompt = prompt_file.read_text(encoding='utf-8')

                    # Limpar output anterior
                    with self.output_lock:
                        self.current_output = []
                    while not self.output_queue.empty():
                        try:
                            self.output_queue.get_nowait()
                        except Empty:
                            break

                    # Enviar via stdin direto (não precisa pipe para isso)
                    if not self.send_to_claude(prompt):
                        time.sleep(5)
                        continue

                    log("Aguardando resposta...")

                    # Aguardar conclusão
                    if self.wait_for_completion():
                        log("Resposta completa!")
                    else:
                        log("TIMEOUT")

                    # Salvar output
                    with self.output_lock:
                        output = ''.join(self.current_output)

                    output_file = OUTPUT_DIR / f"task_{self.task_count}.txt"
                    output_file.write_text(output, encoding='utf-8')

                    latest = OUTPUT_DIR / "latest.txt"
                    if latest.exists():
                        latest.unlink()
                    try:
                        latest.symlink_to(output_file.name)
                    except:
                        latest.write_text(output, encoding='utf-8')

                    done_file = OUTPUT_DIR / f"task_{self.task_count}.done"
                    done_file.touch()

                    prompt_file.unlink()

                    log(f"TASK #{self.task_count} CONCLUIDA ({len(output)} chars)")
                    print()

                time.sleep(0.5)

            except KeyboardInterrupt:
                log("Encerrando...")
                break
            except Exception as e:
                log(f"ERRO: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(5)

        self.cleanup()

    def cleanup(self):
        """Cleanup"""
        log("Limpando...")
        try:
            if self.process.poll() is None:
                self.process.terminate()
                self.process.wait(timeout=5)
        except:
            try:
                self.process.kill()
            except:
                pass
        log("Daemon finalizado")

def main():
    print()
    print("="*70)
    print(f"  DIANA CLAUDE DAEMON - {WORKER_NAME.upper()}")
    print(f"  Modo: Named Pipes + subprocess (Claude SEMPRE ABERTO)")
    print("="*70)
    print()

    daemon = ClaudeDaemonPipe()
    daemon.process_queue()

if __name__ == "__main__":
    main()
