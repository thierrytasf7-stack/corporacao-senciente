import { promises as fs } from 'fs';
import path from 'path';

class ObsolescenceScanner {
    constructor(rootDir = process.cwd()) {
        this.rootDir = rootDir;
        this.thresholdDays = 15;
    }

    async scan() {
        console.log("🔍 Escaneando por obsolescência...");
        const report = {
            deprecated_tags: [],
            inactive_files: []
        };

        // Simplificação: Escanear recursivamente por tags @deprecated
        await this.walk(this.rootDir, async (filePath) => {
            if (filePath.includes('node_modules') || filePath.includes('.git')) return;

            const content = await fs.readFile(filePath, 'utf-8');
            if (content.includes('@deprecated')) {
                report.deprecated_tags.push(filePath);
            }

            const stats = await fs.stat(filePath);
            const daysInactive = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
            if (daysInactive > this.thresholdDays && filePath.endsWith('.js')) {
                report.inactive_files.push({ path: filePath, last_mod: stats.mtime });
            }
        });

        return report;
    }

    async walk(dir, callback) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filepath = path.join(dir, file);
            const stats = await fs.stat(filepath);
            if (stats.isDirectory()) {
                await this.walk(filepath, callback);
            } else {
                await callback(filepath);
            }
        }
    }
}

export default ObsolescenceScanner;
