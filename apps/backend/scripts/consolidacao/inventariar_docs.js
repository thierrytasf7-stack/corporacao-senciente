#!/usr/bin/env node
/**
 * Script para inventariar toda documentação
 * Task 1.1.1 do plano de reestruturação
 */

import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs');
const outputFile = path.resolve(process.cwd(), 'docs_inventory.json');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Ignorar node_modules e outras pastas irrelevantes
            if (!file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(filePath, fileList);
            }
        } else {
            fileList.push({
                path: filePath,
                relativePath: path.relative(process.cwd(), filePath),
                name: file,
                size: stat.size,
                modified: stat.mtime.toISOString(),
                extension: path.extname(file)
            });
        }
    });

    return fileList;
}

function categorizeFile(file) {
    const name = file.name.toLowerCase();
    const pathLower = file.relativePath.toLowerCase();

    let type = 'outro';
    let category = 'outro';

    // Identificar tipo
    if (name.startsWith('readme')) type = 'README';
    else if (name.startsWith('resumo')) type = 'RESUMO';
    else if (name.startsWith('guia')) type = 'GUIA';
    else if (name.startsWith('prd_')) type = 'PRD';
    else if (name.includes('ficha-tecnica')) type = 'FICHA_TECNICA';
    else if (name.includes('instrucoes')) type = 'INSTRUCOES';
    else if (name.includes('changelog')) type = 'CHANGELOG';
    else if (name.includes('status')) type = 'STATUS';
    else if (name.includes('config')) type = 'CONFIG';
    else if (name.includes('setup')) type = 'SETUP';
    else if (name.includes('test')) type = 'TEST';

    // Identificar categoria
    if (pathLower.includes('prds')) category = 'PRD';
    else if (pathLower.includes('ficha-tecnica-agentes')) category = 'AGENTES';
    else if (name.includes('arquitetura') || name.includes('architecture')) category = 'ARQUITETURA';
    else if (name.includes('integracao') || name.includes('integration')) category = 'INTEGRACAO';
    else if (name.includes('agente') || name.includes('agent')) category = 'AGENTES';
    else if (name.includes('marketing')) category = 'MARKETING';
    else if (name.includes('sales')) category = 'SALES';
    else if (name.includes('copywriting')) category = 'COPYWRITING';
    else if (name.includes('wordpress')) category = 'WORDPRESS';
    else if (name.includes('jira') || name.includes('confluence')) category = 'ATLASSIAN';
    else if (name.includes('mcp')) category = 'MCP';
    else if (name.includes('setup') || name.includes('instalacao')) category = 'SETUP';
    else if (name.includes('troubleshooting') || name.includes('bugfix')) category = 'TROUBLESHOOTING';

    return { type, category };
}

function findDuplicates(files) {
    const byName = {};
    const duplicates = [];

    files.forEach(file => {
        const baseName = path.basename(file.name, file.extension);
        if (!byName[baseName]) {
            byName[baseName] = [];
        }
        byName[baseName].push(file);
    });

    Object.keys(byName).forEach(name => {
        if (byName[name].length > 1) {
            duplicates.push({
                name,
                files: byName[name],
                count: byName[name].length
            });
        }
    });

    return duplicates;
}

function analyzeFile(file) {
    try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');

        // Verificar se menciona features não implementadas
        const mentionsUnimplemented =
            content.includes('TODO') ||
            content.includes('FIXME') ||
            content.includes('não implementado') ||
            content.includes('não funciona') ||
            content.includes('broken');

        // Verificar última atualização mencionada no conteúdo
        const dateMatch = content.match(/(?:última atualização|last update|updated):\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);
        const contentDate = dateMatch ? dateMatch[1] : null;

        // Verificar tamanho (arquivos muito pequenos podem ser stubs)
        const isStub = content.length < 500;

        return {
            lines: lines.length,
            size: content.length,
            mentionsUnimplemented,
            contentDate,
            isStub,
            hasLinks: content.includes('](') || content.includes('](http'),
            linkCount: (content.match(/\]\(/g) || []).length
        };
    } catch (err) {
        return {
            error: err.message,
            lines: 0,
            size: 0
        };
    }
}

console.log('🔍 Inventariando documentação...\n');

const allFiles = getAllFiles(docsDir);
console.log(`📄 Total de arquivos encontrados: ${allFiles.length}`);

// Categorizar
const categorized = allFiles.map(file => {
    const { type, category } = categorizeFile(file);
    const analysis = analyzeFile(file);
    return {
        ...file,
        type,
        category,
        ...analysis
    };
});

// Encontrar duplicações
const duplicates = findDuplicates(allFiles);
console.log(`🔄 Arquivos duplicados encontrados: ${duplicates.length} grupos`);

// Estatísticas
const byType = {};
const byCategory = {};
const resumos = categorized.filter(f => f.type === 'RESUMO');
const readmes = categorized.filter(f => f.type === 'README');

categorized.forEach(file => {
    byType[file.type] = (byType[file.type] || 0) + 1;
    byCategory[file.category] = (byCategory[file.category] || 0) + 1;
});

console.log(`\n📊 Estatísticas:`);
console.log(`   RESUMOs: ${resumos.length}`);
console.log(`   READMEs: ${readmes.length}`);
console.log(`   PRDs: ${categorized.filter(f => f.type === 'PRD').length}`);
console.log(`   Fichas Técnicas: ${categorized.filter(f => f.type === 'FICHA_TECNICA').length}`);

// Salvar inventário completo
const inventory = {
    generated: new Date().toISOString(),
    total: allFiles.length,
    statistics: {
        byType,
        byCategory,
        duplicates: duplicates.length,
        resumos: resumos.length,
        readmes: readmes.length
    },
    duplicates: duplicates,
    files: categorized.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
};

fs.writeFileSync(outputFile, JSON.stringify(inventory, null, 2), 'utf8');
console.log(`\n✅ Inventário salvo em: ${outputFile}`);

// Gerar CSV também
const csvLines = ['nome,tipo,categoria,caminho,tamanho,modificado,linhas,stub,duplicado'];
categorized.forEach(file => {
    const isDuplicate = duplicates.some(d => d.files.some(f => f.path === file.path));
    csvLines.push([
        file.name,
        file.type,
        file.category,
        file.relativePath,
        file.size,
        file.modified,
        file.lines || 0,
        file.isStub ? 'sim' : 'não',
        isDuplicate ? 'sim' : 'não'
    ].join(','));
});

const csvFile = path.resolve(process.cwd(), 'docs_inventory.csv');
fs.writeFileSync(csvFile, csvLines.join('\n'), 'utf8');
console.log(`✅ CSV salvo em: ${csvFile}`);

// Mostrar top 10 duplicações
console.log(`\n🔝 Top 10 duplicações:`);
duplicates
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .forEach((dup, i) => {
        console.log(`   ${i + 1}. ${dup.name} (${dup.count} arquivos)`);
    });

console.log('\n✅ Inventário completo!');





