#!/usr/bin/env node

/**
 * PC Monitor - Sistema de Monitoramento Distribuído
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Monitora PCs da corporação senciente em tempo real,
 * coletando métricas de saúde, performance e status.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);
const log = logger.child({ module: 'pc_monitor' });

/**
 * Classe PC Monitor
 */
class PCMonitor {
    constructor() {
        this.monitoredPCs = new Map();
        this.monitoringInterval = 30000; // 30 segundos
        this.isRunning = false;
        this.metrics = {
            totalPCs: 0,
            onlinePCs: 0,
            offlinePCs: 0,
            specializations: {},
            alerts: []
        };
    }

    /**
     * Inicia monitoramento de PCs
     */
    async startMonitoring() {
        if (this.isRunning) {
            log.warn('Monitoramento já está executando');
            return;
        }

        log.info('🚀 Iniciando monitoramento distribuído de PCs...');
        this.isRunning = true;

        // Carregar lista de PCs monitorados
        await this.loadMonitoredPCs();

        // Executar monitoramento inicial
        await this.performMonitoring();

        // Iniciar monitoramento contínuo
        this.monitorInterval = setInterval(async () => {
            try {
                await this.performMonitoring();
            } catch (error) {
                log.error('Erro durante monitoramento:', error);
            }
        }, this.monitoringInterval);

        log.info('✅ Monitoramento iniciado com sucesso');
    }

    /**
     * Para monitoramento
     */
    stopMonitoring() {
        if (!this.isRunning) {
            log.warn('Monitoramento não está executando');
            return;
        }

        log.info('🛑 Parando monitoramento...');
        this.isRunning = false;

        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        log.info('✅ Monitoramento parado');
    }

    /**
     * Carrega lista de PCs monitorados do banco de dados
     */
    async loadMonitoredPCs() {
        try {
            log.debug('Carregando lista de PCs monitorados...');

            // Em produção, carregar do Supabase
            // Por enquanto, usar arquivo local de desenvolvimento
            const pcListFile = path.join(process.cwd(), 'data', 'monitored_pcs.json');

            if (fs.existsSync(pcListFile)) {
                const pcData = JSON.parse(fs.readFileSync(pcListFile, 'utf8'));
                pcData.forEach(pc => {
                    this.monitoredPCs.set(pc.hostname, pc);
                });
                log.info(`📋 Carregados ${pcData.length} PCs para monitoramento`);
            } else {
                log.warn('Arquivo de PCs monitorados não encontrado, iniciando vazio');
                // Criar arquivo vazio
                fs.writeFileSync(pcListFile, JSON.stringify([], null, 2));
            }

        } catch (error) {
            log.error('Erro ao carregar PCs monitorados:', error);
        }
    }

    /**
     * Executa monitoramento completo de todos os PCs
     */
    async performMonitoring() {
        const startTime = Date.now();
        log.debug('🔍 Executando monitoramento de PCs...');

        // Resetar métricas
        this.resetMetrics();

        // Monitorar cada PC
        const monitoringPromises = Array.from(this.monitoredPCs.values()).map(pc =>
            this.monitorPC(pc)
        );

        await Promise.allSettled(monitoringPromises);

        // Atualizar métricas globais
        this.updateGlobalMetrics();

        // Verificar alertas
        this.checkAlerts();

        // Salvar métricas
        await this.saveMetrics();

        const duration = Date.now() - startTime;
        log.info(`✅ Monitoramento concluído em ${duration}ms`, {
            totalPCs: this.metrics.totalPCs,
            onlinePCs: this.metrics.onlinePCs,
            offlinePCs: this.metrics.offlinePCs
        });
    }

    /**
     * Monitora um PC específico
     */
    async monitorPC(pc) {
        const pcStartTime = Date.now();

        try {
            log.debug(`🔍 Monitorando PC: ${pc.hostname}`);

            // Verificar conectividade básica
            const isOnline = await this.checkConnectivity(pc);

            if (!isOnline) {
                pc.status = 'offline';
                pc.lastSeen = new Date().toISOString();
                pc.offlineSince = pc.offlineSince || new Date().toISOString();
                this.metrics.offlinePCs++;
                return;
            }

            // Coletar métricas detalhadas
            const metrics = await this.collectPCMetrics(pc);

            // Atualizar status do PC
            pc.status = 'online';
            pc.lastSeen = new Date().toISOString();
            pc.offlineSince = null;
            pc.metrics = metrics;
            pc.lastCheckDuration = Date.now() - pcStartTime;

            // Atualizar métricas globais
            this.metrics.onlinePCs++;
            this.metrics.specializations[pc.specialization] =
                (this.metrics.specializations[pc.specialization] || 0) + 1;

            log.debug(`✅ PC ${pc.hostname} monitorado com sucesso`, {
                status: pc.status,
                cpu: metrics.cpu?.usage,
                ram: metrics.ram?.usage,
                disk: metrics.disk?.usage
            });

        } catch (error) {
            log.error(`❌ Erro ao monitorar PC ${pc.hostname}:`, error.message);
            pc.status = 'error';
            pc.lastError = error.message;
            pc.errorCount = (pc.errorCount || 0) + 1;
        }
    }

    /**
     * Verifica conectividade com PC
     */
    async checkConnectivity(pc) {
        try {
            // Tentar ping
            await execAsync(`ping -n 1 -w 2000 ${pc.ip_address}`);

            // Tentar conexão SSH (se configurado)
            if (pc.ssh_port) {
                const sshCommand = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -p ${pc.ssh_port} ${pc.username}@${pc.ip_address} "echo 'SSH OK'"`;
                await execAsync(sshCommand);
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Coleta métricas detalhadas do PC
     */
    async collectPCMetrics(pc) {
        const metrics = {
            timestamp: new Date().toISOString(),
            system: {},
            cpu: {},
            ram: {},
            disk: {},
            network: {},
            processes: {}
        };

        try {
            // Métricas via SSH
            const sshCommand = (cmd) =>
                `ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -p ${pc.ssh_port || 2222} ${pc.username || 'ubuntu'}@${pc.ip_address} "${cmd}"`;

            // Informações do sistema
            const systemInfo = await execAsync(sshCommand('uname -a'));
            metrics.system.kernel = systemInfo.stdout.trim();

            // CPU
            const cpuInfo = await execAsync(sshCommand('top -bn1 | grep "Cpu(s)"'));
            const cpuMatch = cpuInfo.stdout.match(/(\d+\.\d+) us/);
            metrics.cpu.usage = cpuMatch ? parseFloat(cpuMatch[1]) : 0;

            // RAM
            const ramInfo = await execAsync(sshCommand('free -m | grep Mem'));
            const ramMatch = ramInfo.stdout.match(/Mem:\s+(\d+)\s+(\d+)/);
            if (ramMatch) {
                const total = parseInt(ramMatch[1]);
                const used = parseInt(ramMatch[2]);
                metrics.ram.total = total;
                metrics.ram.used = used;
                metrics.ram.usage = (used / total) * 100;
            }

            // Disco
            const diskInfo = await execAsync(sshCommand('df -h / | tail -1'));
            const diskMatch = diskInfo.stdout.match(/(\d+)%/);
            metrics.disk.usage = diskMatch ? parseInt(diskMatch[1]) : 0;

            // Rede ZeroTier (se aplicável)
            try {
                const ztInfo = await execAsync(sshCommand('zerotier-cli listnetworks'));
                metrics.network.zerotier_networks = ztInfo.stdout.trim().split('\n').length - 1;
            } catch (e) {
                metrics.network.zerotier_networks = 0;
            }

            // Processos ativos (top 5 por CPU)
            const processesInfo = await execAsync(sshCommand('ps aux --sort=-%cpu | head -6'));
            metrics.processes.top_cpu = processesInfo.stdout.trim().split('\n').slice(1);

        } catch (error) {
            log.warn(`Erro ao coletar métricas detalhadas do PC ${pc.hostname}:`, error.message);
            // Métricas básicas de conectividade
            metrics.connectivity = 'limited';
        }

        return metrics;
    }

    /**
     * Reseta métricas globais
     */
    resetMetrics() {
        this.metrics = {
            totalPCs: this.monitoredPCs.size,
            onlinePCs: 0,
            offlinePCs: 0,
            specializations: {},
            alerts: [],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Atualiza métricas globais
     */
    updateGlobalMetrics() {
        this.metrics.offlinePCs = this.metrics.totalPCs - this.metrics.onlinePCs;
    }

    /**
     * Verifica alertas e condições críticas
     */
    checkAlerts() {
        // Verificar PCs offline há muito tempo
        const offlineThreshold = 5 * 60 * 1000; // 5 minutos
        const now = Date.now();

        for (const pc of this.monitoredPCs.values()) {
            if (pc.status === 'offline' && pc.offlineSince) {
                const offlineDuration = now - new Date(pc.offlineSince).getTime();
                if (offlineDuration > offlineThreshold) {
                    this.metrics.alerts.push({
                        type: 'pc_offline',
                        severity: 'warning',
                        pc: pc.hostname,
                        message: `PC ${pc.hostname} offline há ${Math.round(offlineDuration / 60000)} minutos`,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // Verificar uso alto de recursos
            if (pc.metrics) {
                if (pc.metrics.cpu?.usage > 90) {
                    this.metrics.alerts.push({
                        type: 'high_cpu',
                        severity: 'warning',
                        pc: pc.hostname,
                        message: `CPU alta: ${pc.metrics.cpu.usage.toFixed(1)}%`,
                        timestamp: new Date().toISOString()
                    });
                }

                if (pc.metrics.ram?.usage > 90) {
                    this.metrics.alerts.push({
                        type: 'high_ram',
                        severity: 'warning',
                        pc: pc.hostname,
                        message: `RAM alta: ${pc.metrics.ram.usage.toFixed(1)}%`,
                        timestamp: new Date().toISOString()
                    });
                }

                if (pc.metrics.disk?.usage > 95) {
                    this.metrics.alerts.push({
                        type: 'high_disk',
                        severity: 'critical',
                        pc: pc.hostname,
                        message: `Disco quase cheio: ${pc.metrics.disk.usage}%`,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        // Alertas de sistema
        if (this.metrics.offlinePCs > this.metrics.totalPCs * 0.5) {
            this.metrics.alerts.push({
                type: 'system_degraded',
                severity: 'critical',
                message: `Sistema degradado: ${this.metrics.offlinePCs}/${this.metrics.totalPCs} PCs offline`,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Salva métricas em arquivo
     */
    async saveMetrics() {
        try {
            const metricsFile = path.join(process.cwd(), 'data', 'pc_metrics.json');

            // Garantir que o diretório existe
            const dataDir = path.dirname(metricsFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(metricsFile, JSON.stringify({
                metrics: this.metrics,
                pcs: Array.from(this.monitoredPCs.values())
            }, null, 2));

        } catch (error) {
            log.error('Erro ao salvar métricas:', error);
        }
    }

    /**
     * Adiciona PC para monitoramento
     */
    addPC(pcConfig) {
        this.monitoredPCs.set(pcConfig.hostname, {
            ...pcConfig,
            added_at: new Date().toISOString(),
            status: 'unknown'
        });

        this.savePCList();
        log.info(`➕ PC adicionado ao monitoramento: ${pcConfig.hostname}`);
    }

    /**
     * Remove PC do monitoramento
     */
    removePC(hostname) {
        if (this.monitoredPCs.delete(hostname)) {
            this.savePCList();
            log.info(`➖ PC removido do monitoramento: ${hostname}`);
        }
    }

    /**
     * Salva lista de PCs monitorados
     */
    savePCList() {
        try {
            const pcListFile = path.join(process.cwd(), 'data', 'monitored_pcs.json');
            const pcList = Array.from(this.monitoredPCs.values());

            fs.writeFileSync(pcListFile, JSON.stringify(pcList, null, 2));
        } catch (error) {
            log.error('Erro ao salvar lista de PCs:', error);
        }
    }

    /**
     * Obtém status atual de todos os PCs
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            metrics: this.metrics,
            pcs: Array.from(this.monitoredPCs.values()).map(pc => ({
                hostname: pc.hostname,
                status: pc.status,
                specialization: pc.specialization,
                lastSeen: pc.lastSeen,
                ip_address: pc.ip_address
            }))
        };
    }

    /**
     * Obtém métricas detalhadas de um PC específico
     */
    getPCMetrics(hostname) {
        const pc = this.monitoredPCs.get(hostname);
        return pc ? pc.metrics : null;
    }
}

// Exportar classe e criar instância global
export default PCMonitor;

// Instância global para uso em CLI
let globalMonitor = null;

export function getPCMonitor() {
    if (!globalMonitor) {
        globalMonitor = new PCMonitor();
    }
    return globalMonitor;
}

// Função main para execução via CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const monitor = getPCMonitor();

    switch (command) {
        case 'start':
            await monitor.startMonitoring();
            // Manter processo rodando
            process.on('SIGINT', () => {
                monitor.stopMonitoring();
                process.exit(0);
            });
            break;

        case 'stop':
            monitor.stopMonitoring();
            break;

        case 'status':
            const status = monitor.getStatus();
            console.log(JSON.stringify(status, null, 2));
            break;

        case 'add':
            if (args.length < 2) {
                console.error('Uso: pc_monitor.js add <hostname> [ip] [specialization]');
                process.exit(1);
            }
            monitor.addPC({
                hostname: args[1],
                ip_address: args[2] || '127.0.0.1',
                specialization: args[3] || 'operations',
                username: 'ubuntu',
                ssh_port: 2222
            });
            break;

        case 'remove':
            if (args.length < 2) {
                console.error('Uso: pc_monitor.js remove <hostname>');
                process.exit(1);
            }
            monitor.removePC(args[1]);
            break;

        default:
            console.log('Uso: pc_monitor.js <command>');
            console.log('Comandos:');
            console.log('  start    - Inicia monitoramento');
            console.log('  stop     - Para monitoramento');
            console.log('  status   - Mostra status atual');
            console.log('  add <hostname> [ip] [spec] - Adiciona PC');
            console.log('  remove <hostname> - Remove PC');
            break;
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}





