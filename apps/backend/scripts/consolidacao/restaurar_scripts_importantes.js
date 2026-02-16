#!/usr/bin/env node
/**
 * Script para restaurar scripts importantes que foram movidos por engano
 */

import fs from 'fs';
import path from 'path';

const scriptsDir = path.resolve(process.cwd(), 'scripts');
const archiveDir = path.join(scriptsDir, '_archive');

// Scripts que devem ser mantidos (não arquivados)
const importantScripts = [
    'scripts/cerebro/agent_selector.js', // Usado pelo Router
    'scripts/cerebro/agent_executor.js', // Usado pelo Brain como fallback
    'scripts/senciencia/context_awareness_protocol.js', // Usado para contexto
    'scripts/senciencia/inbox_reader.js', // Usado pelo CLI
    'scripts/senciencia/autonomous_executor.js', // Pode ser usado pelo daemon
    'scripts/senciencia/senciencia_cli.js', // CLI principal
];

console.log('🔄 Restaurando scripts importantes...\n');

let restored = 0;
let errors = 0;

importantScripts.forEach(scriptPath => {
    const archivePath = path.join(archiveDir, path.relative(scriptsDir, scriptPath));
    const destPath = path.resolve(process.cwd(), scriptPath);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(archivePath)) {
        console.log(`⚠️  Não encontrado no archive: ${scriptPath}`);
        return;
    }

    try {
        // Criar diretório de destino se não existe
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Mover de volta
        fs.renameSync(archivePath, destPath);
        restored++;
        console.log(`✅ Restaurado: ${scriptPath}`);
    } catch (err) {
        console.error(`❌ Erro ao restaurar ${scriptPath}:`, err.message);
        errors++;
    }
});

console.log(`\n📊 Resumo:`);
console.log(`   Restaurados: ${restored}`);
console.log(`   Erros: ${errors}`);

console.log('\n✅ Restauração completa!');





