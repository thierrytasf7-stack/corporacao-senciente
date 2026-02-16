import json, sys, urllib.request

try:
    url = "http://localhost:21341/api/v2/dna-arena/status"
    req = urllib.request.urlopen(url, timeout=5)
    data = json.loads(req.read())["data"]

    print(f"=== DNA ARENA V2 (Signal Pool Consensus) ===")
    print(f"Cycle: {data['currentCycle']} | Gen: {data['generation']} | Running: {data['isRunning']}")
    print(f"Signal Pool: {data['signalPoolSize']} strategies | Bots: {data['totalBots']}")
    print()

    for bot in data["bots"]:
        name = bot["name"]
        gen = bot["generation"]
        bank = bot["bankroll"]
        trades = bot["totalTrades"]
        wins = bot["wins"]
        losses = bot["losses"]
        wr = bot["winRate"]
        pos = bot["openPositions"]
        dd = bot["maxDrawdown"]
        deaths = bot["deathCount"]
        fitness = bot["fitness"]
        strats = bot["activeStrategies"]
        cons = bot["consensus"]

        print(f"{'='*65}")
        print(f"  {name} (Gen {gen}) | {strats} strategies active")
        print(f"  Consensus: min={cons['minAgreeingSignals']} agree, max={cons['maxOpposingSignals']} oppose, min_str={cons['minWeightedStrength']}")
        sharpe = bot.get("sharpeRatio", "N/A")
        sortino = bot.get("sortinoRatio", "N/A")
        pf = bot.get("profitFactor", "N/A")
        risk = bot.get("risk", {})
        atr_tp = risk.get("atrMultiplierTP", "?")
        atr_sl = risk.get("atrMultiplierSL", "?")
        trail = risk.get("trailingStopATR", "?")
        print(f"  Bankroll: ${bank:.2f} | Trades: {trades} (W:{wins}/L:{losses}) WR:{wr}%")
        print(f"  Sharpe: {sharpe} | Sortino: {sortino} | ProfitFactor: {pf} | Fitness: {fitness}")
        print(f"  Risk: TP={atr_tp}xATR SL={atr_sl}xATR Trail={trail}xATR | Drawdown: {dd}% | Deaths: {deaths}")

        for p in bot.get("positions", []):
            sym = p["symbol"]
            side = p["side"]
            entry = p["entryPrice"]
            tp = p["takeProfitPrice"]
            sl = p["stopLossPrice"]
            bet = p["betAmount"]
            lev = p["leverage"]
            cons_snap = p.get("consensus", {})
            agree = cons_snap.get("agreeingCount", "?")
            oppose = cons_snap.get("opposingCount", "?")
            top = cons_snap.get("topStrategies", [])[:3]
            tp_dist = abs(tp - entry) / entry * 100
            sl_dist = abs(sl - entry) / entry * 100
            print(f"    {sym} {side} ${entry:.2f} TP:{tp_dist:.3f}% SL:{sl_dist:.3f}% bet=${bet:.1f} {lev}x | {agree}v/{oppose}x [{','.join(top[:2])}]")

        for t in bot.get("lastTrades", [])[-3:]:
            reason = t["reason"]
            sym = t["symbol"]
            side = t["side"]
            pnl = t["pnlValue"]
            pnlp = t["pnlPercent"]
            bankafter = t["bankrollAfter"]
            cons_snap = t.get("consensus", {})
            agree = cons_snap.get("agreeingCount", "?")
            print(f"    {reason}: {sym} {side} PnL:{pnlp:+.1f}% (${pnl:+.2f}) -> ${bankafter:.2f} [{agree}v]")

    print()
except Exception as e:
    print(f"Error: {e}")
