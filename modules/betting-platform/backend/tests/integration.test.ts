import BettingService from '../services/BettingService';

describe('Integration Tests', () => {
  let bettingService: BettingService;

  beforeEach(() => {
    bettingService = new BettingService('redis://localhost:6379');
  });

  afterEach(async () => {
    await bettingService.close();
  });

  test('full flow: place bet with lock management', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    // First bet should succeed
    const firstResult = await bettingService.placeBet(userId, eventId, amount);
    expect(firstResult.status).toBe('placed');

    // Concurrent bet should fail
    await expect(bettingService.placeBet(userId, eventId, amount))
      .rejects.toThrow('Concurrent bet detected');

    // After first bet completes, second should succeed
    const secondResult = await bettingService.placeBet(userId, eventId, amount);
    expect(secondResult.status).toBe('placed');
  });

  test('should handle rapid consecutive bets', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    const results = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        const result = await bettingService.placeBet(userId, eventId, amount);
        results.push(result);
      } catch (error) {
        expect(error.message).toBe('Concurrent bet detected');
      }
    }
    
    // Should have at least one successful bet
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.status).toBe('placed');
    });
  });
});