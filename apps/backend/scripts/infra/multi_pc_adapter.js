#!/usr/bin/env node

/**
 * Multi-PC Adapter - Adaptador para Arquitetura Multi-PC
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Adapta o sistema senciente atual para funcionar em infraestrutura multi-PC,
 * integrando Brain, Agentes e comunicação distribuída.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import PCCommunication from './pc_communication.js';
import PCMonitor from './pc_monitor.js';

const log = logger.child({ module: 'multi_pc_adapter' });

/**
 * Classe Multi-PC Adapter
 */
class MultiPCAdapter {
    constructor() {
        this.communication = new PCCommunication();
        this.monitor = new PCMonitor();
        this.brainPC = null;
        this.agentPCs = new Map();
        this.taskDistribution = {
            brain_tasks: ['decision_making', 'task_coordination', 'strategy_planning'],
            technical_tasks: ['code_generation', 'testing', 'deployment', 'infrastructure'],
            business_tasks: ['market_analysis', 'content_creation', 'customer_insights'],
            operations_tasks: ['monitoring', 'backup', 'security', 'reporting']
        };
        this.isInitialized = false;
    }

    /**
     * Inicializa adaptador multi-PC
     */
    async initialize() {
        if (this.isInitialized) {
            log.warn('Adaptador multi-PC já inicializado');
            return;
        }

        log.info('🔧 Inicializando adaptador multi-PC para arquitetura senciente...');

        // Inicializar comunicação e monitoramento
        await this.communication.initialize();
        await this.monitor.startMonitoring();

        // Identificar PCs por especialização
        await this.identifyPCRoles();

        // Configurar distribuição de tarefas
        this.setupTaskDistribution();

        // Integrar com sistema Brain existente
        await this.integrateWithBrain();

        // Adaptar agentes para multi-PC
        await this.adaptAgentsForMultiPC();

        this.isInitialized = true;
        log.info('✅ Adaptador multi-PC inicializado com sucesso');
    }

    /**
     * Identifica roles dos PCs baseado na especialização
     */
    async identifyPCRoles() {
        log.info('🔍 Identificando roles dos PCs...');

        const pcs = this.monitor.getStatus().pcs;

        for (const pc of pcs) {
            switch (pc.specialization) {
                case 'technical':
                    this.agentPCs.set('technical', pc);
                    log.info(`🛠️ PC Technical identificado: ${pc.hostname}`);
                    break;

                case 'business':
                    this.agentPCs.set('business', pc);
                    log.info(`💼 PC Business identificado: ${pc.hostname}`);
                    break;

                case 'operations':
                    this.agentPCs.set('operations', pc);
                    log.info(`⚙️ PC Operations identificado: ${pc.hostname}`);
                    break;

                default:
                    // Verificar se é PC Brain (hostname contém 'brain' ou é o PC local)
                    if (pc.hostname.toLowerCase().includes('brain') || pc.hostname === this.communication.localPC.hostname) {
                        this.brainPC = pc;
                        log.info(`🧠 PC Brain identificado: ${pc.hostname}`);
                    }
                    break;
            }
        }

        // Se não encontrou PC Brain, usar PC local como Brain
        if (!this.brainPC) {
            this.brainPC = {
                hostname: this.communication.localPC.hostname,
                specialization: 'brain',
                ip_address: this.communication.localPC.ip,
                status: 'online'
            };
            log.info(`🧠 PC Brain definido como local: ${this.brainPC.hostname}`);
        }

        log.info(`📊 Roles identificados: Brain=${this.brainPC.hostname}, Technical=${this.agentPCs.get('technical')?.hostname || 'N/A'}, Business=${this.agentPCs.get('business')?.hostname || 'N/A'}, Operations=${this.agentPCs.get('operations')?.hostname || 'N/A'}`);
    }

    /**
     * Configura distribuição de tarefas
     */
    setupTaskDistribution() {
        log.info('📋 Configurando distribuição de tarefas...');

        // Configurar listeners para distribuição automática
        this.communication.on('task_received', (task, fromPC) => {
            this.handleDistributedTask(task, fromPC);
        });

        log.info('✅ Distribuição de tarefas configurada');
    }

    /**
     * Integra com sistema Brain existente
     */
    async integrateWithBrain() {
        log.info('🧠 Integrando com sistema Brain existente...');

        // Verificar se Brain PC está acessível
        if (this.brainPC.status !== 'online') {
            log.warn('PC Brain não está online - algumas funcionalidades podem não funcionar');
            return;
        }

        // Adaptar Brain Prompt Generator para multi-PC
        await this.adaptBrainPromptGenerator();

        // Configurar comunicação Brain ↔ Arms distribuída
        await this.setupDistributedBrainArms();

        log.info('✅ Integração com Brain concluída');
    }

    /**
     * Adapta Brain Prompt Generator para multi-PC
     */
    async adaptBrainPromptGenerator() {
        try {
            // Verificar se arquivo existe
            const brainPromptPath = path.join(process.cwd(), 'scripts', 'swarm', 'brain_prompt_generator.js');
            if (!fs.existsSync(brainPromptPath)) {
                log.warn('Brain Prompt Generator não encontrado - pulando adaptação');
                return;
            }

            let brainPromptCode = fs.readFileSync(brainPromptPath, 'utf8');

            // Adicionar capacidades multi-PC ao Brain
            const multiPCCapabilities = `
// Capacidades Multi-PC adicionadas automaticamente
const multiPCCapabilities = {
    distributedExecution: true,
    pcCommunication: true,
    taskDistribution: true,
    loadBalancing: true,
    failoverSupport: true
};

// PCs disponíveis para distribuição
const availablePCs = {
    technical: ${this.agentPCs.has('technical')},
    business: ${this.agentPCs.has('business')},
    operations: ${this.agentPCs.has('operations')}
};

// Função para distribuir tarefas entre PCs
async function distributeTaskToPC(task, targetSpecialization) {
    const targetPC = this.agentPCs.get(targetSpecialization);
    if (!targetPC || targetPC.status !== 'online') {
        throw new Error(\`PC \${targetSpecialization} não disponível para tarefa: \${task.type}\`);
    }

    log.info(\`📤 Distribuindo tarefa para PC \${targetSpecialization}: \${targetPC.hostname}\`);

    // Enviar tarefa via comunicação
    await this.communication.sendTaskToPC(targetPC.hostname, {
        ...task,
        distributed: true,
        sourcePC: this.brainPC.hostname,
        targetSpecialization: targetSpecialization
    });

    return { success: true, targetPC: targetPC.hostname };
}
`;

            // Inserir capacidades multi-PC no código
            brainPromptCode = brainPromptCode.replace(
                'const log = logger.child({ module: \'brain_prompt_generator\' });',
                `const log = logger.child({ module: 'brain_prompt_generator' });

// Multi-PC Capabilities Integration
${multiPCCapabilities}`
            );

            // Salvar arquivo adaptado
            fs.writeFileSync(brainPromptPath, brainPromptCode);
            log.info('✅ Brain Prompt Generator adaptado para multi-PC');

        } catch (error) {
            log.error('Erro ao adaptar Brain Prompt Generator:', error);
        }
    }

    /**
     * Configura comunicação Brain ↔ Arms distribuída
     */
    async setupDistributedBrainArms() {
        log.info('🔄 Configurando comunicação Brain ↔ Arms distribuída...');

        // Configurar listeners para comunicação distribuída
        this.communication.on('brain_think', (thought) => {
            this.distributeThoughtToArms(thought);
        });

        this.communication.on('arms_action', (action) => {
            this.routeActionToBrain(action);
        });

        log.info('✅ Comunicação Brain ↔ Arms distribuída configurada');
    }

    /**
     * Adapta agentes para multi-PC
     */
    async adaptAgentsForMultiPC() {
        log.info('🤖 Adaptando agentes para arquitetura multi-PC...');

        // Lista de agentes a adaptar
        const agentDirectories = [
            'scripts/agents/technical',
            'scripts/agents/business',
            'scripts/agents/operations'
        ];

        for (const agentDir of agentDirectories) {
            if (fs.existsSync(agentDir)) {
                await this.adaptAgentsInDirectory(agentDir);
            }
        }

        log.info('✅ Agentes adaptados para multi-PC');
    }

    /**
     * Adapta agentes em um diretório específico
     */
    async adaptAgentsInDirectory(agentDir) {
        try {
            const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.js'));

            for (const file of files) {
                const filePath = path.join(agentDir, file);
                let agentCode = fs.readFileSync(filePath, 'utf8');

                // Adicionar capacidades de comunicação multi-PC
                const multiPCIntegration = `
// Multi-PC Integration adicionada automaticamente
const multiPCEnabled = true;
const pcCommunication = this.communication || null;

// Função para solicitar ajuda de outros PCs
async function requestHelpFromPC(specialization, task) {
    if (!pcCommunication) {
        log.warn('Comunicação multi-PC não disponível');
        return null;
    }

    try {
        const targetPC = this.agentPCs.get(specialization);
        if (!targetPC) {
            return null;
        }

        log.debug(\`🔄 Solicitando ajuda de PC \${specialization} para tarefa: \${task.type}\`);

        const helpRequest = {
            type: 'help_request',
            task: task,
            fromSpecialization: this.specialization,
            requester: this.constructor.name
        };

        await pcCommunication.sendTaskToPC(targetPC.hostname, helpRequest);
        return { success: true, targetPC: targetPC.hostname };
    } catch (error) {
        log.error(\`Erro ao solicitar ajuda de PC \${specialization}:\`, error);
        return null;
    }
}
`;

                // Inserir integração multi-PC
                agentCode = agentCode.replace(
                    'import { logger } from \'../../utils/logger.js\';',
                    `import { logger } from '../../utils/logger.js';

// Multi-PC Agent Integration
${multiPCIntegration}`
                );

                fs.writeFileSync(filePath, agentCode);
                log.debug(`✅ Agente adaptado: ${file}`);
            }
        } catch (error) {
            log.error(`Erro ao adaptar agentes no diretório ${agentDir}:`, error);
        }
    }

    /**
     * Trata tarefas distribuídas
     */
    async handleDistributedTask(task, fromPC) {
        log.info(`📨 Tarefa distribuída recebida de ${fromPC}: ${task.type}`);

        try {
            // Roteamento baseado no tipo de tarefa
            const routingResult = await this.routeTask(task);

            // Responder ao PC de origem se necessário
            if (task.distributed && task.sourcePC) {
                const response = {
                    type: 'task_result',
                    originalTask: task,
                    result: routingResult,
                    processedBy: this.communication.localPC.hostname,
                    timestamp: new Date().toISOString()
                };

                await this.communication.sendMessageToPC(
                    this.communication.connectedPCs.get(task.sourcePC),
                    response
                );
            }

        } catch (error) {
            log.error(`Erro ao processar tarefa distribuída:`, error);

            // Enviar erro de volta se for tarefa distribuída
            if (task.distributed && task.sourcePC) {
                const errorResponse = {
                    type: 'task_error',
                    originalTask: task,
                    error: error.message,
                    processedBy: this.communication.localPC.hostname,
                    timestamp: new Date().toISOString()
                };

                await this.communication.sendMessageToPC(
                    this.communication.connectedPCs.get(task.sourcePC),
                    errorResponse
                );
            }
        }
    }

    /**
     * Roteia tarefa para o PC apropriado
     */
    async routeTask(task) {
        const taskType = task.type;

        // Determinar especialização baseada no tipo de tarefa
        let targetSpecialization = null;

        for (const [spec, tasks] of Object.entries(this.taskDistribution)) {
            if (tasks.some(t => taskType.includes(t) || t.includes(taskType))) {
                targetSpecialization = spec;
                break;
            }
        }

        if (!targetSpecialization) {
            // Fallback baseado na especialização do PC local
            targetSpecialization = this.communication.localPC.specialization;
        }

        // Verificar se PC alvo está disponível
        const targetPC = this.agentPCs.get(targetSpecialization);

        if (!targetPC || targetPC.status !== 'online') {
            throw new Error(`PC ${targetSpecialization} não disponível para tarefa ${taskType}`);
        }

        log.info(`🔀 Roteando tarefa ${taskType} para PC ${targetSpecialization}: ${targetPC.hostname}`);

        // Executar tarefa no PC alvo
        const result = await this.communication.sendTaskToPC(targetPC.hostname, {
            ...task,
            routed: true,
            routedBy: this.communication.localPC.hostname,
            targetSpecialization: targetSpecialization
        });

        return {
            success: true,
            routedTo: targetPC.hostname,
            specialization: targetSpecialization,
            result: result
        };
    }

    /**
     * Distribui pensamento do Brain para os Arms
     */
    async distributeThoughtToArms(thought) {
        log.info('🧠 Distribuindo pensamento do Brain para Arms...');

        // Enviar pensamento para todos os PCs agentes
        const distributionPromises = Array.from(this.agentPCs.values())
            .filter(pc => pc.status === 'online')
            .map(pc => this.communication.sendMessageToPC(pc, {
                type: 'brain_thought',
                thought: thought,
                from: this.brainPC.hostname,
                timestamp: new Date().toISOString()
            }));

        await Promise.allSettled(distributionPromises);
        log.info('✅ Pensamento distribuído para todos os Arms');
    }

    /**
     * Roteia ação dos Arms de volta para o Brain
     */
    async routeActionToBrain(action) {
        log.info('💪 Roteando ação dos Arms para o Brain...');

        if (!this.brainPC || this.brainPC.status !== 'online') {
            log.warn('PC Brain não disponível para receber ação');
            return;
        }

        await this.communication.sendMessageToPC(this.brainPC, {
            type: 'arms_action',
            action: action,
            from: this.communication.localPC.hostname,
            timestamp: new Date().toISOString()
        });

        log.info('✅ Ação roteada para o Brain');
    }

    /**
     * Obtém status da integração multi-PC
     */
    getIntegrationStatus() {
        return {
            isInitialized: this.isInitialized,
            brainPC: this.brainPC,
            agentPCs: Object.fromEntries(this.agentPCs),
            taskDistribution: this.taskDistribution,
            communication: this.communication.getStatus(),
            monitoring: this.monitor.getStatus()
        };
    }

    /**
     * Para adaptador
     */
    stop() {
        log.info('🛑 Parando adaptador multi-PC...');

        this.monitor.stopMonitoring();
        this.communication.stop();
        this.isInitialized = false;

        log.info('✅ Adaptador multi-PC parado');
    }
}

// Exportar classe
export default MultiPCAdapter;

// Instância global
let globalAdapter = null;

export function getMultiPCAdapter() {
    if (!globalAdapter) {
        globalAdapter = new MultiPCAdapter();
    }
    return globalAdapter;
}

// Função main para CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const adapter = getMultiPCAdapter();

    try {
        switch (command) {
            case 'init':
                await adapter.initialize();
                break;

            case 'status':
                const status = adapter.getIntegrationStatus();
                console.log(JSON.stringify(status, null, 2));
                break;

            case 'stop':
                adapter.stop();
                break;

            case 'distribute':
                if (args.length < 3) {
                    console.error('Uso: multi_pc_adapter.js distribute <specialization> <task>');
                    process.exit(1);
                }
                const spec = args[1];
                const task = JSON.parse(args[2]);
                await adapter.routeTask({ ...task, type: task.type || 'unknown' });
                break;

            default:
                console.log('Uso: multi_pc_adapter.js <command>');
                console.log('Comandos:');
                console.log('  init       - Inicializa adaptador multi-PC');
                console.log('  status     - Mostra status da integração');
                console.log('  stop       - Para adaptador');
                console.log('  distribute <spec> <task> - Distribui tarefa');
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





