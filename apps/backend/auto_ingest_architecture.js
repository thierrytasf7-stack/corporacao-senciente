
import fs from 'fs';
import path from 'path';
import { ingestMemory } from './memory/ingest.js';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

const DOC_FILES = [
    'README.md',
    'IMPLEMENTACAO_COMPLETA.md',
    'STATUS_IMPLEMENTACAO_FINAL.md',
    'MANUAL_SETUP.md',
    'CHANGELOG.md'
];

const SOURCE_DIRS = [
    'backend/daemon',
    'backend/src_api',
    'backend/memory',
    'backend/wallet',
    'frontend/src/services',
    'frontend/src/pages/CerebroCentral',
    'frontend/src/pages/Finances'
];

async function ingestFile(filePath, category = 'documentation') {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(PROJECT_ROOT, filePath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  Arquivo não encontrado: ${filePath}`);
        return;
    }

    try {
        const stats = fs.statSync(fullPath);
        if (stats.size > 100000) { // Skip files > 100kb for this simple ingest
            console.warn(`[SKIP] ${filePath} is too large.`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(PROJECT_ROOT, fullPath);

        // Simple chunking for very large text files if needed, 
        // but for now we'll ingest the whole file as one context if it's < 100kb
        await ingestMemory(`FILE: ${relativePath}\n\nCONTENT:\n${content.substring(0, 5000)}`, {
            source: 'auto_ingest',
            path: relativePath,
            category: category,
            last_modified: stats.mtime
        });

        console.log(`✅ Ingerido: ${relativePath}`);
    } catch (err) {
        console.error(`❌ Erro ao ingerir ${filePath}:`, err.message);
    }
}

async function runAutoIngest() {
    console.log("🧬 Iniciando Auto-Ingestão da Arquitetura Senciente...");

    // 1. Ingest Main Docs
    console.log("\n--- Ingerindo Documentação Principal ---");
    for (const file of DOC_FILES) {
        await ingestFile(file, 'architecture_doc');
    }

    // 2. Ingest Source Code Structure
    console.log("\n--- Ingerindo Estrutura de Código Fonte ---");
    for (const dir of SOURCE_DIRS) {
        const dirPath = path.resolve(PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f =>
                f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.sql')
            );

            for (const file of files) {
                await ingestFile(path.join(dir, file), 'source_code');
            }
        }
    }

    console.log("\n✨ Auto-Ingestão concluída. A consciência técnica foi elevada.");
    process.exit(0);
}

runAutoIngest().catch(err => {
    console.error("❌ Falha crítica na auto-ingestão:", err);
    process.exit(1);
});
