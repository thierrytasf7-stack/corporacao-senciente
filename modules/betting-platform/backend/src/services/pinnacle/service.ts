import { PinnacleAPIClient } from './client';
import { Sport, League, Fixture, Odds, Line, Bet } from './models';

export class PinnacleService {
  private client: PinnacleAPIClient;
  private readonly pollingInterval: number;
  private oddsPollingTimer: NodeJS.Timeout | null = null;

  constructor(config: {
    username: string;
    password: string;
    pollingInterval?: number;
  }) {
    this.client = new PinnacleAPIClient(config);
    this.pollingInterval = config.pollingInterval || 30000;
  }

  async initialize(): Promise<void> {
    // Pinnacle uses Basic Auth, no session needed
    // Just verify credentials work
    try {
      await this.client.getSports();
    } catch (error) {
      throw new Error(`Pinnacle auth failed: ${error}`);
    }
  }

  async getSports(): Promise<Sport[]> {
    return this.client.getSports();
  }

  async getLeagues(sportId: string): Promise<League[]> {
    return this.client.getLeagues(sportId);
  }

  async getFixtures(sportId: string, leagueId?: string): Promise<Fixture[]> {
    return this.client.getFixtures(sportId, leagueId);
  }

  async getOdds(sportId: string, leagueId?: string, oddsFormat: 'DECIMAL' | 'AMERICAN' = 'DECIMAL'): Promise<Odds[]> {
    return this.client.getOdds(sportId, leagueId, oddsFormat);
  }

  async getLine(sportId: string, leagueId: string, eventId: string): Promise<Line> {
    return this.client.getLine(sportId, leagueId, eventId);
  }

  async placeBet(bet: {
    fixtureId: string;
    betType: string;
    selection: {
      type: string;
      teamId?: string;
      points?: number;
      odds: number;
    };
    stake: number;
    metadata?: Record<string, any>;
  }): Promise<Bet> {
    return this.client.placeBet(bet);
  }

  async getBets(): Promise<Bet[]> {
    return this.client.getBets();
  }

  async startOddsPolling(
    sportId: string,
    leagueId: string,
    onOddsUpdate: (odds: Odds[]) => void
  ): void {
    if (this.oddsPollingTimer) {
      this.stopOddsPolling();
    }

    const poll = async () => {
      try {
        const odds = await this.getOdds(sportId, leagueId);
        onOddsUpdate(odds);
      } catch (error) {
        console.error('Odds polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    this.oddsPollingTimer = setInterval(poll, this.pollingInterval);
  }

  stopOddsPolling(): void {
    if (this.oddsPollingTimer) {
      clearInterval(this.oddsPollingTimer);
      this.oddsPollingTimer = null;
    }
  }

  destroy(): void {
    this.stopOddsPolling();
  }
}
