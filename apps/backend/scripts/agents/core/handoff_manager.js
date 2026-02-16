#!/usr/bin/env node
/**
 * Handoff Manager - Gerenciador de Handoffs Inteligentes
 * 
 * Detecta quando um agente deve chamar outro e gerencia handoffs via prompts
 */

import { logger } from '../utils/logger.js';
import { getGlobalTracker } from './agent_call_tracker.js';

const log = logger.child({ module: 'handoff_manager' });

/**
 * Padrões de handoff conhecidos
 * Estrutura: agente -> array de padrões
 */
const HANDOFF_PATTERNS = {
    'marketing': [
        {
            triggers: ['copy', 'texto', 'conteúdo', 'landing page', 'email', 'anúncio'],
            target: 'copywriting',
            reason: 'Criação de copy e conteúdo'
        },
        {
            triggers: ['roi', 'orçamento', 'budget', 'custo', 'investimento', 'retorno'],
            target: 'finance',
            reason: 'Análise financeira e ROI'
        },
        {
            triggers: ['vendas', 'pipeline', 'leads', 'conversão', 'funnel'],
            target: 'sales',
            reason: 'Alinhamento de vendas'
        }
    ],
    'sales': [
        {
            triggers: ['preço', 'pricing', 'margem', 'contrato', 'proposta financeira'],
            target: 'finance',
            reason: 'Análise de pricing e margens'
        },
        {
            triggers: ['campanha', 'marketing', 'estratégia de vendas', 'material de vendas'],
            target: 'marketing',
            reason: 'Alinhamento de estratégia'
        }
    ],
    'dev': [
        {
            triggers: ['arquitetura', 'design', 'escalabilidade', 'segurança', 'padrão'],
            target: 'architect',
            reason: 'Decisões arquiteturais'
        },
        {
            triggers: ['teste', 'validação', 'qa', 'qualidade', 'bug'],
            target: 'validation',
            reason: 'Validação e testes'
        }
    ],
    'architect': [
        {
            triggers: ['implementar', 'código', 'desenvolver', 'executar'],
            target: 'dev',
            reason: 'Implementação técnica'
        }
    ],
    'product': [
        {
            triggers: ['design', 'ux', 'ui', 'interface', 'prototipo'],
            target: 'design',
            reason: 'Design e UX'
        },
        {
            triggers: ['lançamento', 'go-to-market', 'campanha', 'comunicação'],
            target: 'marketing',
            reason: 'Estratégia de lançamento'
        }
    ]
};

/**
 * Classe para gerenciar handoffs inteligentes
 */
export class HandoffManager {
    constructor() {
        this.tracker = getGlobalTracker();
        this.patterns = HANDOFF_PATTERNS;
    }

    /**
     * Detecta se um handoff é necessário
     * 
     * @param {string} currentAgent - Agente atual
     * @param {string} task - Tarefa sendo executada
     * @returns {object|null} Informação do handoff ou null
     */
    detectHandoff(currentAgent, task) {
        log.debug('Detecting handoff', { agent: currentAgent, task: task.substring(0, 100) });

        const taskLower = task.toLowerCase();
        const agentPatterns = this.getPatternsForAgent(currentAgent);

        for (const pattern of agentPatterns) {
            const hasTrigger = pattern.triggers.some(trigger =>
                taskLower.includes(trigger.toLowerCase())
            );

            if (hasTrigger) {
                log.info('Handoff detected', {
                    from: currentAgent,
                    to: pattern.target,
                    reason: pattern.reason
                });

                return {
                    from: currentAgent,
                    to: pattern.target,
                    reason: pattern.reason,
                    confidence: this.calculateConfidence(task, pattern.triggers)
                };
            }
        }

        return null;
    }

    /**
     * Obtém padrões para um agente
     * 
     * @param {string} agentName - Nome do agente
     * @returns {array} Padrões de handoff
     */
    getPatternsForAgent(agentName) {
        return this.patterns[agentName] || [];
    }

    /**
     * Calcula confiança do handoff
     * 
     * @param {string} task - Tarefa
     * @param {array} triggers - Triggers do padrão
     * @returns {number} Confiança (0-1)
     */
    calculateConfidence(task, triggers) {
        const taskLower = task.toLowerCase();
        const matches = triggers.filter(trigger =>
            taskLower.includes(trigger.toLowerCase())
        ).length;

        return Math.min(matches / triggers.length, 1.0);
    }

    /**
     * Gera prompt para handoff
     * 
     * @param {object} handoff - Informação do handoff
     * @param {string} task - Tarefa original
     * @param {object} context - Contexto adicional
     * @returns {string} Prompt estruturado
     */
    generateHandoffPrompt(handoff, task, context = {}) {
        return `## HANDOFF INTELIGENTE DETECTADO

**Agente Chamador:** ${handoff.from}
**Agente Destino:** ${handoff.to}
**Razão:** ${handoff.reason}
**Confiança:** ${(handoff.confidence * 100).toFixed(0)}%

**Task Original:**
${task}

**Contexto:**
${JSON.stringify(context, null, 2)}

---

O agente ${handoff.from} detectou que esta task requer especialização do agente ${handoff.to}.
Por favor, incorpore o agente ${handoff.to} para executar esta subtask.

Após a execução, retorne o resultado para ${handoff.from}.`;
    }

    /**
     * Agrega resultados de múltiplos agentes
     * 
     * @param {array} results - Resultados dos agentes
     * @param {string} primaryAgent - Agente principal
     * @returns {object} Resultado agregado
     */
    aggregateResults(results, primaryAgent) {
        log.info('Aggregating results', {
            count: results.length,
            primaryAgent
        });

        const aggregated = {
            primaryAgent,
            agents: results.map(r => r.agent || r.name),
            results: results,
            summary: this.generateSummary(results),
            conflicts: this.detectConflicts(results),
            consensus: this.findConsensus(results)
        };

        return aggregated;
    }

    /**
     * Gera resumo dos resultados
     * 
     * @param {array} results - Resultados
     * @returns {string} Resumo
     */
    generateSummary(results) {
        const summaries = results
            .map(r => r.summary || r.result || 'N/A')
            .filter(s => s !== 'N/A');

        return summaries.join('\n\n---\n\n');
    }

    /**
     * Detecta conflitos entre resultados
     * 
     * @param {array} results - Resultados
     * @returns {array} Conflitos detectados
     */
    detectConflicts(results) {
        const conflicts = [];

        // Verificar se há resultados contraditórios
        for (let i = 0; i < results.length; i++) {
            for (let j = i + 1; j < results.length; j++) {
                const r1 = results[i];
                const r2 = results[j];

                // Verificar se há contradições óbvias
                if (r1.success === false && r2.success === true) {
                    conflicts.push({
                        agent1: r1.agent || r1.name,
                        agent2: r2.agent || r2.name,
                        issue: 'Resultados contraditórios (sucesso vs falha)'
                    });
                }
            }
        }

        return conflicts;
    }

    /**
     * Encontra consenso entre resultados
     * 
     * @param {array} results - Resultados
     * @returns {object|null} Consenso ou null
     */
    findConsensus(results) {
        if (results.length === 0) return null;

        // Se todos têm sucesso, há consenso
        const allSuccess = results.every(r => r.success !== false);
        if (allSuccess) {
            return {
                type: 'success',
                confidence: 1.0,
                message: 'Todos os agentes concordam com sucesso'
            };
        }

        // Se todos falharam, há consenso de falha
        const allFailed = results.every(r => r.success === false);
        if (allFailed) {
            return {
                type: 'failure',
                confidence: 1.0,
                message: 'Todos os agentes indicam falha'
            };
        }

        // Caso contrário, não há consenso claro
        return {
            type: 'mixed',
            confidence: 0.5,
            message: 'Resultados mistos - requer revisão'
        };
    }

    /**
     * Resolve conflitos entre agentes
     * 
     * @param {array} conflicts - Conflitos detectados
     * @param {object} context - Contexto adicional
     * @returns {object} Resolução do conflito
     */
    resolveConflicts(conflicts, context = {}) {
        log.info('Resolving conflicts', { count: conflicts.length });

        if (conflicts.length === 0) {
            return {
                resolved: true,
                resolution: 'Nenhum conflito detectado'
            };
        }

        // Estratégia: priorizar agente com maior confiança ou especialização
        const resolution = {
            resolved: true,
            strategy: 'priority_based',
            conflicts: conflicts,
            resolution: 'Conflitos detectados - priorizar agente mais especializado ou com maior confiança',
            recommendation: 'Revisar resultados manualmente ou usar agente de validação'
        };

        return resolution;
    }
}

// Singleton global
let globalHandoffManager = null;

/**
 * Obtém instância global do HandoffManager
 * 
 * @returns {HandoffManager} Instância global
 */
export function getHandoffManager() {
    if (!globalHandoffManager) {
        globalHandoffManager = new HandoffManager();
    }
    return globalHandoffManager;
}

export default HandoffManager;


