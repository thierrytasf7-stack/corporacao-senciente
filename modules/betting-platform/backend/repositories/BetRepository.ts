import { Bet } from '../models/Bet';

export class BetRepository {
  private bets: Bet[] = [];

  async findById(id: string): Promise<Bet | undefined> {
    return this.bets.find(bet => bet.id === id);
  }

  async save(bet: Bet): Promise<void> {
    const index = this.bets.findIndex(b => b.id === bet.id);
    if (index >= 0) {
      this.bets[index] = bet;
    } else {
      this.bets.push(bet);
    }
  }

  async create(bet: Bet): Promise<Bet> {
    bet.id = this.generateId();
    this.bets.push(bet);
    return bet;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}