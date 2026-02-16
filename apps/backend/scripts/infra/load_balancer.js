#!/usr/bin/env node

/**
 * Load Balancer - Sistema de Balanceamento Inteligente
 * Corporação Senciente - Fase 0.5
 *
 * Distribuição inteligente de workloads baseada em:
 * - Especialização dos PCs
 * - Recursos disponíveis (CPU, memória, disco)
 * - Carga atual e histórica
 * - Latência de rede
 * - Confiabilidade dos PCs
 */

import { createClient } from '@supabase/supabase-js';

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const BALANCER_UPDATE_INTERVAL = 30000; // 30 segundos
const METRICS_HISTORY_SIZE = 100; // Manter histórico de 100 medições

class LoadBalancer {
    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        this.pcMetrics = new Map(); // hostname -> metrics history
        this.taskAssignments = new Map(); // task_id -> pc_hostname
        this.specializationMap = new Map(); // specialization -> [hostnames]
        this.failoverHistory = new Map(); // hostname -> failover count
        this.balancingStrategies = {
            round_robin: this.roundRobinBalance.bind(this),
            least_loaded: this.leastLoadedBalance.bind(this),
            specialization_priority: this.specializationPriorityBalance.bind(this),
            resource_based: this.resourceBasedBalance.bind(this),
            adaptive: this.adaptiveBalance.bind(this)
        };
    }

    /**
     * Carregar informações dos PCs ativos
     */
    async loadActivePCs() {
        try {
            const { data: pcs, error } = await this.supabase
                .from('pcs')
                .select('*')
                .eq('status', 'active')
                .eq('ssh_status', 'online');

            if (error) throw error;

            // Agrupar por especialização
            this.specializationMap.clear();
            pcs.forEach(pc => {
                if (!this.specializationMap.has(pc.specialization)) {
                    this.specializationMap.set(pc.specialization, []);
                }
                this.specializationMap.get(pc.specialization).push(pc.hostname);
            });

            console.log(`📊 Load Balancer: ${pcs.length} PCs ativos carregados`);
            return pcs;

        } catch (error) {
            console.error('Erro ao carregar PCs ativos:', error);
            return [];
        }
    }

    /**
     * Atualizar métricas de um PC
     */
    updatePCMetrics(hostname, metrics) {
        if (!this.pcMetrics.has(hostname)) {
            this.pcMetrics.set(hostname, []);
        }

        const history = this.pcMetrics.get(hostname);
        history.push({
            ...metrics,
            timestamp: new Date().toISOString()
        });

        // Manter apenas histórico recente
        if (history.length > METRICS_HISTORY_SIZE) {
            history.splice(0, history.length - METRICS_HISTORY_SIZE);
        }
    }

    /**
     * Obter métricas atuais de um PC
     */
    getPCMetrics(hostname) {
        const history = this.pcMetrics.get(hostname);
        if (!history || history.length === 0) {
            return null;
        }

        // Retornar métricas mais recentes
        return history[history.length - 1];
    }

    /**
     * Calcular score de carga de um PC
     */
    calculateLoadScore(hostname) {
        const metrics = this.getPCMetrics(hostname);
        if (!metrics) {
            return 0.5; // Score neutro se não há métricas
        }

        // Fatores de carga (0-1, onde 1 é máxima carga)
        const cpuLoad = (metrics.cpu?.usage_percent || 0) / 100;
        const memoryLoad = (metrics.memory?.used || 0) / (metrics.memory?.total || 1);
        const networkLoad = Math.min(metrics.network?.connections || 0, 100) / 100;

        // Score composto (média ponderada)
        const weights = { cpu: 0.4, memory: 0.4, network: 0.2 };
        const loadScore = (
            cpuLoad * weights.cpu +
            memoryLoad * weights.memory +
            networkLoad * weights.network
        );

        return Math.min(loadScore, 1);
    }

    /**
     * Calcular score de confiabilidade de um PC
     */
    calculateReliabilityScore(hostname) {
        const failoverCount = this.failoverHistory.get(hostname) || 0;
        const baseScore = 1.0;

        // Penalizar PCs com histórico de falhas
        const penalty = Math.min(failoverCount * 0.1, 0.5);
        return Math.max(baseScore - penalty, 0.1);
    }

    /**
     * Calcular score de especialização para uma tarefa
     */
    calculateSpecializationScore(hostname, taskType, pcSpecialization) {
        // Mapeamento de tipos de tarefa para especializações ideais
        const taskSpecializationMap = {
            // Brain tasks
            'decision_making': 'brain',
            'coordination': 'brain',
            'strategy': 'brain',

            // Business tasks
            'marketing': 'business',
            'sales': 'business',
            'finance': 'business',
            'content_generation': 'business',

            // Technical tasks
            'development': 'technical',
            'testing': 'technical',
            'deployment': 'technical',
            'code_review': 'technical',

            // Operations tasks
            'monitoring': 'operations',
            'security': 'operations',
            'maintenance': 'operations',
            'backup': 'operations'
        };

        const idealSpecialization = taskSpecializationMap[taskType] || 'general';

        if (pcSpecialization === idealSpecialization) {
            return 1.0; // Perfeito match
        } else if (pcSpecialization === 'brain' && ['coordination', 'strategy'].includes(taskType)) {
            return 0.9; // Brain pode fazer tarefas estratégicas
        } else if (idealSpecialization === 'general') {
            return 0.7; // Qualquer PC pode fazer tarefas gerais
        } else {
            return 0.3; // Match ruim
        }
    }

    /**
     * Estratégia: Round Robin simples
     */
    roundRobinBalance(availablePCs, task) {
        if (availablePCs.length === 0) return null;

        // Usar timestamp como seed para distribuição
        const index = Math.floor(Date.now() / 1000) % availablePCs.length;
        return availablePCs[index];
    }

    /**
     * Estratégia: Menor carga
     */
    leastLoadedBalance(availablePCs, task) {
        if (availablePCs.length === 0) return null;

        let bestPC = null;
        let bestScore = Infinity;

        for (const pc of availablePCs) {
            const loadScore = this.calculateLoadScore(pc.hostname);
            if (loadScore < bestScore) {
                bestScore = loadScore;
                bestPC = pc;
            }
        }

        return bestPC;
    }

    /**
     * Estratégia: Prioridade de especialização
     */
    specializationPriorityBalance(availablePCs, task) {
        if (availablePCs.length === 0) return null;

        let bestPC = null;
        let bestScore = -1;

        for (const pc of availablePCs) {
            const specScore = this.calculateSpecializationScore(
                pc.hostname,
                task.type,
                pc.specialization
            );

            if (specScore > bestScore) {
                bestScore = specScore;
                bestPC = pc;
            }
        }

        return bestPC;
    }

    /**
     * Estratégia: Baseada em recursos
     */
    resourceBasedBalance(availablePCs, task) {
        if (availablePCs.length === 0) return null;

        let bestPC = null;
        let bestScore = -1;

        for (const pc of availablePCs) {
            const loadScore = this.calculateLoadScore(pc.hostname);
            const reliabilityScore = this.calculateReliabilityScore(pc.hostname);
            const specScore = this.calculateSpecializationScore(
                pc.hostname,
                task.type,
                pc.specialization
            );

            // Score composto: especialização + confiabilidade - carga
            const totalScore = (specScore * 0.5) + (reliabilityScore * 0.3) - (loadScore * 0.2);

            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestPC = pc;
            }
        }

        return bestPC;
    }

    /**
     * Estratégia: Adaptativa (inteligente)
     */
    adaptiveBalance(availablePCs, task) {
        if (availablePCs.length === 0) return null;

        // Análise da tarefa
        const taskComplexity = this.analyzeTaskComplexity(task);
        const taskUrgency = task.priority || 'normal';

        // Estratégia baseada na complexidade e urgência
        if (taskUrgency === 'critical') {
            // Tarefas críticas: usar PC mais confiável com menor carga
            return this.resourceBasedBalance(availablePCs, task);
        } else if (taskComplexity === 'high') {
            // Tarefas complexas: priorizar especialização
            return this.specializationPriorityBalance(availablePCs, task);
        } else {
            // Tarefas simples: balanceamento simples
            return this.leastLoadedBalance(availablePCs, task);
        }
    }

    /**
     * Analisar complexidade da tarefa
     */
    analyzeTaskComplexity(task) {
        // Análise baseada no tipo e parâmetros da tarefa
        const complexTasks = [
            'development', 'testing', 'deployment', 'strategy',
            'security_audit', 'performance_analysis'
        ];

        if (complexTasks.includes(task.type)) {
            return 'high';
        }

        // Verificar se tarefa tem muitos parâmetros ou dados grandes
        const paramCount = Object.keys(task).length;
        if (paramCount > 10) {
            return 'high';
        }

        return 'low';
    }

    /**
     * Balancear tarefa para PC adequado
     */
    async balanceTask(task, strategy = 'adaptive') {
        console.log(`⚖️  Balanceando tarefa: ${task.type} (estratégia: ${strategy})`);

        // Carregar PCs ativos
        const activePCs = await this.loadActivePCs();

        if (activePCs.length === 0) {
            console.error('❌ Nenhum PC ativo disponível para balanceamento');
            return null;
        }

        // Filtrar PCs elegíveis (baseado em especialização se especificada)
        let eligiblePCs = activePCs;
        if (task.required_specialization) {
            eligiblePCs = activePCs.filter(pc => pc.specialization === task.required_specialization);

            if (eligiblePCs.length === 0) {
                console.warn(`⚠️  Nenhum PC com especialização ${task.required_specialization} disponível`);
                // Fallback: permitir qualquer PC mas com penalidade
                eligiblePCs = activePCs;
            }
        }

        // Aplicar estratégia de balanceamento
        const balancer = this.balancingStrategies[strategy] || this.balancingStrategies.adaptive;
        const selectedPC = balancer(eligiblePCs, task);

        if (!selectedPC) {
            console.error('❌ Nenhum PC selecionado pelo balanceador');
            return null;
        }

        // Registrar assignment
        this.taskAssignments.set(task.id || `task_${Date.now()}`, selectedPC.hostname);

        console.log(`✅ Tarefa ${task.type} balanceada para: ${selectedPC.hostname} (${selectedPC.specialization})`);

        return {
            pc: selectedPC,
            strategy: strategy,
            score: this.calculateLoadScore(selectedPC.hostname),
            specialization_match: this.calculateSpecializationScore(
                selectedPC.hostname,
                task.type,
                selectedPC.specialization
            )
        };
    }

    /**
     * Executar failover para tarefa
     */
    async failoverTask(taskId, failedPC) {
        console.log(`🔄 Executando failover para tarefa ${taskId} (PC falhou: ${failedPC})`);

        // Registrar falha
        const currentCount = this.failoverHistory.get(failedPC) || 0;
        this.failoverHistory.set(failedPC, currentCount + 1);

        // Remover assignment antigo
        this.taskAssignments.delete(taskId);

        // Recriar tarefa para rebalanceamento
        const task = { id: taskId, type: 'unknown', failover: true };

        // Tentar balancear novamente (excluindo PC que falhou)
        const result = await this.balanceTask(task);

        if (result) {
            console.log(`✅ Failover bem-sucedido: ${result.pc.hostname}`);
        } else {
            console.error(`❌ Failover falhou para tarefa ${taskId}`);
        }

        return result;
    }

    /**
     * Obter estatísticas de balanceamento
     */
    getBalancingStats() {
        const pcStats = {};

        // Calcular estatísticas por PC
        for (const [hostname, history] of this.pcMetrics) {
            if (history.length === 0) continue;

            const latest = history[history.length - 1];
            pcStats[hostname] = {
                current_load: this.calculateLoadScore(hostname),
                cpu_usage: latest.cpu?.usage_percent || 0,
                memory_usage: (latest.memory?.used / latest.memory?.total) * 100 || 0,
                task_count: Array.from(this.taskAssignments.values())
                    .filter(pc => pc === hostname).length,
                failover_count: this.failoverHistory.get(hostname) || 0
            };
        }

        return {
            total_pcs: this.pcMetrics.size,
            active_tasks: this.taskAssignments.size,
            pc_stats: pcStats,
            specialization_distribution: Object.fromEntries(this.specializationMap)
        };
    }

    /**
     * Simular distribuição de carga
     */
    async simulateLoadDistribution(tasks) {
        console.log(`🎭 Simulando distribuição de ${tasks.length} tarefas...`);

        const results = [];
        const assignments = new Map();

        for (const task of tasks) {
            const result = await this.balanceTask(task);
            if (result) {
                const pc = result.pc.hostname;
                if (!assignments.has(pc)) {
                    assignments.set(pc, []);
                }
                assignments.get(pc).push(task.type);
                results.push(result);
            }
        }

        // Mostrar distribuição
        console.log('\n📊 Distribuição simulada:');
        for (const [pc, taskTypes] of assignments) {
            console.log(`  ${pc}: ${taskTypes.length} tarefas (${taskTypes.join(', ')})`);
        }

        return {
            assignments: Object.fromEntries(assignments),
            stats: this.getBalancingStats()
        };
    }

    /**
     * Iniciar monitoramento contínuo
     */
    startMonitoring() {
        console.log('📈 Iniciando monitoramento de balanceamento...');

        setInterval(async () => {
            await this.loadActivePCs();

            // Log estatísticas periodicamente
            const stats = this.getBalancingStats();
            console.log(`📊 Balanceamento - ${stats.total_pcs} PCs, ${stats.active_tasks} tarefas ativas`);

        }, BALANCER_UPDATE_INTERVAL);
    }

    /**
     * Limpar histórico antigo
     */
    cleanupHistory() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas

        // Limpar métricas antigas
        for (const [hostname, history] of this.pcMetrics) {
            const recentHistory = history.filter(m =>
                new Date(m.timestamp).getTime() > cutoffTime
            );
            this.pcMetrics.set(hostname, recentHistory);
        }

        console.log('🧹 Histórico antigo limpo');
    }
}

// CLI Interface
async function main() {
    const balancer = new LoadBalancer();

    // Carregar dados iniciais
    await balancer.loadActivePCs();

    const command = process.argv[2];

    switch (command) {
        case 'balance':
            const task = {
                id: `test_${Date.now()}`,
                type: process.argv[3] || 'general',
                priority: process.argv[4] || 'normal'
            };
            const result = await balancer.balanceTask(task, process.argv[5] || 'adaptive');
            console.log('Resultado do balanceamento:');
            console.log(JSON.stringify(result, null, 2));
            break;

        case 'simulate':
            const tasks = [
                { id: 'task1', type: 'marketing', priority: 'normal' },
                { id: 'task2', type: 'development', priority: 'high' },
                { id: 'task3', type: 'monitoring', priority: 'low' },
                { id: 'task4', type: 'testing', priority: 'normal' },
                { id: 'task5', type: 'content_generation', priority: 'normal' }
            ];
            const simulation = await balancer.simulateLoadDistribution(tasks);
            console.log('Simulação concluída');
            break;

        case 'stats':
            const stats = balancer.getBalancingStats();
            console.log('Estatísticas do Load Balancer:');
            console.log(JSON.stringify(stats, null, 2));
            break;

        case 'strategies':
            console.log('Estratégias disponíveis:');
            console.log('  round_robin - Distribuição cíclica simples');
            console.log('  least_loaded - PC com menor carga atual');
            console.log('  specialization_priority - Melhor especialização para tarefa');
            console.log('  resource_based - Baseado em recursos + confiabilidade');
            console.log('  adaptive - Estratégia inteligente adaptativa');
            break;

        default:
            console.log('Comandos disponíveis:');
            console.log('  balance [task-type] [priority] [strategy] - Balancear tarefa de teste');
            console.log('  simulate - Simular distribuição de carga');
            console.log('  stats - Estatísticas do balanceamento');
            console.log('  strategies - Listar estratégias disponíveis');
            console.log('');
            console.log('Exemplos:');
            console.log('  node load_balancer.js balance marketing high adaptive');
            console.log('  node load_balancer.js simulate');
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export default LoadBalancer;






