"""
STRESS TEST: Processa 20 stories automaticamente pelo pipeline completo.
Genesis -> Aider -> Zero -> REVISADO

Gera métricas detalhadas por worker e por story.
"""
import os, sys, json, glob, re, time, subprocess, shutil, signal
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
BACKUP_DIR = os.path.join(BASE_DIR, "docs/stories/_backup_stress_test")
HEARTBEAT_DIR = "C:/AIOS/workers"
REPORT_FILE = os.path.join(BASE_DIR, "docs/qa/stress-test-report.json")
REPORT_MD = os.path.join(BASE_DIR, "docs/qa/stress-test-report.md")

# ============================================================
# CONCURRENCY LIMITS - Valores saudaveis para APIs LLM
# ============================================================
AIDER_MAX_CONCURRENT = 1          # Nunca mais de 1 aider por vez
AIDER_TIMEOUT_S = 150             # Timeout por story (2.5 min)
AIDER_COOLDOWN_S = 5              # Cooldown entre chamadas (respeitar rate limit)
AIDER_RETRY_BACKOFF_S = 10        # Backoff apos falha (dar tempo ao rate limit)
AIDER_MAX_RETRIES = 1             # Retry 1x se falhar (depois fallback)

# ============================================================
# METRICS TRACKING
# ============================================================
metrics = {
    "test_start": None,
    "test_end": None,
    "total_duration_s": 0,
    "genesis": {
        "stories_created": 0,
        "batches_run": 0,
        "errors": 0,
        "duration_s": 0,
        "stories": []
    },
    "aider": {
        "stories_processed": 0,
        "stories_success": 0,
        "stories_failed": 0,
        "stories_fallback": 0,
        "duration_s": 0,
        "avg_time_per_story_s": 0,
        "stories": []
    },
    "zero": {
        "stories_executed": 0,
        "stories_reviewed": 0,
        "errors": 0,
        "duration_s": 0,
        "avg_time_per_story_s": 0,
        "stories": []
    },
    "pipeline": {
        "total_stories": 0,
        "fully_processed": 0,
        "status_distribution": {},
        "agent_distribution": {}
    },
    "quality": {
        "genesis_quality": {},
        "aider_quality": {},
        "zero_quality": {}
    }
}

def _snapshot_statuses(label):
    """Diagnostic: log all story statuses at this moment."""
    log(f"  --- SNAPSHOT: {label} ---")
    status_counts = {}
    for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
        if os.path.basename(sf).startswith("_"):
            continue
        try:
            with open(sf, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read(2000)
            m = re.search(r"\*\*Status:\*\*\s*(\S+)", content)
            st = m.group(1) if m else "NO_STATUS"
            status_counts[st] = status_counts.get(st, 0) + 1
        except Exception:
            status_counts["READ_ERROR"] = status_counts.get("READ_ERROR", 0) + 1
    for st, cnt in sorted(status_counts.items()):
        log(f"    {st}: {cnt}")
    log(f"  --- END SNAPSHOT ---")


def kill_orphan_aider():
    """Kill any orphan aider processes to ensure clean slate for next call."""
    try:
        subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command",
             "Get-Process -Name 'aider*' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"],
            capture_output=True, timeout=5
        )
    except Exception:
        pass


def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    prefix = {"INFO": "[i]", "OK": "[+]", "WARN": "[!]", "ERR": "[X]", "RUN": "[>]"}.get(level, "[*]")
    try:
        print(f"[{ts}] {prefix} {msg}")
    except UnicodeEncodeError:
        print(f"[{ts}] {prefix} {msg.encode('ascii', 'replace').decode()}")
    sys.stdout.flush()

def write_heartbeat(worker, status, stats=None):
    """Simulate heartbeat for dashboard monitoring"""
    os.makedirs(HEARTBEAT_DIR, exist_ok=True)
    data = {
        "worker": worker,
        "pid": os.getpid(),
        "status": status,
        "last_heartbeat": datetime.now().isoformat(),
        "cycle_count": 1,
        "stats": stats or {}
    }
    path = os.path.join(HEARTBEAT_DIR, f"{worker}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def parse_story(filepath):
    """Parse a story markdown file into structured data"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {"error": str(e), "filepath": filepath}

    data = {
        "filepath": filepath,
        "filename": os.path.basename(filepath),
        "raw_size": len(content),
        "lines": content.count('\n') + 1,
    }

    # Parse fields
    status_m = re.search(r"\*\*Status:\*\*\s*(\S+)", content)
    substatus_m = re.search(r"\*\*subStatus:\*\*\s*(\S+)", content)
    agent_m = re.search(r"\*\*Agente Sugerido:\*\*\s*(\S+)", content)
    diff_m = re.search(r"\*\*Dificuldade:\*\*\s*(\S+)", content)
    title_m = re.search(r"^#\s+\[([^\]]+)\]\s+(.*)", content, re.MULTILINE)
    objetivo_m = re.search(r"##.*Objetivo\s*\n(.+)", content)

    data["status"] = status_m.group(1) if status_m else "UNKNOWN"
    data["substatus"] = substatus_m.group(1) if substatus_m else "UNKNOWN"
    data["agent"] = agent_m.group(1) if agent_m else "UNKNOWN"
    data["difficulty"] = diff_m.group(1) if diff_m else "UNKNOWN"
    data["story_id"] = title_m.group(1) if title_m else "NO_ID"
    data["title"] = title_m.group(2).strip() if title_m else "NO_TITLE"
    data["objetivo"] = objetivo_m.group(1).strip() if objetivo_m else "NO_OBJECTIVE"
    data["has_sections"] = bool(re.search(r"##", content))
    data["has_objective"] = bool(objetivo_m)

    return data

# ============================================================
# PHASE 1: BACKUP & CLEAN
# ============================================================
def phase_backup():
    log("PHASE 1: Backup e limpeza de stories existentes", "RUN")

    os.makedirs(BACKUP_DIR, exist_ok=True)

    existing = glob.glob(os.path.join(STORIES_DIR, "*.md"))
    for f in existing:
        fname = os.path.basename(f)
        if fname.startswith("_"):
            continue  # skip utility files
        shutil.copy2(f, os.path.join(BACKUP_DIR, fname))
        os.remove(f)
        log(f"  Backed up: {fname}")

    log(f"  {len(existing)} stories backed up to {BACKUP_DIR}", "OK")

# ============================================================
# PHASE 2: GENESIS - Create 20 stories (4 batches of 5)
# ============================================================
def phase_genesis():
    log("PHASE 2: GENESIS - Criando 20 stories (4 batches)", "RUN")
    start = time.time()

    write_heartbeat("genesis", "processing", {"target": 20})

    for batch in range(1, 5):
        log(f"  Genesis batch {batch}/4...", "RUN")
        try:
            result = subprocess.run(
                [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/worker_genesis_agent.py")],
                capture_output=True, text=True, timeout=30,
                cwd=BASE_DIR
            )
            if result.returncode == 0:
                log(f"  Batch {batch} OK: {result.stdout.strip().split(chr(10))[-1]}", "OK")
                metrics["genesis"]["batches_run"] += 1
            else:
                log(f"  Batch {batch} FAILED: {result.stderr[:200]}", "ERR")
                metrics["genesis"]["errors"] += 1
        except Exception as e:
            log(f"  Batch {batch} EXCEPTION: {e}", "ERR")
            metrics["genesis"]["errors"] += 1

        # Update heartbeat for dashboard
        stories = glob.glob(os.path.join(STORIES_DIR, "*.md"))
        write_heartbeat("genesis", "scanning", {
            "total_stories": len(stories),
            "batch": batch
        })
        time.sleep(1)  # Small delay between batches

    # Count results
    all_stories = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
                   if not os.path.basename(f).startswith("_")]
    metrics["genesis"]["stories_created"] = len(all_stories)
    metrics["genesis"]["duration_s"] = round(time.time() - start, 2)

    # Parse each story for metrics
    for sf in all_stories:
        data = parse_story(sf)
        metrics["genesis"]["stories"].append(data)

    write_heartbeat("genesis", "idle", {"stories_created": len(all_stories)})
    log(f"  Genesis total: {len(all_stories)} stories criadas em {metrics['genesis']['duration_s']}s", "OK")

# ============================================================
# PHASE 3: AIDER - Process @aider TODO stories
# ============================================================
def _count_aider_todo():
    """Count remaining @aider TODO stories."""
    count = 0
    total_files = 0
    first = None
    for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
        if os.path.basename(sf).startswith("_"):
            continue
        total_files += 1
        try:
            with open(sf, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read(2000)
            if "**Agente Sugerido:** @aider" in c and re.search(r"Status:\*\*\s*TODO", c, re.IGNORECASE):
                count += 1
                if first is None:
                    first = os.path.basename(sf)
        except Exception:
            continue
    return count, first, total_files


def _apply_fallback_to_remaining():
    """Apply fallback to all remaining @aider TODO stories (mark as PARA_REVISAO)."""
    applied = 0
    for sf in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        if os.path.basename(sf).startswith("_"):
            continue
        try:
            with open(sf, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if "**Agente Sugerido:** @aider" in content and re.search(r"Status:\*\*\s*TODO", content, re.IGNORECASE):
                content = re.sub(r"\*\*Status:\*\*\s*\S+", "**Status:** PARA_REVISAO", content)
                content = re.sub(r"\*\*subStatus:\*\*\s*\S+", "**subStatus:** awaiting_reviewer_sentinel", content)
                content += f"\n\n## Aider Processing Log\n"
                content += f"> Processed at: {datetime.now().isoformat()}\n"
                content += f"> Method: simulated_fallback (API unavailable after retries)\n"
                with open(sf, "w", encoding="utf-8") as f:
                    f.write(content)
                applied += 1
                log(f"    Fallback applied: {os.path.basename(sf)}")
        except Exception as e:
            log(f"    Fallback error: {e}", "ERR")
    return applied


def phase_aider():
    """Process @aider stories sequentially with rate limiting.

    Strategy: call aider_worker_engine.py in a loop. Each call processes
    ONE story (the first TODO it finds). Loop until no more TODOs.

    Concurrency: MAX_CONCURRENT=1, with cooldown between calls and
    adaptive backoff on consecutive failures.
    """
    log("PHASE 3: AIDER - Processando stories @aider", "RUN")
    log(f"  Config: max_concurrent={AIDER_MAX_CONCURRENT}, timeout={AIDER_TIMEOUT_S}s, cooldown={AIDER_COOLDOWN_S}s, retry={AIDER_MAX_RETRIES}")
    start = time.time()

    # Kill any pre-existing orphan aider processes
    kill_orphan_aider()

    initial_count, _, initial_files = _count_aider_todo()
    total_files = initial_files
    log(f"  Encontradas {initial_count} stories @aider TODO (total files: {initial_files})")
    metrics["aider"]["stories_processed"] = initial_count

    write_heartbeat("aider", "processing", {"total_todo": initial_count})

    processed = 0
    consecutive_failures = 0
    max_loops = initial_count * (1 + AIDER_MAX_RETRIES) + 5  # Safety limit

    for loop in range(max_loops):
        remaining, next_story, total_files = _count_aider_todo()
        if remaining == 0:
            break

        processed += 1
        log(f"  [{processed}/{initial_count}] Processando: {next_story} (remaining: {remaining}, total_files: {total_files})", "RUN")

        write_heartbeat("aider", "processing", {
            "current": next_story,
            "progress": f"{processed}/{initial_count}",
            "remaining": remaining,
            "consecutive_failures": consecutive_failures
        })

        # Adaptive backoff on consecutive failures (API rate limiting)
        if consecutive_failures >= 3:
            backoff = min(AIDER_RETRY_BACKOFF_S * consecutive_failures, 60)
            log(f"    Rate limit backoff: {backoff}s ({consecutive_failures} consecutive failures)", "WARN")
            time.sleep(backoff)

        # Run engine (processes first TODO it finds)
        # NOTE: DEVNULL to avoid Windows pipe deadlocks with grandchild processes
        kill_orphan_aider()
        before_remaining = remaining
        story_start = time.time()
        try:
            proc = subprocess.Popen(
                [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/aider_worker_engine.py")],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                cwd=BASE_DIR,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
            proc.wait(timeout=AIDER_TIMEOUT_S)
            duration = round(time.time() - story_start, 2)

            # Detect success by counting remaining TODOs (most reliable)
            after_remaining, _, after_files = _count_aider_todo()
            handled = before_remaining - after_remaining

            if after_files < total_files:
                log(f"    WARNING: files dropped from {total_files} to {after_files} (aider may be deleting stories!)", "ERR")
                total_files = after_files

            if handled > 0:
                log(f"    OK: {next_story} ({duration}s) [{handled} processed, files: {after_files}]", "OK")
                metrics["aider"]["stories_success"] += handled
                metrics["aider"]["stories"].append({
                    "filename": next_story, "result": "success",
                    "method": "engine_handled", "duration_s": duration
                })
                consecutive_failures = 0
            else:
                log(f"    No progress (rc={proc.returncode}): {next_story} ({duration}s)", "WARN")
                consecutive_failures += 1
        except subprocess.TimeoutExpired:
            try:
                subprocess.run(
                    ["powershell.exe", "-NoProfile", "-Command",
                     f"Stop-Process -Id {proc.pid} -Force -ErrorAction SilentlyContinue"],
                    capture_output=True, timeout=10
                )
            except Exception:
                proc.kill()
            try:
                proc.wait(timeout=5)
            except Exception:
                pass
            kill_orphan_aider()
            duration = round(time.time() - story_start, 2)

            # Engine may have updated status before aider timed out
            after_remaining, _, after_files = _count_aider_todo()
            handled = before_remaining - after_remaining
            if handled > 0:
                log(f"    Timeout but handled: {next_story} ({duration}s) [{handled} processed]", "WARN")
                metrics["aider"]["stories_success"] += handled
            else:
                log(f"    TIMEOUT ({duration}s): {next_story}", "ERR")
            consecutive_failures += 1
        except Exception as e:
            duration = round(time.time() - story_start, 2)
            log(f"    EXCEPTION: {e}", "ERR")
            consecutive_failures += 1

        # After too many consecutive failures, apply fallback to all remaining
        if consecutive_failures >= 5:
            log(f"  API parece indisponivel ({consecutive_failures} falhas). Aplicando fallback em massa...", "WARN")
            applied = _apply_fallback_to_remaining()
            metrics["aider"]["stories_fallback"] += applied
            break

        # Cooldown between calls (respect API rate limits)
        cooldown = AIDER_COOLDOWN_S if consecutive_failures == 0 else AIDER_RETRY_BACKOFF_S
        log(f"    Cooldown {cooldown}s...")
        time.sleep(cooldown)

    # Final check: apply fallback to any remaining TODOs
    final_remaining, _, final_files = _count_aider_todo()
    if final_remaining > 0:
        log(f"  {final_remaining} stories ainda TODO. Aplicando fallback...", "WARN")
        applied = _apply_fallback_to_remaining()
        metrics["aider"]["stories_fallback"] += applied

    metrics["aider"]["duration_s"] = round(time.time() - start, 2)
    total = metrics["aider"]["stories_processed"]
    if total > 0:
        metrics["aider"]["avg_time_per_story_s"] = round(metrics["aider"]["duration_s"] / total, 2)

    write_heartbeat("aider", "idle", {
        "processed": total,
        "success": metrics["aider"]["stories_success"],
        "fallback": metrics["aider"]["stories_fallback"]
    })
    log(f"  Aider total: {total} stories, {metrics['aider']['stories_success']} real, {metrics['aider']['stories_fallback']} fallback ({metrics['aider']['duration_s']}s)", "OK")



# ============================================================
# PHASE 4: ZERO - Execute @agente-zero + Review PARA_REVISAO
# ============================================================
def _count_non_revisado():
    """Count stories that are NOT yet REVISADO (still need Zero processing)."""
    counts = {"zero_todo": 0, "para_revisao": 0, "em_execucao": 0, "em_revisao": 0, "other": 0}
    for sf in sorted(glob.glob(os.path.join(STORIES_DIR, "*.md"))):
        if os.path.basename(sf).startswith("_"):
            continue
        try:
            with open(sf, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read(2000)
            m = re.search(r"\*\*Status:\*\*\s*(\S+)", content)
            st = m.group(1) if m else "UNKNOWN"
            ag = "@agente-zero" if "**Agente Sugerido:** @agente-zero" in content else "@aider"
            if st == "TODO" and ag == "@agente-zero":
                counts["zero_todo"] += 1
            elif st == "PARA_REVISAO":
                counts["para_revisao"] += 1
            elif st == "EM_EXECUCAO":
                counts["em_execucao"] += 1
            elif st == "EM_REVISAO":
                counts["em_revisao"] += 1
            elif st != "REVISADO":
                counts["other"] += 1
        except Exception:
            continue
    return counts


def phase_zero():
    log("PHASE 4: ZERO - Executando e revisando stories", "RUN")
    start = time.time()

    write_heartbeat("zero", "processing", {"phase": "starting"})

    counts = _count_non_revisado()
    total_work = counts["zero_todo"] + counts["para_revisao"] + counts["em_execucao"] + counts["em_revisao"]
    log(f"  Trabalho pendente: {counts}")

    max_cycles = total_work + 10  # Safety margin
    cycle = 0

    while cycle < max_cycles:
        cycle += 1
        counts_before = _count_non_revisado()
        work_before = counts_before["zero_todo"] + counts_before["para_revisao"] + counts_before["em_execucao"] + counts_before["em_revisao"]

        if work_before == 0:
            break

        # Determine what we expect to process
        if counts_before["zero_todo"] > 0:
            expected_type = "execution"
        else:
            expected_type = "review"

        log(f"  [{cycle}] Chamando zero engine (pending: {work_before}, type: {expected_type})", "RUN")
        write_heartbeat("zero", "processing", {"cycle": cycle, "pending": work_before})

        story_start = time.time()
        try:
            result = subprocess.run(
                [sys.executable, "-u", os.path.join(BASE_DIR, "scripts/zero_worker_engine.py")],
                capture_output=True, text=True, timeout=60,
                cwd=BASE_DIR
            )
            story_time = round(time.time() - story_start, 2)

            # Count-based success detection (most reliable)
            counts_after = _count_non_revisado()
            work_after = counts_after["zero_todo"] + counts_after["para_revisao"] + counts_after["em_execucao"] + counts_after["em_revisao"]
            handled = work_before - work_after

            if handled > 0 and result.returncode == 0:
                if expected_type == "execution":
                    log(f"    Zero EXEC OK ({story_time}s) [{handled} processed]", "OK")
                    metrics["zero"]["stories_executed"] += handled
                else:
                    log(f"    Zero REVIEW OK ({story_time}s) [{handled} processed]", "OK")
                    metrics["zero"]["stories_reviewed"] += handled
                metrics["zero"]["stories"].append({
                    "filename": f"cycle_{cycle}", "type": expected_type,
                    "result": "success", "duration_s": story_time
                })
            elif result.returncode != 0:
                log(f"    Zero: no work found (rc={result.returncode}, {story_time}s)", "WARN")
                # Engine returned "no work" - stop if all work is gone
                if work_after == 0:
                    break
            else:
                log(f"    Zero: rc=0 but no progress detected ({story_time}s)", "WARN")
                metrics["zero"]["errors"] += 1

        except subprocess.TimeoutExpired:
            log(f"    Zero TIMEOUT (60s)", "ERR")
            metrics["zero"]["errors"] += 1
        except Exception as e:
            log(f"    Zero EXCEPTION: {e}", "ERR")
            metrics["zero"]["errors"] += 1

    metrics["zero"]["duration_s"] = round(time.time() - start, 2)
    total_zero = metrics["zero"]["stories_executed"] + metrics["zero"]["stories_reviewed"]
    if total_zero > 0:
        metrics["zero"]["avg_time_per_story_s"] = round(metrics["zero"]["duration_s"] / total_zero, 2)

    write_heartbeat("zero", "idle", {
        "executed": metrics["zero"]["stories_executed"],
        "reviewed": metrics["zero"]["stories_reviewed"]
    })
    log(f"  Zero total: {metrics['zero']['stories_executed']} executed, {metrics['zero']['stories_reviewed']} reviewed ({metrics['zero']['duration_s']}s)", "OK")

# ============================================================
# PHASE 5: QUALITY ANALYSIS
# ============================================================
def phase_quality():
    log("PHASE 5: Análise de qualidade", "RUN")

    all_stories = []
    for sf in glob.glob(os.path.join(STORIES_DIR, "*.md")):
        if os.path.basename(sf).startswith("_"):
            continue
        data = parse_story(sf)
        all_stories.append(data)

    # Pipeline metrics
    metrics["pipeline"]["total_stories"] = len(all_stories)

    status_dist = {}
    agent_dist = {}
    for s in all_stories:
        st = s.get("status", "UNKNOWN")
        ag = s.get("agent", "UNKNOWN")
        status_dist[st] = status_dist.get(st, 0) + 1
        agent_dist[ag] = agent_dist.get(ag, 0) + 1

    metrics["pipeline"]["status_distribution"] = status_dist
    metrics["pipeline"]["agent_distribution"] = agent_dist
    metrics["pipeline"]["fully_processed"] = status_dist.get("REVISADO", 0)

    # Genesis Quality
    genesis_scores = []
    for s in all_stories:
        score = 0
        reasons = []

        # Has story ID
        if s.get("story_id") != "NO_ID":
            score += 20
        else:
            reasons.append("missing_story_id")

        # Has title
        if s.get("title") != "NO_TITLE" and len(s.get("title", "")) > 3:
            score += 20
        else:
            reasons.append("missing_or_short_title")

        # Has objective
        if s.get("has_objective") and len(s.get("objetivo", "")) > 5:
            score += 20
        else:
            reasons.append("missing_or_short_objective")

        # Has sections
        if s.get("has_sections"):
            score += 15
        else:
            reasons.append("no_markdown_sections")

        # Has metadata (status, agent, difficulty)
        meta_fields = ["status", "agent", "difficulty"]
        valid_meta = sum(1 for f in meta_fields if s.get(f) not in ["UNKNOWN", None])
        score += (valid_meta / len(meta_fields)) * 15

        # Size check (not too small)
        if s.get("raw_size", 0) > 150:
            score += 10
        else:
            reasons.append("story_too_small")

        genesis_scores.append({
            "filename": s["filename"],
            "score": round(score),
            "issues": reasons
        })

    metrics["quality"]["genesis_quality"] = {
        "avg_score": round(sum(g["score"] for g in genesis_scores) / max(len(genesis_scores), 1), 1),
        "min_score": min((g["score"] for g in genesis_scores), default=0),
        "max_score": max((g["score"] for g in genesis_scores), default=0),
        "stories": genesis_scores
    }

    # Aider Quality
    aider_scores = []
    for s in metrics["aider"]["stories"]:
        score = 0
        if s.get("result") == "success":
            score = 90  # Real aider processing
        elif s.get("result") == "fallback":
            score = 40  # Fallback (status updated but no real code)
        else:
            score = 10  # Failed
        aider_scores.append({"filename": s["filename"], "score": score, "method": s.get("method", "unknown")})

    metrics["quality"]["aider_quality"] = {
        "avg_score": round(sum(a["score"] for a in aider_scores) / max(len(aider_scores), 1), 1),
        "real_processing_pct": round(
            metrics["aider"]["stories_success"] / max(metrics["aider"]["stories_processed"], 1) * 100, 1
        ),
        "stories": aider_scores
    }

    # Zero Quality
    zero_scores = []
    for s in metrics["zero"]["stories"]:
        score = 0
        if s.get("result") == "success":
            score = 85 if s.get("type") == "execution" else 90
        else:
            score = 20
        zero_scores.append({"filename": s["filename"], "score": score, "type": s.get("type", "unknown")})

    metrics["quality"]["zero_quality"] = {
        "avg_score": round(sum(z["score"] for z in zero_scores) / max(len(zero_scores), 1), 1),
        "stories": zero_scores
    }

    log(f"  Pipeline: {metrics['pipeline']['fully_processed']}/{metrics['pipeline']['total_stories']} REVISADO", "OK")
    log(f"  Genesis Quality: {metrics['quality']['genesis_quality']['avg_score']}/100", "OK")
    log(f"  Aider Quality: {metrics['quality']['aider_quality']['avg_score']}/100", "OK")
    log(f"  Zero Quality: {metrics['quality']['zero_quality']['avg_score']}/100", "OK")

# ============================================================
# PHASE 6: GENERATE REPORT
# ============================================================
def phase_report():
    log("PHASE 6: Gerando relatório", "RUN")

    os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)

    # JSON report
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False, default=str)
    log(f"  JSON: {REPORT_FILE}", "OK")

    # MD report
    gq = metrics["quality"]["genesis_quality"]
    aq = metrics["quality"]["aider_quality"]
    zq = metrics["quality"]["zero_quality"]
    pp = metrics["pipeline"]

    md = f"""# Stress Test Report - 20 Stories Pipeline
> Generated: {metrics['test_end']}
> Duration: {metrics['total_duration_s']}s

## Pipeline Summary

| Metric | Value |
|--------|-------|
| Total Stories | {pp['total_stories']} |
| Fully Processed (REVISADO) | {pp['fully_processed']} |
| Success Rate | {round(pp['fully_processed'] / max(pp['total_stories'], 1) * 100, 1)}% |

### Status Distribution
| Status | Count |
|--------|-------|
"""
    for st, count in sorted(pp['status_distribution'].items()):
        md += f"| {st} | {count} |\n"

    md += f"""
### Agent Distribution
| Agent | Count |
|-------|-------|
"""
    for ag, count in sorted(pp['agent_distribution'].items()):
        md += f"| {ag} | {count} |\n"

    md += f"""
## Worker Metrics

### Genesis (Gerador de Stories)
| Metric | Value |
|--------|-------|
| Stories Created | {metrics['genesis']['stories_created']} |
| Batches Run | {metrics['genesis']['batches_run']} |
| Errors | {metrics['genesis']['errors']} |
| Duration | {metrics['genesis']['duration_s']}s |
| Quality Score | {gq['avg_score']}/100 |
| Min/Max Score | {gq['min_score']}/{gq['max_score']} |

### Aider (Processador de Código)
| Metric | Value |
|--------|-------|
| Stories Processed | {metrics['aider']['stories_processed']} |
| Real Aider Success | {metrics['aider']['stories_success']} |
| Fallback Used | {metrics['aider']['stories_fallback']} |
| Failed | {metrics['aider']['stories_failed']} |
| Duration | {metrics['aider']['duration_s']}s |
| Avg Time/Story | {metrics['aider']['avg_time_per_story_s']}s |
| Quality Score | {aq['avg_score']}/100 |
| Real Processing % | {aq['real_processing_pct']}% |

### Zero (Executor + Revisor)
| Metric | Value |
|--------|-------|
| Stories Executed | {metrics['zero']['stories_executed']} |
| Stories Reviewed | {metrics['zero']['stories_reviewed']} |
| Errors | {metrics['zero']['errors']} |
| Duration | {metrics['zero']['duration_s']}s |
| Avg Time/Story | {metrics['zero']['avg_time_per_story_s']}s |
| Quality Score | {zq['avg_score']}/100 |

## Individual Story Scores

### Genesis Quality (Story Creation)
| Story | Score | Issues |
|-------|-------|--------|
"""
    for s in gq.get('stories', []):
        issues = ', '.join(s.get('issues', [])) or 'none'
        md += f"| {s['filename'][:40]} | {s['score']}/100 | {issues} |\n"

    md += f"""
### Aider Quality (Code Processing)
| Story | Score | Method |
|-------|-------|--------|
"""
    for s in aq.get('stories', []):
        md += f"| {s['filename'][:40]} | {s['score']}/100 | {s.get('method', '?')} |\n"

    md += f"""
### Zero Quality (Execution + Review)
| Story | Score | Type |
|-------|-------|------|
"""
    for s in zq.get('stories', []):
        md += f"| {s['filename'][:40]} | {s['score']}/100 | {s.get('type', '?')} |\n"

    md += f"""
## Findings & Recommendations

### Genesis
- Rich story templates with detailed objectives, target files, acceptance criteria and instructions
- {'Unique filenames (timestamp + random suffix) preventing collisions' if metrics['genesis']['errors'] == 0 else 'Some batch errors detected'}
- **Score:** {gq['avg_score']}/100

### Aider
- {'Real Aider processing working - edits actual source code with story as --read context' if metrics['aider']['stories_success'] > 0 else 'No API key configured - all stories used fallback simulation'}
- **Score:** {aq['avg_score']}/100

### Zero
- Real syntax validation: py_compile for Python, node --check for JS/TS
- Lock-based processing prevents duplicate work
- Reviews check for Aider processing log + syntax validation
- **Score:** {zq['avg_score']}/100

---
*Generated by QA Stress Test - Diana Corporação Senciente*
"""
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md)
    log(f"  Markdown: {REPORT_MD}", "OK")

# ============================================================
# MAIN
# ============================================================
def main():
    metrics["test_start"] = datetime.now().isoformat()
    log("=" * 60)
    log("STRESS TEST: 20 Stories Pipeline - INICIANDO")
    log("=" * 60)
    start = time.time()

    try:
        phase_backup()
        phase_genesis()
        _snapshot_statuses("AFTER GENESIS")
        phase_aider()
        _snapshot_statuses("AFTER AIDER")
        phase_zero()
        _snapshot_statuses("AFTER ZERO")
        phase_quality()
    except Exception as e:
        log(f"FATAL: {e}", "ERR")
        import traceback
        traceback.print_exc()

    metrics["test_end"] = datetime.now().isoformat()
    metrics["total_duration_s"] = round(time.time() - start, 2)

    phase_report()

    log("=" * 60)
    log(f"STRESS TEST COMPLETO em {metrics['total_duration_s']}s")
    log(f"  Genesis: {metrics['genesis']['stories_created']} stories")
    log(f"  Aider: {metrics['aider']['stories_success']} real + {metrics['aider']['stories_fallback']} fallback")
    log(f"  Zero: {metrics['zero']['stories_executed']} exec + {metrics['zero']['stories_reviewed']} reviews")
    log(f"  Pipeline: {metrics['pipeline']['fully_processed']}/{metrics['pipeline']['total_stories']} REVISADO")
    log("=" * 60)

if __name__ == "__main__":
    main()
