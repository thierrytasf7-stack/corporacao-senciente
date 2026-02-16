import { OddsPollingService } from './odds-polling.service';
import { ArbitrageDetector } from './arbitrage-detector';

export interface OddsData {
  eventId: string;
  marketId: string;
  provider: 'betfair' | 'pinnacle';
  homePrice: number;
  drawPrice?: number;
  awayPrice: number;
  homeHandicap?: number;
  awayHandicap?: number;
  totalPoints?: number;
  overPrice?: number;
  underPrice?: number;
  timestamp: Date;
}

export interface ArbitrageOpportunity {
  eventId: string;
  marketId: string;
  providers: {
    provider: 'betfair' | 'pinnacle';
    homePrice: number;
    drawPrice?: number;
    awayPrice: number;
  }[];
  arbitragePercentage: number;
  timestamp: Date;
}

export class ArbitrageDetector {
  private readonly arbitrageThreshold = 0.02; // 2%

  detectArbitrage(oddsData: OddsData[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const groupedByMarket = this.groupByMarket(oddsData);

    for (const [marketId, marketOdds] of Object.entries(groupedByMarket)) {
      const arbitrage = this.calculateArbitrage(marketOdds);
      
      if (arbitrage && arbitrage.arbitragePercentage > this.arbitrageThreshold) {
        opportunities.push(arbitrage);
      }
    }

    return opportunities;
  }

  private groupByMarket(oddsData: OddsData[]): Record<string, OddsData[]> {
    return oddsData.reduce((acc, odds) => {
      if (!acc[odds.marketId]) {
        acc[odds.marketId] = [];
      }
      acc[odds.marketId].push(odds);
      return acc;
    }, {} as Record<string, OddsData[]>);
  }

  private calculateArbitrage(marketOdds: OddsData[]): ArbitrageOpportunity | null {
    if (marketOdds.length < 2) {
      return null;
    }

    const homePrices = marketOdds.filter(o => o.homePrice > 0).map(o => o.homePrice);
    const awayPrices = marketOdds.filter(o => o.awayPrice > 0).map(o => o.awayPrice);

    if (homePrices.length < 2 || awayPrices.length < 2) {
      return null;
    }

    const minHomePrice = Math.min(...homePrices);
    const minAwayPrice = Math.min(...awayPrices);

    const arbitragePercentage = 1 - (1 / minHomePrice + 1 / minAwayPrice);

    if (arbitragePercentage > this.arbitrageThreshold) {
      const providers = marketOdds.filter(o => 
        o.homePrice === minHomePrice || o.awayPrice === minAwayPrice
      ).map(o => ({
        provider: o.provider,
        homePrice: o.homePrice,
        awayPrice: o.awayPrice
      }));

      return {
        eventId: marketOdds[0].eventId,
        marketId: marketOdds[0].marketId,
        providers,
        arbitragePercentage,
        timestamp: new Date()
      };
    }

    return null;
  }
}

export const createArbitrageDetector = (): ArbitrageDetector => {
  return new ArbitrageDetector();
};