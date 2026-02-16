import json, urllib.request

# Check signals to compare 1m vs 5m ATR
symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]

print("=== ATR COMPARISON: 1m vs 5m ===\n")
print(f"{'Symbol':10s} {'Price':>10s} {'ATR(1m)':>10s} {'ATR(5m)':>10s} {'1m%':>8s} {'5m%':>8s} {'Ratio':>6s}")
print("-" * 65)

for sym in symbols:
    try:
        url = f"http://localhost:21341/api/v2/dna-arena/pool/signals/{sym}"
        req = urllib.request.urlopen(url, timeout=10)
        data = json.loads(req.read())["data"]
        atr1m = data.get("atr14")
        atr5m = data.get("atr14_5m")
        price = data.get("currentPrice")
        if price and price > 0:
            pct1m = (atr1m / price * 100) if atr1m else 0
            pct5m = (atr5m / price * 100) if atr5m else 0
            ratio = (atr5m / atr1m) if (atr1m and atr5m and atr1m > 0) else 0
            print(f"{sym:10s} ${price:>9.2f} ${atr1m if atr1m else 0:>9.4f} ${atr5m if atr5m else 0:>9.4f} {pct1m:>7.3f}% {pct5m:>7.3f}% {ratio:>5.1f}x")
    except Exception as e:
        print(f"{sym}: Error - {e}")

print("\n=== IMPACT ON TP/SL (with 5m ATR) ===\n")
print(f"Using 2x ATR for TP, 1x ATR for SL:")
print(f"{'Symbol':10s} {'TP(1m)':>10s} {'TP(5m)':>10s} {'SL(1m)':>10s} {'SL(5m)':>10s}")
print("-" * 55)
for sym in symbols:
    try:
        url = f"http://localhost:21341/api/v2/dna-arena/pool/signals/{sym}"
        req = urllib.request.urlopen(url, timeout=10)
        data = json.loads(req.read())["data"]
        atr1m = data.get("atr14", 0) or 0
        atr5m = data.get("atr14_5m", 0) or 0
        price = data.get("currentPrice", 1)
        tp1 = atr1m * 2 / price * 100
        tp5 = atr5m * 2 / price * 100
        sl1 = atr1m * 1 / price * 100
        sl5 = atr5m * 1 / price * 100
        print(f"{sym:10s} {tp1:>9.3f}% {tp5:>9.3f}% {sl1:>9.3f}% {sl5:>9.3f}%")
    except:
        pass
