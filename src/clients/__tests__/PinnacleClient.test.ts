import { PinnacleClient, PinnacleCredentials } from '@/clients/PinnacleClient';
import { Sport, Odds, Line, BetResponse } from '@/types/pinnacle';

describe('PinnacleClient', () => {
  let client: PinnacleClient;
  const mockCredentials: PinnacleCredentials = {
    apiKey: 'test-api-key',
    username: 'test-user',
    password: 'test-pass'
  };

  beforeEach(() => {
    client = new PinnacleClient(mockCredentials);
  });

  describe('getSports', () => {
    it('should return sports data', async () => {
      const mockResponse = {
        sports: [
          { id: 1, name: 'Soccer', hasLines: true, leagueSpecialsCount: 0, sportGroup: 1, details: 'Soccer', feedContents: { name: 'Soccer', marketCount: 100 } }
        ]
      };

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getSports();
      
      expect(result).toEqual(mockResponse.sports);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Soccer');
    });

    it('should handle API errors', async () => {
      jest.spyOn(client as any, 'client', 'get').mockRejectedValue(new Error('Network error'));

      await expect(client.getSports()).rejects.toThrow('Network error');
    });
  });

  describe('getOdds', () => {
    it('should return odds data for sport', async () => {
      const mockResponse = {
        sportId: 1,
        last: 123456789,
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

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getOdds(1);
      
      expect(result).toEqual(mockResponse);
      expect(result.sportId).toBe(1);
      expect(result.events.length).toBe(1);
    });

    it('should handle leagueIds parameter', async () => {
      const mockResponse = { sportId: 1, last: 123, league: { id: 1, name: 'League' }, events: [] };
      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getOdds(1, [1, 2, 3]);
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getLines', () => {
    it('should return line data', async () => {
      const mockResponse = {
        sportId: 1,
        leagueId: 1,
        eventId: 12345,
        periodNumber: 0,
        lineId: 1,
        hdps: [
          { away: 1.91, home: 1.91, awayChg: 0, homeChg: 0 }
        ],
        totals: [
          { over: 1.91, under: 1.91, overChg: 0, underChg: 0, points: 2.5 }
        ]
      };

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getLines(1, 12345, 0);
      
      expect(result).toEqual(mockResponse);
      expect(result.eventId).toBe(12345);
    });
  });

  describe('placeBet', () => {
    it('should place a bet successfully', async () => {
      const mockResponse = {
        ticketId: 'TICKET-123',
        status: 'pending',
        stake: 100,
        win: 191,
        winLoss: null,
        odds: 1.91,
        placedAt: '2026-02-15T20:00:00Z',
        settledAt: null
      };

      jest.spyOn(client as any, 'client', 'post').mockResolvedValue({ data: mockResponse });

      const result = await client.placeBet(
        1,
        12345,
        0,
        'moneyline',
        100,
        1.91,
        'home'
      );
      
      expect(result).toEqual(mockResponse);
      expect(result.ticketId).toBe('TICKET-123');
    });

    it('should handle bet errors', async () => {
      jest.spyOn(client as any, 'client', 'post').mockRejectedValue(new Error('Insufficient balance'));

      await expect(client.placeBet(
        1,
        12345,
        0,
        'moneyline',
        100,
        1.91
      )).rejects.toThrow('Insufficient balance');
    });
  });

  describe('getBetHistory', () => {
    it('should return bet history', async () => {
      const mockResponse = {
        bets: [
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
        ]
      };

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getBetHistory('2026-02-01', '2026-02-15');
      
      expect(result).toEqual(mockResponse.bets);
      expect(result.length).toBe(1);
    });
  });

  describe('getBalance', () => {
    it('should return account balance', async () => {
      const mockResponse = {
        balance: {
          available: 1000.5,
          outstanding: 0
        }
      };

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getBalance();
      
      expect(result).toEqual(mockResponse.balance);
      expect(result.available).toBe(1000.5);
    });
  });

  describe('getFeedStatus', () => {
    it('should return feed status', async () => {
      const mockResponse = {
        status: 'active',
        lastUpdate: '2026-02-15T20:00:00Z'
      };

      jest.spyOn(client as any, 'client', 'get').mockResolvedValue({ data: mockResponse });

      const result = await client.getFeedStatus();
      
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('active');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
      jest.spyOn(client as any, 'client', 'get').mockRejectedValue(error);

      await expect(client.getSports()).rejects.toThrow('Unauthorized: Invalid Pinnacle credentials');
    });

    it('should handle 429 Rate Limit', async () => {
      const error = { response: { status: 429, data: { message: 'Rate limit exceeded' } } };
      jest.spyOn(client as any, 'client', 'get').mockRejectedValue(error);

      await expect(client.getSports()).rejects.toThrow('Rate limit exceeded: Too many requests');
    });

    it('should handle network errors', async () => {
      const error = { request: {} };
      jest.spyOn(client as any, 'client', 'get').mockRejectedValue(error);

      await expect(client.getSports()).rejects.toThrow('Network error: No response from Pinnacle API');
    });
  });

  describe('Authentication', () => {
    it('should add authentication headers', () => {
      const config: any = {};
      const result = (client as any).addAuthentication(config);
      
      expect(result.auth).toBeDefined();
      expect(result.headers['Authorization']).toBeDefined();
      expect(result.headers['X-API-KEY']).toBeDefined();
    });

    it('should throw error for missing credentials', () => {
      const invalidClient = new PinnacleClient({ apiKey: '', username: '', password: '' });
      const config: any = {};
      
      expect(() => (invalidClient as any).addAuthentication(config)).toThrow('Pinnacle credentials are incomplete');
    });
  });
});
