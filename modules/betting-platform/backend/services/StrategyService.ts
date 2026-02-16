import ValueBettingCalculator from './ValueBettingCalculator';
import ArbitrageDetector from './ArbitrageDetector';
import KellyCalculator from './KellyCalculator';
import { Strategy, StrategyResult, Bankroll } from '../types/strategy-types';
import { calculateRecommendedStake } from '../utils/strategy-utils';

export default class StrategyService {
  private valueBetting: ValueBettingCalculator;
  private arbitrage: ArbitrageDetector;
  private kelly: KellyCalculator;

  constructor() {
    this.valueBetting = new ValueBettingCalculator(0.05);
    this.arbitrage = new ArbitrageDetector(0.01);
    this.kelly = new KellyCalculator(0.25);
  }

  public executeStrategy(
    strategy: Strategy,
    bankroll: Bankroll,
    marketData: any
  ): StrategyResult | null {
    switch (strategy.type) {
      case 'VALUE_BETTING':
        return this.executeValueBetting(strategy, bankroll, marketData);
      case 'ARBITRAGE':
        return this.executeArbitrage(strategy, bankroll, marketData);
      case 'KELLY_CRITERION':
        return this.executeKellyCriterion(strategy, bankroll, marketData);
      case 'SURE_BETTING':
        return this.executeSureBetting(strategy, bankroll, marketData);
      default:
        return null;
    }
  }

  private executeValueBetting(
    strategy: Strategy,
    bankroll: Bankroll,
    marketData: any
  ): StrategyResult | null {
    const valueBet = this.valueBetting.calculateValue({
      bookmakerOdds: marketData.odds || 2.0,
      trueProbability: marketData.probability || 0.5
    });

    if (!valueBet) return null;

    const recommendedStake = calculateRecommendedStake(
      bankroll,
      'MEDIUM',
      0.75
    );

    return {
      strategyId: strategy.id,
      strategyType: 'VALUE_BETTING',
      timestamp: new Date(),
      profitPotential: valueBet.expectedValue,
      riskLevel: 'MEDIUM',
      recommendedStake,
      confidence: 0.75,
      metadata: { valueBet }
    };
  }

  private executeArbitrage(
    strategy: Strategy,
    bankroll: Bankroll,
    marketData: any
  ): StrategyResult | null {
    const opportunity = this.arbitrage.detectArbitrage(marketData.odds || []);

    if (!opportunity) return null;

    return {
      strategyId: strategy.id,
      strategyType: 'ARBITRAGE',
      timestamp: new Date(),
      profitPotential: opportunity.profit,
      riskLevel: 'LOW',
      recommendedStake: opportunity.totalStake,
      confidence: 0.95,
      metadata: { opportunity }
    };
  }

  private executeKellyCriterion(
    strategy: Strategy,
    bankroll: Bankroll,
    marketData: any
  ): StrategyResult | null {
    const kelly = this.kelly.calculate({
      bankroll: bankroll.available,
      odds: marketData.odds || 2.0,
      probability: marketData.probability || 0.5
    });

    return {
      strategyId: strategy.id,
      strategyType: 'KELLY_CRITERION',
      timestamp: new Date(),
      profitPotential: kelly.expectedGrowth * bankroll.available,
      riskLevel: kelly.riskLevel,
      recommendedStake: kelly.recommendedStake,
      confidence: 0.80,
      metadata: { kelly }
    };
  }

  private executeSureBetting(
    strategy: Strategy,
    bankroll: Bankroll,
    marketData: any
  ): StrategyResult | null {
    // Similar to arbitrage but with different thresholds
    return this.executeArbitrage(strategy, bankroll, marketData);
  }
}