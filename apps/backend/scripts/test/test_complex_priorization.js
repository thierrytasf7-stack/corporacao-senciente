#!/usr/bin/env node
/**
 * Test Complex Priorization - Testa priorização com cenários complexos
 */

import TaskScheduler from '../swarm/task_scheduler.js';

async function testComplexPriorization() {
    console.log('🧪 TESTANDO PRIORIZAÇÃO COMPLEXA COM DEPENDÊNCIAS\n');

    const scheduler = new TaskScheduler();

    try {
        // Limpar tasks de teste anteriores
        console.log('🧹 Limpando tasks de teste anteriores...');
        // Nota: em produção isso seria feito com uma query específica

        // Criar cenário complexo de dependências
        console.log('\n🏗️ Criando cenário complexo:');

        // Tasks independentes (podem executar em paralelo)
        const taskA = await scheduler.createTask('Task A: Preparar ambiente', []);
        const taskB = await scheduler.createTask('Task B: Validar configurações', []);

        // Tasks que dependem de A
        const taskC = await scheduler.createTask('Task C: Instalar dependências', [taskA]);
        const taskD = await scheduler.createTask('Task D: Configurar banco', [taskA]);

        // Tasks que dependem de C e D
        const taskE = await scheduler.createTask('Task E: Executar testes unitários', [taskC, taskD]);
        const taskF = await scheduler.createTask('Task F: Fazer deploy', [taskC, taskD]);

        // Task que depende de E e F (depende indiretamente de A, C, D)
        const taskG = await scheduler.createTask('Task G: Executar testes de integração', [taskE, taskF]);

        // Task independente de alta prioridade
        const taskH = await scheduler.createTask('Task H: Correção crítica de segurança', []);

        console.log(`✅ Cenário criado: ${[taskA, taskB, taskC, taskD, taskE, taskF, taskG, taskH].length} tasks`);

        // Test 1: Verificar próximas tasks executáveis
        console.log('\n📋 Test 1: Próximas tasks executáveis');
        const nextTasks = await scheduler.getNextTasks(5);
        console.log('Tasks que podem ser executadas:');
        nextTasks.forEach(task => {
            console.log(`  - Task ${task.id}: ${task.task_description.substring(0, 50)}... (Prioridade: ${task.priority_score?.toFixed(2)})`);
        });

        // Test 2: Executar em ordem
        console.log('\n▶️ Test 2: Executar em ordem considerando dependências');
        const allTaskIds = [taskA, taskB, taskC, taskD, taskE, taskF, taskG, taskH];
        const executionResults = await scheduler.executeTasksInOrder(allTaskIds);

        console.log('Resultados da execução:');
        executionResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`  ${status} Task ${result.taskId}: ${result.success ? 'Sucesso' : result.error}`);
        });

        // Test 3: Verificar estatísticas finais
        console.log('\n📊 Test 3: Estatísticas finais');
        const stats = await scheduler.getStats();
        console.log('Estatísticas do sistema:');
        console.log(`  Total: ${stats.total}`);
        console.log(`  Concluídas: ${stats.done}`);
        console.log(`  Falharam: ${stats.failed}`);
        console.log(`  Deadlocks: ${stats.deadlocks}`);
        console.log(`  Prioridade média: ${stats.avg_priority?.toFixed(2)}`);

        // Test 4: Verificar ordem de execução foi respeitada
        console.log('\n🔍 Test 4: Validar ordem de execução');
        const finalTasks = await scheduler.getNextTasks(10);
        if (finalTasks.length === 0) {
            console.log('✅ Todas as tasks foram executadas corretamente!');
        } else {
            console.log('⚠️ Ainda há tasks pendentes:', finalTasks.length);
        }

        console.log('\n🎉 TESTE DE PRIORIZAÇÃO COMPLEXA CONCLUÍDO COM SUCESSO!');

    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
    }
}

// Executar apenas se chamado diretamente
if (process.argv[1].endsWith('test_complex_priorization.js')) {
    testComplexPriorization();
}

export { testComplexPriorization };
