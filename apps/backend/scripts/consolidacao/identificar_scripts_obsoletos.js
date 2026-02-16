#!/usr/bin/env node
/**
 * Script para identificar scripts obsoletos
 * Task 1.3.1 do plano
 */

import fs from 'fs';
import path from 'path';

const scriptsDir = path.resolve(process.cwd(), 'scripts');
const inventoryFile = path.resolve(process.cwd(), 'scripts_inventory.json');

console.log('🔍 Identificando scripts obsoletos...\n');

if (!fs.existsSync(inventoryFile)) {
    console.error('❌ Inventário não encontrado. Execute mapear_scripts.js primeiro.');
    process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
const scripts = inventory.scripts;

// Scripts que são referenciados
const referenced = new Set();

// Buscar referências em todos arquivos
function findReferences() {
    const allFiles = [];

    function getAllFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
                allFiles.push(filePath);
            }
        });
    }

    getAllFiles(process.cwd());

    allFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Buscar imports/requires
            const importMatches = content.matchAll(/(?:import|require)\(?['"]([^'"]+)['"]\)?/g);
            for (const match of importMatches) {
                let importPath = match[1];

                // Resolver caminho relativo
                if (importPath.startsWith('./') || importPath.startsWith('../')) {
                    const resolved = path.resolve(path.dirname(filePath), importPath);
                    const relative = path.relative(process.cwd(), resolved);
                    if (relative.startsWith('scripts/')) {
                        referenced.add(relative);
                    }
                } else if (importPath.startsWith('scripts/')) {
                    referenced.add(importPath);
                }
            }
        } catch (err) {
            // Ignorar erros de leitura
        }
    });
}

findReferences();

// Identificar scripts obsoletos
const obsolete = [];
const broken = [];
const duplicates = [];

scripts.forEach(script => {
    const scriptPath = script.relativePath;

    // Verificar se é referenciado
    const isReferenced = referenced.has(scriptPath) ||
        scriptPath.includes('_archive') ||
        scriptPath.includes('node_modules');

    if (!isReferenced && !scriptPath.includes('consolidacao') && !scriptPath.includes('test')) {
        obsolete.push(script);
    }

    // Verificar se tem imports quebrados
    if (script.analysis?.hasBrokenImports) {
        broken.push(script);
    }

    // Verificar duplicados (mesmo nome em locais diferentes)
    const sameName = scripts.filter(s =>
        path.basename(s.name) === path.basename(script.name) &&
        s.relativePath !== scriptPath
    );
    if (sameName.length > 0) {
        duplicates.push({ script, duplicates: sameName });
    }
});

console.log(`📊 Análise:`);
console.log(`   Scripts não referenciados: ${obsolete.length}`);
console.log(`   Scripts com imports quebrados: ${broken.length}`);
console.log(`   Scripts duplicados: ${duplicates.length}`);

// Criar lista para arquivar
const toArchive = [...obsolete, ...broken];

if (toArchive.length > 0) {
    console.log(`\n📦 Scripts para arquivar (${toArchive.length}):`);
    toArchive.slice(0, 20).forEach(s => {
        console.log(`   - ${s.relativePath}`);
    });

    // Criar pasta _archive se não existe
    const archiveDir = path.join(scriptsDir, '_archive');
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
        console.log(`\n✅ Pasta ${archiveDir} criada`);
    }
}

// Salvar relatório
const report = {
    generated: new Date().toISOString(),
    obsolete: obsolete.map(s => s.relativePath),
    broken: broken.map(s => s.relativePath),
    duplicates: duplicates.map(d => ({
        script: d.script.relativePath,
        duplicates: d.duplicates.map(dup => dup.relativePath)
    }))
};

const reportFile = path.resolve(process.cwd(), 'scripts_obsoletos_report.json');
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n✅ Relatório salvo em: ${reportFile}`);

console.log('\n✅ Análise completa!');





