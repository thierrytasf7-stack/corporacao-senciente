import { AxiosInstance, create } from 'axios';

export class BetfairClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(private apiKey: string, private username: string, private password: string) {
    this.api = create({
      baseURL: 'https://api.betfair.com/exchange',
      headers: {
        'X-Application': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticate(): Promise<void> {
    try {
      const response = await this.api.post('/auth/login', {
        username: this.username,
        password: this.password,
      });
      this.token = response.data.token;
      this.api.defaults.headers['Authorization'] = `Bearer ${this.token}`;
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarket(marketId: string): Promise<any> {
    try {
      const response = await this.api.get(`/betting/rest/v1.0/markets/${marketId}/book`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get market ${marketId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async placeBet(marketId: string, amount: number): Promise<any> {
    try {
      const response = await this.api.post('/betting/rest/v1.0/bets', {
        marketId,
        amount,
        side: 'BACK',
        price: 2.0,
      });
      return response.data.confirmation;
    } catch (error) {
      throw new Error(`Failed to place bet on market ${marketId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelBet(betId: string): Promise<any> {
    try {
      const response = await this.api.post('/betting/rest/v1.0/bets/cancel', {
        betId,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to cancel bet ${betId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class BetfairError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BetfairError';
  }
}