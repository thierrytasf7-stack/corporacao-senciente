#!/usr/bin/env node
/**
 * ByteRover MCP Server - Camada de Ação Completa
 *
 * Servidor MCP que implementa a Camada de Ação do Protocolo L.L.B.
 * Fornece ferramentas completas para:
 * - Gerenciamento de código e repositório
 * - Análise e visualização de impacto
 * - Controle de versão inteligente
 * - Integração com agentes e workflow
 * - Monitoramento e observabilidade
 * - Segurança e auditoria
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getLangMem } from '../memory/langmem.js';
import { getLetta } from '../memory/letta.js';
import { swarmMemory } from '../swarm/memory.js';
import { telemetry } from '../swarm/telemetry.js';
import { advancedRAG } from '../swarm/advanced_rag.js';
import { modelRouter } from '../swarm/model_router.js';
import { createByteRoverInstance } from '../byterover/byterover_cipher.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'byterover_mcp_server' });

class ByteRoverMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'byterover-mcp-server',
                version: '7.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Componentes do Protocolo L.L.B.
        this.langmem = getLangMem();
        this.letta = getLetta();
        this.memory = swarmMemory;
        this.telemetry = telemetry;
        this.rag = advancedRAG;
        this.router = modelRouter;

        // Inicializar ByteRover Cipher
        this.initializeByteRover();

        this.setupToolHandlers();
        this.setupRequestHandlers();
    }

    async initializeByteRover() {
        try {
            this.byterover = await createByteRoverInstance({
                projectRoot: process.cwd(),
                encryptionKey: 'byterover-mcp-action-layer'
            });
            log.info('ByteRover Cipher initialized for MCP server');
        } catch (error) {
            log.error('Failed to initialize ByteRover Cipher', { error: error.message });
            // Continue without ByteRover - some features will be limited
        }
    }

    setupToolHandlers() {
        // List available tools - Camada de Ação Completa
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    // === PROTOCOLO L.L.B. - LAYER DE AÇÃO ===

                    // LangMem Tools (Sabedoria Arquitetural)
                    {
                        name: 'byterover-store-knowledge',
                        description: 'Armazena conhecimento no LangMem (sabedoria arquitetural)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                knowledge: { type: 'string', description: 'Conhecimento a ser armazenado' },
                                category: { type: 'string', enum: ['architecture', 'patterns', 'business_rules', 'decisions'], description: 'Categoria do conhecimento' },
                                metadata: { type: 'object', description: 'Metadados adicionais (opcional)' }
                            },
                            required: ['knowledge', 'category']
                        }
                    },
                    {
                        name: 'byterover-retrieve-knowledge',
                        description: 'Busca conhecimento relevante no LangMem usando busca semântica',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Query de busca semântica' },
                                category: { type: 'string', enum: ['architecture', 'patterns', 'business_rules', 'decisions'], description: 'Categoria específica (opcional)' },
                                limit: { type: 'number', description: 'Número máximo de resultados (padrão: 5)', default: 5 }
                            },
                            required: ['query']
                        }
                    },

                    // Letta Tools (Estado e Fluxo)
                    {
                        name: 'byterover-store-decision',
                        description: 'Armazena decisão tomada por agente no Letta',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agent_name: { type: 'string', description: 'Nome do agente' },
                                task_description: { type: 'string', description: 'Descrição da task' },
                                decision: { type: 'object', description: 'Decisão tomada' },
                                confidence: { type: 'number', description: 'Nível de confiança (0-1)', minimum: 0, maximum: 1 }
                            },
                            required: ['agent_name', 'task_description', 'decision']
                        }
                    },
                    {
                        name: 'byterover-get-similar-decisions',
                        description: 'Busca decisões similares tomadas anteriormente',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                task: { type: 'string', description: 'Task atual para buscar similares' },
                                limit: { type: 'number', description: 'Número máximo de resultados', default: 5 }
                            },
                            required: ['task']
                        }
                    },
                    {
                        name: 'byterover-update-task-state',
                        description: 'Atualiza estado de uma task no Letta',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                task: { type: 'string', description: 'Descrição da task' },
                                status: { type: 'string', enum: ['planning', 'in_progress', 'completed', 'blocked'], description: 'Novo status' },
                                metadata: { type: 'object', description: 'Metadados adicionais' }
                            },
                            required: ['task', 'status']
                        }
                    },

                    // ByteRover Tools (Interface com Código)
                    {
                        name: 'byterover-inject-context',
                        description: 'Injeta contexto de código em tempo real usando ByteRover Cipher',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                contextId: { type: 'string', description: 'ID único do contexto' },
                                includePatterns: { type: 'array', items: { type: 'string' }, description: 'Padrões de arquivos para incluir' },
                                excludePatterns: { type: 'array', items: { type: 'string' }, description: 'Padrões de arquivos para excluir' }
                            },
                            required: ['contextId']
                        }
                    },
                    {
                        name: 'byterover-map-impact',
                        description: 'Mapeia impacto visual de mudanças no código',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                changes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            file: { type: 'string' },
                                            content: { type: 'string' },
                                            lines: { type: 'number' }
                                        }
                                    },
                                    description: 'Lista de mudanças para analisar'
                                }
                            },
                            required: ['changes']
                        }
                    },
                    {
                        name: 'byterover-analyze-diff',
                        description: 'Análise inteligente de diferenças entre commits',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                fromRef: { type: 'string', description: 'Referência de origem (commit/branch)' },
                                toRef: { type: 'string', description: 'Referência de destino (commit/branch)' },
                                includeContext: { type: 'boolean', description: 'Incluir explicações contextuais', default: true }
                            },
                            required: ['fromRef', 'toRef']
                        }
                    },
                    {
                        name: 'byterover-manage-timeline',
                        description: 'Gerencia timeline evolutiva do projeto',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                action: { type: 'string', enum: ['snapshot', 'branch', 'merge', 'revert', 'analyze'], description: 'Ação a executar' },
                                data: { type: 'object', description: 'Dados específicos da ação' }
                            },
                            required: ['action']
                        }
                    },
                    {
                        name: 'byterover-analyze-dependencies',
                        description: 'Análise completa de dependências de arquivos',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string', description: 'Caminho do arquivo para analisar' },
                                depth: { type: 'number', description: 'Profundidade da análise', default: 2 }
                            },
                            required: ['filePath']
                        }
                    },
                    {
                        name: 'byterover-intelligent-search',
                        description: 'Busca inteligente no código com contexto semântico',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Query de busca' },
                                fileTypes: { type: 'array', items: { type: 'string' }, description: 'Tipos de arquivo para buscar' },
                                includeContext: { type: 'boolean', description: 'Incluir contexto das ocorrências', default: true }
                            },
                            required: ['query']
                        }
                    },

                    // Swarm Memory Tools (Memória Compartilhada)
                    {
                        name: 'byterover-store-memory',
                        description: 'Armazena evento na memória compartilhada do swarm',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agent: { type: 'string', description: 'Agente que executou a ação' },
                                task: { type: 'string', description: 'Task executada' },
                                decision: { type: 'string', description: 'Decisão tomada' },
                                result: { type: 'string', description: 'Resultado obtido' },
                                confidence: { type: 'number', description: 'Nível de confiança', minimum: 0, maximum: 1 }
                            },
                            required: ['agent', 'task', 'decision', 'result']
                        }
                    },
                    {
                        name: 'byterover-get-agent-history',
                        description: 'Busca histórico completo de um agente',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentName: { type: 'string', description: 'Nome do agente' },
                                limit: { type: 'number', description: 'Número máximo de resultados', default: 10 }
                            },
                            required: ['agentName']
                        }
                    },
                    {
                        name: 'byterover-get-similar-tasks',
                        description: 'Busca tasks similares baseadas em histórico',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                task: { type: 'string', description: 'Task atual para buscar similares' },
                                limit: { type: 'number', description: 'Número máximo de resultados', default: 5 }
                            },
                            required: ['task']
                        }
                    },

                    // Telemetry & Observability Tools
                    {
                        name: 'byterover-start-trace',
                        description: 'Inicia um novo span de tracing',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Nome do span' },
                                attributes: { type: 'object', description: 'Atributos do span' }
                            },
                            required: ['name']
                        }
                    },
                    {
                        name: 'byterover-record-metric',
                        description: 'Registra uma métrica customizada',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Nome da métrica' },
                                type: { type: 'string', enum: ['counter', 'histogram'], description: 'Tipo da métrica' },
                                value: { type: 'number', description: 'Valor da métrica' },
                                attributes: { type: 'object', description: 'Atributos da métrica' }
                            },
                            required: ['name', 'type', 'value']
                        }
                    },
                    {
                        name: 'byterover-get-health-status',
                        description: 'Obtém status de saúde completo do sistema',
                        inputSchema: { type: 'object', properties: {} }
                    },

                    // Advanced RAG Tools
                    {
                        name: 'byterover-rag-search',
                        description: 'Busca inteligente usando RAG avançado (METEORA + DAT + ASRank + LevelRAG)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Query de busca semântica' },
                                strategies: { type: 'array', items: { type: 'string' }, description: 'Estratégias RAG a usar' },
                                maxResults: { type: 'number', description: 'Máximo de resultados', default: 10 }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'byterover-rag-generate',
                        description: 'Geração aumentada com contexto RAG',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Query para geração' },
                                generator: { type: 'string', description: 'Tipo de generator a usar' },
                                contextLength: { type: 'number', description: 'Tamanho máximo do contexto', default: 4000 }
                            },
                            required: ['query']
                        }
                    },

                    // Model Router Tools
                    {
                        name: 'byterover-route-model',
                        description: 'Roteia requisição para o melhor modelo usando estratégias avançadas',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                task: { type: 'string', description: 'Task a ser executada' },
                                context: { type: 'object', description: 'Contexto adicional' },
                                strategy: { type: 'string', enum: ['cargo', 'hierarchical', 'expert', 'multi_agent'], description: 'Estratégia de roteamento' }
                            },
                            required: ['task']
                        }
                    },

                    // Integration Tools (Contexto Completo)
                    {
                        name: 'byterover-get-full-context',
                        description: 'Obtém contexto completo do sistema (Protocolo L.L.B. completo)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                task: { type: 'string', description: 'Task para contextualizar' },
                                includeAllLayers: { type: 'boolean', description: 'Incluir todas as camadas L.L.B.', default: true }
                            },
                            required: ['task']
                        }
                    },

                    // Security & Audit Tools
                    {
                        name: 'byterover-create-audit-trail',
                        description: 'Cria trilha de auditoria para ações críticas',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                action: { type: 'string', description: 'Ação auditada' },
                                actor: { type: 'string', description: 'Quem executou a ação' },
                                details: { type: 'object', description: 'Detalhes da ação' }
                            },
                            required: ['action', 'actor']
                        }
                    }
                ]
            };
        });

        // Handle tool calls - Camada de Ação Completa
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    // === LANGMEM TOOLS ===
                    case 'byterover-store-knowledge':
                        return await this.handleStoreKnowledge(args);
                    case 'byterover-retrieve-knowledge':
                        return await this.handleRetrieveKnowledge(args);

                    // === LETTA TOOLS ===
                    case 'byterover-store-decision':
                        return await this.handleStoreDecision(args);
                    case 'byterover-get-similar-decisions':
                        return await this.handleGetSimilarDecisions(args);
                    case 'byterover-update-task-state':
                        return await this.handleUpdateTaskState(args);

                    // === BYTEROVER TOOLS ===
                    case 'byterover-inject-context':
                        return await this.handleInjectContext(args);
                    case 'byterover-map-impact':
                        return await this.handleMapImpact(args);
                    case 'byterover-analyze-diff':
                        return await this.handleAnalyzeDiff(args);
                    case 'byterover-manage-timeline':
                        return await this.handleManageTimeline(args);
                    case 'byterover-analyze-dependencies':
                        return await this.handleAnalyzeDependencies(args);
                    case 'byterover-intelligent-search':
                        return await this.handleIntelligentSearch(args);

                    // === SWARM MEMORY TOOLS ===
                    case 'byterover-store-memory':
                        return await this.handleStoreMemory(args);
                    case 'byterover-get-agent-history':
                        return await this.handleGetAgentHistory(args);
                    case 'byterover-get-similar-tasks':
                        return await this.handleGetSimilarTasks(args);

                    // === TELEMETRY TOOLS ===
                    case 'byterover-start-trace':
                        return await this.handleStartTrace(args);
                    case 'byterover-record-metric':
                        return await this.handleRecordMetric(args);
                    case 'byterover-get-health-status':
                        return await this.handleGetHealthStatus(args);

                    // === ADVANCED RAG TOOLS ===
                    case 'byterover-rag-search':
                        return await this.handleRAGSearch(args);
                    case 'byterover-rag-generate':
                        return await this.handleRAGGenerate(args);

                    // === MODEL ROUTER TOOLS ===
                    case 'byterover-route-model':
                        return await this.handleRouteModel(args);

                    // === INTEGRATION TOOLS ===
                    case 'byterover-get-full-context':
                        return await this.handleGetFullContext(args);
                    case 'byterover-create-audit-trail':
                        return await this.handleCreateAuditTrail(args);

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                log.error(`Error handling tool ${name}`, { error: error.message, args });
                return {
                    content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
                    isError: true
                };
            }
        });
    }

    async handleStoreKnowledge(args) {
        const { knowledge, category, metadata = {} } = args;

        log.info('Storing knowledge via MCP', { category, knowledgeLength: knowledge.length });

        try {
            const success = await this.langmem.storeWisdom(knowledge, category, metadata);

            return {
                content: [{
                    type: 'text',
                    text: success
                        ? `✅ Conhecimento armazenado com sucesso na categoria '${category}'`
                        : `❌ Falha ao armazenar conhecimento`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Erro: ${error.message}` }],
                isError: true
            };
        }
    }

    async handleRetrieveKnowledge(args) {
        const { query, category, limit = 5 } = args;

        log.info('Retrieving knowledge via MCP', { query, category, limit });

        try {
            const wisdom = await this.langmem.getWisdom(query, category);

            // Limitar resultados
            const limitedResults = wisdom.slice(0, limit);

            const results = limitedResults.map(w => ({
                content: w.content,
                category: w.category,
                similarity: w.similarity
            }));

            return {
                content: [{
                    type: 'text',
                    text: `📚 Encontrados ${results.length} itens de conhecimento relevante:\n\n${results.map((r, i) =>
                        `${i + 1}. **${r.category}** (similaridade: ${(r.similarity * 100).toFixed(1)}%)\n   ${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}`
                    ).join('\n\n')}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Erro: ${error.message}` }],
                isError: true
            };
        }
    }

    async handleGetContext(args) {
        const { task, include_timeline = true } = args;

        log.info('Getting full context via MCP', { task, include_timeline });

        try {
            const { getLLBProtocol } = await import('../memory/llb_protocol.js');
            const protocol = getLLBProtocol();

            const context = await protocol.getFullContext(task);

            let response = `🧠 **Contexto Completo para: "${task}"**\n\n`;

            // LangMem Wisdom
            response += `📖 **LangMem (Sabedoria)**: ${context.wisdom?.length || 0} itens\n`;
            if (context.wisdom?.length > 0) {
                context.wisdom.slice(0, 3).forEach((w, i) => {
                    response += `${i + 1}. ${w.content.substring(0, 100)}...\n`;
                });
            }

            // Letta State
            response += `\n🧬 **Letta (Estado)**: Fase ${context.state?.current_phase || 'unknown'}\n`;
            response += `   - Próximos passos: ${context.state?.next_steps?.length || 0}\n`;
            response += `   - Bloqueios: ${context.state?.blockages?.length || 0}\n`;

            // Timeline (se solicitado)
            if (include_timeline && context.timeline?.length > 0) {
                response += `\n📅 **ByteRover (Timeline)**: ${context.timeline.length} commits recentes\n`;
                context.timeline.slice(0, 3).forEach((t, i) => {
                    response += `${i + 1}. ${t.message?.substring(0, 80)} (${t.type})\n`;
                });
            }

            return {
                content: [{ type: 'text', text: response }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Erro: ${error.message}` }],
                isError: true
            };
        }
    }

    async handleStoreDecision(args) {
        const { agent_name, task_description, decision, confidence = 0.5 } = args;

        log.info('Storing decision via MCP', { agent: agent_name, task: task_description.substring(0, 50) });

        try {
            const success = await this.letta.storeDecision(agent_name, task_description, decision, { confidence });

            return {
                content: [{
                    type: 'text',
                    text: success
                        ? `✅ Decisão do agente '${agent_name}' armazenada (confiança: ${(confidence * 100).toFixed(0)}%)`
                        : `❌ Falha ao armazenar decisão`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Erro: ${error.message}` }],
                isError: true
            };
        }
    }

    async handleGetSimilarDecisions(args) {
        const { task, limit = 5 } = args;

        log.info('Getting similar decisions via MCP', { task: task.substring(0, 50), limit });

        try {
            const decisions = await this.letta.getSimilarDecisions(task, limit);

            const results = decisions.slice(0, limit);

            return {
                content: [{
                    type: 'text',
                    text: `🎯 Encontradas ${results.length} decisões similares:\n\n${results.map((d, i) =>
                        `${i + 1}. **${d.agent_name}**: ${d.task_description?.substring(0, 100)}${d.task_description?.length > 100 ? '...' : ''}`
                    ).join('\n')}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Erro: ${error.message}` }],
                isError: true
            };
        }
    }

    // === NOVOS HANDLERS - CAMADA DE AÇÃO COMPLETA ===

    // ByteRover Tools Handlers
    async handleInjectContext(args) {
        const { contextId, includePatterns = [], excludePatterns = [] } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const context = await this.byterover.injectContext(contextId, {
            includePatterns,
            excludePatterns
        });

        return {
            content: [{
                type: 'text',
                text: `💉 Contexto injetado: ${contextId}\n` +
                      `📊 Arquivos rastreados: ${context.trackedFiles?.length || 0}\n` +
                      `🔗 Dependências mapeadas: ${context.dependencies?.length || 0}`
            }]
        };
    }

    async handleMapImpact(args) {
        const { changes } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const impactMap = await this.byterover.mapVisualImpact(changes);

        return {
            content: [{
                type: 'text',
                text: `🎨 Mapeamento de Impacto:\n${impactMap.visualRepresentation}`
            }]
        };
    }

    async handleAnalyzeDiff(args) {
        const { fromRef, toRef, includeContext = true } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const diffAnalysis = await this.byterover.analyzeDiff(fromRef, toRef);

        let response = `🔍 Análise de Diff: ${fromRef} → ${toRef}\n\n`;
        response += `📋 Arquivos modificados: ${diffAnalysis.modifiedFiles?.length || 0}\n`;
        response += `➕ Adições: ${diffAnalysis.additions || 0}\n`;
        response += `➖ Remoções: ${diffAnalysis.deletions || 0}\n\n`;

        if (diffAnalysis.significantChanges?.length > 0) {
            response += `🎯 Mudanças Significativas:\n`;
            diffAnalysis.significantChanges.forEach(change => {
                response += `  • ${change.file}: ${change.description} (${change.severity})\n`;
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    async handleManageTimeline(args) {
        const { action, data = {} } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const result = await this.byterover.manageTimeline(action, data);

        return {
            content: [{
                type: 'text',
                text: `⏰ Timeline ${action}: ${result.id || result.message || 'Executado'}`
            }]
        };
    }

    async handleAnalyzeDependencies(args) {
        const { filePath, depth = 2 } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const dependencyMap = await this.byterover.analyzeDependencies(filePath);

        let response = `🔗 Análise de Dependências: ${filePath}\n\n`;
        response += `📥 Diretas: ${dependencyMap.direct?.length || 0}\n`;
        response += `📤 Dependentes: ${dependencyMap.dependents?.length || 0}\n`;
        response += `🔄 Indiretas: ${dependencyMap.indirect?.length || 0}\n`;

        if (dependencyMap.direct?.length > 0) {
            response += `\nDependências diretas:\n`;
            dependencyMap.direct.forEach(dep => {
                response += `  • ${dep.module} (${dep.type})\n`;
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    async handleIntelligentSearch(args) {
        const { query, fileTypes = [], includeContext = true } = args;

        if (!this.byterover) {
            throw new Error('ByteRover Cipher not initialized');
        }

        const searchResults = await this.byterover.intelligentSearch(query, { fileTypes });

        let response = `🔎 Busca Inteligente: "${query}"\n\n`;
        response += `📊 Resultados encontrados: ${searchResults.totalMatches}\n\n`;

        if (searchResults.suggestions?.length > 0) {
            response += `💡 Sugestões: ${searchResults.suggestions.slice(0, 5).join(', ')}\n\n`;
        }

        if (searchResults.matches?.length > 0) {
            searchResults.matches.slice(0, 10).forEach(match => {
                response += `📄 ${match.file}:${match.line}\n`;
                if (includeContext && match.context) {
                    response += `   ${match.context}\n`;
                }
                response += '\n';
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    // Swarm Memory Tools Handlers
    async handleStoreMemory(args) {
        const { agent, task, decision, result, confidence = 0.5 } = args;

        const success = await this.memory.storeDecision(agent, task, decision, result, { confidence });

        return {
            content: [{
                type: 'text',
                text: success
                    ? `🧠 Memória armazenada: ${agent} → ${decision.substring(0, 50)}...`
                    : `❌ Falha ao armazenar memória`
            }]
        };
    }

    async handleGetAgentHistory(args) {
        const { agentName, limit = 10 } = args;

        const history = await this.memory.getAgentHistory(agentName, limit);

        let response = `📚 Histórico do agente: ${agentName}\n\n`;
        if (history.length === 0) {
            response += 'Nenhum histórico encontrado.';
        } else {
            history.forEach((item, i) => {
                response += `${i + 1}. ${item.task?.substring(0, 80)}...\n`;
                response += `   → ${item.decision?.substring(0, 60)}...\n\n`;
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    async handleGetSimilarTasks(args) {
        const { task, limit = 5 } = args;

        const similarTasks = await this.memory.getSimilarDecisions(task, limit);

        let response = `🎯 Tasks similares encontradas:\n\n`;
        if (similarTasks.length === 0) {
            response += 'Nenhuma task similar encontrada.';
        } else {
            similarTasks.forEach((item, i) => {
                response += `${i + 1}. ${item.agent}: ${item.task?.substring(0, 100)}...\n`;
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    // Telemetry Tools Handlers
    async handleStartTrace(args) {
        const { name, attributes = {} } = args;

        const span = this.telemetry.startSpan(name, attributes);

        return {
            content: [{
                type: 'text',
                text: `🔍 Span iniciado: ${name} (${span.spanId})`
            }]
        };
    }

    async handleRecordMetric(args) {
        const { name, type, value, attributes = {} } = args;

        if (type === 'counter') {
            const counter = this.telemetry.createCounter(name);
            counter.add(value, attributes);
        } else if (type === 'histogram') {
            const histogram = this.telemetry.createHistogram(name);
            histogram.record(value, attributes);
        }

        return {
            content: [{
                type: 'text',
                text: `📊 Métrica registrada: ${name} (${type}) = ${value}`
            }]
        };
    }

    async handleGetHealthStatus(args) {
        const healthResults = await this.telemetry.runHealthChecks();

        let response = `❤️ Status de Saúde do Sistema:\n\n`;
        Object.entries(healthResults).forEach(([service, status]) => {
            const icon = status.status === 'healthy' ? '✅' : '❌';
            response += `${icon} ${service}: ${status.status}\n`;
            if (status.details) {
                Object.entries(status.details).forEach(([key, value]) => {
                    response += `   ${key}: ${value}\n`;
                });
            }
            response += '\n';
        });

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    // Advanced RAG Tools Handlers
    async handleRAGSearch(args) {
        const { query, strategies = ['METEORA', 'DAT', 'ASRank', 'LevelRAG'], maxResults = 10 } = args;

        const searchResults = await this.rag.intelligentSearch(query, {
            strategies,
            maxResults
        });

        let response = `🧠 RAG Search: "${query}"\n\n`;
        response += `📊 Resultados: ${searchResults.results?.length || 0}\n`;
        response += `🎯 Confiança: ${(searchResults.metadata?.confidence * 100 || 0).toFixed(1)}%\n\n`;

        if (searchResults.results?.length > 0) {
            searchResults.results.slice(0, 5).forEach((result, i) => {
                response += `${i + 1}. ${result.content?.substring(0, 100)}...\n`;
                response += `   Score: ${(result.finalScore * 100).toFixed(1)}%\n\n`;
            });
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    async handleRAGGenerate(args) {
        const { query, generator = 'default', contextLength = 4000 } = args;

        // Mock generator for demonstration
        const mockGenerator = {
            generate: async (query, options) => {
                const context = options.context || '';
                return `Resposta gerada para "${query}" usando ${context.length} caracteres de contexto RAG.`;
            }
        };

        const result = await this.rag.generateWithRAG(query, mockGenerator, {
            maxContextLength: contextLength
        });

        return {
            content: [{
                type: 'text',
                text: `🤖 RAG Generation:\n\n${result.response}\n\n📊 Contexto usado: ${result.metadata?.contextItems || 0} itens`
            }]
        };
    }

    // Model Router Tools Handlers
    async handleRouteModel(args) {
        const { task, context = {}, strategy } = args;

        const routing = await this.router.routeRequest(task, context,
            strategy ? { strategy } : {}
        );

        let response = `🎯 Model Routing: "${task}"\n\n`;
        response += `🤖 Modelo selecionado: ${routing.model?.name || 'N/A'}\n`;
        response += `🎲 Estratégia: ${routing.strategy}\n`;
        response += `🎯 Confiança: ${(routing.confidence * 100).toFixed(1)}%\n`;
        response += `💰 Custo estimado: $${routing.estimatedCost?.toFixed(4) || 'N/A'}\n`;
        response += `⚡ Latência estimada: ${routing.estimatedLatency || 'N/A'}ms\n`;

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    // Integration Tools Handlers
    async handleGetFullContext(args) {
        const { task, includeAllLayers = true } = args;

        // Gather context from all L.L.B. layers
        const wisdom = await this.langmem.getWisdom(task);
        const decisions = await this.letta.getSimilarDecisions(task);
        const memory = await this.memory.getSimilarDecisions(task);

        let response = `🧠 **Contexto Completo L.L.B. para: "${task}"**\n\n`;

        // LangMem Layer
        response += `📖 **LangMem (Sabedoria)**: ${wisdom?.length || 0} itens\n`;
        if (wisdom?.length > 0) {
            wisdom.slice(0, 2).forEach((w, i) => {
                response += `${i + 1}. ${w.content?.substring(0, 80)}...\n`;
            });
        }

        // Letta Layer
        response += `\n🧬 **Letta (Estado)**: ${decisions?.length || 0} decisões similares\n`;
        if (decisions?.length > 0) {
            decisions.slice(0, 2).forEach((d, i) => {
                response += `${i + 1}. ${d.agent_name}: ${d.task_description?.substring(0, 60)}...\n`;
            });
        }

        // Swarm Memory Layer
        response += `\n🧠 **Swarm Memory**: ${memory?.length || 0} memórias similares\n`;

        // Telemetry Layer
        const health = await this.telemetry.runHealthChecks();
        response += `\n📊 **Telemetry**: ${Object.keys(health).length} serviços monitorados\n`;

        if (includeAllLayers) {
            // RAG Layer
            const ragStats = this.rag.getStats();
            response += `\n🧠 **RAG**: ${ragStats.knowledgeBase?.totalItems || 0} itens de conhecimento\n`;

            // Model Router Layer
            const routerStats = {
                totalModels: 10, // Approximate
                strategies: ['cargo', 'hierarchical', 'expert', 'multi_agent']
            };
            response += `\n🎯 **Model Router**: ${routerStats.totalModels} modelos, ${routerStats.strategies.length} estratégias\n`;
        }

        return {
            content: [{ type: 'text', text: response }]
        };
    }

    async handleCreateAuditTrail(args) {
        const { action, actor, details = {} } = args;

        // Create audit trail entry
        const auditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            action,
            actor,
            details,
            layer: 'action_layer'
        };

        // Store in memory for now (could be persisted to database)
        log.info('Audit trail created', auditEntry);

        return {
            content: [{
                type: 'text',
                text: `📋 Audit Trail criado: ${action} por ${actor} (${auditEntry.id})`
            }]
        };
    }

    // Letta Tools Handlers (additional)
    async handleUpdateTaskState(args) {
        const { task, status, metadata = {} } = args;

        const success = await this.letta.updateState(task, status, metadata);

        return {
            content: [{
                type: 'text',
                text: success
                    ? `📋 Task atualizada: "${task}" → ${status}`
                    : `❌ Falha ao atualizar task`
            }]
        };
    }

    setupRequestHandlers() {
        // MCP initialization is handled automatically by the SDK
        // No additional request handlers needed for basic MCP functionality
    }

    async run() {
        log.info('Starting ByteRover MCP Server');

        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            log.info('ByteRover MCP Server connected successfully');
        } catch (error) {
            log.error('Failed to start ByteRover MCP Server', { error: error.message });
            process.exit(1);
        }
    }
}

// Start server if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new ByteRoverMCPServer();
    server.run();
}

export default ByteRoverMCPServer;
