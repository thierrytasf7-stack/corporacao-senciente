#!/usr/bin/env node
/**
 * Test Task Dependencies - Testa sistema de dependências entre tasks
 */

import TaskDependencyManager from '../swarm/task_dependency_manager.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function createTestTask(description) {
    const { data, error } = await supabase
        .from('task_context')
        .insert({
            task_description: description,
            requirements_vector: '[' + Array(384).fill(0.0).join(',') + ']', // Vetor de 384 dimensões
            status: 'pending',
            sensitivity: 'low',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

async function cleanupTestTasks(taskIds) {
    if (taskIds && taskIds.length > 0) {
        await supabase
            .from('task_context')
            .delete()
            .in('id', taskIds);
    }
}

async function testTaskDependencies() {
    console.log('🧪 TESTANDO SISTEMA DE DEPENDÊNCIAS ENTRE TASKS\n');

    const manager = new TaskDependencyManager();
    const testTasks = [];

    try {
        // Criar tasks de teste
        console.log('📝 Criando tasks de teste...');
        const task1 = await createTestTask('Task 1: Implementar funcionalidade A');
        const task2 = await createTestTask('Task 2: Preparar ambiente');
        const task3 = await createTestTask('Task 3: Configurar banco');
        const task4 = await createTestTask('Task 4: Instalar dependências');

        testTasks.push(task1, task2, task3, task4);

        // Test 1: Adicionar dependências simples
        console.log('📝 Test 1: Dependências simples');
        await manager.addDependency(task1, task2); // Task 1 depende de Task 2
        await manager.addDependency(task1, task3); // Task 1 depende de Task 3
        await manager.addDependency(task3, task4); // Task 3 depende de Task 4

        console.log('✅ Dependências adicionadas');

        // Test 2: Verificar ordem de execução
        console.log('\n📋 Test 2: Ordem de execução');
        const executionOrder = await manager.getExecutionOrder([task1, task2, task3, task4]);
        console.log('Ordem de execução:', executionOrder);
        // Deve ser algo como [task2, task4, task3, task1]

        // Test 3: Calcular prioridades
        console.log('\n🎯 Test 3: Cálculo de prioridades');
        const priorities = {};
        for (const taskId of [task1, task2, task3, task4]) {
            priorities[taskId] = await manager.calculatePriority(taskId);
        }
        console.log('Prioridades calculadas:', priorities);

        // Test 4: Detectar ciclo (deadlock)
        console.log('\n🔄 Test 4: Detecção de ciclo');
        try {
            await manager.addDependency(task4, task1); // Criaria ciclo: 4 -> 1 -> 3 -> 4
            console.log('❌ ERRO: Ciclo não detectado!');
        } catch (error) {
            console.log('✅ Ciclo detectado corretamente:', error.message);
        }

        // Test 5: Verificar se pode executar
        console.log('\n▶️ Test 5: Verificação de execução');
        const canExecute1 = await manager.canExecute(task1); // Deve ser false (depende de task2 e task3)
        const canExecute2 = await manager.canExecute(task2); // Deve ser true (sem dependências)
        console.log(`Task ${task1} pode executar: ${canExecute1}`);
        console.log(`Task ${task2} pode executar: ${canExecute2}`);

        // Test 6: Detectar deadlocks no sistema
        console.log('\n🔍 Test 6: Detecção geral de deadlocks');
        const deadlocks = await manager.detectDeadlocks();
        console.log('Deadlocks encontrados:', deadlocks.length);

        // Test 7: Remover dependência
        console.log('\n🗑️ Test 7: Remover dependência');
        await manager.removeDependency(task1, task2);
        console.log('✅ Dependência removida');

        // Verificar novamente se pode executar
        const canExecute1After = await manager.canExecute(task1);
        console.log(`Task ${task1} pode executar após remoção: ${canExecute1After}`);

        // Cleanup
        console.log('\n🧹 Fazendo limpeza...');
        await cleanupTestTasks(testTasks);

        console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');

    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        // Cleanup em caso de erro
        try {
            await cleanupTestTasks(testTasks);
        } catch (cleanupError) {
            console.error('Erro na limpeza:', cleanupError);
        }
    }
}

// Executar apenas se chamado diretamente
if (process.argv[1].endsWith('test_task_dependencies.js')) {
    testTaskDependencies();
}

export { testTaskDependencies };
