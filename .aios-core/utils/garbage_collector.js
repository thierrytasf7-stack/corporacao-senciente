import { promises as fs } from 'fs';
import path from 'path';

class GarbageCollector {
    constructor() {
        this.logRetentionDays = 30;
    }

    async run() {
        console.log("🧹 Inciando Garbage Collection...");
        await this.purgeOldLogs();
        await this.clearTempFiles();
        console.log("✅ Garbage Collection Finalizada.");
    }

    async purgeOldLogs() {
        const logDir = path.resolve(process.cwd(), 'logs');
        try {
            const dirs = await fs.readdir(logDir);
            const now = new Date();
            
            for (const dir of dirs) {
                // Expects YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dir)) {
                    const dirDate = new Date(dir);
                    const diffDays = (now - dirDate) / (1000 * 60 * 60 * 24);
                    
                    if (diffDays > this.logRetentionDays) {
                        console.log(`🗑️ Deletando logs antigos: ${dir}`);
                        await fs.rm(path.join(logDir, dir), { recursive: true, force: true });
                    }
                }
            }
        } catch (e) {
            console.error("Failed to purge logs", e.message);
        }
    }

    async clearTempFiles() {
        // Placeholder for temp dir cleaning
        const tempDir = path.resolve(process.cwd(), 'temp');
        try {
            await fs.mkdir(tempDir, { recursive: true });
            // Add logic to clear contents but not the dir itself
        } catch (e) {}
    }
}

export default GarbageCollector;
