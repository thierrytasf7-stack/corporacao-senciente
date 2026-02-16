import { Pool } from 'pg';
import axios from 'axios';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

interface BetfairHistoricalOdds {
  marketId: string;
  selectionId: string;
  eventId: string;
  sport: string;
  competition: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  price: number;
  size: number;
  side: 'back' | 'lay';
  timestamp: string;
}

interface MatchResult {
  eventId: string;
  sport: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  matchName: string;
  matchDate: string;
  homeScore?: number;
  awayScore?: number;
  fullTimeResult?: string;
  status: string;
}

export class HistoricalDataLoader {
  private dbPool: Pool;
  private betfairApiKey: string;
  private betfairApiUrl: string;
  private batchSize: number;

  constructor(dbPool: Pool, betfairApiKey: string, betfairApiUrl: string = 'https://api.betfair.com/exchange/betting/rest/v1.0', batchSize: number = 1000) {
    this.dbPool = dbPool;
    this.betfairApiKey = betfairApiKey;
    this.betfairApiUrl = betfairApiUrl;
    this.batchSize = batchSize;
  }

  /**
   * Fetch historical odds from Betfair API for a specific date range
   */
  private async fetchHistoricalOdds(startDate: string, endDate: string, sport: string): Promise<BetfairHistoricalOdds[]> {
    try {
      const response = await axios.get(`${this.betfairApiUrl}/listMarketBook/`, {
        headers: {
          'X-Authentication': this.betfairApiKey,
          'Content-Type': 'application/json'
        },
        params: {
          marketIds: await this.getMarketIdsForSport(sport),
          priceProjection: {
            priceData: ['EX_BEST_OFFERS']
          },
          dateRange: {
            from: startDate,
            to: endDate
          }
        }
      });

      return response.data.map((marketBook: any) => ({
        marketId: marketBook.marketId,
        selectionId: marketBook.selectionId,
        eventId: marketBook.event.id,
        sport: sport,
        competition: marketBook.event.competition?.name || null,
        eventName: marketBook.event.name,
        marketName: marketBook.marketName,
        selectionName: marketBook.selectionName,
        price: marketBook.price,
        size: marketBook.size,
        side: marketBook.side,
        timestamp: DateTime.utc().toISO()
      }));
    } catch (error) {
      console.error('Error fetching historical odds:', error);
      throw new Error(`Failed to fetch historical odds: ${error}`);
    }
  }

  /**
   * Fetch match results from public API
   */
  private async fetchMatchResults(startDate: string, endDate: string, sport: string): Promise<MatchResult[]> {
    try {
      const response = await axios.get(`https://api.football-data.org/v4/matches`, {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY
        },
        params: {
          dateFrom: startDate,
          dateTo: endDate,
          competitions: await this.getCompetitionIdsForSport(sport)
        }
      });

      return response.data.matches.map((match: any) => ({
        eventId: match.id,
        sport: sport,
        competition: match.competition.name,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        matchName: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        matchDate: match.utcDate,
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        fullTimeResult: this.calculateResult(match.score.fullTime.home, match.score.fullTime.away),
        status: match.status
      }));
    } catch (error) {
      console.error('Error fetching match results:', error);
      throw new Error(`Failed to fetch match results: ${error}`);
    }
  }

  /**
   * Transform and validate data before loading
   */
  private transformAndValidateOdds(odds: BetfairHistoricalOdds[]): any[] {
    return odds.map((odd) => ({
      id: uuidv4(),
      betfair_market_id: odd.marketId,
      betfair_selection_id: odd.selectionId,
      betfair_event_id: odd.eventId,
      sport: odd.sport,
      competition: odd.competition,
      event_name: odd.eventName,
      market_name: odd.marketName,
      selection_name: odd.selectionName,
      price: odd.price,
      size: odd.size,
      side: odd.side,
      timestamp_utc: odd.timestamp,
      captured_at: DateTime.utc().toISO(),
      is_active: true,
      source: 'betfair'
    }));
  }

  /**
   * Transform and validate match results
   */
  private transformAndValidateMatchResults(results: MatchResult[]): any[] {
    return results.map((result) => ({
      id: uuidv4(),
      betfair_event_id: result.eventId,
      external_event_id: result.eventId,
      sport: result.sport,
      competition: result.competition,
      competition_id: result.eventId,
      home_team: result.homeTeam,
      away_team: result.awayTeam,
      match_name: result.matchName,
      match_date: result.matchDate,
      home_score: result.homeScore,
      away_score: result.awayScore,
      full_time_result: result.fullTimeResult,
      half_time_result: null,
      status: result.status,
      is_active: true,
      created_at: DateTime.utc().toISO(),
      updated_at: DateTime.utc().toISO()
    }));
  }

  /**
   * Load data into PostgreSQL with error handling
   */
  private async loadHistoricalOdds(odds: any[]): Promise<void> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO historical_odds (
          id, betfair_market_id, betfair_selection_id, betfair_event_id, sport, 
          competition, event_name, market_name, selection_name, price, size, 
          side, timestamp_utc, captured_at, is_active, source
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (betfair_market_id, betfair_selection_id, timestamp_utc, side) 
        DO UPDATE SET 
          price = EXCLUDED.price,
          size = EXCLUDED.size,
          updated_at = CURRENT_TIMESTAMP
      `;

      for (const odd of odds) {
        await client.query(insertQuery, [
          odd.id, odd.betfair_market_id, odd.betfair_selection_id, odd.betfair_event_id,
          odd.sport, odd.competition, odd.event_name, odd.market_name, odd.selection_name,
          odd.price, odd.size, odd.side, odd.timestamp_utc, odd.captured_at, odd.is_active, odd.source
        ]);
      }

      await client.query('COMMIT');
      console.log(`Successfully loaded ${odds.length} historical odds records`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error loading historical odds:', error);
      throw new Error(`Failed to load historical odds: ${error}`);
    } finally {
      client.release();
    }
  }

  /**
   * Load match results into PostgreSQL
   */
  private async loadMatchResults(results: any[]): Promise<void> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO match_results (
          id, betfair_event_id, external_event_id, sport, competition, 
          competition_id, home_team, away_team, match_name, match_date, 
          home_score, away_score, full_time_result, half_time_result, 
          status, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (betfair_event_id) 
        DO UPDATE SET 
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          full_time_result = EXCLUDED.full_time_result,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
      `;

      for (const result of results) {
        await client.query(insertQuery, [
          result.id, result.betfair_event_id, result.external_event_id, result.sport,
          result.competition, result.competition_id, result.home_team, result.away_team,
          result.match_name, result.match_date, result.home_score, result.away_score,
          result.full_time_result, result.half_time_result, result.status, result.is_active,
          result.created_at, result.updated_at
        ]);
      }

      await client.query('COMMIT');
      console.log(`Successfully loaded ${results.length} match results records`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error loading match results:', error);
      throw new Error(`Failed to load match results: ${error}`);
    } finally {
      client.release();
    }
  }

  /**
   * Main method to load historical data for a date range
   */
  public async loadHistoricalData(startDate: string, endDate: string): Promise<void> {
    console.log(`Starting historical data load from ${startDate} to ${endDate}`);

    // Get all active sports
    const sports = await this.getActiveSports();
    
    for (const sport of sports) {
      console.log(`Processing sport: ${sport.sport_name}`);
      
      // Fetch and load historical odds
      const odds = await this.fetchHistoricalOdds(startDate, endDate, sport.sport_name);
      const transformedOdds = this.transformAndValidateOdds(odds);
      await this.loadHistoricalOdds(transformedOdds);
      
      // Fetch and load match results
      const results = await this.fetchMatchResults(startDate, endDate, sport.sport_name);
      const transformedResults = this.transformAndValidateMatchResults(results);
      await this.loadMatchResults(transformedResults);
      
      console.log(`Completed processing sport: ${sport.sport_name}`);
    }
    
    console.log('Historical data load completed successfully');
  }

  /**
   * Helper methods
   */
  private async getActiveSports(): Promise<any[]> {
    const result = await this.dbPool.query('SELECT * FROM sports WHERE is_active = TRUE');
    return result.rows;
  }

  private async getMarketIdsForSport(sport: string): Promise<string[]> {
    const result = await this.dbPool.query(
      'SELECT betfair_market_type FROM markets WHERE sport_id = (SELECT id FROM sports WHERE sport_name = $1)',
      [sport]
    );
    return result.rows.map((row: any) => row.betfair_market_type);
  }

  private async getCompetitionIdsForSport(sport: string): Promise<string[]> {
    // This would need to be implemented based on available competition data
    return ['PL', 'EL', 'CL']; // Example competition codes
  }

  private calculateResult(homeScore: number, awayScore: number): string | null {
    if (homeScore === null || awayScore === null) return null;
    
    if (homeScore > awayScore) return 'H';
    if (homeScore < awayScore) return 'A';
    return 'D';
  }

  /**
   * Performance optimization methods
   */
  public async loadHistoricalDataInBatches(startDate: string, endDate: string): Promise<void> {
    console.log(`Starting batch historical data load from ${startDate} to ${endDate}`);

    const sports = await this.getActiveSports();
    
    for (const sport of sports) {
      console.log(`Processing sport: ${sport.sport_name}`);
      
      // Process in date batches for better memory management
      const currentDate = DateTime.fromISO(startDate);
      const endDateObj = DateTime.fromISO(endDate);
      
      while (currentDate <= endDateObj) {
        const batchStartDate = currentDate.toISODate();
        const batchEndDate = currentDate.plus({ days: 1 }).toISODate();
        
        console.log(`Processing batch: ${batchStartDate} to ${batchEndDate}`);
        
        try {
          // Fetch and load historical odds
          const odds = await this.fetchHistoricalOdds(batchStartDate, batchEndDate, sport.sport_name);
          const transformedOdds = this.transformAndValidateOdds(odds);
          await this.loadHistoricalOdds(transformedOdds);
          
          // Fetch and load match results
          const results = await this.fetchMatchResults(batchStartDate, batchEndDate, sport.sport_name);
          const transformedResults = this.transformAndValidateMatchResults(results);
          await this.loadMatchResults(transformedResults);
          
          console.log(`Completed batch for sport: ${sport.sport_name}`);
          
        } catch (error) {
          console.error(`Error processing batch for sport ${sport.sport_name}:`, error);
          // Continue with next batch
        }
        
        currentDate.plus({ days: 1 });
      }
      
      console.log(`Completed processing sport: ${sport.sport_name}`);
    }
    
    console.log('Batch historical data load completed successfully');
  }

  /**
   * Health check method
   */
  public async healthCheck(): Promise<{ database: boolean; betfairApi: boolean; footballDataApi: boolean }> {
    const health = {
      database: false,
      betfairApi: false,
      footballDataApi: false
    };

    try {
      // Test database connection
      const result = await this.dbPool.query('SELECT 1');
      health.database = result.rows.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // Test Betfair API
      const response = await axios.get(`${this.betfairApiUrl}/listEventTypes/`, {
        headers: {
          'X-Authentication': this.betfairApiKey,
          'Content-Type': 'application/json'
        },
        params: {
          filter: {}
        }
      });
      health.betfairApi = response.status === 200;
    } catch (error) {
      console.error('Betfair API health check failed:', error);
    }

    try {
      // Test Football Data API
      const response = await axios.get('https://api.football-data.org/v4/areas', {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY
        }
      });
      health.footballDataApi = response.status === 200;
    } catch (error) {
      console.error('Football Data API health check failed:', error);
    }

    return health;
  }
}