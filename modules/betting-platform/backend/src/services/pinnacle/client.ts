import { z } from 'zod';
import { Sport, League, Fixture, Odds, Line, Bet, BetfairError } from './models';

export class PinnacleAPIClient {
  private readonly baseUrl: string = 'https://api.pinnacle.com';
  private readonly username: string;
  private readonly password: string;
  private readonly rateLimit: { remaining: number; resetTime: Date } = { remaining: 4, resetTime: new Date() };

  constructor(config: {
    username: string;
    password: string;
  }) {
    this.username = config.username;
    this.password = config.password;
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' = 'GET'
  ): Promise<T> {
    try {
      await this.checkRateLimit();

      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
      };

      const response = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? JSON.stringify(params) : undefined,
      });

      if (!response.ok) {
        throw new PinnacleError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new PinnacleError(data.message, data.code);
      }

      return data;
    } catch (error) {
      if (error instanceof PinnacleError) {
        throw error;
      }
      throw new PinnacleError(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
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
      this.rateLimit.remaining = 4;
      this.rateLimit.resetTime = new Date(now.getTime() + 1000);
    }
    this.rateLimit.remaining--;
  }

  async getSports(): Promise<Sport[]> {
    return this.request<Sport[]>('/sports');
  }

  async getLeagues(sportId: string): Promise<League[]> {
    return this.request<League[]>(`/leagues?sportId=${sportId}`);
  }

  async getFixtures(sportId: string, leagueId?: string): Promise<Fixture[]> {
    const params: Record<string, any> = { sportId };
    if (leagueId) params.leagueId = leagueId;
    
    return this.request<Fixture[]>('/fixtures', params);
  }

  async getOdds(sportId: string, leagueId?: string, oddsFormat: 'DECIMAL' | 'AMERICAN' = 'DECIMAL'): Promise<Odds[]> {
    const params: Record<string, any> = { sportId, oddsFormat };
    if (leagueId) params.leagueId = leagueId;
    
    return this.request<Odds[]>('/odds', params);
  }

  async getLine(sportId: string, leagueId: string, eventId: string): Promise<Line> {
    return this.request<Line>('/line', { sportId, leagueId, eventId });
  }

  async getBets(): Promise<Bet[]> {
    return this.request<Bet[]>('/bets');
  }

  async placeBet(bet: Omit<Bet, 'id' | 'userId' | 'accountId' | 'placedAt' | 'status' | 'potentialReturn'>): Promise<Bet> {
    return this.request<Bet>('/bets', bet, 'POST');
  }
}

export class PinnacleError extends Error {
  constructor(
    message: string,
    public readonly code?: number | string
  ) {
    super(message);
    this.name = 'PinnacleError';
  }
}

export const PinnacleErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type PinnacleError = z.infer<typeof PinnacleErrorSchema>;