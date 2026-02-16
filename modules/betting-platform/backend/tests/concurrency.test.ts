import BettingService from '../services/BettingService';

describe('Concurrency Tests', () => {
  let bettingService: BettingService;

  beforeEach(() => {
    bettingService = new BettingService('redis://localhost:6379');
  });

  afterEach(async () => {
    await bettingService.close();
  });

  test('should handle multiple concurrent bets on different events', async () => {
    const userId = 'user1';
    const events = ['event1', 'event2', 'event3'];
    const amount = 100;

    const promises = events.map(event => 
      bettingService.placeBet(userId, event, amount)
    );

    const results = await Promise.all(promises);
    
    expect(results.length).toBe(3);
    results.forEach(result => {
      expect(result.status).toBe('placed');
    });
  });

  test('should prevent concurrent bets on same event', async () => {
    const userId = 'user1';
    const eventId = 'event1';
    const amount = 100;

    const promises = Array(5).fill(null).map(() => 
      bettingService.placeBet(userId, eventId, amount)
    );

    const results = await Promise.allSettled(promises);
    
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);
    
    rejected.forEach(r => {
      expect(r.reason.message).toBe('Concurrent bet detected');
    });
  });

  test('should allow concurrent bets from different users on same event', async () => {
    const users = ['user1', 'user2', 'user3'];
    const eventId = 'event1';
    const amount = 100;

    const promises = users.map(user => 
      bettingService.placeBet(user, eventId, amount)
    );

    const results = await Promise.all(promises);
    
    expect(results.length).toBe(3);
    results.forEach(result => {
      expect(result.status).toBe('placed');
    });
  });
});