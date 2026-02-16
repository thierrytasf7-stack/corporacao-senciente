export interface Bet {
  id: string;
  userId: string;
  stake: number;
  odds: number;
  status: 'active' | 'settled' | 'cashed_out';
}