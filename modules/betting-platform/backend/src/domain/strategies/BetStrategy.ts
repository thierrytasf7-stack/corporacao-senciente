import { Strategy, StrategyType, StrategyConfig } from './Strategy';

export interface BetStrategyConfig extends StrategyConfig {
  type: StrategyType.BET;
  oddMin?: number;
  oddMax?: number;
  market?: string;
  selection?: string;
}

export abstract class BetStrategy extends Strategy {
  constructor(config: BetStrategyConfig) {
    super(config);
  }

  validate(): boolean {
    if (this.config.type !== StrategyType.BET) return false;
    
    // Bet strategies MUST NOT have stake/bankroll logic
    if ('stake' in this.config || 'bankroll' in this.config || 'progression' in this.config) {
      throw new Error(`BetStrategy ${this.config.name} cannot contain math/stake parameters`);
    }
    
    return true;
  }

  // Returns true if the bet should be placed based on market conditions (Odds only)
  abstract shouldBet(marketData: any): boolean;
}

// Implementations
export class OddsRangeStrategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { odd } = marketData;
    const { oddMin = 0, oddMax = Infinity } = this.config as BetStrategyConfig;
    return odd >= oddMin && odd <= oddMax;
  }
}
