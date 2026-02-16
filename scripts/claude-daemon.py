"""
claude-daemon.py - Daemon com Claude SEMPRE ABERTO via ConPTY
Comunicação: Queue FIFO → ConPTY write → thread lê → output files
Windows ConPTY: Pseudo-console nativo que Claude aceita!
"""
import os
import sys
import time
import threading
from pathlib import Path
from datetime import datetime
from queue import Queue, Empty
import winpty

WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = Path(__file__).parent.parent
QUEUE_DIR = ROOT / ".queue" / WORKER_NAME
OUTPUT_DIR = ROOT / ".output" / WORKER_NAME

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [DAEMON-{WORKER_NAME.upper()}] {msg}", flush=True)

class ClaudeDaemon:
    def __init__(self):
        # Criar diretórios
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # Limpar env vars conflitantes
        for key in list(os.environ.keys()):
            if key.startswith("CLAUDECODE"):
                del os.environ[key]
        os.environ["CLAUDE_CODE_GIT_BASH_PATH"] = "D:\\Git\\bin\\bash.exe"

        os.chdir(ROOT)

        log(f"Iniciando Claude daemon para worker: {WORKER_NAME}")

        # Caminho absoluto do Claude
        claude_cmd = os.path.expanduser('~/.local/bin/claude')

        # Iniciar Claude via ConPTY (Pseudo-console Windows)
        try:
            # Criar PTY com dimensões de terminal
            self.pty = winpty.PTY(80, 24)

            # Spawn Claude no pseudo-console
            self.pty.spawn(f'{claude_cmd} --dangerously-skip-permissions')

            log(f"Claude iniciado via ConPTY!")
        except Exception as e:
            log(f"ERRO ao iniciar Claude via ConPTY: {e}")
            raise

        self.task_count = 0
        self.output_queue = Queue()
        self.current_output = []
        self.output_lock = threading.Lock()

        # Thread para ler output do Claude continuamente
        self.reader_thread = threading.Thread(target=self._read_pty, daemon=True)
        self.reader_thread.start()
        log("Thread de leitura ConPTY iniciada")

    def _read_pty(self):
        """Thread que lê output do ConPTY continuamente"""
        try:
            while True:
                # Ler do PTY (non-blocking com timeout)
                try:
                    data = self.pty.read(timeout=100)  # 100ms timeout
                    if data:
                        with self.output_lock:
                            self.current_output.append(data)
                            # Colocar na queue para detecção de conclusão
                            self.output_queue.put(data)
                except winpty.WinptyError:
                    # Timeout ou EOF
                    time.sleep(0.1)
                except Exception as e:
                    log(f"Erro leitura PTY: {e}")
                    break
        except Exception as e:
            log(f"Thread leitura encerrou: {e}")

    def send_to_claude(self, prompt):
        """Envia prompt para Claude via ConPTY"""
        try:
            self.pty.write(prompt + '\n')
            return True
        except Exception as e:
            log(f"ERRO ao enviar: {e}")
            return False

    def wait_for_completion(self, timeout=300):
        """Aguarda Claude completar resposta (detecta idle)"""
        idle_threshold = 3  # 3 segundos sem output = conclusão
        start_time = time.time()
        last_output_time = time.time()

        while (time.time() - start_time) < timeout:
            try:
                # Tentar pegar output da queue com timeout curto
                self.output_queue.get(timeout=0.5)
                last_output_time = time.time()
            except Empty:
                # Sem output há X segundos = conclusão
                if (time.time() - last_output_time) >= idle_threshold:
                    return True

        return False

    def process_queue(self):
        """Loop infinito processando fila FIFO"""
        log("Iniciando processamento de fila...")
        log("(Ctrl+C para encerrar daemon)")
        print()

        # Aguardar Claude inicializar (mensagem de boas-vindas)
        time.sleep(3)
        log("Claude pronto para receber comandos!")

        while True:
            try:
                # Verificar se PTY ainda está vivo
                if not self.pty.isalive():
                    log("ERRO: Claude/PTY encerrado inesperadamente!")
                    break

                # Buscar próximo prompt na fila (FIFO)
                prompts = sorted(QUEUE_DIR.glob("*.prompt"))

                if prompts:
                    self.task_count += 1
                    prompt_file = prompts[0]

                    log(f"TASK #{self.task_count} DETECTADA: {prompt_file.name}")

                    # Ler prompt
                    prompt = prompt_file.read_text(encoding='utf-8')

                    # Limpar output anterior
                    with self.output_lock:
                        self.current_output = []

                    # Limpar queue
                    while not self.output_queue.empty():
                        try:
                            self.output_queue.get_nowait()
                        except Empty:
                            break

                    # Enviar para Claude
                    if not self.send_to_claude(prompt):
                        log("Falha ao enviar prompt. Pulando...")
                        time.sleep(5)
                        continue

                    log(f"Prompt enviado ({len(prompt)} chars). Aguardando resposta...")

                    # Aguardar conclusão
                    if self.wait_for_completion():
                        log("Resposta completa!")
                    else:
                        log("TIMEOUT aguardando resposta")

                    # Copiar output
                    with self.output_lock:
                        output = ''.join(self.current_output)

                    # Salvar output
                    output_file = OUTPUT_DIR / f"task_{self.task_count}.txt"
                    output_file.write_text(output, encoding='utf-8')
                    log(f"Output salvo: {output_file.name} ({len(output)} chars)")

                    # Atualizar latest.txt
                    latest = OUTPUT_DIR / "latest.txt"
                    if latest.exists():
                        latest.unlink()
                    try:
                        latest.symlink_to(output_file.name)
                    except:
                        latest.write_text(output, encoding='utf-8')

                    # Sinalizar conclusão
                    done_file = OUTPUT_DIR / f"task_{self.task_count}.done"
                    done_file.touch()

                    # Remover prompt processado
                    prompt_file.unlink()

                    log(f"TASK #{self.task_count} CONCLUIDA")
                    print()

                time.sleep(0.5)

            except KeyboardInterrupt:
                log("Encerrando daemon (Ctrl+C)...")
                break
            except Exception as e:
                log(f"ERRO no loop: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(5)

        # Cleanup
        self.cleanup()

    def cleanup(self):
        """Limpeza ao encerrar"""
        log("Limpeza...")

        try:
            if self.pty.isalive():
                # Fechar PTY gracefully
                self.pty.close()
                log("Claude/PTY encerrado")
        except:
            pass

        log("Daemon finalizado")

def main():
    print()
    print("="*70)
    print(f"  DIANA CLAUDE DAEMON - {WORKER_NAME.upper()}")
    print(f"  Modo: Windows ConPTY (Claude SEMPRE ABERTO - ZERO delay!)")
    print("="*70)
    print()

    daemon = ClaudeDaemon()
    daemon.process_queue()

if __name__ == "__main__":
    main()
