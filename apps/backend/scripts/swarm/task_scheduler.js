#!/usr/bin/env node
/**
 * Task Scheduler - Agendador Inteligente de Tasks
 *
 * Integra TaskDependencyManager com o sistema de execução,
 * considerando dependências e priorizando corretamente.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import TaskDependencyManager from './task_dependency_manager.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'task_scheduler' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Task Scheduler - Agendador Inteligente
 */
export class TaskScheduler {
    constructor() {
        this.dependencyManager = new TaskDependencyManager();
    }

    /**
     * Obtém próxima task a executar considerando dependências
     * @param {number} limit - Número máximo de tasks a retornar
     */
    async getNextTasks(limit = 5) {
        if (!supabase) throw new Error('Supabase not available');

        // Buscar tasks pendentes
        const { data: pendingTasks, error } = await supabase
            .from('task_context')
            .select('id, task_description, status, priority_score, dependencies, created_at')
            .in('status', ['pending', 'in_progress'])
            .order('priority_score', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(limit * 2); // Pegar mais para filtrar

        if (error) throw error;

        // Filtrar tasks que podem ser executadas (dependências resolvidas)
        const executableTasks = [];
        for (const task of pendingTasks) {
            if (await this.dependencyManager.canExecute(task.id)) {
                executableTasks.push(task);
                if (executableTasks.length >= limit) break;
            }
        }

        // Ordenar por prioridade calculada
        executableTasks.sort((a, b) => {
            // Primeiro por prioridade calculada (maior primeiro)
            if (b.priority_score !== a.priority_score) {
                return b.priority_score - a.priority_score;
            }
            // Depois por data de criação (mais antiga primeiro)
            return new Date(a.created_at) - new Date(b.created_at);
        });

        return executableTasks.slice(0, limit);
    }

    /**
     * Executa tasks em ordem considerando dependências
     * @param {number[]} taskIds - IDs das tasks a executar
     */
    async executeTasksInOrder(taskIds) {
        const executionOrder = await this.dependencyManager.getExecutionOrder(taskIds);

        log.info(`Executando ${executionOrder.length} tasks em ordem:`, executionOrder);

        const results = [];
        for (const taskId of executionOrder) {
            try {
                // Verificar se ainda pode executar (dependências podem ter mudado)
                if (!(await this.dependencyManager.canExecute(taskId))) {
                    log.warn(`Task ${taskId} não pode mais ser executada - dependências não resolvidas`);
                    continue;
                }

                // Marcar como em progresso
                await this.updateTaskStatus(taskId, 'in_progress');

                // Aqui seria chamada a execução real da task
                // Por enquanto, apenas simulamos
                const result = await this.executeTask(taskId);
                results.push({ taskId, success: true, result });

                // Marcar como concluída
                await this.updateTaskStatus(taskId, 'done');

                log.info(`Task ${taskId} executada com sucesso`);

            } catch (error) {
                log.error(`Erro ao executar task ${taskId}:`, error);
                results.push({ taskId, success: false, error: error.message });

                // Marcar como falha (poderia ter status específico para falhas)
                await this.updateTaskStatus(taskId, 'failed');
            }
        }

        return results;
    }

    /**
     * Simula execução de uma task
     * @param {number} taskId
     */
    async executeTask(taskId) {
        // Buscar descrição da task
        const { data: task, error } = await supabase
            .from('task_context')
            .select('task_description')
            .eq('id', taskId)
            .single();

        if (error) throw error;

        log.info(`Executando task ${taskId}: ${task.task_description.substring(0, 50)}...`);

        // Simulação de execução baseada no tipo de task
        if (task.task_description.toLowerCase().includes('test')) {
            // Tasks de teste
            await this.runTestTask(task);
        } else if (task.task_description.toLowerCase().includes('evolu')) {
            // Tasks de evolução
            await this.runEvolutionTask(task);
        } else {
            // Tasks genéricas - apenas log
            log.info(`Task genérica executada: ${task.task_description}`);
        }

        return { executed: true, timestamp: new Date().toISOString() };
    }

    /**
     * Executa task de teste
     */
    async runTestTask(task) {
        log.info('🧪 Executando task de teste...');
        // Simulação de testes
        await new Promise(resolve => setTimeout(resolve, 1000));
        log.info('✅ Teste concluído');
    }

    /**
     * Executa task de evolução
     */
    async runEvolutionTask(task) {
        log.info('🔄 Executando task de evolução...');
        // Simulação de evolução
        await new Promise(resolve => setTimeout(resolve, 2000));
        log.info('✅ Evolução concluída');
    }

    /**
     * Atualiza status de uma task
     * @param {number} taskId
     * @param {string} status
     */
    async updateTaskStatus(taskId, status) {
        const { error } = await supabase
            .from('task_context')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) throw error;
    }

    /**
     * Recalcula todas as prioridades
     */
    async recalculatePriorities() {
        await this.dependencyManager.recalculateAllPriorities();
        log.info('✅ Prioridades recalculadas');
    }

    /**
     * Detecta deadlocks no sistema
     */
    async detectDeadlocks() {
        const deadlocks = await this.dependencyManager.detectDeadlocks();
        if (deadlocks.length > 0) {
            log.warn(`🚨 ${deadlocks.length} deadlocks detectados:`, deadlocks);
            return deadlocks;
        }
        log.info('✅ Nenhum deadlock detectado');
        return [];
    }

    /**
     * Cria uma nova task com dependências opcionais
     * @param {string} description
     * @param {number[]} dependencies - IDs das tasks das quais depende
     */
    async createTask(description, dependencies = []) {
        const { data, error } = await supabase
            .from('task_context')
            .insert({
                task_description: description,
                requirements_vector: '[' + Array(384).fill(0.0).join(',') + ']', // Vetor de 384 dimensões
                status: 'pending',
                dependencies: dependencies,
                sensitivity: 'low',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (error) throw error;

        // Calcular prioridade inicial
        await this.dependencyManager.calculatePriority(data.id);

        log.info(`Task criada: ${description.substring(0, 50)}... (ID: ${data.id})`);
        return data.id;
    }

    /**
     * Obtém estatísticas do sistema de tasks
     */
    async getStats() {
        const { data: tasks, error } = await supabase
            .from('task_context')
            .select('status, priority_score');

        if (error) throw error;

        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            done: tasks.filter(t => t.status === 'done').length,
            failed: tasks.filter(t => t.status === 'failed').length,
            avg_priority: tasks.reduce((sum, t) => sum + (t.priority_score || 0), 0) / tasks.length
        };

        // Detectar deadlocks
        const deadlocks = await this.detectDeadlocks();
        stats.deadlocks = deadlocks.length;

        return stats;
    }
}

export default TaskScheduler;
