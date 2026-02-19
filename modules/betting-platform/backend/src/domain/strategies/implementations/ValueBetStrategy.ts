import { BetStrategy, BetStrategyConfig } from '../BetStrategy';

export interface ValueBetConfig extends BetStrategyConfig {
  minEdge: number; // e.g., 0.05 for 5% edge
}

export class ValueBetStrategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { odd, trueProbability } = marketData;
    const { minEdge } = this.config as ValueBetConfig;

    if (!trueProbability) {
        // If we don't know true probability, we can't calculate value
        // In a real system, this would come from a model or external feed
        return false; 
    }

    // Implied Probability of the Odd: 1 / Odd
    const impliedProbability = 1 / odd;

    // Edge = True Probability - Implied Probability
    const edge = trueProbability - impliedProbability;

    return edge >= minEdge;
  }
}
