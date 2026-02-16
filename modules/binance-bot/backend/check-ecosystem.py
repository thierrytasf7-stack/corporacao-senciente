import urllib.request, json, sys

try:
    with urllib.request.urlopen('http://localhost:21341/api/v3/ecosystem/status', timeout=5) as resp:
        d = json.loads(resp.read())['data']

    print(f"Cycle: {d['cycle']} | Running: {d['isRunning']} | Bankroll: ${d['communityBankroll']}")
    print(f"Alive: {d['aliveBots']}/25")

    for g in d['groups']:
        regime = g.get('currentRegime', 'N/A')
        sentiment = g.get('currentSentiment', 'N/A')
        trades = sum(b['trades'] for b in g['bots'])
        openPos = sum(b['openPositions'] for b in g['bots'])
        print(f"  {g['groupId']}: ${g['bankroll']:.2f} | trades={trades} | open={openPos} | regime={regime} | sentiment={sentiment}")
        seeds = g.get('seeds', {})
        gen_list = [f"{k[:4]}:g{v['generation']}/f{v['fitness']}" for k,v in seeds.items()]
        print(f"    seeds: {', '.join(gen_list)}")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
