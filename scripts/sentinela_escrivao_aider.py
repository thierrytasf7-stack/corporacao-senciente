import os, time, glob, sys, re, json
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
TRIGGER_FILE = os.path.join(BASE_DIR, ".trigger_aider")
LOCK_FILE = os.path.join(BASE_DIR, ".worker_aider.lock")
STOP_FILE = os.path.join(BASE_DIR, ".stop_aider")
HEARTBEAT_FILE = "C:/AIOS/workers/aider.json"
SCAN_INTERVAL = 5

cycle_count = 0
last_trigger_story = None

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
            "worker": "aider",
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

def is_lock_stale():
    if not os.path.exists(LOCK_FILE):
        return False
    try:
        age = time.time() - os.path.getmtime(LOCK_FILE)
        return age > 900  # 15 min stale (aider can take long)
    except Exception:
        return False

def get_stats():
    stories = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
               if not os.path.basename(f).startswith("_")]
    counts = {"todo": 0, "em_execucao": 0, "para_revisao": 0, "revisado": 0}
    first_todo = None
    for t in sorted(stories):
        try:
            with open(t, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read(2000)
            if "**Agente Sugerido:** @aider" not in c:
                continue
            if re.search(r"\*\*Status:\*\*\s*TODO", c):
                counts["todo"] += 1
                if first_todo is None:
                    first_todo = os.path.basename(t)
            elif re.search(r"\*\*Status:\*\*\s*EM_EXECUCAO", c):
                counts["em_execucao"] += 1
            elif re.search(r"\*\*Status:\*\*\s*PARA_REVISAO", c):
                counts["para_revisao"] += 1
            elif re.search(r"\*\*Status:\*\*\s*REVISADO", c):
                counts["revisado"] += 1
        except Exception:
            continue
    return len(stories), counts, first_todo

def countdown(seconds, total, counts):
    for i in range(seconds, 0, -1):
        try:
            sys.stdout.write(
                f"\r[*] Total: {total} | @aider TODO: {counts['todo']} | "
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
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] AIDER SENTINEL ACTIVE")
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

            # Clean stale lock
            if is_lock_stale():
                safe_print("\n[CLEAN] Stale aider lock (>15min). Removing...")
                try:
                    os.remove(LOCK_FILE)
                except Exception:
                    pass

            total, counts, first_todo = get_stats()
            stats = {"total_stories": total, **counts}
            if first_todo:
                stats["next_story"] = first_todo

            if counts["todo"] > 0:
                # Only trigger if no lock and no pending trigger
                if not os.path.exists(LOCK_FILE) and not os.path.exists(TRIGGER_FILE):
                    safe_print(f"\n[{datetime.now().strftime('%H:%M:%S')}] AIDER TRIGGERED: {counts['todo']} TODO | Next: {first_todo}")
                    with open(TRIGGER_FILE, "w") as f:
                        f.write("trigger")

            write_heartbeat("scanning", stats)
            countdown(SCAN_INTERVAL, total, counts)
        except Exception as e:
            write_heartbeat("error", {"error": str(e)})
            safe_print(f"\n[ERR] Aider sentinel error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
