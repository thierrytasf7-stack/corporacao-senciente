#!/usr/bin/env ts-node

import 'dotenv/config';
import setupSpotFuturesStrategies from '../setup-spot-futures-strategies';

async function main() {
    console.log('🚀 Configurando estratégias Spot e Futures...');

    try {
        await setupSpotFuturesStrategies();
        console.log('✅ Configuração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao configurar estratégias:', error);
        process.exit(1);
    }
}

main();
