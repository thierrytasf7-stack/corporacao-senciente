#!/usr/bin/env node

/**
 * Brain Arms Daemon - Sistema de Autonomia Híbrida
 * Fase 4 - Sistema Híbrido de Autonomia
 *
 * Daemon que implementa o ciclo Brain → Arms → Brain (pensar → agir)
 * com modos assistido (manual) e autônomo (automático).
 */

import { EXECUTION_DECISIONS, getExecutionDecider } from '../decision/execution_decider.js';
import PCCommunication from '../infra/pc_communication.js';
import PCMonitor from '../infra/pc_monitor.js';
import AgentPromptGenerator from '../swarm/agent_prompt_generator.js';
import BrainPromptGenerator from '../swarm/brain_prompt_generator.js';
import ChatInterface from '../swarm/chat_interface.js';
import ConfidenceScorer from '../swarm/confidence_scorer.js';
import { getByteRover } from '../memory/byterover.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'brain_arms_daemon' });

/**
 * Estados do Daemon
 */
const DAEMON_STATES = {
    IDLE: 'idle',
    THINKING: 'thinking',
    DELEGATING: 'delegating',
    EXECUTING: 'executing',
    LEARNING: 'learning',
    ERROR: 'error'
};

/**
 * Modos de Operação
 */
const OPERATION_MODES = {
    ASSISTED: 'assisted',     // Requer aprovação humana
    AUTONOMOUS: 'autonomous', // Execução automática
    HYBRID: 'hybrid'         // Decisão automática baseada em confiança
};

/**
 * Brain Arms Daemon
 */
class BrainArmsDaemon {
    constructor() {
        this.state = DAEMON_STATES.IDLE;
        this.mode = OPERATION_MODES.HYBRID;
        this.isRunning = false;

        // Componentes do sistema
        this.brainGen = new BrainPromptGenerator();
        this.agentGen = new AgentPromptGenerator();
        this.chatInterface = new ChatInterface();
        this.confidenceScorer = new ConfidenceScorer();
        this.pcMonitor = new PCMonitor();
        this.pcComm = new PCCommunication();

        // Sistema de memórias globais
        this.byterover = getByteRover();
        this.forceGlobalMemorySync = true; // SEMPRE sincronizar memórias globais

        // Estado interno
        this.currentTask = null;
        this.activeAgents = new Map();
        this.taskQueue = [];
        this.completedTasks = [];
        this.learningData = [];

        // Configurações
        this.thinkInterval = 30000;    // 30 segundos entre pensamentos
        this.maxConcurrentTasks = 3;   // Máximo de tarefas simultâneas
        this.confidenceThreshold = 0.8; // Threshold para modo autônomo
        this.learningRate = 0.1;       // Taxa de aprendizado

        // Estatísticas
        this.stats = {
            tasksProcessed: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            avgConfidence: 0,
            uptime: 0,
            lastActivity: null
        };
    }

    /**
     * Inicia o daemon
     */
    async start() {
        if (this.isRunning) {
            log.warn('Daemon já está executando');
            return;
        }

        log.info('🚀 Iniciando Brain Arms Daemon...');
        log.info(`🎯 Modo de operação: ${this.mode.toUpperCase()}`);

        try {
            // Inicializar componentes
            await this.initializeComponents();

            // Inicializar decisor de execução
            this.executionDecider = getExecutionDecider();

            // Configurar event listeners
            this.setupEventListeners();

            // Iniciar ciclo principal
            this.isRunning = true;
            this.startThinkingCycle();

            log.info('✅ Brain Arms Daemon iniciado com sucesso');

        } catch (error) {
            log.error('Erro ao iniciar daemon:', error);
            this.state = DAEMON_STATES.ERROR;
            throw error;
        }
    }

    /**
     * Para o daemon
     */
    async stop() {
        if (!this.isRunning) {
            log.warn('Daemon não está executando');
            return;
        }

        log.info('🛑 Parando Brain Arms Daemon...');

        this.isRunning = false;
        this.state = DAEMON_STATES.IDLE;

        // Limpar timers
        if (this.thinkTimer) {
            clearInterval(this.thinkTimer);
            this.thinkTimer = null;
        }

        // Salvar estado final
        await this.saveDaemonState();

        log.info('✅ Brain Arms Daemon parado');
    }

    /**
     * Inicializa componentes do sistema
     */
    async initializeComponents() {
        log.info('🔧 Inicializando componentes...');

        // 🧠 REGRA DO CÉREBRO: Sincronizar memórias globais na inicialização
        if (this.forceGlobalMemorySync) {
            log.info('🔄 CÉREBRO: Sincronizando memórias globais na inicialização...');
            await this.byterover.forceGlobalMemorySync();
            log.info('✅ CÉREBRO: Memórias globais sincronizadas na inicialização');
        }

        // Inicializar comunicação e monitoramento
        await this.pcComm.initialize();
        await this.pcMonitor.startMonitoring();

        // Carregar estado anterior se existir
        await this.loadDaemonState();

        // Verificar conectividade
        const commStatus = await this.pcComm.getStatus();
        const monitorStatus = await this.pcMonitor.getStatus();

        log.info(`📊 Componentes inicializados: ${commStatus.total_connected} PCs conectados, ${monitorStatus.metrics.totalPCs} PCs monitorados`);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Listener para novas tarefas na fila
        this.pcComm.on('task_received', async (task, fromPC) => {
            await this.handleIncomingTask(task, fromPC);
        });

        // Listener para conclusão de tarefas
        this.pcComm.on('task_completed', async (result, taskId) => {
            await this.handleTaskCompletion(result, taskId);
        });

        // Listener para erros
        this.pcComm.on('task_error', async (error, taskId) => {
            await this.handleTaskError(error, taskId);
        });
    }

    /**
     * Inicia o ciclo de pensamento contínuo
     */
    startThinkingCycle() {
        log.info('🧠 Iniciando ciclo de pensamento...');

        // Executar pensamento inicial
        this.performThinking();

        // Configurar pensamento contínuo
        this.thinkTimer = setInterval(async () => {
            if (this.isRunning && this.taskQueue.length < this.maxConcurrentTasks) {
                await this.performThinking();
            }
        }, this.thinkInterval);
    }

    /**
     * Executa um ciclo de pensamento
     */
    async performThinking() {
        if (this.state === DAEMON_STATES.THINKING) {
            return; // Já pensando
        }

        this.state = DAEMON_STATES.THINKING;
        const startTime = Date.now();

        try {
            // 🧠 REGRA DO CÉREBRO: SEMPRE sincronizar memórias globais antes de pensar
            if (this.forceGlobalMemorySync) {
                log.info('🔄 CÉREBRO: Forçando sincronização global de memórias antes do pensamento...');
                await this.byterover.forceGlobalMemorySync();
                log.info('✅ CÉREBRO: Memórias globais sincronizadas - pronto para pensar');
            }

            log.debug('🧠 Brain está pensando com contexto global completo...');

            // Gerar tarefa baseada no estado atual (agora com memórias atualizadas)
            const task = await this.generateTaskFromState();

            if (task) {
                // Adicionar à fila de tarefas
                this.taskQueue.push({
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    task,
                    generatedAt: new Date().toISOString(),
                    priority: this.calculateTaskPriority(task),
                    status: 'queued'
                });

                // Processar tarefa se possível
                await this.processNextTask();

                log.info(`✅ Tarefa gerada e enfileirada: ${task.substring(0, 50)}...`);
            }

        } catch (error) {
            log.error('Erro no ciclo de pensamento:', error);
            this.state = DAEMON_STATES.ERROR;
        } finally {
            this.state = DAEMON_STATES.IDLE;
            this.stats.lastActivity = new Date().toISOString();
        }
    }

    /**
     * Gera tarefa baseada no estado atual do sistema
     */
    async generateTaskFromState() {
        // Analisar estado atual
        const commStatus = await this.pcComm.getStatus();
        const monitorStatus = await this.pcMonitor.getStatus();

        // Verificar se há PCs offline
        const offlinePCs = monitorStatus.pcs.filter(pc => pc.status === 'offline');
        if (offlinePCs.length > 0) {
            return `Verificar conectividade dos PCs offline: ${offlinePCs.map(pc => pc.hostname).join(', ')}`;
        }

        // Verificar se há tarefas pendentes antigas
        const oldTasks = this.taskQueue.filter(task =>
            Date.now() - new Date(task.generatedAt).getTime() > 300000 // 5 minutos
        );
        if (oldTasks.length > 0) {
            return `Revisar tarefas pendentes antigas: ${oldTasks.length} tarefas aguardando há mais de 5 minutos`;
        }

        // Verificar balanceamento de carga
        const activeTasks = this.taskQueue.filter(task => task.status === 'active').length;
        if (activeTasks > this.maxConcurrentTasks) {
            return `Otimizar processamento: ${activeTasks} tarefas ativas, limite é ${this.maxConcurrentTasks}`;
        }

        // Tarefa de manutenção baseada em aprendizado
        const maintenanceTasks = [
            'Otimizar performance do sistema baseado em métricas recentes',
            'Atualizar índices de confiança dos agentes',
            'Revisar padrões de delegação de tarefas',
            'Analisar eficiência do processamento distribuído',
            'Otimizar comunicação entre PCs do swarm'
        ];

        return maintenanceTasks[Math.floor(Math.random() * maintenanceTasks.length)];
    }

    /**
     * Calcula prioridade da tarefa
     */
    calculateTaskPriority(task) {
        // Prioridades baseadas no conteúdo da tarefa
        if (task.includes('offline') || task.includes('erro')) {
            return 'critical';
        } else if (task.includes('otimizar') || task.includes('performance')) {
            return 'high';
        } else if (task.includes('revisar') || task.includes('manutenção')) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Processa próxima tarefa da fila
     */
    async processNextTask() {
        // Ordenar por prioridade (Score = Base + Aging Bonus)
        this.taskQueue.sort((a, b) => {
            const getScore = (task) => {
                const priorityScores = { critical: 100, high: 75, medium: 50, low: 25 };
                const base = priorityScores[task.priority] || 25;

                // Bônus por tempo de espera (1 ponto por minuto, máx 50)
                const ageMinutes = (Date.now() - new Date(task.generatedAt).getTime()) / 60000;
                const param = 1; // 1 ponto por minuto
                const bonus = Math.min(ageMinutes * param, 50);

                return base + bonus;
            };

            return getScore(b) - getScore(a);
        });

        // Pegar primeira tarefa não ativa
        const nextTask = this.taskQueue.find(task => task.status === 'queued');

        if (!nextTask) {
            return; // Nenhuma tarefa disponível
        }

        this.state = DAEMON_STATES.DELEGATING;

        try {
            log.info(`🎯 Processando tarefa: ${nextTask.task.substring(0, 50)}...`);

            // Decidir modo de execução baseado na confiança e modo do daemon
            const executionMode = await this.decideExecutionMode(nextTask);

            if (executionMode === 'reject') {
                // Tarefa rejeitada pelo sistema de decisão
                log.warn('🚫 Tarefa rejeitada pelo sistema de decisão inteligente');
                nextTask.status = 'rejected';
                nextTask.rejectionReason = 'Sistema de decisão considerou muito arriscado';
                return;
            }

            if (executionMode === 'assist') {
                // Modo assistido - aguardar aprovação humana
                log.info('🤝 Tarefa requer aprovação humana (modo assistido)');
                nextTask.status = 'pending_approval';
                await this.requestHumanApproval(nextTask);
                return;
            }

            // Modo autônomo - executar diretamente
            nextTask.status = 'active';
            await this.executeTaskAutonomously(nextTask);

        } catch (error) {
            log.error('Erro ao processar tarefa:', error);
            nextTask.status = 'error';
            nextTask.error = error.message;
        } finally {
            this.state = DAEMON_STATES.IDLE;
        }
    }

    /**
     * Decide modo de execução baseado em múltiplos fatores
     */
    async decideExecutionMode(task) {
        if (this.mode === OPERATION_MODES.ASSISTED) {
            return 'assist';
        }

        if (this.mode === OPERATION_MODES.AUTONOMOUS) {
            return 'auto';
        }

        // Modo híbrido - usar ExecutionDecider inteligente
        const systemState = {
            pcCount: this.pcMonitor.getStatus().metrics.totalPCs,
            systemLoad: 50, // TODO: implementar medição real
            daemon: true
        };

        const decision = await this.executionDecider.decideExecution(task, {
            daemon: true,
            environment: 'production', // TODO: detectar ambiente
            userId: 'system'
        }, systemState);

        // Atualizar estatísticas
        this.stats.avgConfidence = (this.stats.avgConfidence + decision.confidence) / 2;

        log.debug(`🧠 Decisão do ExecutionDecider: ${decision.mode.toUpperCase()} (${(decision.confidence * 100).toFixed(1)}% confiança)`);

        // Mapear para modos internos
        switch (decision.mode) {
            case EXECUTION_DECISIONS.AUTONOMOUS:
                return 'auto';
            case EXECUTION_DECISIONS.ASSISTED:
                return 'assist';
            case EXECUTION_DECISIONS.REJECTED:
                return 'reject';
            default:
                return 'assist'; // Fallback
        }
    }

    /**
     * Solicita aprovação humana para tarefa
     */
    async requestHumanApproval(task) {
        log.info(`📋 Solicitando aprovação para tarefa: ${task.task}`);

        // Em produção, isso poderia enviar notificação ou criar entrada no dashboard
        // Por enquanto, apenas log
        console.log('\n' + '='.repeat(80));
        console.log('🤝 APROVAÇÃO HUMANA REQUERIDA');
        console.log('='.repeat(80));
        console.log(`Tarefa: ${task.task}`);
        console.log(`ID: ${task.id}`);
        console.log(`Prioridade: ${task.priority}`);
        console.log('');
        console.log('Para aprovar: senciente execute brain_agent "<tarefa>" --mode direct');
        console.log('Para rejeitar: senciente daemon reject ' + task.id);
        console.log('='.repeat(80));
    }

    /**
     * Executa tarefa autonomamente
     */
    async executeTaskAutonomously(task) {
        log.info(`⚡ Executando tarefa autonomamente: ${task.task}`);

        try {
            // 🧠 REGRA DO CÉREBRO: Sincronizar memórias antes de executar qualquer ação
            if (this.forceGlobalMemorySync) {
                log.info('🔄 CÉREBRO: Sincronizando memórias globais antes da execução...');
                await this.byterover.forceGlobalMemorySync();
                log.info('✅ CÉREBRO: Memórias globais sincronizadas - executando com contexto completo');
            }

            // Gerar prompt do Brain para análise (agora com memórias atualizadas)
            const brainPrompt = await this.brainGen.generateBrainPrompt(task.task, {
                daemon: true,
                autonomous: true,
                taskId: task.id
            });

            // Analisar resposta e delegar para agente apropriado
            const delegation = this.extractDelegationFromPrompt(brainPrompt);

            if (delegation.agent) {
                // Delegar para agente
                const agentPrompt = await this.agentGen.generateAgentPrompt(delegation.agent, task.task, {
                    daemon: true,
                    brainContext: brainPrompt,
                    taskId: task.id
                });

                // Execução real via Chat Interface
                log.info(`🤖 Incorporando agente ${delegation.agent} no chat...`);

                const result = await this.chatInterface.executePrompt(agentPrompt, {
                    agentId: delegation.agent,
                    taskId: task.id,
                    mode: 'autonomous',
                    context: brainPrompt
                });

                if (result.success) {
                    await this.completeTask(task, {
                        success: true,
                        agent: delegation.agent,
                        execution: 'real_autonomous',
                        output: result.data || result.raw
                    });
                } else {
                    throw new Error(`Falha na execução do agente: ${result.error}`);
                }

            } else {
                // Tarefa não requer delegação específica
                await this.completeTask(task, {
                    success: true,
                    execution: 'brain_direct',
                    notes: 'Tarefa executada diretamente pelo Brain'
                });
            }

        } catch (error) {
            log.error('Erro na execução autônoma:', error);
            await this.failTask(task, error);
        }
    }

    /**
     * Extrai delegação do prompt do Brain
     */
    extractDelegationFromPrompt(prompt) {
        const lines = prompt.split('\n');
        let delegation = { agent: null, reasoning: null };

        for (const line of lines) {
            if (line.includes('DELEGAÇÃO:') || line.includes('DELEGATION:')) {
                // Próximas linhas contêm a delegação
                const delegationIndex = lines.indexOf(line);
                for (let i = delegationIndex + 1; i < lines.length; i++) {
                    const nextLine = lines[i].trim();
                    if (nextLine && !nextLine.includes('RAZÃO:') && !nextLine.includes('REASON:')) {
                        // Procurar por nome de agente
                        const agentMatch = nextLine.match(/(technical_agent|business_agent|operations_agent|brain)/i);
                        if (agentMatch) {
                            delegation.agent = agentMatch[1].toLowerCase();
                            break;
                        }
                    }
                }
                break;
            }
        }

        return delegation;
    }

    /**
     * Completa tarefa com sucesso
     */
    async completeTask(task, result) {
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.result = result;

        this.completedTasks.push(task);
        this.stats.tasksCompleted++;

        // Aprender com o sucesso
        await this.learnFromTask(task, true);

        // Remover da fila ativa
        const index = this.taskQueue.findIndex(t => t.id === task.id);
        if (index > -1) {
            this.taskQueue.splice(index, 1);
        }

        log.info(`✅ Tarefa completada: ${task.task.substring(0, 50)}...`);
    }

    /**
     * Marca tarefa como falha
     */
    async failTask(task, error) {
        task.status = 'failed';
        task.failedAt = new Date().toISOString();
        task.error = error.message;

        this.stats.tasksFailed++;

        // Aprender com a falha
        await this.learnFromTask(task, false);

        log.error(`❌ Tarefa falhou: ${task.task.substring(0, 50)}... - ${error.message}`);
    }

    /**
     * Aprende com execução da tarefa
     */
    async learnFromTask(task, success) {
        const learningEntry = {
            taskId: task.id,
            task: task.task,
            success,
            priority: task.priority,
            executionTime: task.completedAt ? new Date(task.completedAt) - new Date(task.generatedAt) : 0,
            error: task.error,
            timestamp: new Date().toISOString()
        };

        this.learningData.push(learningEntry);

        // Limitar histórico de aprendizado
        if (this.learningData.length > 1000) {
            this.learningData = this.learningData.slice(-500);
        }

        // Atualizar parâmetros baseado no aprendizado
        await this.updateLearningParameters();
    }

    /**
     * Atualiza parâmetros baseado no aprendizado
     */
    async updateLearningParameters() {
        // Analisar taxa de sucesso por prioridade
        const recentTasks = this.learningData.slice(-100);
        const successRate = recentTasks.filter(t => t.success).length / recentTasks.length;

        // Ajustar threshold de confiança baseado no desempenho
        if (successRate > 0.9) {
            // Alto sucesso - pode ser mais autônomo
            this.confidenceThreshold = Math.min(0.95, this.confidenceThreshold + this.learningRate);
        } else if (successRate < 0.7) {
            // Baixo sucesso - ser mais conservador
            this.confidenceThreshold = Math.max(0.6, this.confidenceThreshold - this.learningRate);
        }

        // Ajustar intervalo de pensamento
        const avgExecutionTime = recentTasks
            .filter(t => t.executionTime > 0)
            .reduce((sum, t) => sum + t.executionTime, 0) / recentTasks.length;

        if (avgExecutionTime > 120000) { // 2 minutos
            // Tarefas demorando - pensar menos frequentemente
            this.thinkInterval = Math.min(120000, this.thinkInterval + 5000);
        } else if (avgExecutionTime < 30000) { // 30 segundos
            // Tarefas rápidas - pensar mais frequentemente
            this.thinkInterval = Math.max(15000, this.thinkInterval - 2000);
        }
    }

    /**
     * Manipula tarefa recebida de outro PC
     */
    async handleIncomingTask(task, fromPC) {
        log.info(`📨 Tarefa recebida de ${fromPC}: ${task.type}`);

        // Adicionar à fila com prioridade alta
        this.taskQueue.push({
            id: `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task: task.content || task.description || JSON.stringify(task),
            generatedAt: new Date().toISOString(),
            priority: 'high',
            status: 'queued',
            fromPC
        });
    }

    /**
     * Manipula conclusão de tarefa
     */
    async handleTaskCompletion(result, taskId) {
        log.info(`✅ Tarefa ${taskId} completada`);

        const task = this.taskQueue.find(t => t.id === taskId);
        if (task) {
            await this.completeTask(task, result);
        }
    }

    /**
     * Manipula erro de tarefa
     */
    async handleTaskError(error, taskId) {
        log.error(`❌ Erro na tarefa ${taskId}:`, error);

        const task = this.taskQueue.find(t => t.id === taskId);
        if (task) {
            await this.failTask(task, new Error(error));
        }
    }

    /**
     * Salva estado do daemon
     */
    async saveDaemonState() {
        try {
            const state = {
                stats: this.stats,
                mode: this.mode,
                thinkInterval: this.thinkInterval,
                confidenceThreshold: this.confidenceThreshold,
                learningData: this.learningData.slice(-100), // Últimas 100 entradas
                timestamp: new Date().toISOString()
            };

            const fs = await import('fs');
            fs.writeFileSync('data/daemon_state.json', JSON.stringify(state, null, 2));

        } catch (error) {
            log.warn('Erro ao salvar estado do daemon:', error);
        }
    }

    /**
     * Carrega estado do daemon
     */
    async loadDaemonState() {
        try {
            const fs = await import('fs');

            if (fs.existsSync('data/daemon_state.json')) {
                const state = JSON.parse(fs.readFileSync('data/daemon_state.json', 'utf8'));

                this.stats = { ...this.stats, ...state.stats };
                this.mode = state.mode || this.mode;
                this.thinkInterval = state.thinkInterval || this.thinkInterval;
                this.confidenceThreshold = state.confidenceThreshold || this.confidenceThreshold;
                this.learningData = state.learningData || [];

                log.info('✅ Estado do daemon carregado');
            }
        } catch (error) {
            log.warn('Erro ao carregar estado do daemon:', error);
        }
    }

    /**
     * Obtém status do daemon
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            state: this.state,
            mode: this.mode,
            stats: this.stats,
            queueSize: this.taskQueue.length,
            activeTasks: this.taskQueue.filter(t => t.status === 'active').length,
            pendingApprovals: this.taskQueue.filter(t => t.status === 'pending_approval').length,
            configuration: {
                thinkInterval: this.thinkInterval,
                maxConcurrentTasks: this.maxConcurrentTasks,
                confidenceThreshold: this.confidenceThreshold,
                learningRate: this.learningRate
            }
        };
    }

    /**
     * Define modo de operação
     */
    setMode(mode) {
        if (!Object.values(OPERATION_MODES).includes(mode)) {
            throw new Error(`Modo inválido: ${mode}`);
        }

        this.mode = mode;
        log.info(`🎯 Modo alterado para: ${mode.toUpperCase()}`);
    }

    /**
     * Força processamento da próxima tarefa
     */
    async forceProcessNextTask() {
        if (this.taskQueue.length > 0) {
            await this.processNextTask();
        } else {
            log.info('Nenhuma tarefa na fila');
        }
    }

    /**
     * Lista tarefas pendentes
     */
    listPendingTasks() {
        return this.taskQueue.filter(task => task.status !== 'completed' && task.status !== 'failed');
    }

    /**
     * Aprova tarefa pendente
     */
    async approveTask(taskId) {
        const task = this.taskQueue.find(t => t.id === taskId && t.status === 'pending_approval');

        if (task) {
            task.status = 'queued';
            log.info(`✅ Tarefa aprovada: ${task.task}`);
            await this.processNextTask();
        } else {
            throw new Error(`Tarefa não encontrada ou não pendente: ${taskId}`);
        }
    }

    /**
     * Rejeita tarefa pendente
     */
    rejectTask(taskId) {
        const task = this.taskQueue.find(t => t.id === taskId && t.status === 'pending_approval');

        if (task) {
            task.status = 'rejected';
            log.info(`❌ Tarefa rejeitada: ${task.task}`);
        } else {
            throw new Error(`Tarefa não encontrada ou não pendente: ${taskId}`);
        }
    }
}

// Exportar classe
export default BrainArmsDaemon;

// Instância global
let globalDaemon = null;

export function getBrainArmsDaemon() {
    if (!globalDaemon) {
        globalDaemon = new BrainArmsDaemon();
    }
    return globalDaemon;
}

// Função main para CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const daemon = getBrainArmsDaemon();

    try {
        switch (command) {
            case 'start':
                await daemon.start();
                // Manter rodando
                process.on('SIGINT', async () => {
                    await daemon.stop();
                    process.exit(0);
                });
                break;

            case 'stop':
                await daemon.stop();
                break;

            case 'status':
                const status = daemon.getStatus();
                console.log(JSON.stringify(status, null, 2));
                break;

            case 'mode':
                if (args.length < 2) {
                    console.error('Uso: daemon mode <assisted|autonomous|hybrid>');
                    process.exit(1);
                }
                daemon.setMode(args[1]);
                break;

            case 'process':
                await daemon.forceProcessNextTask();
                break;

            case 'tasks':
                const tasks = daemon.listPendingTasks();
                console.log('Tarefas pendentes:');
                tasks.forEach(task => {
                    console.log(`  ${task.id}: ${task.task} (${task.priority})`);
                });
                break;

            case 'approve':
                if (args.length < 2) {
                    console.error('Uso: daemon approve <task_id>');
                    process.exit(1);
                }
                await daemon.approveTask(args[1]);
                break;

            case 'reject':
                if (args.length < 2) {
                    console.error('Uso: daemon reject <task_id>');
                    process.exit(1);
                }
                daemon.rejectTask(args[1]);
                break;

            default:
                console.log('Uso: brain_arms_daemon.js <command>');
                console.log('Comandos:');
                console.log('  start     - Inicia daemon');
                console.log('  stop      - Para daemon');
                console.log('  status    - Mostra status');
                console.log('  mode <m>  - Define modo (assisted/autonomous/hybrid)');
                console.log('  process   - Processa próxima tarefa');
                console.log('  tasks     - Lista tarefas pendentes');
                console.log('  approve <id> - Aprova tarefa pendente');
                console.log('  reject <id>  - Rejeita tarefa pendente');
                break;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}




