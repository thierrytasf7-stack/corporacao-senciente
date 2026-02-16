/**
 * SISTEMA DE CACHE LOCAL ROBUSTO
 * Fallback para quando Supabase não estiver disponível
 * Cache inteligente com persistência local
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LocalCacheSystem {
  constructor() {
    this.cacheDir = join(process.cwd(), 'data', 'cache');
    this.ensureCacheDirectorySync();
    this.cache = this.loadCache();
    this.saveInterval = setInterval(() => this.persistCache(), 30000); // Salva a cada 30s
  }

  ensureCacheDirectorySync() {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Erro ao criar diretório de cache:', error.message);
    }
  }

  loadCache() {
    try {
      const cachePath = join(this.cacheDir, 'local_cache.json');
      if (existsSync(cachePath)) {
        const data = readFileSync(cachePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Erro ao carregar cache local:', error.message);
    }

    // Cache vazio inicial
    return {
      marketing_campaigns: [],
      sales_pipelines: [],
      automations: [],
      etl_logs: [],
      system_metrics: [],
      last_updated: new Date().toISOString(),
      version: '1.0'
    };
  }

  persistCache() {
    try {
      const cachePath = join(this.cacheDir, 'local_cache.json');
      this.cache.last_updated = new Date().toISOString();
      writeFileSync(cachePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Erro ao persistir cache:', error.message);
    }
  }

  // ========================================
  // MARKETING CAMPAIGNS CACHE
  // ========================================

  async saveMarketingCampaign(campaign) {
    const campaignWithId = {
      ...campaign,
      id: campaign.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: campaign.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: campaign.status || 'draft'
    };

    // Adiciona ou atualiza
    const existingIndex = this.cache.marketing_campaigns.findIndex(c => c.id === campaignWithId.id);
    if (existingIndex >= 0) {
      this.cache.marketing_campaigns[existingIndex] = campaignWithId;
    } else {
      this.cache.marketing_campaigns.push(campaignWithId);
    }

    console.log(`💾 Campanha salva localmente: ${campaignWithId.name}`);
    return campaignWithId;
  }

  async getMarketingCampaigns() {
    return this.cache.marketing_campaigns;
  }

  async getMarketingCampaignById(id) {
    return this.cache.marketing_campaigns.find(c => c.id === id);
  }

  // ========================================
  // SALES PIPELINES CACHE
  // ========================================

  async saveSalesPipeline(pipeline) {
    const pipelineWithId = {
      ...pipeline,
      id: pipeline.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: pipeline.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: pipeline.status || 'active'
    };

    const existingIndex = this.cache.sales_pipelines.findIndex(p => p.id === pipelineWithId.id);
    if (existingIndex >= 0) {
      this.cache.sales_pipelines[existingIndex] = pipelineWithId;
    } else {
      this.cache.sales_pipelines.push(pipelineWithId);
    }

    console.log(`💾 Pipeline salvo localmente: ${pipelineWithId.lead_id}`);
    return pipelineWithId;
  }

  async getSalesPipelines() {
    return this.cache.sales_pipelines;
  }

  async getSalesPipelineById(id) {
    return this.cache.sales_pipelines.find(p => p.id === id);
  }

  // ========================================
  // AUTOMATIONS CACHE
  // ========================================

  async saveAutomation(automation) {
    const automationWithId = {
      ...automation,
      id: automation.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: automation.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: automation.status || 'active'
    };

    const existingIndex = this.cache.automations.findIndex(a => a.id === automationWithId.id);
    if (existingIndex >= 0) {
      this.cache.automations[existingIndex] = automationWithId;
    } else {
      this.cache.automations.push(automationWithId);
    }

    console.log(`💾 Automação salva localmente: ${automationWithId.name}`);
    return automationWithId;
  }

  async getAutomations() {
    return this.cache.automations;
  }

  async getAutomationById(id) {
    return this.cache.automations.find(a => a.id === id);
  }

  // ========================================
  // ETL LOGS CACHE
  // ========================================

  async saveETLLog(log) {
    const logWithId = {
      ...log,
      id: log.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      started_at: log.started_at || new Date().toISOString(),
      completed_at: log.completed_at || new Date().toISOString(),
      created_at: log.created_at || new Date().toISOString()
    };

    this.cache.etl_logs.push(logWithId);

    // Mantém apenas os últimos 1000 logs
    if (this.cache.etl_logs.length > 1000) {
      this.cache.etl_logs = this.cache.etl_logs.slice(-1000);
    }

    console.log(`💾 Log ETL salvo localmente: ${logWithId.execution_id}`);
    return logWithId;
  }

  async getETLLogs(limit = 100) {
    return this.cache.etl_logs.slice(-limit);
  }

  async getETLLogsByPipeline(pipeline, limit = 50) {
    return this.cache.etl_logs
      .filter(log => log.pipeline === pipeline)
      .slice(-limit);
  }

  // ========================================
  // SYSTEM METRICS CACHE
  // ========================================

  async saveSystemMetrics(metrics) {
    const metricsWithId = {
      ...metrics,
      id: metrics.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: metrics.timestamp || new Date().toISOString(),
      version: metrics.version || '1.0',
      source: metrics.source || 'local_cache'
    };

    this.cache.system_metrics.push(metricsWithId);

    // Mantém apenas as últimas 1000 métricas
    if (this.cache.system_metrics.length > 1000) {
      this.cache.system_metrics = this.cache.system_metrics.slice(-1000);
    }

    return metricsWithId;
  }

  async getSystemMetrics(limit = 100) {
    return this.cache.system_metrics.slice(-limit);
  }

  async getLatestSystemMetrics() {
    return this.cache.system_metrics.length > 0
      ? this.cache.system_metrics[this.cache.system_metrics.length - 1]
      : null;
  }

  // ========================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ========================================

  getCacheStats() {
    return {
      marketing_campaigns: this.cache.marketing_campaigns.length,
      sales_pipelines: this.cache.sales_pipelines.length,
      automations: this.cache.automations.length,
      etl_logs: this.cache.etl_logs.length,
      system_metrics: this.cache.system_metrics.length,
      last_updated: this.cache.last_updated,
      total_records: Object.values(this.cache).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0)
    };
  }

  // ========================================
  // SINCRONIZAÇÃO COM SUPABASE
  // ========================================

  async syncWithSupabase(supabase) {
    console.log('🔄 Sincronizando cache local com Supabase...');

    try {
      // Tenta buscar dados do Supabase
      const [campaigns, pipelines, automations, etlLogs] = await Promise.allSettled([
        supabase.from('marketing_campaigns').select('*').limit(100),
        supabase.from('sales_pipelines').select('*').limit(100),
        supabase.from('automations').select('*').limit(100),
        supabase.from('etl_logs').select('*').order('created_at', { ascending: false }).limit(500)
      ]);

      // Atualiza cache com dados do Supabase
      if (campaigns.status === 'fulfilled' && campaigns.value.data) {
        this.cache.marketing_campaigns = campaigns.value.data;
        console.log(`✅ Sincronizadas ${campaigns.value.data.length} campanhas`);
      }

      if (pipelines.status === 'fulfilled' && pipelines.value.data) {
        this.cache.sales_pipelines = pipelines.value.data;
        console.log(`✅ Sincronizadas ${pipelines.value.data.length} pipelines`);
      }

      if (automations.status === 'fulfilled' && automations.value.data) {
        this.cache.automations = automations.value.data;
        console.log(`✅ Sincronizadas ${automations.value.data.length} automações`);
      }

      if (etlLogs.status === 'fulfilled' && etlLogs.value.data) {
        this.cache.etl_logs = etlLogs.value.data;
        console.log(`✅ Sincronizados ${etlLogs.value.data.length} logs ETL`);
      }

      this.persistCache();
      console.log('🎯 Sincronização com Supabase concluída');

    } catch (error) {
      console.warn('⚠️ Falha na sincronização com Supabase:', error.message);
    }
  }

  // ========================================
  // LIMPEZA E MANUTENÇÃO
  // ========================================

  cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    console.log(`🧹 Limpando dados antigos (mantendo ${daysToKeep} dias)...`);

    // Limpa métricas antigas
    const initialMetricsCount = this.cache.system_metrics.length;
    this.cache.system_metrics = this.cache.system_metrics.filter(
      m => new Date(m.timestamp) > cutoffDate
    );
    const cleanedMetrics = initialMetricsCount - this.cache.system_metrics.length;

    // Limpa logs ETL antigos (mantém mais tempo)
    const etlCutoff = new Date();
    etlCutoff.setDate(etlCutoff.getDate() - (daysToKeep * 2));
    const initialETLCount = this.cache.etl_logs.length;
    this.cache.etl_logs = this.cache.etl_logs.filter(
      log => new Date(log.created_at) > etlCutoff
    );
    const cleanedETL = initialETLCount - this.cache.etl_logs.length;

    console.log(`✅ Limpeza concluída: ${cleanedMetrics} métricas, ${cleanedETL} logs ETL removidos`);
    this.persistCache();
  }

  destroy() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    this.persistCache();
  }
}

// Singleton instance
export const localCache = new LocalCacheSystem();

// Cleanup automático diário
setInterval(() => {
  localCache.cleanupOldData(30);
}, 24 * 60 * 60 * 1000); // A cada 24 horas

export default localCache;