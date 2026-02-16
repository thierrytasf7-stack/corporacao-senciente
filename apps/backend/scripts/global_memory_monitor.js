#!/usr/bin/env node
/**
 * MONITOR GLOBAL DE MEMÓRIAS - SINCRONIZAÇÃO CONTÍNUA
 *
 * Mantém memórias sincronizadas entre todos os PCs automaticamente.
 * Executa em background e força sincronização a cada 30 segundos.
 *
 * Uso: node scripts/global_memory_monitor.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { getLangMem } from './memory/langmem.js';
import { getLetta } from './memory/letta.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

class GlobalMemoryMonitor {
    constructor() {
        this.isRunning = false;
        this.syncInterval = 30 * 1000; // 30 segundos
        this.intervalId = null;
        this.lastSyncTimestamp = null;

        this.supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
            ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            : null;

        this.langmem = getLangMem();
        this.letta = getLetta();
    }

    async start() {
        if (this.isRunning) {
            console.log('🔄 Monitor já está executando');
            return;
        }

        if (!this.supabase) {
            console.error('❌ Supabase não configurado para monitor global');
            return;
        }

        console.log('🌐 INICIANDO MONITOR GLOBAL DE MEMÓRIAS...');
        console.log(`⏱️  Sincronização a cada ${this.syncInterval / 1000} segundos\n`);

        this.isRunning = true;

        // Sincronização inicial
        await this.forceGlobalSync();

        // Iniciar sincronização contínua
        this.intervalId = setInterval(async () => {
            await this.forceGlobalSync();
        }, this.syncInterval);

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Encerrando monitor global...');
            this.stop();
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Encerrando monitor global...');
            this.stop();
        });
    }

    async stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('✅ Monitor global encerrado');
        process.exit(0);
    }

    async forceGlobalSync() {
        const startTime = Date.now();

        try {
            // 1. Limpar caches locais
            this.langmem.cache.clear();
            this.letta.currentState = null;

            // 2. Testar conectividade global
            const { data: testData, error: testError } = await this.supabase
                .from('corporate_memory')
                .select('count')
                .limit(1);

            if (testError) {
                console.error(`❌ Erro de conectividade global: ${testError.message}`);
                return;
            }

            // 3. Sincronizar LangMem
            const wisdomTest = await this.langmem.getWisdom('test');
            const wisdomCount = wisdomTest.length;

            // 4. Sincronizar Letta
            const state = await this.letta.getCurrentState();
            const tasksCount = state.last_task ? 1 : 0;

            // 5. Calcular estatísticas
            const syncTime = Date.now() - startTime;
            this.lastSyncTimestamp = new Date().toISOString();

            console.log(`🔄 [${new Date().toLocaleTimeString()}] Sincronização Global:`);
            console.log(`   📚 LangMem: ${wisdomCount} memórias ativas`);
            console.log(`   🧠 Letta: ${state.current_phase} (${tasksCount} tasks ativas)`);
            console.log(`   ⚡ Tempo: ${syncTime}ms`);
            console.log(`   ✅ Status: SINCRONIZADO\n`);

        } catch (error) {
            console.error(`❌ Erro na sincronização global: ${error.message}`);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSync: this.lastSyncTimestamp,
            syncInterval: this.syncInterval,
            nextSyncIn: this.isRunning ?
                Math.max(0, this.syncInterval - (Date.now() - (this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).getTime() : 0))) :
                null
        };
    }
}

// Função principal
async function main() {
    const monitor = new GlobalMemoryMonitor();

    // Verificar argumentos
    const args = process.argv.slice(2);

    if (args.includes('--status')) {
        // Mostrar status
        const status = monitor.getStatus();
        console.log('📊 STATUS DO MONITOR GLOBAL:');
        console.log(`   Ativo: ${status.isRunning ? '✅ Sim' : '❌ Não'}`);
        console.log(`   Última Sync: ${status.lastSync || 'Nunca'}`);
        console.log(`   Intervalo: ${status.syncInterval / 1000}s`);
        if (status.nextSyncIn !== null) {
            console.log(`   Próxima Sync: ${Math.ceil(status.nextSyncIn / 1000)}s`);
        }
        return;
    }

    if (args.includes('--stop')) {
        // Parar monitor (se estiver rodando)
        console.log('🛑 Parando monitor global...');
        await monitor.stop();
        return;
    }

    // Iniciar monitor
    await monitor.start();
}

// Executar
main().catch(console.error);

