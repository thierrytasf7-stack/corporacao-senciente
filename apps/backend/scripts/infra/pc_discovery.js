#!/usr/bin/env node

/**
 * PC Discovery - Descoberta Automática de PCs na Rede
 * Corporação Senciente - Fase 0.5
 *
 * Escaneia a rede local procurando por PCs da corporação,
 * verifica conectividade SSH e registra automaticamente.
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PCDiscovery {
    constructor() {
        this.networkRange = process.env.NETWORK_RANGE || '192.168.1.0/24';
        this.sshPort = 2222;
        this.brainHost = process.env.BRAIN_HOST || 'localhost';
        this.brainPort = process.env.BRAIN_PORT || 3001;
        this.scanTimeout = 5000; // 5 segundos por host
        this.maxConcurrentScans = 10;

        // Marcadores de PCs da corporação
        this.corporationMarkers = [
            '/etc/corporacao-senciente',
            '/home/brain/.corporacao-senciente',
            'C:\\Users\\*\\.corporacao-senciente'
        ];
    }

    /**
     * Executa comando do sistema e retorna promise
     */
    async executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            exec(command, { timeout: this.scanTimeout, ...options }, (error, stdout, stderr) => {
                if (error && error.code !== 0) {
                    reject(error);
                } else {
                    resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
                }
            });
        });
    }

    /**
     * Detecta se estamos no WSL
     */
    isWSL() {
        try {
            return fs.readFileSync('/proc/version', 'utf8').includes('Microsoft');
        } catch {
            return false;
        }
    }

    /**
     * Obtém interfaces de rede ativas
     */
    async getNetworkInterfaces() {
        const interfaces = os.networkInterfaces();
        const activeInterfaces = [];

        for (const [name, addresses] of Object.entries(interfaces)) {
            for (const addr of addresses) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    activeInterfaces.push({
                        name,
                        address: addr.address,
                        netmask: addr.netmask
                    });
                }
            }
        }

        return activeInterfaces;
    }

    /**
     * Calcula range de IP baseado na interface
     */
    calculateIPRange(iface) {
        const [a, b, c, d] = iface.address.split('.').map(Number);
        const [m1, m2, m3, m4] = iface.netmask.split('.').map(Number);

        const network = [(a & m1), (b & m2), (c & m3), (d & m4)];
        const broadcast = [
            network[0] | (255 - m1),
            network[1] | (255 - m2),
            network[2] | (255 - m3),
            network[3] | (255 - m4)
        ];

        return {
            start: `${network[0]}.${network[1]}.${network[2]}.${network[3] + 1}`,
            end: `${broadcast[0]}.${broadcast[1]}.${broadcast[2]}.${broadcast[3] - 1}`,
            network: network.join('.'),
            broadcast: broadcast.join('.')
        };
    }

    /**
     * Escaneia hosts ativos na rede usando diferentes métodos
     */
    async scanNetwork() {
        console.log('🔍 Escaneando rede em busca de PCs...');

        const interfaces = await this.getNetworkInterfaces();
        const discoveredHosts = new Set();

        for (const iface of interfaces) {
            console.log(`📡 Escaneando interface: ${iface.name} (${iface.address})`);

            const range = this.calculateIPRange(iface);
            console.log(`   Range: ${range.start} - ${range.end}`);

            // Método 1: ARP scan (mais rápido)
            try {
                const arpHosts = await this.scanWithARP(range);
                arpHosts.forEach(host => discoveredHosts.add(host));
            } catch (error) {
                console.log('   ARP scan falhou, tentando ping scan...');
            }

            // Método 2: Ping scan (mais confiável)
            try {
                const pingHosts = await this.scanWithPing(range);
                pingHosts.forEach(host => discoveredHosts.add(host));
            } catch (error) {
                console.log('   Ping scan falhou');
            }
        }

        const hostList = Array.from(discoveredHosts).filter(host => host !== os.hostname());
        console.log(`✅ Encontrados ${hostList.length} hosts ativos na rede`);

        return hostList;
    }

    /**
     * Scan usando ARP (Address Resolution Protocol)
     */
    async scanWithARP(range) {
        const hosts = [];

        try {
            // No Windows
            if (os.platform() === 'win32') {
                const { stdout } = await this.executeCommand('arp -a');
                const lines = stdout.split('\n');

                for (const line of lines) {
                    const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                    if (match && this.isInRange(match[1], range)) {
                        hosts.push(match[1]);
                    }
                }
            }
            // No Linux/WSL
            else {
                const { stdout } = await this.executeCommand('arp -n');
                const lines = stdout.split('\n');

                for (const line of lines) {
                    const match = line.match(/^(\d+\.\d+\.\d+\.\d+)/);
                    if (match && this.isInRange(match[1], range)) {
                        hosts.push(match[1]);
                    }
                }
            }
        } catch (error) {
            console.log(`   ARP scan error: ${error.message}`);
        }

        return hosts;
    }

    /**
     * Scan usando ping (mais lento mas mais confiável)
     */
    async scanWithPing(range) {
        const hosts = [];
        const [startA, startB, startC, startD] = range.start.split('.').map(Number);
        const [endA, endB, endC, endD] = range.end.split('.').map(Number);

        // Limitar scan para evitar demora excessiva
        const maxHosts = 50;
        let scanned = 0;

        for (let a = startA; a <= endA && scanned < maxHosts; a++) {
            for (let b = startB; b <= endB && scanned < maxHosts; b++) {
                for (let c = startC; c <= endC && scanned < maxHosts; c++) {
                    for (let d = startD; d <= endD && scanned < maxHosts; d++) {
                        const ip = `${a}.${b}.${c}.${d}`;

                        try {
                            const pingCmd = os.platform() === 'win32' ? `ping -n 1 -w 1000 ${ip}` : `ping -c 1 -W 1 ${ip}`;
                            await this.executeCommand(pingCmd);
                            hosts.push(ip);
                            scanned++;
                        } catch {
                            // Host não responde, continuar
                        }
                    }
                }
            }
        }

        return hosts;
    }

    /**
     * Verifica se IP está dentro do range
     */
    isInRange(ip, range) {
        const [ipa, ipb, ipc, ipd] = ip.split('.').map(Number);
        const [r1a, r1b, r1c, r1d] = range.start.split('.').map(Number);
        const [r2a, r2b, r2c, r2d] = range.end.split('.').map(Number);

        return ipa >= r1a && ipa <= r2a &&
            ipb >= r1b && ipb <= r2b &&
            ipc >= r1c && ipc <= r2c &&
            ipd >= r1d && ipd <= r2d;
    }

    /**
     * Verifica se host é um PC da corporação
     */
    async checkCorporationPC(ip) {
        try {
            // Tentar conectar via SSH e verificar marcadores
            const sshCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p ${this.sshPort} brain@${ip}`;

            // Verificar arquivo de configuração
            const checkCmd = `${sshCmd} "test -f /home/brain/.corporacao-senciente && cat /home/brain/.corporacao-senciente || echo 'not-found'"`;

            const { stdout } = await this.executeCommand(checkCmd);

            if (stdout.includes('corporacao-senciente')) {
                console.log(`   🎯 PC da corporação encontrado: ${ip}`);
                return true;
            }

            // Verificar hostname (pode indicar PC da corporação)
            const hostnameCmd = `${sshCmd} "hostname"`;
            const { stdout: hostnameOutput } = await this.executeCommand(hostnameCmd);

            if (hostnameOutput.includes('corporacao') || hostnameOutput.includes('brain')) {
                console.log(`   🎯 PC da corporação encontrado (hostname): ${ip} - ${hostnameOutput}`);
                return true;
            }

        } catch (error) {
            // Não conseguiu conectar ou não é PC da corporação
        }

        return false;
    }

    /**
     * Coleta informações detalhadas do PC
     */
    async gatherPCInfo(ip) {
        const pcInfo = {
            ip,
            hostname: null,
            os: null,
            specialization: null,
            status: 'active',
            ssh_status: 'online'
        };

        try {
            const sshCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p ${this.sshPort} brain@${ip}`;

            // Obter hostname
            const hostnameCmd = `${sshCmd} "hostname"`;
            const { stdout: hostname } = await this.executeCommand(hostnameCmd);
            pcInfo.hostname = hostname;

            // Obter sistema operacional
            const osCmd = `${sshCmd} "uname -s"`;
            const { stdout: os } = await this.executeCommand(osCmd);
            pcInfo.os = os;

            // Tentar obter especialização do arquivo de config
            const configCmd = `${sshCmd} "cat pc_config.json 2>/dev/null || echo 'not-found'"`;
            const { stdout: config } = await this.executeCommand(configCmd);

            if (config !== 'not-found') {
                try {
                    const configData = JSON.parse(config);
                    pcInfo.specialization = configData.pc_info?.specialization;
                } catch {
                    // Configuração inválida
                }
            }

            // Obter recursos do sistema
            const cpuCmd = `${sshCmd} "nproc"`;
            const memCmd = `${sshCmd} "free -h | grep '^Mem:' | awk '{print \$2}'"`;
            const diskCmd = `${sshCmd} "df -h / | tail -1 | awk '{print \$2}'"`;

            try {
                const { stdout: cpu } = await this.executeCommand(cpuCmd);
                pcInfo.cpu_cores = parseInt(cpu);
            } catch { }

            try {
                const { stdout: mem } = await this.executeCommand(memCmd);
                pcInfo.total_memory = mem;
            } catch { }

            try {
                const { stdout: disk } = await this.executeCommand(diskCmd);
                pcInfo.total_disk = disk;
            } catch { }

        } catch (error) {
            console.log(`   ⚠️ Erro ao coletar info de ${ip}: ${error.message}`);
            pcInfo.ssh_status = 'offline';
        }

        return pcInfo;
    }

    /**
     * Registra PC no sistema central
     */
    async registerPC(pcInfo) {
        try {
            const registrationData = {
                ...pcInfo,
                registered_at: new Date().toISOString(),
                last_seen: new Date().toISOString()
            };

            // Registrar via API do PC Registry
            const response = await fetch(`http://${this.brainHost}:${this.brainPort}/api/pcs/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();

            if (result.success) {
                console.log(`   ✅ PC ${pcInfo.hostname || pcInfo.ip} registrado com sucesso`);
                return true;
            } else {
                console.log(`   ❌ Falha ao registrar ${pcInfo.hostname || pcInfo.ip}: ${result.error}`);
                return false;
            }

        } catch (error) {
            console.log(`   ❌ Erro ao registrar ${pcInfo.hostname || pcInfo.ip}: ${error.message}`);
            return false;
        }
    }

    /**
     * Executa descoberta completa
     */
    async discover() {
        console.log('🔍 Iniciando descoberta automática de PCs...\n');

        // Passo 1: Escanear rede
        const activeHosts = await this.scanNetwork();

        if (activeHosts.length === 0) {
            console.log('❌ Nenhum host ativo encontrado na rede');
            return;
        }

        // Passo 2: Verificar quais são PCs da corporação
        console.log('\n🔍 Verificando PCs da corporação...');
        const corporationPCs = [];

        for (const ip of activeHosts) {
            if (await this.checkCorporationPC(ip)) {
                corporationPCs.push(ip);
            }
        }

        console.log(`✅ Encontrados ${corporationPCs.length} PCs da corporação`);

        if (corporationPCs.length === 0) {
            console.log('ℹ️  Nenhum PC novo da corporação encontrado');
            return;
        }

        // Passo 3: Coletar informações detalhadas
        console.log('\n📊 Coletando informações dos PCs...');
        const pcDetails = [];

        for (const ip of corporationPCs) {
            const info = await this.gatherPCInfo(ip);
            if (info.hostname) {
                pcDetails.push(info);
            }
        }

        // Passo 4: Registrar PCs
        console.log('\n📝 Registrando PCs no sistema central...');
        let registered = 0;

        for (const pc of pcDetails) {
            if (await this.registerPC(pc)) {
                registered++;
            }
        }

        // Resumo final
        console.log('\n' + '='.repeat(60));
        console.log('✅ DESCOBERTA CONCLUÍDA');
        console.log('='.repeat(60));
        console.log(`📊 Hosts escaneados: ${activeHosts.length}`);
        console.log(`🎯 PCs da corporação: ${corporationPCs.length}`);
        console.log(`📝 PCs registrados: ${registered}`);
        console.log('='.repeat(60));
    }

    /**
     * Executa descoberta contínua (daemon mode)
     */
    async startContinuousDiscovery(intervalMinutes = 30) {
        console.log(`🔄 Iniciando descoberta contínua (intervalo: ${intervalMinutes} minutos)`);

        // Descoberta inicial
        await this.discover();

        // Agendar descobertas periódicas
        setInterval(async () => {
            console.log(`\n🔄 Executando descoberta programada...`);
            await this.discover();
        }, intervalMinutes * 60 * 1000);
    }
}

// CLI Interface
async function main() {
    const discovery = new PCDiscovery();
    const command = process.argv[2];

    switch (command) {
        case 'scan':
            await discovery.discover();
            break;

        case 'continuous':
            const interval = parseInt(process.argv[3]) || 30;
            await discovery.startContinuousDiscovery(interval);
            break;

        case 'interfaces':
            const interfaces = await discovery.getNetworkInterfaces();
            console.log('Interfaces de rede ativas:');
            interfaces.forEach(iface => {
                console.log(`  ${iface.name}: ${iface.address}/${iface.netmask}`);
            });
            break;

        default:
            console.log('Comandos disponíveis:');
            console.log('  scan - Executar descoberta única');
            console.log('  continuous [minutos] - Executar descoberta contínua');
            console.log('  interfaces - Listar interfaces de rede');
            console.log('');
            console.log('Variáveis de ambiente:');
            console.log('  NETWORK_RANGE - Range de rede (ex: 192.168.1.0/24)');
            console.log('  BRAIN_HOST - Host do PC Brain');
            console.log('  BRAIN_PORT - Porta da API do PC Registry');
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export default PCDiscovery;






