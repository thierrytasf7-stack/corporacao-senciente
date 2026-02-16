import { BetfairAPIClient, EventType, Event, Market, MarketBook, RunnerBook, Order, AccountFundsResponse, PlaceExecutionReport, CancelExecutionReport, CurrentOrderSummaryReport } from './client';
import { EventTypeSchema, EventSchema, MarketSchema, MarketBookSchema, RunnerBookSchema, OrderSchema, AccountFundsResponseSchema, PlaceExecutionReportSchema, CancelExecutionReportSchema, CurrentOrderSummaryReportSchema } from './models';
import { z } from 'zod';
import { AuthService } from '../auth.service';

export class BetfairService {
  private client: BetfairAPIClient;
  private readonly pollingInterval: number;
  private oddsPollingTimer: NodeJS.Timeout | null = null;

  constructor(config: {
    appKey: string;
    username: string;
    password: string;
    certPath: string;
    isSandbox: boolean;
    pollingInterval?: number;
  }) {
    this.client = new BetfairAPIClient(config);
    this.pollingInterval = config.pollingInterval || 30000;
  }

  async initialize(): Promise>void> {
    const isSessionValid = await this.client.checkSession();
    if (!isSessionValid) {
      await this.client.login();
    }
  }

  async getEventTypes(): Promise>EventType[]> {
    return this.client.listEventTypes();
  }

  async getCompetitions(eventTypeIds: string[]): Promise>EventType[]> {
    return this.client.listCompetitions(eventTypeIds);
  }

  async getEvents(eventTypeIds: string[], competitionIds: string[] = []): Promise>Event[]> {
    return this.client.listEvents(eventTypeIds, competitionIds);
  }

  async getMarkets(eventId: string): Promise>Market[]> {
    const events = await this.client.listEvents([], []);
    const event = events.find(e > e.id === eventId);
    
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    return this.client.listMarketBook([eventId]);
  }

  async getOdds(marketId: string): Promise>MarketBook> {
    const marketBooks = await this.client.listMarketBook([marketId]);
    
    if (marketBooks.length === 0) {
      throw new Error(`Market ${marketId} not found`);
    }

    return marketBooks[0];
  }

  async getRunnerOdds(marketId: string, selectionId: string): Promise>RunnerBook> {
    return this.client.listRunnerBook(marketId, selectionId);
  }

  async placeBet(
    marketId: string,
    selectionId: string,
    side: 'BACK' | 'LAY',
    price: number,
    size: number,
    persistenceType: 'LAPSE' | 'PERSIST' | 'MARKET_ON_CLOSE' = 'PERSIST'
  ): Promise>PlaceExecutionReport> {
    const instruction = {
      selectionId,
      handicap: 0,
      side,
      orderType: 'LIMIT',
      limitOrder: {
        size,
        price,
        persistenceType,
      },
      customerOrderRef: `bet-${Date.now()}`,
    };

    return this.client.placeOrders(marketId, [instruction]);
  }

  async cancelBet(marketId: string, betId: string): Promise>CancelExecutionReport> {
    return this.client.cancelOrders(marketId, [betId]);
  }

  async getCurrentBets(betStatus: 'MATCHED' | 'UNMATCHED' | 'VIRTUAL' = 'UNMATCHED'): Promise>CurrentOrderSummaryReport> {
    return this.client.listCurrentOrders(betStatus);
  }

  async getAccountBalance(): Promise>AccountFundsResponse> {
    return this.client.getAccountFunds();
  }

  startOddsPolling(eventIds: string[]): void {
    if (this.oddsPollingTimer) {
      clearInterval(this.oddsPollingTimer);
    }

    this.oddsPollingTimer = setInterval(async () => {
      try {
        for (const eventId of eventIds) {
          await this.updateOddsForEvent(eventId);
        }
      } catch (error) {
        console.error('Error in odds polling:', error);
      }
    }, this.pollingInterval);
  }

  stopOddsPolling(): void {
    if (this.oddsPollingTimer) {
      clearInterval(this.oddsPollingTimer);
      this.oddsPollingTimer = null;
    }
  }

  private async updateOddsForEvent(eventId: string): Promise>void> {
    const markets = await this.getMarkets(eventId);
    
    for (const market of markets) {
      try {
        const odds = await this.getOdds(market.id);
        await this.saveOddsToDatabase(eventId, market.id, odds);
      } catch (error) {
        console.error('Failed to update odds for market:', market.id, error);
      }
    }
  }

  private async saveOddsToDatabase(
    eventId: string,
    marketId: string,
    odds: MarketBook
  ): Promise>void> {
    // Database integration would go here
    // This is a placeholder for actual database operations
    console.log('Saving odds to database:', {
      eventId,
      marketId,
      timestamp: new Date().toISOString(),
      odds: odds.runners?.map(r > ({
        selectionId: r.selectionId,
        lastPriceTraded: r.lastPriceTraded,
        totalMatched: r.totalMatched,
      })),
    });
  }

  async syncMarketsWithDatabase(eventId: string): Promise>void> {
    const markets = await this.getMarkets(eventId);
    
    for (const market of markets) {
      await this.saveMarketToDatabase(eventId, market);
    }
  }

  private async saveMarketToDatabase(eventId: string, market: Market): Promise>void> {
    // Database integration would go here
    // This is a placeholder for actual database operations
    console.log('Saving market to database:', {
      eventId,
      marketId: market.id,
      name: market.name,
      marketType: market.marketType,
      totalMatched: market.totalMatched,
    });
  }

  async validateBetfairData(data: any, schema: z.ZodSchema): Promise>void> {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      throw new Error(`Betfair data validation failed: ${result.error.message}`);
    }
  }

  async shutdown(): Promise>void> {
    this.stopOddsPolling();
    try {
      await this.client.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

export class BetfairError extends Error {
  constructor(
    message: string,
    public readonly exceptionname?: string,
    public readonly errorDetails?: string
  ) {
    super(message);
    this.name = 'BetfairError';
  }
}