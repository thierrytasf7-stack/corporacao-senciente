import BetLockManager, { BetLockManager as BetLockManagerClass } from './BetLockManager';

export interface Bet {
  userId: string;
  eventId: string;
  amount: number;
  status: 'placed' | 'confirmed' | 'cancelled';
  timestamp: string;
}

export default class BettingService {
  private lockManager: BetLockManagerClass;

  constructor(redisUrl?: string) {
    this.lockManager = new BetLockManagerClass({ redisUrl });
  }

  public async placeBet(userId: string, eventId: string, amount: number): Promise<Bet> {
    const lockAcquired = await this.lockManager.acquireLock(userId, eventId);
    
    if (!lockAcquired) {
      throw new Error('Concurrent bet detected');
    }

    try {
      // Validate bet (example: check balance, event status, etc.)
      await this.validateBet(userId, eventId, amount);
      
      // Process bet (example: update database, deduct balance, etc.)
      const bet = await this.processBet(userId, eventId, amount);
      
      return bet;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    } finally {
      await this.lockManager.releaseLock(userId, eventId);
    }
  }

  private async validateBet(userId: string, eventId: string, amount: number): Promise<void> {
    // Example validation logic
    if (amount <= 0) {
      throw new Error('Invalid bet amount');
    }
    
    // Check if user has sufficient balance (mock implementation)
    const userBalance = await this.getUserBalance(userId);
    if (userBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Check if event is open for betting (mock implementation)
    const eventStatus = await this.getEventStatus(eventId);
    if (eventStatus !== 'open') {
      throw new Error('Event is not open for betting');
    }
  }

  private async processBet(userId: string, eventId: string, amount: number): Promise<Bet> {
    // Mock bet processing - in real implementation, this would update the database
    const bet: Bet = {
      userId,
      eventId,
      amount,
      status: 'placed',
      timestamp: new Date().toISOString()
    };
    
    // Mock database update
    await this.updateUserBalance(userId, -amount);
    
    return bet;
  }

  private async getUserBalance(userId: string): Promise<number> {
    // Mock implementation - in real app, this would query the database
    return 1000; // Default balance for testing
  }

  private async getEventStatus(eventId: string): Promise<string> {
    // Mock implementation - in real app, this would query the database
    return 'open'; // Default status for testing
  }

  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    // Mock implementation - in real app, this would update the database
    console.log(`Updated balance for user ${userId} by ${amount}`);
  }

  public async close(): Promise<void> {
    await this.lockManager.close();
  }
}