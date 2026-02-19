import { calculateKellyCriterion } from '../utils/strategy-utils';

export default class KellyCalculator {
  private fraction: number;

  constructor(fraction: number = 0.25) {
    this.fraction = fraction;
  }

  calculate(input: {
    bankroll: number;
    odds: number;
    probability: number;
  }): {
    stake: number;
    expectedGrowth: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
  } {
    const kelly = calculateKellyCriterion(input.bankroll, input.odds, input.probability);
    const stake = input.bankroll * kelly * this.fraction;
    const expectedGrowth = this.calculateExpectedGrowth(input.odds, input.probability);
    const riskLevel = this.getRiskLevel(kelly);
    const confidence = this.calculateConfidence(input.odds, input.probability);

    return {
      stake,
      expectedGrowth,
      riskLevel,
      confidence
    };
  }

  private calculateExpectedGrowth(odds: number, probability: number): number {
    const winGrowth = probability * Math.log(1 + (odds - 1) * this.fraction);
    const lossGrowth = (1 - probability) * Math.log(1 - this.fraction);
    return winGrowth + lossGrowth;
  }

  private getRiskLevel(kelly: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (kelly <= 0.1) return 'LOW';
    if (kelly <= 0.2) return 'MEDIUM';
    return 'HIGH';
  }

  private calculateConfidence(odds: number, probability: number): number {
    const edge = (probability * (odds - 1)) - (1 - probability);
    return Math.min(1, Math.max(0.1, edge * 2));
  }

  getFraction(): number {
    return this.fraction;
  }

  setFraction(fraction: number): void {
    this.fraction = Math.min(1, Math.max(0, fraction));
  }
}
