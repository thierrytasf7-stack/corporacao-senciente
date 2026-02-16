import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');

/**
 * Update Documentation Index
 * Scans docs folder and generates/updates a central README or INDEX.md
 */
async function updateDocsIndex() {
    const docsDir = path.join(rootPath, 'docs');
    const indexFile = path.join(docsDir, 'INDEX.md');

    console.log('Scanning documentation...');

    const categories = fs.readdirSync(docsDir).filter(f => fs.lstatSync(path.join(docsDir, f)).isDirectory());

    let content = '# ÍNDICE DE DOCUMENTAÇÃO DA CORPORAÇÃO SENCIENTE\n\n';
    content += `*Última atualização automática: ${new Date().toLocaleString('pt-BR')}*\n\n`;

    for (const cat of categories) {
        if (cat.startsWith('_')) continue;

        content += `## 📂 ${cat.toUpperCase().replace(/-/g, ' ')}\n`;
        const files = fs.readdirSync(path.join(docsDir, cat)).filter(f => f.endsWith('.md'));

        for (const file of files) {
            const filePath = path.join(docsDir, cat, file);
            const title = file.replace('.md', '').replace(/-/g, ' ').replace(/_/g, ' ');
            content += `- [${title.toUpperCase()}](${cat}/${file})\n`;
        }
        content += '\n';
    }

    fs.writeFileSync(indexFile, content);
    console.log(`Índice atualizado em: ${indexFile}`);
}

updateDocsIndex().catch(console.error);
