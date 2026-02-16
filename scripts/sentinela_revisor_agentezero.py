import os, time, glob, sys, re, json
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")
LOCK_FILE = os.path.join(BASE_DIR, ".worker_revisor.lock")
TRIGGER_FILE = os.path.join(BASE_DIR, ".trigger_revisor")
STOP_FILE = os.path.join(BASE_DIR, ".stop_zero")
HEARTBEAT_FILE = "C:/AIOS/workers/zero.json"
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
            "worker": "zero",
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
        return age > 300  # 5 min stale
    except Exception:
        return False

def get_stats():
    stories = [f for f in glob.glob(os.path.join(STORIES_DIR, "*.md"))
               if not os.path.basename(f).startswith("_")]
    counts = {"zero_todo": 0, "para_revisao": 0, "em_revisao": 0, "revisado": 0}
    first_task = None
    for t in sorted(stories):
        try:
            with open(t, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read(2000)
            is_zero = "**Agente Sugerido:** @agente-zero" in c
            if is_zero and re.search(r"\*\*Status:\*\*\s*TODO", c):
                counts["zero_todo"] += 1
                if first_task is None:
                    first_task = os.path.basename(t)
            elif re.search(r"\*\*Status:\*\*\s*PARA_REVISAO", c):
                counts["para_revisao"] += 1
                if first_task is None:
                    first_task = os.path.basename(t)
            elif re.search(r"\*\*Status:\*\*\s*EM_REVISAO", c):
                counts["em_revisao"] += 1
            elif re.search(r"\*\*Status:\*\*\s*REVISADO", c):
                counts["revisado"] += 1
        except Exception:
            continue
    return len(stories), counts, first_task

def countdown(seconds, total, counts):
    for i in range(seconds, 0, -1):
        try:
            sys.stdout.write(
                f"\r[*] Stories: {total} | @Zero TODO: {counts['zero_todo']} | "
                f"Review: {counts['para_revisao']} | Reviewing: {counts['em_revisao']} | "
                f"Done: {counts['revisado']} | Scan: {i}s   "
            )
            sys.stdout.flush()
        except UnicodeEncodeError:
            pass
        time.sleep(1)

def main():
    global cycle_count
    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ZERO SENTINEL ACTIVE")
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
                safe_print("\n[CLEAN] Stale revisor lock (>5min). Removing...")
                try:
                    os.remove(LOCK_FILE)
                except Exception:
                    pass

            total, counts, first_task = get_stats()
            stats = {"total_stories": total, **counts}
            if first_task:
                stats["next_task"] = first_task

            work_needed = counts["zero_todo"] + counts["para_revisao"]
            if work_needed > 0:
                if not os.path.exists(LOCK_FILE) and not os.path.exists(TRIGGER_FILE):
                    now = datetime.now().strftime("%H:%M:%S")
                    safe_print(f"\n[{now}] ZERO TRIGGERED: {counts['zero_todo']} tasks + {counts['para_revisao']} reviews | Next: {first_task}")
                    with open(TRIGGER_FILE, "w") as f:
                        f.write("trigger")

            write_heartbeat("scanning", stats)
            countdown(SCAN_INTERVAL, total, counts)
        except Exception as e:
            write_heartbeat("error", {"error": str(e)})
            safe_print(f"\n[ERR] Zero sentinel error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    os.makedirs(STORIES_DIR, exist_ok=True)
    main()
