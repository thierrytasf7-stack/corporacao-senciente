# Shard Genome Extraction Protocol

## Overview
This protocol documents the extraction and replication of Shard's genome (eco-ALPHA-evo-gen138-*), the top-performing bot with +14.08% ROI (54 trades, 57.4% WR), to validate performance replicability across different market regimes.

## Objectives
- Extract complete genome from Shard bot
- Create clones in BETA (conservative) and OMEGA (volatility) groups
- Validate if performance is replicable or group-specific

## Prerequisites
- Node.js 25+ runtime
- Binance API credentials configured
- Community ecosystem running
- Shard bot alive in ALPHA group

## Step 1: Extract Shard Genome

### 1.1 Run Extraction Script
```bash
cd modules/binance-bot/backend/scripts
node extract-genome.js
```

### 1.2 Expected Output
```
Found Shard bot: eco-ALPHA-evo-gen138-1234567890
Group: ALPHA
Generation: 138
Bankroll: $1250.45
Win Rate: 57.4%
ROI: +14.08%

Shard genome extracted successfully!
Saved to: data/genomes/shard-baseline-2024-01-15_14-30-00.json
Genome contains 9 seeds
```

### 1.3 Genome Structure
The extracted genome contains 9 seeds:
- `strategyParams`: Core trading strategies configuration
- `marketRegime`: Market condition adaptation parameters
- `temporal`: Time-based trading parameters
- `correlation`: Asset correlation analysis settings
- `sentiment`: Market sentiment processing
- `riskAdapt`: Risk management adaptation
- `metaEvolution`: Meta-evolutionary parameters
- `patterns`: Pattern recognition configurations
- `symbolSelection`: Asset selection criteria

## Step 2: Inject Shard Clones

### 2.1 Run Injection Script
```bash
cd modules/binance-bot/backend/scripts
node inject-genome.js
```

### 2.2 Expected Output
```
Loaded Shard genome: shard-baseline-2024-01-15_14-30-00.json
Genome contains 9 seeds

Created clone for BETA:
ID: shard-clone-BETA-evo-gen15-1234567890
Generation: 15
Genome seeds: 9

Created clone for OMEGA:
ID: shard-clone-OMEGA-evo-gen8-1234567890
Generation: 8
Genome seeds: 9

Successfully created 2 Shard clones!
Updated community state saved to: data/ecosystem/community-state.json
```

### 2.3 Clone Configuration
- **BETA Clone**: Conservative market regime, lower volatility tolerance
- **OMEGA Clone**: High volatility tolerance, aggressive risk parameters
- Both inherit complete Shard genome seeds
- Initial bankroll: $100 each
- Generation: Next available in target group

## Step 3: Validation

### 3.1 Verify Community State
Check that clones are registered:
```json
{
  "bots": {
    "shard-clone-BETA-evo-gen15-1234567890": {
      "id": "shard-clone-BETA-evo-gen15-1234567890",
      "groupId": "BETA",
      "alive": true,
      "bankroll": 100,
      "genome": { /* complete genome */ }
    },
    "shard-clone-OMEGA-evo-gen8-1234567890": {
      "id": "shard-clone-OMEGA-evo-gen8-1234567890",
      "groupId": "OMEGA",
      "alive": true,
      "bankroll": 100,
      "genome": { /* complete genome */ }
    }
  }
}
```

### 3.2 Monitor Performance
- Track ROI, win rate, and bankroll growth
- Compare against original Shard performance
- Analyze group-specific adaptations

## Error Handling

### Common Issues
1. **Shard bot not found**: Verify bot is alive in ALPHA group
2. **Genome extraction fails**: Check file permissions and directory structure
3. **Clone injection fails**: Ensure EvolutionRegistry is properly initialized

### Troubleshooting
```bash
# Check community state
cat data/ecosystem/community-state.json | grep -A 10 "eco-ALPHA-evo-gen138"

# List available genomes
ls data/genomes/ | grep "shard-baseline"

# Check EvolutionRegistry logs
cat data/ecosystem/evolution-registry.json
```

## Performance Metrics

### Success Criteria
- [ ] Shard genome extracted with all 9 seeds
- [ ] 2 clones created (BETA and OMEGA)
- [ ] Clones registered in community state
- [ ] Scripts include error handling
- [ ] Documentation complete

### Validation Timeline
- **Immediate**: Genome extraction and clone creation
- **Short-term**: Initial performance tracking (1-7 days)
- **Long-term**: Performance validation across market cycles (30+ days)

## Security Considerations
- Genome data contains proprietary trading strategies
- Access to scripts should be restricted
- Audit trail maintained in evolution-registry.json

## Maintenance
- Update scripts for new genome versions
- Archive old genome baselines
- Monitor clone performance regularly
- Adjust injection parameters as needed