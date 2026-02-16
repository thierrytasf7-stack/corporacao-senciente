import json, sys, urllib.request

url = "http://localhost:21341/api/v2/dna-arena/pool/signals/BTCUSDT"
req = urllib.request.urlopen(url, timeout=10)
data = json.loads(req.read())["data"]
signals = data["signals"]
summary = data["summary"]

print(f"Total signals: {len(signals)}")
print(f"Summary: {json.dumps(summary, indent=2)}")
print()

non_neutral = [s for s in signals if s["direction"] != "NEUTRAL"]
print(f"=== NON-NEUTRAL (active) signals: {len(non_neutral)} ===")
for s in non_neutral:
    print(f"  {s['strategyName']:25s} {s['direction']:6s} strength={s['strength']}")

print()
neutral_str = [s for s in signals if s["direction"] == "NEUTRAL" and s["strength"] > 0]
print(f"=== NEUTRAL but strength > 0: {len(neutral_str)} ===")
for s in neutral_str:
    print(f"  {s['strategyName']:25s} strength={s['strength']}")

all_neutral_zero = [s for s in signals if s["direction"] == "NEUTRAL" and s["strength"] == 0]
print(f"\n=== NEUTRAL strength=0 (dead): {len(all_neutral_zero)} ===")
for s in all_neutral_zero:
    print(f"  {s['strategyName']}")
