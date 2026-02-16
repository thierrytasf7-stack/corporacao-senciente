"""
Sentinela Trabalhador - Implementation Worker
Monitors for ANY TODO story and triggers Claude worker for implementation.
Invokes Agent Zero for $0 execution.
"""
import os, sys, time, json, glob
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORIES_DIR = os.path.join(ROOT, "docs", "stories")
QUEUE_DIR = os.path.join(ROOT, ".queue", "trabalhador")
HEARTBEAT_DIR = "C:/AIOS/workers"
SCAN_INTERVAL = 5

# Hallucination monitoring integration
sys.path.insert(0, os.path.join(ROOT, 'apps', 'backend'))
try:
    from core.services.hallucination_logger_sync import get_hallucination_logger
    HALLUCINATION_MONITORING = True
    h_logger = get_hallucination_logger()
except ImportError:
    HALLUCINATION_MONITORING = False
    h_logger = None


def find_todo_story():
    """Find next TODO story - ANY story with STATUS: TODO."""
    if not os.path.exists(STORIES_DIR):
        return None, None
    stories = sorted(glob.glob(os.path.join(STORIES_DIR, "**", "*.md"), recursive=True))

    # Prioridade 1: senciencia etapas
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

    # Prioridade 2: QUALQUER story TODO (sem filtros)
    for filepath in stories:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            is_todo = "STATUS: TODO" in content or "**Status:** TODO" in content
            if is_todo:
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


def write_heartbeat(story_found=False, title=""):
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {
        "worker": "trabalhador",
        "status": "processing" if story_found else "watching",
        "current_story": title,
        "timestamp": datetime.now().isoformat()
    }
    try:
        with open(os.path.join(HEARTBEAT_DIR, "trabalhador.json"), 'w') as f:
            json.dump(data, f, indent=2)
    except:
        pass


def build_implementation_prompt(filepath, content):
    title = extract_title(content)
    filename = os.path.basename(filepath)

    is_senciencia = "senciencia" in filename.lower() or "Etapa:**" in content
    context = ""
    if is_senciencia:
        context = """
CONTEXTO SENCIENCIA:
- Esta story faz parte da evolucao senciente da Diana (144 etapas)
- Referencia: docs/reports/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS/
- Implemente de forma PRATICA e adaptada ao codebase real
"""

    return f"""WORKER TRABALHADOR - Implemente a story abaixo.

{context}
STORY: {filename}
PATH: {filepath}
TITULO: {title}

CONTEUDO:
{content[:4000]}

INSTRUCOES:
1. Implemente seguindo os acceptance criteria EXATAMENTE
2. TypeScript strict, imports absolutos (@synkra/, @/)
3. Portas na faixa 21300-21399 (NUNCA usar 3000, 8080)
4. Rode testes se aplicavel
5. Atualize status no arquivo da story:
   - TODO -> EM_EXECUCAO (no inicio)
   - EM_EXECUCAO -> PARA_REVISAO (ao finalizar)
   - Marque [x] nas tasks completadas

DELEGACAO AGENT ZERO:
Para tasks complexas ou repetitivas, DELEGUE para Agent Zero:
- Use o comando /CEOs:CEO-ZERO para invocar Zeus
- Agent Zero executa com custo $0.00 (Trinity model free tier)
- Ideal para: file operations, batch tasks, data processing

Execute a implementacao agora."""


def main():
    print(f"[SENTINELA-TRABALHADOR] Iniciado - Monitorando TODAS as stories TODO (interval: {SCAN_INTERVAL}s)")
    print(f"[SENTINELA-TRABALHADOR] Queue: {QUEUE_DIR}")

    os.makedirs(QUEUE_DIR, exist_ok=True)

    while True:
        try:
            filepath, content = find_todo_story()
            ts = datetime.now().strftime("%H:%M:%S")

            if filepath:
                # Check if already queued
                existing = glob.glob(os.path.join(QUEUE_DIR, "*.prompt"))
                if existing:
                    sys.stdout.write(f"\r[{ts}] [TRABALHADOR] Queue ocupada ({len(existing)} prompts)  ")
                    sys.stdout.flush()
                else:
                    title = extract_title(content)
                    print(f"\n[{ts}] [TRABALHADOR] Story encontrada: {title}")

                    prompt = build_implementation_prompt(filepath, content)
                    prompt_file = os.path.join(QUEUE_DIR, f"{int(time.time() * 1000)}.prompt")
                    with open(prompt_file, 'w', encoding='utf-8') as f:
                        f.write(prompt)

                    write_heartbeat(True, title)
                    print(f"[{ts}] [TRABALHADOR] Prompt criado: {os.path.basename(prompt_file)}")
            else:
                sys.stdout.write(f"\r[{ts}] [TRABALHADOR] Aguardando TODO  ")
                sys.stdout.flush()
                write_heartbeat()

        except KeyboardInterrupt:
            print("\n[SENTINELA-TRABALHADOR] Encerrando...")
            break
        except Exception as e:
            print(f"\n[SENTINELA-TRABALHADOR] Erro: {e}")

            # Log exception as hallucination
            if HALLUCINATION_MONITORING and h_logger:
                try:
                    h_logger.log_exception(
                        worker_id="TRABALHADOR",
                        task_id="main_loop",
                        function_name="main",
                        exception=e,
                        context={"filepath": filepath if 'filepath' in locals() else None}
                    )
                except:
                    pass  # Não falhar se logging falhar

        time.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    main()
