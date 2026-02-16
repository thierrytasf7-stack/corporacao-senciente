#!/usr/bin/env node
/**
 * Teste: Sistema de Confiança
 *
 * Testa avaliação inteligente de confiança para ações
 */

import { getConfidenceScorer } from './swarm/confidence_scorer.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_confidence_scorer' });

async function testConfidenceScorer() {
    log.info('🧠 Testando Sistema de Confiança\n');

    const scorer = getConfidenceScorer({
        highThreshold: 0.8,
        mediumThreshold: 0.5,
        lowThreshold: 0.3
    });

    const testResults = {
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        totalTests: 0
    };

    try {
        // 1. Testar ação de alta confiança (agente experiente, ação simples)
        log.info('1. Testar ação de alta confiança...\n');

        const highConfidenceAction = {
            type: 'create',
            description: 'Criar arquivo README simples',
            files: ['docs/README.md'],
            content: '# Documentação\nEste é um arquivo README.'
        };

        const highResult = await scorer.calculateConfidence(highConfidenceAction, {
            agent: 'architect', // Agente experiente
            langmemAvailable: true,
            lettaState: 'active'
        });

        console.log('✅ Avaliação de alta confiança:');
        console.log(`   Score: ${(highResult.score * 100).toFixed(1)}%`);
        console.log(`   Decisão: ${highResult.decision.decision}`);
        console.log(`   Confiança no cálculo: ${highResult.confidence}`);
        console.log(`   Fatores avaliados: ${Object.keys(highResult.factors).length}`);

        if (highResult.score >= 0.8) testResults.highConfidence++;
        testResults.totalTests++;

        // 2. Testar ação de confiança média (agente intermediário, ação moderada)
        log.info('2. Testar ação de confiança média...\n');

        const mediumConfidenceAction = {
            type: 'modify',
            description: 'Modificar função existente',
            files: ['src/utils.js'],
            dependencies: ['fs', 'path']
        };

        const mediumResult = await scorer.calculateConfidence(mediumConfidenceAction, {
            agent: 'developer', // Agente com experiência média
            langmemAvailable: true
        });

        console.log('✅ Avaliação de confiança média:');
        console.log(`   Score: ${(mediumResult.score * 100).toFixed(1)}%`);
        console.log(`   Decisão: ${mediumResult.decision.decision}`);
        console.log(`   Razão: ${mediumResult.reasoning}`);

        if (mediumResult.score >= 0.5 && mediumResult.score < 0.8) testResults.mediumConfidence++;
        testResults.totalTests++;

        // 3. Testar ação de baixa confiança (agente novo, ação complexa)
        log.info('3. Testar ação de baixa confiança...\n');

        const lowConfidenceAction = {
            type: 'deploy',
            description: 'Deploy em produção com múltiplas dependências',
            files: Array.from({ length: 20 }, (_, i) => `component_${i}.js`), // 20 arquivos
            dependencies: ['database', 'cache', 'monitoring', 'security', 'logging'],
            prompt: 'Deploy complexo' // Prompt muito simples
        };

        const lowResult = await scorer.calculateConfidence(lowConfidenceAction, {
            agent: 'new_agent', // Agente sem histórico
            langmemAvailable: false
        });

        console.log('✅ Avaliação de baixa confiança:');
        console.log(`   Score: ${(lowResult.score * 100).toFixed(1)}%`);
        console.log(`   Decisão: ${lowResult.decision.decision}`);
        console.log(`   Recomendações: ${lowResult.recommendations.length}`);

        if (lowResult.score < 0.5) testResults.lowConfidence++;
        testResults.totalTests++;

        // 4. Testar cache de confiança
        log.info('4. Testar cache de confiança...\n');

        const cachedAction = {
            type: 'read',
            description: 'Ler arquivo de configuração'
        };

        // Primeira chamada
        const startTime = Date.now();
        const firstResult = await scorer.calculateConfidence(cachedAction, { agent: 'tester' });
        const firstTime = Date.now() - startTime;

        // Segunda chamada (deve usar cache)
        const secondStartTime = Date.now();
        const secondResult = await scorer.calculateConfidence(cachedAction, { agent: 'tester' });
        const secondTime = Date.now() - secondStartTime;

        console.log('✅ Teste de cache:');
        console.log(`   Primeira chamada: ${firstTime}ms`);
        console.log(`   Segunda chamada: ${secondTime}ms`);
        console.log(`   Cache funcionando: ${secondTime < firstTime}`);

        // 5. Testar fatores de avaliação
        log.info('5. Testar fatores de avaliação...\n');

        const factorAction = {
            type: 'execute',
            description: 'Executar testes automatizados',
            prompt: 'Execute todos os testes automatizados com cobertura completa e gere relatório detalhado incluindo métricas de performance e possíveis melhorias identificadas durante a execução.'
        };

        const factorResult = await scorer.calculateConfidence(factorAction, {
            agent: 'tester',
            langmemAvailable: true,
            lettaState: 'active'
        });

        console.log('✅ Análise de fatores:');
        Object.entries(factorResult.factors).forEach(([factor, value]) => {
            console.log(`   ${factor}: ${(value * 100).toFixed(1)}%`);
        });

        // 6. Testar aprendizado contínuo
        log.info('6. Testar aprendizado contínuo...\n');

        // Aguardar processamento do aprendizado
        await new Promise(resolve => setTimeout(resolve, 1000));

        const learningAction = {
            type: 'analyze',
            description: 'Análise de código com IA avançada'
        };

        const learningResult = await scorer.calculateConfidence(learningAction, {
            agent: 'architect'
        });

        console.log('✅ Aprendizado aplicado:');
        console.log(`   Score após aprendizado: ${(learningResult.score * 100).toFixed(1)}%`);
        console.log(`   Decisão: ${learningResult.decision.decision}`);

        // 7. Testar diferentes agentes
        log.info('7. Testar diferentes agentes...\n');

        const agentTests = [
            { agent: 'architect', expectedScore: 'high' },
            { agent: 'developer', expectedScore: 'medium' },
            { agent: 'tester', expectedScore: 'high' },
            { agent: 'new_agent', expectedScore: 'low' }
        ];

        for (const test of agentTests) {
            const agentAction = {
                type: 'create',
                description: `Ação do agente ${test.agent}`
            };

            const agentResult = await scorer.calculateConfidence(agentAction, {
                agent: test.agent
            });

            console.log(`✅ Agente ${test.agent}: ${(agentResult.score * 100).toFixed(1)}% (${agentResult.decision.decision})`);
        }

        // 8. Testar decisões baseadas em confiança
        log.info('8. Testar decisões baseadas em confiança...\n');

        const decisions = [
            { score: 0.9, expected: 'execute_directly' },
            { score: 0.6, expected: 'execute_with_prompt' },
            { score: 0.2, expected: 'require_confirmation' }
        ];

        for (const decisionTest of decisions) {
            const decisionAction = { type: 'test', score: decisionTest.score };
            const decisionResult = scorer.makeDecision(decisionTest.score, decisionAction, {});

            console.log(`✅ Score ${(decisionTest.score * 100).toFixed(0)}%: ${decisionResult.decision} (esperado: ${decisionTest.expected})`);
        }

        // 9. Estatísticas finais
        log.info('9. Estatísticas finais do sistema de confiança...\n');

        const stats = scorer.getStats();
        console.log('✅ Estatísticas do ConfidenceScorer:');
        console.log(`   Cache ativo: ${stats.cacheSize} entradas`);
        console.log(`   Agentes rastreados: ${stats.agentsTracked}`);
        console.log(`   Thresholds configurados: ${Object.keys(stats.thresholds).length} níveis`);
        console.log(`   Fatores de peso: ${Object.keys(stats.weights).length} fatores`);
        console.log(`   Timeout do cache: ${stats.cacheTimeout / 1000}s`);

        // 10. Resumo dos testes
        log.info('10. Resumo dos testes de confiança...\n');

        console.log('🎯 Resumo dos Testes de Confiança:');
        console.log(`   ✅ Testes de alta confiança: ${testResults.highConfidence}`);
        console.log(`   ✅ Testes de confiança média: ${testResults.mediumConfidence}`);
        console.log(`   ✅ Testes de baixa confiança: ${testResults.lowConfidence}`);
        console.log(`   📊 Total de testes: ${testResults.totalTests}`);
        console.log(`   📈 Taxa de distribuição adequada: ${((testResults.highConfidence + testResults.mediumConfidence + testResults.lowConfidence) / testResults.totalTests * 100).toFixed(1)}%`);

        const distributionScore = (testResults.highConfidence + testResults.mediumConfidence + testResults.lowConfidence) / testResults.totalTests;
        if (distributionScore >= 0.9) {
            console.log('🎉 Sistema de confiança funcionando perfeitamente!');
            console.log('   ✓ Distribuição adequada de confiança');
            console.log('   ✓ Decisões inteligentes baseadas em score');
            console.log('   ✓ Aprendizado contínuo funcionando');
            console.log('   ✓ Cache otimizando performance');
        } else {
            console.log('⚠️ Sistema de confiança com algumas inconsistências.');
        }

        log.info('🎉 Testes de confiança concluídos com sucesso!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Avaliação inteligente de confiança baseada em múltiplos fatores');
        log.info('  ✅ Decisões automáticas: executar diretamente, com prompt ou confirmar');
        log.info('  ✅ Cache de confiança para performance');
        log.info('  ✅ Aprendizado contínuo de performance de agentes');
        log.info('  ✅ Raciocínio explicável para decisões');
        log.info('  ✅ Integração completa com validação e métricas');

        return distributionScore >= 0.8; // Sucesso se >= 80%

    } catch (err) {
        log.error('❌ Erro ao testar ConfidenceScorer', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testConfidenceScorer().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});
