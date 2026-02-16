import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { v4 as uuidv4 } from 'uuid';

export interface BetfairCredentials {
  appKey: string;
  username: string;
  password: string;
  certFile: string;
  keyFile: string;
}

export interface BetfairToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface Market {
  marketId: string;
  marketName: string;
  marketType: string;
  marketStartTime: string;
  runners: Runner[];
  totalMatched: number;
}

export interface Runner {
  selectionId: number;
  runnerName: string;
  status: string;
  lastPriceTraded?: number;
  ex: ExchangePrices;
}

export interface ExchangePrices {
  availableToBack: PriceSize[];
  availableToLay: PriceSize[];
  tradedVolume: PriceSize[];
}

export interface PriceSize {
  price: number;
  size: number;
}

export interface Odds {
  marketId: string;
  selectionId: number;
  runnerName: string;
  backPrice: number;
  backSize: number;
  layPrice: number;
  laySize: number;
  lastTradedPrice?: number;
}

export interface Event {
  eventId: string;
  eventName: string;
  competition: string;
  startTime: string;
  markets: Market[];
}

export interface BetfairError {
  error: string;
  requestUUID: string;
  statusCode: number;
}

export interface PlaceBetRequest {
  marketId: string;
  selectionId: number;
  side: 'BACK' | 'LAY';
  price: number;
  size: number;
}

export interface CancelBetRequest {
  marketId: string;
  betId?: string;
}

export interface MarketFilter {
  eventTypeIds?: string[];
  competitionIds?: string[];
  eventIds?: string[];
  marketIds?: string[];
  venues?: string[];
  bspOnly?: boolean;
  inPlayOnly?: boolean;
  marketBettingTypes?: string[];
  marketCountries?: string[];
  marketTypeCodes?: string[];
  marketStartTime?: TimeRange;
  withOrders?: string[];
}

export interface TimeRange {
  from: string;
  to: string;
}

export interface PriceProjection {
  priceData?: string[];
  virtualise?: boolean;
  rolloverStakes?: boolean;
}

export interface OrderProjection {
  orderProjection?: string;
}

export interface MatchProjection {
  matchProjection?: string;
}

export interface Order {
  betId: string;
  orderId: string;
  customerOrderRef: string;
  customerStrategyRef: string;
  status: string;
  persistenceType: string;
  side: string;
  orderType: string;
  price: number;
  size: number;
  bspLiability: number;
  placedDate: string;
  avgPriceMatched: number;
  sizeMatched: number;
  sizeRemaining: number;
  sizeLapsed: number;
  sizeCancelled: number;
  sizeVoided: number;
  regulatorCode: string;
  regulatoryAuthCode: string;
  strategyRef: string;
}

export interface AccountDetails {
  currencyCode: string;
  firstName: string;
  lastName: string;
  localeCode: string;
  region: string;
  timezone: string;
  discountRate: number;
  pointsBalance: number;
  countryCode: string;
}

export interface AccountFunds {
  availableToBetBalance: number;
  exposure: number;
  retainedCommission: number;
  exposureLimit: number;
  discountRate: number;
  pointsBalance: number;
  wallet: string;
  currencyCode: string;
  fundsTimestamp: string;
  balance: number;
}

export class BetfairClient {
  private readonly api: AxiosInstance;
  private readonly authApi: AxiosInstance;
  private readonly rateLimiter: RateLimiterMemory;
  private token: BetfairToken | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private credentials: BetfairCredentials) {
    this.api = axios.create({
      baseURL: 'https://api.betfair.com/exchange/betting/rest/v1.0',
      timeout: 10000,
      headers: {
        'X-Application': credentials.appKey,
        'Content-Type': 'application/json',
      },
    });

    this.authApi = axios.create({
      baseURL: 'https://identitysso-cert.betfair.com/api/',
      timeout: 10000,
      headers: {
        'X-Application': credentials.appKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      httpsAgent: this.createSecureAgent(),
    });

    this.rateLimiter = new RateLimiterMemory({
      points: 60,
      duration: 60,
    });

    this.api.interceptors.request.use(
      (config) => this.addAuthHeader(config),
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          error.config.headers['X-Authentication'] = this.token?.access_token;
          return this.api.request(error.config);
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private createSecureAgent() {
    const https = require('https');
    const fs = require('fs');
    
    return new https.Agent({
      cert: fs.readFileSync(this.credentials.certFile),
      key: fs.readFileSync(this.credentials.keyFile),
      rejectUnauthorized: true,
    });
  }

  private async addAuthHeader(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (!this.token || Date.now() > this.tokenExpiresAt) {
      await this.refreshToken();
    }
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Authentication': this.token?.access_token,
      },
    };
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await this.authApi.post('login', `username=${this.credentials.username}&password=${this.credentials.password}`, {
        httpsAgent: this.createSecureAgent(),
      });

      this.token = response.data;
      this.tokenExpiresAt = Date.now() + (this.token.expires_in - 60) * 1000;
    } catch (error) {
      throw new Error(`Failed to refresh Betfair token: ${error}`);
    }
  }

  private async enforceRateLimit(): Promise<void> {
    try {
      await this.rateLimiter.consume(uuidv4());
    } catch (rejRes) {
      const retrySeconds = Math.round(rejRes.msBeforeNext / 1000) || 1;
      throw new Error(`Rate limit exceeded. Retry after ${retrySeconds} seconds.`);
    }
  }

  private handleError(error: any): BetfairError {
    const requestUUID = error.config?.headers?.['X-Request-Id'] || uuidv4();
    
    return {
      error: error.response?.data?.error || error.message,
      requestUUID,
      statusCode: error.response?.status || 500,
    };
  }

  async getOdds(marketIds: string[]): Promise<Odds[]> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/listMarketBook/', {
        marketIds,
        priceProjection: {
          priceData: ['EX_BEST_OFFERS', 'EX_TRADED'],
        },
      });

      return this.parseOddsResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMarkets(eventTypeIds: string[], competitionIds?: string[]): Promise<Market[]> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/listMarketCatalogue/', {
        filter: {
          eventTypeIds,
          competitionIds,
          inPlayOnly: false,
          marketBettingTypes: ['ODDS'],
        },
        maxResults: 100,
        marketProjection: [
          'MARKET_START_TIME',
          'RUNNER_DESCRIPTION',
          'RUNNER_METADATA',
        ],
      });

      return this.parseMarketsResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listEvents(eventTypeIds: string[], competitionIds?: string[]): Promise<Event[]> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/listEvents/', {
        filter: {
          eventTypeIds,
          competitionIds,
          marketCountries: ['GB', 'US', 'AU'],
          inPlayOnly: false,
        },
        maxResults: 50,
      });

      return this.parseEventsResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async placeBet(marketId: string, selectionId: number, side: 'BACK' | 'LAY', price: number, size: number): Promise<any> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/placeOrders/', {
        marketId,
        instructions: [{
          selectionId,
          handicap: 0,
          side,
          orderType: 'LIMIT',
          limitOrder: {
            price,
            size,
            persistenceType: 'PERSIST',
          },
        }],
        customerRef: uuidv4(),
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelAllOrders(marketId: string): Promise<any> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/cancelOrders/', {
        marketId,
        instructions: [{
          betIds: [],
          sizeReduction: null,
        }],
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAccountDetails(): Promise<AccountDetails> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/getAccountDetails/', {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAccountFunds(): Promise<AccountFunds> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/getAccountFunds/', {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMarketBook(marketId: string): Promise<any> {
    await this.enforceRateLimit();
    
    try {
      const response = await this.api.post('/listMarketBook/', {
        marketIds: [marketId],
        priceProjection: {
          priceData: ['EX_BEST_OFFERS', 'EX_TRADED', 'EX_ALL_OFFERS'],
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private parseOddsResponse(data: any): Odds[] {
    return data.map((market: any) => ({
      marketId: market.marketId,
      selectionId: market.runners[0].selectionId,
      runnerName: market.runners[0].runnerName,
      backPrice: market.runners[0].ex.availableToBack[0]?.price || 0,
      backSize: market.runners[0].ex.availableToBack[0]?.size || 0,
      layPrice: market.runners[0].ex.availableToLay[0]?.price || 0,
      laySize: market.runners[0].ex.availableToLay[0]?.size || 0,
      lastTradedPrice: market.runners[0].lastPriceTraded,
    }));
  }

  private parseMarketsResponse(data: any): Market[] {
    return data.map((market: any) => ({
      marketId: market.marketId,
      marketName: market.marketName,
      marketType: market.marketType,
      marketStartTime: market.marketStartTime,
      runners: market.runners?.map((runner: any) => ({
        selectionId: runner.selectionId,
        runnerName: runner.runnerName,
        status: runner.status,
        ex: runner.ex || { availableToBack: [], availableToLay: [], tradedVolume: [] },
      })) || [],
      totalMatched: market.totalMatched || 0,
    }));
  }

  private parseEventsResponse(data: any): Event[] {
    return data.map((event: any) => ({
      eventId: event.event.id,
      eventName: event.event.name,
      competition: event.competition?.name || '',
      startTime: event.event.openDate,
      markets: event.marketCount || 0,
    }));
  }
}

export { BetfairClient };