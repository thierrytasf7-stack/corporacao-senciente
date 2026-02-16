import { promises as fs } from 'fs';
import path from 'path';

export class SystemScanner {
    constructor() {
        this.projectRoot = process.cwd();
        this.inventoryPath = path.join(this.projectRoot, '.aios', 'component_inventory.json');
        this.scanPaths = [
            'src',
            'packages',
            'apps',
            'tools',
            'rust_components',
            'scripts'
        ];
    }

    async scan() {
        console.log('🔍 SCANNER: Iniciando varredura profunda do sistema...');
        const detectedComponents = [];

        for (const rootDir of this.scanPaths) {
            const fullPath = path.join(this.projectRoot, rootDir);
            try {
                await fs.access(fullPath); // Verifica se existe
                await this.traverseDirectory(fullPath, detectedComponents, rootDir);
            } catch (e) {
                // Diretório não existe, ignora
            }
        }

        return this.reconcileInventory(detectedComponents);
    }

    async traverseDirectory(currentPath, list, rootCategory) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        // Heurística de Componente: Tem arquivo de manifesto?
        const isNode = entries.some(e => e.name === 'package.json');
        const isRust = entries.some(e => e.name === 'Cargo.toml');
        const isPython = entries.some(e => e.name === 'requirements.txt' || e.name === 'pyproject.toml');
        
        // Se for um componente identificável
        if (isNode || isRust || isPython) {
            const relPath = path.relative(this.projectRoot, currentPath).split(path.sep).join('/');
            const name = path.basename(currentPath);
            
            let type = 'unknown';
            let lang = 'unknown';

            if (isNode) { type = 'module'; lang = 'node'; }
            if (isRust) { type = 'binary/lib'; lang = 'rust'; }
            if (isPython) { type = 'script/app'; lang = 'python'; }

            // Ajuste fino de tipo baseado na pasta raiz
            if (rootCategory === 'apps') type = 'application';
            if (rootCategory === 'tools') type = 'tool';
            if (rootCategory === 'packages') type = 'library';

            list.push({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                path: relPath,
                language: lang,
                type: type,
                detected_at: new Date().toISOString()
            });
            
            // Não aprofunda mais se já achou um componente (evita sub-pacotes de node_modules)
            return; 
        }

        // Se não for componente, continua descendo (mas ignora node_modules, target, venv, etc)
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (['node_modules', 'target', 'dist', 'build', '.git', '.venv', '__pycache__'].includes(entry.name)) continue;
                await this.traverseDirectory(path.join(currentPath, entry.name), list, rootCategory);
            }
        }
    }

    async reconcileInventory(detected) {
        let inventory = { version: "2.0", components: {} };

        // Tenta ler inventário existente
        try {
            const data = await fs.readFile(this.inventoryPath, 'utf8');
            inventory = JSON.parse(data);
        } catch (e) {
            console.log('✨ Criando novo inventário centralizado.');
        }

        const report = {
            new: [],
            existing: [],
            missing: []
        };

        // Marca todos existentes como "missing" inicialmente para checagem
        const existingIds = new Set(Object.keys(inventory.components));

        for (const item of detected) {
            if (inventory.components[item.id]) {
                // Atualiza metadados, mas preserva versão e histórico
                inventory.components[item.id].last_scan = new Date().toISOString();
                inventory.components[item.id].path = item.path; // Caso tenha movido
                report.existing.push(item.id);
                existingIds.delete(item.id);
            } else {
                // Novo componente descoberto!
                inventory.components[item.id] = {
                    ...item,
                    version: "0.1.0", // SemVer inicial
                    status: "discovered", // lifecycle status
                    quality_score: 0,
                    evolution_history: []
                };
                report.new.push(item.id);
            }
        }

        // O que sobrou em existingIds são componentes que sumiram do disco
        report.missing = Array.from(existingIds);

        // Salva inventário atualizado
        await fs.mkdir(path.dirname(this.inventoryPath), { recursive: true });
        await fs.writeFile(this.inventoryPath, JSON.stringify(inventory, null, 2));

        return { inventory, report };
    }
}
