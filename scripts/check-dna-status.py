import json, sys, urllib.request

try:
    url = "http://localhost:21341/api/v1/dna-arena/status"
    req = urllib.request.urlopen(url, timeout=5)
    data = json.loads(req.read())["data"]

    print(f"Cycle: {data['currentCycle']} | Gen: {data['generation']} | Running: {data['isRunning']}")
    print()

    for bot in data["bots"]:
        name = bot["name"]
        style = bot["tradingStyle"]
        bank = bot["bankroll"]
        trades = bot["totalTrades"]
        wins = bot["wins"]
        losses = bot["losses"]
        pos = bot["openPositions"]
        dd = bot["maxDrawdown"]
        deaths = bot["deathCount"]
        cw = bot["consecutiveWins"]
        cl = bot["consecutiveLosses"]

        print(f"{'='*60}")
        print(f"  {name} [{style}] | L1: {bot['layer1']} + L2: {bot['layer2']}")
        print(f"  Bankroll: ${bank:.2f} | Trades: {trades} (W:{wins}/L:{losses})")
        print(f"  Positions: {pos} | Drawdown: {dd}% | Deaths: {deaths}")
        print(f"  Streak: {cw}W / {cl}L")

        for p in bot.get("positions", []):
            sym = p["symbol"]
            side = p["side"]
            entry = p["entryPrice"]
            tp = p["takeProfitPrice"]
            sl = p["stopLossPrice"]
            bet = p["betAmount"]
            lev = p["leverage"]
            tp_dist = abs(tp - entry) / entry * 100
            sl_dist = abs(sl - entry) / entry * 100
            print(f"    {sym} {side} ${entry:.2f} -> TP:${tp:.2f}(+{tp_dist:.3f}%) SL:${sl:.2f}(-{sl_dist:.3f}%) bet=${bet} {lev}x")

        for t in bot.get("lastTrades", []):
            reason = t["reason"]
            sym = t["symbol"]
            side = t["side"]
            pnl = t["pnlValue"]
            pnlp = t["pnlPercent"]
            bankafter = t["bankrollAfter"]
            print(f"    TRADE: {reason} {sym} {side} PnL:{pnlp:+.1f}% (${pnl:+.2f}) -> Bank:${bankafter:.2f}")

    print()
except Exception as e:
    print(f"Error: {e}")
