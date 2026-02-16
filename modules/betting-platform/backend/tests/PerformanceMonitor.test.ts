import { describe, it, expect } from '@jest/globals';
import PerformanceMonitor from '../services/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Reset metrics between tests
    PerformanceMonitor.initialize();
  });

  it('should initialize metrics registry', () => {
    expect(PerformanceMonitor.getMetrics()).toBeDefined();
  });

  it('should track query duration', () => {
    PerformanceMonitor.trackQuery('SELECT', 0.5);
    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics).toContain('query_duration_seconds');
  });

  it('should track response latency', () => {
    PerformanceMonitor.trackResponse('/api/health', 0.2, 200);
    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics).toContain('response_latency_seconds');
  });

  it('should track errors', () => {
    PerformanceMonitor.trackError('DatabaseError', '/api/data');
    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics).toContain('errors_total');
  });

  it('should provide metrics in Prometheus format', () => {
    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics.contentType).toBe('text/plain');
    expect(metrics.content).toContain('# HELP');
    expect(metrics.content).toContain('# TYPE');
  });
});