export interface KellyResult {
  kellyPct: number;
  fractionalKelly: number;
  recommendedStake: number;
  expectedGrowth: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface KellyParams {
  bankroll: number;
  odds: number;
  probability: number;
  kellyFraction?: number;
}

export default class KellyCalculator {
  private defaultKellyFraction: number;

  constructor(kellyFraction: number = 0.25) {
    if (kellyFraction <= 0 || kellyFraction > 1) {
      throw new Error('Kelly fraction must be between 0 and 1');
    }
    this.defaultKellyFraction = kellyFraction;
  }

  public calculate(params: KellyParams): KellyResult {
    const { bankroll, odds, probability, kellyFraction = this.defaultKellyFraction } = params;

    // Validate inputs
    if (bankroll <= 0) {
      throw new Error('Bankroll must be positive');
    }
    if (odds <= 1) {
      throw new Error('Odds must be greater than 1');
    }
    if (probability <= 0 || probability >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    // Kelly formula: f = (bp - q) / b
    // where:
    // f = fraction of bankroll to bet
    // b = decimal odds - 1
    // p = probability of winning
    // q = probability of losing (1 - p)
    const b = odds - 1;
    const p = probability;
    const q = 1 - p;

    const kellyPct = (b * p - q) / b;

    // Apply fractional Kelly
    const fractionalKelly = kellyPct * kellyFraction;

    // Calculate recommended stake
    const recommendedStake = Math.max(0, bankroll * fractionalKelly);

    // Calculate expected growth rate
    const expectedGrowth = p * Math.log(1 + b * fractionalKelly) + q * Math.log(1 - fractionalKelly);

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    if (fractionalKelly < 0.05) {
      riskLevel = 'LOW';
    } else if (fractionalKelly < 0.15) {
      riskLevel = 'MEDIUM';
    } else if (fractionalKelly < 0.30) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'EXTREME';
    }

    return {
      kellyPct,
      fractionalKelly,
      recommendedStake,
      expectedGrowth,
      riskLevel
    };
  }

  public batchCalculate(opportunities: Array<KellyParams>): KellyResult[] {
    return opportunities.map(params => this.calculate(params));
  }

  public setDefaultKellyFraction(fraction: number): void {
    if (fraction <= 0 || fraction > 1) {
      throw new Error('Kelly fraction must be between 0 and 1');
    }
    this.defaultKellyFraction = fraction;
  }
}