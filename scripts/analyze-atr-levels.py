import json, urllib.request

# Check signals for each symbol to see ATR values
symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]

print("=== ATR ANALYSIS ===\n")
for sym in symbols:
    try:
        url = f"http://localhost:21341/api/v2/dna-arena/pool/signals/{sym}"
        req = urllib.request.urlopen(url, timeout=10)
        data = json.loads(req.read())["data"]
        atr = data.get("atr14")
        price = data.get("currentPrice")
        if atr and price:
            atr_pct = atr / price * 100
            # Calculate what TP/SL would be with different multipliers
            print(f"{sym}: Price=${price:.2f} ATR14=${atr:.4f} ({atr_pct:.3f}%)")
            for mult in [1.0, 1.5, 2.0, 2.5, 3.0]:
                tp_dist = atr * mult / price * 100
                print(f"  {mult:.1f}x ATR = {tp_dist:.3f}% ({atr*mult:.4f})")
            print()
        else:
            print(f"{sym}: ATR={atr} Price={price} (MISSING)")
    except Exception as e:
        print(f"{sym}: Error - {e}")

# Also show current bot positions and their TP/SL distances
print("\n=== CURRENT POSITION TP/SL DISTANCES ===\n")
url = "http://localhost:21341/api/v2/dna-arena/status"
req = urllib.request.urlopen(url, timeout=10)
data = json.loads(req.read())["data"]
for bot in data["bots"]:
    for p in bot.get("positions", []):
        sym = p["symbol"]
        entry = p["entryPrice"]
        tp = p["takeProfitPrice"]
        sl = p["stopLossPrice"]
        tp_dist = abs(tp - entry) / entry * 100
        sl_dist = abs(sl - entry) / entry * 100
        ratio = tp_dist / sl_dist if sl_dist > 0 else 0
        print(f"  {bot['name']:12s} {sym:10s} TP={tp_dist:.3f}% SL={sl_dist:.3f}% R:R={ratio:.2f}:1")
