import { BetfairClient } from './BetfairClient';
import { AxiosInstance, create } from 'axios';
import { Pool } from 'pg';
import { DateTime } from 'luxon';

export interface HistoricalOdds {
  sport: string;
  market: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  bookmaker: string;
  odds: Record<string, number>;
  timestamp: Date;
}

export interface MatchResult {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  homeScore?: number;
  awayScore?: number;
  winner?: 'home' | 'away' | 'draw';
  competition?: string;
  season?: string;
}

export class HistoricalDataLoader {
  private betfair: BetfairClient;
  private api: AxiosInstance;
  private db: Pool;

  constructor(
    betfairApiKey: string,
    betfairUsername: string,
    betfairPassword: string,
    dbConnectionString: string
  ) {
    this.betfair = new BetfairClient(betfairApiKey, betfairUsername, betfairPassword);
    this.api = create({
      baseURL: 'https://api.football-data.org/v4',
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });
    this.db = new Pool({
      connectionString: dbConnectionString,
      ssl: process.env.NODE_ENV === 'production',
    });
  }

  async initialize(): Promise<void> {
    await this.betfair.authenticate();
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS sports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS match_results (
        id SERIAL PRIMARY KEY,
        sport_id INTEGER REFERENCES sports(id) ON DELETE CASCADE,
        home_team VARCHAR(200) NOT NULL,
        away_team VARCHAR(200) NOT NULL,
        match_date TIMESTAMP WITH TIME ZONE NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        winner VARCHAR(10),
        competition VARCHAR(200),
        season VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sport_id, home_team, away_team, match_date)
      );

      CREATE TABLE IF NOT EXISTS historical_odds (
        id SERIAL PRIMARY KEY,
        sport_id INTEGER REFERENCES sports(id) ON DELETE CASCADE,
        market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES match_results(id) ON DELETE CASCADE,
        bookmaker VARCHAR(50) NOT NULL,
        odds JSONB NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_historical_odds_match (match_id),
        INDEX idx_historical_odds_timestamp (timestamp),
        INDEX idx_historical_odds_bookmaker (bookmaker)
      );

      CREATE INDEX IF NOT EXISTS idx_match_results_sport_date ON match_results(sport_id, match_date);
      CREATE INDEX IF NOT EXISTS idx_match_results_date ON match_results(match_date);
      CREATE INDEX IF NOT EXISTS idx_historical_odds_sport_market ON historical_odds(sport_id, market_id);

      INSERT INTO sports (name) VALUES ('Soccer'), ('Tennis'), ('Basketball'), ('American Football'), ('Baseball')
      ON CONFLICT (name) DO NOTHING;

      INSERT INTO markets (name) VALUES ('Match Winner'), ('Over/Under'), ('Handicap'), ('Correct Score'), ('Both Teams to Score')
      ON CONFLICT (name) DO NOTHING;
    `;

    await this.db.query(query);
  }

  async loadHistoricalData(startDate: Date, endDate: Date): Promise<void> {
    console.log(`Loading historical data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const sports = ['soccer'];
    const batchSize = 1000;
    let totalRecords = 0;

    for (const sport of sports) {
      const competitions = await this.getCompetitions(sport);
      
      for (const competition of competitions) {
        const matches = await this.getMatches(competition, startDate, endDate);
        
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          await this.processMatchBatch(batch, sport);
          totalRecords += batch.length;
          console.log(`Processed ${totalRecords} matches...`);
        }
      }
    }

    console.log(`Completed loading ${totalRecords} matches with historical odds`);
  }

  private async getCompetitions(sport: string): Promise<string[]> {
    // For soccer, we can use predefined competitions
    const soccerCompetitions = [
      'PL', 'BL1', 'PD', 'SA', 'FL1', 'DED', 'PPL', 'AAL', 'BSA', 'CL',
      'EL', 'WC', 'EC', 'CLF', 'ELC', 'ECL', 'ECLW', 'WWC', 'CA', 'COPA',
      'AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'WCQ', 'EURO', 'COPA AMERICA',
      'AFCON', 'GOLD CUP', 'COPA LIBERTADORES', 'COPA SUDAMERICANA'
    ];

    if (sport === 'soccer') {
      return soccerCompetitions;
    }

    return [];
  }

  private async getMatches(competition: string, startDate: Date, endDate: Date): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      try {
        const response = await this.api.get(`/competitions/${competition}/matches`, {
          params: {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0],
            page: page,
            limit: pageSize,
          },
        });

        const data = response.data;
        matches.push(...data.matches.map((match: any) => ({
          sport: 'soccer',
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          matchDate: new Date(match.utcDate),
          homeScore: match.score?.fullTime?.home,
          awayScore: match.score?.fullTime?.away,
          winner: this.determineWinner(match.score?.fullTime?.home, match.score?.fullTime?.away),
          competition: data.competition.name,
          season: data.season?.year || data.season?.startDate?.split('-')[0],
        })));

        if (data.matches.length < pageSize) break;
        page++;
      } catch (error) {
        console.error(`Error fetching matches for competition ${competition}:`, error);
        break;
      }
    }

    return matches;
  }

  private determineWinner(homeScore?: number, awayScore?: number): 'home' | 'away' | 'draw' | undefined {
    if (homeScore === undefined || awayScore === undefined) return undefined;
    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'away';
    return 'draw';
  }

  private async processMatchBatch(matches: MatchResult[], sport: string): Promise<void> {
    const sportId = await this.getSportId(sport);
    const batchSize = 10;

    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      
      await this.db.query('BEGIN');
      
      try {
        for (const match of batch) {
          await this.processMatch(match, sportId);
        }
        
        await this.db.query('COMMIT');
      } catch (error) {
        await this.db.query('ROLLBACK');
        console.error('Error processing match batch, rolling back:', error);
        throw error;
      }
    }
  }

  private async processMatch(match: MatchResult, sportId: number): Promise<void> {
    const matchId = await this.upsertMatchResult(match, sportId);
    
    if (match.matchDate <= new Date()) {
      await this.fetchAndStoreOdds(match, matchId);
    }
  }

  private async upsertMatchResult(match: MatchResult, sportId: number): Promise<number> {
    const query = `
      INSERT INTO match_results (sport_id, home_team, away_team, match_date, home_score, away_score, winner, competition, season)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (sport_id, home_team, away_team, match_date)
      DO UPDATE SET
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        winner = EXCLUDED.winner,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const result = await this.db.query(query, [
      sportId,
      match.homeTeam,
      match.awayTeam,
      match.matchDate,
      match.homeScore,
      match.awayScore,
      match.winner,
      match.competition,
      match.season,
    ]);

    return result.rows[0].id;
  }

  private async fetchAndStoreOdds(match: MatchResult, matchId: number): Promise<void> {
    const timestamp = DateTime.fromJSDate(match.matchDate).minus({ hours: 2 }).toJSDate();
    
    try {
      const odds = await this.getHistoricalOdds(match, timestamp);
      
      if (odds) {
        await this.storeOdds(odds, matchId);
      }
    } catch (error) {
      console.error(`Error fetching odds for match ${match.homeTeam} vs ${match.awayTeam}:`, error);
    }
  }

  private async getHistoricalOdds(match: MatchResult, timestamp: Date): Promise<HistoricalOdds | null> {
    // Simulate fetching historical odds from Betfair API
    // In a real implementation, this would use Betfair's historical data API
    const simulatedOdds: Record<string, number> = {
      '1': Math.random() * 3 + 1, // Home win
      'X': Math.random() * 3 + 1, // Draw
      '2': Math.random() * 3 + 1, // Away win
    };

    return {
      sport: match.sport,
      market: 'Match Winner',
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: match.matchDate,
      bookmaker: 'Betfair',
      odds: simulatedOdds,
      timestamp: timestamp,
    };
  }

  private async storeOdds(oddsData: HistoricalOdds, matchId: number): Promise<void> {
    const sportId = await this.getSportId(oddsData.sport);
    const marketId = await this.getMarketId(oddsData.market);

    const query = `
      INSERT INTO historical_odds (sport_id, market_id, match_id, bookmaker, odds, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (sport_id, market_id, match_id, bookmaker, timestamp)
      DO NOTHING
    `;

    await this.db.query(query, [
      sportId,
      marketId,
      matchId,
      oddsData.bookmaker,
      JSON.stringify(oddsData.odds),
      oddsData.timestamp,
    ]);
  }

  private async getSportId(sportName: string): Promise<number> {
    const query = 'SELECT id FROM sports WHERE name = $1';
    const result = await this.db.query(query, [sportName]);
    return result.rows[0]?.id || 0;
  }

  private async getMarketId(marketName: string): Promise<number> {
    const query = 'SELECT id FROM markets WHERE name = $1';
    const result = await this.db.query(query, [marketName]);
    return result.rows[0]?.id || 0;
  }

  async getIncrementalData(startDate: Date): Promise<void> {
    console.log(`Loading incremental data from ${startDate.toISOString()}`);

    const sports = ['soccer'];
    const batchSize = 500;
    let totalRecords = 0;

    for (const sport of sports) {
      const competitions = await this.getCompetitions(sport);
      
      for (const competition of competitions) {
        const matches = await this.getRecentMatches(competition, startDate);
        
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          await this.processMatchBatch(batch, sport);
          totalRecords += batch.length;
          console.log(`Processed ${totalRecords} matches...`);
        }
      }
    }

    console.log(`Completed loading ${totalRecords} incremental matches`);
  }

  private async getRecentMatches(competition: string, startDate: Date): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];
    let page = 1;
    const pageSize = 100;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Look ahead 7 days

    while (true) {
      try {
        const response = await this.api.get(`/competitions/${competition}/matches`, {
          params: {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0],
            page: page,
            limit: pageSize,
          },
        });

        const data = response.data;
        matches.push(...data.matches.map((match: any) => ({
          sport: 'soccer',
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          matchDate: new Date(match.utcDate),
          homeScore: match.score?.fullTime?.home,
          awayScore: match.score?.fullTime?.away,
          winner: this.determineWinner(match.score?.fullTime?.home, match.score?.fullTime?.away),
          competition: data.competition.name,
          season: data.season?.year || data.season?.startDate?.split('-')[0],
        })));

        if (data.matches.length < pageSize) break;
        page++;
      } catch (error) {
        console.error(`Error fetching recent matches for competition ${competition}:`, error);
        break;
      }
    }

    return matches;
  }

  async close(): Promise<void> {
    await this.db.end();
  }
}