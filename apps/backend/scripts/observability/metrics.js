#!/usr/bin/env node
/**
 * Sistema de Métricas Customizadas - OpenTelemetry
 *
 * Implementa métricas customizadas com OpenTelemetry
 */

import { getMetricsCollector } from '../swarm/metrics_collector.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'observability_metrics' });

/**
 * Sistema de Métricas Customizadas com OpenTelemetry
 */
export class ObservabilityMetrics {
    constructor(options = {}) {
        this.serviceName = options.serviceName || 'corporacao-senciente';
        this.serviceVersion = options.serviceVersion || '7.0.0';

        // Meter para métricas
        this.meter = this.createMeter();

        // Métricas ativas
        this.activeMetrics = new Map();

        // Configuração de métricas
        this.metricConfigs = {
            // Latência de operações
            operationLatency: {
                name: 'operation_duration',
                description: 'Duration of operations in milliseconds',
                unit: 'ms',
                type: 'histogram'
            },

            // Contador de requests
            requestCount: {
                name: 'requests_total',
                description: 'Total number of requests',
                unit: '1',
                type: 'counter'
            },

            // Taxa de erro
            errorRate: {
                name: 'error_rate',
                description: 'Rate of errors per operation',
                unit: '1',
                type: 'gauge'
            },

            // Uso de recursos
            resourceUsage: {
                name: 'resource_usage',
                description: 'Resource usage metrics',
                unit: 'percent',
                type: 'gauge'
            },

            // Throughput
            throughput: {
                name: 'throughput',
                description: 'Operations per second',
                unit: 'ops/s',
                type: 'gauge'
            },

            // Cache hit rate
            cacheHitRate: {
                name: 'cache_hit_rate',
                description: 'Cache hit rate percentage',
                unit: 'percent',
                type: 'gauge'
            },

            // Tokens utilizados
            tokenUsage: {
                name: 'token_usage',
                description: 'Number of tokens used by LLMs',
                unit: 'tokens',
                type: 'counter'
            },

            // Confiança de ações
            actionConfidence: {
                name: 'action_confidence',
                description: 'Confidence score of actions',
                unit: 'score',
                type: 'histogram'
            },

            // Tempo de validação
            validationTime: {
                name: 'validation_duration',
                description: 'Time spent validating actions',
                unit: 'ms',
                type: 'histogram'
            },

            // Comunicação agent-to-agent
            agentCommunication: {
                name: 'agent_communication',
                description: 'Agent-to-agent communication metrics',
                unit: 'calls',
                type: 'counter'
            },

            // Uso de memória
            memoryUsage: {
                name: 'memory_usage',
                description: 'Memory usage of the system',
                unit: 'bytes',
                type: 'gauge'
            },

            // CPU usage
            cpuUsage: {
                name: 'cpu_usage',
                description: 'CPU usage percentage',
                unit: 'percent',
                type: 'gauge'
            }
        };

        // Inicializar métricas
        this.initializeMetrics();

        log.info('ObservabilityMetrics initialized', {
            service: this.serviceName,
            metricsCount: Object.keys(this.metricConfigs).length
        });
    }

    /**
     * Cria meter para métricas
     *
     * @returns {object} Meter simulado
     */
    createMeter() {
        // Simulação de meter OpenTelemetry
        return {
            createHistogram: (name, options) => ({
                record: (value, attributes = {}) => {
                    log.debug('Histogram recorded', { name, value, attributes });
                    this.recordMetric(name, value, attributes, 'histogram');
                }
            }),

            createCounter: (name, options) => ({
                add: (value, attributes = {}) => {
                    log.debug('Counter incremented', { name, value, attributes });
                    this.recordMetric(name, value, attributes, 'counter');
                }
            }),

            createGauge: (name, options) => ({
                set: (value, attributes = {}) => {
                    log.debug('Gauge set', { name, value, attributes });
                    this.recordMetric(name, value, attributes, 'gauge');
                }
            })
        };
    }

    /**
     * Inicializa todas as métricas
     */
    initializeMetrics() {
        Object.entries(this.metricConfigs).forEach(([key, config]) => {
            const metricName = `${this.serviceName}_${config.name}`;

            switch (config.type) {
                case 'histogram':
                    this.activeMetrics.set(key, this.meter.createHistogram(metricName, {
                        description: config.description,
                        unit: config.unit
                    }));
                    break;

                case 'counter':
                    this.activeMetrics.set(key, this.meter.createCounter(metricName, {
                        description: config.description,
                        unit: config.unit
                    }));
                    break;

                case 'gauge':
                    this.activeMetrics.set(key, this.meter.createGauge(metricName, {
                        description: config.description,
                        unit: config.unit
                    }));
                    break;
            }
        });
    }

    /**
     * Registra valor de métrica
     *
     * @param {string} name - Nome da métrica
     * @param {number} value - Valor
     * @param {object} attributes - Atributos
     * @param {string} type - Tipo de métrica
     */
    recordMetric(name, value, attributes, type) {
        // Integrar com sistema de métricas existente
        getMetricsCollector().recordMetric('opentelemetry_metric', {
            metric_name: name,
            metric_value: value,
            metric_type: type,
            attributes_count: Object.keys(attributes).length
        }, {
            metric_type: 'opentelemetry_integration',
            service: this.serviceName,
            version: this.serviceVersion
        });

        // Log detalhado para debugging
        log.debug('OpenTelemetry metric recorded', {
            name,
            value,
            type,
            attributes: Object.keys(attributes)
        });
    }

    /**
     * Registra latência de operação
     *
     * @param {string} operation - Nome da operação
     * @param {number} duration - Duração em ms
     * @param {object} attributes - Atributos adicionais
     */
    recordOperationLatency(operation, duration, attributes = {}) {
        const metric = this.activeMetrics.get('operationLatency');
        if (metric) {
            metric.record(duration, {
                operation,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra contador de requests
     *
     * @param {string} endpoint - Endpoint acessado
     * @param {string} method - Método HTTP
     * @param {number} statusCode - Código de status
     * @param {object} attributes - Atributos adicionais
     */
    recordRequest(endpoint, method, statusCode, attributes = {}) {
        const metric = this.activeMetrics.get('requestCount');
        if (metric) {
            metric.add(1, {
                endpoint,
                method,
                status_code: statusCode.toString(),
                service: this.serviceName,
                ...attributes
            });
        }

        // Registrar também como erro se status >= 400
        if (statusCode >= 400) {
            this.recordError(endpoint, statusCode, { method, ...attributes });
        }
    }

    /**
     * Registra erro
     *
     * @param {string} operation - Operação que falhou
     * @param {number|string} errorCode - Código do erro
     * @param {object} attributes - Atributos adicionais
     */
    recordError(operation, errorCode, attributes = {}) {
        const errorRateMetric = this.activeMetrics.get('errorRate');
        if (errorRateMetric) {
            errorRateMetric.set(1, {
                operation,
                error_code: errorCode.toString(),
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra uso de recursos
     *
     * @param {string} resourceType - Tipo de recurso ('memory', 'cpu', 'disk')
     * @param {number} usage - Uso atual
     * @param {object} attributes - Atributos adicionais
     */
    recordResourceUsage(resourceType, usage, attributes = {}) {
        const metric = this.activeMetrics.get('resourceUsage');
        if (metric) {
            metric.set(usage, {
                resource_type: resourceType,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra throughput
     *
     * @param {string} operation - Operação
     * @param {number} opsPerSecond - Operações por segundo
     * @param {object} attributes - Atributos adicionais
     */
    recordThroughput(operation, opsPerSecond, attributes = {}) {
        const metric = this.activeMetrics.get('throughput');
        if (metric) {
            metric.set(opsPerSecond, {
                operation,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra cache hit rate
     *
     * @param {string} cacheType - Tipo de cache
     * @param {number} hitRate - Taxa de hit (0-1)
     * @param {object} attributes - Atributos adicionais
     */
    recordCacheHitRate(cacheType, hitRate, attributes = {}) {
        const metric = this.activeMetrics.get('cacheHitRate');
        if (metric) {
            metric.set(hitRate * 100, { // Converter para percentual
                cache_type: cacheType,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra uso de tokens LLM
     *
     * @param {string} model - Modelo usado
     * @param {number} tokens - Número de tokens
     * @param {string} operation - Operação realizada
     * @param {object} attributes - Atributos adicionais
     */
    recordTokenUsage(model, tokens, operation = 'llm_call', attributes = {}) {
        const metric = this.activeMetrics.get('tokenUsage');
        if (metric) {
            metric.add(tokens, {
                model,
                operation,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra score de confiança
     *
     * @param {number} confidence - Score de confiança (0-1)
     * @param {string} actionType - Tipo de ação
     * @param {object} attributes - Atributos adicionais
     */
    recordActionConfidence(confidence, actionType, attributes = {}) {
        const metric = this.activeMetrics.get('actionConfidence');
        if (metric) {
            metric.record(confidence, {
                action_type: actionType,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra tempo de validação
     *
     * @param {number} duration - Tempo em ms
     * @param {string} validationType - Tipo de validação
     * @param {object} attributes - Atributos adicionais
     */
    recordValidationTime(duration, validationType, attributes = {}) {
        const metric = this.activeMetrics.get('validationTime');
        if (metric) {
            metric.record(duration, {
                validation_type: validationType,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra comunicação agent-to-agent
     *
     * @param {string} fromAgent - Agente origem
     * @param {string} toAgent - Agente destino
     * @param {string} operation - Operação realizada
     * @param {object} attributes - Atributos adicionais
     */
    recordAgentCommunication(fromAgent, toAgent, operation, attributes = {}) {
        const metric = this.activeMetrics.get('agentCommunication');
        if (metric) {
            metric.add(1, {
                from_agent: fromAgent,
                to_agent: toAgent,
                operation,
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra uso de memória
     *
     * @param {number} bytes - Bytes utilizados
     * @param {object} attributes - Atributos adicionais
     */
    recordMemoryUsage(bytes, attributes = {}) {
        const metric = this.activeMetrics.get('memoryUsage');
        if (metric) {
            metric.set(bytes, {
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Registra uso de CPU
     *
     * @param {number} percentage - Percentual de uso (0-100)
     * @param {object} attributes - Atributos adicionais
     */
    recordCpuUsage(percentage, attributes = {}) {
        const metric = this.activeMetrics.get('cpuUsage');
        if (metric) {
            metric.set(percentage, {
                service: this.serviceName,
                ...attributes
            });
        }
    }

    /**
     * Coleta métricas do sistema automaticamente
     */
    collectSystemMetrics() {
        try {
            // Memória
            const memUsage = process.memoryUsage();
            this.recordMemoryUsage(memUsage.heapUsed, { type: 'heap' });
            this.recordMemoryUsage(memUsage.external, { type: 'external' });

            // CPU (simulação - em produção usaria sistema real)
            const cpuUsage = Math.random() * 100; // Simulação
            this.recordCpuUsage(cpuUsage);

            // Throughput (simulação baseada no número de métricas recentes)
            const recentMetrics = getMetricsCollector().history.slice(-10);
            const throughput = recentMetrics.length / 60; // por segundo
            this.recordThroughput('system_operations', throughput);

            log.debug('System metrics collected', {
                memory: memUsage.heapUsed,
                cpu: cpuUsage.toFixed(2),
                throughput: throughput.toFixed(2)
            });

        } catch (error) {
            log.warn('Error collecting system metrics', { error: error.message });
        }
    }

    /**
     * Inicia coleta automática de métricas do sistema
     */
    startSystemMetricsCollection() {
        // Coletar métricas do sistema a cada 30 segundos
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000);

        // Coletar métricas iniciais
        this.collectSystemMetrics();

        log.info('System metrics collection started');
    }

    /**
     * Obtém estatísticas das métricas
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        return {
            service: this.serviceName,
            version: this.serviceVersion,
            activeMetrics: this.activeMetrics.size,
            metricConfigs: Object.keys(this.metricConfigs).length,
            systemMetricsEnabled: true
        };
    }

    /**
     * Força coleta de métricas atuais
     *
     * @returns {object} Métricas atuais
     */
    collectCurrentMetrics() {
        this.collectSystemMetrics();

        return {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            metrics: this.getStats(),
            system: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                platform: process.platform,
                version: process.version
            }
        };
    }

    /**
     * Cria métricas customizadas em runtime
     *
     * @param {string} name - Nome da métrica
     * @param {string} type - Tipo ('histogram', 'counter', 'gauge')
     * @param {object} config - Configuração
     */
    createCustomMetric(name, type, config = {}) {
        const fullName = `${this.serviceName}_${name}`;

        const metricConfig = {
            name,
            description: config.description || `Custom ${type} metric`,
            unit: config.unit || '1',
            type
        };

        this.metricConfigs[name] = metricConfig;

        switch (type) {
            case 'histogram':
                this.activeMetrics.set(name, this.meter.createHistogram(fullName, metricConfig));
                break;
            case 'counter':
                this.activeMetrics.set(name, this.meter.createCounter(fullName, metricConfig));
                break;
            case 'gauge':
                this.activeMetrics.set(name, this.meter.createGauge(fullName, metricConfig));
                break;
        }

        log.info('Custom metric created', { name, type, config: metricConfig });
    }
}

// Singleton
let observabilityMetricsInstance = null;

export function getObservabilityMetrics(options = {}) {
    if (!observabilityMetricsInstance) {
        observabilityMetricsInstance = new ObservabilityMetrics(options);
    }
    return observabilityMetricsInstance;
}

// Decorators para métricas automáticas
export function measureLatency(metricName, attributes = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const metrics = getObservabilityMetrics();
            const startTime = Date.now();

            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;

                metrics.recordOperationLatency(metricName, duration, attributes);

                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                metrics.recordOperationLatency(metricName, duration, { ...attributes, error: 'true' });
                throw error;
            }
        };

        return descriptor;
    };
}

export function countRequests(endpoint, attributes = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const metrics = getObservabilityMetrics();

            try {
                const result = await originalMethod.apply(this, args);
                metrics.recordRequest(endpoint, 'POST', 200, attributes);
                return result;
            } catch (error) {
                metrics.recordRequest(endpoint, 'POST', 500, { ...attributes, error: error.message });
                throw error;
            }
        };

        return descriptor;
    };
}

export default ObservabilityMetrics;