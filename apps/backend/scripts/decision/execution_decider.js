#!/usr/bin/env node

/**
 * Execution Decider - Sistema de Decisão de Execução
 * Fase 4 - Sistema Híbrido de Autonomia
 *
 * Decide automaticamente entre execução assistida (manual) e autônoma
 * baseada em confiança, complexidade, contexto e histórico.
 */

import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'execution_decider' });

/**
 * Tipos de Decisão de Execução
 */
const EXECUTION_DECISIONS = {
    ASSISTED: 'assisted',           // Requer intervenção humana
    AUTONOMOUS: 'autonomous',       // Execução automática
    HYBRID: 'hybrid',              // Delegação inteligente
    REJECTED: 'rejected'           // Tarefa rejeitada
};

/**
 * Critérios de Decisão
 */
const DECISION_CRITERIA = {
    CONFIDENCE_THRESHOLD_HIGH: 0.85,    // Alta confiança → autônomo
    CONFIDENCE_THRESHOLD_MEDIUM: 0.65,  // Média confiança → híbrido
    CONFIDENCE_THRESHOLD_LOW: 0.45,     // Baixa confiança → assistido

    COMPLEXITY_THRESHOLD_HIGH: 8,       // Alta complexidade → assistido
    COMPLEXITY_THRESHOLD_MEDIUM: 5,     // Média complexidade → híbrido

    RISK_THRESHOLD_HIGH: 7,             // Alto risco → assistido
    RISK_THRESHOLD_MEDIUM: 4,           // Médio risco → híbrido

    SENSITIVITY_THRESHOLD: 6            // Alta sensibilidade → assistido
};

/**
 * Execution Decider
 */
class ExecutionDecider {
    constructor() {
        this.decisionHistory = [];
        this.learningData = [];
        this.performanceMetrics = {
            accuracy: 0,
            humanOverrideRate: 0,
            avgDecisionTime: 0
        };

        // Pesos dinâmicos para critérios
        this.weights = {
            confidence: 0.35,
            complexity: 0.25,
            risk: 0.20,
            sensitivity: 0.10,
            context: 0.10
        };

        // Configurações adaptativas
        this.adaptiveThresholds = { ...DECISION_CRITERIA };
        this.learningRate = 0.05;
    }

    /**
     * Decide modo de execução para uma tarefa
     *
     * @param {object} task - Tarefa a ser executada
     * @param {object} context - Contexto da execução
     * @param {object} systemState - Estado atual do sistema
     * @returns {Promise<object>} Decisão com explicação
     */
    async decideExecution(task, context = {}, systemState = {}) {
        const startTime = Date.now();

        log.info('🧠 Decidindo modo de execução para tarefa:', task.description || task.type);

        try {
            // Coletar métricas de decisão
            const metrics = await this.collectDecisionMetrics(task, context, systemState);

            // Calcular score composto
            const score = this.calculateDecisionScore(metrics);

            // Aplicar lógica de decisão
            const decision = this.applyDecisionLogic(score, metrics);

            // Registrar decisão para aprendizado
            const decisionRecord = {
                task: task.description || task.type,
                metrics,
                score,
                decision,
                context,
                systemState,
                timestamp: new Date().toISOString(),
                decisionTime: Date.now() - startTime
            };

            this.decisionHistory.push(decisionRecord);

            // Limitar histórico
            if (this.decisionHistory.length > 1000) {
                this.decisionHistory = this.decisionHistory.slice(-500);
            }

            log.info(`✅ Decisão tomada: ${decision.mode.toUpperCase()} (score: ${score.toFixed(2)})`);

            return {
                mode: decision.mode,
                confidence: decision.confidence,
                reasoning: decision.reasoning,
                alternatives: decision.alternatives,
                metadata: {
                    score,
                    metrics,
                    decisionTime: decisionRecord.decisionTime
                }
            };

        } catch (error) {
            log.error('Erro na decisão de execução:', error);

            // Fallback para modo assistido em caso de erro
            return {
                mode: EXECUTION_DECISIONS.ASSISTED,
                confidence: 0,
                reasoning: ['Erro no sistema de decisão', 'Fallback para modo assistido'],
                alternatives: [],
                metadata: {
                    error: error.message,
                    fallback: true
                }
            };
        }
    }

    /**
     * Coleta métricas para decisão
     */
    async collectDecisionMetrics(task, context, systemState) {
        const metrics = {
            confidence: 0,
            complexity: 0,
            risk: 0,
            sensitivity: 0,
            context: 0,
            historical: 0
        };

        // 1. Confiança baseada em histórico e padrões
        metrics.confidence = await this.calculateConfidence(task, context);

        // 2. Complexidade da tarefa
        metrics.complexity = this.assessComplexity(task);

        // 3. Nível de risco
        metrics.risk = this.assessRisk(task, context);

        // 4. Sensibilidade (impacto em dados/critérios)
        metrics.sensitivity = this.assessSensitivity(task);

        // 5. Contexto do sistema
        metrics.context = this.assessContext(systemState);

        // 6. Histórico similar
        metrics.historical = this.assessHistoricalPerformance(task);

        return metrics;
    }

    /**
     * Calcula confiança na execução
     */
    async calculateConfidence(task, context) {
        let confidence = 0.5; // Base neutra

        // Confiança baseada no tipo de tarefa
        const taskTypeConfidence = {
            'monitoring': 0.9,      // Alto - tarefas seguras
            'analysis': 0.8,        // Alto - análise não modificadora
            'optimization': 0.7,    // Médio - melhorias
            'maintenance': 0.8,     // Alto - manutenção rotineira
            'creation': 0.6,        // Médio - criação de novos recursos
            'modification': 0.5,    // Médio - modificações
            'deletion': 0.3,        // Baixo - operações destrutivas
            'deployment': 0.4,      // Baixo - deploy em produção
            'security': 0.3         // Baixo - questões de segurança
        };

        const taskType = task.type || this.inferTaskType(task);
        confidence += (taskTypeConfidence[taskType] || 0.5) * 0.6;

        // Confiança baseada no contexto
        if (context.userId === 'system' || context.daemon) {
            confidence += 0.2; // Confiança em execuções automáticas
        }

        if (context.environment === 'development') {
            confidence += 0.1; // Mais confiança em dev
        }

        // Confiança baseada em histórico
        const historicalConfidence = this.getHistoricalConfidence(taskType);
        confidence = confidence * 0.4 + historicalConfidence * 0.6;

        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Infere tipo da tarefa baseada na descrição
     */
    inferTaskType(task) {
        const description = (task.description || task.task || '').toLowerCase();

        if (description.includes('monitor') || description.includes('check')) {
            return 'monitoring';
        } else if (description.includes('analy') || description.includes('review')) {
            return 'analysis';
        } else if (description.includes('optim') || description.includes('improve')) {
            return 'optimization';
        } else if (description.includes('maintain') || description.includes('update')) {
            return 'maintenance';
        } else if (description.includes('create') || description.includes('build')) {
            return 'creation';
        } else if (description.includes('modif') || description.includes('change')) {
            return 'modification';
        } else if (description.includes('delet') || description.includes('remov')) {
            return 'deletion';
        } else if (description.includes('deploy') || description.includes('release')) {
            return 'deployment';
        } else if (description.includes('secur') || description.includes('auth')) {
            return 'security';
        }

        return 'unknown';
    }

    /**
     * Avalia complexidade da tarefa
     */
    assessComplexity(task) {
        const description = task.description || task.task || '';
        let complexity = 3; // Base média

        // Palavras-chave que indicam alta complexidade
        const highComplexityKeywords = [
            'architect', 'design', 'system', 'infrastructure', 'security',
            'performance', 'optimization', 'integration', 'migration',
            'refactor', 'debug', 'troubleshoot'
        ];

        // Palavras-chave que indicam baixa complexidade
        const lowComplexityKeywords = [
            'status', 'check', 'monitor', 'list', 'simple', 'basic',
            'create', 'update', 'delete'
        ];

        const highCount = highComplexityKeywords.filter(keyword =>
            description.toLowerCase().includes(keyword)).length;

        const lowCount = lowComplexityKeywords.filter(keyword =>
            description.toLowerCase().includes(keyword)).length;

        complexity += highCount * 1.5;
        complexity -= lowCount * 0.5;

        // Comprimento da descrição
        if (description.length > 200) complexity += 1;
        if (description.length > 500) complexity += 1;

        return Math.max(1, Math.min(10, complexity));
    }

    /**
     * Avalia nível de risco
     */
    assessRisk(task, context) {
        let risk = 3; // Base média

        const description = (task.description || task.task || '').toLowerCase();

        // Alto risco
        const highRiskKeywords = [
            'delete', 'remove', 'drop', 'destroy', 'production',
            'live', 'critical', 'emergency', 'security', 'auth',
            'password', 'credential', 'sensitive', 'confidential'
        ];

        // Baixo risco
        const lowRiskKeywords = [
            'read', 'view', 'list', 'check', 'status', 'info',
            'log', 'monitor', 'test', 'development', 'local'
        ];

        const highRiskCount = highRiskKeywords.filter(keyword =>
            description.includes(keyword)).length;

        const lowRiskCount = lowRiskKeywords.filter(keyword =>
            description.includes(keyword)).length;

        risk += highRiskCount * 2;
        risk -= lowRiskCount * 0.5;

        // Ambiente afeta risco
        if (context.environment === 'production') {
            risk += 2;
        } else if (context.environment === 'development') {
            risk -= 1;
        }

        return Math.max(1, Math.min(10, risk));
    }

    /**
     * Avalia sensibilidade (impacto em dados importantes)
     */
    assessSensitivity(task) {
        let sensitivity = 3; // Base média

        const description = (task.description || task.task || '').toLowerCase();

        // Alta sensibilidade
        const highSensitivityKeywords = [
            'user', 'customer', 'personal', 'private', 'data',
            'database', 'backup', 'restore', 'migration',
            'financial', 'medical', 'compliance', 'legal'
        ];

        // Baixa sensibilidade
        const lowSensitivityKeywords = [
            'log', 'cache', 'temp', 'test', 'development',
            'local', 'preview', 'draft'
        ];

        const highSensCount = highSensitivityKeywords.filter(keyword =>
            description.includes(keyword)).length;

        const lowSensCount = lowSensitivityKeywords.filter(keyword =>
            description.includes(keyword)).length;

        sensitivity += highSensCount * 1.5;
        sensitivity -= lowSensCount * 0.5;

        return Math.max(1, Math.min(10, sensitivity));
    }

    /**
     * Avalia contexto do sistema
     */
    assessContext(systemState) {
        let contextScore = 5; // Base neutra

        // Estado dos PCs
        if (systemState.pcCount !== undefined) {
            if (systemState.pcCount === 0) contextScore -= 2; // Sem PCs
            else if (systemState.pcCount === 1) contextScore -= 1; // Apenas 1 PC
            else if (systemState.pcCount > 3) contextScore += 1; // Múltiplos PCs
        }

        // Estado do sistema
        if (systemState.systemLoad !== undefined) {
            if (systemState.systemLoad > 80) contextScore -= 2; // Sistema sobrecarregado
            else if (systemState.systemLoad < 30) contextScore += 1; // Sistema livre
        }

        // Hora do dia (pode afetar disponibilidade humana)
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) {
            contextScore += 1; // Horário comercial - humanos disponíveis
        } else {
            contextScore -= 0.5; // Fora horário comercial
        }

        return Math.max(1, Math.min(10, contextScore));
    }

    /**
     * Avalia performance histórica
     */
    assessHistoricalPerformance(task) {
        const taskType = this.inferTaskType(task);
        const recentDecisions = this.decisionHistory.slice(-50);

        const similarTasks = recentDecisions.filter(d =>
            this.inferTaskType({ description: d.task }) === taskType
        );

        if (similarTasks.length === 0) {
            return 5; // Neutro sem histórico
        }

        // Calcular taxa de sucesso para tarefas similares
        const successCount = similarTasks.filter(d =>
            d.decision.mode === EXECUTION_DECISIONS.AUTONOMOUS ||
            d.decision.mode === EXECUTION_DECISIONS.HYBRID
        ).length;

        const successRate = successCount / similarTasks.length;

        // Converter para escala 1-10
        return successRate * 9 + 1;
    }

    /**
     * Obtém confiança histórica para um tipo de tarefa
     */
    getHistoricalConfidence(taskType) {
        const recentDecisions = this.decisionHistory.slice(-100);
        const typeDecisions = recentDecisions.filter(d =>
            this.inferTaskType({ description: d.task }) === taskType
        );

        if (typeDecisions.length === 0) {
            return 0.5; // Neutro
        }

        // Média das confianças das decisões
        const totalConfidence = typeDecisions.reduce((sum, d) => sum + d.score, 0);
        return totalConfidence / typeDecisions.length;
    }

    /**
     * Calcula score composto baseado nos pesos
     */
    calculateDecisionScore(metrics) {
        let score = 0;

        // Normalizar métricas para 0-1
        const normalized = {
            confidence: metrics.confidence,
            complexity: (10 - metrics.complexity) / 9, // Inverter (baixa complexidade = alto score)
            risk: (10 - metrics.risk) / 9,             // Inverter (baixo risco = alto score)
            sensitivity: (10 - metrics.sensitivity) / 9, // Inverter
            context: metrics.context / 10,
            historical: metrics.historical / 10
        };

        // Calcular score ponderado
        score += normalized.confidence * this.weights.confidence;
        score += normalized.complexity * this.weights.complexity;
        score += normalized.risk * this.weights.risk;
        score += normalized.sensitivity * this.weights.sensitivity;
        score += normalized.context * this.weights.context;
        score += normalized.historical * (1 - Object.values(this.weights).reduce((a, b) => a + b));

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Aplica lógica de decisão baseada no score
     */
    applyDecisionLogic(score, metrics) {
        const decision = {
            mode: EXECUTION_DECISIONS.ASSISTED,
            confidence: score,
            reasoning: [],
            alternatives: []
        };

        // Lógica principal baseada nos thresholds adaptativos
        if (score >= this.adaptiveThresholds.CONFIDENCE_THRESHOLD_HIGH &&
            metrics.risk <= DECISION_CRITERIA.RISK_THRESHOLD_MEDIUM &&
            metrics.sensitivity <= DECISION_CRITERIA.SENSITIVITY_THRESHOLD) {

            decision.mode = EXECUTION_DECISIONS.AUTONOMOUS;
            decision.reasoning.push('Alta confiança, baixo risco e sensibilidade');

        } else if (score >= this.adaptiveThresholds.CONFIDENCE_THRESHOLD_MEDIUM &&
            metrics.complexity <= DECISION_CRITERIA.COMPLEXITY_THRESHOLD_HIGH) {

            decision.mode = EXECUTION_DECISIONS.HYBRID;
            decision.reasoning.push('Confiança média, complexidade gerenciável');

        } else {
            decision.reasoning.push('Confiança baixa ou fatores de risco elevados');
        }

        // Rejeitar tarefas muito arriscadas
        if (metrics.risk >= DECISION_CRITERIA.RISK_THRESHOLD_HIGH &&
            score < this.adaptiveThresholds.CONFIDENCE_THRESHOLD_HIGH) {

            decision.mode = EXECUTION_DECISIONS.REJECTED;
            decision.reasoning.push('Risco muito alto para execução automática');
        }

        // Adicionar alternativas
        if (decision.mode === EXECUTION_DECISIONS.ASSISTED) {
            decision.alternatives.push(EXECUTION_DECISIONS.HYBRID);
        }
        if (decision.mode === EXECUTION_DECISIONS.HYBRID) {
            decision.alternatives.push(EXECUTION_DECISIONS.ASSISTED, EXECUTION_DECISIONS.AUTONOMOUS);
        }
        if (decision.mode === EXECUTION_DECISIONS.AUTONOMOUS) {
            decision.alternatives.push(EXECUTION_DECISIONS.HYBRID);
        }

        return decision;
    }

    /**
     * Aprende com feedback humano
     */
    async learnFromFeedback(task, humanDecision, actualOutcome) {
        const learningEntry = {
            task: task.description || task.type,
            humanDecision,
            systemDecision: await this.decideExecution(task),
            outcome: actualOutcome,
            timestamp: new Date().toISOString()
        };

        this.learningData.push(learningEntry);

        // Limitar dados de aprendizado
        if (this.learningData.length > 500) {
            this.learningData = this.learningData.slice(-250);
        }

        // Atualizar thresholds baseado no aprendizado
        await this.updateAdaptiveThresholds();
    }

    /**
     * Atualiza thresholds adaptativos baseado no aprendizado
     */
    async updateAdaptiveThresholds() {
        const recentFeedback = this.learningData.slice(-100);

        if (recentFeedback.length < 10) {
            return; // Poucos dados para aprendizado
        }

        // Analisar quando decisões automáticas foram bem-sucedidas
        const successfulAutoDecisions = recentFeedback.filter(f =>
            f.humanDecision === EXECUTION_DECISIONS.ASSISTED &&
            f.systemDecision.mode === EXECUTION_DECISIONS.AUTONOMOUS &&
            f.outcome === 'success'
        );

        // Analisar quando decisões assistidas foram necessárias
        const necessaryAssistedDecisions = recentFeedback.filter(f =>
            f.humanDecision === EXECUTION_DECISIONS.ASSISTED &&
            f.systemDecision.mode === EXECUTION_DECISIONS.AUTONOMOUS &&
            f.outcome === 'failure'
        );

        // Ajustar thresholds baseado no feedback
        if (successfulAutoDecisions.length > necessaryAssistedDecisions.length) {
            // Mais sucessos que falhas - pode ser mais permissivo
            this.adaptiveThresholds.CONFIDENCE_THRESHOLD_HIGH -= this.learningRate;
            log.info('📈 Ajustando thresholds: mais permissivo');
        } else if (necessaryAssistedDecisions.length > successfulAutoDecisions.length) {
            // Mais falhas que sucessos - ser mais conservador
            this.adaptiveThresholds.CONFIDENCE_THRESHOLD_HIGH += this.learningRate;
            log.info('📉 Ajustando thresholds: mais conservador');
        }
    }

    /**
     * Obtém estatísticas do decisor
     */
    getStats() {
        const recent = this.decisionHistory.slice(-100);
        const byMode = recent.reduce((acc, d) => {
            acc[d.decision.mode] = (acc[d.decision.mode] || 0) + 1;
            return acc;
        }, {});

        return {
            totalDecisions: this.decisionHistory.length,
            recentDecisions: recent.length,
            decisionsByMode: byMode,
            adaptiveThresholds: this.adaptiveThresholds,
            weights: this.weights,
            learningDataSize: this.learningData.length
        };
    }

    /**
     * Reseta aprendizado
     */
    resetLearning() {
        this.learningData = [];
        this.adaptiveThresholds = { ...DECISION_CRITERIA };
        log.info('🔄 Aprendizado resetado para valores padrão');
    }
}

// Exportar classe e tipos
export default ExecutionDecider;
export { DECISION_CRITERIA, EXECUTION_DECISIONS };

// Instância global
let globalDecider = null;

export function getExecutionDecider() {
    if (!globalDecider) {
        globalDecider = new ExecutionDecider();
    }
    return globalDecider;
}




