import { PinnacleClient, PinnacleCredentials } from '@/clients/PinnacleClient';
import { Sport, Odds, Line, BetResponse } from '@/types/pinnacle';

export class MockPinnacleClient extends PinnacleClient {
  constructor(credentials: PinnacleCredentials) {
    super(credentials);
  }

  async getSports(): Promise<Sport[]> {
    return [
      { id: 1, name: 'Soccer', hasLines: true, leagueSpecialsCount: 0, sportGroup: 1, details: 'Soccer', feedContents: { name: 'Soccer', marketCount: 100 } },
      { id: 2, name: 'Tennis', hasLines: true, leagueSpecialsCount: 0, sportGroup: 2, details: 'Tennis', feedContents: { name: 'Tennis', marketCount: 50 } },
      { id: 3, name: 'Basketball', hasLines: true, leagueSpecialsCount: 0, sportGroup: 3, details: 'Basketball', feedContents: { name: 'Basketball', marketCount: 75 } }
    ];
  }

  async getOdds(sportId: number, leagueIds?: number[]): Promise<Odds> {
    return {
      sportId,
      last: Date.now(),
      league: { id: 1, name: 'Premier League' },
      events: [
        {
          id: 12345,
          starts: '2026-02-15T20:00:00Z',
          home: 'Team A',
          away: 'Team B',
          rotNum: '12345',
          liveStatus: 0,
          status: 'pre',
          parlayRestriction: 0,
          homePitcher: null,
          awayPitcher: null,
          periods: [
            {
              number: 0,
              cutoff: '2026-02-15T19:45:00Z',
              maxMoneyline: 1000,
              maxSpread: 500,
              maxTotal: 500,
              moneyline: { home: 1.91, away: 1.91, draw: 3.5 },
              spreads: [{ hdp: 0, home: 1.91, away: 1.91 }],
              totals: [{ points: 2.5, over: 1.91, under: 1.91 }]
            }
          ]
        }
      ]
    };
  }

  async getLines(sportId: number, eventId: number, periodNumber: number): Promise<Line> {
    return {
      sportId,
      leagueId: 1,
      eventId,
      periodNumber,
      lineId: 1,
      hdps: [
        { away: 1.91, home: 1.91, awayChg: 0, homeChg: 0 }
      ],
      totals: [
        { over: 1.91, under: 1.91, overChg: 0, underChg: 0, points: 2.5 }
      ]
    };
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
    return {
      ticketId: `TICKET-${Date.now()}`,
      status: 'pending',
      stake,
      win: stake * odds,
      winLoss: null,
      odds,
      placedAt: new Date().toISOString(),
      settledAt: null
    };
  }

  async getBetHistory(startDate: string, endDate: string): Promise<BetResponse[]> {
    return [
      {
        ticketId: 'TICKET-123',
        status: 'won',
        stake: 100,
        win: 191,
        winLoss: 91,
        odds: 1.91,
        placedAt: '2026-02-15T20:00:00Z',
        settledAt: '2026-02-15T22:00:00Z'
      }
    ];
  }

  async getBalance(): Promise<{ available: number; outstanding: number; }> {
    return {
      available: 1000.5,
      outstanding: 0
    };
  }

  async getFeedStatus(): Promise<{ status: string; lastUpdate: string; }> {
    return {
      status: 'active',
      lastUpdate: new Date().toISOString()
    };
  }
}