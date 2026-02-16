import { HistoricalDataLoader } from '../services/HistoricalDataLoader';
import { Pool } from 'pg';
import axios from 'axios';
import { DateTime } from 'luxon';

describe('HistoricalDataLoader', () => {
  let dbPool: Pool;
  let historicalDataLoader: HistoricalDataLoader;

  beforeEach(() => {
    dbPool = new Pool({
      user: 'test',
      host: 'localhost',
      database: 'test_db',
      password: 'test',
      port: 5432,
    });

    historicalDataLoader = new HistoricalDataLoader(
      dbPool,
      'test_betfair_api_key'
    );

    // Mock axios
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        result: [
          {
            marketId: '1.123456',
            selectionId: '123456',
            eventId: '1234567',
            sport: 'soccer',
            competition: 'Premier League',
            eventName: 'Team A vs Team B',
            marketName: 'Match Odds',
            selectionName: 'Team A',
            price: 2.5,
            size: 1000,
            side: 'back',
            timestamp: DateTime.utc().toISO()
          }
        ]
      }
    });
  });

  afterEach(async () => {
    await dbPool.end();
  });

  describe('fetchHistoricalOdds', () => {
    it('should fetch historical odds from Betfair API', async () => {
      const startDate = DateTime.utc().minus({ days: 1 }).toISODate();
      const endDate = DateTime.utc().toISODate();

      const odds = await historicalDataLoader.fetchHistoricalOdds(startDate, endDate, 'soccer');

      expect(odds).toHaveLength(1);
      expect(odds[0].marketId).toBe('1.123456');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/listMarketBook/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Authentication': 'test_betfair_api_key'
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('API Error'));

      const startDate = DateTime.utc().minus({ days: 1 }).toISODate();
      const endDate = DateTime.utc().toISODate();

      await expect(
        historicalDataLoader.fetchHistoricalOdds(startDate, endDate, 'soccer')
      ).rejects.toThrow('Failed to fetch historical odds');
    });
  });

  describe('transformAndValidateOdds', () => {
    it('should transform and validate odds data', () => {
      const input: any = {
        marketId: '1.123456',
        selectionId: '123456',
        eventId: '1234567',
        sport: 'soccer',
        competition: 'Premier League',
        eventName: 'Team A vs Team B',
        marketName: 'Match Odds',
        selectionName: 'Team A',
        price: 2.5,
        size: 1000,
        side: 'back',
        timestamp: DateTime.utc().toISO()
      };

      const transformed = historicalDataLoader.transformAndValidateOdds([input]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].betfair_market_id).toBe('1.123456');
      expect(transformed[0].price).toBe(2.5);
      expect(transformed[0].is_active).toBe(true);
    });
  });

  describe('loadHistoricalOdds', () => {
    it('should load historical odds into database', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn()
      };

      jest.spyOn(dbPool, 'connect').mockResolvedValue(mockClient as any);

      const odds = [
        {
          id: 'test-id',
          betfair_market_id: '1.123456',
          betfair_selection_id: '123456',
          betfair_event_id: '1234567',
          sport: 'soccer',
          competition: 'Premier League',
          event_name: 'Team A vs Team B',
          market_name: 'Match Odds',
          selection_name: 'Team A',
          price: 2.5,
          size: 1000,
          side: 'back',
          timestamp_utc: DateTime.utc().toISO(),
          captured_at: DateTime.utc().toISO(),
          is_active: true,
          source: 'betfair'
        }
      ];

      await historicalDataLoader.loadHistoricalOdds(odds);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO historical_odds'),
        expect.arrayContaining([
          'test-id', '1.123456', '123456', '1234567', 'soccer',
          'Premier League', 'Team A vs Team B', 'Match Odds', 'Team A',
          2.5, 1000, 'back', expect.any(String), expect.any(String), true, 'betfair'
        ])
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should handle database errors with rollback', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('Database Error')),
        release: jest.fn()
      };

      jest.spyOn(dbPool, 'connect').mockResolvedValue(mockClient as any);

      const odds = [{ id: 'test-id', betfair_market_id: '1.123456', price: 2.5 }];

      await expect(
        historicalDataLoader.loadHistoricalOdds(odds)
      ).rejects.toThrow('Failed to load historical odds');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('loadHistoricalData', () => {
    it('should load historical data for all active sports', async () => {
      jest.spyOn(historicalDataLoader, 'getActiveSports').mockResolvedValue([
        { sport_name: 'soccer' },
        { sport_name: 'tennis' }
      ]);

      jest.spyOn(historicalDataLoader, 'fetchHistoricalOdds').mockResolvedValue([]);
      jest.spyOn(historicalDataLoader, 'fetchMatchResults').mockResolvedValue([]);
      jest.spyOn(historicalDataLoader, 'loadHistoricalOdds').mockResolvedValue();
      jest.spyOn(historicalDataLoader, 'loadMatchResults').mockResolvedValue();

      const startDate = DateTime.utc().minus({ years: 2 }).toISODate();
      const endDate = DateTime.utc().toISODate();

      await historicalDataLoader.loadHistoricalData(startDate, endDate);

      expect(historicalDataLoader.getActiveSports).toHaveBeenCalled();
      expect(historicalDataLoader.fetchHistoricalOdds).toHaveBeenCalledTimes(2);
      expect(historicalDataLoader.fetchMatchResults).toHaveBeenCalledTimes(2);
      expect(historicalDataLoader.loadHistoricalOdds).toHaveBeenCalledTimes(2);
      expect(historicalDataLoader.loadMatchResults).toHaveBeenCalledTimes(2);
    });
  });
});