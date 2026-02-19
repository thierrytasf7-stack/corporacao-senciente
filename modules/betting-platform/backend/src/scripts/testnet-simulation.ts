import { BotFactory, BotDNA } from '../domain/bot/BotFactory';
import { StrategyType } from '../domain/strategies/Strategy';

// 1. Define DNA for Specialized Bots (Based on BettingSystemsGuide)
const botDNAs: BotDNA[] = [
  {
    id: 'bot-draw-hunter',
    name: 'Draw Hunter V1',
    initialBankroll: 1000,
    genes: {
      bet: {
        type: StrategyType.BET,
        name: 'DrawHunter',
        minDrawOdd: 3.00,
        maxDrawOdd: 4.50,
        maxOddsDiff: 0.5
      },
      math: {
        type: StrategyType.MATH,
        name: 'FlatStake',
        baseStake: 20 // Conservative flat stake for high variance strategy
      }
    }
  },
  {
    id: 'bot-goal-machine',
    name: 'Goal Machine V1',
    initialBankroll: 1000,
    genes: {
      bet: {
        type: StrategyType.BET,
        name: 'GoalMachine',
        minGoalsAvg: 2.8,
        minOverOdd: 1.70
      },
      math: {
        type: StrategyType.MATH,
        name: 'Kelly',
        bankrollPercent: 0.25 // Aggressive growth for high probability bets
      }
    }
  },
  {
    id: 'bot-value-seeker',
    name: 'Value Seeker V1',
    initialBankroll: 1000,
    genes: {
      bet: {
        type: StrategyType.BET,
        name: 'ValueBet',
        minEdge: 0.05
      },
      math: {
        type: StrategyType.MATH,
        name: 'Kelly',
        bankrollPercent: 0.15
      }
    }
  },
  {
    id: 'bot-tennis-comeback',
    name: 'Tennis Comeback V1',
    initialBankroll: 1000,
    genes: {
      bet: {
        type: StrategyType.BET,
        name: 'TennisComeback',
        maxFavoritePreOdds: 1.40, // Strong favorite
        minLiveOdds: 1.80,        // Value entry
        targetScore: '0-30'       // Losing serve
      },
      math: {
        type: StrategyType.MATH,
        name: 'Martingale',       // Risky recovery
        baseStake: 10
      }
    }
  },
  {
    id: 'bot-nba-comeback',
    name: 'NBA Comeback King V1',
    initialBankroll: 1000,
    genes: {
      bet: {
        type: StrategyType.BET,
        name: 'NBAUnderdogQ3',
        minUnderdogLead: 10,  // Losing by 10+
        minQuarterDiff: 5,    // Won Q3 by 5+
        maxUnderdogLiveOdd: 10.0
      },
      math: {
        type: StrategyType.MATH,
        name: 'FlatStake',
        baseStake: 25 // Aggressive flat stake
      }
    }
  }
];

// 2. Instantiate Bots
console.log('🏭 Initializing Bot Factory...');
const bots = botDNAs.map(dna => BotFactory.createFromDNA(dna));
console.log(`✅ Created ${bots.length} bots ready for the Arena.`);

// 3. Simulate Market Data Stream (The Arena Loop)
console.log('\n🏟️  Entering The Arena - Simulation Starting...');

const marketOpportunities = [
  // Scenario 1: Balanced match, potential Draw
  { 
    id: 'm1', selection: 'Draw', odd: 3.20, 
    homeOdd: 2.50, awayOdd: 2.60, // Balanced odds
    homeGoalsAvg: 1.2, awayGoalsAvg: 1.1 
  },
  // Scenario 2: High scoring tendency
  { 
    id: 'm2', selection: 'Over 2.5', odd: 1.85, 
    homeGoalsAvg: 3.1, awayGoalsAvg: 2.9 // High avg goals
  },
  // Scenario 3: Value Bet situation (True prob 50% = 2.00, Odds 2.20)
  { 
    id: 'm3', selection: 'Team A Win', odd: 2.20, 
    trueProbability: 0.50 
  },
  // Scenario 4: Trap (No value, low scoring)
  { 
    id: 'm4', selection: 'Over 2.5', odd: 1.60, 
    homeGoalsAvg: 1.0, awayGoalsAvg: 0.8 
  },
  // Scenario 5: Tennis Live Comeback Opportunity
  {
    id: 'm5', 
    sport: 'Tennis',
    selection: 'Djokovic Win Game',
    isLive: true,
    server: 'Favorite',
    preGameOdds: 1.20, // Djokovic was strong favorite
    currentScore: '0-30', // He is losing serve
    odd: 2.10 // Odds drifted to evens+
  },
  // Scenario 6: NBA Q3 Momentum Shift (Comeback)
  {
    id: 'm6',
    sport: 'Basketball',
    league: 'NBA',
    selection: 'Lakers Win',
    period: 'Q3_END',
    preGameFavorite: 'Home', // Lakers (Home) were favorites
    homeScore: 85,
    awayScore: 96, // Losing by 11 (Trigger > 10)
    homeQ3Score: 30,
    awayQ3Score: 22, // Won Q3 by 8 (Trigger > 5) -> Momentum shift!
    odd: 3.50 // High value for comeback
  }
];

// Run simulation
marketOpportunities.forEach((market, index) => {
  console.log(`
--- Market Update #${index + 1}: ${market.selection} @ ${market.odd} ---`);
  
  bots.forEach(bot => {
    const decision = bot.evaluateOpportunity(market);
    
    if (decision.shouldBet) {
      console.log(`🤖 ${bot.name}: PLACING BET | Stake: $${decision.stake.toFixed(2)}`);
      // In a real loop, we would persist this
      bot.placeBet(market, decision.stake);
    } else {
      console.log(`💤 ${bot.name}: SKIP | Reason: ${decision.reason}`);
    }
  });
});

console.log('
🏁 Simulation Complete. Final Standings:');
bots.forEach(bot => {
    const state = bot.getState();
    console.log(`${bot.name}: Bankroll $${state.bankroll.toFixed(2)}`);
});
