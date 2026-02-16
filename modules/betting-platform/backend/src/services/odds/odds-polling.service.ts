import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { BetfairService } from '../services/betfair/service';
import { PinnacleService } from '../services/pinnacle/service';
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

export class OddsPollingService {
  private prisma: PrismaClient;
  private betfairService: BetfairService;
  private pinnacleService: PinnacleService;
  private arbitrageDetector: ArbitrageDetector;
  private pollingInterval: number;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(config: {
    prisma: PrismaClient;
    betfairService: BetfairService;
    pinnacleService: PinnacleService;
    pollingInterval?: number;
  }) {
    this.prisma = config.prisma;
    this.betfairService = config.betfairService;
    this.pinnacleService = config.pinnacleService;
    this.arbitrageDetector = new ArbitrageDetector();
    this.pollingInterval = config.pollingInterval || 30000;
  }

  async initialize(): Promise<void> {
    await this.betfairService.initialize();
    await this.pinnacleService.initialize();
  }

  async startPolling(eventIds: string[]): Promise<void> {
    if (this.pollingTimer) {
      this.stopPolling();
    }

    const poll = async () => {
      try {
        await this.pollProviders(eventIds);
      } catch (error) {
        console.error('Odds polling error:', error);
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
  }

  private async pollProviders(eventIds: string[]): Promise<void> {
    const betfairPromises = eventIds.map(eventId => this.pollBetfair(eventId));
    const pinnaclePromises = eventIds.map(eventId => this.pollPinnacle(eventId));

    const results = await Promise.allSettled([
      ...betfairPromises,
      ...pinnaclePromises
    ]);

    const oddsData: OddsData[] = [];
    const arbitrageOpportunities: ArbitrageOpportunity[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        oddsData.push(...result.value);
      }
    }

    if (oddsData.length > 0) {
      await this.saveOddsToDatabase(oddsData);
      
      const opportunities = this.arbitrageDetector.detectArbitrage(oddsData);
      if (opportunities.length > 0) {
        arbitrageOpportunities.push(...opportunities);
        await this.saveArbitrageOpportunities(arbitrageOpportunities);
      }
    }
  }

  private async pollBetfair(eventId: string): Promise<OddsData[]> {
    const markets = await this.betfairService.getMarkets(eventId);
    const oddsData: OddsData[] = [];

    for (const market of markets) {
      try {
        const marketBook = await this.betfairService.getOdds(market.id);
        
        if (marketBook.runners && marketBook.runners.length > 0) {
          const runnerOdds = marketBook.runners.map(runner => ({
            eventId,
            marketId: market.id,
            provider: 'betfair' as const,
            homePrice: runner.lastPriceTraded || 0,
            timestamp: new Date()
          }));
          
          oddsData.push(...runnerOdds);
        }
      } catch (error) {
        console.error(`Failed to poll Betfair for market ${eventId}:${market.id}:`, error);
      }
    }

    return oddsData;
  }

  private async pollPinnacle(eventId: string): Promise<OddsData[]> {
    // Pinnacle requires sportId and leagueId, so we need to map eventId to these
    // For simplicity, we'll assume eventId contains sportId_leagueId format
    const [sportId, leagueId] = eventId.split('_');
    const oddsData: OddsData[] = [];

    try {
      const odds = await this.pinnacleService.getOdds(sportId, leagueId);
      
      for (const odd of odds) {
        oddsData.push({
          eventId,
          marketId: odd.fixtureId,
          provider: 'pinnacle' as const,
          homePrice: odd.odds.home || 0,
          awayPrice: odd.odds.away || 0,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error(`Failed to poll Pinnacle for event ${eventId}:`, error);
    }

    return oddsData;
  }

  private async saveOddsToDatabase(oddsData: OddsData[]): Promise<void> {
    const batch: Parameters<PrismaClient['oddsHistory']['createMany']>['0'] = {
      data: oddsData.map(odds => ({
        eventId: odds.eventId,
        marketId: odds.marketId,
        bettingAccountId: this.getBettingAccountId(odds.provider),
        homePrice: odds.homePrice,
        awayPrice: odds.awayPrice,
        timestamp: odds.timestamp,
        _count: { 
          field: ['id'] 
        }
      }))
    };

    await this.prisma.oddsHistory.createMany(batch);
  }

  private async saveArbitrageOpportunities(opportunities: ArbitrageOpportunity[]): Promise<void> {
    const batch: Parameters<PrismaClient['arbitrageOpportunities']['createMany']>['0'] = {
      data: opportunities.map(opportunity => ({
        eventId: opportunity.eventId,
        marketId: opportunity.marketId,
        arbitragePercentage: opportunity.arbitragePercentage,
        timestamp: opportunity.timestamp,
        _count: { 
          field: ['id'] 
        }
      }))
    };

    await this.prisma.arbitrageOpportunities.createMany(batch);
  }

  private getBettingAccountId(provider: 'betfair' | 'pinnacle'): string {
    // In a real implementation, this would fetch the actual betting account ID
    // For now, we'll return a placeholder
    return provider === 'betfair' ? 'betfair-account-1' : 'pinnacle-account-1';
  }

  async getLiveOdds(eventId: string): Promise<OddsData[]> {
    const odds = await this.prisma.oddsHistory.findMany({
      where: { eventId },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    return odds;
  }

  async getOddsHistory(marketId: string): Promise<OddsData[]> {
    return this.prisma.oddsHistory.findMany({
      where: { marketId },
      orderBy: { timestamp: 'asc' }
    });
  }

  async getMarketMovements(marketId: string): Promise<any[]> {
    // This would calculate price movements based on odds history
    // For now, return a placeholder
    return [];
  }

  async getActiveArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    const opportunities = await this.prisma.arbitrageOpportunities.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return opportunities;
  }

  async shutdown(): Promise<void> {
    this.stopPolling();
    await this.betfairService.shutdown();
    await this.pinnacleService.destroy();
  }
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