import json, urllib.request

# Check klines directly from binance testnet
url = "http://localhost:21341/api/v2/dna-arena/pool/signals/BTCUSDT"
req = urllib.request.urlopen(url, timeout=10)
data = json.loads(req.read())["data"]

# Check each signal's strength to understand which null check is failing
for s in data["signals"]:
    d = s["direction"]
    st = s["strength"]
    status = "ACTIVE" if d != "NEUTRAL" else ("OK" if st and st > 0 else "DEAD")
    print(f"{s['strategyId']:25s} {d:8s} str={str(st):5s} [{status}]")

# Also check klines directly from testnet
print("\n--- Checking klines directly ---")
try:
    url2 = "https://testnet.binancefuture.com/fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=5"
    req2 = urllib.request.urlopen(url2, timeout=10)
    klines = json.loads(req2.read())
    print(f"Direct futures klines: {len(klines)} candles")
    if klines:
        print(f"First candle: {klines[0][:5]}")
        print(f"Last candle: {klines[-1][:5]}")
except Exception as e:
    print(f"Direct klines error: {e}")

# Also try spot testnet
try:
    url3 = "https://testnet.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=5"
    req3 = urllib.request.urlopen(url3, timeout=10)
    klines2 = json.loads(req3.read())
    print(f"\nDirect spot klines: {len(klines2)} candles")
    if klines2:
        print(f"First candle: {klines2[0][:5]}")
except Exception as e:
    print(f"Spot klines error: {e}")
