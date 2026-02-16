import { PinnacleClient, PinnacleCredentials, OddsResponse, LinesResponse, PlaceBetRequest, PlaceBetResponse } from '../PinnacleClient';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('PinnacleClient', () => {
  let mock: MockAdapter;
  let client: PinnacleClient;
  const credentials: PinnacleCredentials = {
    username: 'test-user',
    password: 'test-pass',
    apiUrl: 'https://api.pinnacle.com',
  };

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new PinnacleClient(credentials);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('getOdds', () => {
    it('should fetch odds successfully', async () => {
      const mockData: OddsResponse = {
        sportId: 29,
        leagueId: 123,
        events: [{
          eventId: '12345',
          liveStatus: 0,
          home: 'Team A',
          away: 'Team B',
          commenceTime: '2026-02-15T20:00:00Z',
          periods: [{
            lineId: 1,
            number: 0,
            cutoff: '2026-02-15T19:55:00Z',
            maxMoneyline: 1000,
            maxSpread: 500,
            maxTotal: 500,
            moneyline: { home: 1.91, away: 1.91 },
            spreads: [{ hdp: 0, home: 1.91, away: 1.91 }],
            totals: [{ points: 2.5, over: 1.91, under: 1.91 }]
          }]
        }]
      };

      mock.onGet('/v2/odds', { params: { sportId: 29, oddsFormat: 'DECIMAL', since: 0, isLive: false } })
        .reply(200, mockData);

      const result = await client.getOdds(29);
      expect(result).toEqual(mockData);
      expect(result.sportId).toBe(29);
      expect(result.events.length).toBe(1);
    });

    it('should handle API errors', async () => {
      mock.onGet('/v2/odds').reply(401, { error: 'Authentication failed' });

      await expect(client.getOdds(29)).rejects.toThrow('Authentication failed - invalid API credentials');
    });

    it('should handle network errors', async () => {
      mock.onGet('/v2/odds').networkError();

      await expect(client.getOdds(29)).rejects.toThrow('No response from Pinnacle API');
    });
  });

  describe('getLines', () => {
    it('should fetch lines successfully', async () => {
      const mockData: LinesResponse = {
        sportId: 29,
        leagueId: 123,
        events: [{
          eventId: '12345',
          liveStatus: 0,
          home: 'Team A',
          away: 'Team B',
          commenceTime: '2026-02-15T20:00:00Z',
          periods: [{
            lineId: 1,
            number: 0,
            cutoff: '2026-02-15T19:55:00Z',
            maxMoneyline: 1000,
            maxSpread: 500,
            maxTotal: 500,
            moneyline: { home: 1.91, away: 1.91 },
            spreads: [{ hdp: 0, home: 1.91, away: 1.91 }],
            totals: [{ points: 2.5, over: 1.91, under: 1.91 }]
          }]
        }]
      };

      mock.onGet('/v2/line', { params: { sportId: 29, oddsFormat: 'DECIMAL', since: 0, isLive: false } })
        .reply(200, mockData);

      const result = await client.getLines(29);
      expect(result).toEqual(mockData);
    });

    it('should handle rate limit errors', async () => {
      mock.onGet('/v2/line').reply(429, { error: 'Rate limit exceeded' });

      await expect(client.getLines(29)).rejects.toThrow('Rate limit exceeded - please wait before retrying');
    });
  });

  describe('placeBet', () => {
    it('should place bet successfully', async () => {
      const request: PlaceBetRequest = {
        sportId: 29,
        eventId: '12345',
        periodNumber: 0,
        betType: 'MoneyLine',
        stake: 100,
        odds: 1.91,
        team: 'Home'
      };

      const mockResponse: PlaceBetResponse = {
        ticketId: 'TICKET123',
        betId: 'BET456',
        stake: 100,
        odds: 1.91,
        potentialWin: 191,
        status: 'Accepted'
      };

      mock.onPost('/v2/placeBet').reply(200, mockResponse);

      const result = await client.placeBet(request);
      expect(result).toEqual(mockResponse);
      expect(result.ticketId).toBe('TICKET123');
    });

    it('should handle bet rejection', async () => {
      const request: PlaceBetRequest = {
        sportId: 29,
        eventId: '12345',
        periodNumber: 0,
        betType: 'MoneyLine',
        stake: 100,
        odds: 1.91,
        team: 'Home'
      };

      mock.onPost('/v2/placeBet').reply(400, { error: 'Insufficient balance' });

      await expect(client.placeBet(request)).rejects.toThrow('Pinnacle API request failed: Insufficient balance');
    });

    it('should handle server errors', async () => {
      const request: PlaceBetRequest = {
        sportId: 29,
        eventId: '12345',
        periodNumber: 0,
        betType: 'MoneyLine',
        stake: 100,
        odds: 1.91,
        team: 'Home'
      };

      mock.onPost('/v2/placeBet').reply(500, { error: 'Internal server error' });

      await expect(client.placeBet(request)).rejects.toThrow('Pinnacle API server error - please try again later');
    });
  });

  describe('getBalance', () => {
    it('should fetch balance successfully', async () => {
      mock.onGet('/v2/balance').reply(200, { availableBalance: 5000, outstandingTransactions: 100 });

      const result = await client.getBalance();
      expect(result).toEqual({ availableBalance: 5000, outstandingTransactions: 100 });
    });

    it('should handle balance errors', async () => {
      mock.onGet('/v2/balance').reply(500, { error: 'Server error' });

      await expect(client.getBalance()).rejects.toThrow('Pinnacle API server error - please try again later');
    });
  });

  describe('getBets', () => {
    it('should fetch bets successfully', async () => {
      const mockBets = [
        {
          betId: 'BET123',
          ticketId: 'TICKET123',
          status: 'Won',
          stake: 100,
          odds: 1.91,
          potentialWin: 191,
          actualProfit: 91
        }
      ];

      mock.onGet('/v2/bets', { params: { status: 'All', oddsFormat: 'DECIMAL' } })
        .reply(200, { bets: mockBets });

      const result = await client.getBets();
      expect(result).toEqual(mockBets);
    });

    it('should fetch bets with specific status', async () => {
      const mockBets = [
        {
          betId: 'BET123',
          ticketId: 'TICKET123',
          status: 'Pending',
          stake: 100,
          odds: 1.91,
          potentialWin: 191,
          actualProfit: 0
        }
      ];

      mock.onGet('/v2/bets', { params: { status: 'Pending', oddsFormat: 'DECIMAL' } })
        .reply(200, { bets: mockBets });

      const result = await client.getBets('Pending');
      expect(result).toEqual(mockBets);
    });
  });

  describe('cancelBet', () => {
    it('should cancel bet successfully', async () => {
      mock.onPost('/v2/cancelBet').reply(200, { success: true });

      const result = await client.cancelBet('BET123');
      expect(result).toBe(true);
    });

    it('should handle cancel failure', async () => {
      mock.onPost('/v2/cancelBet').reply(400, { success: false, error: 'Bet already settled' });

      const result = await client.cancelBet('BET123');
      expect(result).toBe(false);
    });
  });

  describe('getSports', () => {
    it('should fetch sports successfully', async () => {
      const mockSports = [
        { sportId: 29, name: 'Soccer' },
        { sportId: 6, name: 'Tennis' }
      ];

      mock.onGet('/v2/sports').reply(200, { sports: mockSports });

      const result = await client.getSports();
      expect(result).toEqual(mockSports);
    });
  });

  describe('getLeagues', () => {
    it('should fetch leagues successfully', async () => {
      const mockLeagues = [
        { leagueId: 123, name: 'Premier League' },
        { leagueId: 456, name: 'Champions League' }
      ];

      mock.onGet('/v2/leagues/29').reply(200, { leagues: mockLeagues });

      const result = await client.getLeagues(29);
      expect(result).toEqual(mockLeagues);
    });
  });

  describe('error handling', () => {
    it('should handle invalid credentials', async () => {
      mock.onGet('/v2/odds').reply(401, { error: 'Authentication failed' });

      await expect(client.getOdds(29)).rejects.toThrow('Authentication failed - invalid API credentials');
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/v2/odds').timeout();

      await expect(client.getOdds(29)).rejects.toThrow('No response from Pinnacle API');
    });

    it('should handle unexpected errors', async () => {
      mock.onGet('/v2/odds').reply(500, { error: 'Unexpected error' });

      await expect(client.getOdds(29)).rejects.toThrow('Pinnacle API server error - please try again later');
    });
  });

  describe('request configuration', () => {
    it('should use correct base URL', async () => {
      const customClient = new PinnacleClient({
        ...credentials,
        apiUrl: 'https://custom-api.pinnacle.com'
      });

      mock = new MockAdapter(customClient['client']);
      mock.onGet('/v2/odds').reply(200, { sportId: 29 });

      await customClient.getOdds(29);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].baseURL).toBe('https://custom-api.pinnacle.com');
    });

    it('should include authentication headers', async () => {
      mock.onGet('/v2/odds').reply(200, { sportId: 29 });

      await client.getOdds(29);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].headers.Authorization).toBeDefined();
    });
  });

  describe('rate limiting', () => {
    it('should handle rate limit gracefully', async () => {
      mock.onGet('/v2/odds').reply(429, { error: 'Rate limit exceeded' });

      await expect(client.getOdds(29)).rejects.toThrow('Rate limit exceeded - please wait before retrying');
    });
  });

  describe('input validation', () => {
    it('should validate stake amount', async () => {
      const request: PlaceBetRequest = {
        sportId: 29,
        eventId: '12345',
        periodNumber: 0,
        betType: 'MoneyLine',
        stake: -100,
        odds: 1.91,
        team: 'Home'
      };

      await expect(client.placeBet(request)).rejects.toThrow('Failed to place bet for event 12345');
    });

    it('should validate odds', async () => {
      const request: PlaceBetRequest = {
        sportId: 29,
        eventId: '12345',
        periodNumber: 0,
        betType: 'MoneyLine',
        stake: 100,
        odds: 0,
        team: 'Home'
      };

      await expect(client.placeBet(request)).rejects.toThrow('Failed to place bet for event 12345');
    });
  });
});
