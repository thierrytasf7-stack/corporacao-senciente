import { BetStrategy, BetStrategyConfig } from '../../BetStrategy';

export interface DrawHunterConfig extends BetStrategyConfig {
  minDrawOdd: number;
  maxDrawOdd: number;
  maxOddsDiff: number; // Maximum difference between Home and Away odds
}

export class DrawHunterStrategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { odd, selection, homeOdd, awayOdd } = marketData;
    const { minDrawOdd, maxDrawOdd, maxOddsDiff } = this.config as DrawHunterConfig;

    // Only look for Draws
    if (selection !== 'Draw') return false;

    // Check odds range
    if (odd < minDrawOdd || odd > maxDrawOdd) return false;

    // Check if match is balanced (Home vs Away odds are close)
    if (homeOdd && awayOdd) {
      const diff = Math.abs(homeOdd - awayOdd);
      if (diff > maxOddsDiff) return false;
    }

    return true;
  }
}
