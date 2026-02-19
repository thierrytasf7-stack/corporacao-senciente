import { z } from 'zod';
import { 
  Sport, League, Fixture, Odds, Line, Bet, 
  PlaceStraightBetRequest, PlaceBetResponse, GetBetsRequest, GetBetsResponse 
} from './models';

export class PinnacleAPIClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly rateLimit: { remaining: number; resetTime: Date } = { remaining: 4, resetTime: new Date() };

  constructor(config: {
    username: string;
    password: string;
    apiUrl?: string;
  }) {
    this.username = config.username;
    this.password = config.password;
    this.baseUrl = config.apiUrl || process.env.PINNACLE_API_URL || 'https://api.ps3838.com';
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' = 'GET'
  ): Promise<T> {
    try {
      await this.checkRateLimit();

      let url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (method === 'GET') {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      } else {
        options.body = JSON.stringify(params);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new PinnacleError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json() as any;
      
      // Pinnacle API specific error handling often comes in specific formats, 
      // checking generic 'status' field here as a placeholder.
      // Real Pinnacle API returns errors with specific codes in body sometimes.
      if (data.errorCode) {
         throw new PinnacleError(`API Error: ${data.errorCode}`, data.errorCode);
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
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    } else {
      this.rateLimit.remaining = 4;
      this.rateLimit.resetTime = new Date(now.getTime() + 1000);
    }
    this.rateLimit.remaining--;
  }

  // --- Market Data (Requires Feed API - v1) ---
  // Note: These endpoints might require a different Base URL (e.g. api.pinnacle.com/v1/...) 
  // or checking the specific Feed API documentation. 
  // Keeping existing methods but verifying paths.

  async getSports(): Promise<Sport[]> {
    const data = await this.request<{ sports: Sport[] }>('/v3/sports');
    return data.sports;
  }

  async getLeagues(sportId: string): Promise<League[]> {
    const data = await this.request<{ leagues: League[] }>(`/v2/leagues?sportId=${sportId}`);
    return data.leagues;
  }

  async getFixtures(sportId: string, leagueId?: string, since?: number): Promise<Fixture[]> {
    const params: Record<string, any> = { sportId };
    if (leagueId) params.leagueIds = leagueId; // Pinnacle uses leagueIds (comma sep)
    if (since) params.since = since;
    
    // Pinnacle Feed API usually returns 'events' not 'fixtures'
    const data = await this.request<{ events: any[] }>('/v1/fixtures', params);
    
    // Mapper from Pinnacle Event to our Fixture model would go here
    return data.events.map(e => ({
        id: String(e.id),
        sportId: String(e.sportId),
        // ... mapping logic ...
    } as Fixture));
  }

  async getOdds(sportId: string, leagueId?: string, oddsFormat: 'DECIMAL' | 'AMERICAN' = 'DECIMAL', since?: number): Promise<Odds[]> {
    const params: Record<string, any> = { sportId, oddsFormat };
    if (leagueId) params.leagueIds = leagueId;
    if (since) params.since = since;
    
    const data = await this.request<{ leagues: any[] }>('/v1/odds', params);
    // Mapper logic required here
    return []; 
  }

  async getLine(sportId: string, leagueId: string, eventId: string): Promise<Line> {
    // /v1/line is common for getting specific line for betting
    return this.request<Line>('/v1/line', { sportId, leagueId, eventId, oddsFormat: 'DECIMAL' });
  }

  // --- Betting (v2/v3 from betsapi-oas.yaml) ---

  /**
   * Places a straight bet (Moneyline, Spread, Total, etc)
   * Ref: POST /v2/bets/straight
   */
  async placeStraightBet(betRequest: PlaceStraightBetRequest): Promise<PlaceBetResponse> {
    return this.request<PlaceBetResponse>('/v2/bets/straight', betRequest, 'POST');
  }

  /**
   * Retrieves betting history
   * Ref: GET /v3/bets
   */
  async getBets(request: GetBetsRequest = {}): Promise<GetBetsResponse> {
    return this.request<GetBetsResponse>('/v3/bets', request, 'GET');
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
