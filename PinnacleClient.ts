export class PinnacleClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.pinnacle.com';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
  }

  async getOdds(sportId: number, eventId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/odds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          sportId,
          eventId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching odds:', error);
      throw error;
    }
  }

  async getLines(sportId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/lines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          sportId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lines: ${response.statusText}`);
      }

      const data = await response.json();
      return data.lines || [];
    } catch (error) {
      console.error('Error fetching lines:', error);
      throw error;
    }
  }

  async getSports(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/sports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sports: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sports || [];
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  }

  async getEvents(sportId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          sportId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}