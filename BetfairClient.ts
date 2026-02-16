export class BetfairClient {
  private apiKey: string;
  private secret: string;
  private token: string | null = null;

  constructor(apiKey: string, secret: string) {
    this.apiKey = apiKey;
    this.secret = secret;
  }

  async authenticate(): Promise<string> {
    try {
      const response = await fetch("https://identitysso.betfair.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Application": this.apiKey,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.apiKey,
          client_secret: this.secret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.access_token;
      return this.token;
    } catch (error) {
      throw new Error(`Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOdds(eventId: string): Promise<any> {
    if (!this.token) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }

    try {
      const response = await fetch(`https://api.betfair.com/exchange/betting/rest/v1.0/events/${eventId}/`, {
        method: "GET",
        headers: {
          "X-Application": this.apiKey,
          "X-Authentication": this.token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get odds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEvents(): Promise<any> {
    if (!this.token) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }

    try {
      const response = await fetch("https://api.betfair.com/exchange/betting/rest/v1.0/events/", {
        method: "GET",
        headers: {
          "X-Application": this.apiKey,
          "X-Authentication": this.token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async placeBet(marketId: string, selectionId: string, side: "BACK" | "LAY", price: number, size: number): Promise<any> {
    if (!this.token) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }

    try {
      const response = await fetch("https://api.betfair.com/exchange/betting/rest/v1.0/orders/placeOrders", {
        method: "POST",
        headers: {
          "X-Application": this.apiKey,
          "X-Authentication": this.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketId,
          instructions: [{
            selectionId,
            side,
            orderType: "LIMIT",
            limitOrder: {
              price,
              size,
              persistenceType: "PERSIST",
            },
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to place bet: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}