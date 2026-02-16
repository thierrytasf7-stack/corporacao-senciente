"""
Worker Corporacao Senciente - Claude Sonnet 4.5 para queries complexas
Recebe prompts da sentinela, consulta Claude, responde via WhatsApp
"""
import os, sys, json, subprocess, time
from datetime import datetime
try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
PROMPT_FILE = os.path.join(BASE_DIR, ".corp_prompt.json")
WHATSAPP_API = "http://localhost:21350/api/send"
ECOSYSTEM_API = "http://localhost:21341/api/v3/ecosystem"
MAX_RESPONSE_LEN = 4000
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"
CLAUDE_TIMEOUT = 120


def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())
    sys.stdout.flush()


def send_whatsapp(chat_id, message):
    try:
        jid = f"{chat_id}@g.us"
        # Split long messages
        chunks = [message[i:i+MAX_RESPONSE_LEN] for i in range(0, len(message), MAX_RESPONSE_LEN)]
        for chunk in chunks:
            res = requests.post(WHATSAPP_API, json={"chat": jid, "message": chunk}, timeout=10)
            if res.ok:
                safe_print(f"[WA] Enviado ({len(chunk)} chars)")
            else:
                safe_print(f"[WA-ERR] {res.status_code}")
            if len(chunks) > 1:
                time.sleep(1)
        return True
    except Exception as e:
        safe_print(f"[WA-ERR] {e}")
        return False


def get_ecosystem_data():
    """Fetch all ecosystem data for Claude context"""
    data = {}
    try:
        res = requests.get(f"{ECOSYSTEM_API}/status", timeout=5)
        if res.ok:
            data["status"] = res.json().get("data", {})
    except Exception:
        pass
    try:
        res = requests.get(f"{ECOSYSTEM_API}/milestones", timeout=5)
        if res.ok:
            data["milestones"] = res.json().get("data", {})
    except Exception:
        pass
    try:
        res = requests.get(f"{ECOSYSTEM_API}/leaderboard", timeout=5)
        if res.ok:
            data["leaderboard"] = res.json().get("data", {})
    except Exception:
        pass
    try:
        res = requests.get(f"{ECOSYSTEM_API}/dna-memory", timeout=5)
        if res.ok:
            data["dna_memory"] = res.json().get("data", {})
    except Exception:
        pass
    return data


def call_claude(prompt):
    """Call Claude CLI with prompt"""
    safe_print(f"[CLAUDE] Calling {CLAUDE_MODEL}...")
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", CLAUDE_MODEL, "--output-format", "text"],
            capture_output=True, text=True, timeout=CLAUDE_TIMEOUT,
            cwd=BASE_DIR
        )
        if result.returncode == 0 and result.stdout.strip():
            response = result.stdout.strip()
            safe_print(f"[CLAUDE] Response: {len(response)} chars")
            return response
        safe_print(f"[CLAUDE-ERR] RC={result.returncode} stderr={result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        safe_print("[CLAUDE-ERR] Timeout")
    except Exception as e:
        safe_print(f"[CLAUDE-ERR] {e}")
    return None


def handle_command(prompt_data):
    """Handle corp command"""
    cmd = prompt_data.get("command", "")
    chat = prompt_data.get("chat", "")
    eco_data = get_ecosystem_data()

    if cmd == "milestones":
        milestones = eco_data.get("milestones", {})
        events = milestones.get("events", [])
        if not events:
            send_whatsapp(chat, "Nenhum milestone atingido ainda.")
            return
        lines = ["MILESTONES DIANA:"]
        for evt in events[-10:]:
            lines.append(
                f"  {evt.get('level','?').upper()} {evt.get('entityId','?')}: "
                f"{evt.get('milestone','?')}x @ ${evt.get('bankroll',0):.2f}"
            )
        send_whatsapp(chat, "\n".join(lines))

    elif cmd == "leaderboard":
        status = eco_data.get("status", {})
        all_bots = []
        for g in status.get("groups", []):
            for b in g.get("bots", []):
                all_bots.append({**b, "group": g["groupId"]})
        all_bots.sort(key=lambda b: b.get("fitness", 0), reverse=True)
        lines = ["LEADERBOARD TOP 10:"]
        for i, b in enumerate(all_bots[:10]):
            lines.append(
                f"  {i+1}. {b.get('name','?')} ({b['group']}) | "
                f"${b.get('bankroll',0):.2f} | Fit: {b.get('fitness',0):.1f} | "
                f"WR: {b.get('winRate',0):.0f}%"
            )
        send_whatsapp(chat, "\n".join(lines))

    elif cmd == "bots":
        status = eco_data.get("status", {})
        lines = ["TODOS OS BOTS:"]
        for g in status.get("groups", []):
            lines.append(f"\n{g['groupId']} (${g['bankroll']:.2f}):")
            for b in g.get("bots", []):
                alive = "VIVO" if b.get("bankroll", 0) > 0 else "MORTO"
                lines.append(
                    f"  {b.get('name','?')}: ${b.get('bankroll',0):.2f} | "
                    f"Fit:{b.get('fitness',0):.1f} | {alive}"
                )
        send_whatsapp(chat, "\n".join(lines))

    elif cmd == "dna":
        memory = eco_data.get("dna_memory", {})
        prompt = (
            f"Analise este DNA Memory do ecosystem de trading e faca um resumo conciso "
            f"para WhatsApp (max 2000 chars). Destaque padroes vencedores e tendencias:\n"
            f"{json.dumps(memory, indent=2)[:3000]}"
        )
        response = call_claude(prompt)
        if response:
            send_whatsapp(chat, response[:MAX_RESPONSE_LEN])
        else:
            send_whatsapp(chat, "Erro ao consultar Claude sobre DNA Memory.")


def handle_query(prompt_data):
    """Handle general query via Claude"""
    text = prompt_data.get("text", "")
    chat = prompt_data.get("chat", "")

    eco_data = get_ecosystem_data()
    status_summary = json.dumps(eco_data.get("status", {}), indent=2)[:2000]

    prompt = (
        f"Voce e o assistente da Diana Corporacao Senciente, um ecosystem de 25 bots de trading "
        f"com DNA evolutivo (9 seeds: Strategy, MarketRegime, Temporal, Correlation, Sentiment, "
        f"RiskAdapt, MetaEvolution, Pattern, SymbolSelection).\n\n"
        f"Estado atual do ecosystem:\n{status_summary}\n\n"
        f"O usuario perguntou via WhatsApp: {text}\n\n"
        f"Responda de forma concisa e util (max 2000 chars). Use formatacao simples para WhatsApp."
    )

    response = call_claude(prompt)
    if response:
        send_whatsapp(chat, response[:MAX_RESPONSE_LEN])
    else:
        send_whatsapp(chat, "Erro ao processar sua pergunta. Tente /status para info rapida.")


def main():
    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] CORP CLAUDE WORKER")
    safe_print(f"  Model: {CLAUDE_MODEL}")
    safe_print(f"  Prompt file: {PROMPT_FILE}")
    safe_print("====================================================")

    if not os.path.exists(PROMPT_FILE):
        safe_print("[ERR] No prompt file found.")
        return

    try:
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            prompt_data = json.load(f)
    except Exception as e:
        safe_print(f"[ERR] Failed to read prompt: {e}")
        return

    msg_type = prompt_data.get("type", "")
    safe_print(f"[*] Type: {msg_type}")

    if msg_type == "corp_command":
        handle_command(prompt_data)
    elif msg_type == "corp_query":
        handle_query(prompt_data)
    else:
        safe_print(f"[?] Unknown type: {msg_type}")

    safe_print("[OK] Done.")


if __name__ == "__main__":
    main()
