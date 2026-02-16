#!/usr/bin/env node
/**
 * Script para mover scripts obsoletos para _archive
 * Task 1.3.1.6 - Mover scripts obsoletos
 */

import fs from 'fs';
import path from 'path';

const reportFile = path.resolve(process.cwd(), 'scripts_obsoletos_report.json');
const scriptsDir = path.resolve(process.cwd(), 'scripts');
const archiveDir = path.join(scriptsDir, '_archive');

console.log('📦 Movendo scripts obsoletos para _archive...\n');

if (!fs.existsSync(reportFile)) {
    console.error('❌ Relatório não encontrado. Execute identificar_scripts_obsoletos.js primeiro.');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));

// Scripts que NÃO devem ser arquivados (ainda podem ser úteis)
const keepScripts = [
    'scripts/cerebro/agent_selector.js', // Usado pelo Router
    'scripts/cerebro/agent_executor.js', // Usado pelo Brain como fallback
    'scripts/senciencia/context_awareness_protocol.js', // Usado para contexto
    'scripts/senciencia/inbox_reader.js', // Usado pelo CLI
    'scripts/senciencia/autonomous_executor.js', // Pode ser usado pelo daemon
    'scripts/senciencia/senciencia_cli.js', // CLI principal
    'scripts/swarm/', // Nova arquitetura
    'scripts/agents/', // Novos agentes
    'scripts/consolidacao/', // Scripts de consolidação
];

function shouldKeep(scriptPath) {
    return keepScripts.some(keep => scriptPath.includes(keep));
}

// Filtrar scripts que devem ser mantidos
const toArchive = report.obsolete.filter(s => !shouldKeep(s));
const toKeep = report.obsolete.filter(s => shouldKeep(s));

console.log(`📊 Análise:`);
console.log(`   Scripts obsoletos identificados: ${report.obsolete.length}`);
console.log(`   Scripts para arquivar: ${toArchive.length}`);
console.log(`   Scripts mantidos (ainda úteis): ${toKeep.length}`);

if (toArchive.length === 0) {
    console.log('\n✅ Nenhum script para arquivar (todos são mantidos por segurança)');
    process.exit(0);
}

// Criar estrutura de pastas no archive mantendo hierarquia
let moved = 0;
let errors = 0;
const movedList = [];

toArchive.forEach(scriptPath => {
    const sourcePath = path.resolve(process.cwd(), scriptPath);

    if (!fs.existsSync(sourcePath)) {
        console.log(`⚠️  Não existe: ${scriptPath}`);
        return;
    }

    // Manter estrutura de pastas no archive
    const relativePath = path.relative(scriptsDir, sourcePath);
    const destPath = path.join(archiveDir, relativePath);
    const destDir = path.dirname(destPath);

    try {
        // Criar diretório de destino se não existe
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Mover arquivo
        if (!fs.existsSync(destPath)) {
            fs.renameSync(sourcePath, destPath);
            moved++;
            movedList.push(scriptPath);
            console.log(`✅ Movido: ${scriptPath}`);
        } else {
            console.log(`⚠️  Já existe no archive: ${scriptPath}`);
        }
    } catch (err) {
        console.error(`❌ Erro ao mover ${scriptPath}:`, err.message);
        errors++;
    }
});

console.log(`\n📊 Resumo:`);
console.log(`   Movidos: ${moved}`);
console.log(`   Erros: ${errors}`);

// Salvar lista de scripts movidos
const movedReport = {
    date: new Date().toISOString(),
    moved: movedList,
    kept: toKeep,
    total: report.obsolete.length
};

const movedReportFile = path.join(archiveDir, 'MOVED_SCRIPTS.json');
fs.writeFileSync(movedReportFile, JSON.stringify(movedReport, null, 2), 'utf8');
console.log(`\n✅ Relatório de scripts movidos salvo em: ${movedReportFile}`);

console.log('\n✅ Movimentação completa!');





