const request = require('supertest');
const app = require('../../backtest-api');
const fs = require('fs');
const path = require('path');

describe('Backtest API E2E Tests', () => {
  let backtestId;

  afterAll(() => {
    // Cleanup test data
    if (backtestId) {
      const filePath = path.join(__dirname, '../../data/backtests', `${backtestId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  describe('GET /health', () => {
    it('should return OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/backtest/run', () => {
    it('should create backtest with valid input', async () => {
      const payload = {
        strategyId: 'test-e2e-strategy',
        config: {
          dateRange: {
            start: '2025-08-01',
            end: '2026-01-31'
          },
          initialBankroll: 1000,
          stakingStrategy: 'fixed',
          filters: {}
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('backtestId');
      expect(response.body.data).toHaveProperty('status', 'completed');

      backtestId = response.body.data.backtestId;
    });

    it('should return 400 for missing strategyId', async () => {
      const payload = {
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'fixed'
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });

    it('should return 400 for invalid date range (start >= end)', async () => {
      const payload = {
        strategyId: 'test',
        config: {
          dateRange: {
            start: '2026-01-31',
            end: '2025-08-01'
          },
          initialBankroll: 1000,
          stakingStrategy: 'fixed'
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_DATE_RANGE');
    });

    it('should return 400 for future end date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const payload = {
        strategyId: 'test',
        config: {
          dateRange: {
            start: '2025-08-01',
            end: futureDate.toISOString().split('T')[0]
          },
          initialBankroll: 1000,
          stakingStrategy: 'fixed'
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('FUTURE_DATE');
    });

    it('should return 400 for invalid bankroll', async () => {
      const payload = {
        strategyId: 'test',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: -100,
          stakingStrategy: 'fixed'
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_BANKROLL');
    });

    it('should return 400 for invalid staking strategy', async () => {
      const payload = {
        strategyId: 'test',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'invalid-strategy'
        }
      };

      const response = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STAKING_STRATEGY');
    });
  });

  describe('GET /api/backtest/:id', () => {
    it('should return backtest result for valid ID', async () => {
      // First create a backtest
      const createPayload = {
        strategyId: 'test-get',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'percentage',
          filters: {}
        }
      };

      const createResponse = await request(app)
        .post('/api/backtest/run')
        .send(createPayload);

      const testBacktestId = createResponse.body.data.backtestId;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/backtest/${testBacktestId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testBacktestId);
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data.metrics).toHaveProperty('winRate');
      expect(response.body.data.metrics).toHaveProperty('roi');

      // Cleanup
      fs.unlinkSync(path.join(__dirname, '../../data/backtests', `${testBacktestId}.json`));
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/backtest/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BACKTEST_NOT_FOUND');
    });
  });

  describe('GET /api/backtest', () => {
    it('should list all backtests', async () => {
      const response = await request(app)
        .get('/api/backtest');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by strategyId', async () => {
      const response = await request(app)
        .get('/api/backtest?strategyId=test-e2e-strategy');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.data.length > 0) {
        expect(response.body.data[0].strategyId).toBe('test-e2e-strategy');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/backtest?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/backtest/compare', () => {
    it('should compare multiple backtests', async () => {
      // Create 2 backtests
      const payload1 = {
        strategyId: 'compare-1',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'fixed',
          filters: {}
        }
      };

      const payload2 = {
        strategyId: 'compare-2',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'kelly',
          filters: {}
        }
      };

      const res1 = await request(app).post('/api/backtest/run').send(payload1);
      const res2 = await request(app).post('/api/backtest/run').send(payload2);

      const id1 = res1.body.data.backtestId;
      const id2 = res2.body.data.backtestId;

      // Compare
      const response = await request(app)
        .post('/api/backtest/compare')
        .send({ backtestIds: [id1, id2] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toHaveProperty(id1);
      expect(response.body.data.comparison).toHaveProperty(id2);

      // Cleanup
      fs.unlinkSync(path.join(__dirname, '../../data/backtests', `${id1}.json`));
      fs.unlinkSync(path.join(__dirname, '../../data/backtests', `${id2}.json`));
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/backtest/compare')
        .send({ backtestIds: ['only-one'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_BACKTESTS');
    });
  });

  describe('DELETE /api/backtest/:id', () => {
    it('should delete existing backtest', async () => {
      // Create backtest
      const payload = {
        strategyId: 'delete-test',
        config: {
          dateRange: { start: '2025-08-01', end: '2026-01-31' },
          initialBankroll: 1000,
          stakingStrategy: 'fixed',
          filters: {}
        }
      };

      const createResponse = await request(app)
        .post('/api/backtest/run')
        .send(payload);

      const testId = createResponse.body.data.backtestId;

      // Delete
      const response = await request(app)
        .delete(`/api/backtest/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deleted
      const getResponse = await request(app)
        .get(`/api/backtest/${testId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .delete('/api/backtest/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('BACKTEST_NOT_FOUND');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
