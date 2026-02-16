#!/usr/bin/env node
/**
 * Task Dependency Manager - Gerenciador de Dependências entre Tasks
 *
 * Implementa sistema de dependências (task A depende de task B)
 * e detecção de deadlocks (ciclos de dependência).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'task_dependency_manager' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Task Dependency Manager
 */
export class TaskDependencyManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Adiciona dependência entre tasks
     * @param {number} taskId - ID da task dependente
     * @param {number} dependencyId - ID da task da qual depende
     */
    async addDependency(taskId, dependencyId) {
        if (!supabase) throw new Error('Supabase not available');

        // Verificar se as tasks existem
        const { data: task } = await supabase
            .from('task_context')
            .select('id')
            .eq('id', taskId)
            .single();

        const { data: dependency } = await supabase
            .from('task_context')
            .select('id')
            .eq('id', dependencyId)
            .single();

        if (!task || !dependency) {
            throw new Error('Task ou dependência não encontrada');
        }

        // Verificar se cria ciclo
        if (await this.wouldCreateCycle(taskId, dependencyId)) {
            throw new Error('Dependência criaria um ciclo (deadlock)');
        }

        // Adicionar dependência
        const { data: currentDeps } = await supabase
            .from('task_context')
            .select('dependencies')
            .eq('id', taskId)
            .single();

        const newDeps = [...(currentDeps?.dependencies || []), dependencyId];

        const { error } = await supabase
            .from('task_context')
            .update({
                dependencies: newDeps,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) throw error;

        // Limpar cache
        this.cache.clear();

        log.info(`Dependência adicionada: Task ${taskId} depende de ${dependencyId}`);
        return true;
    }

    /**
     * Remove dependência entre tasks
     * @param {number} taskId - ID da task dependente
     * @param {number} dependencyId - ID da task da qual depende
     */
    async removeDependency(taskId, dependencyId) {
        if (!supabase) throw new Error('Supabase not available');

        const { data: currentDeps } = await supabase
            .from('task_context')
            .select('dependencies')
            .eq('id', taskId)
            .single();

        if (!currentDeps?.dependencies) return false;

        const newDeps = currentDeps.dependencies.filter(id => id !== dependencyId);

        const { error } = await supabase
            .from('task_context')
            .update({
                dependencies: newDeps,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) throw error;

        // Limpar cache
        this.cache.clear();

        log.info(`Dependência removida: Task ${taskId} não depende mais de ${dependencyId}`);
        return true;
    }

    /**
     * Verifica se adicionar uma dependência criaria um ciclo
     * @param {number} taskId - Task que teria a dependência
     * @param {number} dependencyId - Task da qual dependeria
     */
    async wouldCreateCycle(taskId, dependencyId) {
        // Usar DFS para detectar ciclo
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = async (currentId, targetId) => {
            visited.add(currentId);
            recursionStack.add(currentId);

            // Se encontramos o target no caminho, há ciclo
            if (currentId === targetId) {
                return true;
            }

            // Pegar dependências desta task
            const deps = await this.getDependencies(currentId);

            for (const depId of deps) {
                if (!visited.has(depId)) {
                    if (await hasCycle(depId, targetId)) {
                        return true;
                    }
                } else if (recursionStack.has(depId)) {
                    // Se já visitamos e está na stack de recursão, há ciclo
                    return true;
                }
            }

            recursionStack.delete(currentId);
            return false;
        };

        return await hasCycle(dependencyId, taskId);
    }

    /**
     * Obtém todas as dependências de uma task
     * @param {number} taskId
     */
    async getDependencies(taskId) {
        if (!supabase) throw new Error('Supabase not available');

        const cacheKey = `deps_${taskId}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const { data, error } = await supabase
            .from('task_context')
            .select('dependencies')
            .eq('id', taskId)
            .single();

        if (error) throw error;

        const deps = data?.dependencies || [];

        this.cache.set(cacheKey, {
            data: deps,
            timestamp: Date.now()
        });

        return deps;
    }

    /**
     * Obtém todas as tasks que dependem de uma task específica
     * @param {number} taskId
     */
    async getDependents(taskId) {
        if (!supabase) throw new Error('Supabase not available');

        const cacheKey = `dependents_${taskId}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const { data, error } = await supabase
            .from('task_context')
            .select('id, dependencies')
            .not('dependencies', 'is', null);

        if (error) throw error;

        const dependents = data
            .filter(task => task.dependencies?.includes(taskId))
            .map(task => task.id);

        this.cache.set(cacheKey, {
            data: dependents,
            timestamp: Date.now()
        });

        return dependents;
    }

    /**
     * Verifica se uma task pode ser executada (todas dependências resolvidas)
     * @param {number} taskId
     */
    async canExecute(taskId) {
        const deps = await this.getDependencies(taskId);

        if (deps.length === 0) return true;

        // Verificar se todas as dependências estão concluídas
        const { data, error } = await supabase
            .from('task_context')
            .select('id, status')
            .in('id', deps);

        if (error) throw error;

        return data.every(task => task.status === 'done');
    }

    /**
     * Calcula prioridade baseada em dependências
     * Tasks com mais dependentes têm maior prioridade
     * @param {number} taskId
     */
    async calculatePriority(taskId) {
        const dependents = await this.getDependents(taskId);
        const depth = await this.getDependencyDepth(taskId);

        // Prioridade = (número de dependentes * 0.3) + (profundidade * 0.2) + 0.5
        const priority = Math.min(1.0, 0.5 + (dependents.length * 0.3) + (depth * 0.2));

        // Atualizar no banco
        const { error } = await supabase
            .from('task_context')
            .update({
                priority_score: priority,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) throw error;

        return priority;
    }

    /**
     * Calcula profundidade máxima da árvore de dependências
     * @param {number} taskId
     * @param {Set} visited - Para evitar ciclos
     */
    async getDependencyDepth(taskId, visited = new Set()) {
        if (visited.has(taskId)) return 0; // Evitar ciclos
        visited.add(taskId);

        const deps = await this.getDependencies(taskId);

        if (deps.length === 0) return 0;

        let maxDepth = 0;
        for (const depId of deps) {
            const depth = await this.getDependencyDepth(depId, new Set(visited));
            maxDepth = Math.max(maxDepth, depth);
        }

        return maxDepth + 1;
    }

    /**
     * Obtém ordem de execução considerando dependências
     * @param {number[]} taskIds
     */
    async getExecutionOrder(taskIds) {
        const graph = new Map();
        const inDegree = new Map();

        // Inicializar
        for (const taskId of taskIds) {
            graph.set(taskId, []);
            inDegree.set(taskId, 0);
        }

        // Construir grafo e calcular graus de entrada
        for (const taskId of taskIds) {
            const deps = await this.getDependencies(taskId);
            for (const depId of deps) {
                if (taskIds.includes(depId)) {
                    graph.get(depId).push(taskId);
                    inDegree.set(taskId, inDegree.get(taskId) + 1);
                }
            }
        }

        // Algoritmo de Kahn (Topological Sort)
        const queue = [];
        const result = [];

        // Adicionar tasks sem dependências
        for (const [taskId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(taskId);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);

            // Para cada task que depende desta
            for (const dependent of graph.get(current)) {
                inDegree.set(dependent, inDegree.get(dependent) - 1);
                if (inDegree.get(dependent) === 0) {
                    queue.push(dependent);
                }
            }
        }

        // Se result tem menos elementos que taskIds, há ciclo
        if (result.length !== taskIds.length) {
            throw new Error('Ciclo detectado nas dependências');
        }

        return result;
    }

    /**
     * Recalcula prioridades para todas as tasks
     */
    async recalculateAllPriorities() {
        if (!supabase) throw new Error('Supabase not available');

        const { data: tasks, error } = await supabase
            .from('task_context')
            .select('id')
            .neq('status', 'done');

        if (error) throw error;

        for (const task of tasks) {
            await this.calculatePriority(task.id);
        }

        log.info(`Prioridades recalculadas para ${tasks.length} tasks`);
    }

    /**
     * Detecta deadlocks em todo o sistema
     */
    async detectDeadlocks() {
        if (!supabase) throw new Error('Supabase not available');

        const { data: tasks, error } = await supabase
            .from('task_context')
            .select('id, dependencies')
            .neq('status', 'done');

        if (error) throw error;

        const deadlocks = [];

        // Para cada task, verificar se há ciclo
        for (const task of tasks) {
            for (const depId of task.dependencies || []) {
                try {
                    if (await this.wouldCreateCycle(task.id, depId)) {
                        deadlocks.push({
                            taskId: task.id,
                            problematicDep: depId
                        });
                    }
                } catch (error) {
                    log.warn(`Erro ao verificar deadlock para task ${task.id}:`, error);
                }
            }
        }

        return deadlocks;
    }
}

export default TaskDependencyManager;
