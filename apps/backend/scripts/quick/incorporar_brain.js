#!/usr/bin/env node
/**
 * Script de conveniência para incorporar Brain rapidamente
 * Uso: node scripts/quick/incorporar_brain.js "descrição da task"
 */

import { execSync } from 'child_process';

const task = process.argv.slice(2).join(' ');

if (!task) {
    console.error('❌ Uso: node scripts/quick/incorporar_brain.js "descrição da task"');
    process.exit(1);
}

try {
    console.log(`🧠 Incorporando Brain para: "${task}"`);
    execSync(`node scripts/senciencia/senciencia_cli.js incorporar brain "${task}"`, {
        stdio: 'inherit'
    });
} catch (error) {
    console.error('❌ Erro ao incorporar Brain:', error.message);
    process.exit(1);
}






