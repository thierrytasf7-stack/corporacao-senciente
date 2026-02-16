import json, urllib.request

url = "http://localhost:21341/api/v2/dna-arena/stats"
req = urllib.request.urlopen(url, timeout=10)
data = json.loads(req.read())["data"]

print("=== DNA ARENA V2 STATS ===")
gen = data["generation"]
cycle = data["currentCycle"]
running = data["isRunning"]
print(f"Gen: {gen} | Cycle: {cycle} | Running: {running}")

agg = data["aggregate"]
print(f"Bots: {agg['totalBots']} alive={agg['aliveBots']}")
print(f"Trades: {agg['totalTrades']} (W:{agg['totalWins']}/L:{agg['totalLosses']}) WR:{agg['overallWinRate']}%")
print(f"Total Bankroll: ${agg['totalBankroll']:.2f} | Avg: ${agg['avgBankroll']:.2f} | Combined PnL: ${agg['combinedPnL']:.2f}")

bp = data["bestPerformers"]
print(f"\nBest Sharpe: {bp['sharpe']['name']}={bp['sharpe']['value']}")
print(f"Best WinRate: {bp['winRate']['name']}={bp['winRate']['value']}%")
print(f"Best Profit: {bp['profit']['name']}=${bp['profit']['value']}")
print(f"Best Fitness: {bp['fitness']['name']}={bp['fitness']['value']}")

elite = data.get("eliteBot")
if elite:
    print(f"\nElite Bot (immune): {elite['name']} Sharpe={elite['sharpe']} Trades={elite['trades']}")
else:
    print("\nElite Bot: None (need 5+ trades)")

reasons = data.get("tradeReasons", {})
if reasons:
    print(f"\nTrade Exit Reasons:")
    for r, c in sorted(reasons.items(), key=lambda x: -x[1]):
        print(f"  {r}: {c}")

hof = data.get("hallOfFame", [])
print(f"\nHall of Fame: {len(hof)} entries")
for i, h in enumerate(hof[:5]):
    print(f"  #{i+1} {h['name']} Gen{h['generation']} Fitness={h['fitness']} Sharpe={h['sharpe']} WR={h['winRate']}% ${h['bankroll']}")
