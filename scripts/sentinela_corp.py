"""
Sentinela Corporacao Senciente - Monitora ecosistema e despacha notificacoes
Modo: Notificacoes automaticas + Operacao remota via WhatsApp
"""
import os, sys, json, time, re
from datetime import datetime
try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
LOG_FILE = os.path.join(BASE_DIR, "apps/backend/integrations/whatsapp/logs/messages.jsonl")
TRIGGER_FILE = os.path.join(BASE_DIR, ".trigger_corp")
LOCK_FILE = os.path.join(BASE_DIR, ".worker_corp.lock")
STOP_FILE = os.path.join(BASE_DIR, ".stop_corp")
HEARTBEAT_FILE = "C:/AIOS/workers/corp-sentinel.json"
PROMPT_FILE = os.path.join(BASE_DIR, ".corp_prompt.json")

# WhatsApp config
WHATSAPP_API = "http://localhost:21350/api/send"
TARGET_GROUP = os.environ.get("DIANA_CORP_GROUP", "120363405403485324")
MY_NUMBER = os.environ.get("DIANA_MY_NUMBER", "554598211665")

# Ecosystem API
ECOSYSTEM_API = "http://localhost:21341/api/v3/ecosystem"

# Intervals
SCAN_INTERVAL = 3       # Check WhatsApp messages
REPORT_INTERVAL = 1800  # 30min periodic report
CRITICAL_CHECK = 30     # Check critical events every 30s

# Command detection
CORP_COMMANDS = {
    "status": "Retorna status completo do ecossistema",
    "bots": "Lista todos os bots e fitness",
    "groups": "Status dos 5 grupos",
    "milestones": "Milestones atingidos",
    "leaderboard": "Ranking dos melhores bots",
    "dna": "Estado do DNA memory",
    "stop": "Para o ecossistema",
    "start": "Inicia o ecossistema",
    "help": "Lista comandos disponiveis",
}

cycle_count = 0
last_line_count = 0
last_report_time = 0
last_bankroll = 0
peak_bankroll = 0
last_milestone_count = 0


def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())
    sys.stdout.flush()


def write_heartbeat(status, extra=None):
    try:
        os.makedirs(os.path.dirname(HEARTBEAT_FILE), exist_ok=True)
        data = {
            "worker": "corp-sentinel",
            "pid": os.getpid(),
            "status": status,
            "last_heartbeat": datetime.now().isoformat(),
            "cycle_count": cycle_count,
            **(extra or {})
        }
        with open(HEARTBEAT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


def send_whatsapp(message):
    """Send message to corp WhatsApp group"""
    try:
        jid = f"{TARGET_GROUP}@g.us"
        res = requests.post(WHATSAPP_API, json={"chat": jid, "message": message}, timeout=10)
        if res.ok:
            safe_print(f"[WA] Enviado ({len(message)} chars)")
            return True
        safe_print(f"[WA-ERR] {res.status_code}")
    except Exception as e:
        safe_print(f"[WA-ERR] {e}")
    return False


def get_ecosystem_status():
    """Fetch ecosystem status from API"""
    try:
        res = requests.get(f"{ECOSYSTEM_API}/status", timeout=5)
        if res.ok:
            return res.json().get("data", {})
    except Exception:
        pass
    return None


def get_milestones():
    """Fetch milestones from API"""
    try:
        res = requests.get(f"{ECOSYSTEM_API}/milestones", timeout=5)
        if res.ok:
            return res.json().get("data", {})
    except Exception:
        pass
    return None


def format_status_report(data, compact=False):
    """Format ecosystem status as WhatsApp message"""
    if not data:
        return "Ecosystem offline ou sem dados."

    bankroll = data.get("communityBankroll", 0)
    initial = data.get("communityInitial", 2500)
    mult = (bankroll / initial) if initial > 0 else 0
    peak = data.get("peakBankroll", 0)
    dd = data.get("drawdownPercent", 0)
    cycle = data.get("cycle", 0)
    alive = data.get("aliveBots", 0)
    total = data.get("totalBots", 25)

    if compact:
        groups_str = " | ".join([
            f"{g['groupId'][:1]}:${g['bankroll']:.0f}(f{g['groupFitness']:.0f})"
            for g in data.get("groups", [])
        ])
        return (
            f"DIANA ECOSYSTEM | Ciclo {cycle}\n"
            f"${bankroll:.2f} ({mult:.2%}) | Peak ${peak:.2f} | DD {dd:.1f}%\n"
            f"Bots: {alive}/{total} | {groups_str}"
        )

    lines = [
        f"DIANA CORPORACAO SENCIENTE",
        f"Ecosystem Report - {datetime.now().strftime('%d/%m %H:%M')}",
        f"{'='*35}",
        f"Ciclo: {cycle}",
        f"Bankroll: ${bankroll:.2f} / ${initial:.0f} ({mult:.2%})",
        f"Peak: ${peak:.2f} | Drawdown: {dd:.1f}%",
        f"Bots: {alive}/{total} vivos",
        f"",
        f"GRUPOS:",
    ]

    for g in data.get("groups", []):
        emoji = "+" if g["bankroll"] >= 500 else "-"
        lines.append(
            f"  {emoji} {g['groupId']}: ${g['bankroll']:.2f} | "
            f"Fit: {g['groupFitness']:.1f} | Gen: {g.get('generation', '?')} | "
            f"{g.get('currentRegime', '?')}"
        )

    return "\n".join(lines)


def detect_command(text):
    """Detect corp commands from WhatsApp message"""
    text = text.strip().lower()
    # Direct command: /status, /bots, etc
    if text.startswith("/"):
        cmd = text[1:].split()[0]
        if cmd in CORP_COMMANDS:
            return cmd
    # Natural language: "como estao os bots", "status diana", etc
    if any(w in text for w in ["status", "como esta", "como vai", "como estao"]):
        return "status"
    if "milestone" in text:
        return "milestones"
    if "leader" in text or "ranking" in text or "melhor" in text:
        return "leaderboard"
    if text in CORP_COMMANDS:
        return text
    return None


def is_from_me(entry):
    """Check if message is from my number"""
    sender = entry.get("from", "")
    return MY_NUMBER in sender


def should_process(entry):
    """Filter: messages from corp group, from me, with text"""
    if entry.get("chat") != TARGET_GROUP:
        return False
    text = entry.get("text", "")
    if not text or text == "[media/other]":
        return False
    if not is_from_me(entry):
        return False
    return True


def check_critical_events(data):
    """Check for events that need immediate notification"""
    global last_bankroll, peak_bankroll, last_milestone_count
    alerts = []

    if not data:
        return alerts

    bankroll = data.get("communityBankroll", 0)
    alive = data.get("aliveBots", 0)
    total = data.get("totalBots", 25)
    dd = data.get("drawdownPercent", 0)

    # Bot death
    if alive < total and alive < 25:
        alerts.append(f"BOT MORTO! {alive}/{total} vivos")

    # Drawdown > 10%
    if dd > 10:
        alerts.append(f"DRAWDOWN ALTO: {dd:.1f}%")

    # Bankroll change > 2% since last check
    if last_bankroll > 0:
        change = (bankroll - last_bankroll) / last_bankroll * 100
        if abs(change) > 2:
            direction = "SUBIU" if change > 0 else "CAIU"
            alerts.append(f"BANKROLL {direction} {abs(change):.1f}% (${bankroll:.2f})")

    # New peak
    if bankroll > peak_bankroll and peak_bankroll > 0:
        peak_bankroll = bankroll
        # Only alert on significant new peaks (>1% above initial)
        if bankroll > 2525:
            alerts.append(f"NOVO PEAK: ${bankroll:.2f}")

    if bankroll > 0:
        last_bankroll = bankroll
    if bankroll > peak_bankroll:
        peak_bankroll = bankroll

    # Check milestones
    milestones = get_milestones()
    if milestones:
        events = milestones.get("events", [])
        if len(events) > last_milestone_count:
            new_events = events[last_milestone_count:]
            for evt in new_events:
                alerts.append(
                    f"MILESTONE {evt.get('level','?').upper()}: "
                    f"{evt.get('entityId','?')} atingiu {evt.get('milestone','?')}x!"
                )
            last_milestone_count = len(events)

    return alerts


def dispatch_to_claude(prompt_data):
    """Save prompt and create trigger for Claude worker"""
    with open(PROMPT_FILE, "w", encoding="utf-8") as f:
        json.dump(prompt_data, f, ensure_ascii=False)
    with open(TRIGGER_FILE, "w") as f:
        f.write("trigger")


def is_lock_stale():
    if not os.path.exists(LOCK_FILE):
        return False
    try:
        age = time.time() - os.path.getmtime(LOCK_FILE)
        return age > 300  # 5 min stale
    except Exception:
        return False


def count_lines():
    try:
        with open(LOG_FILE, "rb") as f:
            return sum(1 for _ in f)
    except FileNotFoundError:
        return 0


def read_new_lines(from_line):
    lines = []
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            for i, line in enumerate(f):
                if i >= from_line:
                    lines.append(line.strip())
    except FileNotFoundError:
        pass
    return lines


def main():
    global cycle_count, last_line_count, last_report_time, last_bankroll, peak_bankroll

    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] CORP SENTINEL ACTIVE")
    safe_print(f"  Grupo: {TARGET_GROUP}")
    safe_print(f"  Meu numero: {MY_NUMBER}")
    safe_print(f"  Report interval: {REPORT_INTERVAL}s")
    safe_print(f"  Critical check: {CRITICAL_CHECK}s")
    safe_print("====================================================")

    last_line_count = count_lines()
    last_report_time = time.time()
    write_heartbeat("starting")

    # Initial status
    data = get_ecosystem_status()
    if data:
        last_bankroll = data.get("communityBankroll", 0)
        peak_bankroll = data.get("peakBankroll", 0)
        safe_print(f"[*] Ecosystem: Ciclo {data.get('cycle',0)} | ${last_bankroll:.2f}")

    # Send startup notification
    send_whatsapp(
        f"DIANA CORP SENTINEL ONLINE\n"
        f"{datetime.now().strftime('%d/%m/%Y %H:%M')}\n"
        f"Monitorando ecosystem + comandos remotos\n"
        f"Comandos: /status /groups /milestones /leaderboard /help"
    )

    critical_counter = 0

    while True:
        try:
            if os.path.exists(STOP_FILE):
                os.remove(STOP_FILE)
                write_heartbeat("stopped")
                send_whatsapp("DIANA CORP SENTINEL OFFLINE")
                safe_print("\n[STOP] Shutting down...")
                sys.exit(0)

            cycle_count += 1
            critical_counter += 1

            # Clean stale lock
            if is_lock_stale():
                safe_print("\n[CLEAN] Stale lock. Removing...")
                try:
                    os.remove(LOCK_FILE)
                except Exception:
                    pass

            # === CHECK WHATSAPP COMMANDS ===
            current_count = count_lines()
            if current_count > last_line_count:
                new_lines = read_new_lines(last_line_count)
                last_line_count = current_count

                for line in new_lines:
                    if not line:
                        continue
                    try:
                        entry = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    if not should_process(entry):
                        continue

                    text = entry["text"]
                    now = datetime.now().strftime("%H:%M:%S")
                    safe_print(f"\n[{now}] CMD: {text[:80]}")

                    cmd = detect_command(text)
                    if cmd:
                        if cmd == "help":
                            help_text = "DIANA CORP - Comandos:\n" + "\n".join(
                                [f"  /{k} - {v}" for k, v in CORP_COMMANDS.items()]
                            )
                            send_whatsapp(help_text)
                        elif cmd == "status":
                            data = get_ecosystem_status()
                            send_whatsapp(format_status_report(data))
                        elif cmd == "groups":
                            data = get_ecosystem_status()
                            if data:
                                send_whatsapp(format_status_report(data))
                        elif cmd in ("milestones", "leaderboard", "bots", "dna"):
                            # Delegate complex queries to Claude worker
                            if not os.path.exists(LOCK_FILE) and not os.path.exists(TRIGGER_FILE):
                                dispatch_to_claude({
                                    "type": "corp_command",
                                    "command": cmd,
                                    "text": text,
                                    "sender": entry.get("from", ""),
                                    "chat": entry.get("chat", ""),
                                })
                                safe_print(f"  [TRIGGER] Claude: /{cmd}")
                        elif cmd == "stop":
                            try:
                                requests.post(f"{ECOSYSTEM_API}/stop", timeout=5)
                                send_whatsapp("Ecosystem PARADO")
                            except Exception:
                                send_whatsapp("Erro ao parar ecosystem")
                        elif cmd == "start":
                            try:
                                requests.post(f"{ECOSYSTEM_API}/start", timeout=5)
                                send_whatsapp("Ecosystem INICIADO")
                            except Exception:
                                send_whatsapp("Erro ao iniciar ecosystem")
                    else:
                        # General query - dispatch to Claude
                        if not os.path.exists(LOCK_FILE) and not os.path.exists(TRIGGER_FILE):
                            dispatch_to_claude({
                                "type": "corp_query",
                                "text": text,
                                "sender": entry.get("from", ""),
                                "chat": entry.get("chat", ""),
                            })
                            safe_print(f"  [TRIGGER] Claude: query")

            # === CRITICAL EVENTS CHECK (every 30s) ===
            if critical_counter * SCAN_INTERVAL >= CRITICAL_CHECK:
                critical_counter = 0
                data = get_ecosystem_status()
                alerts = check_critical_events(data)
                for alert in alerts:
                    safe_print(f"\n[ALERT] {alert}")
                    send_whatsapp(f"ALERTA DIANA:\n{alert}")

            # === PERIODIC REPORT (every 30min) ===
            if time.time() - last_report_time >= REPORT_INTERVAL:
                last_report_time = time.time()
                data = get_ecosystem_status()
                if data:
                    report = format_status_report(data, compact=True)
                    send_whatsapp(report)
                    safe_print(f"\n[REPORT] Periodic report sent")

            # Status line
            lock = " [BUSY]" if os.path.exists(LOCK_FILE) else ""
            try:
                sys.stdout.write(
                    f"\r[*] MONITORING{lock} | Cycle: {cycle_count} | Bankroll: ${last_bankroll:.2f} | {SCAN_INTERVAL}s   "
                )
                sys.stdout.flush()
            except UnicodeEncodeError:
                pass

            write_heartbeat("monitoring", {"bankroll": last_bankroll, "peak": peak_bankroll})
            time.sleep(SCAN_INTERVAL)

        except Exception as e:
            write_heartbeat("error", {"error": str(e)})
            safe_print(f"\n[ERR] Sentinel error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()
