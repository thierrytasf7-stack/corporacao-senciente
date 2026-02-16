import { BetRepository } from '../repositories/BetRepository';
import { Bet } from '../models/Bet';

export class CashoutService {
  constructor(private betRepository: BetRepository) {}

  async validateCashout(betId: string, currentOdds: number): Promise<{
    allowed: boolean;
    value: number;
    reason: string;
  }> {
    const bet = await this.betRepository.findById(betId);
    
    if (!bet) {
      return { allowed: false, value: 0, reason: 'Bet not found' };
    }

    if (bet.status !== 'active') {
      return { allowed: false, value: 0, reason: 'Bet is not active' };
    }

    const cashoutValue = this.calculateCashoutValue(bet, currentOdds);
    return { allowed: true, value: cashoutValue, reason: 'Cashout available' };
  }

  async processCashout(betId: string, userId: string): Promise<{
    success: boolean;
    message: string;
    cashoutValue?: number;
  }> {
    const validation = await this.validateCashout(betId, 0);
    
    if (!validation.allowed) {
      return { success: false, message: validation.reason };
    }

    const bet = await this.betRepository.findById(betId);
    if (!bet) {
      return { success: false, message: 'Bet not found' };
    }

    if (bet.userId !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    bet.status = 'cashed_out';
    await this.betRepository.save(bet);

    const cashoutValue = this.calculateCashoutValue(bet, 0);
    return { 
      success: true, 
      message: 'Cashout processed successfully',
      cashoutValue
    };
  }

  private calculateCashoutValue(bet: Bet, currentOdds: number): number {
    const initialStake = bet.stake;
    const potentialReturn = initialStake * currentOdds;
    const cashoutValue = potentialReturn * 0.8; // 80% of potential return
    return parseFloat(cashoutValue.toFixed(2));
  }
}