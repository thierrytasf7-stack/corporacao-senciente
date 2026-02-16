/**
 * Teste dos Frameworks Implementados
 * 
 * Verifica se todos os frameworks estão funcionando corretamente
 */

import { runReAct, createReActPrompt } from './frameworks/react.js';
import { runTreeOfThoughts, createEvaluationPrompt } from './frameworks/tree_of_thoughts.js';
import { checkPythonAvailable, testPythonFrameworks } from './frameworks/python_bridge.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_frameworks' });

/**
 * Mock LLM para testes
 */
async function mockLLM(prompt) {
    // Simula resposta do LLM
    if (prompt.includes('Final Answer')) {
        return 'Final Answer: A resposta de teste foi gerada com sucesso.';
    }
    if (prompt.includes('Thought:')) {
        return 'Thought: Preciso pensar sobre isso.\nAction: test_tool\nParams: {"param": "value"}\n';
    }
    return 'Thought: Vou processar isso.\nFinal Answer: Resultado do teste.';
}

/**
 * Mock evaluator para ToT
 */
async function mockEvaluator(thought, context) {
    return {
        score: Math.random() * 0.5 + 0.5, // Score entre 0.5 e 1.0
        reasoning: 'Esta é uma avaliação de teste.',
    };
}

/**
 * Testa framework ReAct
 */
async function testReAct() {
    console.log('\n🧪 Testando ReAct Framework...\n');

    try {
        const tools = {
            test_tool: async (params) => {
                return `Resultado do teste: ${JSON.stringify(params)}`;
            },
        };

        const result = await runReAct(
            mockLLM,
            tools,
            'Qual é a resposta para esta pergunta de teste?',
            { maxIterations: 3 }
        );

        console.log('✅ ReAct Framework:', result.success ? 'PASSOU' : 'FALHOU');
        console.log(`   Iterações: ${result.iterations}`);
        console.log(`   Resposta: ${result.answer?.substring(0, 100)}...`);
        return result.success;
    } catch (error) {
        console.log('❌ ReAct Framework: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Testa framework Tree of Thoughts
 */
async function testTreeOfThoughts() {
    console.log('\n🧪 Testando Tree of Thoughts Framework...\n');

    try {
        const result = await runTreeOfThoughts(
            mockLLM,
            mockEvaluator,
            'Como resolver este problema de teste?',
            {
                maxDepth: 2,
                numThoughtsPerLevel: 3,
                numBestToKeep: 2,
            }
        );

        console.log('✅ Tree of Thoughts Framework:', result.success ? 'PASSOU' : 'FALHOU');
        console.log(`   Nós explorados: ${result.nodesExplored}`);
        console.log(`   Melhor score: ${result.solution?.score || 0}`);
        return result.success;
    } catch (error) {
        console.log('❌ Tree of Thoughts Framework: FALHOU');
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

/**
 * Testa Python bridges
 */
async function testPython() {
    console.log('\n🧪 Testando Frameworks Python...\n');

    try {
        const pythonAvailable = await checkPythonAvailable();
        
        if (!pythonAvailable) {
            console.log('⚠️  Python não disponível - pulando testes Python');
            return null;
        }

        const checks = await testPythonFrameworks();

        console.log('Python disponível:', checks.python ? '✅' : '❌');
        console.log('CrewAI:', checks.crewai ? '✅' : '❌ (instale: pip install crewai)');
        console.log('LangChain:', checks.langchain ? '✅' : '❌ (instale: pip install langchain)');
        console.log('LangGraph:', checks.langgraph ? '✅' : '❌ (instale: pip install langgraph)');

        return checks;
    } catch (error) {
        console.log('⚠️  Erro ao testar Python:', error.message);
        return null;
    }
}

/**
 * Main
 */
async function main() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTE DE FRAMEWORKS DE VANGUARDA');
    console.log('═══════════════════════════════════════════════════\n');

    const results = {
        react: false,
        treeOfThoughts: false,
        python: null,
    };

    // Testa ReAct
    results.react = await testReAct();

    // Testa Tree of Thoughts
    results.treeOfThoughts = await testTreeOfThoughts();

    // Testa Python
    results.python = await testPython();

    // Resumo
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   RESUMO DOS TESTES');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ ReAct Framework:', results.react ? 'PASSOU' : 'FALHOU');
    console.log('✅ Tree of Thoughts:', results.treeOfThoughts ? 'PASSOU' : 'FALHOU');
    
    if (results.python) {
        console.log('✅ Python disponível');
        console.log(`   CrewAI: ${results.python.crewai ? '✅' : '❌'}`);
        console.log(`   LangChain: ${results.python.langchain ? '✅' : '❌'}`);
        console.log(`   LangGraph: ${results.python.langgraph ? '✅' : '❌'}`);
    } else {
        console.log('⚠️  Python não testado');
    }

    const allPassed = results.react && results.treeOfThoughts;

    console.log('\n' + (allPassed ? '✅' : '❌') + ' Todos os frameworks JavaScript:', 
        allPassed ? 'PASSARAM' : 'FALHARAM');

    if (!allPassed) {
        console.log('\n📝 Para instalar dependências Python:');
        console.log('   pip install -r requirements.txt\n');
    }

    process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
    console.error('\n❌ Erro fatal nos testes:', error);
    process.exit(1);
});




























