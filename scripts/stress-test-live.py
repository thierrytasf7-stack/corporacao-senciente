"""
Stress Test Live - Creates test stories and monitors pipeline progression.
Tests that the full pipeline works: Genesis(create) → Sentinel(detect) → Listener(trigger) → Engine(process) → Zero(review)
"""
import os, sys, glob, re, time, random, string
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")

TARGET_FILES = [
    "apps/dashboard/src/app/api/",
    "apps/dashboard/src/hooks/",
    "apps/dashboard/src/stores/"
]

def gen_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))

def create_test_story(agent, idx):
    """Create a test story with given agent assignment."""
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
    sid = gen_id()
    kind = "stress" if agent == "@aider" else "review"
    fname = f"{kind}_stresstest_{ts}_{sid}.md"

    files_section = "\n".join(f"- {f}" for f in TARGET_FILES)

    content = f"""# Story: Stress Test {agent} #{idx}

**Status:** TODO
**subStatus:** backlog
**Prioridade:** MEDIUM
**Agente Sugerido:** {agent}
**Dificuldade:** EASY
**Tipo:** test

## Objetivo
Story de stress test automatico #{idx} para validar pipeline E2E.

## Arquivos Alvo
{files_section}

## Instrucoes
Verificar que os arquivos alvo existem e estao sintaticamente corretos.

## Criterios de Aceitacao
- [ ] Pipeline processa story automaticamente
- [ ] Status muda para REVISADO
"""
    path = os.path.join(STORIES_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return fname

def count_statuses():
    """Count stories by status (excluding _ prefixed)."""
    counts = {}
    for f in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        bn = os.path.basename(f)
        if bn.startswith("_"):
            continue
        with open(f, "r", encoding="utf-8", errors="ignore") as fh:
            c = fh.read(2000)
        m = re.search(r"\*\*Status:\*\*\s*(\S+)", c)
        if m:
            s = m.group(1)
            counts[s] = counts.get(s, 0) + 1
    return counts

def main():
    num_aider = 3
    num_zero = 3
    total_new = num_aider + num_zero

    print("=" * 60)
    print("  DIANA STRESS TEST - LIVE PIPELINE E2E")
    print("=" * 60)

    # Baseline
    baseline = count_statuses()
    baseline_revisado = baseline.get("REVISADO", 0)
    print(f"\n[BASELINE] Stories atuais: {baseline}")
    print(f"[BASELINE] REVISADO count: {baseline_revisado}")

    # Create test stories
    print(f"\n[CREATE] Criando {num_aider} stories @aider + {num_zero} stories @agente-zero...")
    created = []
    for i in range(num_aider):
        name = create_test_story("@aider", i + 1)
        created.append(name)
        print(f"  + {name}")
    for i in range(num_zero):
        name = create_test_story("@agente-zero", i + 1)
        created.append(name)
        print(f"  + {name}")

    print(f"\n[MONITOR] Aguardando pipeline processar {total_new} stories...")
    print(f"[MONITOR] Target: REVISADO count >= {baseline_revisado + total_new}")
    print(f"[MONITOR] Timeout: 10 minutos")
    print()

    start = time.time()
    timeout = 600  # 10 min
    check_interval = 10
    last_status = ""

    while time.time() - start < timeout:
        elapsed = int(time.time() - start)
        counts = count_statuses()
        current_revisado = counts.get("REVISADO", 0)
        new_revisado = current_revisado - baseline_revisado

        status_str = " | ".join(f"{k}={v}" for k, v in sorted(counts.items()))

        if status_str != last_status:
            print(f"  [{elapsed:>4}s] {status_str} (new REVISADO: {new_revisado}/{total_new})")
            last_status = status_str

        if new_revisado >= total_new:
            elapsed = int(time.time() - start)
            print(f"\n{'=' * 60}")
            print(f"  STRESS TEST PASSED!")
            print(f"  {total_new}/{total_new} stories processadas em {elapsed}s")
            print(f"  Final: {status_str}")
            print(f"{'=' * 60}")
            return 0

        time.sleep(check_interval)

    elapsed = int(time.time() - start)
    counts = count_statuses()
    current_revisado = counts.get("REVISADO", 0)
    new_revisado = current_revisado - baseline_revisado
    status_str = " | ".join(f"{k}={v}" for k, v in sorted(counts.items()))

    print(f"\n{'=' * 60}")
    print(f"  STRESS TEST TIMEOUT!")
    print(f"  {new_revisado}/{total_new} stories processadas em {elapsed}s")
    print(f"  Final: {status_str}")
    print(f"{'=' * 60}")

    # Check which stories are stuck
    print("\n[STUCK] Stories nao REVISADO:")
    for name in created:
        path = os.path.join(STORIES_DIR, name)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read(2000)
            m = re.search(r"\*\*Status:\*\*\s*(\S+)", c)
            status = m.group(1) if m else "?"
            if status != "REVISADO":
                print(f"  {status:15} {name}")

    return 1

if __name__ == "__main__":
    sys.exit(main())
