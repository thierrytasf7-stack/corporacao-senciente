#!/usr/bin/env python3
import urllib.request, json, sys

payload = json.dumps({
    "strategyId": "live-over-points",
    "config": {
        "dateRange": {"start": "2024-10-01", "end": "2025-06-30"},
        "initialBankroll": 1000,
        "filters": {"sports": ["basketball"], "leagues": ["NBA"], "minOdds": 1.70},
        "parameters": {"lookbackGames": 10, "thresholdPct": 0.85, "minOdds": 1.70}
    }
}).encode()

req = urllib.request.Request(
    "http://localhost:21370/api/backtest/real",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read())
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)

if not data.get("success"):
    print(f"ERRO API: {data}")
    sys.exit(1)

m    = data["data"]["metrics"]
bets = data["data"]["bets"]
eq   = data["data"].get("equityCurve", [])

print("=" * 55)
print("  BACKTEST REAL — Live Over Points — NBA 2024-25")
print("=" * 55)
print(f"Times analisados:       {m.get('teamsAnalyzed', 'N/A')}")
print(f"Jogos analisados:       {m.get('matchesAnalyzed', 'N/A')}")
print(f"Oportunidades:          {m.get('betCount', 0)}")
print(f"Vencedoras:             {m.get('wins', 0)}")
print(f"Perdedoras:             {m.get('losses', 0)}")
print(f"Win Rate:               {m.get('winRate', 0)*100:.1f}%")
print(f"ROI:                    {m.get('roi', 0)*100:.2f}%")
print(f"Banca inicial:          R$ {m.get('initialBankroll', 1000):.2f}")
print(f"Banca final:            R$ {m.get('finalBankroll', 0):.2f}")
print(f"Lucro total:            R$ {m.get('totalProfit', 0):.2f}")
print(f"Odd media:              {m.get('avgOdds', 0):.2f}")
print(f"Sharpe Ratio:           {m.get('sharpeRatio', 0):.2f}")
print(f"Max Drawdown:           R$ {m.get('maxDrawdown', 0):.2f}")
print(f"Data source:            {m.get('dataSource', '?')}")

# Distribuicao por time
by_team = {}
for b in bets:
    t = b.get("team", "?")
    if t not in by_team:
        by_team[t] = {"w": 0, "l": 0, "profit": 0.0}
    if b.get("result") == "WIN":
        by_team[t]["w"] += 1
    else:
        by_team[t]["l"] += 1
    by_team[t]["profit"] += b.get("profit", 0)

print(f"\n{'=' * 55}")
print(f"  TOP 10 TIMES POR LUCRO")
print(f"{'=' * 55}")
sorted_teams = sorted(by_team.items(), key=lambda x: x[1]["profit"], reverse=True)
for team, stats in sorted_teams[:10]:
    total = stats["w"] + stats["l"]
    wr = stats["w"]*100//total if total > 0 else 0
    print(f"  {team:<30} {stats['w']}W/{stats['l']}L  WR={wr}%  R${stats['profit']:+.2f}")

print(f"\n  PIORES 5 TIMES")
for team, stats in sorted_teams[-5:]:
    total = stats["w"] + stats["l"]
    wr = stats["w"]*100//total if total > 0 else 0
    print(f"  {team:<30} {stats['w']}W/{stats['l']}L  WR={wr}%  R${stats['profit']:+.2f}")

print(f"\n{'=' * 55}")
print(f"  PRIMEIRAS 10 APOSTAS")
print(f"{'=' * 55}")
for b in bets[:10]:
    print(f"  {b.get('date','')[:10]} | {b.get('team',''):<25} | "
          f"thr={b.get('threshold',0):.0f}pts | half={b.get('halfScore',0)} | "
          f"odd={b.get('odds',0):.2f} | {b.get('result',''):4} | R${b.get('profit',0):+.2f}")
