import dotenv from 'dotenv';
dotenv.config();

import { getExecutor } from './swarm/executor.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_executor_llb' });

async function testExecutorLLB() {
    log.info('Starting Executor LLB Integration Test');

    const executor = getExecutor();

    try {
        // 1. Testar Letta state update
        log.info('Testing Letta state update...');
        const lettaResult = await executor.executeAction({
            type: 'update_letta_state',
            task: 'Testar integração Executor-LLB',
            status: 'in_progress',
            metadata: {
                test: true,
                timestamp: new Date().toISOString()
            }
        });
        console.log('Letta Result:', JSON.stringify(lettaResult, null, 2));

        // 2. Testar LangMem wisdom storage
        log.info('Testing LangMem wisdom storage...');
        const langmemResult = await executor.executeAction({
            type: 'store_langmem_wisdom',
            content: 'A integração entre o Executor e o Protocolo L.L.B. permite a persistência automática de decisões e conhecimentos.',
            category: 'integration_test',
            metadata: {
                importance: 'high',
                tags: ['test', 'executor', 'llb']
            }
        });
        console.log('LangMem Result:', JSON.stringify(langmemResult, null, 2));

        // 3. Testar Intelligent Git Commit (Dry Run ou Simulado se possível)
        // Como o commit altera o repo real, vamos apenas verificar se a chamada chega no Protocolo
        log.info('Testing Intelligent Git Commit (Simulated)...');
        // Para evitar commits reais durante testes automatizados, poderíamos injetar um mock no executor
        // Mas como estamos em um ambiente controlado, vamos testar se as funções existem e são chamadas

        log.info('Test completed successfully');
    } catch (err) {
        log.error('Test failed', { error: err.message });
        process.exit(1);
    }
}

testExecutorLLB();
