import { BetfairClient } from '@/services/BetfairClient';
import { BetfairCredentials } from '@/types/betting-platform';
import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import { RateLimiterMemory } from 'rate-limiter-flexible';

describe('BetfairClient', () => {
  let client: BetfairClient;
  let mockCredentials: BetfairCredentials;
  let mockAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockCredentials = {
      appKey: 'test-app-key',
      username: 'test-user',
      password: 'test-pass',
      certificatePath: '/path/to/cert.pem',
      keyPath: '/path/to/key.pem',
      apiUrl: 'https://api.betfair.com/exchange',
      authUrl: 'https://identitysso-cert.betfair.com/api/certlogin',
      rateLimit: 60,
      timeoutMs: 30000,
    };

    mockAxios = axios as jest.Mocked<typeof axios>;
    mocked(axios.create).mockReturnValue(mockAxios);

    client = new BetfairClient(mockCredentials);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(client).toBeDefined();
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.betfair.com/exchange',
        timeout: 30000,
        headers: {
          'X-Application': 'test-app-key',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use custom values when provided', () => {
      mockCredentials.apiUrl = 'https://custom.api.com';
      mockCredentials.timeoutMs = 15000;
      mockCredentials.rateLimit = 30;

      const customClient = new BetfairClient(mockCredentials);
      
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom.api.com',
        timeout: 15000,
        headers: {
          'X-Application': 'test-app-key',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('authentication', () => {
    it('should refresh session when token is expired', async () => {
      const mockResponse = {
        data: {
          loginStatus: 'SUCCESS',
          sessionToken: 'new-session-token',
          duration: 3600,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await client['refreshSession']();

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://identitysso-cert.betfair.com/api/certlogin',
        {
          username: 'test-user',
          password: 'test-pass',
        },
        {
          headers: {
            'X-Application': 'test-app-key',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          httpsAgent: expect.any(Object),
          timeout: 10000,
        }
      );
    });

    it('should throw error when authentication fails', async () => {
      const mockResponse = {
        data: {
          loginStatus: 'FAIL',
          error: 'Invalid credentials',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await expect(client['refreshSession']()).rejects.toThrow('Betfair authentication failed');
    });

    it('should add auth header to requests', async () => {
      const mockResponse = {
        data: {
          loginStatus: 'SUCCESS',
          sessionToken: 'test-session-token',
          duration: 3600,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const config: any = {};
      await client['addAuthHeader'](config);

      expect(config.headers['X-Authentication']).toBe('test-session-token');
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limit', async () => {
      const mockLimiter = {
        consume: jest.fn().mockResolvedValue(undefined),
      };

      client['rateLimiter'] = mockLimiter as any;

      await client['enforceRateLimit']();
      expect(mockLimiter.consume).toHaveBeenCalledWith('betfair-client');
    });

    it('should retry after rate limit exceeded', async () => {
      const mockLimiter = {
        consume: jest.fn().mockRejectedValue({ msBeforeNext: 2000 }),
      };

      client['rateLimiter'] = mockLimiter as any;

      jest.useFakeTimers();
      const promise = client['enforceRateLimit']();
      jest.advanceTimersByTime(2000);
      await promise;

      expect(mockLimiter.consume).toHaveBeenCalledWith('betfair-client');
    });
  });

  describe('error handling', () => {
    it('should handle 400 errors', () => {
      const error = {
        response: {
          status: 400,
          data: { errorCode: 'INVALID_INPUT' },
        },
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Bad request: INVALID_INPUT');
    });

    it('should handle 401 errors', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Unauthorized: Invalid session token');
    });

    it('should handle 429 errors', () => {
      const error = {
        response: {
          status: 429,
        },
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Rate limit exceeded');
    });

    it('should handle 500 errors', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Betfair server error');
    });

    it('should handle unknown errors', () => {
      const error = {
        response: {
          status: 418,
          data: { errorCode: 'UNKNOWN_ERROR' },
        },
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Betfair API error: 418 - UNKNOWN_ERROR');
    });

    it('should handle request errors', () => {
      const error = {
        request: {},
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Betfair API request failed: No response received');
    });

    it('should handle generic errors', () => {
      const error = {
        message: 'Network error',
      };

      const result = client['handleApiError'](error);
      expect(result.message).toBe('Betfair API error: Network error');
    });
  });

  describe('getOdds', () => {
    it('should fetch odds for market IDs', async () => {
      const mockResponse = {
        data: [{ marketId: '1.123', runners: [] }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getOdds(['1.123']);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/marketBook/',
        {
          marketIds: ['1.123'],
          priceProjection: {
            priceData: ['EX_BEST_OFFERS'],
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getOdds errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(client.getOdds(['1.123'])).rejects.toThrow('Network error');
    });
  });

  describe('getMarkets', () => {
    it('should fetch markets with filter', async () => {
      const mockResponse = {
        data: [{ marketId: '1.123', marketName: 'Match Odds' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getMarkets({ eventTypeIds: ['1'] });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listMarketCatalogue/',
        {
          filter: { eventTypeIds: ['1'] },
          maxResults: 100,
          marketProjection: ['MARKET_START_TIME', 'RUNNER_DESCRIPTION'],
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getMarkets errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(client.getMarkets({ eventTypeIds: ['1'] })).rejects.toThrow('Network error');
    });
  });

  describe('placeBet', () => {
    it('should place a bet successfully', async () => {
      const mockResponse = {
        data: { status: 'SUCCESS', betId: '123456' },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const bet = {
        marketId: '1.123',
        selectionId: 12345,
        side: 'BACK',
        size: 10.0,
        price: 2.5,
      };

      const result = await client.placeBet(bet);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/placeOrders/',
        {
          marketId: '1.123',
          instructions: [{
            selectionId: 12345,
            side: 'BACK',
            orderType: 'LIMIT',
            limitOrder: {
              size: 10.0,
              price: 2.5,
              persistenceType: 'PERSIST',
            },
          }],
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle placeBet errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Insufficient funds'));

      const bet = {
        marketId: '1.123',
        selectionId: 12345,
        side: 'BACK',
        size: 10.0,
        price: 2.5,
      };

      await expect(client.placeBet(bet)).rejects.toThrow('Insufficient funds');
    });
  });

  describe('cancelBet', () => {
    it('should cancel a bet successfully', async () => {
      const mockResponse = {
        data: { status: 'SUCCESS', cancelledDate: '2024-01-01T00:00:00Z' },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.cancelBet('123456');

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/cancelOrders/',
        {
          marketId: '123456',
          instructions: [{
            betId: '123456',
            sizeReduction: 0,
          }],
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle cancelBet errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Bet not found'));

      await expect(client.cancelBet('123456')).rejects.toThrow('Bet not found');
    });
  });

  describe('getAccountDetails', () => {
    it('should fetch account details', async () => {
      const mockResponse = {
        data: { currencyCode: 'GBP', firstName: 'Test', lastName: 'User' },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getAccountDetails();

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/account/rest/v1/account/details/'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getAccountDetails errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getAccountDetails()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getAccountFunds', () => {
    it('should fetch account funds', async () => {
      const mockResponse = {
        data: { availableToBetBalance: 100.0, exposure: 50.0 },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getAccountFunds();

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/account/rest/v1/account/funds/'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getAccountFunds errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getAccountFunds()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getMarketBook', () => {
    it('should fetch market book', async () => {
      const mockResponse = {
        data: [{ marketId: '1.123', runners: [] }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getMarketBook('1.123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/marketBook/',
        {
          marketIds: ['1.123'],
          priceProjection: {
            priceData: ['EX_BEST_OFFERS', 'EX_TRADED'],
          },
        }
      );
      expect(result).toEqual(mockResponse.data[0]);
    });

    it('should handle getMarketBook errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Market not found'));

      await expect(client.getMarketBook('1.123')).rejects.toThrow('Market not found');
    });
  });

  describe('getMarketCatalogue', () => {
    it('should fetch market catalogue', async () => {
      const mockResponse = {
        data: [{ marketId: '1.123', marketName: 'Match Odds' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getMarketCatalogue('1.123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listMarketCatalogue/',
        {
          filter: { marketIds: ['1.123'] },
          maxResults: 1,
          marketProjection: ['MARKET_START_TIME', 'RUNNER_DESCRIPTION', 'MARKET_DESCRIPTION'],
        }
      );
      expect(result).toEqual(mockResponse.data[0]);
    });

    it('should handle getMarketCatalogue errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Market not found'));

      await expect(client.getMarketCatalogue('1.123')).rejects.toThrow('Market not found');
    });
  });

  describe('getEventTypes', () => {
    it('should fetch event types', async () => {
      const mockResponse = {
        data: [{ eventTypeId: '1', name: 'Soccer' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getEventTypes();

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listEventTypes/',
        {
          filter: {},
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getEventTypes errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getEventTypes()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getCompetitions', () => {
    it('should fetch competitions', async () => {
      const mockResponse = {
        data: [{ competitionId: '1', name: 'Premier League' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getCompetitions(['1']);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listCompetitions/',
        {
          filter: { eventTypeIds: ['1'] },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getCompetitions errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getCompetitions(['1'])).rejects.toThrow('Unauthorized');
    });
  });

  describe('getEvents', () => {
    it('should fetch events', async () => {
      const mockResponse = {
        data: [{ eventId: '1', name: 'Man City vs Liverpool' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getEvents(['1']);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listEvents/',
        {
          filter: { competitionIds: ['1'] },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getEvents errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getEvents(['1'])).rejects.toThrow('Unauthorized');
    });
  });

  describe('getMarketProfitAndLoss', () => {
    it('should fetch market profit and loss', async () => {
      const mockResponse = {
        data: [{ marketId: '1.123', profitAndLoss: 50.0 }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getMarketProfitAndLoss(['1.123']);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listMarketProfitAndLoss/',
        {
          marketIds: ['1.123'],
          includeSettledBets: true,
          includeBspBets: true,
          netOfCommission: true,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getMarketProfitAndLoss errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getMarketProfitAndLoss(['1.123'])).rejects.toThrow('Unauthorized');
    });
  });

  describe('getClearedOrders', () => {
    it('should fetch cleared orders', async () => {
      const mockResponse = {
        data: [{ betId: '123456', price: 2.5, size: 10.0 }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getClearedOrders({ eventTypeIds: ['1'] });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listClearedOrders/',
        {
          betStatus: 'SETTLED',
          orderBy: 'SETTLED_DATE',
          sortDir: 'EARLIEST_TO_LATEST',
          eventTypeIds: ['1'],
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getClearedOrders errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getClearedOrders({ eventTypeIds: ['1'] })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getMarketTypes', () => {
    it('should fetch market types', async () => {
      const mockResponse = {
        data: [{ marketType: 'MATCH_ODDS', marketCount: 100 }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getMarketTypes();

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listMarketTypes/',
        {
          filter: {},
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getMarketTypes errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getMarketTypes()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getCountries', () => {
    it('should fetch countries', async () => {
      const mockResponse = {
        data: [{ countryCode: 'GB', countryName: 'United Kingdom' }],
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.getCountries();

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/betting/rest/v1/listCountries/',
        {
          filter: {},
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getCountries errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(client.getCountries()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getTime', () => {
    it('should fetch current time', async () => {
      const mockResponse = {
        data: { exchangeTime: '2024-01-01T00:00:00Z' },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getTime();

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/betting/rest/v1/time/'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle getTime errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Service unavailable'));

      await expect(client.getTime()).rejects.toThrow('Service unavailable');
    });
  });
});