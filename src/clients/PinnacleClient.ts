import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '@/utils/logger';

export interface PinnacleCredentials {
  apiKey: string;
  username: string;
  password: string;
}

export interface Sport {
  id: number;
  name: string;
  hasLines: boolean;
  leagueSpecialsCount: number;
  sportGroup: number;
  details: string;
  feedContents: {
    name: string;
    marketCount: number;
  };
}

export interface Odds {
  sportId: number;
  last: number;
  league: {
    id: number;
    name: string;
  };
  events: Array<{
    id: number;
    starts: string;
    home: string;
    away: string;
    rotNum: string;
    liveStatus: number;
    status: string;
    parlayRestriction: number;
    homePitcher: string | null;
    awayPitcher: string | null;
    periods: Array<{
      number: number;
      cutoff: string;
      maxMoneyline: number;
      maxSpread: number;
      maxTotal: number;
      moneyline: {
        home: number;
        away: number;
        draw: number | null;
      };
      spreads: Array<{
        hdp: number;
        home: number;
        away: number;
      }>;
      totals: Array<{
        points: number;
        over: number;
        under: number;
      }>;
    }>;
  }>;
}

export interface Line {
  sportId: number;
  leagueId: number;
  eventId: number;
  periodNumber: number;
  lineId: number;
  hdps: Array<{
    away: number;
    home: number;
    awayChg: number;
    homeChg: number;
  }>;
  totals: Array<{
    over: number;
    under: number;
    overChg: number;
    underChg: number;
    points: number;
  }>;
}

export interface BetResponse {
  ticketId: string;
  status: string;
  stake: number;
  win: number;
  winLoss: number | null;
  odds: number;
  placedAt: string;
  settledAt: string | null;
}

export class PinnacleClient {
  private client: AxiosInstance;
  private credentials: PinnacleCredentials;
  private logger: Logger;

  constructor(credentials: PinnacleCredentials) {
    this.credentials = credentials;
    this.logger = new Logger('PinnacleClient');
    
    this.client = axios.create({
      baseURL: 'https://api.pinnacle.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => this.addAuthentication(config),
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private addAuthentication(config: AxiosRequestConfig): AxiosRequestConfig {
    const { apiKey, username, password } = this.credentials;
    
    if (!apiKey || !username || !password) {
      throw new Error('Pinnacle credentials are incomplete');
    }

    config.auth = {
      username: username,
      password: password,
    };

    config.headers['Authorization'] = `Bearer ${apiKey}`;
    config.headers['X-API-KEY'] = apiKey;

    return config;
  }

  private handleError(error: any): Promise<any> {
    if (error.response) {
      const { status, data } = error.response;
      
      this.logger.error(`Pinnacle API Error: ${status} - ${JSON.stringify(data)}`);
      
      switch (status) {
        case 401:
          throw new Error('Unauthorized: Invalid Pinnacle credentials');
        case 403:
          throw new Error('Forbidden: API key blocked or rate limited');
        case 429:
          throw new Error('Rate limit exceeded: Too many requests');
        case 400:
          throw new Error(`Bad request: ${data.message || 'Invalid parameters'}`);
        case 500:
          throw new Error('Internal server error: Pinnacle API issue');
        default:
          throw new Error(`Unexpected error: ${status} - ${JSON.stringify(data)}`);
      }
    } else if (error.request) {
      this.logger.error('Pinnacle API: No response from server');
      throw new Error('Network error: No response from Pinnacle API');
    } else {
      this.logger.error(`Pinnacle API: Request error - ${error.message}`);
      throw new Error(`Request error: ${error.message}`);
    }
  }

  async getSports(): Promise<Sport[]> {
    try {
      const response = await this.client.get('/v2/sports');
      return response.data.sports;
    } catch (error) {
      this.logger.error('Failed to fetch sports from Pinnacle');
      throw error;
    }
  }

  async getOdds(sportId: number, leagueIds?: number[]): Promise<Odds> {
    try {
      const params: any = { sportId };
      
      if (leagueIds && leagueIds.length > 0) {
        params.leagueIds = leagueIds.join(',');
      }

      const response = await this.client.get('/v1/odds', { params });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch odds for sport ${sportId}`, error);
      throw error;
    }
  }

  async getLines(sportId: number, eventId: number, periodNumber: number): Promise<Line> {
    try {
      const response = await this.client.get('/v1/line', {
        params: {
          sportId,
          eventId,
          periodNumber,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch lines for event ${eventId}`, error);
      throw error;
    }
  }

  async placeBet(
    sportId: number,
    eventId: number,
    periodNumber: number,
    betType: 'moneyline' | 'spread' | 'total',
    stake: number,
    odds: number,
    team?: string,
    hdcp?: number,
    overUnder?: 'over' | 'under'
  ): Promise<BetResponse> {
    try {
      const betData = {
        sportId,
        eventId,
        periodNumber,
        betType,
        stake,
        odds,
        team,
        hdcp,
        overUnder,
      };

      const response = await this.client.post('/v2/placeBet', betData);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to place bet for event ${eventId}`, error);
      throw error;
    }
  }

  async getBetHistory(startDate: string, endDate: string): Promise<BetResponse[]> {
    try {
      const response = await this.client.get('/v2/bets', {
        params: {
          startDate,
          endDate,
        },
      });
      return response.data.bets;
    } catch (error) {
      this.logger.error('Failed to fetch bet history', error);
      throw error;
    }
  }

  async getBalance(): Promise<{ available: number; outstanding: number; }> {
    try {
      const response = await this.client.get('/v2/client/balance');
      return response.data.balance;
    } catch (error) {
      this.logger.error('Failed to fetch account balance', error);
      throw error;
    }
  }

  async getFeedStatus(): Promise<{ status: string; lastUpdate: string; }> {
    try {
      const response = await this.client.get('/v1/feedStatus');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch feed status', error);
      throw error;
    }
  }
}