import { BetStrategy, BetStrategyConfig } from '../BetStrategy';

export interface DroppingOddsConfig extends BetStrategyConfig {
  dropThreshold: number; // e.g., 0.10 for 10% drop
  timeWindowSeconds: number; // e.g., 60 seconds
}

export class DroppingOddsStrategy extends BetStrategy {
  private oddsHistory: Map<string, { odd: number; timestamp: number }[]> = new Map();

  shouldBet(marketData: any): boolean {
    const { id, odd, timestamp = Date.now() } = marketData;
    const { dropThreshold, timeWindowSeconds } = this.config as DroppingOddsConfig;

    // Get history for this market
    let history = this.oddsHistory.get(id) || [];
    
    // Clean old history
    const cutoff = timestamp - (timeWindowSeconds * 1000);
    history = history.filter(h => h.timestamp >= cutoff);
    
    // Add current observation
    history.push({ odd, timestamp });
    this.oddsHistory.set(id, history);

    // Check for drop
    if (history.length < 2) return false;

    const oldestOdd = history[0].odd;
    const currentOdd = odd;
    
    // Calculate drop percentage: (Old - New) / Old
    // Example: Old 2.0, New 1.8 -> (2.0 - 1.8) / 2.0 = 0.10 (10% drop)
    const drop = (oldestOdd - currentOdd) / oldestOdd;

    return drop >= dropThreshold;
  }
}
