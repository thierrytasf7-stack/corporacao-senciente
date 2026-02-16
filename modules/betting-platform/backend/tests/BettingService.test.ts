import BettingService from '../services/BettingService';

describe('BettingService', () => {
  let bettingService: BettingService;

  beforeEach(() => {
    bettingService = new BettingService('redis://localhost:6379');
  });

  afterEach(async () => {
    await bettingService.close();
  });

  test('should place bet successfully', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    const result = await bettingService.placeBet(userId, eventId, amount);
    expect(result).toBeDefined();
    expect(result.userId).toBe(userId);
    expect(result.eventId).toBe(eventId);
    expect(result.amount).toBe(amount);
    expect(result.status).toBe('placed');
  });

  test('should throw error on concurrent bet', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    const firstBet = bettingService.placeBet(userId, eventId, amount);
    
    await expect(bettingService.placeBet(userId, eventId, amount)).rejects.toThrow('Concurrent bet detected');
    
    await firstBet;
  });

  test('should release lock after bet completion', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    await bettingService.placeBet(userId, eventId, amount);

    const result = await bettingService.placeBet(userId, eventId, amount);
    expect(result).toBeDefined();
  });
});