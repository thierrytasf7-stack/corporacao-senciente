import fs from 'fs';
import path from 'path';

/**
 * Router - Roteador de Agentes
 * 
 * Responsável por encontrar o melhor agente(s) para cada tarefa
 */

import { selectAgentForTask } from '../cerebro/agent_selector.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'router' });

const CACHE_DIR = path.resolve(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'router_cache.json');

// Ensure cache dir exists
if (!fs.existsSync(CACHE_DIR)) {
    try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (err) {
        log.error('Failed to create cache directory', err);
    }
}

/**
 * Router de Agentes
 */
class Router {
    constructor() {
        this.cache = new Map(); // Cache de decisões recentes
        this.cacheTimeout = 24 * 60 * 60 * 1000; // Aumentado para 24h (persistente)
        this.loadCache();
    }

    loadCache() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                const data = fs.readFileSync(CACHE_FILE, 'utf8');
                const json = JSON.parse(data);
                // Converter de volta para Map
                this.cache = new Map(json);
                log.info(`Cache carregado com ${this.cache.size} entradas`);
            }
        } catch (err) {
            log.warn('Failed to load router cache', err);
        }
    }

    saveCache() {
        try {
            // Converter Map para Array para serializar
            const entries = Array.from(this.cache.entries());
            fs.writeFileSync(CACHE_FILE, JSON.stringify(entries, null, 2), 'utf8');
        } catch (err) {
            log.warn('Failed to save router cache', err);
        }
    }

    /**
     * Encontra o melhor agente para uma tarefa
     * 
     * @param {string} task - Descrição da tarefa
     * @param {object} context - Contexto adicional
     * @returns {Promise<object>} Agente selecionado com score e reasoning
     */
    async findBestAgent(task, context = {}) {
        // Verificar cache primeiro
        const cacheKey = `${task.substring(0, 100)}_${JSON.stringify(context)}`;
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            log.debug('Using cached agent selection', { task: task.substring(0, 50) });
            return cached.result;
        }

        // Usar agent_selector existente
        const selection = await selectAgentForTask(task, context);

        // Cachear resultado
        this.cache.set(cacheKey, {
            result: selection,
            timestamp: Date.now()
        });

        // Limpar cache antigo (manter apenas últimos 200)
        if (this.cache.size > 200) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp); // Mais recentes primeiro
            this.cache = new Map(entries.slice(0, 200));
        }

        // Salvar persistência
        this.saveCache();

        return selection;
    }

    /**
     * Encontra múltiplos agentes para tarefa complexa
     * 
     * @param {string} task - Descrição da tarefa
     * @param {object} context - Contexto adicional
     * @returns {Promise<array>} Array de agentes com scores
     */
    async findMultipleAgents(task, context = {}) {
        const selection = await this.findBestAgent(task, context);

        // Se já tem orquestração, retornar agentes da orquestração
        if (selection.orchestration?.needed) {
            return selection.orchestration.agents.map(a => ({
                name: a.name,
                score: a.score,
                role: a.role
            }));
        }

        // Caso contrário, retornar top 3 agentes
        // (precisaria modificar agent_selector para retornar top N)
        return [{
            name: selection.primaryAgent,
            score: selection.primaryScore,
            reasoning: selection.reasoning
        }];
    }

    /**
     * Valida se um agente pode chamar outro
     * 
     * @param {string} caller - Nome do agente que está chamando
     * @param {string} target - Nome do agente a ser chamado
     * @returns {boolean} true se pode chamar
     */
    canAgentCallAgent(caller, target) {
        // TODO: Carregar configuração de permissões do banco ou arquivo
        // Por enquanto, retornar true se target está na lista canCallAgents do caller

        // Isso será implementado quando agentes forem criados com BaseAgent
        // Por enquanto, permitir todas chamadas (será restringido depois)
        return true;
    }

    /**
     * Roteia e executa agente (usado por callAgent)
     * 
     * @param {string} agentName - Nome do agente
     * @param {object} subtask - Subtarefa
     * @param {object} context - Contexto (pode incluir callChain)
     * @returns {Promise<object>} Resultado
     */
    async routeAndExecute(agentName, subtask, context = {}) {
        // Validar call chain para evitar loops infinitos
        const callChain = context.callChain || [];
        if (callChain.length > 10) {
            throw new Error('Call chain too deep. Possible infinite loop.');
        }

        if (callChain.includes(agentName)) {
            throw new Error(`Circular call detected: ${callChain.join(' -> ')} -> ${agentName}`);
        }

        // Buscar agente (será implementado quando agentes estiverem registrados)
        // Por enquanto, usar agent_executor existente
        const { executeSpecializedAgent } = await import('../cerebro/agent_executor.js');

        const taskDescription = typeof subtask === 'string' ? subtask : subtask.task || JSON.stringify(subtask);

        const result = await executeSpecializedAgent(agentName, taskDescription, {
            ...context,
            callChain: [...callChain, agentName]
        });

        return result;
    }
}

// Singleton
let routerInstance = null;

export function getRouter() {
    if (!routerInstance) {
        routerInstance = new Router();
    }
    return routerInstance;
}

export default Router;





