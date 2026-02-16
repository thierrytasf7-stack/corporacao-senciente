"""
Sentinela Genesis - Senciencia Evolution Monitor
Reads TASKS-144-ETAPAS and generates stories for uncompleted etapa tasks.
Focus: Evolucao senciente etapa por etapa (NOT generic dev stories).
"""
import os, sys, time, json, glob, re
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORIES_DIR = os.path.join(ROOT, "docs", "stories")
ETAPAS_DIR = os.path.join(ROOT, "docs", "reports", "METRICAS_DIRECAO_EVOLUCAO", "TASKS-144-ETAPAS")
QUEUE_DIR = os.path.join(ROOT, ".queue", "genesis")
HEARTBEAT_DIR = "C:/AIOS/workers"
SCAN_INTERVAL = 5
MIN_TODO = 2  # Generate new stories when TODO < this
BATCH_SIZE = 3  # Stories to generate per trigger

# Hallucination monitoring integration
sys.path.insert(0, os.path.join(ROOT, 'apps', 'backend'))
try:
    from core.services.hallucination_logger_sync import get_hallucination_logger
    HALLUCINATION_MONITORING = True
    h_logger = get_hallucination_logger()
except ImportError:
    HALLUCINATION_MONITORING = False
    h_logger = None


def get_current_etapa():
    """Find the current etapa (first pending/in-progress)."""
    for i in range(1, 145):
        etapa_file = os.path.join(ETAPAS_DIR, f"ETAPA_{i:03d}.md")
        if not os.path.exists(etapa_file):
            continue
        try:
            with open(etapa_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if "Pendente" in content or "Em Progresso" in content:
                return i, etapa_file, content
        except:
            pass
    return None, None, None


def extract_tasks_from_etapa(content):
    """Extract TASK-XX entries from etapa content."""
    tasks = []
    current_task = None
    for line in content.split('\n'):
        match = re.match(r'### \[TASK-(\d+)\] (.+)', line)
        if match:
            if current_task:
                tasks.append(current_task)
            current_task = {
                "id": int(match.group(1)),
                "title": match.group(2).strip(),
                "objectives": []
            }
        elif current_task and re.match(r'\s+\d+\.', line):
            current_task["objectives"].append(line.strip())
    if current_task:
        tasks.append(current_task)
    return tasks


def find_covered_tasks(etapa_num):
    """Find which TASK-XX already have stories for this etapa."""
    covered = set()
    if not os.path.exists(STORIES_DIR):
        return covered
    for f in glob.glob(os.path.join(STORIES_DIR, "**", "*.md"), recursive=True):
        fname = os.path.basename(f).lower()
        # Match filename pattern: senciencia-etapa002-task-01-xxx.md
        if f"etapa{etapa_num:03d}" in fname:
            task_match = re.search(r'task-?(\d+)', fname)
            if task_match:
                covered.add(int(task_match.group(1)))
        # Also check content for TASK refs with etapa context
        try:
            with open(f, 'r', encoding='utf-8') as fh:
                content = fh.read(800)
                has_etapa = (f"Etapa:** {etapa_num:03d}" in content or
                             f"ETAPA {etapa_num:03d}" in content or
                             f"etapa{etapa_num:03d}" in content.lower())
                if has_etapa:
                    for ref in re.findall(r'TASK-(\d+)', content):
                        covered.add(int(ref))
        except:
            pass
    return covered


def count_stories():
    counts = {"TODO": 0, "EM_EXECUCAO": 0, "PARA_REVISAO": 0, "REVISADO": 0, "total": 0}
    if not os.path.exists(STORIES_DIR):
        return counts
    for f in glob.glob(os.path.join(STORIES_DIR, "**", "*.md"), recursive=True):
        try:
            with open(f, 'r', encoding='utf-8') as fh:
                content = fh.read(500)
                counts["total"] += 1
                for status in ["TODO", "EM_EXECUCAO", "PARA_REVISAO", "REVISADO"]:
                    if f"STATUS: {status}" in content or f"**Status:** {status}" in content:
                        counts[status] += 1
                        break
        except:
            pass
    return counts




def write_heartbeat(counts, etapa_num=None, triggered=False):
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {
        "worker": "genesis",
        "status": "generating" if triggered else "watching",
        "stories": counts,
        "current_etapa": etapa_num,
        "timestamp": datetime.now().isoformat()
    }
    try:
        with open(os.path.join(HEARTBEAT_DIR, "genesis.json"), 'w') as f:
            json.dump(data, f, indent=2)
    except:
        pass


def build_genesis_prompt(etapa_num, etapa_title, tasks_to_create, counts):
    tasks_desc = ""
    for t in tasks_to_create:
        objs = "\n".join(f"   {o}" for o in t["objectives"][:5])
        tasks_desc += f"\n### TASK-{t['id']:02d}: {t['title']}\n{objs}\n"

    return f"""WORKER GENESIS - Gere stories para ETAPA {etapa_num:03d} da evolucao senciente.

Diretorio: {ROOT}
Backlog: {counts['TODO']} TODO, {counts['EM_EXECUCAO']} exec, {counts['PARA_REVISAO']} revisao

CONTEXTO: Diana Corporacao Senciente evolui por 144 etapas de senciencia.
Etapa atual: ETAPA {etapa_num:03d} - {etapa_title}
Ref: docs/reports/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS/ETAPA_{etapa_num:03d}.md

TASKS PARA GERAR STORIES (1 story por task):
{tasks_desc}

INSTRUCOES:
1. Crie 1 arquivo .md em docs/stories/ para CADA task listada
2. Nome: senciencia-etapa{etapa_num:03d}-task-XX-descricao-curta.md (kebab-case)
3. Formato:
---
**Status:** TODO
**Prioridade:** ALTA
**Etapa:** {etapa_num:03d}
**Task Ref:** TASK-XX

# [Titulo descritivo]

## Descricao
[Baseado nos objetivos, adaptado ao contexto real do codebase Diana]

## Acceptance Criteria
- [ ] [cada objetivo vira criterio mensuravel]

## Tasks
- [ ] [cada objetivo vira task implementavel]
---
4. Adapte tasks abstratas para implementacoes PRATICAS no codebase
5. NÃO crie stories duplicadas - verifique docs/stories/ antes

DELEGACAO AGENT ZERO:
Para file operations em batch, DELEGUE para Agent Zero:
- Use o comando /CEOs:CEO-ZERO para invocar Zeus
- Agent Zero executa com custo $0.00 (Trinity model free tier)
- Ideal para: criar múltiplos arquivos, batch operations

Crie os arquivos agora."""


def extract_etapa_title(content):
    """Extract etapa title from first heading."""
    for line in content.split('\n'):
        if line.startswith('# ETAPA'):
            parts = line.split(':', 1)
            if len(parts) > 1:
                return parts[1].strip()
    return "Evolucao Senciente"


def main():
    print(f"[SENTINELA-GENESIS] Iniciado - Monitor Evolucao Senciente (interval: {SCAN_INTERVAL}s)")
    print(f"[SENTINELA-GENESIS] Stories: {STORIES_DIR}")
    print(f"[SENTINELA-GENESIS] Etapas: {ETAPAS_DIR}")
    print(f"[SENTINELA-GENESIS] Queue: {QUEUE_DIR}")

    os.makedirs(QUEUE_DIR, exist_ok=True)

    while True:
        try:
            counts = count_stories()
            etapa_num, etapa_file, etapa_content = get_current_etapa()
            ts = datetime.now().strftime("%H:%M:%S")

            etapa_label = f"ETAPA-{etapa_num:03d}" if etapa_num else "N/A"
            sys.stdout.write(
                f"\r[{ts}] [GENESIS] TODO:{counts['TODO']} "
                f"EXEC:{counts['EM_EXECUCAO']} REV:{counts['PARA_REVISAO']} "
                f"DONE:{counts['REVISADO']} | {etapa_label}  "
            )
            sys.stdout.flush()

            # Check if queue is empty
            existing = glob.glob(os.path.join(QUEUE_DIR, "*.prompt"))

            should_trigger = (
                counts["TODO"] < MIN_TODO
                and etapa_content
                and not existing  # Don't queue if already has prompts
            )

            if should_trigger:
                all_tasks = extract_tasks_from_etapa(etapa_content)
                covered = find_covered_tasks(etapa_num)

                uncovered = [t for t in all_tasks if t["id"] not in covered]

                if uncovered:
                    batch = uncovered[:BATCH_SIZE]
                    etapa_title = extract_etapa_title(etapa_content)
                    print(f"\n[{ts}] [GENESIS] Gerando {len(batch)} stories - ETAPA {etapa_num:03d}")

                    prompt = build_genesis_prompt(etapa_num, etapa_title, batch, counts)
                    prompt_file = os.path.join(QUEUE_DIR, f"{int(time.time() * 1000)}.prompt")
                    with open(prompt_file, 'w', encoding='utf-8') as f:
                        f.write(prompt)

                    write_heartbeat(counts, etapa_num, triggered=True)
                    task_ids = ", ".join(f"TASK-{t['id']:02d}" for t in batch)
                    print(f"[{ts}] [GENESIS] Prompt criado: {os.path.basename(prompt_file)} ({task_ids})")
                else:
                    print(f"\n[{ts}] [GENESIS] ETAPA {etapa_num:03d} completa! Todas tasks cobertas.")
                    write_heartbeat(counts, etapa_num)
            else:
                write_heartbeat(counts, etapa_num if etapa_num else 0)

        except KeyboardInterrupt:
            print("\n[SENTINELA-GENESIS] Encerrando...")
            break
        except Exception as e:
            print(f"\n[SENTINELA-GENESIS] Erro: {e}")

            # Log exception as hallucination
            if HALLUCINATION_MONITORING and h_logger:
                try:
                    h_logger.log_exception(
                        worker_id="GENESIS",
                        task_id=f"etapa_{etapa_num:03d}" if 'etapa_num' in locals() else "main_loop",
                        function_name="main",
                        exception=e,
                        context={"etapa": etapa_num if 'etapa_num' in locals() else None}
                    )
                except:
                    pass  # Não falhar se logging falhar

        time.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    main()
