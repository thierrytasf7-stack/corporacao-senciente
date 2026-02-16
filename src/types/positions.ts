export interface Position {
  id: string;
  title: string;
  description: string;
  stake: number;
  potential: number;
  status: "active" | "closed" | "pending";
  entryDate: string;
  exitDate?: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercentage: number;
}