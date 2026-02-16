"""
MINI STRESS TEST: 3 stories pelo pipeline completo.
Genesis(3) -> Aider(~2) -> Zero(~1 exec + ~2 reviews) -> REVISADO

Roda em 2-5 minutos (vs 30+ min do teste de 20).
"""
import os, sys, json, glob, re, time, subprocess, shutil
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
BACKUP_DIR = os.path.join(STORIES_DIR, "_backup_mini_test")
HEARTBEAT_DIR = "C:/AIOS/workers"
REPORT_JSON = os.path.join(BASE_DIR, "docs/qa/mini-stress-report.json")
REPORT_MD = os.path.join(BASE_DIR, "docs/qa/mini-stress-report.md")

metrics = {"phases": {}, "stories": [], "start": None, "end": None}

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    prefix = {"INFO": "[i]", "OK": "[+]", "WARN": "[!]", "ERR": "[X]", "RUN": "[>]"}.get(level, "[*]")
    try:
        print(f"[{ts}] {prefix} {msg}")
    except UnicodeEncodeError:
        print(f"[{ts}] {prefix} {msg.encode('ascii', 'replace').decode()}")
    sys.stdout.flush()

def heartbeat(worker, status, stats=None):
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {"worker": worker, "pid": os.getpid(), "status": status,
            "last_heartbeat": datetime.now().isoformat(), "stats": stats or {}}
    with open(os.path.join(HEARTBEAT_DIR, f"{worker}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def get_stories():
    return sorted([f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
                    if not os.path.basename(f).startswith("_")])

def get_story_status(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        c = f.read(2000)
    status_m = re.search(r"\*\*Status:\*\*\s*(\S+)", c)
    agent_m = re.search(r"\*\*Agente Sugerido:\*\*\s*(\S+)", c)
    return status_m.group(1) if status_m else "?", agent_m.group(1) if agent_m else "?"

def count_statuses():
    counts = {}
    for s in get_stories():
        status, _ = get_story_status(s)
        counts[status] = counts.get(status, 0) + 1
    return counts

# ============================================================
# PHASE 1: BACKUP & CLEAN
# ============================================================
def phase_backup():
    log("PHASE 1: Backup e limpeza", "RUN")
    os.makedirs(BACKUP_DIR, exist_ok=True)
    existing = get_stories()
    backed = 0
    for f in existing:
        shutil.copy2(f, os.path.join(BACKUP_DIR, os.path.basename(f)))
        os.remove(f)
        backed += 1
    # Clean lock/trigger files
    for pattern in [".trigger_*", ".worker_*.lock"]:
        for f in glob.glob(os.path.join(BASE_DIR, pattern)):
            os.remove(f)
    log(f"  {backed} stories backed up, locks cleaned", "OK")

# ============================================================
# PHASE 2: GENESIS - Create 3 stories (1 batch)
# ============================================================
def phase_genesis():
    log("PHASE 2: GENESIS - Criando 3 stories", "RUN")
    start = time.time()
    heartbeat("genesis", "processing")

    # Genesis creates 5 per batch, we want ~3
    # Modify: just create 1 batch and take what we get
    result = subprocess.run(
        [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/worker_genesis_agent.py")],
        capture_output=True, text=True, timeout=30, cwd=BASE_DIR
    )
    dur = round(time.time() - start, 2)
    stories = get_stories()

    # Keep only first 3
    if len(stories) > 3:
        for s in stories[3:]:
            os.remove(s)
        stories = stories[:3]

    for s in stories:
        status, agent = get_story_status(s)
        log(f"  {os.path.basename(s)[:50]} | {agent}", "OK")

    heartbeat("genesis", "idle")
    metrics["phases"]["genesis"] = {"count": len(stories), "duration_s": dur}
    log(f"  Genesis: {len(stories)} stories em {dur}s", "OK")
    return stories

# ============================================================
# PHASE 3: AIDER - Process @aider stories
# ============================================================
def phase_aider():
    log("PHASE 3: AIDER - Processando stories @aider", "RUN")
    start = time.time()
    heartbeat("aider", "processing")
    processed = 0
    success = 0

    max_cycles = 10
    for cycle in range(max_cycles):
        # Find next @aider TODO
        found = False
        for sf in get_stories():
            status, agent = get_story_status(sf)
            if agent == "@aider" and status == "TODO":
                found = True
                fname = os.path.basename(sf)
                log(f"  [{processed+1}] {fname}", "RUN")
                heartbeat("aider", "processing", {"current": fname})

                story_start = time.time()
                try:
                    proc = subprocess.Popen(
                        [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/aider_worker_engine.py")],
                        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                        cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                    )
                    stdout, stderr = proc.communicate(timeout=150)
                    sdur = round(time.time() - story_start, 2)

                    if proc.returncode == 0 and "SUCESSO" in stdout:
                        log(f"    SUCCESS ({sdur}s)", "OK")
                        success += 1
                    elif "SKIP" in stdout or "PARA_REVISAO" in stdout:
                        log(f"    Processed with notes ({sdur}s)", "OK")
                        success += 1
                    else:
                        log(f"    Failed, applying fallback ({sdur}s)", "WARN")
                        _fallback(sf)
                except subprocess.TimeoutExpired:
                    try:
                        subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                                       capture_output=True, timeout=10)
                    except: proc.kill()
                    try: proc.wait(timeout=5)
                    except: pass
                    sdur = round(time.time() - story_start, 2)
                    log(f"    Timeout ({sdur}s), fallback", "WARN")
                    _fallback(sf)
                except Exception as e:
                    log(f"    Error: {e}", "ERR")
                    _fallback(sf)

                processed += 1
                break

        if not found:
            break

    dur = round(time.time() - start, 2)
    heartbeat("aider", "idle")
    metrics["phases"]["aider"] = {"processed": processed, "success": success, "duration_s": dur}
    log(f"  Aider: {processed} processed, {success} success ({dur}s)", "OK")

def _fallback(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            c = f.read()
        c = re.sub(r"\*\*Status:\*\*\s*\S+", "**Status:** PARA_REVISAO", c)
        c = re.sub(r"\*\*subStatus:\*\*\s*\S+", "**subStatus:** aider_fallback", c)
        c += f"\n\n## Aider Processing Log\n> Fallback at: {datetime.now().isoformat()}\n"
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(c)
    except Exception:
        pass

# ============================================================
# PHASE 4: ZERO - Execute + Review
# ============================================================
def phase_zero():
    log("PHASE 4: ZERO - Executando e revisando", "RUN")
    start = time.time()
    heartbeat("zero", "processing")
    processed = 0

    max_cycles = 15
    for cycle in range(max_cycles):
        result = subprocess.run(
            [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/zero_worker_engine.py")],
            capture_output=True, text=True, timeout=60, cwd=BASE_DIR
        )
        if "Nenhum trabalho pendente" in result.stdout:
            break

        # Log what zero did
        for line in result.stdout.splitlines():
            if any(k in line for k in ["[ZERO]", "[DONE]", "[EXEC]", "[REV]", "PASS", "FAIL"]):
                log(f"  {line.strip()}")
        processed += 1
        heartbeat("zero", "processing", {"cycle": cycle})

    dur = round(time.time() - start, 2)
    heartbeat("zero", "idle")
    metrics["phases"]["zero"] = {"cycles": processed, "duration_s": dur}
    log(f"  Zero: {processed} cycles ({dur}s)", "OK")

# ============================================================
# PHASE 5: VALIDATE & REPORT
# ============================================================
def phase_validate():
    log("PHASE 5: Validacao final", "RUN")
    stories = get_stories()
    all_data = []
    for sf in stories:
        with open(sf, "r", encoding="utf-8", errors="ignore") as f:
            c = f.read()
        status, agent = get_story_status(sf)
        has_log = "## Aider Processing Log" in c or "## Execution Log" in c or "## Review Results" in c
        data = {
            "filename": os.path.basename(sf),
            "status": status,
            "agent": agent,
            "has_processing_log": has_log,
            "size": len(c),
            "lines": c.count("\n") + 1
        }
        all_data.append(data)
        log(f"  {data['filename'][:45]:45s} | {status:15s} | {agent:15s} | log={'Y' if has_log else 'N'}")

    counts = count_statuses()
    total = len(stories)
    revisado = counts.get("REVISADO", 0)

    log(f"  Status: {dict(counts)}")
    log(f"  Pipeline: {revisado}/{total} REVISADO ({round(revisado/total*100,1) if total else 0}%)", "OK")

    metrics["stories"] = all_data
    metrics["final_counts"] = counts
    metrics["pipeline_success"] = revisado == total

    # Generate report
    os.makedirs(os.path.dirname(REPORT_JSON), exist_ok=True)
    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, default=str)
    log(f"  Report: {REPORT_JSON}", "OK")

    # MD report
    gp = metrics["phases"].get("genesis", {})
    ap = metrics["phases"].get("aider", {})
    zp = metrics["phases"].get("zero", {})
    md = f"""# Mini Stress Test Report (3 Stories)
> Generated: {metrics['end']}
> Duration: {metrics.get('total_duration_s', '?')}s

## Pipeline: {revisado}/{total} REVISADO

| Phase | Metric | Value |
|-------|--------|-------|
| Genesis | Stories | {gp.get('count', '?')} |
| Genesis | Duration | {gp.get('duration_s', '?')}s |
| Aider | Processed | {ap.get('processed', '?')} |
| Aider | Success | {ap.get('success', '?')} |
| Aider | Duration | {ap.get('duration_s', '?')}s |
| Zero | Cycles | {zp.get('cycles', '?')} |
| Zero | Duration | {zp.get('duration_s', '?')}s |

## Stories
| Story | Status | Agent | Log |
|-------|--------|-------|-----|
"""
    for s in all_data:
        md += f"| {s['filename'][:40]} | {s['status']} | {s['agent']} | {'Y' if s['has_processing_log'] else 'N'} |\n"

    md += f"\n---\n*Mini Stress Test - Diana Corporacao Senciente*\n"
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md)
    log(f"  MD Report: {REPORT_MD}", "OK")

# ============================================================
# MAIN
# ============================================================
def main():
    metrics["start"] = datetime.now().isoformat()
    total_start = time.time()

    log("=" * 50)
    log("MINI STRESS TEST: 3 Stories Pipeline")
    log("=" * 50)

    try:
        phase_backup()
        phase_genesis()
        phase_aider()
        phase_zero()
    except Exception as e:
        log(f"FATAL: {e}", "ERR")
        import traceback
        traceback.print_exc()

    metrics["end"] = datetime.now().isoformat()
    metrics["total_duration_s"] = round(time.time() - total_start, 2)

    phase_validate()

    log("=" * 50)
    counts = count_statuses()
    revisado = counts.get("REVISADO", 0)
    total = sum(counts.values())
    log(f"RESULTADO: {revisado}/{total} REVISADO em {metrics['total_duration_s']}s")
    if revisado == total:
        log("PIPELINE 100% FUNCIONAL!", "OK")
    else:
        log(f"Pipeline incompleto. Status: {dict(counts)}", "WARN")
    log("=" * 50)

if __name__ == "__main__":
    main()
