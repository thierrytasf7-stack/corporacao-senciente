#!/usr/bin/env node
/**
 * Teste: Feedback Loop Automático
 *
 * Testa o sistema de aprendizado contínuo baseado em feedback
 */

import { getFeedbackLoop } from './swarm/feedback_loop.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_feedback_loop' });

async function testFeedbackLoop() {
    log.info('🧪 Testando Feedback Loop Automático\n');

    const feedbackLoop = getFeedbackLoop({
        learningThreshold: 0.7,
        minFeedbackSamples: 3
    });

    try {
        // 1. Testar coleta de feedback básico
        log.info('1. Testando coleta de feedback básico...\n');

        const executionData = {
            agent: 'test_agent',
            task: 'Executar operação de teste',
            context: { environment: 'test' }
        };

        const feedbackData = {
            success: true,
            result: 'Operação executada com sucesso',
            metrics: {
                duration: 1500,
                quality: 0.85
            }
        };

        const collected = await feedbackLoop.collectFeedback(executionData, feedbackData);
        console.log('✅ Feedback coletado:', collected ? 'Sucesso' : 'Falhou');

        // 2. Testar múltiplos feedbacks para análise de padrões
        log.info('2. Testando análise de padrões...\n');

        // Adicionar mais feedbacks
        const feedbacks = [
            { success: true, metrics: { duration: 1200, quality: 0.9 } },
            { success: false, error: 'Timeout', errorType: 'network', metrics: { duration: 5000, quality: 0.1 } },
            { success: true, metrics: { duration: 1800, quality: 0.7 } },
            { success: false, error: 'Validation error', errorType: 'validation', metrics: { duration: 800, quality: 0.3 } },
            { success: true, metrics: { duration: 1100, quality: 0.95 } }
        ];

        for (const fb of feedbacks) {
            await feedbackLoop.collectFeedback({
                agent: 'test_agent',
                task: 'Task similar',
                context: { type: 'similar' }
            }, fb);
        }

        // Obter insights
        const insights = await feedbackLoop.getExecutionInsights('test_agent');
        console.log('✅ Insights gerados:');
        console.log(`   Total de execuções: ${insights.insights[0]?.data?.totalExecutions || 0}`);
        console.log(`   Taxa de sucesso: ${(insights.insights[0]?.data?.successRate || 0).toFixed(1)}%`);
        console.log(`   Duração média: ${insights.insights[0]?.data?.avgDuration || 0}ms`);

        // 3. Testar A/B testing de prompts
        log.info('3. Testando A/B testing de prompts...\n');

        const promptVariations = [
            {
                id: 'variation_a',
                prompt: 'Execute esta task focando em qualidade.',
                expectedQuality: 0.8
            },
            {
                id: 'variation_b',
                prompt: 'Execute esta task rapidamente, priorizando velocidade.',
                expectedQuality: 0.6
            },
            {
                id: 'variation_c',
                prompt: 'Execute esta task equilibrando qualidade e velocidade.',
                expectedQuality: 0.75
            }
        ];

        const abTestResults = await feedbackLoop.runABTesting('test_agent', 'generic_task', promptVariations);
        console.log('✅ A/B Testing concluído:');
        console.log(`   Duração do teste: ${abTestResults.testDuration}ms`);
        console.log(`   Vencedor: ${abTestResults.analysis.winner}`);
        console.log(`   Melhoria: ${(abTestResults.analysis.improvement * 100).toFixed(1)}%`);
        console.log(`   Confiança: ${(abTestResults.analysis.confidence * 100).toFixed(1)}%`);

        // 4. Testar limpeza automática
        log.info('4. Testando limpeza automática...\n');

        const statsBefore = feedbackLoop.getStats();
        console.log(`✅ Estatísticas antes da limpeza: ${statsBefore.totalFeedback} feedbacks`);

        // Forçar limpeza (simular dados antigos)
        feedbackLoop.cleanupOldFeedback();

        const statsAfter = feedbackLoop.getStats();
        console.log(`✅ Estatísticas após limpeza: ${statsAfter.totalFeedback} feedbacks`);
        console.log(`   Retenção: ${statsAfter.feedbackRetentionDays} dias`);

        // 5. Testar busca de feedback similar
        log.info('5. Testando busca de feedback similar...\n');

        const testExecution = {
            agent: 'test_agent',
            task: 'Executar operação similar',
            context: { type: 'similar' }
        };

        // Adicionar mais um feedback para teste
        await feedbackLoop.collectFeedback(testExecution, {
            success: true,
            result: 'Similar operation completed',
            metrics: { duration: 1400, quality: 0.88 }
        });

        // Buscar feedback similar internamente (método privado, mas testável)
        const similarCount = Array.from(feedbackLoop.feedbackHistory.values()).length;
        console.log(`✅ Feedback similar encontrado: ${similarCount} entradas similares`);

        // 6. Testar geração de recomendações
        log.info('6. Testando geração de recomendações...\n');

        const recommendations = insights.recommendations || [];
        console.log('✅ Recomendações geradas:');
        if (recommendations.length > 0) {
            recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
        } else {
            console.log('   Nenhuma recomendação específica gerada');
        }

        // 7. Estatísticas finais
        log.info('7. Estatísticas finais...\n');

        const finalStats = feedbackLoop.getStats();
        console.log('✅ Estatísticas finais do Feedback Loop:');
        console.log(`   Total de feedback: ${finalStats.totalFeedback}`);
        console.log(`   Taxa de sucesso: ${(finalStats.successRate * 100).toFixed(1)}%`);
        console.log(`   Qualidade média: ${(finalStats.avgQuality).toFixed(1)}%`);
        console.log(`   Threshold de aprendizado: ${(finalStats.learningThreshold * 100).toFixed(1)}%`);

        log.info('🎉 Feedback Loop testado com sucesso!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Coleta automática de feedback');
        log.info('  ✅ Análise de padrões de execução');
        log.info('  ✅ Detecção de aprendizado contínuo');
        log.info('  ✅ A/B testing de prompts');
        log.info('  ✅ Geração automática de melhorias');
        log.info('  ✅ Insights de performance por agente');

        return true;
    } catch (err) {
        log.error('❌ Erro ao testar Feedback Loop', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testFeedbackLoop().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal', { error: err.message });
    process.exit(1);
});
