/**
 * Agent Zero v3.0 - Health Collector
 * Acumula métricas em memória e persiste em data/health.json
 * Atualizado a cada task processada
 */
const fs = require('fs');
const path = require('path');

const HEALTH_FILE = path.resolve(__dirname, '..', 'data', 'health.json');

class HealthCollector {
  constructor(config) {
    this.config = config;
    this.startedAt = new Date();
    this.metrics = {
      uptime_ms: 0,
      tasks_processed: 0,
      tasks_failed: 0,
      avg_latency_ms: 0,
      last_error: null,
      active_model: 'unknown',
      api_keys_status: {},
      rate_limits_hit: {},
      latencies: [], // Array para calcular média
      models_used: {},
      total_tokens_in: 0,
      total_tokens_out: 0
    };
    this._ensureDir();
    this._loadFromDisk();
  }

  _ensureDir() {
    const dir = path.dirname(HEALTH_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Carregar métricas existentes do disco (para recuperação de crash)
   */
  _loadFromDisk() {
    try {
      if (fs.existsSync(HEALTH_FILE)) {
        const data = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf-8'));
        // Restaurar apenas campos não-temporais
        if (data.tasks_processed) this.metrics.tasks_processed = data.tasks_processed;
        if (data.tasks_failed) this.metrics.tasks_failed = data.tasks_failed;
        if (data.rate_limits_hit) this.metrics.rate_limits_hit = data.rate_limits_hit;
        if (data.models_used) this.metrics.models_used = data.models_used;
        if (data.total_tokens_in) this.metrics.total_tokens_in = data.total_tokens_in;
        if (data.total_tokens_out) this.metrics.total_tokens_out = data.total_tokens_out;
      }
    } catch (err) {
      console.error('Erro ao carregar health.json:', err.message);
    }
  }

  /**
   * Registrar execução bem-sucedida de task
   */
  recordSuccess(taskResult) {
    this.metrics.tasks_processed++;

    if (taskResult.elapsed_ms) {
      this.metrics.latencies.push(taskResult.elapsed_ms);
      // Manter últimas 100 latências para cálculo de média
      if (this.metrics.latencies.length > 100) {
        this.metrics.latencies.shift();
      }
      this._updateAvgLatency();
    }

    if (taskResult.model) {
      this.metrics.active_model = taskResult.model;
      this.metrics.models_used[taskResult.model] =
        (this.metrics.models_used[taskResult.model] || 0) + 1;
    }

    if (taskResult.tokens_in) {
      this.metrics.total_tokens_in += taskResult.tokens_in;
    }
    if (taskResult.tokens_out) {
      this.metrics.total_tokens_out += taskResult.tokens_out;
    }

    this.metrics.last_error = null;
    this._persist();
  }

  /**
   * Registrar falha na execução
   */
  recordError(error, context = {}) {
    this.metrics.tasks_failed++;
    this.metrics.last_error = {
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      context
    };
    this._persist();
  }

  /**
   * Registrar rate limit atingido
   */
  recordRateLimit(apiKey) {
    if (!this.metrics.rate_limits_hit[apiKey]) {
      this.metrics.rate_limits_hit[apiKey] = 0;
    }
    this.metrics.rate_limits_hit[apiKey]++;
    this._persist();
  }

  /**
   * Registrar status de API keys
   */
  recordApiKeyStatus(keyIndex, status) {
    this.metrics.api_keys_status[`key_${keyIndex}`] = status;
    this._persist();
  }

  /**
   * Calcular média de latência
   */
  _updateAvgLatency() {
    if (this.metrics.latencies.length > 0) {
      const sum = this.metrics.latencies.reduce((a, b) => a + b, 0);
      this.metrics.avg_latency_ms = Math.round(sum / this.metrics.latencies.length);
    }
  }

  /**
   * Obter snapshot de saúde atual
   */
  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      uptime_ms: Date.now() - this.startedAt.getTime(),
      uptime_seconds: Math.floor((Date.now() - this.startedAt.getTime()) / 1000),
      started_at: this.startedAt.toISOString(),
      tasks_processed: this.metrics.tasks_processed,
      tasks_failed: this.metrics.tasks_failed,
      success_rate: this.metrics.tasks_processed > 0
        ? ((this.metrics.tasks_processed - this.metrics.tasks_failed) / this.metrics.tasks_processed * 100).toFixed(1) + '%'
        : 'N/A',
      avg_latency_ms: this.metrics.avg_latency_ms,
      last_error: this.metrics.last_error,
      active_model: this.metrics.active_model,
      models_used: this.metrics.models_used,
      api_keys_status: this.metrics.api_keys_status,
      rate_limits_hit: this.metrics.rate_limits_hit,
      total_tokens_in: this.metrics.total_tokens_in,
      total_tokens_out: this.metrics.total_tokens_out,
      total_tokens: this.metrics.total_tokens_in + this.metrics.total_tokens_out
    };
  }

  /**
   * Persistir métricas em disk
   */
  _persist() {
    try {
      const status = this.getStatus();
      fs.writeFileSync(HEALTH_FILE, JSON.stringify(status, null, 2));
    } catch (err) {
      console.error('Erro ao persistir health.json:', err.message);
    }
  }
}

module.exports = { HealthCollector };
