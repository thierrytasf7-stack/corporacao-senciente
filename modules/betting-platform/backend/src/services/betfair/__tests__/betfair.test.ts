import { BetfairAPIClient } from './client';
import { BetfairService } from './service';
import { BetfairError } from './models';
import { EventType, Event, Market, MarketBook, RunnerBook, Order, AccountFundsResponse, PlaceExecutionReport, CancelExecutionReport, CurrentOrderSummaryReport } from './models';

describe('BetfairAPIClient', () => {
  let client: BetfairAPIClient;

  beforeEach(() => {
    client = new BetfairAPIClient({
      appKey: 'test-app-key',
      username: 'test-username',
      password: 'test-password',
      certPath: 'test-cert-path',
      isSandbox: true,
    });
  });

  describe('request', () => {
    it('should make a request with proper headers', async () => {
      const spy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'success' }),
      } as any);

      await client.request>string>('testOperation', {});
      
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('testOperation'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Application': 'test-app-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle invalid session and retry', async () => {
      const spy = jest.spyOn(global, 'fetch' as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ error: 'INVALID_SESSION_INFORMATION' }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: 'success' }),
        } as any);

      const loginSpy = jest.spyOn(client, 'login').mockResolvedValue({ token: 'new-token' } as any);

      await client.request>string>('testOperation', {});
      
      expect(loginSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should throw BetfairError for API errors', async () => {
      jest.spyOn(global, 'fetch' as any).mockResolvedValue({
        ok: true,
        json: async () => ({ error: 'TEST_ERROR', exceptionname: 'TEST_EXCEPTION' }),
      } as any);

      await expect(client.request>string>('testOperation', {}))
        .rejects
        .toThrow(BetfairError);
    });
  });

  describe('login', () => {
    it('should perform login and set session token', async () => {
      const spy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'test-token' }),
      } as any);

      const response = await client.login();
      
      expect(response.token).toBe('test-token');
      expect(client.sessionToken).toBe('test-token');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkRateLimit', () => {
    it('should respect rate limits', async () => {
      const now = new Date();
      client.rateLimit = { remaining: 0, resetTime: new Date(now.getTime() + 1000) };
      
      const startTime = Date.now();
      await client.checkRateLimit();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('listEventTypes', () => {
    it('should call listEventTypes API', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue([]);
      
      await client.listEventTypes();
      
      expect(spy).toHaveBeenCalledWith('listEventTypes', {
        filter: {},
        locale: 'en',
      });
    });
  });

  describe('listEvents', () => {
    it('should call listEvents API with proper filters', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue([]);
      
      await client.listEvents(['soccer'], ['premier-league']);
      
      expect(spy).toHaveBeenCalledWith('listEvents', {
        filter: {
          eventTypeIds: ['soccer'],
          competitionIds: ['premier-league'],
          marketCountries: ['GB', 'US', 'AU'],
          inPlayOnly: false,
        },
        locale: 'en',
        maxResults: 100,
      });
    });
  });

  describe('listMarketBook', () => {
    it('should call listMarketBook API with price projection', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue([]);
      
      await client.listMarketBook(['market1', 'market2']);
      
      expect(spy).toHaveBeenCalledWith('listMarketBook', {
        marketIds: ['market1', 'market2'],
        priceProjection: {
          priceData: [
            'EX_BEST_OFFERS', 
            'EX_TRADED', 
            'EX_ALL_OFFERS', 
            'SP_AVAILABLE', 
            'SP_TRADED'
          ],
        },
      });
    });
  });

  describe('placeOrders', () => {
    it('should call placeOrders API with proper instructions', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue({});
      
      await client.placeOrders('market1', [{
        selectionId: 'selection1',
        handicap: 0,
        side: 'BACK',
        orderType: 'LIMIT',
        limitOrder: {
          size: 10,
          price: 2.5,
          persistenceType: 'PERSIST',
        },
      }]);
      
      expect(spy).toHaveBeenCalledWith('placeOrders', {
        marketId: 'market1',
        instructions: [{
          selectionId: 'selection1',
          handicap: 0,
          side: 'BACK',
          orderType: 'LIMIT',
          limitOrder: {
            size: 10,
            price: 2.5,
            persistenceType: 'PERSIST',
          },
        }],
      });
    });
  });

  describe('cancelOrders', () => {
    it('should call cancelOrders API with proper instructions', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue({});
      
      await client.cancelOrders('market1', ['bet1', 'bet2']);
      
      expect(spy).toHaveBeenCalledWith('cancelOrders', {
        marketId: 'market1',
        instructions: [
          { betId: 'bet1', sizeReduction: 0 },
          { betId: 'bet2', sizeReduction: 0 }
        ],
      });
    });
  });

  describe('listCurrentOrders', () => {
    it('should call listCurrentOrders API with default parameters', async () => {
      const spy = jest.spyOn(client, 'request' as any).mockResolvedValue({ currentOrders: [] });
      
      await client.listCurrentOrders();
      
      expect(spy).toHaveBeenCalledWith('listCurrentOrders', {
        betStatus: 'UNMATCHED',
        orderBy: 'PLACED_DATE',
        sortDir: 'EARLIEST_TO_LATEST',
        fromRecord: 0,
        recordCount: 100,
      });
    });
  });
});

describe('BetfairService', () => {
  let service: BetfairService;

  beforeEach(() => {
    service = new BetfairService({
      appKey: 'test-app-key',
      username: 'test-username',
      password: 'test-password',
      certPath: 'test-cert-path',
      isSandbox: true,
    });
  });

  describe('initialize', () => {
    it('should login if session is invalid', async () => {
      const spy = jest.spyOn(service.client, 'checkSession').mockResolvedValue(false);
      const loginSpy = jest.spyOn(service.client, 'login').mockResolvedValue({ token: 'test-token' } as any);

      await service.initialize();
      
      expect(loginSpy).toHaveBeenCalled();
    });
  });

  describe('getEventTypes', () => {
    it('should return event types', async () => {
      const mockData = [{ id: 'soccer', name: 'Soccer' }];
      jest.spyOn(service.client, 'listEventTypes').mockResolvedValue(mockData);

      const result = await service.getEventTypes();
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvents', () => {
    it('should return events with proper filters', async () => {
      const mockData = [{ id: 'event1', name: 'Match 1' }];
      jest.spyOn(service.client, 'listEvents').mockResolvedValue(mockData);

      const result = await service.getEvents(['soccer'], ['premier-league']);
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getMarkets', () => {
    it('should return markets for event', async () => {
      const mockData = [{ id: 'market1', name: 'Match Odds' }];
      jest.spyOn(service.client, 'listMarketBook').mockResolvedValue(mockData);

      const result = await service.getMarkets('event1');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getOdds', () => {
    it('should return odds for market', async () => {
      const mockData = {
        marketId: 'market1',
        runners: [{
          selectionId: 'runner1',
          lastPriceTraded: 2.5,
        }]
      };
      jest.spyOn(service.client, 'listMarketBook').mockResolvedValue([mockData]);

      const result = await service.getOdds('market1');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('placeBet', () => {
    it('should place a bet with proper parameters', async () => {
      const mockData = { status: 'SUCCESS' };
      jest.spyOn(service.client, 'placeOrders').mockResolvedValue(mockData);

      const result = await service.placeBet(
        'market1',
        'runner1',
        'BACK',
        2.5,
        10
      );
      
      expect(result).toEqual(mockData);
    });
  });

  describe('cancelBet', () => {
    it('should cancel a bet', async () => {
      const mockData = { status: 'SUCCESS' };
      jest.spyOn(service.client, 'cancelOrders').mockResolvedValue(mockData);

      const result = await service.cancelBet('market1', 'bet1');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getCurrentBets', () => {
    it('should return current bets', async () => {
      const mockData = { currentOrders: [] };
      jest.spyOn(service.client, 'listCurrentOrders').mockResolvedValue(mockData);

      const result = await service.getCurrentBets();
      
      expect(result).toEqual(mockData);
    });
  });

  describe('getAccountBalance', () => {
    it('should return account balance', async () => {
      const mockData = { availableToBetBalance: 100 };
      jest.spyOn(service.client, 'getAccountFunds').mockResolvedValue(mockData);

      const result = await service.getAccountBalance();
      
      expect(result).toEqual(mockData);
    });
  });
});

describe('BetfairError', () => {
  it('should create error with message', () => {
    const error = new BetfairError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('BetfairError');
  });

  it('should create error with exceptionname and errorDetails', () => {
    const error = new BetfairError('Test error', 'TEST_EXCEPTION', 'Test details');
    
    expect(error.exceptionname).toBe('TEST_EXCEPTION');
    expect(error.errorDetails).toBe('Test details');
  });
});

// Additional tests for edge cases and error scenarios would be added here
// including tests for:
// - Invalid API responses
// - Network failures
// - Rate limiting
// - Session expiration
// - Invalid parameters