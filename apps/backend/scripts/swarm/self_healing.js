#!/usr/bin/env node
/**
 * Self-Healing and Auto-Recovery System
 *
 * Sistema inteligente de auto-recuperação que detecta problemas automaticamente
 * e implementa estratégias de recuperação para manter o sistema saudável
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getTraceAlerts } from '../observability/trace_alerts.js';
import { logger } from '../utils/logger.js';
import { getMetricsCollector } from './metrics_collector.js';

const log = logger.child({ module: 'self_healing' });

/**
 * Sistema de Self-Healing e Auto-Recovery
 */
export class SelfHealingSystem {
    constructor(options = {}) {
        this.distributedTracer = getDistributedTracer();
        this.traceAlerts = getTraceAlerts();
        this.metricsCollector = getMetricsCollector();
        this.llbProtocol = getLLBProtocol();

        // Configurações de self-healing
        this.healingEnabled = options.healingEnabled !== false;
        this.autoRecoveryEnabled = options.autoRecoveryEnabled !== false;
        this.circuitBreakerEnabled = options.circuitBreakerEnabled !== false;

        // Thresholds de detecção de problemas
        this.problemThresholds = {
            errorRate: options.errorRateThreshold || 0.1,      // 10%
            latency: options.latencyThreshold || 10000,        // 10 segundos
            memoryUsage: options.memoryThreshold || 0.9,       // 90%
            cpuUsage: options.cpuThreshold || 0.95,           // 95%
            consecutiveFailures: options.consecutiveFailures || 5,
            recoveryTimeout: options.recoveryTimeout || 300000 // 5 minutos
        };

        // Estado do sistema
        this.systemHealth = {
            status: 'healthy', // 'healthy' | 'degraded' | 'critical' | 'recovering'
            lastHealthCheck: Date.now(),
            consecutiveFailures: 0,
            activeRecoveries: new Map(),
            circuitBreakers: new Map(),
            healthHistory: []
        };

        // Estratégias de recuperação
        this.recoveryStrategies = {
            retry: this.retryStrategy.bind(this),
            circuitBreaker: this.circuitBreakerStrategy.bind(this),
            fallback: this.fallbackStrategy.bind(this),
            restart: this.restartStrategy.bind(this),
            scale: this.scaleStrategy.bind(this),
            isolate: this.isolateStrategy.bind(this)
        };

        // Monitoramento contínuo
        this.monitoringInterval = options.monitoringInterval || 30000; // 30 segundos
        this.monitoringTimer = null;

        log.info('SelfHealingSystem initialized', {
            healingEnabled: this.healingEnabled,
            autoRecoveryEnabled: this.autoRecoveryEnabled,
            circuitBreakerEnabled: this.circuitBreakerEnabled
        });
    }

    /**
     * Inicializar sistema de self-healing
     */
    async initialize() {
        if (!this.healingEnabled) {
            log.info('Self-healing disabled');
            return;
        }

        log.info('Initializing self-healing system...');

        // Registrar handlers de problemas
        this.setupProblemDetectors();

        // Iniciar monitoramento contínuo
        this.startContinuousMonitoring();

        // Configurar circuit breakers
        this.initializeCircuitBreakers();

        log.info('Self-healing system initialized successfully');
    }

    /**
     * Configurar detectores de problemas
     */
    setupProblemDetectors() {
        // Detector de falhas consecutivas
        this.setupConsecutiveFailureDetector();

        // Detector de degradação de performance
        this.setupPerformanceDegradationDetector();

        // Detector de vazamentos de recursos
        this.setupResourceLeakDetector();

        // Detector de falhas de integração
        this.setupIntegrationFailureDetector();

        log.debug('Problem detectors configured');
    }

    /**
     * Detector de falhas consecutivas
     */
    setupConsecutiveFailureDetector() {
        // Monitora traces com erros consecutivos
        setInterval(async () => {
            const traceStats = this.distributedTracer.getTraceStats();

            if (traceStats.error_traces > this.problemThresholds.consecutiveFailures) {
                await this.detectProblem('consecutive_failures', {
                    errorTraces: traceStats.error_traces,
                    threshold: this.problemThresholds.consecutiveFailures,
                    timeWindow: '5_minutes'
                });
            }
        }, 60000); // A cada minuto
    }

    /**
     * Detector de degradação de performance
     */
    setupPerformanceDegradationDetector() {
        let baselineLatency = null;
        let baselineErrorRate = null;

        setInterval(async () => {
            const traceStats = this.distributedTracer.getTraceStats();
            const currentLatency = traceStats.avg_trace_duration;
            const currentErrorRate = traceStats.total_traces > 0 ?
                traceStats.error_traces / traceStats.total_traces : 0;

            // Estabelecer baseline após primeiras 10 operações
            if (traceStats.total_traces >= 10 && baselineLatency === null) {
                baselineLatency = currentLatency;
                baselineErrorRate = currentErrorRate;
                return;
            }

            if (baselineLatency && currentLatency > baselineLatency * 2) {
                await this.detectProblem('performance_degradation', {
                    currentLatency,
                    baselineLatency,
                    degradation: `${Math.round((currentLatency / baselineLatency - 1) * 100)}%`
                });
            }

            if (baselineErrorRate !== null && currentErrorRate > this.problemThresholds.errorRate) {
                await this.detectProblem('error_rate_spike', {
                    currentErrorRate: Math.round(currentErrorRate * 100),
                    threshold: Math.round(this.problemThresholds.errorRate * 100),
                    baselineErrorRate: Math.round(baselineErrorRate * 100)
                });
            }
        }, 120000); // A cada 2 minutos
    }

    /**
     * Detector de vazamentos de recursos
     */
    setupResourceLeakDetector() {
        setInterval(async () => {
            const memUsage = process.memoryUsage();
            const memoryPercentage = memUsage.heapUsed / memUsage.heapTotal;

            if (memoryPercentage > this.problemThresholds.memoryUsage) {
                await this.detectProblem('memory_leak', {
                    memoryUsage: Math.round(memoryPercentage * 100),
                    threshold: Math.round(this.problemThresholds.memoryUsage * 100),
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)  // MB
                });
            }
        }, 300000); // A cada 5 minutos
    }

    /**
     * Detector de falhas de integração
     */
    setupIntegrationFailureDetector() {
        // Monitora conectividade com serviços externos
        const integrations = [
            { name: 'llb_protocol', check: () => this.checkLLBProtocolHealth() },
            { name: 'metrics_collector', check: () => this.checkMetricsCollectorHealth() },
            { name: 'distributed_tracer', check: () => this.checkDistributedTracerHealth() }
        ];

        setInterval(async () => {
            for (const integration of integrations) {
                try {
                    const isHealthy = await integration.check();
                    if (!isHealthy) {
                        await this.detectProblem('integration_failure', {
                            integration: integration.name,
                            status: 'unhealthy'
                        });
                    }
                } catch (error) {
                    await this.detectProblem('integration_failure', {
                        integration: integration.name,
                        error: error.message
                    });
                }
            }
        }, 60000); // A cada minuto
    }

    /**
     * Detectar problema e iniciar recuperação
     */
    async detectProblem(problemType, problemData) {
        log.warn('Problem detected', { problemType, problemData });

        // Registrar no histórico de saúde
        this.systemHealth.healthHistory.push({
            timestamp: Date.now(),
            type: 'problem_detected',
            problemType,
            data: problemData
        });

        // Limitar histórico
        if (this.systemHealth.healthHistory.length > 100) {
            this.systemHealth.healthHistory.shift();
        }

        // Atualizar status de saúde
        this.updateSystemHealth(problemType, problemData);

        // Iniciar auto-recuperação se habilitado
        if (this.autoRecoveryEnabled) {
            await this.initiateAutoRecovery(problemType, problemData);
        }

        // Gerar alerta
        await this.traceAlerts.processAlert({
            type: `self_healing_${problemType}`,
            severity: this.getSeverityForProblem(problemType),
            title: `Problema Detectado: ${problemType.replace('_', ' ').toUpperCase()}`,
            description: this.generateProblemDescription(problemType, problemData),
            metric: problemType,
            value: problemData.value || 0,
            traceId: 'system_health_check',
            operation: 'self_healing',
            recommendation: this.getRecoveryRecommendation(problemType)
        });
    }

    /**
     * Iniciar auto-recuperação
     */
    async initiateAutoRecovery(problemType, problemData) {
        const recoveryId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        log.info('Initiating auto-recovery', { recoveryId, problemType });

        this.systemHealth.activeRecoveries.set(recoveryId, {
            id: recoveryId,
            problemType,
            problemData,
            startTime: Date.now(),
            status: 'in_progress',
            attempts: 0,
            maxAttempts: 3
        });

        try {
            // Escolher estratégia de recuperação
            const strategy = this.selectRecoveryStrategy(problemType);
            if (strategy) {
                await this.executeRecoveryStrategy(recoveryId, strategy, problemType, problemData);
            } else {
                log.warn('No recovery strategy available for problem type', { problemType });
            }

        } catch (error) {
            log.error('Auto-recovery failed', { recoveryId, error: error.message });
            this.systemHealth.activeRecoveries.get(recoveryId).status = 'failed';
            this.systemHealth.activeRecoveries.get(recoveryId).error = error.message;
        }

        // Limpar recuperações antigas
        this.cleanupOldRecoveries();
    }

    /**
     * Selecionar estratégia de recuperação
     */
    selectRecoveryStrategy(problemType) {
        const strategies = {
            consecutive_failures: 'circuitBreaker',
            performance_degradation: 'retry',
            memory_leak: 'restart',
            error_rate_spike: 'isolate',
            integration_failure: 'fallback'
        };

        return strategies[problemType] || 'retry';
    }

    /**
     * Executar estratégia de recuperação
     */
    async executeRecoveryStrategy(recoveryId, strategyName, problemType, problemData) {
        const strategy = this.recoveryStrategies[strategyName];
        if (!strategy) {
            throw new Error(`Unknown recovery strategy: ${strategyName}`);
        }

        const recovery = this.systemHealth.activeRecoveries.get(recoveryId);
        recovery.attempts++;

        log.info('Executing recovery strategy', {
            recoveryId,
            strategy: strategyName,
            attempt: recovery.attempts
        });

        try {
            const result = await strategy(problemType, problemData, recovery.attempts);

            if (result.success) {
                recovery.status = 'completed';
                recovery.completionTime = Date.now();
                recovery.result = result;

                log.info('Recovery strategy completed successfully', {
                    recoveryId,
                    strategy: strategyName,
                    duration: recovery.completionTime - recovery.startTime
                });

                // Verificar se o problema foi resolvido
                await this.verifyProblemResolution(problemType);

            } else {
                if (recovery.attempts >= recovery.maxAttempts) {
                    recovery.status = 'failed';
                    log.error('Recovery strategy failed after max attempts', {
                        recoveryId,
                        strategy: strategyName,
                        attempts: recovery.attempts
                    });
                } else {
                    // Tentar novamente após delay
                    setTimeout(() => {
                        this.executeRecoveryStrategy(recoveryId, strategyName, problemType, problemData);
                    }, 30000 * recovery.attempts); // Backoff exponencial
                }
            }

        } catch (error) {
            recovery.status = 'error';
            recovery.error = error.message;
            log.error('Recovery strategy execution failed', {
                recoveryId,
                strategy: strategyName,
                error: error.message
            });
        }
    }

    /**
     * Estratégia de Retry
     */
    async retryStrategy(problemType, problemData, attempt) {
        log.info('Executing retry strategy', { problemType, attempt });

        // Aguardar período de cooldown
        const cooldownMs = Math.min(30000 * Math.pow(2, attempt - 1), 300000); // Backoff exponencial, máx 5min
        await new Promise(resolve => setTimeout(resolve, cooldownMs));

        // Simular limpeza de estado problemático
        if (problemType === 'performance_degradation') {
            // Limpar caches, reinicializar conexões
            await this.performSystemCleanup();
        }

        return { success: true, strategy: 'retry', cooldownMs };
    }

    /**
     * Estratégia de Circuit Breaker
     */
    async circuitBreakerStrategy(problemType, problemData, attempt) {
        log.info('Executing circuit breaker strategy', { problemType, attempt });

        const circuitKey = `circuit_${problemType}`;

        if (!this.systemHealth.circuitBreakers.has(circuitKey)) {
            this.systemHealth.circuitBreakers.set(circuitKey, {
                state: 'open', // 'closed' | 'open' | 'half-open'
                failureCount: 0,
                lastFailureTime: Date.now(),
                timeoutMs: 60000 // 1 minuto
            });
        }

        const circuit = this.systemHealth.circuitBreakers.get(circuitKey);

        if (circuit.state === 'open') {
            // Verificar se deve tentar half-open
            if (Date.now() - circuit.lastFailureTime > circuit.timeoutMs) {
                circuit.state = 'half-open';
                log.info('Circuit breaker transitioning to half-open', { circuitKey });
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        // Simular teste de conectividade
        const testResult = await this.testSystemConnectivity();

        if (testResult.healthy) {
            circuit.state = 'closed';
            circuit.failureCount = 0;
            log.info('Circuit breaker closed - system healthy', { circuitKey });
            return { success: true, strategy: 'circuit_breaker', state: 'closed' };
        } else {
            circuit.state = 'open';
            circuit.failureCount++;
            circuit.lastFailureTime = Date.now();
            throw new Error('System still unhealthy');
        }
    }

    /**
     * Estratégia de Fallback
     */
    async fallbackStrategy(problemType, problemData, attempt) {
        log.info('Executing fallback strategy', { problemType, attempt });

        if (problemType === 'integration_failure') {
            // Ativar modo fallback para integração problemática
            await this.activateFallbackMode(problemData.integration);

            return {
                success: true,
                strategy: 'fallback',
                integration: problemData.integration,
                mode: 'fallback_activated'
            };
        }

        return { success: false, reason: 'No fallback available for problem type' };
    }

    /**
     * Estratégia de Restart
     */
    async restartStrategy(problemType, problemData, attempt) {
        log.info('Executing restart strategy', { problemType, attempt });

        if (problemType === 'memory_leak') {
            // Simular restart gracioso
            await this.performGracefulRestart();

            return {
                success: true,
                strategy: 'restart',
                reason: 'memory_cleanup'
            };
        }

        return { success: false, reason: 'Restart not applicable for problem type' };
    }

    /**
     * Estratégia de Scale
     */
    async scaleStrategy(problemType, problemData, attempt) {
        log.info('Executing scale strategy', { problemType, attempt });

        // Em produção, isso aumentaria recursos (workers, memória, etc.)
        // Por enquanto, apenas log
        log.info('Scaling strategy would increase resources here', { problemType });

        return {
            success: true,
            strategy: 'scale',
            action: 'resource_increase_simulated'
        };
    }

    /**
     * Estratégia de Isolate
     */
    async isolateStrategy(problemType, problemData, attempt) {
        log.info('Executing isolate strategy', { problemType, attempt });

        // Isolar componente problemático
        await this.isolateProblematicComponent(problemType, problemData);

        return {
            success: true,
            strategy: 'isolate',
            component: problemType
        };
    }

    /**
     * Iniciar monitoramento contínuo
     */
    startContinuousMonitoring() {
        this.monitoringTimer = setInterval(async () => {
            await this.performHealthCheck();
        }, this.monitoringInterval);

        log.debug('Continuous monitoring started', {
            interval: this.monitoringInterval
        });
    }

    /**
     * Executar health check
     */
    async performHealthCheck() {
        const healthCheck = {
            timestamp: Date.now(),
            checks: {},
            overall: 'healthy'
        };

        try {
            // Health check de componentes críticos
            healthCheck.checks.llbProtocol = await this.checkLLBProtocolHealth();
            healthCheck.checks.metricsCollector = await this.checkMetricsCollectorHealth();
            healthCheck.checks.distributedTracer = await this.checkDistributedTracerHealth();
            healthCheck.checks.memory = await this.checkMemoryHealth();
            healthCheck.checks.cpu = await this.checkCPUHealth();

            // Determinar status geral
            const failedChecks = Object.values(healthCheck.checks).filter(check => !check);
            if (failedChecks.length > 0) {
                healthCheck.overall = failedChecks.length >= 3 ? 'critical' : 'degraded';
            }

            // Atualizar status do sistema
            this.systemHealth.status = healthCheck.overall;
            this.systemHealth.lastHealthCheck = healthCheck.timestamp;

            // Registrar no histórico
            this.systemHealth.healthHistory.push({
                timestamp: healthCheck.timestamp,
                type: 'health_check',
                status: healthCheck.overall,
                checks: healthCheck.checks
            });

            if (healthCheck.overall !== 'healthy') {
                log.warn('Health check detected issues', {
                    status: healthCheck.overall,
                    failedChecks: Object.entries(healthCheck.checks)
                        .filter(([, healthy]) => !healthy)
                        .map(([check]) => check)
                });
            }

        } catch (error) {
            log.error('Health check failed', { error: error.message });
            healthCheck.overall = 'error';
        }

        return healthCheck;
    }

    /**
     * Inicializar circuit breakers
     */
    initializeCircuitBreakers() {
        if (!this.circuitBreakerEnabled) return;

        // Circuit breakers para componentes críticos
        const criticalComponents = [
            'llb_protocol',
            'metrics_collector',
            'distributed_tracer',
            'llm_client',
            'database'
        ];

        criticalComponents.forEach(component => {
            this.systemHealth.circuitBreakers.set(`circuit_${component}`, {
                state: 'closed',
                failureCount: 0,
                lastFailureTime: null,
                timeoutMs: 300000 // 5 minutos
            });
        });

        log.debug('Circuit breakers initialized', {
            components: criticalComponents.length
        });
    }

    /**
     * Métodos auxiliares de verificação de saúde
     */
    async checkLLBProtocolHealth() {
        try {
            // Simular verificação de saúde
            return this.llbProtocol && typeof this.llbProtocol.execute === 'function';
        } catch (error) {
            return false;
        }
    }

    async checkMetricsCollectorHealth() {
        try {
            return this.metricsCollector && typeof this.metricsCollector.recordMetric === 'function';
        } catch (error) {
            return false;
        }
    }

    async checkDistributedTracerHealth() {
        try {
            return this.distributedTracer && typeof this.distributedTracer.startTrace === 'function';
        } catch (error) {
            return false;
        }
    }

    async checkMemoryHealth() {
        const memUsage = process.memoryUsage();
        const memoryPercentage = memUsage.heapUsed / memUsage.heapTotal;
        return memoryPercentage < this.problemThresholds.memoryUsage;
    }

    async checkCPUHealth() {
        // CPU check seria mais complexo em produção
        // Por enquanto, apenas simular
        return true;
    }

    /**
     * Métodos auxiliares de recuperação
     */
    async performSystemCleanup() {
        // Simular limpeza de caches, conexões, etc.
        log.info('Performing system cleanup');

        // Forçar garbage collection se disponível
        if (global.gc) {
            global.gc();
            log.debug('Garbage collection performed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async performGracefulRestart() {
        // Simular restart gracioso
        log.info('Performing graceful restart');

        // Em produção, isso reiniciaria workers, reconectaria bancos, etc.
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Resetar contadores
        this.systemHealth.consecutiveFailures = 0;
    }

    async activateFallbackMode(integration) {
        log.info('Activating fallback mode', { integration });

        // Configurar fallbacks para integração problemática
        // Em produção, isso ativaria modos de operação reduzidos
    }

    async isolateProblematicComponent(problemType, problemData) {
        log.info('Isolating problematic component', { problemType });

        // Isolar componente para evitar propagação de falhas
        // Em produção, isso poderia desabilitar features ou redirecionar traffic
    }

    async testSystemConnectivity() {
        // Testar conectividade básica do sistema
        const checks = await Promise.all([
            this.checkLLBProtocolHealth(),
            this.checkMetricsCollectorHealth(),
            this.checkDistributedTracerHealth()
        ]);

        const healthy = checks.filter(Boolean).length >= 2; // Pelo menos 2/3 saudáveis

        return { healthy, checks };
    }

    async verifyProblemResolution(problemType) {
        // Verificar se o problema foi resolvido
        log.info('Verifying problem resolution', { problemType });

        // Aguardar um período de estabilização
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Re-executar health check
        const healthCheck = await this.performHealthCheck();

        if (healthCheck.overall === 'healthy') {
            log.info('Problem resolution confirmed', { problemType });
        } else {
            log.warn('Problem may not be fully resolved', { problemType, status: healthCheck.overall });
        }
    }

    /**
     * Métodos auxiliares
     */
    updateSystemHealth(problemType, problemData) {
        // Lógica para atualizar status geral do sistema baseado em problemas detectados
        const severity = this.getSeverityForProblem(problemType);

        if (severity === 'critical') {
            this.systemHealth.status = 'critical';
        } else if (severity === 'warning' && this.systemHealth.status === 'healthy') {
            this.systemHealth.status = 'degraded';
        }

        // Incrementar contador de falhas consecutivas
        this.systemHealth.consecutiveFailures++;
    }

    getSeverityForProblem(problemType) {
        const severityMap = {
            consecutive_failures: 'critical',
            performance_degradation: 'warning',
            memory_leak: 'critical',
            error_rate_spike: 'warning',
            integration_failure: 'critical'
        };

        return severityMap[problemType] || 'warning';
    }

    generateProblemDescription(problemType, problemData) {
        const descriptions = {
            consecutive_failures: `Detectadas ${problemData.errorTraces} falhas consecutivas (limite: ${problemData.threshold})`,
            performance_degradation: `Degradação de performance: ${problemData.degradation} acima do baseline`,
            memory_leak: `Uso de memória crítico: ${problemData.memoryUsage}% (limite: ${problemData.threshold}%)`,
            error_rate_spike: `Pico na taxa de erro: ${problemData.currentErrorRate}% (limite: ${problemData.threshold}%)`,
            integration_failure: `Falha na integração: ${problemData.integration} está indisponível`
        };

        return descriptions[problemType] || `Problema detectado: ${problemType}`;
    }

    getRecoveryRecommendation(problemType) {
        const recommendations = {
            consecutive_failures: 'Verificar circuit breakers e implementar fallback',
            performance_degradation: 'Otimizar queries e aumentar recursos se necessário',
            memory_leak: 'Investigar vazamentos de memória e considerar restart',
            error_rate_spike: 'Analisar logs de erro e implementar retry logic',
            integration_failure: 'Verificar conectividade e implementar fallback mode'
        };

        return recommendations[problemType] || 'Investigar causa raiz e implementar correção';
    }

    cleanupOldRecoveries() {
        const cutoffTime = Date.now() - this.problemThresholds.recoveryTimeout;

        for (const [recoveryId, recovery] of this.systemHealth.activeRecoveries.entries()) {
            if (recovery.startTime < cutoffTime) {
                this.systemHealth.activeRecoveries.delete(recoveryId);
                log.debug('Cleaned up old recovery', { recoveryId });
            }
        }
    }

    /**
     * Obter status do sistema de self-healing
     */
    getStatus() {
        return {
            enabled: this.healingEnabled,
            systemHealth: this.systemHealth.status,
            activeRecoveries: Array.from(this.systemHealth.activeRecoveries.values()),
            circuitBreakers: Object.fromEntries(this.systemHealth.circuitBreakers.entries()),
            healthHistory: this.systemHealth.healthHistory.slice(-10), // Últimas 10 entradas
            thresholds: this.problemThresholds
        };
    }

    /**
     * Encerrar sistema de self-healing
     */
    async shutdown() {
        log.info('Shutting down self-healing system');

        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        // Finalizar recuperações ativas
        for (const [recoveryId, recovery] of this.systemHealth.activeRecoveries.entries()) {
            if (recovery.status === 'in_progress') {
                recovery.status = 'cancelled';
                log.debug('Cancelled active recovery during shutdown', { recoveryId });
            }
        }

        log.info('Self-healing system shutdown completed');
    }
}

// Singleton
let selfHealingInstance = null;

export function getSelfHealingSystem(options = {}) {
    if (!selfHealingInstance) {
        selfHealingInstance = new SelfHealingSystem(options);
    }
    return selfHealingInstance;
}

export default SelfHealingSystem;