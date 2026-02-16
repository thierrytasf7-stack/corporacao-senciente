#!/usr/bin/env node

/**
 * Corporação Senciente - CLI Principal
 * Fase 3 - CLI e UX Unificado
 *
 * Ponto de entrada unificado para todos os comandos da corporação senciente
 */

import SencienteCLI from './senciente_cli.js';

// Banner de inicialização
console.log('🧠 CORPORACÃO SENCIENTE 7.0');
console.log('   Interface Unificada de Controle');
console.log('   Fase 3: CLI e UX Unificado');
console.log('   Status: Operacional');
console.log('');

// Executar CLI
const cli = new SencienteCLI();
cli.run().catch(error => {
    console.error('💥 Erro crítico na CLI:', error.message);
    process.exit(1);
});




