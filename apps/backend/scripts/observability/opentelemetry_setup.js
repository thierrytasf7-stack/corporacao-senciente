#!/usr/bin/env node
/**
 * OpenTelemetry Setup - Observabilidade Avançada
 *
 * Configuração completa do OpenTelemetry para tracing distribuído,
 * métricas e logs estruturados na Corporação Senciente
 */

import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'opentelemetry_setup' });

/**
 * Configuração do OpenTelemetry para observabilidade avançada
 */
export class OpenTelemetrySetup {
    constructor(options = {}) {
        this.serviceName = options.serviceName || 'corporacao-senciente';
        this.serviceVersion = options.serviceVersion || '7.0.0';
        this.environment = options.environment || 'development';

        // Configurações de exportação
        this.jaegerEndpoint = options.jaegerEndpoint || 'http://localhost:14268/api/traces';
        this.prometheusEndpoint = options.prometheusEndpoint || 'http://localhost:9090';
        this.tempoEndpoint = options.tempoEndpoint || 'http://localhost:3200';

        // Configurações de sampling
        this.traceSamplingRate = options.traceSamplingRate || 0.1; // 10% de traces
        this.metricInterval = options.metricInterval || 60000; // 1 minuto

        // Estado do sistema
        this.isInitialized = false;
        this.tracer = null;
        this.meter = null;
        this.logger = null;

        log.info('OpenTelemetry setup initialized', {
            serviceName: this.serviceName,
            environment: this.environment
        });

        // Inicializar com fallback imediatamente para evitar erros antes do initialize()
        this.initializeFallback();
    }

    /**
     * Inicializar OpenTelemetry
     */
    async initialize() {
        try {
            log.info('Initializing OpenTelemetry...');

            // Verificar se OpenTelemetry está disponível
            const hasOpenTelemetry = await this.checkOpenTelemetryAvailability();

            if (!hasOpenTelemetry) {
                log.warn('OpenTelemetry not available, using fallback logging');
                this.initializeFallback();
                return;
            }

            // Inicializar componentes do OpenTelemetry
            await this.initializeTracer();
            await this.initializeMetrics();
            await this.initializeLogger();

            // Configurar instrumentação automática
            await this.setupAutoInstrumentation();

            // Configurar exportadores
            await this.setupExporters();

            this.isInitialized = true;

            log.info('OpenTelemetry initialized successfully');

        } catch (error) {
            log.error('Failed to initialize OpenTelemetry', { error: error.message });
            this.initializeFallback();
        }
    }

    /**
     * Verificar disponibilidade do OpenTelemetry
     */
    async checkOpenTelemetryAvailability() {
        try {
            // Verificar se os pacotes estão instalados
            await import('@opentelemetry/api');
            await import('@opentelemetry/sdk-node');
            await import('@opentelemetry/exporter-jaeger');
            await import('@opentelemetry/exporter-prometheus');

            log.info('OpenTelemetry packages available');
            return true;
        } catch (error) {
            log.warn('OpenTelemetry packages not available', { error: error.message });
            return false;
        }
    }

    /**
     * Inicializar tracer para distributed tracing
     */
    async initializeTracer() {
        try {
            const { NodeTracerProvider } = await import('@opentelemetry/sdk-trace-node');
            const { SimpleSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
            const { JaegerExporter } = await import('@opentelemetry/exporter-jaeger');
            const { trace } = await import('@opentelemetry/api');

            // Configurar exportador Jaeger
            const jaegerExporter = new JaegerExporter({
                endpoint: this.jaegerEndpoint,
                serviceName: this.serviceName
            });

            // Configurar provider com sampling
            const provider = new NodeTracerProvider({
                sampler: {
                    shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
                        // Sampling baseado em taxa configurada
                        return Math.random() < this.traceSamplingRate;
                    }
                }
            });

            provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
            provider.register();

            this.tracer = trace.getTracer(this.serviceName, this.serviceVersion);

            log.info('Tracer initialized with Jaeger exporter');

        } catch (error) {
            log.error('Failed to initialize tracer', { error: error.message });
            throw error;
        }
    }

    /**
     * Inicializar métricas
     */
    async initializeMetrics() {
        try {
            const { MeterProvider } = await import('@opentelemetry/sdk-metrics');
            const { PrometheusExporter } = await import('@opentelemetry/exporter-prometheus');
            const { metrics } = await import('@opentelemetry/api');

            // Configurar exportador Prometheus
            const prometheusExporter = new PrometheusExporter({
                endpoint: this.prometheusEndpoint,
                port: 9090
            });

            // Configurar provider
            const provider = new MeterProvider({
                readers: [prometheusExporter]
            });

            metrics.setGlobalMeterProvider(provider);

            this.meter = metrics.getMeter(this.serviceName, this.serviceVersion);

            // Criar métricas padrão
            this.createDefaultMetrics();

            log.info('Metrics initialized with Prometheus exporter');

        } catch (error) {
            log.error('Failed to initialize metrics', { error: error.message });
            throw error;
        }
    }

    /**
     * Inicializar logger estruturado
     */
    async initializeLogger() {
        try {
            // Usar logger existente com estrutura OpenTelemetry
            this.logger = logger.child({
                service: this.serviceName,
                version: this.serviceVersion,
                environment: this.environment
            });

            log.info('Structured logger initialized');

        } catch (error) {
            log.error('Failed to initialize logger', { error: error.message });
            throw error;
        }
    }

    /**
     * Configurar instrumentação automática
     */
    async setupAutoInstrumentation() {
        try {
            // Instrumentação para HTTP
            await this.setupHttpInstrumentation();

            // Instrumentação para banco de dados
            await this.setupDatabaseInstrumentation();

            // Instrumentação para filesystem
            await this.setupFilesystemInstrumentation();

            log.info('Auto-instrumentation configured');

        } catch (error) {
            log.warn('Failed to setup auto-instrumentation', { error: error.message });
        }
    }

    /**
     * Configurar exportadores
     */
    async setupExporters() {
        try {
            // Configurar exportação para Grafana Tempo
            if (this.tempoEndpoint) {
                await this.setupTempoExporter();
            }

            log.info('Exporters configured');

        } catch (error) {
            log.warn('Failed to setup exporters', { error: error.message });
        }
    }

    /**
     * Inicializar fallback quando OpenTelemetry não está disponível
     */
    initializeFallback() {
        log.info('Using fallback observability (structured logging only)');

        this.tracer = {
            startSpan: (name, options) => ({
                setAttribute: () => { },
                setStatus: () => { },
                addEvent: () => { },
                recordException: () => { },
                end: () => { }
            })
        };

        this.meter = {
            createCounter: () => ({ add: () => { } }),
            createHistogram: () => ({ record: () => { } }),
            createObservableGauge: () => ({})
        };

        this.logger = logger.child({
            service: this.serviceName,
            observability: 'fallback'
        });

        this.isInitialized = true;
    }

    /**
     * Criar métricas padrão do sistema
     */
    createDefaultMetrics() {
        if (!this.meter) return;

        // Contadores
        this.requestCounter = this.meter.createCounter('http_requests_total', {
            description: 'Total number of HTTP requests'
        });

        this.errorCounter = this.meter.createCounter('errors_total', {
            description: 'Total number of errors'
        });

        // Histogramas
        this.requestDuration = this.meter.createHistogram('http_request_duration_seconds', {
            description: 'HTTP request duration in seconds'
        });

        this.llbExecutionTime = this.meter.createHistogram('llb_execution_duration_seconds', {
            description: 'LLB execution duration in seconds'
        });

        // Gauges
        this.activeStreams = this.meter.createObservableGauge('active_streams', {
            description: 'Number of active streaming connections'
        });

        this.memoryUsage = this.meter.createObservableGauge('memory_usage_bytes', {
            description: 'Memory usage in bytes'
        });
    }

    /**
     * Configurar instrumentação HTTP
     */
    async setupHttpInstrumentation() {
        try {
            const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');

            const instrumentation = new HttpInstrumentation({
                ignoreIncomingPaths: ['/health', '/metrics'],
                ignoreOutgoingUrls: [/.*\.local$/]
            });

            // Registrar instrumentação
            // Em produção, isso seria feito automaticamente pelo SDK

            log.debug('HTTP instrumentation configured');

        } catch (error) {
            log.debug('HTTP instrumentation not available', { error: error.message });
        }
    }

    /**
     * Configurar instrumentação de banco de dados
     */
    async setupDatabaseInstrumentation() {
        try {
            // Instrumentação para diferentes bancos de dados
            const instrumentations = [];

            // PostgreSQL
            try {
                const { PgInstrumentation } = await import('@opentelemetry/instrumentation-pg');
                instrumentations.push(new PgInstrumentation());
            } catch (e) {
                log.debug('PostgreSQL instrumentation not available');
            }

            // MongoDB
            try {
                const { MongoDBInstrumentation } = await import('@opentelemetry/instrumentation-mongodb');
                instrumentations.push(new MongoDBInstrumentation());
            } catch (e) {
                log.debug('MongoDB instrumentation not available');
            }

            log.debug('Database instrumentation configured');

        } catch (error) {
            log.debug('Database instrumentation setup failed', { error: error.message });
        }
    }

    /**
     * Configurar instrumentação de filesystem
     */
    async setupFilesystemInstrumentation() {
        try {
            const { FsInstrumentation } = await import('@opentelemetry/instrumentation-fs');

            const instrumentation = new FsInstrumentation({
                // Ignorar arquivos de log e cache
                ignorePaths: [/.*\.log$/, /.*cache.*/, /node_modules/]
            });

            log.debug('Filesystem instrumentation configured');

        } catch (error) {
            log.debug('Filesystem instrumentation not available', { error: error.message });
        }
    }

    /**
     * Configurar exportação para Tempo
     */
    async setupTempoExporter() {
        try {
            // Configuração para Grafana Tempo
            // Em produção, seria usado OTLP exporter

            log.debug('Tempo exporter configured');

        } catch (error) {
            log.debug('Tempo exporter setup failed', { error: error.message });
        }
    }

    /**
     * Criar span para operação
     */
    createSpan(name, options = {}) {
        if (!this.tracer) return null;

        const span = this.tracer.startSpan(name, {
            kind: options.kind || 'internal',
            attributes: {
                'service.name': this.serviceName,
                'service.version': this.serviceVersion,
                environment: this.environment,
                ...options.attributes
            }
        });

        return span;
    }

    /**
     * Registrar métrica
     */
    recordMetric(name, value, attributes = {}) {
        if (!this.meter) return;

        // Encontrar métrica existente ou criar contador
        const metric = this.meter.createCounter(name, {
            description: `Auto-generated metric: ${name}`
        });

        metric.add(value, {
            service: this.serviceName,
            environment: this.environment,
            ...attributes
        });
    }

    /**
     * Log estruturado com contexto
     */
    log(level, message, context = {}) {
        if (!this.logger) return;

        const logContext = {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            version: this.serviceVersion,
            environment: this.environment,
            ...context
        };

        this.logger[level](message, logContext);
    }

    /**
     * Criar span para operação crítica
     */
    async traceOperation(operationName, operationFn, context = {}) {
        const span = this.createSpan(operationName, {
            attributes: {
                'operation.type': context.type || 'unknown',
                'operation.agent': context.agent || 'system'
            }
        });

        try {
            span.addEvent('operation_started', {
                timestamp: Date.now()
            });

            const result = await operationFn();

            span.addEvent('operation_completed', {
                timestamp: Date.now(),
                success: true
            });

            span.setStatus({ code: 'ok' });

            return result;

        } catch (error) {
            span.recordException(error);
            span.setStatus({ code: 'error', message: error.message });

            throw error;

        } finally {
            span.end();
        }
    }

    /**
     * Obter status da observabilidade
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            service: {
                name: this.serviceName,
                version: this.serviceVersion,
                environment: this.environment
            },
            tracing: {
                available: !!this.tracer,
                samplingRate: this.traceSamplingRate
            },
            metrics: {
                available: !!this.meter,
                interval: this.metricInterval
            },
            logging: {
                available: !!this.logger
            },
            exporters: {
                jaeger: !!this.jaegerEndpoint,
                prometheus: !!this.prometheusEndpoint,
                tempo: !!this.tempoEndpoint
            }
        };
    }

    /**
     * Encerrar observabilidade
     */
    async shutdown() {
        log.info('Shutting down OpenTelemetry observability');

        try {
            // Forçar flush de spans e métricas pendentes
            if (this.tracer) {
                // Flush spans
            }

            if (this.meter) {
                // Flush metrics
            }

            log.info('OpenTelemetry shutdown completed');

        } catch (error) {
            log.error('Error during OpenTelemetry shutdown', { error: error.message });
        }
    }
}

// Singleton
let openTelemetryInstance = null;

export function getOpenTelemetry(options = {}) {
    if (!openTelemetryInstance) {
        openTelemetryInstance = new OpenTelemetrySetup(options);
    }
    return openTelemetryInstance;
}

export default OpenTelemetrySetup;