import os, time, glob, sys, re, json, subprocess
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
LOCK_FILE = os.path.join(BASE_DIR, ".worker_genesis.lock")
TRIGGER_FILE = os.path.join(BASE_DIR, ".trigger_worker")
STOP_FILE = os.path.join(BASE_DIR, ".stop_genesis")
HEARTBEAT_FILE = "C:/AIOS/workers/genesis.json"
SCAN_INTERVAL = 5

cycle_count = 0

def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())
    sys.stdout.flush()

def write_heartbeat(status, stats=None):
    try:
        os.makedirs(os.path.dirname(HEARTBEAT_FILE), exist_ok=True)
        data = {
            "worker": "genesis",
            "pid": os.getpid(),
            "status": status,
            "last_heartbeat": datetime.now().isoformat(),
            "cycle_count": cycle_count,
            "stats": stats or {}
        }
        with open(HEARTBEAT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

def get_stats():
    stories = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
               if not os.path.basename(f).startswith("_")]
    counts = {"todo": 0, "todo_aider": 0, "todo_zero": 0, "em_execucao": 0, "para_revisao": 0, "revisado": 0, "aider": 0, "zero": 0}
    for t in stories:
        try:
            with open(t, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read(2000)  # Read only first 2KB for speed
            is_aider = "**Agente Sugerido:** @aider" in c
            is_zero = "**Agente Sugerido:** @agente-zero" in c
            if re.search(r"\*\*Status:\*\*\s*TODO", c):
                counts["todo"] += 1
                if is_aider: counts["todo_aider"] += 1
                elif is_zero: counts["todo_zero"] += 1
            elif re.search(r"\*\*Status:\*\*\s*EM_EXECUCAO", c): counts["em_execucao"] += 1
            elif re.search(r"\*\*Status:\*\*\s*PARA_REVISAO", c): counts["para_revisao"] += 1
            elif re.search(r"\*\*Status:\*\*\s*REVISADO", c): counts["revisado"] += 1
            if is_aider: counts["aider"] += 1
            elif is_zero: counts["zero"] += 1
        except Exception:
            continue
    return len(stories), counts

def is_lock_stale():
    """Check if lock file's process is still alive"""
    if not os.path.exists(LOCK_FILE):
        return False
    try:
        mtime = os.path.getmtime(LOCK_FILE)
        age = time.time() - mtime
        if age > 300:  # Lock older than 5 minutes = stale
            return True
    except Exception:
        pass
    return False

def countdown(seconds, total, counts):
    for i in range(seconds, 0, -1):
        try:
            sys.stdout.write(
                f"\r[*] Stories: {total} | TODO: {counts['todo']} (@aider:{counts['todo_aider']} @zero:{counts['todo_zero']}) | "
                f"Exec: {counts['em_execucao']} | Review: {counts['para_revisao']} | "
                f"Done: {counts['revisado']} | Scan: {i}s   "
            )
            sys.stdout.flush()
        except UnicodeEncodeError:
            pass
        time.sleep(1)

def main():
    global cycle_count
    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] GENESIS SENTINEL ACTIVE")
    safe_print(f"  Scan interval: {SCAN_INTERVAL}s | PID: {os.getpid()}")
    safe_print("====================================================")
    write_heartbeat("starting")

    while True:
        try:
            if os.path.exists(STOP_FILE):
                os.remove(STOP_FILE)
                write_heartbeat("stopped")
                safe_print("\n[STOP] Stop signal received. Shutting down...")
                sys.exit(0)

            cycle_count += 1
            total, counts = get_stats()
            stats = {"total_stories": total, **counts}

            # Clean stale lock
            if is_lock_stale():
                safe_print(f"\n[CLEAN] Stale lock detected (>5min). Removing...")
                try:
                    os.remove(LOCK_FILE)
                except Exception:
                    pass

            if counts["todo"] == 0:
                # No TODO stories - run genesis directly (only if no lock active)
                if not os.path.exists(LOCK_FILE):
                    now = datetime.now().strftime("%H:%M:%S")
                    safe_print(f"\n[{now}] GENESIS TRIGGERED: 0 TODO stories. Generating backlog...")
                    with open(LOCK_FILE, "w") as f:
                        f.write(str(os.getpid()))
                    write_heartbeat("generating", stats)
                    try:
                        genesis_script = os.path.join(BASE_DIR, "scripts", "worker_genesis_agent.py")
                        result = subprocess.run(
                            [sys.executable, "-u", genesis_script],
                            capture_output=False,
                            timeout=120,
                            cwd=BASE_DIR
                        )
                        if result.returncode == 0:
                            safe_print(f"\n[OK] Genesis completed successfully")
                        else:
                            safe_print(f"\n[ERR] Genesis exited with code {result.returncode}")
                    except subprocess.TimeoutExpired:
                        safe_print(f"\n[WARN] Genesis timed out after 120s")
                    except Exception as e:
                        safe_print(f"\n[ERR] Genesis failed: {e}")
                    finally:
                        # Clean up lock and trigger
                        for f in [LOCK_FILE, TRIGGER_FILE]:
                            try:
                                if os.path.exists(f):
                                    os.remove(f)
                            except Exception:
                                pass
            else:
                # Has TODO stories - clean lock if exists
                for f in [LOCK_FILE, TRIGGER_FILE]:
                    try:
                        if os.path.exists(f):
                            os.remove(f)
                    except Exception:
                        pass

            write_heartbeat("scanning", stats)
            countdown(SCAN_INTERVAL, total, counts)
        except Exception as e:
            write_heartbeat("error", {"error": str(e)})
            safe_print(f"\n[ERR] Genesis sentinel error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    os.makedirs(STORIES_DIR, exist_ok=True)
    main()
