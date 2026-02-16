import { Counter, Gauge, Histogram, Registry } from 'prom-client';

// Metrics Registry
export const metricsRegistry = new Registry();

// Counter: total_bets, failed_bets
export const totalBets = new Counter({
  name: 'total_bets',
  help: 'Total number of bets placed',
  registers: [metricsRegistry]
});

export const failedBets = new Counter({
  name: 'failed_bets',
  help: 'Total number of failed bets',
  registers: [metricsRegistry]
});

// Gauge: active_connections, cache_hit_rate
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Current number of active connections',
  registers: [metricsRegistry]
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  registers: [metricsRegistry]
});

// Histogram: bet_processing_time
export const betProcessingTime = new Histogram({
  name: 'bet_processing_time',
  help: 'Bet processing time in milliseconds',
  buckets: [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000],
  registers: [metricsRegistry]
});

// Prometheus endpoint
export const getMetrics = () => metricsRegistry.metrics();