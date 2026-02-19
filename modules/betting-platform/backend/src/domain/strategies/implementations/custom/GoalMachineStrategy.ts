import { BetStrategy, BetStrategyConfig } from '../../BetStrategy';

export interface GoalMachineConfig extends BetStrategyConfig {
  minGoalsAvg: number; // e.g. 2.8
  minOverOdd: number;
}

export class GoalMachineStrategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { selection, odd, homeGoalsAvg, awayGoalsAvg } = marketData;
    const { minGoalsAvg, minOverOdd } = this.config as GoalMachineConfig;

    // Only look for Over markets
    if (!selection.includes('Over')) return false;

    // Check Odd Value
    if (odd < minOverOdd) return false;

    // Check Statistics Trend
    if (homeGoalsAvg !== undefined && awayGoalsAvg !== undefined) {
      const avg = (homeGoalsAvg + awayGoalsAvg) / 2;
      if (avg < minGoalsAvg) return false;
    }

    return true;
  }
}
