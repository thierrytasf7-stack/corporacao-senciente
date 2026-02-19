import { BetStrategy } from '../strategies/BetStrategy';
import { MathStrategy } from '../strategies/MathStrategy';
import { v4 as uuidv4 } from 'uuid';

export interface BotConfig {
  id?: string;
  name: string;
  initialBankroll: number;
}

export interface BotState {
  bankroll: number;
  activeBets: number;
  totalBets: number;
  wins: number;
  losses: number;
  roi: number;
}

export class Bot {
  public readonly id: string;
  public readonly name: string;
  private bankroll: number;
  private betStrategy: BetStrategy;
  private mathStrategy: MathStrategy;
  
  // History for Math Strategies (e.g. Martingale needs last result)
  private history: any[] = [];

  constructor(
    config: BotConfig,
    betStrategy: BetStrategy,
    mathStrategy: MathStrategy
  ) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.bankroll = config.initialBankroll;
    this.betStrategy = betStrategy;
    this.mathStrategy = mathStrategy;
  }

  /**
   * Main decision loop for a market opportunity
   */
  evaluateOpportunity(marketData: any): { shouldBet: boolean; stake: number; reason?: string } {
    // 1. Bet Strategy decides IF we bet
    const shouldBet = this.betStrategy.shouldBet(marketData);
    
    if (!shouldBet) {
      return { shouldBet: false, stake: 0, reason: "Bet Strategy condition not met" };
    }

    // 2. Math Strategy decides HOW MUCH we bet
    const stake = this.mathStrategy.calculateStake(this.bankroll, marketData.odd, this.history);

    if (stake <= 0) {
      return { shouldBet: false, stake: 0, reason: "Math Strategy calculated 0 stake" };
    }

    if (stake > this.bankroll) {
      return { shouldBet: false, stake: 0, reason: "Insufficient bankroll" };
    }

    return { shouldBet: true, stake };
  }

  /**
   * Execute bet and update local state (Paper Trading)
   */
  placeBet(marketData: any, stake: number) {
    if (stake > this.bankroll) throw new Error("Insufficient funds");
    
    this.bankroll -= stake;
    
    const betRecord = {
      id: uuidv4(),
      botId: this.id,
      marketId: marketData.id,
      selection: marketData.selection,
      odds: marketData.odd,
      stake: stake,
      status: 'OPEN',
      timestamp: new Date()
    };
    
    // In a real system, this would persist to DB
    return betRecord;
  }

  /**
   * Settle bet and update math strategy history
   */
  settleBet(betRecord: any, result: 'WIN' | 'LOSS', profit: number = 0) {
    if (result === 'WIN') {
      this.bankroll += profit + betRecord.stake;
    }
    
    // Update history for strategies like Martingale
    this.history.push({
      ...betRecord,
      result,
      profit
    });
  }

  getState(): BotState {
    const totalBets = this.history.length;
    const wins = this.history.filter(h => h.result === 'WIN').length;
    const losses = this.history.filter(h => h.result === 'LOSS').length;
    
    // Simple ROI calculation
    // const totalStaked = this.history.reduce((sum, h) => sum + h.stake, 0);
    // const totalReturned = ... 
    
    return {
      bankroll: this.bankroll,
      activeBets: 0, // TODO: track active bets
      totalBets,
      wins,
      losses,
      roi: 0 // Placeholder
    };
  }
}
