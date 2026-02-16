"""
claude-wrapper.py - Wrapper SIMPLIFICADO - Executa Claude por comando
Comunicação sistêmica: Watcher → arquivo comando → wrapper → executa Claude
NOVA ABORDAGEM: Não mantém Claude em subprocess, executa fresh a cada comando
"""
import os
import sys
import time
import subprocess
from pathlib import Path

WORKER_NAME = sys.argv[1] if len(sys.argv) > 1 else "sentinela"
ROOT = Path(__file__).parent.parent
COMMAND_FILE = ROOT / f".claude_cmd_{WORKER_NAME}.txt"
LOCK_FILE = ROOT / f".claude_cmd_{WORKER_NAME}.lock"
SESSION_FILE = ROOT / f".session_{WORKER_NAME}.txt"

def log(msg):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] [WRAPPER] {msg}", flush=True)

def get_or_create_session():
    """Obtém session ID existente ou None para criar nova"""
    if SESSION_FILE.exists():
        try:
            session = SESSION_FILE.read_text().strip()
            if session:
                log(f"Sessao existente: {session[:12]}...")
                return session
        except:
            pass
    log("Criando nova sessao Claude...")
    return None

def save_session(output):
    """Extrai e salva session ID do output do Claude"""
    for line in output.split('\n'):
        if 'session' in line.lower() and ('-' in line or len(line) > 20):
            # Tentar extrair UUID-like string
            parts = line.split()
            for part in parts:
                if len(part) > 20 and '-' in part:
                    SESSION_FILE.write_text(part.strip())
                    log(f"Session salva: {part[:12]}...")
                    return

def execute_claude_command(prompt):
    """Executa Claude com o prompt fornecido"""
    os.chdir(ROOT)

    # Limpar env vars conflitantes
    env = os.environ.copy()
    for key in list(env.keys()):
        if key.startswith("CLAUDECODE"):
            del env[key]
    env["CLAUDE_CODE_GIT_BASH_PATH"] = "D:\\Git\\bin\\bash.exe"

    # Construir comando
    cmd = ["claude", "--dangerously-skip-permissions", "-p", prompt]

    # Adicionar --resume se temos session
    session = get_or_create_session()
    if session:
        cmd.extend(["--resume", session])

    log(f"Executando Claude ({len(prompt)} chars)...")

    # Executar e mostrar output em tempo real
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
        cwd=str(ROOT)
    )

    # Ler e exibir output linha por linha
    output_lines = []
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(line, end='', flush=True)
                output_lines.append(line)
    except Exception as e:
        log(f"Erro lendo output: {e}")

    # Aguardar conclusão
    process.wait()

    # Salvar session se necessário
    full_output = ''.join(output_lines)
    if not session:
        save_session(full_output)

    log(f"Claude concluido (exit code: {process.returncode})")
    return process.returncode

def monitor_loop():
    """Loop principal - aguarda comandos IPC"""
    log(f"Aguardando comandos IPC para worker: {WORKER_NAME}")
    log("(Ctrl+C para sair)")
    print()

    task_count = 0

    while True:
        try:
            # Verifica se há comando novo
            if COMMAND_FILE.exists() and not LOCK_FILE.exists():
                task_count += 1

                # Criar lock
                LOCK_FILE.touch()

                # Ler comando
                with open(COMMAND_FILE, 'r', encoding='utf-8') as f:
                    command = f.read().strip()

                if command:
                    print("\n" + "="*60)
                    log(f"TASK #{task_count} DETECTADA")
                    print("="*60 + "\n")

                    # Executar Claude
                    execute_claude_command(command)

                    print("\n" + "="*60)
                    log(f"TASK #{task_count} CONCLUIDA")
                    print("="*60 + "\n")

                # Remover comando e lock
                COMMAND_FILE.unlink()
                LOCK_FILE.unlink()

            time.sleep(0.5)

        except KeyboardInterrupt:
            log("Encerrando wrapper...")
            break
        except Exception as e:
            log(f"Erro no monitor: {e}")
            if LOCK_FILE.exists():
                LOCK_FILE.unlink()
            time.sleep(1)

    # Cleanup
    if COMMAND_FILE.exists():
        COMMAND_FILE.unlink()
    if LOCK_FILE.exists():
        LOCK_FILE.unlink()

def main():
    os.chdir(ROOT)

    print()
    print("="*60)
    print(f"  DIANA CLAUDE WRAPPER - {WORKER_NAME.upper()}")
    print(f"  Modo: Execucao por comando (sessao persistente)")
    print("="*60)
    print()

    monitor_loop()

    log("Wrapper finalizado")

if __name__ == "__main__":
    main()
