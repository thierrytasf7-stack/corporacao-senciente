#!/usr/bin/env node
/**
 * Script para mapear todos os agentes
 * Task 1.1.3 do plano de reestruturação
 */

import fs from 'fs';
import path from 'path';

const fichasDir = path.resolve(process.cwd(), 'docs', 'FICHA-TECNICA-AGENTES');
const cerebroDir = path.resolve(process.cwd(), 'scripts', 'cerebro');
const agentsDir = path.resolve(process.cwd(), 'scripts', 'agents');

function getAgentFolders() {
    if (!fs.existsSync(fichasDir)) {
        return [];
    }

    const folders = fs.readdirSync(fichasDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    return folders;
}

function checkImplementation(agentName) {
    const implementations = [];

    // Verificar em scripts/cerebro/
    const cerebroFiles = [
        `${agentName}_agent.js`,
        `${agentName}_*.js`,
        `*${agentName}*.js`
    ];

    if (fs.existsSync(cerebroDir)) {
        const files = fs.readdirSync(cerebroDir);
        files.forEach(file => {
            if (file.toLowerCase().includes(agentName.toLowerCase())) {
                implementations.push({
                    path: path.join(cerebroDir, file),
                    relativePath: `scripts/cerebro/${file}`,
                    location: 'cerebro'
                });
            }
        });
    }

    // Verificar em scripts/agents/
    if (fs.existsSync(agentsDir)) {
        const files = fs.readdirSync(agentsDir, { recursive: true });
        files.forEach(file => {
            if (typeof file === 'string' && file.toLowerCase().includes(agentName.toLowerCase())) {
                implementations.push({
                    path: path.join(agentsDir, file),
                    relativePath: `scripts/agents/${file}`,
                    location: 'agents'
                });
            }
        });
    }

    // Verificar em scripts/ diretamente
    const scriptsDir = path.resolve(process.cwd(), 'scripts');
    if (fs.existsSync(scriptsDir)) {
        const files = fs.readdirSync(scriptsDir);
        files.forEach(file => {
            if (file.toLowerCase().includes(agentName.toLowerCase()) && file.endsWith('.js')) {
                implementations.push({
                    path: path.join(scriptsDir, file),
                    relativePath: `scripts/${file}`,
                    location: 'scripts'
                });
            }
        });
    }

    return implementations;
}

function testAgent(agentName, implementations) {
    if (implementations.length === 0) {
        return { works: false, error: 'Nenhuma implementação encontrada' };
    }

    // Tentar importar o primeiro arquivo de implementação
    try {
        const mainImpl = implementations[0];
        // Verificar se arquivo existe e tem conteúdo
        if (fs.existsSync(mainImpl.path)) {
            const content = fs.readFileSync(mainImpl.path, 'utf8');

            // Verificações básicas
            const hasExports = content.includes('export');
            const hasFunctions = content.includes('function') || content.includes('async');
            const hasErrors = content.includes('TODO') || content.includes('FIXME') || content.includes('not implemented');

            // Tentar verificar sintaxe básica
            let syntaxOk = true;
            try {
                // Verificar se tem imports quebrados básicos
                const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
                for (const match of importMatches) {
                    const importPath = match[1];
                    if (importPath.startsWith('./') || importPath.startsWith('../')) {
                        const resolved = path.resolve(path.dirname(mainImpl.path), importPath);
                        const possiblePaths = [resolved, resolved + '.js', resolved + '/index.js'];
                        if (!possiblePaths.some(p => {
                            try {
                                return fs.existsSync(p);
                            } catch {
                                return false;
                            }
                        })) {
                            syntaxOk = false;
                            break;
                        }
                    }
                }
            } catch (err) {
                syntaxOk = false;
            }

            return {
                works: hasExports && hasFunctions && !hasErrors && syntaxOk,
                hasExports,
                hasFunctions,
                hasErrors,
                syntaxOk,
                size: content.length,
                lines: content.split('\n').length
            };
        }
    } catch (err) {
        return { works: false, error: err.message };
    }

    return { works: false, error: 'Não foi possível testar' };
}

function getAgentFiles(agentFolder) {
    const folderPath = path.join(fichasDir, agentFolder);
    if (!fs.existsSync(folderPath)) {
        return [];
    }

    const files = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
            name: f,
            path: path.join(folderPath, f),
            relativePath: `docs/FICHA-TECNICA-AGENTES/${agentFolder}/${f}`
        }));

    return files;
}

function calculateNote(agent) {
    let note = 0;

    // Documentado: +2 pontos
    if (agent.documented) note += 2;

    // Implementado: +3 pontos
    if (agent.implemented) note += 3;

    // Funciona: +5 pontos
    if (agent.works) note += 5;

    // Tem testes: +1 ponto
    // (verificar se tem arquivo de teste)
    const hasTests = fs.existsSync(path.resolve(process.cwd(), 'scripts', `test_${agent.name}_agent.js`)) ||
        fs.existsSync(path.resolve(process.cwd(), 'tests', `${agent.name}.test.js`));
    if (hasTests) note += 1;

    // Tem conhecimento populado: +1 ponto
    // (verificar se tem script popular_*_knowledge.js)
    const hasKnowledge = fs.existsSync(path.resolve(process.cwd(), 'scripts', `popular_${agent.name}_knowledge.js`));
    if (hasKnowledge) note += 1;

    return Math.min(note, 10); // Máximo 10
}

console.log('🔍 Mapeando agentes...\n');

const agentFolders = getAgentFolders();
console.log(`📁 Pastas de agentes encontradas: ${agentFolders.length}`);

const agents = agentFolders.map(folder => {
    const agentName = folder;
    const files = getAgentFiles(folder);
    const implementations = checkImplementation(agentName);
    const testResult = testAgent(agentName, implementations);

    const agent = {
        name: agentName,
        folder: folder,
        documented: files.length > 0,
        documentFiles: files,
        implemented: implementations.length > 0,
        implementations: implementations,
        works: testResult.works || false,
        testResult: testResult,
        note: 0
    };

    agent.note = calculateNote(agent);

    return agent;
});

// Ordenar por nota (maior primeiro)
agents.sort((a, b) => b.note - a.note);

// Estatísticas
const documented = agents.filter(a => a.documented).length;
const implemented = agents.filter(a => a.implemented).length;
const working = agents.filter(a => a.works).length;
const avgNote = agents.reduce((sum, a) => sum + a.note, 0) / agents.length;

console.log(`\n📊 Estatísticas:`);
console.log(`   Total de agentes: ${agents.length}`);
console.log(`   Documentados: ${documented}`);
console.log(`   Implementados: ${implemented}`);
console.log(`   Funcionando: ${working}`);
console.log(`   Nota média: ${avgNote.toFixed(1)}/10`);

// Criar tabela markdown
const tableRows = agents.map(a => {
    const status = a.works ? '✅' : a.implemented ? '⚠️' : a.documented ? '📝' : '❌';
    return `| ${a.name} | ${a.documented ? 'Sim' : 'Não'} | ${a.implemented ? 'Sim' : 'Não'} | ${a.works ? 'Sim' : 'Não'} | ${a.note}/10 | ${status} |`;
});

const markdownContent = `# Status dos Agentes

Gerado automaticamente em ${new Date().toISOString()}

## Resumo

- Total: ${agents.length} agentes
- Documentados: ${documented} (${((documented / agents.length) * 100).toFixed(1)}%)
- Implementados: ${implemented} (${((implemented / agents.length) * 100).toFixed(1)}%)
- Funcionando: ${working} (${((working / agents.length) * 100).toFixed(1)}%)
- Nota média: ${avgNote.toFixed(1)}/10

## Tabela Completa

| Agente | Documentado | Implementado | Funciona | Nota | Status |
|--------|-------------|--------------|----------|------|--------|
${tableRows.join('\n')}

## Detalhes por Agente

${agents.map(a => `
### ${a.name}

- **Nota:** ${a.note}/10
- **Documentado:** ${a.documented ? 'Sim' : 'Não'} ${a.documentFiles.length > 0 ? `(${a.documentFiles.length} arquivos)` : ''}
- **Implementado:** ${a.implemented ? 'Sim' : 'Não'} ${a.implementations.length > 0 ? `(${a.implementations.length} arquivo(s))` : ''}
- **Funciona:** ${a.works ? 'Sim' : 'Não'}
${a.implementations.length > 0 ? `- **Arquivos:**\n${a.implementations.map(impl => `  - ${impl.relativePath}`).join('\n')}` : ''}
${a.testResult.error ? `- **Erro:** ${a.testResult.error}` : ''}
`).join('\n')}
`;

const outputFile = path.resolve(process.cwd(), 'docs', '03-agents', 'AGENTES_STATUS.md');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(outputFile, markdownContent, 'utf8');
console.log(`\n✅ Status salvo em: ${outputFile}`);

// Salvar JSON também
const jsonOutput = path.resolve(process.cwd(), 'agentes_inventory.json');
fs.writeFileSync(jsonOutput, JSON.stringify({
    generated: new Date().toISOString(),
    total: agents.length,
    statistics: {
        documented,
        implemented,
        working,
        avgNote
    },
    agents: agents
}, null, 2), 'utf8');
console.log(`✅ JSON salvo em: ${jsonOutput}`);

console.log('\n✅ Mapeamento de agentes completo!');





