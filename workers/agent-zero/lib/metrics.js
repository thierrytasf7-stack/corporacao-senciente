/**
 * Agent Zero v2.0 - Metrics Logger
 * Tracks token savings, quality scores, model usage over time.
 */
const fs = require('fs');
const path = require('path');

const METRICS_FILE = path.resolve(__dirname, '..', 'data', 'metrics.json');

class MetricsLogger {
  constructor() {
    this.session = {
      started_at: new Date().toISOString(),
      tasks_total: 0,
      tasks_completed: 0,
      tasks_failed: 0,
      tasks_low_quality: 0,
      tokens_in_total: 0,
      tokens_out_total: 0,
      quality_scores: [],
      models_used: {},
      opus_tokens_saved: 0,
      estimated_savings_usd: 0,
      elapsed_ms_total: 0
    };
    this._ensureDir();
  }

  _ensureDir() {
    const dir = path.dirname(METRICS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  /**
   * Record a completed task result
   */
  record(result) {
    this.session.tasks_total++;

    if (result.status === 'completed') this.session.tasks_completed++;
    else if (result.status === 'failed') this.session.tasks_failed++;
    else if (result.status === 'low_quality') this.session.tasks_low_quality++;

    this.session.tokens_in_total += result.tokens_in || 0;
    this.session.tokens_out_total += result.tokens_out || 0;
    this.session.elapsed_ms_total += result.elapsed_ms || 0;

    if (result.quality_score != null) {
      this.session.quality_scores.push(result.quality_score);
    }

    // Track model usage
    const model = result.model_used || 'unknown';
    this.session.models_used[model] = (this.session.models_used[model] || 0) + 1;

    // Estimate Opus savings: assume each task would cost ~1500 input + ~500 output tokens on Opus
    // Opus pricing: $15/1M input, $75/1M output
    const opusInputCost = 1500 * 15 / 1_000_000;  // ~$0.0225
    const opusOutputCost = 500 * 75 / 1_000_000;   // ~$0.0375
    const opusCostPerTask = opusInputCost + opusOutputCost; // ~$0.06
    this.session.opus_tokens_saved += 2000; // estimated tokens saved
    this.session.estimated_savings_usd += opusCostPerTask;

    this._save();
  }

  /**
   * Get current session summary
   */
  getSummary() {
    const avgQuality = this.session.quality_scores.length > 0
      ? (this.session.quality_scores.reduce((a, b) => a + b, 0) / this.session.quality_scores.length).toFixed(1)
      : 'N/A';

    return {
      ...this.session,
      avg_quality: avgQuality,
      success_rate: this.session.tasks_total > 0
        ? ((this.session.tasks_completed / this.session.tasks_total) * 100).toFixed(1) + '%'
        : 'N/A',
      avg_time_ms: this.session.tasks_total > 0
        ? Math.round(this.session.elapsed_ms_total / this.session.tasks_total)
        : 0,
      estimated_savings_usd: +this.session.estimated_savings_usd.toFixed(4)
    };
  }

  /**
   * Get lifetime metrics (all sessions combined)
   */
  getLifetime() {
    const existing = this._loadHistory();
    return {
      total_sessions: existing.length,
      total_tasks: existing.reduce((s, e) => s + e.tasks_total, 0) + this.session.tasks_total,
      total_savings_usd: +(existing.reduce((s, e) => s + e.estimated_savings_usd, 0) + this.session.estimated_savings_usd).toFixed(4),
      total_tokens_processed: existing.reduce((s, e) => s + e.tokens_in_total + e.tokens_out_total, 0)
        + this.session.tokens_in_total + this.session.tokens_out_total
    };
  }

  _save() {
    try {
      const history = this._loadHistory();

      // Update or add current session
      const idx = history.findIndex(h => h.started_at === this.session.started_at);
      if (idx >= 0) history[idx] = this.session;
      else history.push(this.session);

      // Keep last 100 sessions
      const trimmed = history.slice(-100);
      fs.writeFileSync(METRICS_FILE, JSON.stringify(trimmed, null, 2));
    } catch (_) {}
  }

  _loadHistory() {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
      }
    } catch (_) {}
    return [];
  }
}

module.exports = { MetricsLogger };
