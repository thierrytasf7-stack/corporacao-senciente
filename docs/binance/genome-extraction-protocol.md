# Genome Extraction Protocol: Shard Performance Replication

## 🔍 Objective
Extract and replicate the performance genome of Shard (eco-ALPHA-evo-gen138-*) to validate if its +14.08% ROI is replicable across different market regimes (BETA/OMEGA) or specific to ALPHA.

## 📊 Performance Context
- **Shard (ALPHA)**: +14.08% ROI, 54 trades, 57.4% win rate
- **Target Groups**: BETA (conservative), OMEGA (volatility)
- **Validation**: Compare clone performance against original Shard metrics

## 🔧 Extraction Process

### Step 1: Locate Shard Bot
```javascript
// Search in community-state.json for bot ID starting with 'eco-ALPHA-evo-gen138-'
const shardBot = Object.values(state.bots).find(bot => 
    bot.id.startsWith('eco-ALPHA-evo-gen138-')
);
```

### Step 2: Validate Bot Status
```javascript
if (!shardBot) {
    throw new Error(`Bot ${shardBotId} not found in community state`);
}

if (!shardBot.isAlive) {
    throw new Error(`Bot ${shardBotId} is not alive`);
}
```

### Step 3: Extract Complete Genome (9 Seeds)
```javascript
const genome = {
    strategyParams: shardBot.genome.strategyParams,
    marketRegime: shardBot.genome.marketRegime,
    temporal: shardBot.genome.temporal,
    correlation: shardBot.genome.correlation,
    sentiment: shardBot.genome.sentiment,
    riskAdapt: shardBot.genome.riskAdapt,
    metaEvolution: shardBot.genome.metaEvolution,
    patterns: shardBot.genome.patterns,
    symbolSelection: shardBot.genome.symbolSelection
};
```

### Step 4: Save Baseline Genome
```javascript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
const outputPath = path.join(GENOMES_DIR, `shard-baseline-${timestamp}.json`);
fs.writeFileSync(outputPath, JSON.stringify(genome, null, 2));
```

## 🔄 Injection Process

### Step 1: Read Baseline Genome
```javascript
const genomeFiles = fs.readdirSync(GENOMES_DIR)
    .filter(file => file.startsWith('shard-baseline-'))
    .sort()
    .reverse();

const baselineGenomePath = path.join(GENOMES_DIR, genomeFiles[0]);
const baselineGenome = JSON.parse(fs.readFileSync(baselineGenomePath, 'utf8'));
```

### Step 2: Create Clones for Target Groups
```javascript
const targetGroups = ['BETA', 'OMEGA'];

for (const groupId of targetGroups) {
    const botId = `shard-clone-${groupId}-${Date.now()}`;
    const bot = {
        id: botId,
        name: `Shard Clone ${groupId}`,
        groupId,
        isAlive: true,
        bankroll: 100,
        generation: 1,
        fitness: 0,
        winRate: 0,
        trades: 0,
        genome: baselineGenome
    };
}
```

### Step 3: Register Clones in Community State
```javascript
const updatedState = {
    ...state,
    bots: {
        ...state.bots,
        ...newBots
    }
};
fs.writeFileSync(STATE_FILE, JSON.stringify(updatedState, null, 2));
```

## 📊 Validation Metrics

### Performance Comparison
| Metric | Shard (ALPHA) | Clone BETA | Clone OMEGA |
|--------|---------------|------------|-------------|
| ROI | +14.08% | TBD | TBD |
| Win Rate | 57.4% | TBD | TBD |
| Trades | 54 | TBD | TBD |
| Risk Level | High | Conservative | Volatile |

### Success Criteria
- ✅ Both clones created and registered
- ✅ Genome contains all 9 seeds
- ✅ Baseline genome saved with timestamp
- ✅ Error handling for bot not found/alive
- ✅ EvolutionRegistry updated with injection event

## 🔧 Scripts

### extract-genome.js
- Reads community state
- Validates Shard bot status
- Extracts complete genome
- Saves baseline with timestamp
- Logs performance metrics

### inject-genome.js
- Reads latest baseline genome
- Creates clones for BETA/OMEGA
- Registers in community state
- Updates EvolutionRegistry
- Validates genome integrity

## 🔒 Safety Measures
- Only inject into non-alive bots
- Validate genome completeness (9 seeds)
- Timestamp-based versioning
- Error handling with descriptive messages
- EvolutionRegistry audit trail

## 📊 Expected Outcomes
1. **Performance Validation**: Determine if Shard's success is replicable
2. **Market Regime Testing**: Validate genome across different risk profiles
3. **Evolutionary Insights**: Understand which genome components drive performance
4. **Risk Assessment**: Identify if performance is alpha-specific or universally applicable