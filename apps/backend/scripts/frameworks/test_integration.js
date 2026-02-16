/**
 * Teste de Integração Completo
 * 
 * Testa todos os frameworks integrados com LLMs reais (Grok/Gemini)
 */

import { reactAgent, totAgent, hybridAgent, specializedAgent } from './integrated_agent.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'test_integration' });

/**
 * Testa ReAct Agent
 */
async function testReactAgent() {
    console.log('\n🧪 Testando ReAct Agent com LLM Real...\n');

    try {
        const tools = {
            search_memory: async (params) => {
                return `Resultado da busca: encontrei ${params.query} na memória.`;
            },
            create_task: async (params) => {
                return `Task criada: ${params.title} com prioridade ${params.priority || 'medium'}`;
            },
        };

        const result = await reactAgent(
            'Preciso criar uma task para implementar autenticação. Use a ferramenta create_task.',
            tools,
            {
                systemPrompt: 'Você é um agente desenvolvedor. Use as ferramentas disponíveis para completar tarefas.',
                maxIterations: 5,
                temperature: 0.7,
            }
        );

        console.log('✅ ReAct Agent:', result.success ? 'PASSOU' : 'FALHOU');
        console.log(`   Iterações: ${result.iterations}`);
        console.log(`   Resposta: ${result.answer?.substring(0, 200)}...`);
        return result.success;
    } catch (error) {
        console.log('❌ ReAct Agent: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Testa Tree of Thoughts Agent
 */
async function testTotAgent() {
    console.log('\n🧪 Testando Tree of Thoughts Agent com LLM Real...\n');

    try {
        const result = await totAgent(
            'Como devemos priorizar recursos limitados entre desenvolvimento de novas features e manutenção de código legado?',
            {
                systemPrompt: 'Você é um CTO estratégico. Analise problemas complexos explorando múltiplas perspectivas.',
                maxDepth: 2,
                numThoughtsPerLevel: 3,
                temperature: 0.8,
            }
        );

        console.log('✅ Tree of Thoughts Agent:', result.success ? 'PASSOU' : 'FALHOU');
        console.log(`   Nós explorados: ${result.nodesExplored}`);
        console.log(`   Melhor score: ${result.solution?.score || 0}`);
        console.log(`   Solução: ${result.solution?.thought?.substring(0, 200)}...`);
        return result.success;
    } catch (error) {
        console.log('❌ Tree of Thoughts Agent: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Testa Hybrid Agent
 */
async function testHybridAgent() {
    console.log('\n🧪 Testando Hybrid Agent...\n');

    try {
        // Teste simples (deve usar ReAct)
        const simpleResult = await hybridAgent(
            'Qual é a melhor forma de fazer deploy?',
            {},
            { useToT: false }
        );

        console.log('✅ Hybrid Agent (simples):', simpleResult.success ? 'PASSOU' : 'FALHOU');

        // Teste complexo (deve usar ToT)
        const complexResult = await hybridAgent(
            'Como devemos arquitetar um sistema de microserviços escalável que suporte 1 milhão de usuários simultâneos, considerando trade-offs entre consistência, disponibilidade e latência?',
            {},
            { useToT: true }
        );

        console.log('✅ Hybrid Agent (complexo):', complexResult.success ? 'PASSOU' : 'FALHOU');

        return simpleResult.success && complexResult.success;
    } catch (error) {
        console.log('❌ Hybrid Agent: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Testa Specialized Agent
 */
async function testSpecializedAgent() {
    console.log('\n🧪 Testando Specialized Agent...\n');

    try {
        const tools = {
            analyze_code: async (params) => {
                return `Análise do código: ${params.file} tem ${Math.floor(Math.random() * 100)} linhas.`;
            },
        };

        const result = await specializedAgent(
            'Arquiteto de Software',
            'Analise a arquitetura do sistema e sugira melhorias.',
            tools,
            {
                specialization: 'Especialista em sistemas escaláveis, segurança e performance.',
                useToT: false,
                temperature: 0.7,
            }
        );

        console.log('✅ Specialized Agent:', result.success ? 'PASSOU' : 'FALHOU');
        console.log(`   Resposta: ${result.answer?.substring(0, 200)}...`);
        return result.success;
    } catch (error) {
        console.log('❌ Specialized Agent: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Main
 */
async function main() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTE DE INTEGRAÇÃO COMPLETA');
    console.log('   Frameworks + LLMs Reais (Grok/Gemini)');
    console.log('═══════════════════════════════════════════════════\n');

    const results = {
        react: false,
        tot: false,
        hybrid: false,
        specialized: false,
    };

    // Testa ReAct
    results.react = await testReactAgent();

    // Aguarda um pouco entre testes
    await new Promise(r => setTimeout(r, 2000));

    // Testa ToT
    results.tot = await testTotAgent();

    // Aguarda um pouco entre testes
    await new Promise(r => setTimeout(r, 2000));

    // Testa Hybrid
    results.hybrid = await testHybridAgent();

    // Aguarda um pouco entre testes
    await new Promise(r => setTimeout(r, 2000));

    // Testa Specialized
    results.specialized = await testSpecializedAgent();

    // Resumo
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   RESUMO DOS TESTES');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ ReAct Agent:', results.react ? 'PASSOU' : 'FALHOU');
    console.log('✅ Tree of Thoughts Agent:', results.tot ? 'PASSOU' : 'FALHOU');
    console.log('✅ Hybrid Agent:', results.hybrid ? 'PASSOU' : 'FALHOU');
    console.log('✅ Specialized Agent:', results.specialized ? 'PASSOU' : 'FALHOU');

    const allPassed = Object.values(results).every(r => r === true);

    console.log('\n' + (allPassed ? '✅' : '❌') + ' Todos os testes:', 
        allPassed ? 'PASSARAM' : 'FALHARAM');

    if (allPassed) {
        console.log('\n🎉 Sistema 100% funcional e integrado!');
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique logs acima.');
    }

    process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
    console.error('\n❌ Erro fatal nos testes:', error);
    process.exit(1);
});




























