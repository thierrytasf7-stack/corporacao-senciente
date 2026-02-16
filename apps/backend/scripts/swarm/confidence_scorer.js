#!/usr/bin/env node

/**
 * Confidence Scorer - Sistema de Pontuação de Confiança
 * Corporação Senciente - Fase 2
 *
 * Calcula scores de confiança para decisões do Executor Híbrido,
 * analisando histórico, complexidade, contexto e métricas em tempo real
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'confidence_scorer' });

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

/**
 * Confidence Scorer
 */
class ConfidenceScorer {
    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        this.metricsCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.learningRate = 0.1; // Taxa de aprendizado para ajustes dinâmicos

        // Pesos padrão para cálculo de confiança
        this.weights = {
            historical_success: 0.3,
            agent_expertise: 0.25,
            task_complexity: 0.2,
            system_health: 0.15,
            recency_bonus: 0.1
        };

        // Thresholds para decisões
        this.thresholds = {
            direct_execution: 0.8,    // Confiança mínima para execução direta
            prompt_execution: 0.3,    // Confiança mínima para execução via prompt
            hybrid_execution: 0.5,    // Threshold para tentar híbrido
            critical_override: 0.95   // Override para tarefas críticas
        };
    }

    /**
     * Alias para scoreAgentAction compatível com Executor
     */
    async calculateConfidence(action, context = {}) {
        const agentName = context.agentName || 'system';
        const actionType = typeof action === 'string' ? action : action.type;
        return await this.scoreAgentAction(agentName, actionType, context);
    }

    /**
     * Alias para decideExecutionMode compatível com Executor
     */
    determineExecutionMode(confidenceScore, context = {}) {
        return this.decideExecutionMode(confidenceScore, context);
    }

    /**
     * Calcular score de confiança para execução de agente
     *
     * @param {string} agentName - Nome do agente
     * @param {string} action - Ação a ser executada
     * @param {object} context - Contexto adicional
     * @returns {Promise<number>} Score de confiança (0.0 - 1.0)
     */
    async scoreAgentAction(agentName, action, context = {}) {
        const cacheKey = `${agentName}:${action}:${JSON.stringify(context)}`;
        const cached = this.metricsCache.get(cacheKey);

        // Verificar cache
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            log.debug('Using cached confidence score', {
                agent: agentName,
                action,
                score: cached.score,
                age: Math.round((Date.now() - cached.timestamp) / 1000)
            });
            return cached.score;
        }

        log.info('Calculating confidence score', { agent: agentName, action });

        try {
            // Calcular componentes do score
            const components = await this.calculateScoreComponents(agentName, action, context);

            // Calcular score final ponderado
            const finalScore = this.calculateWeightedScore(components);

            // Aplicar ajustes contextuais
            const adjustedScore = this.applyContextualAdjustments(finalScore, context);

            // Normalizar para 0.0 - 1.0
            const normalizedScore = Math.max(0, Math.min(1, adjustedScore));

            // Cachear resultado
            this.metricsCache.set(cacheKey, {
                score: normalizedScore,
                components,
                timestamp: Date.now()
            });

            // Limitar cache
            if (this.metricsCache.size > 1000) {
                const entries = Array.from(this.metricsCache.entries());
                entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                this.metricsCache = new Map(entries.slice(0, 500));
            }

            log.info('Confidence score calculated', {
                agent: agentName,
                action,
                score: normalizedScore.toFixed(3),
                components: Object.keys(components)
            });

            return normalizedScore;

        } catch (error) {
            log.error('Error calculating confidence score', {
                agent: agentName,
                action,
                error: error.message
            });

            // Fallback: score neutro
            return 0.5;
        }
    }

    /**
     * Calcular componentes individuais do score
     */
    async calculateScoreComponents(agentName, action, context) {
        const components = {};

        // 1. Sucesso histórico
        components.historical_success = await this.calculateHistoricalSuccess(agentName, action);

        // 2. Expertise do agente
        components.agent_expertise = await this.calculateAgentExpertise(agentName, action);

        // 3. Complexidade da tarefa
        components.task_complexity = this.calculateTaskComplexity(action, context);

        // 4. Saúde do sistema
        components.system_health = await this.calculateSystemHealth();

        // 5. Bônus de recência
        components.recency_bonus = await this.calculateRecencyBonus(agentName, action);

        return components;
    }

    /**
     * Calcular sucesso histórico
     */
    async calculateHistoricalSuccess(agentName, action) {
        try {
            // Buscar execuções recentes na base de dados
            const { data, error } = await this.supabase
                .from('agent_executions')
                .select('success, created_at')
                .eq('agent_name', agentName)
                .eq('action', action)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias
                .limit(100);

            if (error) throw error;

            if (!data || data.length === 0) {
                return 0.5; // Neutro se não há histórico
            }

            // Calcular taxa de sucesso ponderada por recência
            let weightedSuccess = 0;
            let totalWeight = 0;

            for (const execution of data) {
                const age = Date.now() - new Date(execution.created_at).getTime();
                const daysOld = age / (24 * 60 * 60 * 1000);
                const weight = Math.max(0.1, 1 - (daysOld / 30)); // Decai com o tempo

                weightedSuccess += (execution.success ? 1 : 0) * weight;
                totalWeight += weight;
            }

            const historicalScore = totalWeight > 0 ? weightedSuccess / totalWeight : 0.5;

            log.debug('Historical success calculated', {
                agent: agentName,
                action,
                executions: data.length,
                score: historicalScore.toFixed(3)
            });

            return historicalScore;

        } catch (error) {
            log.warn('Error calculating historical success', { error: error.message });
            return 0.5; // Fallback neutro
        }
    }

    /**
     * Calcular expertise do agente
     */
    async calculateAgentExpertise(agentName, action) {
        try {
            // Mapear ações para especializações
            const actionExpertiseMap = {
                // Technical actions
                'implement_api': 'technical',
                'fix_bug': 'technical',
                'optimize_code': 'technical',
                'run_tests': 'technical',

                // Business actions
                'create_campaign': 'business',
                'analyze_market': 'business',
                'generate_report': 'business',
                'forecast_sales': 'business',

                // Operations actions
                'monitor_system': 'operations',
                'backup_data': 'operations',
                'security_audit': 'operations',
                'performance_analysis': 'operations'
            };

            const requiredExpertise = actionExpertiseMap[action] || 'general';

            // Buscar expertise do agente na configuração
            const agentConfig = await this.getAgentConfig(agentName);
            const agentExpertise = agentConfig?.specialization || 'general';

            // Calcular match de expertise
            let expertiseScore = 0.5; // Base neutra

            if (agentExpertise === requiredExpertise) {
                expertiseScore = 1.0; // Perfeito match
            } else if (agentExpertise === 'general') {
                expertiseScore = 0.7; // Agente geral consegue fazer
            } else if (requiredExpertise === 'general') {
                expertiseScore = 0.8; // Qualquer agente consegue fazer geral
            } else {
                expertiseScore = 0.3; // Match ruim
            }

            // Bonus por experiência específica
            if (agentConfig?.expertise_actions?.includes(action)) {
                expertiseScore = Math.min(1.0, expertiseScore + 0.2);
            }

            return expertiseScore;

        } catch (error) {
            log.warn('Error calculating agent expertise', { error: error.message });
            return 0.5;
        }
    }

    /**
     * Calcular complexidade da tarefa
     */
    calculateTaskComplexity(action, context) {
        // Mapear ações para níveis de complexidade
        const complexityMap = {
            // Baixa complexidade (0.2 - 0.4)
            'get_status': 0.2,
            'list_items': 0.2,
            'basic_query': 0.3,

            // Média complexidade (0.5 - 0.7)
            'create_report': 0.5,
            'send_notification': 0.5,
            'validate_data': 0.6,
            'process_batch': 0.7,

            // Alta complexidade (0.8 - 1.0)
            'design_system': 0.8,
            'optimize_performance': 0.8,
            'implement_feature': 0.9,
            'strategic_planning': 0.9,
            'complex_analysis': 1.0
        };

        let complexity = complexityMap[action] || 0.5;

        // Ajustar baseado no contexto
        if (context.urgency === 'critical') complexity += 0.1;
        if (context.complexity === 'high') complexity += 0.2;
        if (context.dependencies?.length > 3) complexity += 0.1;
        if (context.time_pressure === 'high') complexity += 0.1;

        return Math.max(0, Math.min(1, complexity));
    }

    /**
     * Calcular saúde do sistema
     */
    async calculateSystemHealth() {
        try {
            // Verificar status dos PCs
            const { data: pcs, error } = await this.supabase
                .from('pcs')
                .select('status, ssh_status, last_seen')
                .limit(100);

            if (error) throw error;

            if (!pcs || pcs.length === 0) {
                return 0.5; // Neutro se não há PCs
            }

            // Calcular saúde baseada nos PCs
            const activePCs = pcs.filter(pc => pc.status === 'active').length;
            const onlinePCs = pcs.filter(pc => pc.ssh_status === 'online').length;
            const recentPCs = pcs.filter(pc => {
                const age = Date.now() - new Date(pc.last_seen).getTime();
                return age < 5 * 60 * 1000; // 5 minutos
            }).length;

            const healthScore = (
                (activePCs / pcs.length) * 0.4 +
                (onlinePCs / pcs.length) * 0.4 +
                (recentPCs / pcs.length) * 0.2
            );

            return Math.max(0, Math.min(1, healthScore));

        } catch (error) {
            log.warn('Error calculating system health', { error: error.message });
            return 0.5;
        }
    }

    /**
     * Calcular bônus de recência
     */
    async calculateRecencyBonus(agentName, action) {
        try {
            // Buscar última execução bem-sucedida
            const { data, error } = await this.supabase
                .from('agent_executions')
                .select('created_at')
                .eq('agent_name', agentName)
                .eq('action', action)
                .eq('success', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                return 0; // Sem bônus se nunca executou
            }

            const lastExecution = new Date(data[0].created_at);
            const hoursSince = (Date.now() - lastExecution.getTime()) / (60 * 60 * 1000);

            // Bônus decrescente: 0.2 para execuções recentes, 0 para antigas
            const recencyBonus = Math.max(0, 0.2 * Math.exp(-hoursSince / 24));

            return recencyBonus;

        } catch (error) {
            log.warn('Error calculating recency bonus', { error: error.message });
            return 0;
        }
    }

    /**
     * Calcular score ponderado
     */
    calculateWeightedScore(components) {
        return (
            components.historical_success * this.weights.historical_success +
            components.agent_expertise * this.weights.agent_expertise +
            components.task_complexity * this.weights.task_complexity +
            components.system_health * this.weights.system_health +
            components.recency_bonus * this.weights.recency_bonus
        );
    }

    /**
     * Aplicar ajustes contextuais
     */
    applyContextualAdjustments(baseScore, context) {
        let adjustedScore = baseScore;

        // Ajustes baseados no contexto
        if (context.urgency === 'critical') {
            adjustedScore += 0.1; // Bonus para urgência
        }

        if (context.user_preference === 'reliable') {
            adjustedScore += 0.05; // Preferência por confiabilidade
        }

        if (context.risk_tolerance === 'low') {
            adjustedScore -= 0.1; // Reduzir confiança se risco baixo tolerado
        }

        // Ajustes baseados no ambiente
        if (context.environment === 'production') {
            adjustedScore += 0.05; // Mais conservador em produção
        }

        return Math.max(0, Math.min(1, adjustedScore));
    }

    /**
     * Decidir modo de execução baseado no score
     */
    decideExecutionMode(confidenceScore, context = {}) {
        const { urgency, complexity } = context;

        // Overrides para casos especiais
        if (urgency === 'critical' && confidenceScore >= this.thresholds.critical_override) {
            return 'direct'; // Sempre direto se muito confiante em crítico
        }

        if (complexity === 'very_high') {
            return 'prompt'; // Sempre prompt para tarefas muito complexas
        }

        // Decisão baseada nos thresholds
        if (confidenceScore >= this.thresholds.direct_execution) {
            return 'direct';
        } else if (confidenceScore >= this.thresholds.prompt_execution) {
            return 'prompt';
        } else if (confidenceScore >= this.thresholds.hybrid_execution) {
            return 'hybrid';
        } else {
            return 'prompt'; // Fallback para prompt se confiança muito baixa
        }
    }

    /**
     * Registrar resultado de execução para aprendizado
     */
    async recordExecutionResult(agentName, action, context, success, executionTime, mode) {
        try {
            const executionData = {
                agent_name: agentName,
                action: action,
                context: JSON.stringify(context),
                success: success,
                execution_time_ms: executionTime,
                execution_mode: mode,
                confidence_score: await this.scoreAgentAction(agentName, action, context),
                created_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('agent_executions')
                .insert(executionData);

            if (error) {
                log.warn('Error recording execution result', { error: error.message });
            } else {
                log.debug('Execution result recorded', {
                    agent: agentName,
                    action,
                    success,
                    mode
                });
            }

            // Limpar cache para forçar recálculo na próxima vez
            const cacheKeyPattern = `${agentName}:${action}:`;
            for (const [key] of this.metricsCache) {
                if (key.startsWith(cacheKeyPattern)) {
                    this.metricsCache.delete(key);
                }
            }

        } catch (error) {
            log.error('Error recording execution result', { error: error.message });
        }
    }

    /**
     * Obter configuração do agente
     */
    async getAgentConfig(agentName) {
        try {
            // Buscar configuração do agente
            const { data, error } = await this.supabase
                .from('agent_configs')
                .select('*')
                .eq('agent_name', agentName)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                throw error;
            }

            return data;
        } catch (error) {
            log.warn('Error getting agent config', { agent: agentName, error: error.message });
            return null;
        }
    }

    /**
     * Obter estatísticas de confiança
     */
    async getConfidenceStats() {
        try {
            const { data, error } = await this.supabase
                .from('agent_executions')
                .select('agent_name, action, success, confidence_score, execution_mode')
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Última semana
                .limit(1000);

            if (error) throw error;

            const stats = {
                total_executions: data.length,
                success_rate: data.filter(d => d.success).length / data.length,
                avg_confidence: data.reduce((sum, d) => sum + d.confidence_score, 0) / data.length,
                mode_distribution: {},
                agent_performance: {}
            };

            // Distribuição por modo
            data.forEach(d => {
                stats.mode_distribution[d.execution_mode] = (stats.mode_distribution[d.execution_mode] || 0) + 1;
            });

            // Performance por agente
            const agentStats = {};
            data.forEach(d => {
                if (!agentStats[d.agent_name]) {
                    agentStats[d.agent_name] = { executions: 0, successes: 0, avg_confidence: 0 };
                }
                agentStats[d.agent_name].executions++;
                if (d.success) agentStats[d.agent_name].successes++;
                agentStats[d.agent_name].avg_confidence += d.confidence_score;
            });

            Object.keys(agentStats).forEach(agent => {
                const stat = agentStats[agent];
                stat.success_rate = stat.successes / stat.executions;
                stat.avg_confidence = stat.avg_confidence / stat.executions;
            });

            stats.agent_performance = agentStats;

            return stats;

        } catch (error) {
            log.error('Error getting confidence stats', { error: error.message });
            return null;
        }
    }

    /**
     * Atualizar pesos dinamicamente baseado em performance
     */
    updateWeights(performanceData) {
        // Implementação de aprendizado para ajustar pesos
        // Baseado na correlação entre componentes e sucesso

        log.info('Updating confidence weights based on performance', {
            executions: performanceData.total_executions
        });

        // Ajustes simples baseados em performance geral
        const successRate = performanceData.success_rate;

        if (successRate > 0.8) {
            // Alto sucesso - aumentar confiança em histórico
            this.weights.historical_success = Math.min(0.4, this.weights.historical_success + this.learningRate * 0.1);
        } else if (successRate < 0.6) {
            // Baixo sucesso - reduzir confiança em histórico, aumentar expertise
            this.weights.historical_success = Math.max(0.2, this.weights.historical_success - this.learningRate * 0.1);
            this.weights.agent_expertise = Math.min(0.35, this.weights.agent_expertise + this.learningRate * 0.1);
        }

        log.debug('Weights updated', { weights: this.weights });
    }

    /**
     * Resetar cache de métricas
     */
    clearCache() {
        this.metricsCache.clear();
        log.info('Confidence scorer cache cleared');
    }
}

export default ConfidenceScorer;