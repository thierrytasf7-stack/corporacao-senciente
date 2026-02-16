#!/usr/bin/env node
/**
 * Script de conveniência para incorporar agente rapidamente
 * Uso: node scripts/quick/incorporar_agente.js <nome_agente> "descrição da task"
 */

import { execSync } from 'child_process';

const agentName = process.argv[2];
const task = process.argv.slice(3).join(' ');

if (!agentName || !task) {
    console.error('❌ Uso: node scripts/quick/incorporar_agente.js <nome_agente> "descrição da task"');
    process.exit(1);
}

try {
    console.log(`🤖 Incorporando agente ${agentName} para: "${task}"`);
    execSync(`node scripts/senciencia/senciencia_cli.js incorporar agent ${agentName} "${task}"`, {
        stdio: 'inherit'
    });
} catch (error) {
    console.error(`❌ Erro ao incorporar agente ${agentName}:`, error.message);
    process.exit(1);
}






