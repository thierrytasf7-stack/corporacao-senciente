#!/usr/bin/env node

/**
 * PC Communication - Sistema de Comunicação Entre PCs
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Permite comunicação direta entre PCs da corporação senciente,
 * troca de mensagens, tarefas e coordenação distribuída.
 */

import { exec } from 'child_process';
import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);
const log = logger.child({ module: 'pc_communication' });

/**
 * Classe PC Communication
 */
class PCCommunication extends EventEmitter {
    constructor() {
        super();
        this.connectedPCs = new Map();
        this.messageQueue = [];
        this.heartbeatInterval = 10000; // 10 segundos
        this.isRunning = false;
        this.localPC = {
            hostname: null,
            ip: null,
            specialization: null
        };
    }

    /**
     * Inicializa comunicação
     */
    async initialize() {
        log.info('🔗 Inicializando sistema de comunicação entre PCs...');

        // Carregar informações do PC local
        await this.loadLocalPCInfo();

        // Descobrir PCs na rede
        await this.discoverPCs();

        // Iniciar heartbeat
        this.startHeartbeat();

        // Configurar listeners de eventos
        this.setupEventListeners();

        log.info('✅ Sistema de comunicação inicializado');
        this.emit('ready');
    }

    /**
     * Carrega informações do PC local
     */
    async loadLocalPCInfo() {
        try {
            // Obter hostname
            const hostnameResult = await execAsync('hostname');
            this.localPC.hostname = hostnameResult.stdout.trim();

            // Obter IP
            const ipResult = await execAsync('hostname -I');
            this.localPC.ip = ipResult.stdout.split(' ')[0].trim();

            // Obter especialização
            try {
                const specResult = await execAsync('wsl -d Ubuntu -- cat /etc/specialization');
                this.localPC.specialization = specResult.stdout.trim();
            } catch (e) {
                this.localPC.specialization = 'unknown';
            }

            log.info('📋 PC local identificado:', this.localPC);

        } catch (error) {
            log.error('Erro ao carregar informações do PC local:', error);
            // Valores padrão
            this.localPC = {
                hostname: 'unknown-pc',
                ip: '127.0.0.1',
                specialization: 'unknown'
            };
        }
    }

    /**
     * Descobre PCs na rede usando múltiplas estratégias
     */
    async discoverPCs() {
        log.info('🔍 Descobrindo PCs na rede...');

        // Estratégia 1: Arquivo local de PCs conhecidos
        await this.discoverFromLocalFile();

        // Estratégia 2: Scan de rede local
        await this.discoverFromNetworkScan();

        // Estratégia 3: ZeroTier (se disponível)
        await this.discoverFromZeroTier();

        // Estratégia 4: Supabase (se disponível)
        await this.discoverFromDatabase();

        log.info(`📡 Encontrados ${this.connectedPCs.size} PCs na rede`);
    }

    /**
     * Descoberta via arquivo local
     */
    async discoverFromLocalFile() {
        try {
            const pcFile = path.join(process.cwd(), 'data', 'known_pcs.json');
            if (fs.existsSync(pcFile)) {
                const pcs = JSON.parse(fs.readFileSync(pcFile, 'utf8'));
                pcs.forEach(pc => {
                    if (pc.hostname !== this.localPC.hostname) {
                        this.addPC(pc);
                    }
                });
            }
        } catch (error) {
            log.warn('Erro na descoberta via arquivo local:', error.message);
        }
    }

    /**
     * Descoberta via scan de rede
     */
    async discoverFromNetworkScan() {
        try {
            // Scan básico na rede local (porta 2222 - SSH WSL2)
            const baseIP = this.localPC.ip.split('.').slice(0, 3).join('.');
            const scanPromises = [];

            // Scan de IPs .1 a .254 na mesma sub-rede
            for (let i = 1; i <= 254; i++) {
                const targetIP = `${baseIP}.${i}`;
                if (targetIP !== this.localPC.ip) {
                    scanPromises.push(this.scanPC(targetIP));
                }
            }

            await Promise.allSettled(scanPromises);

        } catch (error) {
            log.warn('Erro no scan de rede:', error.message);
        }
    }

    /**
     * Scan de PC individual
     */
    async scanPC(ip) {
        try {
            // Timeout rápido para não travar
            const pingCommand = `ping -n 1 -w 500 ${ip}`;
            await execAsync(pingCommand);

            // Verificar se responde na porta SSH (2222)
            const sshCommand = `nc -z -w2 ${ip} 2222`;
            await execAsync(sshCommand);

            // Tentar obter informações via SSH
            const infoCommand = `ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -p 2222 ubuntu@${ip} "cat /etc/corporacao-pc-info 2>/dev/null || echo '{\\\\"hostname\\\":\\\"unknown\\\",\\\"specialization\\\":\\\"unknown\\\"}'"`;
            const infoResult = await execAsync(infoCommand);

            const pcInfo = JSON.parse(infoResult.stdout.trim());

            this.addPC({
                hostname: pcInfo.hostname || `pc-${ip.replace(/\./g, '-')}`,
                ip_address: ip,
                specialization: pcInfo.specialization || 'unknown',
                username: 'ubuntu',
                ssh_port: 2222,
                discovered_via: 'network_scan',
                last_seen: new Date().toISOString()
            });

        } catch (error) {
            // PC não responde ou não é da corporação - ignorar silenciosamente
        }
    }

    /**
     * Descoberta via ZeroTier
     */
    async discoverFromZeroTier() {
        try {
            // Verificar se ZeroTier está disponível
            const ztCommand = 'zerotier-cli listnetworks';
            const ztResult = await execAsync(ztCommand);

            if (ztResult.stdout.trim()) {
                // ZeroTier ativo - listar peers
                const peersCommand = 'zerotier-cli listpeers';
                const peersResult = await execAsync(peersCommand);

                // Parse peers (formato complexo, simplificar)
                const peers = peersResult.stdout.trim().split('\n').slice(1);
                peers.forEach(peer => {
                    const parts = peer.split(/\s+/);
                    if (parts.length >= 4 && parts[2] === 'REACHABLE') {
                        const peerIP = parts[1];
                        // Tentar descobrir se é PC da corporação
                        this.scanPC(peerIP);
                    }
                });
            }
        } catch (error) {
            // ZeroTier não disponível ou erro - ignorar
        }
    }

    /**
     * Descoberta via banco de dados
     */
    async discoverFromDatabase() {
        try {
            // Em produção, consultar Supabase
            // Por enquanto, simular descoberta
            log.debug('Descoberta via banco de dados - não implementada ainda');
        } catch (error) {
            log.warn('Erro na descoberta via banco:', error.message);
        }
    }

    /**
     * Adiciona PC à lista de conectados
     */
    addPC(pcConfig) {
        const pcKey = pcConfig.hostname;
        const existingPC = this.connectedPCs.get(pcKey);

        if (existingPC) {
            // Atualizar informações existentes
            Object.assign(existingPC, pcConfig);
            existingPC.last_seen = new Date().toISOString();
        } else {
            // Novo PC
            this.connectedPCs.set(pcKey, {
                ...pcConfig,
                connected_at: new Date().toISOString(),
                status: 'discovered',
                message_queue: []
            });

            log.info(`➕ PC descoberto: ${pcConfig.hostname} (${pcConfig.ip_address}) - ${pcConfig.specialization}`);
            this.emit('pc_discovered', pcConfig);
        }
    }

    /**
     * Remove PC da lista
     */
    removePC(hostname) {
        if (this.connectedPCs.delete(hostname)) {
            log.info(`➖ PC removido: ${hostname}`);
            this.emit('pc_removed', hostname);
        }
    }

    /**
     * Inicia heartbeat para manter conexões ativas
     */
    startHeartbeat() {
        log.debug('💓 Iniciando heartbeat...');

        this.heartbeatTimer = setInterval(async () => {
            await this.sendHeartbeat();
        }, this.heartbeatInterval);
    }

    /**
     * Envia heartbeat para todos os PCs conectados
     */
    async sendHeartbeat() {
        const heartbeatMessage = {
            type: 'heartbeat',
            from: this.localPC.hostname,
            timestamp: new Date().toISOString(),
            pc_info: this.localPC
        };

        for (const [hostname, pc] of this.connectedPCs) {
            try {
                await this.sendMessageToPC(pc, heartbeatMessage);
            } catch (error) {
                // PC pode estar offline - marcar como suspeito
                pc.status = 'suspected_offline';
                pc.last_error = error.message;
            }
        }
    }

    /**
     * Envia mensagem para PC específico
     */
    async sendMessageToPC(pc, message) {
        const sshCommand = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -p ${pc.ssh_port} ${pc.username}@${pc.ip_address}`;

        // Criar payload da mensagem
        const messagePayload = JSON.stringify(message);
        const remoteCommand = `${sshCommand} "node -e \\"
// Receber mensagem via stdin
process.stdin.on('data', (data) => {
  const message = JSON.parse(data.toString());
  // Processar mensagem (simplificado)
  console.log('Mensagem recebida:', message.type);

  // Responder se necessário
  if (message.type === 'heartbeat') {
    console.log('Heartbeat OK');
  }
});
\\" <<< '${messagePayload}'"`;

        await execAsync(remoteCommand);
    }

    /**
     * Envia mensagem para todos os PCs
     */
    async broadcastMessage(message) {
        const broadcastPromises = Array.from(this.connectedPCs.values()).map(pc =>
            this.sendMessageToPC(pc, message)
        );

        const results = await Promise.allSettled(broadcastPromises);

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.length - successCount;

        log.info(`📢 Broadcast: ${successCount} sucesso, ${failCount} falha`);

        return { successCount, failCount };
    }

    /**
     * Envia tarefa para PC específico
     */
    async sendTaskToPC(hostname, task) {
        const pc = this.connectedPCs.get(hostname);
        if (!pc) {
            throw new Error(`PC ${hostname} não encontrado`);
        }

        const taskMessage = {
            type: 'task',
            from: this.localPC.hostname,
            timestamp: new Date().toISOString(),
            task: task
        };

        await this.sendMessageToPC(pc, taskMessage);
        log.info(`📤 Tarefa enviada para ${hostname}: ${task.type}`);
    }

    /**
     * Solicita status de PC específico
     */
    async requestPCStatus(hostname) {
        const pc = this.connectedPCs.get(hostname);
        if (!pc) {
            throw new Error(`PC ${hostname} não encontrado`);
        }

        const statusRequest = {
            type: 'status_request',
            from: this.localPC.hostname,
            timestamp: new Date().toISOString()
        };

        await this.sendMessageToPC(pc, statusRequest);
        log.debug(`📊 Status solicitado de ${hostname}`);
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Listener para mensagens recebidas (simplificado)
        this.on('message_received', (message) => {
            this.handleIncomingMessage(message);
        });
    }

    /**
     * Trata mensagens recebidas
     */
    handleIncomingMessage(message) {
        log.debug(`📨 Mensagem recebida de ${message.from}: ${message.type}`);

        switch (message.type) {
            case 'heartbeat':
                this.handleHeartbeat(message);
                break;

            case 'task':
                this.handleTask(message);
                break;

            case 'status_request':
                this.handleStatusRequest(message);
                break;

            case 'status_response':
                this.handleStatusResponse(message);
                break;

            default:
                log.warn(`Tipo de mensagem desconhecido: ${message.type}`);
        }
    }

    /**
     * Trata heartbeat recebido
     */
    handleHeartbeat(message) {
        const pc = this.connectedPCs.get(message.from);
        if (pc) {
            pc.status = 'online';
            pc.last_heartbeat = message.timestamp;
            pc.pc_info = message.pc_info;
        }
    }

    /**
     * Trata tarefa recebida
     */
    handleTask(message) {
        log.info(`🎯 Tarefa recebida de ${message.from}: ${message.task.type}`);
        this.emit('task_received', message.task, message.from);
    }

    /**
     * Trata solicitação de status
     */
    handleStatusRequest(message) {
        // Responder com status atual
        const statusResponse = {
            type: 'status_response',
            from: this.localPC.hostname,
            timestamp: new Date().toISOString(),
            status: {
                hostname: this.localPC.hostname,
                specialization: this.localPC.specialization,
                connected_pcs: this.connectedPCs.size,
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        };

        // Enviar resposta (simplificado - em produção usaria comunicação reversa)
        log.debug(`📊 Status enviado para ${message.from}`);
    }

    /**
     * Trata resposta de status
     */
    handleStatusResponse(message) {
        const pc = this.connectedPCs.get(message.from);
        if (pc) {
            pc.remote_status = message.status;
            pc.last_status_update = message.timestamp;
        }
    }

    /**
     * Obtém status da comunicação
     */
    getStatus() {
        return {
            local_pc: this.localPC,
            connected_pcs: Array.from(this.connectedPCs.values()).map(pc => ({
                hostname: pc.hostname,
                ip_address: pc.ip_address,
                specialization: pc.specialization,
                status: pc.status,
                last_seen: pc.last_seen
            })),
            total_connected: this.connectedPCs.size,
            is_running: this.isRunning
        };
    }

    /**
     * Para comunicação
     */
    stop() {
        log.info('🛑 Parando sistema de comunicação...');

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        this.connectedPCs.clear();
        this.isRunning = false;

        log.info('✅ Sistema de comunicação parado');
    }
}

// Exportar classe e criar instância global
export default PCCommunication;

// Instância global
let globalCommunication = null;

export function getPCCommunication() {
    if (!globalCommunication) {
        globalCommunication = new PCCommunication();
    }
    return globalCommunication;
}

// Função main para CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const comm = getPCCommunication();

    try {
        switch (command) {
            case 'init':
                await comm.initialize();
                break;

            case 'discover':
                await comm.discoverPCs();
                const status = comm.getStatus();
                console.log(`Descobertos ${status.total_connected} PCs`);
                break;

            case 'status':
                const fullStatus = comm.getStatus();
                console.log(JSON.stringify(fullStatus, null, 2));
                break;

            case 'send':
                if (args.length < 3) {
                    console.error('Uso: pc_communication.js send <hostname> <message>');
                    process.exit(1);
                }
                const targetPC = args[1];
                const message = JSON.parse(args[2]);
                await comm.sendMessageToPC(comm.connectedPCs.get(targetPC), message);
                break;

            case 'broadcast':
                if (args.length < 2) {
                    console.error('Uso: pc_communication.js broadcast <message>');
                    process.exit(1);
                }
                const broadcastMessage = JSON.parse(args[1]);
                await comm.broadcastMessage(broadcastMessage);
                break;

            case 'task':
                if (args.length < 3) {
                    console.error('Uso: pc_communication.js task <hostname> <task>');
                    process.exit(1);
                }
                const taskPC = args[1];
                const task = JSON.parse(args[2]);
                await comm.sendTaskToPC(taskPC, task);
                break;

            default:
                console.log('Uso: pc_communication.js <command>');
                console.log('Comandos:');
                console.log('  init                    - Inicializa comunicação');
                console.log('  discover               - Descobre PCs na rede');
                console.log('  status                 - Mostra status da comunicação');
                console.log('  send <host> <msg>      - Envia mensagem para PC');
                console.log('  broadcast <msg>        - Envia mensagem para todos');
                console.log('  task <host> <task>     - Envia tarefa para PC');
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





