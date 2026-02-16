#!/usr/bin/env node

/**
 * Daemon Simplificado (Brain/Arms Cycle)
 * Entry point para o modo autônomo via chat
 */

import BrainArmsDaemon from '../daemon/brain_arms_daemon.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'daemon_chat' });

async function main() {
    console.log('🤖 Iniciando Daemon de Chat (Brain/Arms Cycle)...');

    const daemon = new BrainArmsDaemon();

    // Configurações específicas para o modo chat podem ser injetadas aqui
    // daemon.setMode('autonomous'); // Se quisermos forçar

    try {
        await daemon.start();
        console.log('✅ Daemon iniciado. Pressione Ctrl+C para parar.');
    } catch (error) {
        console.error('❌ Falha ao iniciar daemon:', error);
        process.exit(1);
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Parando daemon...');
        await daemon.stop();
        process.exit(0);
    });
}

main();





