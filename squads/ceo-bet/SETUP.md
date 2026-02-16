# CEO-BET Setup Guide

**Strategic Orchestrator for BET-SPORTS Domain**

## Prerequisites

✅ **Already Installed:**
- Node.js v25.4.0
- PostgreSQL 18.1 (localhost:5432)
- Python 3.12
- Git bash (D:\Git\bin\bash.exe)

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.template .env

# Edit .env and add your API keys
# ODDS_API_KEY=your_key_here
# API_SPORTS_KEY=your_key_here
```

### 2. Database Initialization

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost -p 5432

# Create database (if needed)
CREATE DATABASE betting;

# Load schema
\i data/schema.sql
```

### 3. Test API Connections

```bash
# Test Odds API
node scripts/odds-api-client.js quota

# List available sports
node scripts/odds-api-client.js sports

# Get odds for EPL
node scripts/odds-api-client.js odds soccer_epl
```

### 4. Test Kelly Calculator

```bash
# Calculate optimal stake
# odds=2.5, probability=50%, bankroll=$10k, max 5% stake
node scripts/kelly-calculator.js stake 2.5 0.50 10000 5

# Detect value bet
# odds=2.2, true probability=55%
node scripts/kelly-calculator.js value 2.2 0.55
```

### 5. Test Bankroll Manager

```bash
# Run simulation
node scripts/bankroll-manager.js
```

## API Keys Required

### The Odds API (FREE tier available)
1. Sign up: https://the-odds-api.com/
2. Get API key from dashboard
3. Free tier: 500 requests/month
4. Add to `.env`: `ODDS_API_KEY=your_key`

### API-Sports (Optional)
1. Sign up: https://api-sports.io/
2. Get API key
3. Free tier: 100 requests/day
4. Add to `.env`: `API_SPORTS_KEY=your_key`

## Directory Structure

```
ceo-bet/
├── .env.template          # Environment variables template
├── SETUP.md               # This file
├── agents/
│   └── ceo-bet.md         # CEO orchestrator agent
├── tasks/                 # 8 orchestration tasks
├── scripts/
│   ├── odds-api-client.js      # Odds API wrapper
│   ├── kelly-calculator.js     # Kelly Criterion calculator
│   └── bankroll-manager.js     # Bankroll management
├── data/
│   └── schema.sql         # PostgreSQL schema
└── workflows/             # Multi-step workflows
```

## Configuration

Default settings in `squad.yaml`:

```yaml
betting:
  focus: ["Football", "Basketball", "Tennis", "MMA", "Esports"]
  markets: ["1X2", "Over/Under", "Asian Handicap", "BTTS"]

bankrollDefaults:
  initialBankroll: 10000
  maxStakePercent: 5
  minOdds: 1.5
  maxOdds: 10.0
  kellyFraction: 0.25

riskManagement:
  maxOpenBets: 10
  maxDailyRisk: 15
  stopLossDaily: 10
```

## Squads Managed by CEO-BET

1. **live-betting** - Real-time betting operations
2. **data-sports** - Data pipeline and analytics
3. **strategy-sports** - Strategy development
4. **infra-sports** - Infrastructure and integrations
5. **analytics-sports** - Performance analysis

## Usage Examples

### Daily Briefing
```bash
/CEOs:CEO-BET *daily-briefing
```

### Orchestrate Live Betting
```bash
/CEOs:CEO-BET *orchestrate live-betting
```

### Strategic Decision
```bash
/CEOs:CEO-BET *strategic-decision
```

### Portfolio Review
```bash
/CEOs:CEO-BET *portfolio-review
```

## Stack Installed

**Node.js Packages:**
- axios (HTTP client)
- dotenv (environment variables)
- date-fns (date utilities)
- ws (WebSockets)
- node-fetch@2 (fetch API)

**Python Packages:**
- requests (HTTP client)
- pandas (data analysis)
- numpy (numerical computing)
- python-dotenv (environment variables)
- scikit-learn (machine learning)

**MCPs:**
- context7 (library docs)
- postgres (database access)
- sequential-thinking (task decomposition)
- memory (persistent memory)
- filesystem (file access)
- github (git operations)
- sentry (error tracking)

## Next Steps

1. ✅ Get API keys (The Odds API minimum)
2. ✅ Initialize database schema
3. ✅ Test connectivity with scripts
4. 🎯 Activate first squad: `/BET-SPORTS:LiveBetting-AIOS`
5. 📊 Start collecting odds data
6. 🧠 Develop betting strategies
7. 💰 Begin paper trading

## Resources

- [The Odds API Docs](https://the-odds-api.com/liveapi/guides/v4/)
- [Kelly Criterion Calculator](./scripts/kelly-calculator.js)
- [Bankroll Manager](./scripts/bankroll-manager.js)
- [Database Schema](./data/schema.sql)

---

*CEO-BET v1.0.0 | Strategic Orchestrator | Data-Driven | Risk-Aware*
