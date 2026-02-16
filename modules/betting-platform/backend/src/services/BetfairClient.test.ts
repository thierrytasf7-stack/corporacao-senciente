import { BetfairClient, BetfairCredentials } from './services/BetfairClient';
import { BetfairError } from '../types/betfair';

describe('BetfairClient', () => {
  let client: BetfairClient;
  const mockCredentials: BetfairCredentials = {
    appKey: 'test-app-key',
    username: 'test-user',
    password: 'test-pass',
    certFile: 'test-cert.pem',
    keyFile: 'test-key.pem',
  };

  beforeEach(() => {
    client = new BetfairClient(mockCredentials);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(client).toBeDefined();
      expect(client.credentials).toEqual(mockCredentials);
    });
  });

  describe('OAuth2 authentication', () => {
    it('should handle token refresh', async () => {
      // Mock the authApi to avoid real network calls
      jest.spyOn(client['authApi'], 'post').mockResolvedValue({
        data: {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh',
          scope: 'app',
        },
      });

      await client['refreshToken']();
      expect(client['token']).toBeDefined();
      expect(client['token']?.access_token).toBe('mock-token');
    });

    it('should handle authentication errors', async () => {
      jest.spyOn(client['authApi'], 'post').mockRejectedValue(new Error('Auth failed'));
      
      await expect(client['refreshToken']()).rejects.toThrow('Failed to refresh Betfair token');
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      const limiter = client['rateLimiter'];
      const uuid = 'test-uuid';

      // First request should succeed
      await expect(limiter.consume(uuid)).resolves.toBeUndefined();

      // Exceeding rate limit should throw
      jest.spyOn(limiter, 'consume').mockRejectedValue({ msBeforeNext: 1000 });
      
      await expect(client['enforceRateLimit']()).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('error handling', () => {
    it('should format errors correctly', () => {
      const error = new Error('Test error');
      const formattedError = client['handleError'](error);
      
      expect(formattedError).toHaveProperty('error');
      expect(formattedError).toHaveProperty('requestUUID');
      expect(formattedError).toHaveProperty('statusCode', 500);
    });
  });

  describe('getOdds', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: {
          marketId: '1.123',
          runners: [{
            selectionId: 1,
            runnerName: 'Runner 1',
            ex: {
              availableToBack: [{ price: 2.0, size: 10 }],
              availableToLay: [{ price: 2.1, size: 5 }],
            },
          }],
        },
      });

      const result = await client.getOdds(['1.123']);
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('marketId', '1.123');
    });

    it('should handle API errors', async () => {
      jest.spyOn(client['api'], 'post').mockRejectedValue(new Error('API error'));
      
      await expect(client.getOdds(['1.123'])).rejects.toThrow('API error');
    });
  });

  describe('getMarkets', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: [{
          marketId: '1.123',
          marketName: 'Test Market',
          runners: [{
            selectionId: 1,
            runnerName: 'Runner 1',
          }],
        }],
      });

      const result = await client.getMarkets(['1']);
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('marketId', '1.123');
    });
  });

  describe('listEvents', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: [{
          event: {
            id: '1',
            name: 'Test Event',
            openDate: '2024-01-01T12:00:00Z',
          },
        }],
      });

      const result = await client.listEvents(['1']);
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('eventId', '1');
    });
  });

  describe('placeBet', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: {
          status: 'SUCCESS',
        },
      });

      const result = await client.placeBet('1.123', 1, 'BACK', 2.0, 10);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status', 'SUCCESS');
    });
  });

  describe('cancelAllOrders', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: {
          status: 'SUCCESS',
        },
      });

      const result = await client.cancelAllOrders('1.123');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status', 'SUCCESS');
    });
  });

  describe('account methods', () => {
    it('should get account details', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: {
          currencyCode: 'GBP',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      const result = await client.getAccountDetails();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('currencyCode', 'GBP');
    });

    it('should get account funds', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: {
          availableToBetBalance: 1000,
          exposure: 0,
        },
      });

      const result = await client.getAccountFunds();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('availableToBetBalance', 1000);
    });
  });

  describe('getMarketBook', () => {
    it('should call API with correct parameters', async () => {
      jest.spyOn(client['api'], 'post').mockResolvedValue({
        data: [{
          marketId: '1.123',
          runners: [{
            selectionId: 1,
            ex: {
              availableToBack: [{ price: 2.0, size: 10 }],
            },
          }],
        }],
      });

      const result = await client.getMarketBook('1.123');
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('marketId', '1.123');
    });
  });
});

// Integration tests
describe('BetfairClient Integration', () => {
  let client: BetfairClient;

  beforeAll(() => {
    client = new BetfairClient({
      appKey: process.env.BETFAIR_APP_KEY || 'test-key',
      username: process.env.BETFAIR_USERNAME || 'test-user',
      password: process.env.BETFAIR_PASSWORD || 'test-pass',
      certFile: process.env.BETFAIR_CERT_FILE || 'test-cert.pem',
      keyFile: process.env.BETFAIR_KEY_FILE || 'test-key.pem',
    });
  });

  it('should initialize without throwing errors', () => {
    expect(() => new BetfairClient({
      appKey: 'test',
      username: 'test',
      password: 'test',
      certFile: 'test',
      keyFile: 'test',
    })).not.toThrow();
  });

  it('should have all required methods', () => {
    expect(client).toHaveProperty('getOdds');
    expect(client).toHaveProperty('getMarkets');
    expect(client).toHaveProperty('listEvents');
    expect(client).toHaveProperty('placeBet');
    expect(client).toHaveProperty('cancelAllOrders');
    expect(client).toHaveProperty('getAccountDetails');
    expect(client).toHaveProperty('getAccountFunds');
    expect(client).toHaveProperty('getMarketBook');
  });

  // Skip integration tests if credentials are not available
  if (process.env.BETFAIR_APP_KEY && process.env.BETFAIR_USERNAME && process.env.BETFAIR_PASSWORD) {
    it('should be able to get account details', async () => {
      const result = await client.getAccountDetails();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('currencyCode');
    }, 10000); // 10 second timeout for network requests

    it('should be able to get account funds', async () => {
      const result = await client.getAccountFunds();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('availableToBetBalance');
    }, 10000);
  }
});