#!/usr/bin/env node
/**
 * Letta - A Consciência
 * 
 * Gerenciador de estado e fluxo que substitui Jira.
 * Mantém rastro de "quem somos", "onde paramos" e "qual o próximo passo evolutivo".
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { embed } from '../utils/embedding.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'letta' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Letta - Gerenciador de Estado e Fluxo GLOBAL
 */
class Letta {
    constructor() {
        this.currentState = null; // Cache apenas como fallback
        this.stateCacheTimeout = 30 * 1000; // 30 segundos (força sincronização frequente)
        this.forceGlobalSync = true; // Sempre forçar sincronização global
    }

    /**
     * Retorna estado atual GLOBAL (sempre sincronizado)
     *
     * @returns {Promise<object>} Estado atual do banco
     */
    async getCurrentState() {
        // FORÇA SINCRONIZAÇÃO GLOBAL: Sempre consultar banco primeiro
        log.info('🔄 Forçando sincronização global de estado');

        if (!supabase) {
            log.warn('Supabase not available, returning default state');
            return this.getDefaultState();
        }

        try {
            // Buscar estado DIRETAMENTE do banco (sempre fresh)
            const { data: tasks, error } = await supabase
                .from('task_context')
                .select('*')
                .neq('status', 'done')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                log.error('Error getting current global state', { error: error.message });
                return this.getDefaultState();
            }

            // Construir estado atual do banco
            const state = {
                current_phase: this.determineCurrentPhase(tasks || []),
                last_task: tasks && tasks.length > 0 ? tasks[0] : null,
                next_steps: this.determineNextSteps(tasks || []),
                blockages: this.identifyBlockages(tasks || []),
                evolution_history: await this.getEvolutionHistory(5),
                timestamp: new Date().toISOString(),
                synced_from_global: true // Flag de sincronização global
            };

            // Cache apenas como fallback de emergência
            if (this.forceGlobalSync) {
                this.currentState = {
                    state: state,
                    timestamp: Date.now()
                };
            }

            log.info('✅ Estado global sincronizado', {
                tasksCount: tasks?.length || 0,
                phase: state.current_phase
            });

            return state;

        } catch (err) {
            log.error('Exception in global state sync', { error: err.message });

            // Fallback: tentar cache se falhar completamente
            if (this.forceGlobalSync && this.currentState) {
                log.warn('Usando estado cacheado como fallback');
                return this.currentState.state;
            }

            return this.getDefaultState();
        }
    }

    /**
     * Retorna próximo passo evolutivo
     * 
     * @returns {Promise<object>} Próximo passo
     */
    async getNextEvolutionStep() {
        const state = await this.getCurrentState();

        if (state.next_steps && state.next_steps.length > 0) {
            return state.next_steps[0];
        }

        // Se não há próximos passos definidos, sugerir baseado no estado
        return {
            action: 'continue_evolution',
            description: 'Continuar evolução do sistema',
            priority: 'medium',
            estimated_effort: 'unknown'
        };
    }

    /**
     * Atualiza estado após tarefa
     * 
     * @param {string} task - Descrição da tarefa
     * @param {string} status - Status (planning, coding, review, done)
     * @param {object} metadata - Metadados adicionais
     * @returns {Promise<boolean>} Sucesso
     */
    async updateState(task, status, metadata = {}) {
        if (!supabase) {
            log.warn('Supabase not available, state not updated');
            return false;
        }

        try {
            // Criar embedding da task
            const taskEmbedding = await embed(task);
            const embeddingStr = `[${taskEmbedding.join(',')}]`;

            // Verificar se task já existe
            const { data: existingTask, error: selectError } = await supabase
                .from('task_context')
                .select('id, status')
                .eq('task_description', task)
                .single();

            let result;
            if (existingTask) {
                // Atualizar task existente
                result = await supabase
                    .from('task_context')
                    .update({
                        requirements_vector: embeddingStr,
                        status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingTask.id);
            } else {
                // Inserir nova task
                result = await supabase
                    .from('task_context')
                    .insert({
                        task_description: task,
                        requirements_vector: embeddingStr,
                        status: status,
                        updated_at: new Date().toISOString()
                    });
            }

            if (result.error) {
                log.error('Error updating state', { error: result.error.message });
                return false;
            }

            // Invalidar cache
            this.currentState = null;

            log.info('State updated', { task: task.substring(0, 50), status, action: existingTask ? 'updated' : 'inserted' });
            return true;
        } catch (err) {
            log.error('Exception updating state', { error: err.message });
            return false;
        }
    }

    /**
     * Registra bloqueio na memória de curto prazo
     * 
     * @param {string} task - Tarefa bloqueada
     * @param {string} reason - Razão do bloqueio
     * @returns {Promise<boolean>} Sucesso
     */
    async registerBlockage(task, reason) {
        log.info('Registering blockage', { task: task.substring(0, 50), reason });

        // Atualizar estado com bloqueio
        const state = await this.getCurrentState();
        state.blockages = state.blockages || [];
        state.blockages.push({
            task: task,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        // Atualizar task_context com status de bloqueio
        return await this.updateState(task, 'blocked', {
            blockage_reason: reason,
            blocked_at: new Date().toISOString()
        });
    }

    /**
     * Retorna histórico de evolução
     * 
     * @param {number} limit - Limite de resultados
     * @returns {Promise<array>} Histórico
     */
    async getEvolutionHistory(limit = 10) {
        if (!supabase) {
            return [];
        }

        try {
            // Buscar tasks concluídas ordenadas por data
            const { data, error } = await supabase
                .from('task_context')
                .select('*')
                .eq('status', 'done')
                .order('updated_at', { ascending: false })
                .limit(limit);

            if (error) {
                log.error('Error getting evolution history', { error: error.message });
                return [];
            }

            return (data || []).map(task => ({
                task: task.task_description,
                completed_at: task.updated_at,
                status: task.status
            }));
        } catch (err) {
            log.error('Exception getting evolution history', { error: err.message });
            return [];
        }
    }

    /**
     * Determina fase atual baseado em tasks
     */
    determineCurrentPhase(tasks) {
        if (tasks.length === 0) {
            return 'initialization';
        }

        // Analisar tasks para determinar fase
        const hasPlanning = tasks.some(t => t.status === 'planning');
        const hasCoding = tasks.some(t => t.status === 'coding');
        const hasReview = tasks.some(t => t.status === 'review');

        if (hasReview) {
            return 'review';
        } else if (hasCoding) {
            return 'coding';
        } else if (hasPlanning) {
            return 'planning';
        }

        return 'execution';
    }

    /**
     * Determina próximos passos baseado em tasks
     */
    determineNextSteps(tasks) {
        const nextSteps = [];

        // Priorizar tasks por status
        const planningTasks = tasks.filter(t => t.status === 'planning');
        const codingTasks = tasks.filter(t => t.status === 'coding');

        if (planningTasks.length > 0) {
            nextSteps.push({
                action: 'plan_task',
                description: planningTasks[0].task_description,
                priority: 'high',
                estimated_effort: 'medium'
            });
        } else if (codingTasks.length > 0) {
            nextSteps.push({
                action: 'execute_task',
                description: codingTasks[0].task_description,
                priority: 'high',
                estimated_effort: 'high'
            });
        }

        return nextSteps;
    }

    /**
     * Identifica bloqueios nas tasks
     */
    identifyBlockages(tasks) {
        const blockages = [];

        // Tasks bloqueadas
        const blockedTasks = tasks.filter(t => t.status === 'blocked');
        for (const task of blockedTasks) {
            blockages.push({
                task: task.task_description,
                reason: 'Task marcada como bloqueada',
                timestamp: task.updated_at
            });
        }

        // Tasks antigas sem progresso (possível bloqueio)
        const now = new Date();
        const oldTasks = tasks.filter(t => {
            if (t.status === 'done') return false; // Não considerar tasks concluídas
            const updated = new Date(t.updated_at || t.created_at);
            const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate > 7; // Mais de 7 dias sem atualização
        });

        for (const task of oldTasks) {
            blockages.push({
                task: task.task_description,
                reason: 'Task sem progresso há mais de 7 dias',
                timestamp: task.updated_at || task.created_at
            });
        }

        return blockages;
    }

    /**
     * Estado padrão (fallback)
     */
    getDefaultState() {
        return {
            current_phase: 'initialization',
            last_task: null,
            next_steps: [{
                action: 'initialize_system',
                description: 'Inicializar sistema',
                priority: 'high',
                estimated_effort: 'low'
            }],
            blockages: [],
            evolution_history: [],
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton
let lettaInstance = null;

export function getLetta() {
    if (!lettaInstance) {
        lettaInstance = new Letta();
    }
    return lettaInstance;
}

export default Letta;



