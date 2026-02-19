import { BetStrategy, BetStrategyConfig, OddsRangeStrategy } from './BetStrategy';
import { DroppingOddsStrategy } from './implementations/DroppingOddsStrategy';
import { ValueBetStrategy } from './implementations/ValueBetStrategy';
import { DrawHunterStrategy } from './implementations/custom/DrawHunterStrategy';
import { GoalMachineStrategy } from './implementations/custom/GoalMachineStrategy';
import { TennisComebackStrategy } from './implementations/custom/TennisComebackStrategy';
import { NBAUnderdogQ3Strategy } from './implementations/custom/NBAUnderdogQ3Strategy';
import { MathStrategy, MathStrategyConfig, FlatStakeStrategy, MartingaleStrategy, KellyCriterionStrategy } from './MathStrategy';
import { StrategyType } from './Strategy';

export class StrategyFactory {
  static createBetStrategy(config: BetStrategyConfig): BetStrategy {
    switch (config.name) {
      case 'OddsRange':
        return new OddsRangeStrategy(config);
      case 'DroppingOdds':
        return new DroppingOddsStrategy(config as any);
      case 'ValueBet':
        return new ValueBetStrategy(config as any);
      case 'DrawHunter':
        return new DrawHunterStrategy(config as any);
      case 'GoalMachine':
        return new GoalMachineStrategy(config as any);
      case 'TennisComeback':
        return new TennisComebackStrategy(config as any);
      case 'NBAUnderdogQ3':
        return new NBAUnderdogQ3Strategy(config as any);
      default:
        throw new Error(`Unknown Bet Strategy: ${config.name}`);
    }
  }

  static createMathStrategy(config: MathStrategyConfig): MathStrategy {
    switch (config.name) {
      case 'FlatStake':
        return new FlatStakeStrategy(config);
      case 'Martingale':
        return new MartingaleStrategy(config);
      case 'Kelly':
        return new KellyCriterionStrategy(config);
      default:
        throw new Error(`Unknown Math Strategy: ${config.name}`);
    }
  }
  
  static validateConfig(config: any): boolean {
    if (config.type === StrategyType.BET) {
        if (config.stake || config.progression) {
            throw new Error("Bet Strategy cannot have math parameters (stake/progression)");
        }
    }
    return true;
  }
}
