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
    """Format ecosystem status as WhatsApp message - 3 ÁREAS SEPARADAS"""
    if not data:
        return "Ecosystem offline ou sem dados."

    bankroll = data.get("communityBankroll", 0)
    initial = data.get("communityInitial", 2500)
    roi_pct = ((bankroll - initial) / initial * 100) if initial > 0 else 0
    pnl = bankroll - initial
    peak = data.get("peakBankroll", 0)
    dd = data.get("drawdownPercent", 0)
    cycle = data.get("cycle", 0)
    alive = data.get("aliveBots", 0)
    total = data.get("totalBots", 25)
    groups = data.get("groups", [])
    milestones = data.get("milestones", {})

    # Aggregate real trade stats
    all_bots = [b for g in groups for b in g.get('bots', [])]
    total_trades = sum(b.get('trades', 0) for b in all_bots)
    total_wins = sum(b.get('wins', 0) for b in all_bots)
    total_losses = sum(b.get('losses', 0) for b in all_bots)
    avg_wr = (total_wins / total_trades * 100) if total_trades > 0 else 0

    if compact:
        groups_str = " | ".join([
            f"{g['groupId'][:1]}:${g['bankroll']:.0f}(f{g['groupFitness']:.0f})"
            for g in groups
        ])
        return (
            f"DIANA ECOSYSTEM | Ciclo {cycle}\n"
            f"${bankroll:.2f} ({roi_pct:+.2f}%) | Peak ${peak:.2f} | DD {dd:.1f}%\n"
            f"Bots: {alive}/{total} | WR: {avg_wr:.1f}% | Trades: {total_trades} | {groups_str}"
        )

    # ====================================================================
    # ÁREA 1: DNA ARENA BOTS
    # ====================================================================
    lines = [
        "╔═══════════════════════════════════════════════════════════╗",
        "║  🧬 DNA ARENA - BOTS (SIMULAÇÃO)                         ║",
        "╚═══════════════════════════════════════════════════════════╝",
        "",
        f"🕐 *Data/Hora:* {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"🔖 *ID:* SENTINEL-{int(time.time())}",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "📊 *VISÃO GERAL*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"🤖 *Total Bots:* {alive}/{total} ({(alive/total*100):.0f}%)",
        f"🔄 *Ciclo Atual:* {cycle:,}",
        f"💰 *Capital:* ${bankroll:.2f} ({roi_pct:+.2f}%)" + (" ✅" if pnl >= 0 else " ⚠️"),
        f"💵 *PnL:* ${pnl:+.2f}",
        f"📉 *Drawdown:* {dd:.2f}% | Peak: ${peak:.2f}",
        f"📊 *Trades:* {total_trades:,} | WR: {avg_wr:.1f}% ({total_wins}W/{total_losses}L)",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🏆 *GRUPOS - PERFORMANCE*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ]

    # Sort groups by bankroll
    sorted_groups = sorted(groups, key=lambda g: g.get('bankroll', 0), reverse=True)

    for i, g in enumerate(sorted_groups):
        medal = ["🥇", "🥈", "🥉", "📍", "⚡"][i] if i < 5 else "•"
        gid = g.get('groupId', 'UNKNOWN')
        gbank = g.get('bankroll', 0)
        ginit = g.get('initialBankroll', 500)
        groi = ((gbank - ginit) / ginit * 100) if ginit > 0 else 0
        gpnl = gbank - ginit
        gfit = g.get('groupFitness', 0)
        galive = g.get('aliveBots', 0)
        gtotal = g.get('totalBots', 5)
        gstyle = g.get('style', 'Unknown')
        gev = g.get('expectedValue', 0)

        # Aggregate group trades
        gbots = g.get('bots', [])
        g_trades = sum(b.get('trades', 0) for b in gbots)
        g_wins = sum(b.get('wins', 0) for b in gbots)
        g_losses = sum(b.get('losses', 0) for b in gbots)
        g_wr = (g_wins / g_trades * 100) if g_trades > 0 else 0

        lines.extend([
            "",
            f"{medal} *{gid}* - {gstyle}",
            f"   💵 ${gbank:.2f} ({groi:+.2f}%) | PnL: ${gpnl:+.2f}",
            f"   📊 Trades: {g_trades} | WR: {g_wr:.1f}% ({g_wins}W/{g_losses}L)",
            f"   🧬 Gen: {g.get('generation',0)} | Fitness: {gfit:.1f} | EV: {gev:.3f}",
        ])

        # Top bot
        if gbots:
            top_bot = max(gbots, key=lambda b: b.get('fitness', 0))
            bname = top_bot.get('name', 'Unknown')
            bfit = top_bot.get('fitness', 0)
            bbank = top_bot.get('bankroll', 0)
            bwr = top_bot.get('winRate', 0)
            btrades = top_bot.get('trades', 0)
            blev = top_bot.get('leverage', 0)
            lines.append(f"   🏆 Top: {bname} (f:{bfit:.1f} ${bbank:.2f} WR:{bwr:.0f}% {btrades}t {blev}x)")

    # ====================================================================
    # ÁREA 2: TOP BOTS RANKING
    # ====================================================================
    # Sort all bots by fitness
    ranked_bots = sorted(all_bots, key=lambda b: b.get('fitness', 0), reverse=True)
    top10 = ranked_bots[:10]

    lines.extend([
        "",
        "",
        "╔═══════════════════════════════════════════════════════════╗",
        "║  🏆 TOP 10 BOTS - RANKING GLOBAL                        ║",
        "╚═══════════════════════════════════════════════════════════╝",
        "",
    ])

    for i, bot in enumerate(top10):
        medal = ["🥇", "🥈", "🥉"][i] if i < 3 else f"#{i+1}"
        bname = bot.get('name', '?')
        bfit = bot.get('fitness', 0)
        bbank = bot.get('bankroll', 100)
        binit = bot.get('initialBankroll', 100)
        broi = ((bbank - binit) / binit * 100) if binit > 0 else 0
        bwr = bot.get('winRate', 0)
        btrades = bot.get('trades', 0)
        blev = bot.get('leverage', 0)
        bev = bot.get('expectedValue', 0)
        bstrats = bot.get('activeStrategies', 0)
        lines.append(
            f"{medal} *{bname}* f:{bfit:.1f} ${bbank:.2f}({broi:+.1f}%) "
            f"WR:{bwr:.0f}% {btrades}t {blev}x EV:{bev:.2f} s:{bstrats}"
        )

    # ====================================================================
    # ÁREA 3: FUTURES TESTNET
    # ====================================================================
    lines.extend([
        "",
        "",
        "╔═══════════════════════════════════════════════════════════╗",
        "║  📈 FUTURES TESTNET (VALIDAÇÃO REAL)                     ║",
        "╚═══════════════════════════════════════════════════════════╝",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🔄 *CHAMPION SYNC STATUS*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ])

    # Try to fetch champion sync status
    try:
        sync_res = requests.get(f"{ECOSYSTEM_API}/champion-sync/status", timeout=3)
        if sync_res.ok:
            sync_data = sync_res.json().get('data', {})
            lines.extend([
                f"🔄 *Última Sync:* {sync_data.get('lastSyncTime', 'Aguardando...')}",
                f"✅ *Syncs Realizados:* {sync_data.get('syncCount', 0)}",
                f"⏰ *Próxima Sync:* {sync_data.get('nextSyncIn', 600):.0f}s",
                f"📊 *Status:* {'✅ ONLINE' if sync_data.get('isRunning') else '⏳ AGUARDANDO'}",
            ])
        else:
            lines.extend([
                f"🔄 *Status:* ⏳ Aguardando primeira sincronização (10min)",
                f"⏰ *Intervalo:* 10 minutos",
                f"📊 *Campeões:* Top 5 da DNA Arena",
            ])
    except:
        lines.extend([
            f"🔄 *Status:* ⏳ Aguardando primeira sincronização (10min)",
            f"⏰ *Intervalo:* 10 minutos",
            f"📊 *Campeões:* Top 5 da DNA Arena",
        ])

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "📋 *ESTRATÉGIAS FUTURES*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"📊 *Total Estratégias:* 5 campeãs",
        f"🏆 *Fonte:* DNA Arena (top fitness)",
        f"🔄 *Atualização:* Automática (10min)",
        f"✅ *Validação:* 8 checks de qualidade",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🎯 *PRÓXIMA VALIDAÇÃO*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"⏱️ *Primeira Sync:* 10 minutos",
        f"📊 *Validação Inicial:* 30 minutos",
        f"✅ *Produção:* 24h+",
    ])

    # ====================================================================
    # RODAPÉ GERAL
    # ====================================================================

    # Calculate open positions across all bots
    total_open = sum(b.get('openPositions', 0) for b in all_bots)

    # DNA Memory stats
    dna_stats = data.get('dnaMemoryStats', {})
    evo_dims = data.get('evolutionDimensions', 0)

    # Milestones
    group_milestones = milestones.get('groupMilestones', {}) if milestones else {}
    bot_milestones = milestones.get('botMilestones', {}) if milestones else {}
    total_ms = sum(len(v) for v in group_milestones.values()) + sum(len(v) for v in bot_milestones.values())

    lines.extend([
        "",
        "",
        "╔═══════════════════════════════════════════════════════════╗",
        "║  📊 RESUMO GERAL                                          ║",
        "╚═══════════════════════════════════════════════════════════╝",
        "",
        f"🛡️ *Risk:* " + ("🟢 BAIXO" if dd < 5 else "🟡 MÉDIO" if dd < 10 else "🔴 ALTO") + f" | DD: {dd:.1f}%",
        f"📊 *Posições Abertas:* {total_open}",
        f"🧬 *DNA Seeds:* {evo_dims} dimensões evolutivas",
        f"🏆 *Milestones:* {total_ms} atingidos",
    ])

    if total_ms > 0:
        for gid, ms in group_milestones.items():
            if ms:
                lines.append(f"   • {gid}: {len(ms)} milestones")
        for bid, ms in bot_milestones.items():
            if ms:
                lines.append(f"   • {bid}: {len(ms)} milestones")

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"*Relatórios:* {cycle_count} enviados",
        f"*Diana Corporação Senciente* 🏛️",
    ])

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
    """Check for events that need immediate notification - ENVIA RELATÓRIO COMPLETO 3 ÁREAS"""
    global last_bankroll, peak_bankroll, last_milestone_count
    alerts = []

    if not data:
        return alerts

    bankroll = data.get("communityBankroll", 0)
    alive = data.get("aliveBots", 0)
    total = data.get("totalBots", 25)
    dd = data.get("drawdownPercent", 0)

    # Bot death - only alert if significant change (>2 bots)
    if alive < total and alive < 23:  # Only alert if <23 bots alive (more than 2 dead)
        alerts.append(f"⚠️ BOTS MORTOS! {alive}/{total} vivos")

    # Drawdown > 10%
    if dd > 10:
        alerts.append(f"🚨 DRAWDOWN ALTO: {dd:.1f}%")

    # Bankroll change > 2% since last check
    if last_bankroll > 0:
        change = (bankroll - last_bankroll) / last_bankroll * 100
        if abs(change) > 2:
            direction = "📈 SUBIU" if change > 0 else "📉 CAIU"
            alerts.append(f"{direction} {abs(change):.1f}% (${bankroll:.2f})")

    # New peak
    if bankroll > peak_bankroll and peak_bankroll > 0:
        peak_bankroll = bankroll
        # Only alert on significant new peaks (>1% above initial)
        if bankroll > 2525:
            alerts.append(f"🏆 NOVO PEAK: ${bankroll:.2f}")

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
                    f"🏆 MILESTONE {evt.get('level','?').upper()}: "
                    f"{evt.get('entityId','?')} atingiu {evt.get('milestone','?')}x!"
                )
            last_milestone_count = len(events)

    return alerts


def send_alert_message(alert):
    """Send alert with full verbose 3-area report"""
    data = get_ecosystem_status()
    
    # Get full verbose report
    full_report = format_status_report(data, compact=False)
    
    # Prepend alert if any
    if alert:
        alert_header = (
            "╔═══════════════════════════════════════════════════════════╗\n"
            "║  🚨 ALERTA DIANA CORPORAÇÃO SENCIENTE                  ║\n"
            "╚═══════════════════════════════════════════════════════════╝\n\n"
            f"🕐 *Hora:* {datetime.now().strftime('%H:%M:%S')}\n"
            f"⚠️ *Tipo:* ALERTA CRÍTICO\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"📋 *ALERTA:*\n{alert}\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        )
        full_report = alert_header + full_report
    
    return full_report


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

    # Send startup notification - ULTRA VERBOSE 3 AREAS
    safe_print("[STARTUP] Sending initial report...")
    data = get_ecosystem_status()
    if data:
        last_bankroll = data.get("communityBankroll", 0)
        peak_bankroll = data.get("peakBankroll", 0)
        safe_print(f"[*] Ecosystem: Ciclo {data.get('cycle',0)} | ${last_bankroll:.2f}")
        
        # Send full verbose 3-area report
        startup_report = format_status_report(data, compact=False)
        send_whatsapp(startup_report)
        safe_print("[STARTUP] Initial report sent via WhatsApp")
    else:
        # Fallback if no data
        startup_msg = (
            "╔═══════════════════════════════════════════════════════════╗\n"
            "║  🚀 DIANA CORP SENTINEL ONLINE - INICIALIZAÇÃO         ║\n"
            "╚═══════════════════════════════════════════════════════════╝\n\n"
            f"🕐 *Data/Hora:* {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
            f"📋 *Status:* Sentinel Conectado e Monitorando\n"
            f"🔖 *Grupo:* {TARGET_GROUP}\n"
            f"📱 *Meu Número:* {MY_NUMBER}\n\n"
            "⚠️ *Aguardando dados do ecosystem...*\n\n"
            "*Diana Corporação Senciente* 🏛️"
        )
        send_whatsapp(startup_msg)
        safe_print("[STARTUP] Fallback message sent")

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
                
                # Only send alerts (no periodic status every minute)
                if alerts:
                    for alert in alerts:
                        safe_print(f"\n[ALERT] {alert}")
                        # Send full verbose 3-area report with alert header
                        alert_msg = send_alert_message(alert)
                        send_whatsapp(alert_msg)

            # === PERIODIC REPORT (every 30min) ===
            if time.time() - last_report_time >= REPORT_INTERVAL:
                last_report_time = time.time()
                data = get_ecosystem_status()
                if data:
                    # Send ultra verbose 3-area report
                    report = format_status_report(data, compact=False)
                    send_whatsapp(report)
                    safe_print(f"\n[REPORT] Periodic report sent (30min)")

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
