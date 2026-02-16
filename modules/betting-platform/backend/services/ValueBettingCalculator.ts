export interface ValueBet {
  market: string;
  selection: string;
  bookmakerOdds: number;
  trueOdds: number;
  valuePct: number;
  expectedValue: number;
  isValueBet: boolean;
}

export interface CalculateValueParams {
  bookmakerOdds: number;
  trueProbability: number;
  stake?: number;
}

export default class ValueBettingCalculator {
  private minValueThreshold: number;

  constructor(minValueThreshold: number = 0.05) {
    this.minValueThreshold = minValueThreshold;
  }

  public calculateValue(params: CalculateValueParams): ValueBet | null {
    const { bookmakerOdds, trueProbability, stake = 100 } = params;

    // Validate inputs
    if (bookmakerOdds <= 1 || trueProbability <= 0 || trueProbability > 1) {
      throw new Error('Invalid odds or probability');
    }

    // Calculate true odds from probability
    const trueOdds = 1 / trueProbability;

    // Calculate value percentage
    const valuePct = (bookmakerOdds / trueOdds) - 1;

    // Calculate expected value
    const expectedValue = (stake * bookmakerOdds * trueProbability) - stake;

    // Determine if it's a value bet
    const isValueBet = valuePct >= this.minValueThreshold;

    if (!isValueBet) {
      return null;
    }

    return {
      market: 'unknown',
      selection: 'unknown',
      bookmakerOdds,
      trueOdds,
      valuePct,
      expectedValue,
      isValueBet
    };
  }

  public findValueBets(
    opportunities: Array<{ odds: number; probability: number; market: string; selection: string }>
  ): ValueBet[] {
    return opportunities
      .map(opp => {
        const result = this.calculateValue({
          bookmakerOdds: opp.odds,
          trueProbability: opp.probability
        });

        if (result) {
          return {
            ...result,
            market: opp.market,
            selection: opp.selection
          };
        }
        return null;
      })
      .filter((bet): bet is ValueBet => bet !== null)
      .sort((a, b) => b.valuePct - a.valuePct);
  }

  public setMinValueThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }
    this.minValueThreshold = threshold;
  }
}