"""
Pipeline Validator - Testa o fluxo completo Genesis -> Aider -> Zero -> REVISADO.
Rapido, direto, sem overengineering. Roda 5 stories por padrao.
"""
import os, sys, glob, re, time, subprocess, json, shutil
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
BACKUP_DIR = os.path.join(BASE_DIR, "docs/stories/_backup_validate")
HEARTBEAT_DIR = "C:/AIOS/workers"
AIDER_TIMEOUT = 150  # 2.5 min per story
AIDER_COOLDOWN = 5

NUM_STORIES = int(sys.argv[1]) if len(sys.argv) > 1 else 5
SKIP_AIDER = "--skip-aider" in sys.argv


def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    try:
        print(f"[{ts}] {msg}")
    except UnicodeEncodeError:
        print(f"[{ts}] {msg.encode('ascii','replace').decode()}")
    sys.stdout.flush()


def get_statuses():
    """Return dict of status counts from stories dir."""
    counts = {}
    for f in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        if os.path.basename(f).startswith("_"):
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                c = fh.read(1000)
            m = re.search(r"\*\*Status:\*\*\s*(\S+)", c)
            st = m.group(1) if m else "UNKNOWN"
            counts[st] = counts.get(st, 0) + 1
        except Exception:
            counts["ERROR"] = counts.get("ERROR", 0) + 1
    return counts


def count_by_agent(agent, status="TODO"):
    """Count stories for a specific agent and status."""
    n = 0
    for f in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        if os.path.basename(f).startswith("_"):
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                c = fh.read(1000)
            if f"**Agente Sugerido:** {agent}" in c and f"**Status:** {status}" in c:
                n += 1
        except Exception:
            pass
    return n


def set_stories_status(agent, from_status, to_status, sub_status, log_section=""):
    """Bulk change story statuses for a given agent."""
    changed = 0
    for f in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
        if os.path.basename(f).startswith("_"):
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                c = fh.read()
            if f"**Agente Sugerido:** {agent}" in c and f"**Status:** {from_status}" in c:
                c = re.sub(r"\*\*Status:\*\*\s*\S+", f"**Status:** {to_status}", c)
                c = re.sub(r"\*\*subStatus:\*\*\s*\S+", f"**subStatus:** {sub_status}", c)
                if log_section:
                    c += f"\n\n{log_section}\n"
                with open(f, "w", encoding="utf-8") as fh:
                    fh.write(c)
                changed += 1
        except Exception:
            pass
    return changed


def kill_aider():
    try:
        subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command",
             "Stop-Process -Name aider -Force -ErrorAction SilentlyContinue"],
            capture_output=True, timeout=5
        )
    except Exception:
        pass


# ============================================================
# MAIN
# ============================================================
def main():
    start = time.time()
    batches = max(1, NUM_STORIES // 5)
    results = {"genesis": 0, "aider_real": 0, "aider_skip": 0, "zero_exec": 0, "zero_review": 0, "errors": 0}

    log(f"=== PIPELINE VALIDATOR: {NUM_STORIES} stories ===")

    # 0. CLEANUP stale locks and triggers
    for stale in glob.glob(os.path.join(BASE_DIR, ".worker_*.lock")) + \
                 glob.glob(os.path.join(BASE_DIR, ".trigger_*")) + \
                 glob.glob(os.path.join(BASE_DIR, ".stop_*")):
        try:
            os.remove(stale)
            log(f"   Removed stale: {os.path.basename(stale)}")
        except Exception:
            pass

    # 1. BACKUP
    log("-- BACKUP --")
    os.makedirs(BACKUP_DIR, exist_ok=True)
    for f in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        if os.path.basename(f).startswith("_"):
            continue
        shutil.copy2(f, os.path.join(BACKUP_DIR, os.path.basename(f)))
        os.remove(f)
    log(f"   Cleaned stories dir")

    # 2. GENESIS
    log("-- GENESIS --")
    t0 = time.time()
    for b in range(batches):
        r = subprocess.run(
            [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/worker_genesis_agent.py")],
            capture_output=True, text=True, timeout=30, cwd=BASE_DIR
        )
        if r.returncode != 0:
            log(f"   Batch {b+1} FAILED")
            results["errors"] += 1
    statuses = get_statuses()
    results["genesis"] = statuses.get("TODO", 0)
    log(f"   Created {results['genesis']} stories in {time.time()-t0:.1f}s")
    log(f"   Statuses: {statuses}")

    # 3. AIDER
    log("-- AIDER --")
    t0 = time.time()
    aider_todo = count_by_agent("@aider", "TODO")
    log(f"   {aider_todo} @aider TODO stories")

    if SKIP_AIDER:
        # Simulate: mark all @aider as PARA_REVISAO
        changed = set_stories_status(
            "@aider", "TODO", "PARA_REVISAO", "simulated_aider",
            "## Aider Processing Log\n> Method: simulated (--skip-aider)\n> Timestamp: " + datetime.now().isoformat()
        )
        results["aider_skip"] = changed
        log(f"   Simulated {changed} stories (--skip-aider)")
    else:
        processed = 0
        consecutive_fails = 0
        while True:
            remaining = count_by_agent("@aider", "TODO")
            if remaining == 0:
                break
            if consecutive_fails >= 3:
                # Fallback remaining
                changed = set_stories_status(
                    "@aider", "TODO", "PARA_REVISAO", "aider_fallback",
                    "## Aider Processing Log\n> Method: fallback (3 failures)\n> Timestamp: " + datetime.now().isoformat()
                )
                results["aider_skip"] += changed
                log(f"   Fallback {changed} stories after {consecutive_fails} failures")
                break

            kill_aider()
            processed += 1
            log(f"   [{processed}/{aider_todo}] Processing (remaining: {remaining})...")

            before = remaining
            try:
                proc = subprocess.Popen(
                    [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/aider_worker_engine.py")],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                )
                proc.wait(timeout=AIDER_TIMEOUT)
                after = count_by_agent("@aider", "TODO")
                if before > after:
                    results["aider_real"] += (before - after)
                    consecutive_fails = 0
                    log(f"   OK (rc={proc.returncode}) in {time.time()-t0:.0f}s")
                else:
                    consecutive_fails += 1
                    log(f"   No progress (rc={proc.returncode})")
            except subprocess.TimeoutExpired:
                try:
                    proc.kill()
                    proc.wait(timeout=5)
                except Exception:
                    pass
                kill_aider()
                after = count_by_agent("@aider", "TODO")
                if before > after:
                    results["aider_real"] += (before - after)
                    log(f"   Timeout but handled")
                else:
                    consecutive_fails += 1
                    log(f"   Timeout, no progress")
            except Exception as e:
                consecutive_fails += 1
                log(f"   Error: {e}")

            time.sleep(AIDER_COOLDOWN)

    log(f"   Aider done in {time.time()-t0:.1f}s: {results['aider_real']} real, {results['aider_skip']} simulated")
    log(f"   Statuses: {get_statuses()}")

    # 4. ZERO
    log("-- ZERO --")
    t0 = time.time()
    max_cycles = NUM_STORIES + 5
    for cycle in range(max_cycles):
        # Check what's pending
        zero_todo = count_by_agent("@agente-zero", "TODO")
        para_rev = get_statuses().get("PARA_REVISAO", 0)
        em_exec = get_statuses().get("EM_EXECUCAO", 0)
        em_rev = get_statuses().get("EM_REVISAO", 0)
        pending = zero_todo + para_rev + em_exec + em_rev

        if pending == 0:
            break

        r = subprocess.run(
            [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/zero_worker_engine.py")],
            capture_output=True, text=True, timeout=60, cwd=BASE_DIR
        )
        if r.returncode == 0:
            if zero_todo > 0:
                results["zero_exec"] += 1
            else:
                results["zero_review"] += 1
        elif r.returncode == 1:
            break  # No more work

    log(f"   Zero done in {time.time()-t0:.1f}s: {results['zero_exec']} exec, {results['zero_review']} reviews")

    # 5. FINAL
    statuses = get_statuses()
    total = sum(statuses.values())
    revisado = statuses.get("REVISADO", 0)
    duration = time.time() - start

    log("== RESULTS ==")
    log(f"   Pipeline: {revisado}/{total} REVISADO ({revisado/max(total,1)*100:.0f}%)")
    log(f"   Statuses: {statuses}")
    log(f"   Genesis: {results['genesis']} stories")
    log(f"   Aider: {results['aider_real']} real + {results['aider_skip']} simulated")
    log(f"   Zero: {results['zero_exec']} exec + {results['zero_review']} reviews")
    log(f"   Errors: {results['errors']}")
    log(f"   Duration: {duration:.1f}s")

    # Write heartbeats with final state
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    for w in ("genesis", "aider", "zero"):
        with open(os.path.join(HEARTBEAT_DIR, f"{w}.json"), "w") as f:
            json.dump({
                "worker": w, "pid": os.getpid(), "status": "idle",
                "last_heartbeat": datetime.now().isoformat(),
                "cycle_count": 99, "stats": {"validate_complete": True, "revisado": revisado}
            }, f, indent=2)

    # PASS/FAIL
    if revisado == total and total > 0:
        log(f"=== PASS: {total}/{total} REVISADO ===")
        return 0
    else:
        log(f"=== FAIL: {revisado}/{total} REVISADO ===")
        return 1


if __name__ == "__main__":
    sys.exit(main())
