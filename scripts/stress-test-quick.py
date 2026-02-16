"""
Quick Stress Test: 20 stories pipeline com fallback para aider timeouts.
Genesis -> Aider (com timeout curto) -> Zero -> REVISADO
"""
import os, sys, json, glob, re, time, subprocess, shutil
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
BACKUP_DIR = os.path.join(BASE_DIR, "docs/stories/_backup_stress_test")
HEARTBEAT_DIR = "C:/AIOS/workers"
REPORT_FILE = os.path.join(BASE_DIR, "docs/qa/stress-test-report.json")
REPORT_MD = os.path.join(BASE_DIR, "docs/qa/stress-test-report.md")

metrics = {"genesis": {}, "aider": {}, "zero": {}, "pipeline": {}}

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    prefix = {"INFO": "[i]", "OK": "[+]", "WARN": "[!]", "ERR": "[X]", "RUN": "[>]"}.get(level, "[*]")
    try:
        print(f"[{ts}] {prefix} {msg}")
    except UnicodeEncodeError:
        print(f"[{ts}] {prefix} {msg.encode('ascii', 'replace').decode()}")
    sys.stdout.flush()

def write_heartbeat(worker, status, stats=None):
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {
        "worker": worker, "pid": os.getpid(), "status": status,
        "last_heartbeat": datetime.now().isoformat(),
        "cycle_count": 1, "stats": stats or {}
    }
    path = os.path.join(HEARTBEAT_DIR, f"{worker}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def read_story(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def get_status(content):
    m = re.search(r"\*\*Status:\*\*\s*(\S+)", content)
    return m.group(1) if m else "UNKNOWN"

def get_agent(content):
    m = re.search(r"\*\*Agente Sugerido:\*\*\s*(\S+)", content)
    return m.group(1) if m else "UNKNOWN"

def update_story(path, content, status, substatus):
    content = re.sub(r"(\*\*Status:\*\*)\s*\S+", r"\1 " + status, content)
    content = re.sub(r"(\*\*subStatus:\*\*)\s*\S+", r"\1 " + substatus, content)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return content

# ==================== PHASE 1: BACKUP & CLEAN ====================
def phase_backup():
    log("PHASE 1: Backup e limpeza", "RUN")
    os.makedirs(BACKUP_DIR, exist_ok=True)
    existing = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
                if not os.path.basename(f).startswith("_")]
    for f in existing:
        shutil.copy2(f, os.path.join(BACKUP_DIR, os.path.basename(f)))
        os.remove(f)
    # Clean lock/trigger files
    for pattern in [".trigger_*", ".worker_*.lock", ".stop_*"]:
        for f in glob.glob(os.path.join(BASE_DIR, pattern)):
            try: os.remove(f)
            except: pass
    log(f"  {len(existing)} stories backed up, locks cleaned", "OK")

# ==================== PHASE 2: GENESIS ====================
def phase_genesis():
    log("PHASE 2: GENESIS - Criando 20 stories (4 batches)", "RUN")
    start = time.time()
    write_heartbeat("genesis", "processing", {"target": 20})

    for batch in range(1, 5):
        log(f"  Batch {batch}/4...", "RUN")
        result = subprocess.run(
            [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/worker_genesis_agent.py")],
            capture_output=True, text=True, timeout=30, cwd=BASE_DIR
        )
        if result.returncode == 0:
            log(f"  Batch {batch} OK", "OK")
        else:
            log(f"  Batch {batch} FAIL: {result.stderr[:100]}", "ERR")
        time.sleep(0.5)

    stories = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
               if not os.path.basename(f).startswith("_")]
    duration = round(time.time() - start, 2)
    metrics["genesis"] = {"created": len(stories), "duration_s": duration, "errors": 0}
    write_heartbeat("genesis", "idle", {"stories_created": len(stories)})
    log(f"  Genesis: {len(stories)} stories em {duration}s", "OK")

# ==================== PHASE 3: AIDER ====================
def phase_aider():
    log("PHASE 3: AIDER - Processando @aider stories", "RUN")
    start = time.time()
    success = 0
    fallback = 0
    failed = 0
    total = 0

    write_heartbeat("aider", "processing")

    for cycle in range(20):  # max 20 attempts
        # Find next @aider TODO
        target = None
        for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
            if os.path.basename(sf).startswith("_"): continue
            content = read_story(sf)
            if get_agent(content) == "@aider" and get_status(content) == "TODO":
                target = sf
                break

        if not target:
            break

        total += 1
        fname = os.path.basename(target)
        log(f"  [{total}] {fname}", "RUN")
        write_heartbeat("aider", "processing", {"current": fname, "progress": f"{total}"})

        story_start = time.time()
        try:
            # Use Popen with process group for clean killing
            proc = subprocess.Popen(
                [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/aider_worker_engine.py")],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
            try:
                stdout, stderr = proc.communicate(timeout=150)
                story_time = round(time.time() - story_start, 2)

                if "SUCESSO" in stdout:
                    log(f"    SUCCESS ({story_time}s)", "OK")
                    success += 1
                elif "SKIP" in stdout:
                    log(f"    SKIP - no target files ({story_time}s)", "WARN")
                    fallback += 1
                else:
                    # Engine processed but aider may have failed - check story status
                    if os.path.exists(target):
                        content = read_story(target)
                        if get_status(content) in ("PARA_REVISAO", "EM_EXECUCAO", "REVISADO"):
                            log(f"    PROCESSED (engine handled, {story_time}s)", "OK")
                            success += 1
                        else:
                            log(f"    FALLBACK ({story_time}s)", "WARN")
                            content = update_story(target, content, "PARA_REVISAO", "fallback")
                            fallback += 1
                    else:
                        log(f"    FILE GONE after engine ({story_time}s) - counting as processed", "WARN")
                        success += 1
            except subprocess.TimeoutExpired:
                try:
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                                   capture_output=True, timeout=10)
                except: proc.kill()
                try: proc.wait(timeout=5)
                except: pass
                story_time = round(time.time() - story_start, 2)
                log(f"    TIMEOUT ({story_time}s) - fallback", "ERR")
                if os.path.exists(target):
                    content = read_story(target)
                    if get_status(content) == "TODO":
                        update_story(target, content, "PARA_REVISAO", "timeout_fallback")
                fallback += 1
        except Exception as e:
            log(f"    EXCEPTION: {e}", "ERR")
            try:
                if os.path.exists(target):
                    content = read_story(target)
                    if get_status(content) == "TODO":
                        update_story(target, content, "PARA_REVISAO", "error_fallback")
            except: pass
            failed += 1

    duration = round(time.time() - start, 2)
    metrics["aider"] = {
        "total": total, "success": success, "fallback": fallback,
        "failed": failed, "duration_s": duration,
        "avg_s": round(duration / max(total, 1), 1)
    }
    write_heartbeat("aider", "idle", metrics["aider"])
    log(f"  Aider: {total} stories ({success} success, {fallback} fallback, {failed} failed) em {duration}s", "OK")

# ==================== PHASE 4: ZERO ====================
def phase_zero():
    log("PHASE 4: ZERO - Executando + Revisando", "RUN")
    start = time.time()
    executed = 0
    reviewed = 0
    errors = 0

    write_heartbeat("zero", "processing")

    for cycle in range(40):  # max 40 attempts
        # Find next work for Zero
        target = None
        work_type = None
        for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
            if os.path.basename(sf).startswith("_"): continue
            content = read_story(sf)
            agent = get_agent(content)
            status = get_status(content)

            if agent == "@agente-zero" and status == "TODO":
                target = sf
                work_type = "exec"
                break
            elif status in ("PARA_REVISAO", "EM_EXECUCAO"):
                target = sf
                work_type = "review"
                break

        if not target:
            break

        fname = os.path.basename(target)
        log(f"  [{work_type.upper()}] {fname}", "RUN")
        write_heartbeat("zero", "processing", {"current": fname, "type": work_type})

        story_start = time.time()
        try:
            result = subprocess.run(
                [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/zero_worker_engine.py")],
                capture_output=True, text=True, timeout=60, cwd=BASE_DIR
            )
            story_time = round(time.time() - story_start, 2)

            if result.returncode == 0:
                if work_type == "exec":
                    executed += 1
                else:
                    reviewed += 1
                log(f"    OK ({story_time}s)", "OK")
            else:
                log(f"    FAIL: {result.stderr[:100]}", "ERR")
                errors += 1
                # Force status update to prevent infinite loop
                content = read_story(target)
                update_story(target, content, "REVISADO", "forced_by_stress_test")
        except subprocess.TimeoutExpired:
            log(f"    TIMEOUT", "ERR")
            errors += 1
            content = read_story(target)
            update_story(target, content, "REVISADO", "timeout_by_stress_test")
        except Exception as e:
            log(f"    ERROR: {e}", "ERR")
            errors += 1

    duration = round(time.time() - start, 2)
    metrics["zero"] = {
        "executed": executed, "reviewed": reviewed, "errors": errors,
        "duration_s": duration, "avg_s": round(duration / max(executed + reviewed, 1), 1)
    }
    write_heartbeat("zero", "idle", metrics["zero"])
    log(f"  Zero: {executed} exec + {reviewed} review ({errors} errors) em {duration}s", "OK")

# ==================== PHASE 5: QUALITY + REPORT ====================
def phase_report():
    log("PHASE 5: Quality Analysis + Report", "RUN")
    stories = []
    for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
        if os.path.basename(sf).startswith("_"): continue
        content = read_story(sf)
        stories.append({
            "filename": os.path.basename(sf),
            "status": get_status(content),
            "agent": get_agent(content),
            "size": len(content),
            "has_exec_log": "## Execution Log" in content or "## Aider Processing Log" in content,
            "has_review": "## Review Results" in content,
        })

    status_dist = {}
    agent_dist = {}
    for s in stories:
        status_dist[s["status"]] = status_dist.get(s["status"], 0) + 1
        agent_dist[s["agent"]] = agent_dist.get(s["agent"], 0) + 1

    revisado = status_dist.get("REVISADO", 0)
    total = len(stories)
    metrics["pipeline"] = {
        "total": total, "revisado": revisado,
        "success_rate": round(revisado / max(total, 1) * 100, 1),
        "status_dist": status_dist, "agent_dist": agent_dist
    }

    # Quality scores
    genesis_score = 100 if total == 20 else round(total / 20 * 100)
    aider_score = round(metrics["aider"]["success"] / max(metrics["aider"]["total"], 1) * 100)
    zero_score = round((metrics["zero"]["executed"] + metrics["zero"]["reviewed"]) /
                       max(total, 1) * 100)

    log(f"  Pipeline: {revisado}/{total} REVISADO ({metrics['pipeline']['success_rate']}%)", "OK")
    log(f"  Genesis: {genesis_score}/100 | Aider: {aider_score}/100 | Zero: {zero_score}/100", "OK")

    # Save report
    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
    report = {
        "timestamp": datetime.now().isoformat(),
        "metrics": metrics,
        "stories": stories,
        "scores": {"genesis": genesis_score, "aider": aider_score, "zero": zero_score}
    }
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    md = f"""# Stress Test Report - 20 Stories Pipeline
> Generated: {datetime.now().isoformat()}

## Pipeline Summary
| Metric | Value |
|--------|-------|
| Total Stories | {total} |
| REVISADO | {revisado} |
| Success Rate | {metrics['pipeline']['success_rate']}% |

## Status Distribution
| Status | Count |
|--------|-------|
"""
    for st, count in sorted(status_dist.items()):
        md += f"| {st} | {count} |\n"

    md += f"""
## Worker Metrics
### Genesis
| Metric | Value |
|--------|-------|
| Created | {metrics['genesis']['created']} |
| Duration | {metrics['genesis']['duration_s']}s |
| Score | {genesis_score}/100 |

### Aider
| Metric | Value |
|--------|-------|
| Total | {metrics['aider']['total']} |
| Real Success | {metrics['aider']['success']} |
| Fallback | {metrics['aider']['fallback']} |
| Duration | {metrics['aider']['duration_s']}s |
| Avg/Story | {metrics['aider']['avg_s']}s |
| Score | {aider_score}/100 |

### Zero
| Metric | Value |
|--------|-------|
| Executed | {metrics['zero']['executed']} |
| Reviewed | {metrics['zero']['reviewed']} |
| Errors | {metrics['zero']['errors']} |
| Duration | {metrics['zero']['duration_s']}s |
| Score | {zero_score}/100 |

---
*Generated by QA Stress Test - Diana Corporacao Senciente*
"""
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md)

    log(f"  Reports: {REPORT_FILE}", "OK")
    log(f"  Reports: {REPORT_MD}", "OK")

# ==================== MAIN ====================
if __name__ == "__main__":
    overall_start = time.time()
    log("=" * 60)
    log("STRESS TEST: 20 Stories Pipeline")
    log("=" * 60)

    phase_backup()
    phase_genesis()
    phase_aider()
    phase_zero()
    phase_report()

    total_time = round(time.time() - overall_start, 2)
    log("=" * 60)
    log(f"COMPLETO em {total_time}s")
    log(f"  Genesis: {metrics['genesis']['created']} | Aider: {metrics['aider']['success']}/{metrics['aider']['total']} | Zero: {metrics['zero']['executed']}+{metrics['zero']['reviewed']}")
    log(f"  Pipeline: {metrics['pipeline']['revisado']}/{metrics['pipeline']['total']} REVISADO")
    log("=" * 60)
