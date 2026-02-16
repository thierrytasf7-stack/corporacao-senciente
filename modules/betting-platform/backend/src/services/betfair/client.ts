import { BetfairError, EventType, Event, Market, MarketBook, RunnerBook, Order, LoginResponse, AccountFundsResponse, PlaceExecutionReport, CancelExecutionReport, CurrentOrderSummaryReport } from './models';
import { z } from 'zod';

export class BetfairAPIClient {
  private readonly appKey: string;
  private readonly username: string;
  private readonly password: string;
  private readonly certPath: string;
  private readonly isSandbox: boolean;
  private sessionToken: string | null = null;
  private lastLogin: Date | null = null;
  private readonly rateLimit: { remaining: number; resetTime: Date } = { remaining: 1200, resetTime: new Date() };

  constructor(config: {
    appKey: string;
    username: string;
    password: string;
    certPath: string;
    isSandbox: boolean;
  }) {
    this.appKey = config.appKey;
    this.username = config.username;
    this.password = config.password;
    this.certPath = config.certPath;
    this.isSandbox = config.isSandbox;
  }

  private async request<T>(
    operation: string,
    params: any = {},
    isLogin = false
  ): Promise<T> {
    try {
      await this.checkRateLimit();
      
      const url = this.isSandbox
        ? 'https://api.betfair.com/exchange/betting/rest/v1.0/'
        : 'https://api.betfair.com/exchange/betting/rest/v1.0/';

      const headers: HeadersInit = {
        'X-Authentication': this.sessionToken || '',
        'X-Application': this.appKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (isLogin) {
        delete headers['X-Authentication'];
      }

      const response = await fetch(url + operation, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: operation,
          params,
          id: 1,
        }),
        agent: this.createAgent(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new BetfairError(data.error, data.exceptionname, data.errorDetails);
      }

      return data.result;
    } catch (error) {
      if (error instanceof BetfairError && error.error === 'INVALID_SESSION_INFORMATION') {
        await this.login();
        return this.request(operation, params, isLogin);
      }
      throw error;
    }
  }

  private createAgent() {
    const https = require('https');
    const fs = require('fs');
    
    const agentOptions = {
      cert: fs.readFileSync(this.certPath),
      key: fs.readFileSync(this.certPath),
      passphrase: this.password,
      rejectUnauthorized: true,
    };

    return new https.Agent(agentOptions);
  }

  private async checkRateLimit() {
    const now = new Date();
    if (now < this.rateLimit.resetTime) {
      if (this.rateLimit.remaining <= 0) {
        const waitTime = this.rateLimit.resetTime.getTime() - now.getTime();
        if (waitTime > 0) {
          await new Promise(resolve > setTimeout(resolve, waitTime));
        }
      }
    } else {
      this.rateLimit.remaining = 1200;
      this.rateLimit.resetTime = new Date(now.getTime() + 60 * 1000);
    }
    this.rateLimit.remaining--;
  }

  async login(): Promise>LoginResponse> {
    const url = this.isSandbox
      ? 'https://identitysso.betfair.com/api/login'
      : 'https://identitysso.betfair.com/api/login';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Application': this.appKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`,
      agent: this.createAgent(),
    });

    if (!response.ok) {
      throw new Error(`Login failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Login failed: ${data.error}`);
    }

    this.sessionToken = data.token;
    this.lastLogin = new Date();
    
    return data;
  }

  async keepAlive(): Promise>KeepAliveResponse> {
    const url = this.isSandbox
      ? 'https://identitysso.betfair.com/api/keepAlive'
      : 'https://identitysso.betfair.com/api/keepAlive';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Application': this.appKey,
        'X-Authentication': this.sessionToken || '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      agent: this.createAgent(),
    });

    if (!response.ok) {
      throw new Error(`Keep alive failed: HTTP ${response.status}`);
    }

    return await response.json();
  }

  async logout(): Promise>LogoutResponse> {
    const url = this.isSandbox
      ? 'https://identitysso.betfair.com/api/logout'
      : 'https://identitysso.betfair.com/api/logout';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Application': this.appKey,
        'X-Authentication': this.sessionToken || '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      agent: this.createAgent(),
    });

    if (!response.ok) {
      throw new Error(`Logout failed: HTTP ${response.status}`);
    }

    this.sessionToken = null;
    this.lastLogin = null;
    
    return await response.json();
  }

  async listEventTypes(): Promise>EventType[]> {
    return this.request('listEventTypes', {
      filter: {},
      locale: 'en',
    });
  }

  async listCompetitions(eventTypeIds: string[]): Promise>Competition[]> {
    return this.request('listCompetitions', {
      filter: {
        eventTypeIds,
      },
      locale: 'en',
    });
  }

  async listEvents(eventTypeIds: string[], competitionIds: string[] = []): Promise>Event[]> {
    return this.request('listEvents', {
      filter: {
        eventTypeIds,
        competitionIds,
        marketCountries: ['GB', 'US', 'AU'],
        inPlayOnly: false,
      },
      locale: 'en',
      maxResults: 100,
    });
  }

  async listMarketBook(marketIds: string[]): Promise>MarketBook[]> {
    return this.request('listMarketBook', {
      marketIds,
      priceProjection: {
        priceData: ['EX_BEST_OFFERS', 'EX_TRADED', 'EX_ALL_OFFERS', 'SP_AVAILABLE', 'SP_TRADED'],
      },
    });
  }

  async listRunnerBook(marketId: string, selectionId: string): Promise>RunnerBook> {
    const marketBooks = await this.listMarketBook([marketId]);
    const marketBook = marketBooks[0];
    
    if (!marketBook.runners) {
      throw new Error(`No runners found for market ${marketId}`);
    }

    const runner = marketBook.runners.find(r > r.selectionId === selectionId);
    
    if (!runner) {
      throw new Error(`Runner ${selectionId} not found in market ${marketId}`);
    }

    return {
      ...runner,
      marketId,
    };
  }

  async placeOrders(marketId: string, instructions: any[]): Promise>PlaceExecutionReport> {
    return this.request('placeOrders', {
      marketId,
      instructions,
    });
  }

  async cancelOrders(marketId: string, betIds: string[]): Promise>CancelExecutionReport> {
    return this.request('cancelOrders', {
      marketId,
      instructions: betIds.map(betId > ({
        betId,
        sizeReduction: 0,
      })),
    });
  }

  async listCurrentOrders(betStatus: 'MATCHED' | 'UNMATCHED' | 'VIRTUAL' = 'UNMATCHED'): Promise>CurrentOrderSummaryReport> {
    return this.request('listCurrentOrders', {
      betStatus,
      orderBy: 'PLACED_DATE',
      sortDir: 'EARLIEST_TO_LATEST',
      fromRecord: 0,
      recordCount: 100,
    });
  }

  async getAccountFunds(): Promise>AccountFundsResponse> {
    return this.request('getAccountFunds', {}, true);
  }

  async checkSession(): Promise>boolean> {
    if (!this.sessionToken || !this.lastLogin) {
      return false;
    }

    const sessionAge = (new Date().getTime() - this.lastLogin.getTime()) / (1000 * 60);
    return sessionAge < 4 * 60; // 4 hours session timeout
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