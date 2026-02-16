import { Counter, Gauge, Histogram, Registry } from 'prom-client';

export default class PerformanceMonitor {
  private static registry = new Registry();
  private static initialized = false;

  // Metrics
  private static queryDuration = new Histogram({
    name: 'query_duration_seconds',
    help: 'Duration of database queries',
    labelNames: ['query_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });

  private static memoryUsage = new Gauge({
    name: 'process_memory_bytes',
    help: 'Memory usage of the process',
    labelNames: ['memory_type']
  });

  private static responseLatency = new Histogram({
    name: 'response_latency_seconds',
    help: 'HTTP response latency',
    labelNames: ['endpoint'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
  });

  private static requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'endpoint', 'status']
  });

  private static errorCounter = new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'endpoint']
  });

  public static initialize(): void {
    if (this.initialized) return;
    
    this.registry.registerMetric(this.queryDuration);
    this.registry.registerMetric(this.memoryUsage);
    this.registry.registerMetric(this.responseLatency);
    this.registry.registerMetric(this.requestCounter);
    this.registry.registerMetric(this.errorCounter);
    
    this.initialized = true;
    this.startMemoryMonitoring();
  }

  public static trackQuery(queryType: string, duration: number): void {
    this.queryDuration.labels(queryType).observe(duration);
  }

  public static trackResponse(endpoint: string, duration: number, status: number): void {
    this.responseLatency.labels(endpoint).observe(duration);
    this.requestCounter.labels('GET', endpoint, String(status)).inc();
  }

  public static trackError(errorType: string, endpoint: string): void {
    this.errorCounter.labels(errorType, endpoint).inc();
  }

  public static getMetrics(): string {
    return this.registry.metrics();
  }

  private static startMemoryMonitoring(): void {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      this.memoryUsage.labels('rss').set(memoryUsage.rss);
      this.memoryUsage.labels('heapTotal').set(memoryUsage.heapTotal);
      this.memoryUsage.labels('heapUsed').set(memoryUsage.heapUsed);
      this.memoryUsage.labels('external').set(memoryUsage.external);
    }, 30000); // Update every 30 seconds
  }
}