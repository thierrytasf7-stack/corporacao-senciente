import { Strategy, StrategyResult, Bankroll } from '../types/strategy-types';
import { calculateValueBet } from '../utils/strategy-utils';

export default class ValueBettingCalculator {
  private threshold: number;

  constructor(threshold: number = 0.05) {
    this.threshold = threshold;
  }

  calculateValue(input: {
    bookmakerOdds: number;
    trueProbability: number;
  }): { expectedValue: number; edge: number } | null {
    return calculateValueBet(input.bookmakerOdds, input.trueProbability);
  }

  calculateExpectedValue(
    bookmakerOdds: number,
    trueProbability: number
  ): number {
    const valueBet = this.calculateValue({ bookmakerOdds, trueProbability });
    return valueBet ? valueBet.expectedValue : 0;
  }

  isValueBet(
    bookmakerOdds: number,
    trueProbability: number
  ): boolean {
    const valueBet = this.calculateValue({ bookmakerOdds, trueProbability });
    return valueBet !== null && valueBet.edge >= this.threshold;
  }

  calculateOptimalStake(
    bankroll: Bankroll,
    bookmakerOdds: number,
    trueProbability: number
  ): number {
    const valueBet = this.calculateValue({ bookmakerOdds, trueProbability });
    if (!valueBet) return 0;

    const kelly = valueBet.edge / (bookmakerOdds - 1);
    return bankroll.available * Math.min(0.05, kelly);
  }
}
