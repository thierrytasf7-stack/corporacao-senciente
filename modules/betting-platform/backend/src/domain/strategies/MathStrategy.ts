import { Strategy, StrategyType, StrategyConfig } from './Strategy';

export interface MathStrategyConfig extends StrategyConfig {
  type: StrategyType.MATH;
  baseStake?: number;
  bankrollPercent?: number;
  progressionType?: 'flat' | 'martingale' | 'fibonacci' | 'kelly';
  maxStake?: number;
}

export abstract class MathStrategy extends Strategy {
  constructor(config: MathStrategyConfig) {
    super(config);
  }

  validate(): boolean {
    if (this.config.type !== StrategyType.MATH) return false;
    
    // Math strategies MUST handle stake calculation
    // They generally don't decide IF to bet (that's BetStrategy), but HOW MUCH
    return true;
  }

  abstract calculateStake(bankroll: number, currentOdd: number, history: any[]): number;
}

// Implementations
export class FlatStakeStrategy extends MathStrategy {
  calculateStake(bankroll: number): number {
    const { baseStake } = this.config as MathStrategyConfig;
    return baseStake || 0;
  }
}

export class MartingaleStrategy extends MathStrategy {
  calculateStake(bankroll: number, currentOdd: number, history: any[]): number {
    const { baseStake } = this.config as MathStrategyConfig;
    const lastBet = history[history.length - 1];
    
    if (lastBet && lastBet.result === 'LOSS') {
      return lastBet.stake * 2;
    }
    return baseStake || 0;
  }
}

export class KellyCriterionStrategy extends MathStrategy {
  calculateStake(bankroll: number, currentOdd: number): number {
    const { bankrollPercent } = this.config as MathStrategyConfig; // Kelly fraction (e.g. 0.25 for quarter kelly)
    const winProbability = 1 / currentOdd; // Simplified implied probability
    
    // Kelly Formula: f = (bp - q) / b
    // b = odds - 1
    // p = probability of win
    // q = probability of loss (1-p)
    
    const b = currentOdd - 1;
    const p = winProbability; 
    const q = 1 - p;
    
    const f = (b * p - q) / b;
    
    // Apply fractional kelly if configured, otherwise full kelly
    const fraction = bankrollPercent || 1; 
    const stakePercent = f * fraction;
    
    return Math.max(0, bankroll * stakePercent);
  }
}
