"""
Sentinela WhatsApp Alex - Monitora grupo e despacha para Claude worker
Padrão: mesmo formato dos sentinelas Genesis/Aider/Zero
Modo: PUV Score exclusivo (2 passos: URL → Menu → Selecao → Execucao)
"""
import os, sys, json, time, re
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
LOG_FILE = os.path.join(BASE_DIR, "apps/backend/integrations/whatsapp/logs/messages.jsonl")
TRIGGER_FILE = os.path.join(BASE_DIR, ".trigger_whatsapp")
LOCK_FILE = os.path.join(BASE_DIR, ".worker_whatsapp.lock")
STOP_FILE = os.path.join(BASE_DIR, ".stop_whatsapp")
HEARTBEAT_FILE = "C:/AIOS/workers/whatsapp-alex.json"
PROMPT_FILE = os.path.join(BASE_DIR, ".whatsapp_prompt.json")
PENDING_FILE = os.path.join(BASE_DIR, ".whatsapp_puv_pending.json")

TARGET_GROUP = os.environ.get("DIANA_WHATSAPP_GROUP", "120363408111554407")
SCAN_INTERVAL = 2

# PUV Detection
URL_REGEX = re.compile(r'https?://[^\s]+')
PUV_KEYWORDS = ['analisa', 'puv', 'score', 'diagnostico', 'analise', 'avalia', 'avalie']
# Regex para detectar selecao numerica: "1", "1,3", "1, 2, 3", "5", etc
# Exige digitos 1-5 separados por virgula/espaco (nao aceita "12" como "1,2")
SELECTION_REGEX = re.compile(r'^\s*[1-5](\s*[,\s]\s*[1-5])*\s*$')

BOT_PREFIXES = ["*PUV Score Bot"]

cycle_count = 0
last_line_count = 0


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
            "worker": "whatsapp-alex",
            "pid": os.getpid(),
            "status": status,
            "last_heartbeat": datetime.now().isoformat(),
            "cycle_count": cycle_count,
            "target_group": TARGET_GROUP,
            **(extra or {})
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
        return age > 600  # 10 min stale (alinhado com PUV_TIMEOUT)
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


def detect_puv_request(text):
    """Detecta se a mensagem eh um pedido de analise PUV. Retorna dict ou None."""
    urls = URL_REGEX.findall(text)
    if not urls:
        return None
    text_lower = text.lower()
    is_puv = any(kw in text_lower for kw in PUV_KEYWORDS) or text.strip().startswith('http')
    if not is_puv:
        return None
    url = urls[0].rstrip('.,;:!?)')
    canal = "website"
    if "instagram.com" in url:
        canal = "instagram"
    elif "google.com/maps" in url or "goo.gl/maps" in url:
        canal = "google"
    elif "mercadolivre" in url or "mercadolibre" in url:
        canal = "mercadolivre"
    elif "ifood" in url:
        canal = "ifood"
    return {"url": url, "canal": canal}


def detect_selection(text):
    """Detecta se a mensagem eh uma selecao numerica (1-5). Retorna lista de ints ou None."""
    text = text.strip()
    if not SELECTION_REGEX.match(text):
        return None
    nums = [int(n) for n in re.findall(r'[1-5]', text)]
    return list(set(nums)) if nums else None


def has_pending():
    """Checa se tem URL pendente aguardando selecao."""
    if not os.path.exists(PENDING_FILE):
        return False
    try:
        age = time.time() - os.path.getmtime(PENDING_FILE)
        if age > 300:  # 5 min expira
            os.remove(PENDING_FILE)
            safe_print("  [PENDING] Expirado (>5min). Removido.")
            return False
        return True
    except Exception:
        return False


def load_pending():
    try:
        with open(PENDING_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def save_pending(data):
    with open(PENDING_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


def clear_pending():
    try:
        os.remove(PENDING_FILE)
    except Exception:
        pass


def should_process(entry):
    """Filtra: so mensagens do grupo alvo, com texto real, nao do bot"""
    if not TARGET_GROUP:
        return False
    if entry.get("chat") != TARGET_GROUP:
        return False
    text = entry.get("text", "")
    if not text or text == "[media/other]":
        return False
    for prefix in BOT_PREFIXES:
        if text.startswith(prefix):
            return False
    return True


def dispatch(prompt_data):
    """Salva prompt e cria trigger para o worker."""
    with open(PROMPT_FILE, "w", encoding="utf-8") as f:
        json.dump(prompt_data, f, ensure_ascii=False)
    with open(TRIGGER_FILE, "w") as f:
        f.write("trigger")


def main():
    global cycle_count, last_line_count, TARGET_GROUP

    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] WHATSAPP PUV SENTINEL ACTIVE")
    safe_print(f"  Log: {LOG_FILE}")
    safe_print(f"  Grupo alvo: {TARGET_GROUP or 'AGUARDANDO CONFIG'}")
    safe_print(f"  Modo: PUV Score (2 passos: URL → Menu → Selecao)")
    safe_print(f"  Scan interval: {SCAN_INTERVAL}s | PID: {os.getpid()}")
    safe_print("====================================================")

    last_line_count = count_lines()
    safe_print(f"[*] Log tem {last_line_count} msgs. Escutando novas...")

    write_heartbeat("starting")

    while True:
        try:
            if os.path.exists(STOP_FILE):
                os.remove(STOP_FILE)
                write_heartbeat("stopped")
                safe_print("\n[STOP] Stop signal received. Shutting down...")
                sys.exit(0)

            cycle_count += 1

            if is_lock_stale():
                safe_print("\n[CLEAN] Stale lock. Removing...")
                try:
                    os.remove(LOCK_FILE)
                except Exception:
                    pass

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
                    sender = entry.get("from", "unknown")
                    now = datetime.now().strftime("%H:%M:%S")

                    safe_print(f"\n[{now}] MSG de {sender}: {text[:80]}")

                    if os.path.exists(LOCK_FILE):
                        safe_print(f"  [SKIP] Worker ocupado.")
                        continue
                    if os.path.exists(TRIGGER_FILE):
                        safe_print(f"  [SKIP] Trigger pendente.")
                        continue

                    # === PASSO 2: Selecao numerica + pending ===
                    selection = detect_selection(text)
                    if selection and has_pending():
                        pending = load_pending()
                        if pending:
                            safe_print(f"  [SELECT] Opcoes: {selection}")
                            prompt_data = {
                                "type": "puv_execute",
                                "selection": selection,
                                "url": pending["url"],
                                "canal": pending.get("canal", "website"),
                                "sender": sender,
                                "chat": entry.get("chat", ""),
                                "timestamp": entry.get("timestamp", "")
                            }
                            clear_pending()
                            dispatch(prompt_data)
                            safe_print(f"  [TRIGGER] PUV execute: {selection}")
                            continue

                    # === PASSO 1: URL detectada → Menu ===
                    puv = detect_puv_request(text)
                    if puv:
                        safe_print(f"  [PUV] URL: {puv['url']} ({puv['canal']})")
                        # Salvar como pending
                        save_pending({
                            "url": puv["url"],
                            "canal": puv["canal"],
                            "sender": sender,
                            "chat": entry.get("chat", ""),
                            "timestamp": entry.get("timestamp", "")
                        })
                        # Dispatch menu
                        prompt_data = {
                            "type": "puv_menu",
                            "url": puv["url"],
                            "canal": puv["canal"],
                            "sender": sender,
                            "chat": entry.get("chat", ""),
                            "timestamp": entry.get("timestamp", "")
                        }
                        dispatch(prompt_data)
                        safe_print(f"  [TRIGGER] Menu PUV enviado!")
                        continue

                    # === Sem URL e sem selecao = orientacao ===
                    prompt_data = {
                        "type": "puv_help",
                        "text": text,
                        "sender": sender,
                        "chat": entry.get("chat", ""),
                        "timestamp": entry.get("timestamp", "")
                    }
                    dispatch(prompt_data)
                    safe_print(f"  [TRIGGER] Help/orientacao")

            # Status line
            pending_flag = " [PENDING]" if has_pending() else ""
            lock = " [BUSY]" if os.path.exists(LOCK_FILE) else ""
            try:
                sys.stdout.write(
                    f"\r[*] LISTENING{lock}{pending_flag} | Cycle: {cycle_count} | Msgs: {current_count} | {SCAN_INTERVAL}s   "
                )
                sys.stdout.flush()
            except UnicodeEncodeError:
                pass

            write_heartbeat("scanning", {"log_lines": current_count, "has_pending": has_pending()})
            time.sleep(SCAN_INTERVAL)

        except Exception as e:
            write_heartbeat("error", {"error": str(e)})
            safe_print(f"\n[ERR] Sentinel error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()
