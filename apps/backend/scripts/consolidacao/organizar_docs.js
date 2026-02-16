#!/usr/bin/env node
/**
 * Script para organizar documentos por categoria
 * Task 1.2.4 do plano de reestruturação
 */

import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs');
const inventoryFile = path.resolve(process.cwd(), 'docs_inventory.json');

// Mapeamento de documentos para pastas
const categoryMapping = {
    '01-getting-started': [
        'QUICK_START', 'INSTALL', 'SETUP', 'INSTALACAO', 'GUIA_INSTALACAO',
        'COMANDOS', 'TECNOLOGIAS', 'REQUIREMENTS', 'EXECUTION_CHECKLIST'
    ],
    '02-architecture': [
        'ARQUITETURA', 'ARCHITECTURE', 'CEREBRO', 'SWARM', 'DESIGN',
        'ESTRUTURA', 'ORQUESTRADOR', 'ORQUESTRACAO'
    ],
    '03-agents': [
        'AGENTE', 'AGENT', 'FICHA_TECNICA', 'ESPECIALIZADO'
    ],
    '04-integrations': [
        'JIRA', 'CONFLUENCE', 'MCP', 'WORDPRESS', 'GOOGLE_ADS', 'OLLAMA',
        'ATLASSIAN', 'API_REST', 'INTEGRACAO', 'INTEGRATION', 'OAUTH'
    ],
    '05-operations': [
        'RUNBOOK', 'OPERACAO', 'OPERATION', 'DASHBOARD', 'MONITOR',
        'HEALTHCHECK', 'METRICS', 'DORA', 'OBSERVABILIDADE'
    ],
    '06-troubleshooting': [
        'TROUBLESHOOTING', 'BUGFIX', 'BUG', 'ERRO', 'ERROR', 'SOLUCAO',
        'SOLUTION', 'CORRECAO', 'FIX'
    ]
};

function categorizeFile(fileName) {
    const nameUpper = fileName.toUpperCase();

    for (const [category, keywords] of Object.entries(categoryMapping)) {
        for (const keyword of keywords) {
            if (nameUpper.includes(keyword)) {
                return category;
            }
        }
    }

    return null; // Manter na raiz se não encontrar categoria
}

function shouldArchive(file) {
    const nameUpper = file.name.toUpperCase();

    // Arquivar se:
    // - É RESUMO (já movido)
    // - É muito antigo (> 6 meses sem modificação)
    // - É stub (muito pequeno)

    if (nameUpper.includes('RESUMO')) {
        return true; // Já foi movido, mas verificar se há mais
    }

    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    const fileTime = new Date(file.modified).getTime();

    if (fileTime < sixMonthsAgo && file.size < 1000) {
        return true; // Muito antigo e pequeno
    }

    return false;
}

console.log('📁 Organizando documentos...\n');

// Ler inventário
if (!fs.existsSync(inventoryFile)) {
    console.error('❌ Inventário não encontrado. Execute inventariar_docs.js primeiro.');
    process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
const files = inventory.files;

let moved = 0;
let archived = 0;
let kept = 0;

files.forEach(file => {
    const sourcePath = path.resolve(process.cwd(), file.relativePath);

    // Pular se não existe ou já está em pasta organizada
    if (!fs.existsSync(sourcePath)) {
        return;
    }

    // Pular se já está em uma das pastas organizadas
    const relativeDir = path.dirname(file.relativePath);
    if (relativeDir.startsWith('docs/01-') ||
        relativeDir.startsWith('docs/02-') ||
        relativeDir.startsWith('docs/03-') ||
        relativeDir.startsWith('docs/04-') ||
        relativeDir.startsWith('docs/05-') ||
        relativeDir.startsWith('docs/06-') ||
        relativeDir.startsWith('docs/_archive') ||
        relativeDir.startsWith('docs/prds') ||
        relativeDir.startsWith('docs/FICHA-TECNICA-AGENTES')) {
        kept++;
        return;
    }

    // Determinar destino
    let destCategory = categorizeFile(file.name);

    if (shouldArchive(file)) {
        destCategory = '_archive';
    }

    if (destCategory) {
        const destDir = path.resolve(docsDir, destCategory);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const destPath = path.join(destDir, file.name);

        try {
            // Não mover se já existe no destino
            if (fs.existsSync(destPath)) {
                console.log(`⚠️  Já existe: ${file.name} em ${destCategory}`);
                kept++;
                return;
            }

            fs.renameSync(sourcePath, destPath);
            console.log(`✅ Movido: ${file.name} → ${destCategory}/`);

            if (destCategory === '_archive') {
                archived++;
            } else {
                moved++;
            }
        } catch (err) {
            console.error(`❌ Erro ao mover ${file.name}:`, err.message);
        }
    } else {
        kept++;
    }
});

console.log(`\n📊 Resumo:`);
console.log(`   Movidos para categorias: ${moved}`);
console.log(`   Arquivados: ${archived}`);
console.log(`   Mantidos na raiz: ${kept}`);

console.log('\n✅ Organização completa!');





