/**
 * Sistema de Métricas
 * Coleta e armazena métricas do sistema
 */

import { logger } from './logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      successes: 0,
      apiCalls: {},
      performance: {},
      timestamps: [],
    };
    this.startTime = Date.now();
  }

  /**
   * Incrementa contador
   */
  increment(key, value = 1) {
    if (!this.metrics[key]) {
      this.metrics[key] = 0;
    }
    this.metrics[key] += value;
    this.recordTimestamp();
  }

  /**
   * Registra métrica de performance
   */
  recordPerformance(operation, duration, metadata = {}) {
    if (!this.metrics.performance[operation]) {
      this.metrics.performance[operation] = {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        avgDuration: 0,
      };
    }

    const perf = this.metrics.performance[operation];
    perf.count++;
    perf.totalDuration += duration;
    perf.minDuration = Math.min(perf.minDuration, duration);
    perf.maxDuration = Math.max(perf.maxDuration, duration);
    perf.avgDuration = perf.totalDuration / perf.count;

    if (metadata) {
      if (!perf.metadata) perf.metadata = [];
      perf.metadata.push({
        duration,
        ...metadata,
        timestamp: new Date().toISOString(),
      });
    }

    this.recordTimestamp();
  }

  /**
   * Registra chamada de API
   */
  recordAPICall(service, status, duration) {
    if (!this.metrics.apiCalls[service]) {
      this.metrics.apiCalls[service] = {
        total: 0,
        success: 0,
        error: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }

    const api = this.metrics.apiCalls[service];
    api.total++;
    if (status >= 200 && status < 300) {
      api.success++;
    } else {
      api.error++;
    }
    api.totalDuration += duration;
    api.avgDuration = api.totalDuration / api.total;

    this.recordTimestamp();
  }

  /**
   * Registra timestamp de evento
   */
  recordTimestamp() {
    this.metrics.timestamps.push(Date.now());
    // Manter apenas últimos 1000 timestamps
    if (this.metrics.timestamps.length > 1000) {
      this.metrics.timestamps.shift();
    }
  }

  /**
   * Obtém métricas
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      ...this.metrics,
      uptime,
      uptimeSeconds: Math.floor(uptime / 1000),
      requestsPerSecond: this.metrics.requests / (uptime / 1000),
      errorRate: this.metrics.requests > 0 
        ? (this.metrics.errors / this.metrics.requests) * 100 
        : 0,
      successRate: this.metrics.requests > 0 
        ? (this.metrics.successes / this.metrics.requests) * 100 
        : 0,
    };
  }

  /**
   * Reseta métricas
   */
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      successes: 0,
      apiCalls: {},
      performance: {},
      timestamps: [],
    };
    this.startTime = Date.now();
    logger.info('Métricas resetadas');
  }

  /**
   * Salva métricas em arquivo
   */
  saveToFile(filePath = 'metrics.json') {
    try {
      const data = {
        ...this.getMetrics(),
        exportedAt: new Date().toISOString(),
      };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      logger.info(`Métricas salvas em ${filePath}`);
    } catch (error) {
      logger.error('Erro ao salvar métricas', { error: error.message });
    }
  }
}

// Instância singleton
export const metrics = new MetricsCollector();

/**
 * Wrapper para medir performance de função
 */
export function measurePerformance(operation, fn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      metrics.recordPerformance(operation, duration, { success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      metrics.recordPerformance(operation, duration, { 
        success: false,
        error: error.message,
      });
      throw error;
    }
  };
}

/**
 * Exibe métricas formatadas
 */
export function printMetrics() {
  const m = metrics.getMetrics();
  
  console.log('\n=== Métricas do Sistema ===\n');
  console.log(`⏱️  Uptime: ${m.uptimeSeconds}s`);
  console.log(`📊 Requisições: ${m.requests}`);
  console.log(`✅ Sucessos: ${m.successes} (${m.successRate.toFixed(2)}%)`);
  console.log(`❌ Erros: ${m.errors} (${m.errorRate.toFixed(2)}%)`);
  console.log(`⚡ Requisições/segundo: ${m.requestsPerSecond.toFixed(2)}`);
  
  if (Object.keys(m.performance).length > 0) {
    console.log('\n📈 Performance:');
    for (const [operation, perf] of Object.entries(m.performance)) {
      console.log(`  ${operation}:`);
      console.log(`    Média: ${perf.avgDuration.toFixed(2)}ms`);
      console.log(`    Min: ${perf.minDuration.toFixed(2)}ms`);
      console.log(`    Max: ${perf.maxDuration.toFixed(2)}ms`);
      console.log(`    Count: ${perf.count}`);
    }
  }

  if (Object.keys(m.apiCalls).length > 0) {
    console.log('\n🔌 API Calls:');
    for (const [service, api] of Object.entries(m.apiCalls)) {
      console.log(`  ${service}:`);
      console.log(`    Total: ${api.total}`);
      console.log(`    Sucesso: ${api.success}`);
      console.log(`    Erro: ${api.error}`);
      console.log(`    Duração média: ${api.avgDuration.toFixed(2)}ms`);
    }
  }

  console.log('');
}

























