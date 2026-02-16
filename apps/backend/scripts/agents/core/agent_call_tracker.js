#!/usr/bin/env node
/**
 * Agent Call Tracker - Rastreamento de Chamadas Agent-to-Agent
 * 
 * Rastreia chamadas entre agentes para evitar loops infinitos e analisar padrões
 */

import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'agent_call_tracker' });

/**
 * Classe para rastrear chamadas agent-to-agent
 */
export class AgentCallTracker {
    constructor() {
        this.callHistory = []; // Histórico de chamadas
        this.maxHistorySize = 1000;
        this.maxDepth = 10; // Profundidade máxima de chamadas
    }

    /**
     * Registra uma chamada
     * 
     * @param {string} caller - Agente que está chamando
     * @param {string} target - Agente sendo chamado
     * @param {string} subtask - Subtarefa
     * @param {number} depth - Profundidade atual
     * @returns {object} Informação da chamada registrada
     */
    recordCall(caller, target, subtask, depth = 0) {
        const call = {
            caller,
            target,
            subtask: typeof subtask === 'string' ? subtask.substring(0, 100) : 'object',
            depth,
            timestamp: new Date().toISOString()
        };

        this.callHistory.push(call);

        // Limitar tamanho do histórico
        if (this.callHistory.length > this.maxHistorySize) {
            this.callHistory.shift();
        }

        log.debug('Call recorded', call);
        return call;
    }

    /**
     * Verifica se há loop infinito
     * 
     * @param {string} caller - Agente que está chamando
     * @param {string} target - Agente sendo chamado
     * @param {number} depth - Profundidade atual
     * @returns {boolean} true se há loop detectado
     */
    detectLoop(caller, target, depth) {
        // Verificar profundidade máxima
        if (depth >= this.maxDepth) {
            log.warn('Max depth reached', { caller, target, depth });
            return true;
        }

        // Verificar se há chamada circular recente na mesma cadeia de chamadas
        // (últimas 10 chamadas para detectar padrões A->B->A)
        const recentCalls = this.callHistory.slice(-10);

        // Verificar padrão circular direto (A->B->A)
        const directCircular = recentCalls.some(call =>
            call.caller === target && call.target === caller && call.depth === depth - 1
        );

        if (directCircular) {
            log.warn('Direct circular call pattern detected', { caller, target, depth });
            return true;
        }

        // Verificar se há múltiplas chamadas do mesmo par na mesma profundidade
        const sameDepthCalls = recentCalls.filter(call =>
            call.caller === caller && call.target === target && call.depth === depth
        );

        if (sameDepthCalls.length >= 3) {
            log.warn('Repeated call pattern detected', { caller, target, depth, count: sameDepthCalls.length });
            return true;
        }

        return false;
    }

    /**
     * Obtém histórico de chamadas de um agente
     * 
     * @param {string} agentName - Nome do agente
     * @param {number} limit - Limite de resultados
     * @returns {array} Histórico de chamadas
     */
    getAgentHistory(agentName, limit = 10) {
        return this.callHistory
            .filter(call => call.caller === agentName || call.target === agentName)
            .slice(-limit);
    }

    /**
     * Obtém estatísticas de chamadas
     * 
     * @returns {object} Estatísticas
     */
    getStats() {
        const stats = {
            totalCalls: this.callHistory.length,
            uniqueAgents: new Set([
                ...this.callHistory.map(c => c.caller),
                ...this.callHistory.map(c => c.target)
            ]).size,
            callsByAgent: {},
            mostCalled: null
        };

        // Contar chamadas por agente
        this.callHistory.forEach(call => {
            stats.callsByAgent[call.target] = (stats.callsByAgent[call.target] || 0) + 1;
        });

        // Encontrar agente mais chamado
        const maxCalls = Math.max(...Object.values(stats.callsByAgent));
        stats.mostCalled = Object.entries(stats.callsByAgent)
            .find(([_, count]) => count === maxCalls)?.[0] || null;

        return stats;
    }

    /**
     * Limpa histórico
     */
    clear() {
        this.callHistory = [];
        log.info('Call history cleared');
    }
}

// Singleton global
let globalTracker = null;

/**
 * Obtém instância global do tracker
 * 
 * @returns {AgentCallTracker} Instância global
 */
export function getGlobalTracker() {
    if (!globalTracker) {
        globalTracker = new AgentCallTracker();
    }
    return globalTracker;
}

export default AgentCallTracker;


