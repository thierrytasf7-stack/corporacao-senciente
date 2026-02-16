import { z } from 'zod';
import { t } from 'typy';
import { PrismaClient } from '@prisma/client';
import { arbitrageDetection } from './arbitrage';

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

export class OddsPollingService {
  private betfairService: any;
  private pinnacleService: any;
  private prisma: PrismaClient;
  private pollingInterval: number;
  private pollingTimer: NodeJS.Timeout | null = null;
  private isPolling = false;

  constructor(config: {
    betfairService: any;
    pinnacleService: any;
    prisma: PrismaClient;
    pollingInterval?: number;
  }) {
    this.betfairService = config.betfairService;
    this.pinnacleService = config.pinnacleService;
    this.prisma = config.prisma;
    this.pollingInterval = config.pollingInterval || 30000;
  }

  async initialize(): Promise<void> {
    await this.betfairService.initialize();
    await this.pinnacleService.initialize();
  }

  async startPolling(eventIds: string[]): Promise<void> {
    if (this.isPolling) {
      console.log('Odds polling already running');
      return;
    }

    this.isPolling = true;
    
    const poll = async () => {
      try {
        await this.pollProviders(eventIds);
      } catch (error) {
        console.error('Error in odds polling:', error);
      }
    };

    // Initial poll
    await poll();

    // Set up interval
    this.pollingTimer = setInterval(poll, this.pollingInterval);
  }

  stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPolling = false;
  }

  private async pollProviders(eventIds: string[]): Promise<void> {
    const promises = eventIds.map(eventId => this.pollEvent(eventId));
    await Promise.all(promises);
  }

  private async pollEvent(eventId: string): Promise<void> {
    const [betfairOdds, pinnacleOdds] = await Promise.all([
      this.fetchBetfairOdds(eventId),
      this.fetchPinnacleOdds(eventId)
    ]);

    const allOdds = [...betfairOdds, ...pinnacleOdds];
    
    if (allOdds.length > 0) {
      await this.saveOddsToDatabase(allOdds);
      await this.detectArbitrageOpportunities(allOdds);
    }
  }

  private async fetchBetfairOdds(eventId: string): Promise<OddsData[]> {
    try {
      const markets = await this.betfairService.getMarkets(eventId);
      const oddsData: OddsData[] = [];

      for (const market of markets) {
        try {
          const odds = await this.betfairService.getOdds(market.id);
          
          if (odds.runners && odds.runners.length >= 2) {
            const homeRunner = odds.runners.find(r => r.selectionId === market.runners[0]?.selectionId);
            const awayRunner = odds.runners.find(r => r.selectionId === market.runners[1]?.selectionId);
            
            if (homeRunner && awayRunner) {
              oddsData.push({
                eventId,
                marketId: market.id,
                provider: 'betfair',
                homePrice: homeRunner.lastPriceTraded || 0,
                awayPrice: awayRunner.lastPriceTraded || 0,
                timestamp: new Date(odds.lastMatchTime || Date.now()),
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch Betfair odds for market ${market.id}:`, error);
        }
      }

      return oddsData;
    } catch (error) {
      console.error(`Failed to fetch Betfair odds for event ${eventId}:`, error);
      return [];
    }
  }

  private async fetchPinnacleOdds(eventId: string): Promise<OddsData[]> {
    try {
      // Pinnacle uses fixtureId instead of eventId
      // This is a placeholder - actual implementation would need mapping
      const odds = await this.pinnacleService.getOdds('soccer'); // Replace with actual fixtureId mapping
      
      return odds.map(odd => ({
        eventId,
        marketId: odd.fixtureId || 'unknown',
        provider: 'pinnacle',
        homePrice: odd.homePrice || 0,
        awayPrice: odd.awayPrice || 0,
        timestamp: new Date(odd.lastUpdated || Date.now()),
      }));
    } catch (error) {
      console.error(`Failed to fetch Pinnacle odds for event ${eventId}:`, error);
      return [];
    }
  }

  private async saveOddsToDatabase(oddsData: OddsData[]): Promise<void> {
    try {
      const batch: Parameters<PrismaClient['oddsHistory']['createMany']>['0']['data'] = [];

      for (const odds of oddsData) {
        batch.push({
          eventId: odds.eventId,
          marketId: odds.marketId,
          bettingAccountId: this.getBettingAccountId(odds.provider),
          homePrice: odds.homePrice,
          awayPrice: odds.awayPrice,
          drawPrice: odds.drawPrice,
          homeHandicap: odds.homeHandicap,
          awayHandicap: odds.awayHandicap,
          totalPoints: odds.totalPoints,
          overPrice: odds.overPrice,
          underPrice: odds.underPrice,
          timestamp: odds.timestamp,
        });
      }

      if (batch.length > 0) {
        await this.prisma.oddsHistory.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error('Failed to save odds to database:', error);
    }
  }

  private getBettingAccountId(provider: 'betfair' | 'pinnacle'): string {
    const providerName = provider === 'betfair' ? 'betfair' : 'pinnacle';
    
    // This should be replaced with actual account lookup
    // For now, return a placeholder UUID
    return `betting_account_${providerName}`;
  }

  private async detectArbitrageOpportunities(oddsData: OddsData[]): Promise<void> {
    try {
      const arbitrageOpportunities = arbitrageDetection(oddsData);
      
      if (arbitrageOpportunities.length > 0) {
        console.log(`Found ${arbitrageOpportunities.length} arbitrage opportunities`);
        
        // Save arbitrage opportunities to database
        for (const opportunity of arbitrageOpportunities) {
          await this.prisma.arbitrageOpportunity.create({
            data: {
              eventId: opportunity.eventId,
              marketId: opportunity.marketId,
              provider1: opportunity.provider1,
              provider2: opportunity.provider2,
              profitMargin: opportunity.profitMargin,
              timestamp: new Date(),
            },
          });
        }
      }
    } catch (error) {
      console.error('Error detecting arbitrage opportunities:', error);
    }
  }

  async shutdown(): Promise<void> {
    this.stopPolling();
  }
}

// Arbitrage detection function
export function arbitrageDetection(oddsData: OddsData[]): Array<{
  eventId: string;
  marketId: string;
  provider1: 'betfair' | 'pinnacle';
  provider2: 'betfair' | 'pinnacle';
  profitMargin: number;
}> {
  const opportunities: Array<{
    eventId: string;
    marketId: string;
    provider1: 'betfair' | 'pinnacle';
    provider2: 'betfair' | 'pinnacle';
    profitMargin: number;
  }> = [];

  const groupedByEventMarket = oddsData.reduce((acc, odds) => {
    const key = `${odds.eventId}_${odds.marketId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(odds);
    return acc;
  }, {} as Record<string, OddsData[]>);

  for (const [key, oddsList] of Object.entries(groupedByEventMarket)) {
    if (oddsList.length < 2) continue;

    // Find best odds from different providers
    const betfairOdds = oddsList.find(o => o.provider === 'betfair');
    const pinnacleOdds = oddsList.find(o => o.provider === 'pinnacle');

    if (betfairOdds && pinnacleOdds) {
      // Simple arbitrage detection for 1X2 markets
      const homeArbitrage = 1 / betfairOdds.homePrice + 1 / pinnacleOdds.awayPrice;
      const awayArbitrage = 1 / betfairOdds.awayPrice + 1 / pinnacleOdds.homePrice;

      if (homeArbitrage < 1) {
        opportunities.push({
          eventId: betfairOdds.eventId,
          marketId: betfairOdds.marketId,
          provider1: 'betfair',
          provider2: 'pinnacle',
          profitMargin: (1 - homeArbitrage) * 100,
        });
      }

      if (awayArbitrage < 1) {
        opportunities.push({
          eventId: betfairOdds.eventId,
          marketId: betfairOdds.marketId,
          provider1: 'betfair',
          provider2: 'pinnacle',
          profitMargin: (1 - awayArbitrage) * 100,
        });
      }
    }
  }

  return opportunities.filter(opportunity => opportunity.profitMargin > 2);
}

// Export for testing
export { OddsData };