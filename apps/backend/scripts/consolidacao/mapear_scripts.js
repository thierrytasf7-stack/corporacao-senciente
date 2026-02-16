#!/usr/bin/env node
/**
 * Script para mapear todos os scripts
 * Task 1.1.2 do plano de reestruturação
 */

import fs from 'fs';
import path from 'path';

const scriptsDir = path.resolve(process.cwd(), 'scripts');
const outputFile = path.resolve(process.cwd(), 'scripts_inventory.json');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '_archive') {
                getAllFiles(filePath, fileList);
            }
        } else if (file.endsWith('.js') || file.endsWith('.sh') || file.endsWith('.bat')) {
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

function categorizeScript(file) {
    const pathLower = file.relativePath.toLowerCase();
    const nameLower = file.name.toLowerCase();

    let category = 'outro';
    let functionType = 'outro';

    // Categorizar por pasta
    if (pathLower.includes('agents/')) category = 'AGENTE';
    else if (pathLower.includes('cerebro/')) category = 'CEREBRO';
    else if (pathLower.includes('senciencia/')) category = 'SENCIENCIA';
    else if (pathLower.includes('orchestrator/')) category = 'ORQUESTRADOR';
    else if (pathLower.includes('utils/')) category = 'UTILITARIO';
    else if (pathLower.includes('test')) category = 'TESTE';
    else if (pathLower.includes('setup') || pathLower.includes('install')) category = 'SETUP';
    else if (pathLower.includes('wordpress')) category = 'WORDPRESS';
    else if (pathLower.includes('frameworks')) category = 'FRAMEWORK';
    else if (pathLower.includes('self_healing')) category = 'SELF_HEALING';
    else if (pathLower.includes('self_improvement')) category = 'SELF_IMPROVEMENT';
    else if (pathLower.includes('empathy') || pathLower.includes('ethics') || pathLower.includes('innovation')) category = 'SENCIENCIA_AVANCADA';

    // Categorizar por função
    if (nameLower.includes('test')) functionType = 'TESTE';
    else if (nameLower.includes('setup') || nameLower.includes('install') || nameLower.includes('config')) functionType = 'CONFIGURACAO';
    else if (nameLower.includes('create') || nameLower.includes('generate')) functionType = 'CRIACAO';
    else if (nameLower.includes('update') || nameLower.includes('modify')) functionType = 'MODIFICACAO';
    else if (nameLower.includes('delete') || nameLower.includes('remove')) functionType = 'DELECAO';
    else if (nameLower.includes('check') || nameLower.includes('validate')) functionType = 'VALIDACAO';
    else if (nameLower.includes('popular') || nameLower.includes('populate')) functionType = 'POPULACAO';
    else if (nameLower.includes('execute') || nameLower.includes('run')) functionType = 'EXECUCAO';
    else if (nameLower.includes('agent')) functionType = 'AGENTE';

    return { category, functionType };
}

function analyzeScript(file) {
    try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');

        // Analisar imports
        const imports = [];
        const importMatches = content.matchAll(/import\s+(?:.*?\s+from\s+)?['"](.+?)['"]/g);
        for (const match of importMatches) {
            imports.push(match[1]);
        }

        // Verificar exports
        const hasDefaultExport = content.includes('export default');
        const hasNamedExports = content.includes('export ') && !content.includes('export default');
        const exports = [];
        const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+(\w+)/g);
        for (const match of exportMatches) {
            exports.push(match[1]);
        }

        // Verificar se é executável diretamente
        const isExecutable = content.includes('#!/usr/bin/env node') || content.includes('if (import.meta.url');

        // Verificar se tem erros comuns
        const hasBrokenImports = imports.some(imp => {
            // Verificar se importa arquivos que não existem (básico)
            if (imp.startsWith('./') || imp.startsWith('../')) {
                const importPath = path.resolve(path.dirname(file.path), imp);
                // Tentar diferentes extensões
                const possiblePaths = [
                    importPath,
                    importPath + '.js',
                    importPath + '/index.js'
                ];
                return !possiblePaths.some(p => {
                    try {
                        return fs.existsSync(p);
                    } catch {
                        return false;
                    }
                });
            }
            return false;
        });

        // Verificar se é stub (muito pequeno ou só tem comentários)
        const codeLines = lines.filter(l => {
            const trimmed = l.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
        });
        const isStub = codeLines.length < 20;

        return {
            lines: lines.length,
            codeLines: codeLines.length,
            size: content.length,
            imports: imports.length,
            importList: imports,
            exports: exports.length,
            exportList: exports,
            hasDefaultExport,
            hasNamedExports,
            isExecutable,
            hasBrokenImports,
            isStub,
            hasErrorHandling: content.includes('try') && content.includes('catch'),
            hasLogging: content.includes('console.log') || content.includes('logger')
        };
    } catch (err) {
        return {
            error: err.message,
            lines: 0,
            size: 0
        };
    }
}

function findDependencies(scripts) {
    const dependencyMap = {};

    scripts.forEach(script => {
        if (script.analysis && script.analysis.importList) {
            script.analysis.importList.forEach(imp => {
                if (imp.startsWith('./') || imp.startsWith('../')) {
                    // Encontrar script que corresponde a este import
                    const importPath = path.resolve(path.dirname(script.path), imp);
                    const possiblePaths = [
                        importPath,
                        importPath + '.js',
                        importPath + '/index.js'
                    ];

                    const targetScript = scripts.find(s => {
                        return possiblePaths.some(p => {
                            try {
                                const resolved = path.resolve(s.path);
                                return resolved === p || resolved === importPath;
                            } catch {
                                return false;
                            }
                        });
                    });

                    if (targetScript) {
                        if (!dependencyMap[script.relativePath]) {
                            dependencyMap[script.relativePath] = [];
                        }
                        dependencyMap[script.relativePath].push(targetScript.relativePath);
                    }
                }
            });
        }
    });

    return dependencyMap;
}

console.log('🔍 Mapeando scripts...\n');

const allFiles = getAllFiles(scriptsDir);
console.log(`📄 Total de scripts encontrados: ${allFiles.length}`);

// Categorizar e analisar
const categorized = allFiles.map(file => {
    const { category, functionType } = categorizeScript(file);
    const analysis = analyzeScript(file);
    return {
        ...file,
        category,
        functionType,
        analysis
    };
});

// Encontrar dependências
const dependencies = findDependencies(categorized);

// Estatísticas
const byCategory = {};
const byFunction = {};
const broken = categorized.filter(s => s.analysis?.hasBrokenImports);
const stubs = categorized.filter(s => s.analysis?.isStub);
const executables = categorized.filter(s => s.analysis?.isExecutable);

categorized.forEach(script => {
    byCategory[script.category] = (byCategory[script.category] || 0) + 1;
    byFunction[script.functionType] = (byFunction[script.functionType] || 0) + 1;
});

console.log(`\n📊 Estatísticas:`);
console.log(`   Por categoria:`, byCategory);
console.log(`   Scripts quebrados (imports): ${broken.length}`);
console.log(`   Stubs (pouco código): ${stubs.length}`);
console.log(`   Executáveis: ${executables.length}`);

// Salvar inventário
const inventory = {
    generated: new Date().toISOString(),
    total: allFiles.length,
    statistics: {
        byCategory,
        byFunction,
        broken: broken.length,
        stubs: stubs.length,
        executables: executables.length
    },
    dependencies,
    broken: broken.map(s => ({
        path: s.relativePath,
        brokenImports: s.analysis?.importList?.filter(imp => {
            if (imp.startsWith('./') || imp.startsWith('../')) {
                const importPath = path.resolve(path.dirname(s.path), imp);
                const possiblePaths = [importPath, importPath + '.js', importPath + '/index.js'];
                return !possiblePaths.some(p => {
                    try {
                        return fs.existsSync(p);
                    } catch {
                        return false;
                    }
                });
            }
            return false;
        }) || []
    })),
    scripts: categorized.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
};

fs.writeFileSync(outputFile, JSON.stringify(inventory, null, 2), 'utf8');
console.log(`\n✅ Inventário salvo em: ${outputFile}`);

// Criar INDEX.md
const indexContent = `# Índice de Scripts

Gerado automaticamente em ${new Date().toISOString()}

## Estatísticas

- Total: ${allFiles.length} scripts
- Quebrados: ${broken.length}
- Stubs: ${stubs.length}
- Executáveis: ${executables.length}

## Scripts por Categoria

${Object.entries(byCategory).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

## Scripts por Função

${Object.entries(byFunction).map(([func, count]) => `- ${func}: ${count}`).join('\n')}

## Lista Completa

${categorized.map(s => `- [${s.name}](${s.relativePath}) - ${s.category} / ${s.functionType}`).join('\n')}

## Scripts Quebrados

${broken.length > 0 ? broken.map(s => `- ${s.relativePath}: ${s.analysis?.importList?.join(', ') || 'N/A'}`).join('\n') : 'Nenhum encontrado'}

## Dependências

${Object.entries(dependencies).slice(0, 20).map(([script, deps]) => `- ${script}:\n  ${deps.map(d => `  - ${d}`).join('\n')}`).join('\n\n')}
`;

const indexFile = path.resolve(scriptsDir, 'INDEX.md');
fs.writeFileSync(indexFile, indexContent, 'utf8');
console.log(`✅ INDEX.md criado em: ${indexFile}`);

console.log('\n✅ Mapeamento completo!');





