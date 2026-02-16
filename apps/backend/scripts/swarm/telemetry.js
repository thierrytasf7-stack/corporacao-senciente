/**
 * Sistema de Telemetria e Observabilidade Avançada
 *
 * Implementa OpenTelemetry para:
 * - Tracing distribuído
 * - Métricas em tempo real
 * - Logs estruturados
 * - Health checks
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Simulação de OpenTelemetry (em produção, instalar @opentelemetry/api, etc.)
class MockTracer {
  constructor() {
    this.spans = [];
    this.activeSpans = new Map();
  }

  startSpan(name, options = {}) {
    const span = {
      id: `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      startTime: Date.now(),
      attributes: options.attributes || {},
      parentId: options.parentSpanId,
      status: 'ok',
      events: []
    };

    this.spans.push(span);
    this.activeSpans.set(span.id, span);

    return {
      setAttribute: (key, value) => { span.attributes[key] = value; },
      setStatus: (status) => { span.status = status; },
      addEvent: (name, attributes = {}) => {
        span.events.push({
          name,
          timestamp: Date.now(),
          attributes
        });
      },
      end: () => {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        this.activeSpans.delete(span.id);
      },
      spanId: span.id
    };
  }

  getSpans() {
    return this.spans;
  }

  clear() {
    this.spans = [];
    this.activeSpans.clear();
  }
}

class MockMeter {
  constructor() {
    this.metrics = new Map();
  }

  createCounter(name, options = {}) {
    const counter = {
      name,
      description: options.description || '',
      unit: options.unit || '1',
      values: new Map()
    };

    this.metrics.set(name, counter);

    return {
      add: (value, attributes = {}) => {
        const key = JSON.stringify(attributes);
        const current = counter.values.get(key) || 0;
        counter.values.set(key, current + value);
      }
    };
  }

  createHistogram(name, options = {}) {
    const histogram = {
      name,
      description: options.description || '',
      unit: options.unit || 'ms',
      buckets: [],
      sum: 0,
      count: 0
    };

    this.metrics.set(name, histogram);

    return {
      record: (value, attributes = {}) => {
        histogram.buckets.push({ value, attributes, timestamp: Date.now() });
        histogram.sum += value;
        histogram.count += 1;
      }
    };
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }
}

class TelemetrySystem {
  constructor() {
    this.tracer = new MockTracer();
    this.meter = new MockMeter();
    this.logger = this.createLogger();
    this.healthChecks = new Map();
    this.serviceName = 'corporacao-senciente';
    this.serviceVersion = '7.0.0';
  }

  createLogger() {
    return {
      info: (message, meta = {}) => {
        console.log(`[${new Date().toISOString()}] INFO: ${message}`, meta);
      },
      error: (message, meta = {}) => {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`, meta);
      },
      warn: (message, meta = {}) => {
        console.warn(`[${new Date().toISOString()}] WARN: ${message}`, meta);
      },
      debug: (message, meta = {}) => {
        console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, meta);
      }
    };
  }

  /**
   * Inicia um span de tracing
   */
  startSpan(name, attributes = {}) {
    const span = this.tracer.startSpan(name, {
      attributes: {
        service: this.serviceName,
        version: this.serviceVersion,
        ...attributes
      }
    });

    this.logger.debug(`Started span: ${name}`, { spanId: span.spanId });
    return span;
  }

  /**
   * Cria um contador de métricas
   */
  createCounter(name, description = '', unit = '1') {
    return this.meter.createCounter(name, { description, unit });
  }

  /**
   * Cria um histograma de métricas
   */
  createHistogram(name, description = '', unit = 'ms') {
    return this.meter.createHistogram(name, { description, unit });
  }

  /**
   * Registra um health check
   */
  registerHealthCheck(name, checkFunction) {
    this.healthChecks.set(name, {
      name,
      check: checkFunction,
      lastResult: null,
      lastCheck: null
    });
  }

  /**
   * Executa todos os health checks
   */
  async runHealthChecks() {
    const results = {};

    for (const [name, healthCheck] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await healthCheck.check();
        const duration = Date.now() - startTime;

        results[name] = {
          status: result.healthy ? 'healthy' : 'unhealthy',
          duration,
          details: result.details || {},
          timestamp: new Date().toISOString()
        };

        healthCheck.lastResult = results[name];
        healthCheck.lastCheck = Date.now();

      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };

        healthCheck.lastResult = results[name];
        healthCheck.lastCheck = Date.now();
      }
    }

    return results;
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats() {
    return {
      spans: {
        total: this.tracer.spans.length,
        active: this.tracer.activeSpans.size,
        completed: this.tracer.spans.filter(s => s.endTime).length
      },
      metrics: {
        total: this.meter.metrics.size,
        counters: Array.from(this.meter.metrics.values()).filter(m => m.values).length,
        histograms: Array.from(this.meter.metrics.values()).filter(m => m.buckets).length
      },
      healthChecks: {
        total: this.healthChecks.size,
        results: Object.fromEntries(
          Array.from(this.healthChecks.entries()).map(([name, hc]) => [name, hc.lastResult])
        )
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpa dados antigos
   */
  cleanup(maxSpans = 1000, maxAgeHours = 24) {
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const cutoffTime = Date.now() - maxAge;

    // Limpar spans antigos
    this.tracer.spans = this.tracer.spans.filter(span =>
      !span.endTime || span.endTime > cutoffTime
    );

    // Limitar número de spans
    if (this.tracer.spans.length > maxSpans) {
      this.tracer.spans = this.tracer.spans.slice(-maxSpans);
    }

    this.logger.info('Telemetry cleanup completed', {
      remainingSpans: this.tracer.spans.length
    });
  }

  /**
   * Exporta dados para análise
   */
  exportData() {
    return {
      spans: this.tracer.spans,
      metrics: this.meter.getMetrics(),
      stats: this.getSystemStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Instância singleton
export const telemetry = new TelemetrySystem();

// Health checks padrão
telemetry.registerHealthCheck('database', async () => {
  try {
    // Simular verificação de conectividade com Supabase
    await new Promise(resolve => setTimeout(resolve, 100));
    return { healthy: true, details: { latency: 100 } };
  } catch (error) {
    return { healthy: false, details: { error: error.message } };
  }
});

telemetry.registerHealthCheck('memory', async () => {
  const memUsage = process.memoryUsage();
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

  return {
    healthy: usedMB < 500, // Menos de 500MB
    details: { totalMB, usedMB, usagePercent: Math.round((usedMB / totalMB) * 100) }
  };
});

telemetry.registerHealthCheck('cpu', async () => {
  // Simulação de uso de CPU
  const usage = Math.random() * 100;
  return {
    healthy: usage < 80,
    details: { usagePercent: Math.round(usage) }
  };
});

// Métricas padrão
export const requestCounter = telemetry.createCounter(
  'requests_total',
  'Total number of requests',
  '1'
);

export const requestDuration = telemetry.createHistogram(
  'request_duration',
  'Request duration in milliseconds',
  'ms'
);

export const errorCounter = telemetry.createCounter(
  'errors_total',
  'Total number of errors',
  '1'
);

// Funções utilitárias
export function traceFunction(fn, name, attributes = {}) {
  return async (...args) => {
    const span = telemetry.startSpan(name, attributes);
    try {
      const result = await fn(...args);
      span.setStatus('ok');
      return result;
    } catch (error) {
      span.setStatus('error');
      span.addEvent('error', { message: error.message });
      throw error;
    } finally {
      span.end();
    }
  };
}

export function measureExecutionTime(fn, metricName, attributes = {}) {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      requestDuration.record(duration, attributes);
      return result;
    } catch (error) {
      errorCounter.add(1, { ...attributes, error: error.message });
      throw error;
    }
  };
}





