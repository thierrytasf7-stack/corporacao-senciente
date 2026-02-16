/**
 * Calculadora DORA (DevOps Research and Assessment)
 * Calcula métricas de performance DevOps
 */

export class DoraCalculator {
  constructor() {
    this.metrics = {
      deploymentFrequency: 0,
      leadTimeForChanges: 0,
      changeFailureRate: 0,
      timeToRestoreService: 0
    };
  }

  /**
   * Calcula frequência de deploy baseada em dados históricos
   */
  calculateDeploymentFrequency(deployments, timeWindow = 30) {
    if (!deployments || deployments.length === 0) {
      return 0;
    }

    const recentDeployments = deployments.filter(dep => {
      const depDate = new Date(dep.timestamp);
      const daysAgo = (Date.now() - depDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= timeWindow;
    });

    return recentDeployments.length / timeWindow; // deploys por dia
  }

  /**
   * Calcula lead time para mudanças
   */
  calculateLeadTimeForChanges(changes) {
    if (!changes || changes.length === 0) {
      return 0;
    }

    const totalTime = changes.reduce((sum, change) => {
      const startTime = new Date(change.created_at).getTime();
      const endTime = new Date(change.deployed_at).getTime();
      return sum + (endTime - startTime);
    }, 0);

    return totalTime / changes.length; // tempo médio em ms
  }

  /**
   * Calcula taxa de falha de mudanças
   */
  calculateChangeFailureRate(changes) {
    if (!changes || changes.length === 0) {
      return 0;
    }

    const failedChanges = changes.filter(change => change.status === 'failed').length;
    return (failedChanges / changes.length) * 100; // porcentagem
  }

  /**
   * Calcula tempo para restaurar serviço
   */
  calculateTimeToRestoreService(incidents) {
    if (!incidents || incidents.length === 0) {
      return 0;
    }

    const totalTime = incidents.reduce((sum, incident) => {
      const startTime = new Date(incident.started_at).getTime();
      const endTime = new Date(incident.resolved_at).getTime();
      return sum + (endTime - startTime);
    }, 0);

    return totalTime / incidents.length; // tempo médio em ms
  }

  /**
   * Obtém nível de performance baseado nas métricas DORA
   */
  getPerformanceLevel() {
    const { deploymentFrequency, leadTimeForChanges, changeFailureRate, timeToRestoreService } = this.metrics;

    // Elite: > 1 deploy/dia, < 1h lead time, < 15% failure, < 1h restore
    if (deploymentFrequency > 1 &&
        leadTimeForChanges < 3600000 && // 1 hora
        changeFailureRate < 15 &&
        timeToRestoreService < 3600000) {
      return 'elite';
    }

    // High: 1-6 deploys/semana, 1h-1sem lead time, 15-30% failure, 1h-1sem restore
    if (deploymentFrequency > (1/7) &&
        leadTimeForChanges < 604800000 && // 1 semana
        changeFailureRate < 30 &&
        timeToRestoreService < 604800000) {
      return 'high';
    }

    // Medium: 1 deploy/mês, 1sem-6mês lead time, 30-45% failure, 1sem-1mês restore
    if (deploymentFrequency > (1/30) &&
        leadTimeForChanges < 15552000000 && // 6 meses
        changeFailureRate < 45 &&
        timeToRestoreService < 2592000000) { // 1 mês
      return 'medium';
    }

    // Low: < 1 deploy/mês, > 6mês lead time, > 45% failure, > 1mês restore
    return 'low';
  }

  /**
   * Atualiza métricas com dados recentes
   */
  updateMetrics(deployments, changes, incidents) {
    this.metrics = {
      deploymentFrequency: this.calculateDeploymentFrequency(deployments),
      leadTimeForChanges: this.calculateLeadTimeForChanges(changes),
      changeFailureRate: this.calculateChangeFailureRate(changes),
      timeToRestoreService: this.calculateTimeToRestoreService(incidents)
    };

    return this.metrics;
  }

  /**
   * Obtém métricas atuais
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Formata métricas para exibição
   */
  formatMetrics() {
    const level = this.getPerformanceLevel();

    return {
      ...this.metrics,
      performanceLevel: level,
      formatted: {
        deploymentFrequency: `${this.metrics.deploymentFrequency.toFixed(2)} deploys/dia`,
        leadTimeForChanges: this.formatTime(this.metrics.leadTimeForChanges),
        changeFailureRate: `${this.metrics.changeFailureRate.toFixed(1)}%`,
        timeToRestoreService: this.formatTime(this.metrics.timeToRestoreService)
      }
    };
  }

  /**
   * Formata tempo em formato legível
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Instância padrão
export const doraCalculator = new DoraCalculator();

/**
 * Função principal para calcular métricas DORA
 * Compatível com a API existente
 */
export function calculateDORAMetrics(options = {}) {
  const { days = 30 } = options;

  try {
    // Simulação de dados para demonstração
    const mockDeployments = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
      timestamp: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
    }));

    const mockChanges = Array.from({ length: Math.floor(Math.random() * 15) + 3 }, (_, i) => ({
      created_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
      deployed_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.8 ? 'failed' : 'success'
    }));

    const mockIncidents = Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
      started_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
    }));

    const calculator = new DoraCalculator();
    const metrics = calculator.updateMetrics(mockDeployments, mockChanges, mockIncidents);

    return {
      success: true,
      metrics: {
        leadTime: {
          average: metrics.leadTimeForChanges,
          formatted: calculator.formatTime(metrics.leadTimeForChanges)
        },
        deployFreq: {
          perWeek: metrics.deploymentFrequency * 7,
          perDay: metrics.deploymentFrequency,
          formatted: `${(metrics.deploymentFrequency * 7).toFixed(1)}/semana`
        },
        changeFailRate: {
          rate: metrics.changeFailureRate,
          formatted: `${metrics.changeFailureRate.toFixed(1)}%`
        },
        mttr: {
          hours: metrics.timeToRestoreService / (1000 * 60 * 60),
          formatted: calculator.formatTime(metrics.timeToRestoreService)
        }
      },
      performanceLevel: calculator.getPerformanceLevel(),
      calculatedAt: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metrics: null
    };
  }
}
