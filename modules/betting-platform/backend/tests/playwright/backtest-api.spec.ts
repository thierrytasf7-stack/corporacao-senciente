import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:21370';

test.describe('Backtest API - Playwright Validation', () => {
  test('should return health check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
  });

  test('should create backtest with valid payload', async ({ request }) => {
    const payload = {
      strategyId: 'playwright-test-strategy',
      config: {
        dateRange: {
          start: '2025-09-01',
          end: '2025-12-31'
        },
        initialBankroll: 5000,
        stakingStrategy: 'kelly',
        filters: {}
      }
    };

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('backtestId');
    expect(body.data).toHaveProperty('status', 'completed');
  });

  test('should return 400 for missing strategyId', async ({ request }) => {
    const payload = {
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'fixed'
      }
    };

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_INPUT');
  });

  test('should return 400 for invalid date range', async ({ request }) => {
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

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_DATE_RANGE');
  });

  test('should return 400 for future end date', async ({ request }) => {
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

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('FUTURE_DATE');
  });

  test('should return 400 for invalid bankroll', async ({ request }) => {
    const payload = {
      strategyId: 'test',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: -100,
        stakingStrategy: 'fixed'
      }
    };

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_BANKROLL');
  });

  test('should return 400 for invalid staking strategy', async ({ request }) => {
    const payload = {
      strategyId: 'test',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'invalid-strategy'
      }
    };

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_STAKING_STRATEGY');
  });

  test('should get backtest result by ID', async ({ request }) => {
    // First create a backtest
    const createPayload = {
      strategyId: 'playwright-get-test',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'percentage',
        filters: {}
      }
    };

    const createResponse = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: createPayload
    });

    const { backtestId } = (await createResponse.json()).data;

    // Then retrieve it
    const getResponse = await request.get(`${BASE_URL}/api/backtest/${backtestId}`);

    expect(getResponse.status()).toBe(200);

    const body = await getResponse.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id', backtestId);
    expect(body.data).toHaveProperty('metrics');
    expect(body.data.metrics).toHaveProperty('winRate');
    expect(body.data.metrics).toHaveProperty('roi');
  });

  test('should return 404 for non-existent backtest ID', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/backtest/non-existent-id`);

    expect(response.status()).toBe(404);
    expect((await response.json()).error.code).toBe('BACKTEST_NOT_FOUND');
  });

  test('should list all backtests', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/backtest`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter backtests by strategyId', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/backtest?strategyId=playwright-test-strategy`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    if (body.data.length > 0) {
      expect(body.data[0].strategyId).toBe('playwright-test-strategy');
    }
  });

  test('should respect limit parameter', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/backtest?limit=5`);

    expect(response.status()).toBe(200);
    expect((await response.json()).data.length).toBeLessThanOrEqual(5);
  });

  test('should compare multiple backtests', async ({ request }) => {
    // Create 2 backtests
    const payload1 = {
      strategyId: 'playwright-compare-1',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {}
      }
    };

    const payload2 = {
      strategyId: 'playwright-compare-2',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'kelly',
        filters: {}
      }
    };

    const res1 = await request.post(`${BASE_URL}/api/backtest/run`, { data: payload1 });
    const res2 = await request.post(`${BASE_URL}/api/backtest/run`, { data: payload2 });

    const id1 = (await res1.json()).data.backtestId;
    const id2 = (await res2.json()).data.backtestId;

    // Compare
    const response = await request.post(`${BASE_URL}/api/backtest/compare`, {
      data: { backtestIds: [id1, id2] }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.comparison).toHaveProperty(id1);
    expect(body.data.comparison).toHaveProperty(id2);
  });

  test('should return 400 when comparing less than 2 backtests', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/backtest/compare`, {
      data: { backtestIds: ['only-one'] }
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('INSUFFICIENT_BACKTESTS');
  });

  test('should delete backtest', async ({ request }) => {
    // Create backtest
    const payload = {
      strategyId: 'playwright-delete-test',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {}
      }
    };

    const createResponse = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    const testId = (await createResponse.json()).data.backtestId;

    // Delete
    const deleteResponse = await request.delete(`${BASE_URL}/api/backtest/${testId}`);
    expect(deleteResponse.status()).toBe(200);
    expect((await deleteResponse.json()).success).toBe(true);

    // Verify deleted
    const getResponse = await request.get(`${BASE_URL}/api/backtest/${testId}`);
    expect(getResponse.status()).toBe(404);
  });

  test('should return 404 when deleting non-existent backtest', async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/api/backtest/non-existent`);

    expect(response.status()).toBe(404);
    expect((await response.json()).error.code).toBe('BACKTEST_NOT_FOUND');
  });

  test('should return 404 for unknown routes', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/unknown-route`);

    expect(response.status()).toBe(404);
    expect((await response.json()).error.code).toBe('NOT_FOUND');
  });

  test('should validate backtest metrics are realistic', async ({ request }) => {
    const payload = {
      strategyId: 'playwright-metrics-test',
      config: {
        dateRange: { start: '2025-08-01', end: '2026-01-31' },
        initialBankroll: 10000,
        stakingStrategy: 'kelly',
        filters: {}
      }
    };

    const response = await request.post(`${BASE_URL}/api/backtest/run`, {
      data: payload
    });

    const { backtestId } = (await response.json()).data;
    const getResponse = await request.get(`${BASE_URL}/api/backtest/${backtestId}`);
    const { metrics } = (await getResponse.json()).data;

    // Validate metrics are within realistic ranges
    expect(metrics.winRate).toBeGreaterThanOrEqual(0);
    expect(metrics.winRate).toBeLessThanOrEqual(1);
    expect(metrics.roi).toBeGreaterThan(-1);
    expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0);
    expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
    expect(metrics.avgOdds).toBeGreaterThan(1);
    expect(metrics.betCount).toBeGreaterThan(0);
    expect(metrics.sharpeRatio).toBeDefined();
  });
});
