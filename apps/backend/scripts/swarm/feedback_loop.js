#!/usr/bin/env node
/**
 * Feedback Loop Automático
 *
 * Sistema de aprendizado contínuo baseado em feedback de execuções
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';
import { getPromptCache } from './prompt_cache.js';

const log = logger.child({ module: 'feedback_loop' });

/**
 * Classe para Feedback Loop Automático
 */
export class FeedbackLoop {
    constructor(options = {}) {
        this.embeddings = getEmbeddingsService();
        this.llbProtocol = getLLBProtocol();
        this.promptCache = getPromptCache();
        this.feedbackHistory = new Map(); // Histórico de feedback
        this.learningThreshold = options.learningThreshold || 0.7; // Threshold para aprendizado
        this.feedbackRetentionDays = options.feedbackRetentionDays || 30;
        this.minFeedbackSamples = options.minFeedbackSamples || 5; // Mínimo de amostras para análise

        log.info('FeedbackLoop initialized', {
            threshold: this.learningThreshold,
            retention: this.feedbackRetentionDays
        });
    }

    /**
     * Coleta feedback após execução
     *
     * @param {object} executionData - Dados da execução
     * @param {object} feedbackData - Dados de feedback
     * @returns {Promise<boolean>} Sucesso
     */
    async collectFeedback(executionData, feedbackData) {
        log.info('Collecting feedback', {
            agent: executionData.agent,
            task: executionData.task?.substring(0, 50),
            success: feedbackData.success
        });

        try {
            const feedbackEntry = {
                execution: executionData,
                feedback: feedbackData,
                timestamp: new Date().toISOString(),
                contextEmbedding: await this.embeddings.generateEmbedding(
                    `${executionData.task} ${JSON.stringify(executionData.context || {})}`
                ),
                feedbackEmbedding: await this.embeddings.generateEmbedding(
                    `${feedbackData.result || ''} ${feedbackData.error || ''} ${JSON.stringify(feedbackData.metrics || {})}`
                )
            };

            // Armazenar feedback no histórico
            const key = this.generateFeedbackKey(executionData);
            this.feedbackHistory.set(key, feedbackEntry);

            // Armazenar no LangMem como aprendizado
            await this.storeLearningInLangMem(feedbackEntry);

            // Analisar padrões e sugerir melhorias
            await this.analyzeAndLearn(feedbackEntry);

            // Limpar feedback antigo
            this.cleanupOldFeedback();

            log.info('Feedback collected and processed', { key });
            return true;
        } catch (error) {
            log.error('Error collecting feedback', { error: error.message });
            return false;
        }
    }

    /**
     * Armazena aprendizado no LangMem
     *
     * @param {object} feedbackEntry - Entrada de feedback
     */
    async storeLearningInLangMem(feedbackEntry) {
        const { execution, feedback } = feedbackEntry;

        // Só armazena aprendizados significativos
        if (feedback.success && feedback.metrics?.quality > this.learningThreshold) {
            const learningContent = `
Aprendizado de execução bem-sucedida:
- Agente: ${execution.agent}
- Task: ${execution.task?.substring(0, 100)}
- Tempo: ${feedback.metrics?.duration || 'N/A'}ms
- Qualidade: ${(feedback.metrics?.quality * 100 || 0).toFixed(1)}%
- Lições: ${feedback.insights || 'Execução eficiente'}
            `.trim();

            await this.llbProtocol.storePattern(learningContent, {
                category: 'execution_patterns',
                source: 'feedback_loop',
                confidence: feedback.metrics?.quality || 0.8
            });
        }

        // Armazena erros como lições aprendidas
        if (!feedback.success && feedback.error) {
            const errorLearning = `
Lição de erro:
- Agente: ${execution.agent}
- Erro: ${feedback.error.substring(0, 200)}
- Causa provável: ${feedback.rootCause || 'A investigar'}
- Solução sugerida: ${feedback.suggestedFix || 'Melhorar validação'}
            `.trim();

            await this.llbProtocol.storePattern(errorLearning, {
                category: 'error_patterns',
                source: 'feedback_loop',
                error_type: feedback.errorType || 'unknown'
            });
        }
    }

    /**
     * Analisa padrões e sugere melhorias
     *
     * @param {object} newFeedback - Novo feedback para análise
     */
    async analyzeAndLearn(newFeedback) {
        const { execution } = newFeedback;

        // Buscar feedback similar
        const similarFeedback = await this.findSimilarFeedback(newFeedback);

        if (similarFeedback.length >= this.minFeedbackSamples) {
            // Analisar padrões
            const patterns = this.analyzePatterns(similarFeedback.concat([newFeedback]));

            // Sugerir melhorias se padrões identificados
            if (patterns.length > 0) {
                await this.suggestImprovements(execution.agent, patterns);
            }

            // Atualizar cache de prompts se necessário
            await this.updatePromptCache(similarFeedback, newFeedback);
        }
    }

    /**
     * Encontra feedback similar baseado em embeddings
     *
     * @param {object} feedbackEntry - Entrada de feedback
     * @returns {Promise<array>} Feedback similar
     */
    async findSimilarFeedback(feedbackEntry) {
        const similar = [];

        for (const [key, entry] of this.feedbackHistory.entries()) {
            if (key === this.generateFeedbackKey(feedbackEntry.execution)) continue;

            const similarity = this.embeddings.cosineSimilarity(
                feedbackEntry.contextEmbedding,
                entry.contextEmbedding
            );

            if (similarity > 0.7) { // Threshold de similaridade
                similar.push({
                    ...entry,
                    similarity
                });
            }
        }

        // Ordenar por similaridade
        similar.sort((a, b) => b.similarity - a.similarity);
        return similar.slice(0, 10); // Top 10 similares
    }

    /**
     * Analisa padrões em feedback similar
     *
     * @param {array} feedbackEntries - Entradas de feedback
     * @returns {array} Padrões identificados
     */
    analyzePatterns(feedbackEntries) {
        const patterns = [];
        const successRate = feedbackEntries.filter(f => f.feedback.success).length / feedbackEntries.length;

        // Padrão: Taxa de sucesso baixa
        if (successRate < 0.6) {
            patterns.push({
                type: 'low_success_rate',
                severity: 'high',
                description: `Taxa de sucesso baixa (${(successRate * 100).toFixed(1)}%) para tasks similares`,
                suggestion: 'Revisar abordagem ou adicionar validações',
                confidence: this.calculatePatternConfidence(feedbackEntries, 'success')
            });
        }

        // Padrão: Tempo de execução alto
        const avgDuration = feedbackEntries.reduce((sum, f) =>
            sum + (f.feedback.metrics?.duration || 0), 0) / feedbackEntries.length;

        if (avgDuration > 10000) { // 10 segundos
            patterns.push({
                type: 'high_execution_time',
                severity: 'medium',
                description: `Tempo médio alto (${avgDuration.toFixed(0)}ms)`,
                suggestion: 'Otimizar performance ou adicionar cache',
                confidence: this.calculatePatternConfidence(feedbackEntries, 'duration')
            });
        }

        // Padrão: Erros recorrentes
        const errorTypes = {};
        feedbackEntries.forEach(f => {
            if (!f.feedback.success && f.feedback.errorType) {
                errorTypes[f.feedback.errorType] = (errorTypes[f.feedback.errorType] || 0) + 1;
            }
        });

        Object.entries(errorTypes).forEach(([errorType, count]) => {
            if (count > feedbackEntries.length * 0.3) { // Mais de 30% dos casos
                patterns.push({
                    type: 'recurring_error',
                    severity: 'high',
                    description: `Erro recorrente: ${errorType} (${count} ocorrências)`,
                    suggestion: `Implementar correção específica para ${errorType}`,
                    confidence: count / feedbackEntries.length
                });
            }
        });

        // Padrão: Qualidade inconsistente
        const qualityScores = feedbackEntries
            .map(f => f.feedback.metrics?.quality || 0)
            .filter(q => q > 0);

        if (qualityScores.length > 5) {
            const qualityVariance = this.calculateVariance(qualityScores);
            if (qualityVariance > 0.1) { // Alta variabilidade na qualidade
                patterns.push({
                    type: 'quality_inconsistency',
                    severity: 'medium',
                    description: `Qualidade inconsistente (variância: ${(qualityVariance * 100).toFixed(1)}%)`,
                    suggestion: 'Padronizar processos ou adicionar guidelines',
                    confidence: qualityVariance
                });
            }
        }

        // Padrão: Aprendizado detectado (melhoria ao longo do tempo)
        if (feedbackEntries.length >= 10) {
            const learning = this.detectLearning(feedbackEntries);
            if (learning.improvement > 0.1) { // Melhoria significativa
                patterns.push({
                    type: 'learning_detected',
                    severity: 'low',
                    description: `Aprendizado detectado: ${(learning.improvement * 100).toFixed(1)}% de melhoria`,
                    suggestion: 'Continuar otimizações atuais',
                    confidence: learning.improvement
                });
            }
        }

        return patterns;
    }

    /**
     * Calcula confiança de um padrão
     *
     * @param {array} feedbackEntries - Entradas de feedback
     * @param {string} metric - Métrica a analisar
     * @returns {number} Confiança (0-1)
     */
    calculatePatternConfidence(feedbackEntries, metric) {
        if (feedbackEntries.length < this.minFeedbackSamples) {
            return 0.5; // Confiança baixa com poucos dados
        }

        const confidence = Math.min(feedbackEntries.length / 20, 1.0); // Mais dados = mais confiança
        return confidence;
    }

    /**
     * Calcula variância de um array de valores
     *
     * @param {array} values - Valores numéricos
     * @returns {number} Variância
     */
    calculateVariance(values) {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

        return variance;
    }

    /**
     * Detecta aprendizado baseado em melhoria ao longo do tempo
     *
     * @param {array} feedbackEntries - Entradas ordenadas por tempo
     * @returns {object} Detecção de aprendizado
     */
    detectLearning(feedbackEntries) {
        // Ordenar por timestamp
        const sorted = feedbackEntries.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp));

        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

        const firstHalfSuccess = firstHalf.filter(f => f.feedback.success).length / firstHalf.length;
        const secondHalfSuccess = secondHalf.filter(f => f.feedback.success).length / secondHalf.length;

        const improvement = secondHalfSuccess - firstHalfSuccess;

        return {
            improvement: improvement,
            firstHalfSuccess: firstHalfSuccess,
            secondHalfSuccess: secondHalfSuccess
        };
    }

    /**
     * Sugere melhorias baseado em padrões
     *
     * @param {string} agentName - Nome do agente
     * @param {array} patterns - Padrões identificados
     */
    async suggestImprovements(agentName, patterns) {
        log.info('Suggesting improvements', { agent: agentName, patternsCount: patterns.length });

        for (const pattern of patterns) {
            const improvementContent = `
Melhoria sugerida para agente ${agentName}:
Tipo: ${pattern.type}
Gravidade: ${pattern.severity}
Descrição: ${pattern.description}
Sugestão: ${pattern.suggestion}
Data: ${new Date().toISOString()}
            `.trim();

            // Armazenar como padrão de melhoria
            await this.llbProtocol.storePattern(improvementContent, {
                category: 'improvement_suggestions',
                source: 'feedback_loop',
                agent: agentName,
                pattern_type: pattern.type,
                severity: pattern.severity
            });
        }
    }

    /**
     * Atualiza cache de prompts baseado em feedback
     *
     * @param {array} similarFeedback - Feedback similar
     * @param {object} newFeedback - Novo feedback
     */
    async updatePromptCache(similarFeedback, newFeedback) {
        const { execution } = newFeedback;

        // Calcular nova taxa de sucesso para prompts similares
        const recentFeedback = similarFeedback.slice(0, 5); // Últimos 5 similares
        const successRate = recentFeedback.filter(f => f.feedback.success).length / recentFeedback.length;

        // Se taxa de sucesso melhorou significativamente, ajustar cache
        if (successRate > this.learningThreshold) {
            log.info('Updating prompt cache based on feedback learning', {
                successRate: successRate.toFixed(3),
                similarCount: recentFeedback.length
            });

            // Aqui poderíamos ajustar pesos no cache de prompts
            // Por enquanto, apenas registrar aprendizado
            await this.llbProtocol.storePattern(
                `Cache de prompts otimizado: taxa de sucesso ${(successRate * 100).toFixed(1)}% para ${recentFeedback.length} execuções similares`,
                {
                    category: 'cache_optimization',
                    source: 'feedback_loop',
                    success_rate: successRate
                }
            );
        }
    }

    /**
     * Implementa A/B testing de prompts
     *
     * @param {string} agentName - Nome do agente
     * @param {string} taskType - Tipo de task
     * @param {array} promptVariations - Variações de prompt para testar
     * @returns {Promise<object>} Resultados do A/B testing
     */
    async runABTesting(agentName, taskType, promptVariations) {
        log.info('Running A/B testing for prompts', {
            agent: agentName,
            taskType,
            variations: promptVariations.length
        });

        const testResults = [];
        const testDuration = 7 * 24 * 60 * 60 * 1000; // 7 dias
        const startTime = Date.now();

        // Executar cada variação por um período
        for (const variation of promptVariations) {
            const variationResults = {
                variation: variation.id,
                prompt: variation.prompt,
                executions: 0,
                successes: 0,
                avgDuration: 0,
                avgQuality: 0,
                startTime: new Date().toISOString()
            };

            // Simular execuções com esta variação
            // Em produção, isso seria feito coletando feedback real ao longo do tempo
            const mockResults = await this.simulatePromptVariation(variation, agentName, taskType);

            variationResults.executions = mockResults.length;
            variationResults.successes = mockResults.filter(r => r.success).length;
            variationResults.avgDuration = mockResults.reduce((sum, r) => sum + r.duration, 0) / mockResults.length;
            variationResults.avgQuality = mockResults.reduce((sum, r) => sum + r.quality, 0) / mockResults.length;

            testResults.push(variationResults);

            // Pequena pausa entre variações
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Analisar resultados
        const analysis = this.analyzeABTestResults(testResults);

        // Armazenar aprendizado
        await this.storeABTestLearning(analysis, agentName, taskType);

        return {
            testDuration: Date.now() - startTime,
            results: testResults,
            analysis: analysis,
            winner: analysis.winner,
            improvement: analysis.improvement
        };
    }

    /**
     * Simula execução de uma variação de prompt
     *
     * @param {object} variation - Variação de prompt
     * @param {string} agentName - Nome do agente
     * @param {string} taskType - Tipo de task
     * @returns {Promise<array>} Resultados simulados
     */
    async simulatePromptVariation(variation, agentName, taskType) {
        // Simular 10 execuções com diferentes níveis de sucesso baseados na qualidade do prompt
        const baseQuality = variation.expectedQuality || 0.7;
        const results = [];

        for (let i = 0; i < 10; i++) {
            const quality = baseQuality + (Math.random() - 0.5) * 0.2; // ±10% variação
            const success = quality > 0.6; // Threshold de sucesso

            results.push({
                success,
                duration: 1000 + Math.random() * 2000, // 1-3 segundos
                quality: Math.max(0, Math.min(1, quality))
            });
        }

        return results;
    }

    /**
     * Analisa resultados de A/B testing
     *
     * @param {array} testResults - Resultados do teste
     * @returns {object} Análise dos resultados
     */
    analyzeABTestResults(testResults) {
        if (testResults.length === 0) return { winner: null, improvement: 0 };

        // Encontrar melhor variação baseado em sucesso + qualidade
        const scored = testResults.map(result => ({
            ...result,
            score: (result.successes / result.executions) * 0.6 +
                (result.avgQuality) * 0.4
        }));

        scored.sort((a, b) => b.score - a.score);
        const winner = scored[0];

        // Calcular melhoria sobre baseline (primeira variação)
        const baseline = scored[scored.length - 1];
        const improvement = winner.score - baseline.score;

        return {
            winner: winner.variation,
            winnerScore: winner.score,
            baselineScore: baseline.score,
            improvement: improvement,
            confidence: this.calculateStatisticalSignificance(testResults),
            recommendations: this.generateABTestRecommendations(scored)
        };
    }

    /**
     * Calcula significância estatística básica
     *
     * @param {array} testResults - Resultados do teste
     * @returns {number} Significância (0-1)
     */
    calculateStatisticalSignificance(testResults) {
        if (testResults.length < 2) return 0;

        // Cálculo simplificado: diferença relativa entre melhor e pior
        const scores = testResults.map(r => (r.successes / r.executions) * 0.6 + r.avgQuality * 0.4);
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        return Math.min((maxScore - minScore) / maxScore, 1.0);
    }

    /**
     * Gera recomendações baseadas em A/B testing
     *
     * @param {array} scoredResults - Resultados ordenados por score
     * @returns {array} Recomendações
     */
    generateABTestRecommendations(scoredResults) {
        const recommendations = [];
        const winner = scoredResults[0];

        recommendations.push(`Adotar variação ${winner.variation} como padrão (score: ${winner.score.toFixed(3)})`);

        // Identificar o que funcionou melhor
        if (winner.avgQuality > winner.avgDuration / 3000) {
            recommendations.push('Focar em qualidade do resultado vs velocidade');
        } else {
            recommendations.push('Focar em otimização de performance');
        }

        // Sugerir combinações
        if (scoredResults.length > 2) {
            recommendations.push('Considerar combinar elementos das top 3 variações');
        }

        return recommendations;
    }

    /**
     * Armazena aprendizado do A/B testing
     *
     * @param {object} analysis - Análise dos resultados
     * @param {string} agentName - Nome do agente
     * @param {string} taskType - Tipo de task
     */
    async storeABTestLearning(analysis, agentName, taskType) {
        const learningContent = `
A/B Testing concluído para ${agentName} - ${taskType}:
- Vencedor: ${analysis.winner}
- Score: ${(analysis.winnerScore * 100).toFixed(1)}%
- Melhoria: ${(analysis.improvement * 100).toFixed(1)}%
- Confiança estatística: ${(analysis.confidence * 100).toFixed(1)}%

Recomendações:
${analysis.recommendations.map(r => `- ${r}`).join('\n')}
        `.trim();

        await this.llbProtocol.storePattern(learningContent, {
            category: 'ab_testing_results',
            source: 'feedback_loop',
            agent: agentName,
            task_type: taskType,
            winner: analysis.winner,
            improvement: analysis.improvement
        });
    }

    /**
     * Obtém insights de execução para um agente
     *
     * @param {string} agentName - Nome do agente
     * @param {string} taskType - Tipo de task
     * @returns {Promise<object>} Insights de execução
     */
    async getExecutionInsights(agentName, taskType = null) {
        const agentFeedback = Array.from(this.feedbackHistory.values())
            .filter(f => f.execution.agent === agentName);

        if (taskType) {
            // Filtrar por tipo de task se especificado
            const taskEmbeddings = await Promise.all(
                agentFeedback.map(async f => ({
                    ...f,
                    taskEmbedding: await this.embeddings.generateEmbedding(f.execution.task || '')
                }))
            );

            const taskEmbedding = await this.embeddings.generateEmbedding(taskType);
            const relevantFeedback = taskEmbeddings
                .filter(f => this.embeddings.cosineSimilarity(f.taskEmbedding, taskEmbedding) > 0.6)
                .map(f => f);

            return this.generateInsights(relevantFeedback);
        }

        return this.generateInsights(agentFeedback);
    }

    /**
     * Gera insights baseados em feedback
     *
     * @param {array} feedbackEntries - Entradas de feedback
     * @returns {object} Insights gerados
     */
    generateInsights(feedbackEntries) {
        if (feedbackEntries.length === 0) {
            return { insights: [], recommendations: [] };
        }

        const insights = [];
        const recommendations = [];

        // Calcular métricas gerais
        const successRate = feedbackEntries.filter(f => f.feedback.success).length / feedbackEntries.length;
        const avgDuration = feedbackEntries.reduce((sum, f) =>
            sum + (f.feedback.metrics?.duration || 0), 0) / feedbackEntries.length;

        insights.push({
            type: 'performance_overview',
            data: {
                totalExecutions: feedbackEntries.length,
                successRate: successRate * 100,
                avgDuration: avgDuration,
                timeRange: this.getTimeRange(feedbackEntries)
            }
        });

        // Identificar pontos fortes e fracos
        if (successRate > 0.8) {
            insights.push({
                type: 'strength',
                description: 'Alta taxa de sucesso consistente'
            });
        } else if (successRate < 0.6) {
            insights.push({
                type: 'weakness',
                description: 'Taxa de sucesso abaixo do esperado',
                recommendation: 'Revisar abordagem e adicionar validações'
            });
            recommendations.push('Implementar validações adicionais');
        }

        if (avgDuration > 5000) {
            insights.push({
                type: 'performance_issue',
                description: 'Tempo de execução elevado'
            });
            recommendations.push('Otimizar performance ou implementar cache');
        }

        // Identificar padrões de erro
        const errorPatterns = {};
        feedbackEntries.forEach(f => {
            if (!f.feedback.success && f.feedback.errorType) {
                errorPatterns[f.feedback.errorType] = (errorPatterns[f.feedback.errorType] || 0) + 1;
            }
        });

        Object.entries(errorPatterns).forEach(([errorType, count]) => {
            if (count > feedbackEntries.length * 0.2) {
                insights.push({
                    type: 'recurring_error',
                    errorType,
                    frequency: count,
                    percentage: (count / feedbackEntries.length * 100).toFixed(1)
                });
                recommendations.push(`Implementar tratamento específico para erro: ${errorType}`);
            }
        });

        return { insights, recommendations };
    }

    /**
     * Obtém range de tempo das execuções
     *
     * @param {array} feedbackEntries - Entradas de feedback
     * @returns {object} Range de tempo
     */
    getTimeRange(feedbackEntries) {
        if (feedbackEntries.length === 0) return null;

        const timestamps = feedbackEntries.map(f => new Date(f.timestamp));
        const earliest = new Date(Math.min(...timestamps));
        const latest = new Date(Math.max(...timestamps));

        return {
            earliest: earliest.toISOString(),
            latest: latest.toISOString(),
            days: Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Gera chave única para feedback
     *
     * @param {object} executionData - Dados de execução
     * @returns {string} Chave única
     */
    generateFeedbackKey(executionData) {
        return `${executionData.agent}_${executionData.task?.substring(0, 50)}_${Date.now()}`;
    }

    /**
     * Limpa feedback antigo baseado na retenção configurada
     */
    cleanupOldFeedback() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.feedbackRetentionDays);

        const keysToRemove = [];
        for (const [key, entry] of this.feedbackHistory.entries()) {
            if (new Date(entry.timestamp) < cutoffDate) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => this.feedbackHistory.delete(key));

        if (keysToRemove.length > 0) {
            log.info('Cleaned up old feedback entries', { count: keysToRemove.length });
        }
    }

    /**
     * Obtém estatísticas do feedback loop
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        const entries = Array.from(this.feedbackHistory.values());
        const successCount = entries.filter(f => f.feedback.success).length;
        const avgQuality = entries.length > 0
            ? entries.reduce((sum, f) => sum + (f.feedback.metrics?.quality || 0), 0) / entries.length
            : 0;

        return {
            totalFeedback: entries.length,
            successRate: entries.length > 0 ? successCount / entries.length : 0,
            avgQuality: avgQuality * 100,
            retentionDays: this.feedbackRetentionDays,
            learningThreshold: this.learningThreshold
        };
    }
}

// Singleton
let feedbackLoopInstance = null;

export function getFeedbackLoop(options = {}) {
    if (!feedbackLoopInstance) {
        feedbackLoopInstance = new FeedbackLoop(options);
    }
    return feedbackLoopInstance;
}

export default FeedbackLoop;
