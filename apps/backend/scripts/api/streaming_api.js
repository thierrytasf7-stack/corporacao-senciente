#!/usr/bin/env node
/**
 * Streaming API - Respostas em Tempo Real
 *
 * API para streaming de respostas LLM e atualizações em tempo real
 */

import express from 'express';
import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getModelRouter } from '../swarm/model_router.js';
import { callLLMStream } from '../utils/llm_client.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'streaming_api' });

/**
 * API de Streaming para Respostas em Tempo Real
 */
export class StreamingAPI {
    constructor(port = 21301) {
        this.port = port;
        this.app = express();
        this.llbProtocol = getLLBProtocol();
        this.modelRouter = getModelRouter();

        // Mapa de conexões ativas (clientId -> response)
        this.activeStreams = new Map();

        // Estatísticas de streaming
        this.streamStats = {
            active_streams: 0,
            total_streams: 0,
            avg_stream_duration: 0,
            total_tokens_streamed: 0,
            errors: 0
        };

        this.setupMiddleware();
        this.setupRoutes();

        log.info('StreamingAPI initialized', { port });
    }

    /**
     * Configurar middleware
     */
    setupMiddleware() {
        this.app.use(express.json());

        // CORS para streaming
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
            res.header('Cache-Control', 'no-cache');
            res.header('Connection', 'keep-alive');

            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Middleware de logging
        this.app.use((req, res, next) => {
            log.debug('Streaming API Request', {
                method: req.method,
                url: req.url,
                ip: req.ip
            });
            next();
        });
    }

    /**
     * Configurar rotas da API
     */
    setupRoutes() {
        // SSE endpoint para incorporar com agentes
        this.app.get('/api/stream/incorporate', this.handleIncorporateStream.bind(this));

        // WebSocket endpoint para chat em tempo real
        this.app.get('/api/stream/chat', this.handleChatStream.bind(this));

        // Endpoint para executar ação com streaming
        this.app.post('/api/stream/execute', this.handleExecuteStream.bind(this));

        // Endpoint para cancelar stream
        this.app.post('/api/stream/cancel/:streamId', this.handleCancelStream.bind(this));

        // Status dos streams ativos
        this.app.get('/api/stream/status', (req, res) => {
            res.json({
                active_streams: this.streamStats.active_streams,
                total_streams: this.streamStats.total_streams,
                avg_duration: Math.round(this.streamStats.avg_stream_duration),
                total_tokens: this.streamStats.total_tokens_streamed,
                errors: this.streamStats.errors
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Streaming endpoint não encontrado'
            });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            log.error('Streaming API Error', { error: error.message, stack: error.stack });
            this.streamStats.errors++;

            if (res.headersSent) {
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Erro interno no streaming'
            });
        });
    }

    /**
     * Handle streaming para incorporação com agentes
     */
    async handleIncorporateStream(req, res) {
        const { prompt, agent = 'architect', context = {} } = req.query;
        const streamId = this.generateStreamId();

        try {
            // Configurar headers SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            // Registrar stream ativo
            this.activeStreams.set(streamId, {
                response: res,
                startTime: Date.now(),
                type: 'incorporate',
                agent
            });

            this.streamStats.active_streams++;
            this.streamStats.total_streams++;

            // Enviar evento inicial
            this.sendSSE(res, 'start', {
                streamId,
                type: 'incorporate',
                agent,
                timestamp: new Date().toISOString()
            });

            // Simular progresso de incorporação
            await this.streamIncorporationProcess(res, prompt, agent, context);

            // Enviar evento de conclusão
            this.sendSSE(res, 'complete', {
                streamId,
                message: 'Incorporação concluída com sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            log.error('Error in incorporate stream', { error: error.message, streamId });
            this.sendSSE(res, 'error', {
                streamId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            // Limpar stream
            this.cleanupStream(streamId);
        }
    }

    /**
     * Handle streaming para chat
     */
    async handleChatStream(req, res) {
        const { message, agent = 'assistant', model } = req.query;
        const streamId = this.generateStreamId();

        try {
            // Configurar headers SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Registrar stream ativo
            this.activeStreams.set(streamId, {
                response: res,
                startTime: Date.now(),
                type: 'chat',
                agent
            });

            this.streamStats.active_streams++;
            this.streamStats.total_streams++;

            // Enviar evento inicial
            this.sendSSE(res, 'start', {
                streamId,
                type: 'chat',
                agent,
                model,
                timestamp: new Date().toISOString()
            });

            // Simular streaming de resposta do LLM
            await this.streamChatResponse(res, message, agent, model, streamId);

            // Enviar evento de conclusão
            this.sendSSE(res, 'complete', {
                streamId,
                full_response: 'Resposta completa simulada', // Em produção seria a resposta real
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            log.error('Error in chat stream', { error: error.message, streamId });
            this.sendSSE(res, 'error', {
                streamId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            this.cleanupStream(streamId);
        }
    }

    /**
     * Handle execução com streaming
     */
    async handleExecuteStream(req, res) {
        const { action, context = {} } = req.body;
        const streamId = this.generateStreamId();

        try {
            // Configurar headers SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Registrar stream ativo
            this.activeStreams.set(streamId, {
                response: res,
                startTime: Date.now(),
                type: 'execute',
                action: action.type
            });

            this.streamStats.active_streams++;
            this.streamStats.total_streams++;

            // Enviar evento inicial
            this.sendSSE(res, 'start', {
                streamId,
                type: 'execute',
                action: action.type,
                timestamp: new Date().toISOString()
            });

            // Simular execução com progresso
            await this.streamExecutionProcess(res, action, context, streamId);

            // Enviar evento de conclusão
            this.sendSSE(res, 'complete', {
                streamId,
                result: 'Execução concluída com sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            log.error('Error in execute stream', { error: error.message, streamId });
            this.sendSSE(res, 'error', {
                streamId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            this.cleanupStream(streamId);
        }
    }

    /**
     * Handle cancelamento de stream
     */
    handleCancelStream(req, res) {
        const { streamId } = req.params;

        const stream = this.activeStreams.get(streamId);
        if (stream) {
            this.sendSSE(stream.response, 'cancelled', {
                streamId,
                message: 'Stream cancelado pelo usuário',
                timestamp: new Date().toISOString()
            });

            this.cleanupStream(streamId);
            res.json({ success: true, message: 'Stream cancelado' });
        } else {
            res.status(404).json({ success: false, error: 'Stream não encontrado' });
        }
    }

    /**
     * Stream do processo de incorporação
     */
    async streamIncorporationProcess(res, prompt, agent, context) {
        const steps = [
            { step: 'validation', message: 'Validando entrada...', duration: 500 },
            { step: 'context_gathering', message: 'Coletando contexto...', duration: 800 },
            { step: 'agent_selection', message: `Selecionando agente ${agent}...`, duration: 300 },
            { step: 'prompt_enhancement', message: 'Otimizando prompt...', duration: 600 },
            { step: 'execution', message: 'Executando incorporação...', duration: 1000 },
            { step: 'feedback_collection', message: 'Coletando feedback...', duration: 400 }
        ];

        for (const stepInfo of steps) {
            await this.delay(stepInfo.duration);

            this.sendSSE(res, 'progress', {
                step: stepInfo.step,
                message: stepInfo.message,
                progress: Math.round((steps.indexOf(stepInfo) + 1) / steps.length * 100),
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Stream de resposta do chat
     */
    async streamChatResponse(res, message, agent, model, streamId) {
        const systemPrompt = `Você é o agente ${agent} em um sistema de swarm inteligente.
        Responda de forma útil, precisa e contextualizada.
        Mantenha suas respostas concisas mas informativas.`;

        let tokenCount = 0;
        let currentText = '';

        try {
            const fullResponse = await callLLMStream(
                message,
                systemPrompt,
                0.7, // temperature
                {
                    model: model || undefined,
                    maxTokens: 1000,
                    timeout: 30000
                },
                // Callback para cada token
                (token, textSoFar) => {
                    tokenCount++;
                    currentText = textSoFar;

                    this.sendSSE(res, 'token', {
                        streamId,
                        token: token,
                        text_so_far: currentText,
                        token_index: tokenCount - 1,
                        total_tokens: null, // Não sabemos o total antecipadamente
                        progress: null, // Progresso baseado em tokens não é preciso
                        timestamp: new Date().toISOString()
                    });

                    this.streamStats.total_tokens_streamed++;
                }
            );

            // Enviar evento final com resposta completa
            this.sendSSE(res, 'response_complete', {
                streamId,
                full_response: fullResponse,
                total_tokens: tokenCount,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            log.error('Error streaming chat response', { error: error.message, streamId });

            this.sendSSE(res, 'error', {
                streamId,
                error: error.message,
                partial_response: currentText,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Stream do processo de execução
     */
    async streamExecutionProcess(res, action, context, streamId) {
        const steps = [
            { step: 'validation', message: 'Validando ação...', progress: 10 },
            { step: 'confidence_check', message: 'Avaliando confiança...', progress: 20 },
            { step: 'resource_check', message: 'Verificando recursos...', progress: 30 },
            { step: 'execution_prep', message: 'Preparando execução...', progress: 40 },
            { step: 'llb_protocol', message: 'Executando via Protocolo L.L.B....', progress: 60 },
            { step: 'result_processing', message: 'Processando resultados...', progress: 80 },
            { step: 'cleanup', message: 'Finalizando...', progress: 100 }
        ];

        for (const stepInfo of steps) {
            await this.delay(300 + Math.random() * 700);

            this.sendSSE(res, 'execution_progress', {
                streamId,
                step: stepInfo.step,
                message: stepInfo.message,
                progress: stepInfo.progress,
                action_type: action.type,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Enviar evento SSE
     */
    sendSSE(res, event, data) {
        try {
            const eventData = JSON.stringify(data);
            res.write(`event: ${event}\n`);
            res.write(`data: ${eventData}\n\n`);

            // Forçar flush se disponível
            if (res.flush) {
                res.flush();
            }
        } catch (error) {
            log.warn('Error sending SSE', { error: error.message, event });
        }
    }

    /**
     * Limpar stream
     */
    cleanupStream(streamId) {
        const stream = this.activeStreams.get(streamId);
        if (stream) {
            const duration = Date.now() - stream.startTime;

            // Atualizar estatísticas
            this.streamStats.active_streams--;
            const totalDuration = this.streamStats.avg_stream_duration * (this.streamStats.total_streams - 1) + duration;
            this.streamStats.avg_stream_duration = totalDuration / this.streamStats.total_streams;

            // Remover da lista ativa
            this.activeStreams.delete(streamId);

            try {
                stream.response.end();
            } catch (error) {
                log.debug('Error ending stream response', { error: error.message, streamId });
            }
        }
    }

    /**
     * Cancelar todos os streams ativos
     */
    cancelAllStreams() {
        log.info('Cancelling all active streams', { count: this.activeStreams.size });

        for (const [streamId, stream] of this.activeStreams.entries()) {
            this.sendSSE(stream.response, 'cancelled', {
                streamId,
                message: 'Sistema sendo encerrado',
                timestamp: new Date().toISOString()
            });

            this.cleanupStream(streamId);
        }
    }

    /**
     * Gerar ID único para stream
     */
    generateStreamId() {
        return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay utilitário
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        return { ...this.streamStats };
    }

    /**
     * Iniciar servidor
     */
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    log.info(`Streaming API server running on port ${this.port}`);
                    resolve(this.server);
                });

                this.server.on('error', (error) => {
                    log.error('Failed to start Streaming API server', { error: error.message });
                    reject(error);
                });

                // Graceful shutdown
                process.on('SIGTERM', () => {
                    log.info('Received SIGTERM, shutting down gracefully');
                    this.cancelAllStreams();
                    if (this.server) {
                        this.server.close();
                    }
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
            this.cancelAllStreams();
            this.server.close();
            log.info('Streaming API server stopped');
        }
    }
}

// Singleton
let streamingAPIInstance = null;

export function getStreamingAPI(port = 21301) {
    if (!streamingAPIInstance) {
        streamingAPIInstance = new StreamingAPI(port);
    }
    return streamingAPIInstance;
}

export default StreamingAPI;
