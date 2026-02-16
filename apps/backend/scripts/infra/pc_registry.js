#!/usr/bin/env node
/**
 * Sistema de Registro e Gerenciamento de PCs Conectados
 * Gerencia o registro de PCs na infraestrutura multi-PC da corporação
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'pc_registry' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Classe para gerenciar registro de PCs
 */
class PCRegistry {
    constructor() {
        this.pcs = new Map(); // Cache em memória
        this.healthCheckInterval = 30000; // 30 segundos
        this.startHealthChecks();
    }

    /**
     * Registrar um novo PC na corporação
     */
    async registerPC(pcData) {
        if (!supabase) {
            throw new Error('Supabase não configurado');
        }

        const pc = {
            hostname: pcData.hostname,
            ip: pcData.ip,
            specialization: pcData.specialization,
            status: 'online',
            last_seen: new Date().toISOString(),
            specs: pcData.specs || {},
            metadata: pcData.metadata || {}
        };

        log.info('Registrando PC', { hostname: pc.hostname, specialization: pc.specialization });

        const { data, error } = await supabase
            .from('pcs')
            .upsert(pc, {
                onConflict: 'hostname',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            log.error('Erro ao registrar PC', { error: error.message, hostname: pc.hostname });
            throw error;
        }

        // Atualizar cache
        this.pcs.set(pc.hostname, data);

        log.info('PC registrado com sucesso', { hostname: pc.hostname, id: data.id });
        return data;
    }

    /**
     * Atualizar status de um PC
     */
    async updatePCStatus(hostname, status, additionalData = {}) {
        if (!supabase) return;

        const update = {
            status: status,
            last_seen: new Date().toISOString(),
            ...additionalData
        };

        const { error } = await supabase
            .from('pcs')
            .update(update)
            .eq('hostname', hostname);

        if (error) {
            log.error('Erro ao atualizar status do PC', { error: error.message, hostname });
            return false;
        }

        // Atualizar cache
        if (this.pcs.has(hostname)) {
            this.pcs.set(hostname, { ...this.pcs.get(hostname), ...update });
        }

        return true;
    }

    /**
     * Buscar PC por hostname
     */
    async getPC(hostname) {
        // Verificar cache primeiro
        if (this.pcs.has(hostname)) {
            return this.pcs.get(hostname);
        }

        if (!supabase) return null;

        const { data, error } = await supabase
            .from('pcs')
            .select('*')
            .eq('hostname', hostname)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            log.error('Erro ao buscar PC', { error: error.message, hostname });
            return null;
        }

        if (data) {
            this.pcs.set(hostname, data);
        }

        return data || null;
    }

    /**
     * Listar todos os PCs registrados
     */
    async listPCs(filters = {}) {
        if (!supabase) return [];

        let query = supabase.from('pcs').select('*');

        // Aplicar filtros
        if (filters.specialization) {
            query = query.eq('specialization', filters.specialization);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.onlineOnly) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            query = query.gte('last_seen', fiveMinutesAgo);
        }

        const { data, error } = await query.order('last_seen', { ascending: false });

        if (error) {
            log.error('Erro ao listar PCs', { error: error.message });
            return [];
        }

        // Atualizar cache
        data.forEach(pc => this.pcs.set(pc.hostname, pc));

        return data;
    }

    /**
     * Remover PC do registro
     */
    async unregisterPC(hostname) {
        if (!supabase) return false;

        log.info('Removendo PC do registro', { hostname });

        const { error } = await supabase
            .from('pcs')
            .delete()
            .eq('hostname', hostname);

        if (error) {
            log.error('Erro ao remover PC', { error: error.message, hostname });
            return false;
        }

        // Remover do cache
        this.pcs.delete(hostname);

        log.info('PC removido com sucesso', { hostname });
        return true;
    }

    /**
     * Executar health check em todos os PCs
     */
    async performHealthCheck() {
        // Não fazer health check se Supabase não estiver configurado
        if (!supabase) {
            return;
        }

        const pcs = await this.listPCs();

        for (const pc of pcs) {
            try {
                // Ping básico (pode ser expandido para SSH/health check real)
                const isOnline = await this.checkPCHealth(pc);

                const newStatus = isOnline ? 'online' : 'offline';
                if (newStatus !== pc.status) {
                    await this.updatePCStatus(pc.hostname, newStatus);
                    log.info('Status do PC atualizado', { hostname: pc.hostname, status: newStatus });
                }
            } catch (error) {
                log.error('Erro no health check', { hostname: pc.hostname, error: error.message });
            }
        }
    }

    /**
     * Verificar saúde de um PC específico
     */
    async checkPCHealth(pc) {
        // Implementar verificação real de saúde
        // Por enquanto, considera online se visto nos últimos 5 minutos
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const lastSeen = new Date(pc.last_seen);

        return lastSeen > fiveMinutesAgo;
    }

    /**
     * Iniciar health checks automáticos
     */
    startHealthChecks() {
        // Só iniciar health checks se Supabase estiver configurado
        if (!supabase) {
            log.warn('Health checks não iniciados: Supabase não configurado');
            return;
        }

        setInterval(() => {
            this.performHealthCheck().catch(error => {
                log.error('Erro no health check automático', { error: error.message });
            });
        }, this.healthCheckInterval);

        log.info('Health checks automáticos iniciados', { interval: this.healthCheckInterval });
    }

    /**
     * Obter estatísticas da infraestrutura
     */
    async getInfrastructureStats() {
        const allPCs = await this.listPCs();
        const onlinePCs = allPCs.filter(pc => pc.status === 'online');

        const statsBySpecialization = allPCs.reduce((acc, pc) => {
            acc[pc.specialization] = acc[pc.specialization] || { total: 0, online: 0 };
            acc[pc.specialization].total++;
            if (pc.status === 'online') {
                acc[pc.specialization].online++;
            }
            return acc;
        }, {});

        return {
            total: allPCs.length,
            online: onlinePCs.length,
            offline: allPCs.length - onlinePCs.length,
            bySpecialization: statsBySpecialization,
            lastUpdated: new Date().toISOString()
        };
    }
}

// Instância singleton
let registryInstance = null;

export function getPCRegistry() {
    if (!registryInstance) {
        registryInstance = new PCRegistry();
    }
    return registryInstance;
}

// Funções utilitárias para CLI
export async function registerPCCommand(hostname, specialization, ip = null) {
    try {
        const registry = getPCRegistry();

        // Tentar detectar IP automaticamente se não fornecido
        if (!ip) {
            // Implementar detecção de IP local
            ip = '127.0.0.1'; // Placeholder
        }

        const pcData = {
            hostname,
            specialization,
            ip,
            specs: {
                os: process.platform,
                nodeVersion: process.version
            }
        };

        const pc = await registry.registerPC(pcData);
        console.log(`✅ PC registrado: ${hostname} (${specialization})`);
        console.log(`   ID: ${pc.id}`);
        return pc;
    } catch (error) {
        console.error(`❌ Erro ao registrar PC: ${error.message}`);
        throw error;
    }
}

export async function listPCsCommand(filters = {}) {
    try {
        const registry = getPCRegistry();
        const pcs = await registry.listPCs(filters);

        if (pcs.length === 0) {
            console.log('Nenhum PC registrado');
            return;
        }

        console.log('📋 PCs Registrados:');
        console.log('==================');

        pcs.forEach(pc => {
            const status = pc.status === 'online' ? '🟢' : '🔴';
            console.log(`${status} ${pc.hostname} (${pc.specialization}) - ${pc.ip}`);
            console.log(`   Última atividade: ${new Date(pc.last_seen).toLocaleString()}`);
        });

        const stats = await registry.getInfrastructureStats();
        console.log('\n📊 Estatísticas:');
        console.log(`   Total: ${stats.total} | Online: ${stats.online} | Offline: ${stats.offline}`);

    } catch (error) {
        console.error(`❌ Erro ao listar PCs: ${error.message}`);
        throw error;
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    switch (command) {
        case 'register':
            const hostname = process.argv[3];
            const specialization = process.argv[4];
            const ip = process.argv[5];

            if (!hostname || !specialization) {
                console.error('Uso: node pc_registry.js register <hostname> <specialization> [ip]');
                process.exit(1);
            }

            registerPCCommand(hostname, specialization, ip).catch(() => process.exit(1));
            break;

        case 'list':
            listPCsCommand().catch(() => process.exit(1));
            break;

        case 'stats':
            getPCRegistry().getInfrastructureStats().then(stats => {
                console.log('📊 Estatísticas da Infraestrutura:');
                console.log(JSON.stringify(stats, null, 2));
            }).catch(error => {
                console.error(`❌ Erro: ${error.message}`);
                process.exit(1);
            });
            break;

        default:
            console.log('Comandos disponíveis:');
            console.log('  register <hostname> <specialization> [ip] - Registrar PC');
            console.log('  list                                    - Listar PCs');
            console.log('  stats                                   - Estatísticas');
            break;
    }
}

