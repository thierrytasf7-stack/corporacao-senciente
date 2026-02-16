#!/usr/bin/env node
/**
 * Brain - Orquestrador Central
 * Industry 6.0/7.0 Ready
 * 
 * Coordena todo o fluxo: recebe tasks, roteia para agentes, executa ações, armazena memória
 * 
 * Industry 6.0 Features:
 * - SensoryFeedbackLoop integration for hyper-personalization
 * - Real-time behavioral adaptation
 * - Emotional state awareness
 * 
 * Industry 7.0 Features:
 * - Corporate will integration hooks
 * - Autonomous decision capabilities
 * - Self-preservation directives
 */

import { logger } from '../utils/logger.js';
import { getExecutor } from './executor.js';
import { getMemory } from './memory.js';
import { getRouter } from './router.js';

const log = logger.child({ module: 'brain' });

// Industry 6.0/7.0 configuration
const SENSORY_FEEDBACK_ENABLED = process.env.SENSORY_FEEDBACK_ENABLED !== 'false';
const CORPORATE_WILL_ENABLED = process.env.CORPORATE_WILL_ENABLED !== 'false';

/**
 * Brain - Orquestrador Central
 * Enhanced for Industry 6.0/7.0
 */
class Brain {
    constructor() {
        this.router = getRouter();
        this.executor = getExecutor();
        this.memory = getMemory();
        this.agents = new Map(); // Agentes registrados
        this.isInitialized = false;
        
        // Industry 6.0: Sensory Feedback Loop
        this.sensoryFeedbackLoop = null;
        this.sensoryHandlers = [];
        
        // Industry 7.0: Corporate Will
        this.corporateWillEngine = null;
        this.autonomousDecisionQueue = [];
        
        // Performance metrics
        this.metrics = {
            tasksProcessed: 0,
            avgLatency: 0,
            successRate: 1.0,
            sensoryAdaptations: 0
        };
        
        log.info('Brain initialized', {
            sensoryEnabled: SENSORY_FEEDBACK_ENABLED,
            corporateWillEnabled: CORPORATE_WILL_ENABLED
        });
    }
    
    /**
     * Register a sensory feedback handler (Industry 6.0)
     * @param {Function} handler - Async function receiving SensoryFeedback
     */
    registerSensoryHandler(handler) {
        this.sensoryHandlers.push(handler);
        log.debug('Sensory handler registered', { total: this.sensoryHandlers.length });
    }
    
    /**
     * Emit sensory feedback to all handlers
     * @private
     */
    async _emitSensoryFeedback(feedbackData) {
        if (!SENSORY_FEEDBACK_ENABLED) return;
        
        for (const handler of this.sensoryHandlers) {
            try {
                await handler(feedbackData);
            } catch (err) {
                log.error('Sensory handler error', { error: err.message });
            }
        }
        this.metrics.sensoryAdaptations++;
    }
    
    /**
     * Get adaptive response strategy for user (Industry 6.0)
     * @param {string} userId - User identifier
     * @returns {object} Response strategy
     */
    async getAdaptiveStrategy(userId) {
        // Default strategy
        const defaultStrategy = {
            detailLevel: 'medium',
            tone: 'professional',
            empathyLevel: 0.5,
            proactivity: 0.5
        };
        
        if (!this.sensoryFeedbackLoop) return defaultStrategy;
        
        try {
            return await this.sensoryFeedbackLoop.getResponseStrategy(userId);
        } catch (err) {
            log.warn('Could not get adaptive strategy', { error: err.message });
            return defaultStrategy;
        }
    }
    
    /**
     * Consult corporate will for autonomous decision (Industry 7.0)
     * @param {object} decision - Decision context
     * @returns {object} Corporate will guidance
     */
    async consultCorporateWill(decision) {
        if (!CORPORATE_WILL_ENABLED || !this.corporateWillEngine) {
            return { approved: true, guidance: null };
        }
        
        try {
            return await this.corporateWillEngine.evaluate(decision);
        } catch (err) {
            log.error('Corporate will consultation failed', { error: err.message });
            return { approved: true, guidance: null, error: err.message };
        }
    }
    
    /**
     * Get brain metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            registeredAgents: this.agents.size,
            sensoryHandlers: this.sensoryHandlers.length,
            industryLevel: CORPORATE_WILL_ENABLED ? '7.0' : (SENSORY_FEEDBACK_ENABLED ? '6.0' : '5.0')
        };
    }

    /**
     * Inicializa o Brain e registra todos os agentes
     */
    async initialize() {
        if (this.isInitialized) return;

        log.info('Initializing Brain...');

        try {
            // Carregamento dinâmico para evitar dependência circular
            const { registerAllAgents } = await import('./agent_registry.js');
            await registerAllAgents();

            this.isInitialized = true;
            log.info('Brain initialized successfully');
        } catch (err) {
            log.error('Error during Brain initialization', { error: err.message });
        }
    }

    /**
     * Registra um agente
     * 
     * @param {BaseAgent} agent - Instância do agente
     */
    registerAgent(agent) {
        // Injetar dependências no agente
        agent.router = this.router;
        agent.memory = this.memory;

        this.agents.set(agent.name, agent);
        log.info('Agent registered', { name: agent.name, sector: agent.sector });
    }

    /**
     * Recebe uma task e processa
     * 
     * @param {string|object} task - Task (string ou objeto com task e context)
     * @param {object} context - Contexto adicional
     * @returns {Promise<object>} Resultado do processamento
     */
    async receiveTask(task, context = {}) {
        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const taskContext = typeof task === 'object' ? { ...task, ...context } : context;

        log.info('Brain received task', { task: taskDescription.substring(0, 100) });

        try {
            // 1. Rotear para agente(s)
            const routing = await this.router.findBestAgent(taskDescription, taskContext);

            // 2. Executar agente(s)
            let result;
            if (routing.orchestration?.needed) {
                result = await this.orchestrateMultipleAgents(taskDescription, routing.orchestration, taskContext);
            } else {
                result = await this.routeToAgent(routing.primaryAgent, taskDescription, taskContext);
            }

            // 3. Executar ações se houver
            if (result.actions && result.actions.length > 0) {
                const actionResults = [];
                for (const action of result.actions) {
                    const actionResult = await this.executor.executeAction(action);
                    actionResults.push(actionResult);
                }
                result.actionResults = actionResults;
            }

            // 4. Armazenar decisão
            await this.memory.storeDecision(
                routing.primaryAgent,
                taskDescription,
                {
                    routing,
                    result: result.result || result,
                    actions: result.actions || []
                },
                result
            );

            return {
                success: true,
                agent: routing.primaryAgent,
                result,
                routing
            };
        } catch (err) {
            log.error('Error processing task', { error: err.message, task: taskDescription.substring(0, 50) });

            // Armazenar erro também
            await this.memory.storeDecision(
                'brain',
                taskDescription,
                { error: err.message },
                null
            );

            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Roteia para um agente específico
     * 
     * @param {string} agentName - Nome do agente
     * @param {string} task - Tarefa
     * @param {object} context - Contexto
     * @returns {Promise<object>} Resultado
     */
    async routeToAgent(agentName, task, context = {}) {
        // Verificar se agente está registrado
        const agent = this.agents.get(agentName);

        if (agent) {
            // Usar agente registrado
            log.info('Using registered agent', { agent: agentName });
            return await agent.execute(task, context);
        }

        // Caso contrário, usar agent_executor existente
        log.info('Using legacy agent executor', { agent: agentName });
        const { executeSpecializedAgent } = await import('../cerebro/agent_executor.js');
        return await executeSpecializedAgent(agentName, task, context);
    }

    /**
     * Orquestra múltiplos agentes
     * 
     * @param {string} task - Tarefa principal
     * @param {object} orchestration - Plano de orquestração
     * @param {object} context - Contexto
     * @returns {Promise<object>} Resultado agregado
     */
    async orchestrateMultipleAgents(task, orchestration, context = {}) {
        log.info('Orchestrating multiple agents', {
            agents: orchestration.agents.map(a => a.name).join(', ')
        });

        const results = [];

        // Executar cada agente em paralelo ou sequencial conforme plano
        for (const agentPlan of orchestration.agents) {
            const agentResult = await this.routeToAgent(
                agentPlan.name,
                agentPlan.subtask || task,
                {
                    ...context,
                    orchestrationRole: agentPlan.role
                }
            );

            results.push({
                agent: agentPlan.name,
                role: agentPlan.role,
                result: agentResult
            });
        }

        // Agregar resultados
        const aggregated = this.aggregateResults(results);

        return aggregated;
    }

    /**
     * Agrega resultados de múltiplos agentes
     * 
     * @param {array} results - Resultados dos agentes
     * @returns {object} Resultado agregado
     */
    aggregateResults(results) {
        // Agregar resultados de forma inteligente
        const aggregated = {
            agents: results.map(r => r.agent),
            results: results.map(r => r.result),
            summary: results.map(r => ({
                agent: r.agent,
                role: r.role,
                summary: r.result?.summary || r.result?.result || 'Executado'
            }))
        };

        // Tentar criar resumo unificado se todos agentes retornaram texto
        const allTextResults = results.every(r => typeof r.result === 'string' || r.result?.result);
        if (allTextResults) {
            aggregated.unifiedSummary = results
                .map(r => `[${r.agent}]: ${typeof r.result === 'string' ? r.result : r.result.result}`)
                .join('\n\n');
        }

        return aggregated;
    }
}

// Singleton
let brainInstance = null;

export function getBrain() {
    if (!brainInstance) {
        brainInstance = new Brain();
    }
    return brainInstance;
}

export default Brain;





