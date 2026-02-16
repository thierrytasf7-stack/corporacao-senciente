import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface PinnacleCredentials {
  username: string;
  password: string;
  apiUrl?: string;
}

export interface OddsResponse {
  sportId: number;
  leagueId: number;
  events: Event[];
}

export interface Event {
  eventId: string;
  liveStatus: number;
  home: string;
  away: string;
  commenceTime: string;
  periods: Period[];
}

export interface Period {
  lineId: number;
  number: number;
  cutoff: string;
  maxMoneyline: number;
  maxSpread: number;
  maxTotal: number;
  moneyline: Moneyline;
  spreads: Spread[];
  totals: Total[];
}

export interface Moneyline {
  home: number;
  away: number;
  draw?: number;
}

export interface Spread {
  hdp: number;
  home: number;
  away: number;
}

export interface Total {
  points: number;
  over: number;
  under: number;
}

export interface LinesResponse {
  sportId: number;
  leagueId: number;
  events: Event[];
}

export interface PlaceBetRequest {
  sportId: number;
  eventId: string;
  periodNumber: number;
  betType: 'MoneyLine' | 'Spread' | 'Total';
  stake: number;
  odds: number;
  team: 'Home' | 'Away' | 'Draw';
}

export interface PlaceBetResponse {
  ticketId: string;
  betId: string;
  stake: number;
  odds: number;
  potentialWin: number;
  status: 'Accepted' | 'Rejected' | 'Pending';
}

export interface BalanceResponse {
  availableBalance: number;
  outstandingTransactions: number;
}

export interface Bet {
  betId: string;
  ticketId: string;
  status: 'Won' | 'Lost' | 'Pending' | 'Cancelled';
  stake: number;
  odds: number;
  potentialWin: number;
  actualProfit: number;
}

export interface Sport {
  sportId: number;
  name: string;
}

export interface League {
  leagueId: number;
  name: string;
}

export interface BetError {
  code: string;
  message: string;
  details?: any;
}

export default class PinnacleClient {
  private client: AxiosInstance;
  private credentials: PinnacleCredentials;

  constructor(credentials: PinnacleCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: credentials.apiUrl || 'https://api.pinnacle.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
      },
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const err: BetError = {
          code: error.response?.status.toString() || 'UNKNOWN',
          message: error.response?.data?.error || error.message,
          details: error.response?.data,
        };
        return Promise.reject(err);
      }
    );
  }

  async getOdds(sportId: number, since?: number, isLive?: boolean): Promise<OddsResponse> {
    try {
      const params: any = {
        sportId,
        oddsFormat: 'DECIMAL',
        since: since || 0,
        isLive: isLive || false,
      };

      const response = await this.client.get('/v2/odds', { params });
      return response.data;
    } catch (error) {
      throw this.formatError(`Failed to fetch odds for sport ${sportId}`, error);
    }
  }

  async getLines(sportId: number, since?: number, isLive?: boolean): Promise<LinesResponse> {
    try {
      const params: any = {
        sportId,
        oddsFormat: 'DECIMAL',
        since: since || 0,
        isLive: isLive || false,
      };

      const response = await this.client.get('/v2/line', { params });
      return response.data;
    } catch (error) {
      throw this.formatError(`Failed to fetch lines for sport ${sportId}`, error);
    }
  }

  async placeBet(request: PlaceBetRequest): Promise<PlaceBetResponse> {
    try {
      const response = await this.client.post('/v2/placeBet', {
        sportId: request.sportId,
        eventId: request.eventId,
        periodNumber: request.periodNumber,
        betType: request.betType,
        stake: request.stake,
        odds: request.odds,
        team: request.team,
      });

      return {
        ticketId: response.data.ticketId,
        betId: response.data.betId,
        stake: response.data.stake,
        odds: response.data.odds,
        potentialWin: response.data.potentialWin,
        status: response.data.status,
      };
    } catch (error) {
      throw this.formatError(`Failed to place bet for event ${request.eventId}`, error);
    }
  }

  async getBalance(): Promise<BalanceResponse> {
    try {
      const response = await this.client.get('/v2/balance');
      return response.data;
    } catch (error) {
      throw this.formatError('Failed to fetch balance', error);
    }
  }

  async getBets(status?: 'All' | 'Pending' | 'Settled'): Promise<Bet[]> {
    try {
      const params: any = {
        status: status || 'All',
        oddsFormat: 'DECIMAL',
      };

      const response = await this.client.get('/v2/bets', { params });
      return response.data.bets || [];
    } catch (error) {
      throw this.formatError(`Failed to fetch bets with status ${status}`, error);
    }
  }

  async cancelBet(betId: string): Promise<boolean> {
    try {
      const response = await this.client.post('/v2/cancelBet', {
        betId,
      });
      return response.data.success || false;
    } catch (error) {
      throw this.formatError(`Failed to cancel bet ${betId}`, error);
    }
  }

  async getSports(): Promise<Sport[]> {
    try {
      const response = await this.client.get('/v2/sports');
      return response.data.sports || [];
    } catch (error) {
      throw this.formatError('Failed to fetch sports', error);
    }
  }

  async getLeagues(sportId: number): Promise<League[]> {
    try {
      const response = await this.client.get(`/v2/leagues/${sportId}`);
      return response.data.leagues || [];
    } catch (error) {
      throw this.formatError(`Failed to fetch leagues for sport ${sportId}`, error);
    }
  }

  private formatError(context: string, error: any): BetError {
    if (error.code && error.message) {
      return error;
    }

    return {
      code: 'INTERNAL_ERROR',
      message: `${context}: ${error.message || 'Unknown error'}`,
      details: error.response?.data || error,
    };
  }
}