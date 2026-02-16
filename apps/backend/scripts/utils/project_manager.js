import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');

/**
 * Project Manager Utility
 */
export async function createProject(name, tag) {
    const projectDir = path.join(rootPath, 'projects');
    const templatePath = path.join(projectDir, 'TEMPLATE.md');
    const newProjectPath = path.join(projectDir, `${tag.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_')}.md`);

    if (fs.existsSync(newProjectPath)) {
        throw new Error('Projeto já existe!');
    }

    let template = fs.readFileSync(templatePath, 'utf8');
    template = template.replace(/NOME DO PROJETO/g, name.toUpperCase());
    template = template.replace(/\[TAG\]/g, tag.toUpperCase());

    fs.writeFileSync(newProjectPath, template);
    return newProjectPath;
}

// CLI Integration if called directly
if (process.argv[2] === 'create') {
    const name = process.argv[3];
    const tag = process.argv[4];
    if (!name || !tag) {
        console.error('Uso: node project_manager.js create "Nome do Projeto" TAG');
        process.exit(1);
    }
    createProject(name, tag).then(p => console.log(`Projeto criado: ${p}`)).catch(e => console.error(e.message));
}
