#!/usr/bin/env node
/**
 * API de Métricas - Endpoints para Dashboard
 *
 * Fornece endpoints REST para acessar métricas do sistema
 */

import express from 'express';
import { getMetricsCollector } from '../swarm/metrics_collector.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'metrics_api' });

/**
 * Classe da API de Métricas
 */
export class MetricsAPI {
    constructor(port = 21301) {
        this.port = port;
        this.app = express();
        this.metricsCollector = getMetricsCollector();

        this.setupMiddleware();
        this.setupRoutes();

        log.info('MetricsAPI initialized', { port });
    }

    /**
     * Configurar middleware
     */
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public')); // Para servir arquivos estáticos do dashboard

        // Middleware de logging
        this.app.use((req, res, next) => {
            log.debug('API Request', {
                method: req.method,
                url: req.url,
                ip: req.ip
            });
            next();
        });

        // Middleware de CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });
    }

    /**
     * Configurar rotas da API
     */
    setupRoutes() {
        // Rota principal - Dashboard HTML
        this.app.get('/', (req, res) => {
            res.send(this.generateDashboardHTML());
        });

        // API Routes

        // GET /api/metrics - Métricas agregadas
        this.app.get('/api/metrics', (req, res) => {
            try {
                const { timeRange = '1h', agent, task_type } = req.query;
                const filters = {};

                if (agent) filters['data.agent'] = agent;
                if (task_type) filters['context.task_type'] = task_type;

                const metrics = this.metricsCollector.getAggregatedMetrics(timeRange, filters);

                res.json({
                    success: true,
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                log.error('Error getting metrics', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // GET /api/metrics/realtime - Métricas em tempo real
        this.app.get('/api/metrics/realtime', (req, res) => {
            try {
                const stats = this.metricsCollector.getStats();
                const recentMetrics = this.metricsCollector.history.slice(-10); // Últimas 10 métricas

                res.json({
                    success: true,
                    data: {
                        stats,
                        recentMetrics: recentMetrics.map(m => ({
                            id: m.id,
                            type: m.type,
                            timestamp: m.timestamp,
                            summary: this.summarizeMetric(m)
                        }))
                    },
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                log.error('Error getting realtime metrics', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // GET /api/metrics/alerts - Alertas ativos
        this.app.get('/api/metrics/alerts', (req, res) => {
            try {
                const alerts = Array.from(this.metricsCollector.alerts.values())
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 50); // Últimos 50 alertas

                res.json({
                    success: true,
                    data: alerts,
                    count: alerts.length
                });
            } catch (error) {
                log.error('Error getting alerts', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // GET /api/metrics/trends - Análise de tendências
        this.app.get('/api/metrics/trends', (req, res) => {
            try {
                const { timeRange = '24h' } = req.query;
                const metrics = this.metricsCollector.getAggregatedMetrics(timeRange);

                const trends = metrics.trends || {};
                const insights = metrics.insights || [];

                res.json({
                    success: true,
                    data: {
                        trends,
                        insights,
                        timeRange
                    }
                });
            } catch (error) {
                log.error('Error getting trends', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // GET /api/metrics/health - Health check do sistema
        this.app.get('/api/metrics/health', (req, res) => {
            try {
                const stats = this.metricsCollector.getStats();
                const recentMetrics = this.metricsCollector.getAggregatedMetrics('5m');

                const health = {
                    status: 'healthy',
                    uptime: process.uptime(),
                    metrics: {
                        totalCollected: stats.totalMetrics,
                        activeAlerts: stats.activeAlerts,
                        recentActivity: recentMetrics.totalMetrics || 0
                    },
                    timestamp: new Date().toISOString()
                };

                // Verificar se há alertas críticos
                if (stats.activeAlerts > 10) {
                    health.status = 'warning';
                    health.message = 'Muitos alertas ativos';
                }

                // Verificar se há atividade recente
                if ((recentMetrics.totalMetrics || 0) === 0) {
                    health.status = 'warning';
                    health.message = 'Sem atividade recente';
                }

                res.json(health);
            } catch (error) {
                log.error('Error in health check', { error: error.message });
                res.status(500).json({
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // POST /api/metrics/cleanup - Limpar métricas antigas
        this.app.post('/api/metrics/cleanup', (req, res) => {
            try {
                const { days = 30 } = req.body;
                this.metricsCollector.cleanupOldMetrics(days);

                res.json({
                    success: true,
                    message: `Métricas mais antigas que ${days} dias foram limpas`
                });
            } catch (error) {
                log.error('Error cleaning up metrics', { error: error.message });
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint não encontrado'
            });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            log.error('API Error', { error: error.message, stack: error.stack });
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        });
    }

    /**
     * Gerar HTML do dashboard
     *
     * @returns {string} HTML do dashboard
     */
    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Métricas - Corporação Senciente</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #ffffff;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #00d4ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header p {
            color: #b0b0b0;
            font-size: 1.1rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }

        .card h3 {
            color: #00d4ff;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric:last-child {
            border-bottom: none;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #00ff88;
        }

        .metric-label {
            color: #b0b0b0;
        }

        .chart-container {
            height: 300px;
            margin-top: 20px;
        }

        .alerts {
            margin-top: 20px;
        }

        .alert {
            background: rgba(255, 107, 107, 0.1);
            border-left: 4px solid #ff6b6b;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 5px;
        }

        .alert.high {
            background: rgba(255, 107, 107, 0.2);
            border-left-color: #ff4757;
        }

        .alert.medium {
            background: rgba(255, 193, 7, 0.1);
            border-left-color: #ffa726;
        }

        .alert.low {
            background: rgba(0, 184, 148, 0.1);
            border-left-color: #00b894;
        }

        .insights {
            margin-top: 20px;
        }

        .insight {
            background: rgba(0, 212, 255, 0.1);
            border-left: 4px solid #00d4ff;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 5px;
        }

        .insight.warning {
            background: rgba(255, 193, 7, 0.1);
            border-left-color: #ffa726;
        }

        .insight.optimization {
            background: rgba(0, 184, 148, 0.1);
            border-left-color: #00b894;
        }

        .refresh-btn {
            background: linear-gradient(45deg, #00d4ff, #00ff88);
            color: #1a1a2e;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
        }

        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status.healthy {
            background: #00b894;
            color: #1a1a2e;
        }

        .status.warning {
            background: #ffa726;
            color: #1a1a2e;
        }

        .status.unhealthy {
            background: #ff4757;
            color: #1a1a2e;
        }

        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Dashboard de Métricas</h1>
            <p>Monitoramento Inteligente da Corporação Senciente 7.0</p>
            <div id="healthStatus" class="status healthy">Carregando...</div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🚀 Performance de Execução</h3>
                <div id="performanceMetrics"></div>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>

            <div class="card">
                <h3>💾 Cache & Memória</h3>
                <div id="cacheMetrics"></div>
                <div class="chart-container">
                    <canvas id="cacheChart"></canvas>
                </div>
            </div>

            <div class="card">
                <h3>🧠 Aprendizado & Feedback</h3>
                <div id="feedbackMetrics"></div>
                <div class="chart-container">
                    <canvas id="feedbackChart"></canvas>
                </div>
            </div>

            <div class="card">
                <h3>📈 Tendências</h3>
                <div id="trendsMetrics"></div>
                <div class="chart-container">
                    <canvas id="trendsChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="card alerts">
                <h3>🚨 Alertas Ativos</h3>
                <div id="alertsList"></div>
            </div>

            <div class="card insights">
                <h3>💡 Insights & Recomendações</h3>
                <div id="insightsList"></div>
            </div>
        </div>

        <div style="text-align: center;">
            <button class="refresh-btn" onclick="refreshData()">🔄 Atualizar Dashboard</button>
        </div>
    </div>

    <script>
        let performanceChart, cacheChart, feedbackChart, trendsChart;

        async function loadData() {
            try {
                const [metrics, alerts, trends, health] = await Promise.all([
                    fetch('/api/metrics').then(r => r.json()),
                    fetch('/api/metrics/alerts').then(r => r.json()),
                    fetch('/api/metrics/trends').then(r => r.json()),
                    fetch('/api/metrics/health').then(r => r.json())
                ]);

                updateHealthStatus(health);
                updatePerformanceMetrics(metrics.data);
                updateCacheMetrics(metrics.data);
                updateFeedbackMetrics(metrics.data);
                updateTrendsMetrics(trends.data);
                updateAlerts(alerts.data);
                updateInsights(trends.data.insights || []);
                updateCharts(metrics.data);

            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function updateHealthStatus(health) {
            const statusEl = document.getElementById('healthStatus');
            statusEl.textContent = health.status.toUpperCase();
            statusEl.className = 'status ' + health.status;
        }

        function updatePerformanceMetrics(data) {
            const container = document.getElementById('performanceMetrics');
            const prompt = data.aggregations?.prompt_execution;

            if (!prompt) {
                container.innerHTML = '<p>Sem dados de execução disponíveis</p>';
                return;
            }

            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Taxa de Sucesso</span>
                    <span class="metric-value">\${(prompt.successRate * 100).toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Latência Média</span>
                    <span class="metric-value">\${prompt.avgDuration.toFixed(0)}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Tokens Médios</span>
                    <span class="metric-value">\${prompt.avgTokens.toFixed(0)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Cache Hit Rate</span>
                    <span class="metric-value">\${(prompt.cacheHitRate * 100).toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Confiança Média</span>
                    <span class="metric-value">\${(prompt.avgConfidence * 100).toFixed(1)}%</span>
                </div>
            \`;
        }

        function updateCacheMetrics(data) {
            const container = document.getElementById('cacheMetrics');
            const cache = data.aggregations?.cache_operation;

            if (!cache) {
                container.innerHTML = '<p>Sem dados de cache disponíveis</p>';
                return;
            }

            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Taxa de Cache Hit</span>
                    <span class="metric-value">\${(cache.hitRate * 100).toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Latência Média</span>
                    <span class="metric-value">\${cache.avgDuration.toFixed(0)}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Operações Totais</span>
                    <span class="metric-value">\${cache.count}</span>
                </div>
            \`;
        }

        function updateFeedbackMetrics(data) {
            const container = document.getElementById('feedbackMetrics');
            const feedback = data.aggregations?.feedback_operation;

            if (!feedback) {
                container.innerHTML = '<p>Sem dados de feedback disponíveis</p>';
                return;
            }

            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Padrões Detectados</span>
                    <span class="metric-value">\${feedback.totalPatterns}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Melhorias Sugeridas</span>
                    <span class="metric-value">\${feedback.totalImprovements}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Latência Média</span>
                    <span class="metric-value">\${feedback.avgDuration.toFixed(0)}ms</span>
                </div>
            \`;
        }

        function updateTrendsMetrics(data) {
            const container = document.getElementById('trendsMetrics');
            const trends = data.trends;

            if (!trends || !trends.successRate) {
                container.innerHTML = '<p>Insuficientes dados para análise de tendências</p>';
                return;
            }

            const successChange = trends.successRate.change * 100;
            const trendIcon = successChange > 0 ? '📈' : successChange < 0 ? '📉' : '➡️';

            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Taxa de Sucesso - Tendência</span>
                    <span class="metric-value">\${trendIcon} \${successChange.toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Status da Tendência</span>
                    <span class="metric-value">\${getTrendLabel(trends.successRate.trend)}</span>
                </div>
            \`;
        }

        function updateAlerts(alerts) {
            const container = document.getElementById('alertsList');

            if (alerts.length === 0) {
                container.innerHTML = '<p>🎉 Nenhum alerta ativo</p>';
                return;
            }

            container.innerHTML = alerts.slice(0, 5).map(alert => \`
                <div class="alert \${alert.severity}">
                    <strong>\${alert.type.toUpperCase()}</strong>: \${alert.message}
                    <br><small>\${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
            \`).join('');
        }

        function updateInsights(insights) {
            const container = document.getElementById('insightsList');

            if (insights.length === 0) {
                container.innerHTML = '<p>💭 Nenhum insight disponível</p>';
                return;
            }

            container.innerHTML = insights.slice(0, 5).map(insight => \`
                <div class="insight \${insight.type}">
                    <strong>\${getInsightIcon(insight.type)} \${insight.title}</strong>
                    <p>\${insight.description}</p>
                    \${insight.recommendation ? \`<p><em>💡 \${insight.recommendation}</em></p>\` : ''}
                </div>
            \`).join('');
        }

        function updateCharts(data) {
            // Performance Chart
            const ctx1 = document.getElementById('performanceChart').getContext('2d');
            if (performanceChart) performanceChart.destroy();

            const prompt = data.aggregations?.prompt_execution;
            if (prompt) {
                performanceChart = new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: ['Sucesso', 'Falha'],
                        datasets: [{
                            data: [
                                prompt.successRate * prompt.count,
                                (1 - prompt.successRate) * prompt.count
                            ],
                            backgroundColor: ['#00ff88', '#ff4757']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }

            // Cache Chart
            const ctx2 = document.getElementById('cacheChart').getContext('2d');
            if (cacheChart) cacheChart.destroy();

            const cache = data.aggregations?.cache_operation;
            if (cache) {
                cacheChart = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['Hits', 'Misses'],
                        datasets: [{
                            data: [
                                cache.hitRate * cache.count,
                                (1 - cache.hitRate) * cache.count
                            ],
                            backgroundColor: ['#00d4ff', '#ff6b6b']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }
        }

        function getTrendLabel(trend) {
            switch (trend) {
                case 'improving': return 'Melhorando 📈';
                case 'degrading': return 'Piorando 📉';
                default: return 'Estável ➡️';
            }
        }

        function getInsightIcon(type) {
            switch (type) {
                case 'warning': return '⚠️';
                case 'optimization': return '⚡';
                case 'performance': return '🚀';
                case 'improvement': return '📈';
                default: return '💡';
            }
        }

        function refreshData() {
            loadData();
        }

        // Carregar dados inicialmente
        loadData();

        // Atualizar automaticamente a cada 30 segundos
        setInterval(loadData, 30000);
    </script>
</body>
</html>`;
    }

    /**
     * Iniciar servidor
     */
    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    log.info(`Metrics API server running on port ${this.port}`);
                    resolve(this.server);
                });

                this.server.on('error', (error) => {
                    log.error('Failed to start Metrics API server', { error: error.message });
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Parar servidor
     */
    stop() {
        if (this.server) {
            this.server.close();
            log.info('Metrics API server stopped');
        }
    }

    /**
     * Summarizar métrica para exibição
     *
     * @param {object} metric - Métrica a summarizar
     * @returns {string} Sumário
     */
    summarizeMetric(metric) {
        switch (metric.type) {
            case 'prompt_execution':
                return `${metric.data.success ? '✅' : '❌'} ${metric.data.agent}: ${metric.data.task?.substring(0, 30)}... (${metric.data.duration}ms)`;
            case 'cache_operation':
                return `${metric.data.hit ? '💾' : '🚫'} Cache ${metric.data.operation}: ${metric.data.key?.substring(0, 20)}...`;
            case 'memory_operation':
                return `🧠 ${metric.data.component}: ${metric.data.operation} (${metric.data.duration}ms)`;
            case 'feedback_operation':
                return `🧪 Feedback: ${metric.data.patternsFound || 0} padrões, ${metric.data.improvementsSuggested || 0} melhorias`;
            default:
                return `${metric.type}: ${JSON.stringify(metric.data).substring(0, 50)}...`;
        }
    }
}

// Singleton
let metricsAPIInstance = null;

export function getMetricsAPI(port = 21301) {
    if (!metricsAPIInstance) {
        metricsAPIInstance = new MetricsAPI(port);
    }
    return metricsAPIInstance;
}

export default MetricsAPI;
