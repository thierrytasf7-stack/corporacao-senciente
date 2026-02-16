export interface ArbitrageOpportunity {
  market: string;
  profit: number;
  profitPct: number;
  bookmakers: Array<{
    name: string;
    selection: string;
    odds: number;
    stake: number;
  }>;
  totalStake: number;
  isArbitrage: boolean;
}

export interface Odds {
  bookmaker: string;
  selection: string;
  odds: number;
}

export default class ArbitrageDetector {
  private minProfitThreshold: number;

  constructor(minProfitThreshold: number = 0.01) {
    this.minProfitThreshold = minProfitThreshold;
  }

  public detectArbitrage(oddsSet: Odds[][]): ArbitrageOpportunity | null {
    if (oddsSet.length < 2) {
      return null;
    }

    // Find best odds for each outcome
    const bestOdds = oddsSet.map(outcomeOdds => 
      outcomeOdds.reduce((best, current) => 
        current.odds > best.odds ? current : best
      )
    );

    // Calculate inverse sum (arbitrage formula)
    const inverseSum = bestOdds.reduce((sum, odd) => sum + (1 / odd.odds), 0);

    // Check if arbitrage exists (inverse sum < 1)
    if (inverseSum >= 1) {
      return null;
    }

    // Calculate profit percentage
    const profitPct = (1 / inverseSum) - 1;

    if (profitPct < this.minProfitThreshold) {
      return null;
    }

    // Calculate stakes for £100 total investment
    const totalStake = 100;
    const bookmakers = bestOdds.map(odd => ({
      name: odd.bookmaker,
      selection: odd.selection,
      odds: odd.odds,
      stake: (totalStake / inverseSum) * (1 / odd.odds)
    }));

    const profit = totalStake * profitPct;

    return {
      market: 'unknown',
      profit,
      profitPct,
      bookmakers,
      totalStake,
      isArbitrage: true
    };
  }

  public scanMarkets(markets: Array<{ market: string; odds: Odds[][] }>): ArbitrageOpportunity[] {
    return markets
      .map(m => {
        const opportunity = this.detectArbitrage(m.odds);
        if (opportunity) {
          return { ...opportunity, market: m.market };
        }
        return null;
      })
      .filter((opp): opp is ArbitrageOpportunity => opp !== null)
      .sort((a, b) => b.profitPct - a.profitPct);
  }

  public setMinProfitThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }
    this.minProfitThreshold = threshold;
  }
}