"""
Sentinela Escrivao - Implementation Task Monitor
Monitors for TODO stories (especially senciencia etapas) and triggers Claude worker.
"""
import os, sys, time, json, glob, re
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORIES_DIR = os.path.join(ROOT, "docs", "stories")
TRIGGER_FILE = os.path.join(ROOT, ".trigger_escrivao")
PROMPT_FILE = os.path.join(ROOT, ".prompt_escrivao.txt")
LOCK_FILE = os.path.join(ROOT, ".worker_escrivao.lock")
HEARTBEAT_DIR = "C:/AIOS/workers"
SCAN_INTERVAL = 5


def find_todo_story():
    """Find next TODO story. Prioritize senciencia etapa stories."""
    if not os.path.exists(STORIES_DIR):
        return None, None
    stories = sorted(glob.glob(os.path.join(STORIES_DIR, "**", "*.md"), recursive=True))

    # First pass: senciencia-etapa stories
    for filepath in stories:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            is_todo = "STATUS: TODO" in content or "**Status:** TODO" in content
            is_senciencia = "senciencia" in os.path.basename(filepath).lower() or "Etapa:**" in content
            if is_todo and is_senciencia:
                return filepath, content
        except:
            pass

    # Second pass: any TODO with @aider/@escrivao
    for filepath in stories:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            is_todo = "STATUS: TODO" in content or "**Status:** TODO" in content
            is_assigned = "@aider" in content or "@escrivao" in content
            if is_todo and is_assigned:
                return filepath, content
        except:
            pass

    return None, None


def extract_title(content):
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('# ') and not line.startswith('## '):
            return line[2:].strip()
    return "Sem titulo"


def is_locked():
    if os.path.exists(LOCK_FILE):
        try:
            age = time.time() - os.path.getmtime(LOCK_FILE)
            if age > 900:
                os.remove(LOCK_FILE)
                return False
            return True
        except:
            return False
    return False


def write_heartbeat(story_found=False, title=""):
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {
        "worker": "escrivao",
        "status": "triggered" if story_found else "watching",
        "current_story": title,
        "timestamp": datetime.now().isoformat(),
        "locked": is_locked()
    }
    try:
        with open(os.path.join(HEARTBEAT_DIR, "escrivao.json"), 'w') as f:
            json.dump(data, f, indent=2)
    except:
        pass


def build_implementation_prompt(filepath, content):
    title = extract_title(content)
    filename = os.path.basename(filepath)

    # Detect if it's a senciencia etapa story
    is_senciencia = "senciencia" in filename.lower() or "Etapa:**" in content
    context = ""
    if is_senciencia:
        context = """
CONTEXTO SENCIENCIA:
- Esta story faz parte da evolucao senciente da Diana (144 etapas)
- Referencia: docs/reports/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS/
- Implemente de forma PRATICA e adaptada ao codebase real
- Priorize implementacoes que funcionem no ecossistema nativo Windows
"""

    return f"""MISSAO: Implementar a story abaixo.

STORY: {filename}
PATH: {filepath}
TITULO: {title}
{context}
CONTEUDO:
{content[:4000]}

REGRAS:
1. Implemente seguindo os acceptance criteria EXATAMENTE
2. TypeScript strict, imports absolutos (@synkra/, @/)
3. Portas na faixa 21300-21399 (NUNCA usar 3000, 8080)
4. Rode testes se aplicavel
5. Atualize status no arquivo da story:
   - TODO -> EM_EXECUCAO (no inicio)
   - EM_EXECUCAO -> PARA_REVISAO (ao finalizar)
   - Marque [x] nas tasks completadas
6. Story path: {filepath}

Execute a implementacao agora."""


def main():
    print(f"[SENTINELA-ESCRIVAO] Iniciado - Monitorando stories TODO (interval: {SCAN_INTERVAL}s)")
    print(f"[SENTINELA-ESCRIVAO] Prioridade: stories senciencia-etapa > @aider")

    while True:
        try:
            filepath, content = find_todo_story()
            ts = datetime.now().strftime("%H:%M:%S")

            if filepath and not is_locked() and not os.path.exists(TRIGGER_FILE):
                title = extract_title(content)
                print(f"\n[{ts}] [ESCRIVAO] Story encontrada: {title}")

                prompt = build_implementation_prompt(filepath, content)
                with open(PROMPT_FILE, 'w', encoding='utf-8') as f:
                    f.write(prompt)
                with open(TRIGGER_FILE, 'w') as f:
                    f.write(datetime.now().isoformat())

                write_heartbeat(True, title)
                print(f"[{ts}] [ESCRIVAO] Trigger criado: {os.path.basename(filepath)}")
            else:
                status = "LOCKED" if is_locked() else (
                    "TRIGGERED" if os.path.exists(TRIGGER_FILE) else "Aguardando TODO"
                )
                sys.stdout.write(f"\r[{ts}] [ESCRIVAO] {status}  ")
                sys.stdout.flush()
                write_heartbeat()

        except KeyboardInterrupt:
            print("\n[SENTINELA-ESCRIVAO] Encerrando...")
            break
        except Exception as e:
            print(f"\n[SENTINELA-ESCRIVAO] Erro: {e}")

        time.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    main()
