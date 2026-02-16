"""
Sentinela Revisador - Code Review Monitor
Monitors for PARA_REVISAO stories and triggers Claude worker for review.
"""
import os, sys, time, json, glob
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORIES_DIR = os.path.join(ROOT, "docs", "stories")
QUEUE_DIR = os.path.join(ROOT, ".queue", "revisador")
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


def find_review_story():
    if not os.path.exists(STORIES_DIR):
        return None, None
    stories = sorted(glob.glob(os.path.join(STORIES_DIR, "**", "*.md"), recursive=True))
    for filepath in stories:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if "STATUS: PARA_REVISAO" in content or "**Status:** PARA_REVISAO" in content:
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
        "worker": "revisador",
        "status": "reviewing" if story_found else "watching",
        "current_story": title,
        "timestamp": datetime.now().isoformat()
    }
    try:
        with open(os.path.join(HEARTBEAT_DIR, "revisador.json"), 'w') as f:
            json.dump(data, f, indent=2)
    except:
        pass


def build_review_prompt(filepath, content):
    title = extract_title(content)
    filename = os.path.basename(filepath)

    is_senciencia = "senciencia" in filename.lower() or "Etapa:**" in content
    extra = ""
    if is_senciencia:
        extra = """
CRITERIOS SENCIENCIA EXTRA:
- A implementacao avanca a evolucao senciente de forma concreta?
- Os artefatos criados sao reutilizaveis nas proximas etapas?
- A implementacao respeita os criterios de estabilidade da etapa?
"""

    return f"""WORKER REVISADOR - Revise a story completada abaixo.

STORY: {filename}
PATH: {filepath}
TITULO: {title}

CONTEUDO:
{content[:4000]}

CHECKLIST DE REVISAO:
1. TODOS os acceptance criteria foram atendidos?
2. Vulnerabilidades de seguranca (injection, XSS)?
3. Testes existem e passam?
4. Qualidade do codigo (TypeScript strict, imports absolutos)?
5. Portas na faixa 21300-21399?
6. TODO/FIXME pendentes?
7. Implementacao segue padroes CLAUDE.md?
{extra}
DECISAO:
- Se APROVADO: Mude STATUS para REVISADO no arquivo {filepath}
- Se REPROVADO: Mude STATUS para TODO e adicione comentarios sobre o que corrigir

DELEGACAO AGENT ZERO:
Para validacoes automatizadas, DELEGUE para Agent Zero:
- Use o comando /CEOs:CEO-ZERO para invocar Zeus
- Agent Zero executa com custo $0.00 (Trinity model free tier)
- Ideal para: lint checks, test execution, file validation

Execute a revisao agora."""


def main():
    print(f"[SENTINELA-REVISADOR] Iniciado - Monitorando PARA_REVISAO (interval: {SCAN_INTERVAL}s)")
    print(f"[SENTINELA-REVISADOR] Queue: {QUEUE_DIR}")

    os.makedirs(QUEUE_DIR, exist_ok=True)

    while True:
        try:
            filepath, content = find_review_story()
            ts = datetime.now().strftime("%H:%M:%S")

            if filepath:
                # Check if already queued
                existing = glob.glob(os.path.join(QUEUE_DIR, "*.prompt"))
                if existing:
                    sys.stdout.write(f"\r[{ts}] [REVISADOR] Queue ocupada ({len(existing)} prompts)  ")
                    sys.stdout.flush()
                else:
                    title = extract_title(content)
                    print(f"\n[{ts}] [REVISADOR] Story para revisar: {title}")

                    prompt = build_review_prompt(filepath, content)
                    prompt_file = os.path.join(QUEUE_DIR, f"{int(time.time() * 1000)}.prompt")
                    with open(prompt_file, 'w', encoding='utf-8') as f:
                        f.write(prompt)

                    write_heartbeat(True, title)
                    print(f"[{ts}] [REVISADOR] Prompt criado: {os.path.basename(prompt_file)}")
            else:
                sys.stdout.write(f"\r[{ts}] [REVISADOR] Aguardando PARA_REVISAO  ")
                sys.stdout.flush()
                write_heartbeat()

        except KeyboardInterrupt:
            print("\n[SENTINELA-REVISADOR] Encerrando...")
            break
        except Exception as e:
            print(f"\n[SENTINELA-REVISADOR] Erro: {e}")

            # Log exception as hallucination
            if HALLUCINATION_MONITORING and h_logger:
                try:
                    h_logger.log_exception(
                        worker_id="REVISADOR",
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
