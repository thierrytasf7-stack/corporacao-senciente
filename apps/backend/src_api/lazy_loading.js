/**
 * SISTEMA DE LAZY LOADING INTELIGENTE
 * Carrega dados sob demanda para otimizar performance
 */

class LazyLoader {
  constructor(cacheSystem, supabaseClient) {
    this.cache = cacheSystem;
    this.supabase = supabaseClient;
    this.loadingStates = new Map();
    this.prefetchQueue = new Set();
  }

  // ========================================
  // MARKETING CAMPAIGNS LAZY LOADING
  // ========================================

  async loadMarketingCampaigns(options = {}) {
    const {
      limit = 20,
      offset = 0,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
      prefetch = true
    } = options;

    const cacheKey = `marketing_campaigns_${limit}_${offset}_${status || 'all'}_${sortBy}_${sortOrder}`;

    // Verificar cache primeiro
    const cached = await this.cache.getMarketingCampaigns();
    if (cached && cached.length > 0) {
      const filtered = this.filterMarketingCampaigns(cached, options);
      if (prefetch) this.prefetchRelatedData(filtered);
      return filtered.slice(offset, offset + limit);
    }

    // Carregar do Supabase com lazy loading
    return this.loadMarketingCampaignsFromSupabase(options);
  }

  async loadMarketingCampaignsFromSupabase(options) {
    const { limit, offset, status, sortBy, sortOrder } = options;

    let query = this.supabase
      .from('marketing_campaigns')
      .select('id, name, status, created_at, budget, tags, channels')
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (sortBy && sortOrder) query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao carregar campanhas:', error.message);
      return [];
    }

    // Cache em background
    this.cache.saveMarketingCampaign(data).catch(err =>
      console.warn('Erro ao cachear campanhas:', err.message)
    );

    return data || [];
  }

  filterMarketingCampaigns(campaigns, options) {
    let filtered = [...campaigns];

    if (options.status) {
      filtered = filtered.filter(c => c.status === options.status);
    }

    // Ordenação
    if (options.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[options.sortBy];
        const bVal = b[options.sortBy];

        if (options.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }

  async prefetchRelatedData(campaigns) {
    if (!campaigns || campaigns.length === 0) return;

    // Prefetch pipelines relacionadas
    const campaignIds = campaigns.map(c => c.id);
    this.prefetchQueue.add(`sales_pipelines_campaign_${campaignIds.join('_')}`);

    // Executar prefetch em background
    setTimeout(() => this.executePrefetch(), 100);
  }

  async executePrefetch() {
    if (this.prefetchQueue.size === 0) return;

    const prefetchTasks = Array.from(this.prefetchQueue);
    this.prefetchQueue.clear();

    for (const task of prefetchTasks) {
      if (task.startsWith('sales_pipelines_campaign_')) {
        const campaignIds = task.replace('sales_pipelines_campaign_', '').split('_');
        await this.prefetchSalesPipelines(campaignIds);
      }
    }
  }

  async prefetchSalesPipelines(campaignIds) {
    try {
      const { data } = await this.supabase
        .from('sales_pipelines')
        .select('id, campaign_id, lead_id, status, lead_score')
        .in('campaign_id', campaignIds)
        .limit(50);

      if (data) {
        // Cache em background
        for (const pipeline of data) {
          await this.cache.saveSalesPipeline(pipeline);
        }
      }
    } catch (error) {
      console.warn('Erro no prefetch de pipelines:', error.message);
    }
  }

  // ========================================
  // SALES PIPELINES LAZY LOADING
  // ========================================

  async loadSalesPipelines(options = {}) {
    const {
      limit = 25,
      offset = 0,
      status,
      funnel_type,
      min_score,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const cacheKey = `sales_pipelines_${limit}_${offset}_${status || 'all'}_${funnel_type || 'all'}_${min_score || 0}`;

    // Verificar cache
    const cached = await this.cache.getSalesPipelines();
    if (cached && cached.length > 0) {
      const filtered = this.filterSalesPipelines(cached, options);
      return filtered.slice(offset, offset + limit);
    }

    // Carregar do Supabase
    return this.loadSalesPipelinesFromSupabase(options);
  }

  async loadSalesPipelinesFromSupabase(options) {
    const { limit, offset, status, funnel_type, min_score, sortBy, sortOrder } = options;

    let query = this.supabase
      .from('sales_pipelines')
      .select('id, lead_id, funnel_type, lead_score, status, created_at, expected_close_date, deal_value')
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (funnel_type) query = query.eq('funnel_type', funnel_type);
    if (min_score) query = query.gte('lead_score', min_score);

    if (sortBy && sortOrder) query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.warn('Erro ao carregar pipelines:', error.message);
      return [];
    }

    // Cache em background
    for (const pipeline of data || []) {
      await this.cache.saveSalesPipeline(pipeline);
    }

    return data || [];
  }

  filterSalesPipelines(pipelines, options) {
    let filtered = [...pipelines];

    if (options.status) {
      filtered = filtered.filter(p => p.status === options.status);
    }

    if (options.funnel_type) {
      filtered = filtered.filter(p => p.funnel_type === options.funnel_type);
    }

    if (options.min_score) {
      filtered = filtered.filter(p => p.lead_score >= options.min_score);
    }

    // Ordenação
    if (options.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[options.sortBy];
        const bVal = b[options.sortBy];

        if (options.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }

  // ========================================
  // DASHBOARD LAZY LOADING
  // ========================================

  async loadDashboardData(userId, options = {}) {
    const { include_campaigns = true, include_pipelines = true, include_metrics = true } = options;

    const results = {};

    // Carregar dados em paralelo com lazy loading
    const promises = [];

    if (include_campaigns) {
      promises.push(
        this.loadMarketingCampaigns({ limit: 5, status: 'active' })
          .then(data => results.campaigns = data)
      );
    }

    if (include_pipelines) {
      promises.push(
        this.loadSalesPipelines({ limit: 10, status: 'active' })
          .then(data => results.pipelines = data)
      );
    }

    if (include_metrics) {
      promises.push(
        this.loadSystemMetrics({ limit: 1, hours: 24 })
          .then(data => results.metrics = data)
      );
    }

    await Promise.all(promises);

    return results;
  }

  // ========================================
  // SYSTEM METRICS LAZY LOADING
  // ========================================

  async loadSystemMetrics(options = {}) {
    const { limit = 50, hours = 24 } = options;

    const cacheKey = `system_metrics_${limit}_${hours}h`;

    // Verificar cache
    const cached = await this.cache.getLatestSystemMetrics();
    if (cached) {
      return [cached];
    }

    // Carregar do Supabase
    const since = new Date(Date.now() - (hours * 60 * 60 * 1000)).toISOString();

    const { data, error } = await this.supabase
      .from('system_metrics')
      .select('*')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Erro ao carregar métricas:', error.message);
      return [];
    }

    // Cache em background
    if (data && data.length > 0) {
      for (const metric of data) {
        await this.cache.saveSystemMetrics(metric);
      }
    }

    return data || [];
  }

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================

  getPerformanceStats() {
    return {
      cache_hits: this.cache.getCacheStats(),
      prefetch_queue_size: this.prefetchQueue.size,
      loading_states: this.loadingStates.size,
      memory_usage: process.memoryUsage()
    };
  }

  // Cleanup automático
  cleanup() {
    this.loadingStates.clear();
    this.prefetchQueue.clear();
  }
}

export default LazyLoader;