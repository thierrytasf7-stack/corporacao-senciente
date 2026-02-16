import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

class IntegritySeal {
    constructor() {
        this.manifestPath = path.resolve(process.cwd(), '.aios-core/security/integrity_manifest.json');
        this.criticalFiles = [
            '.aios-core/identity/identity_core.yaml',
            '.aios-core/knowledge/axioms/truth_base.yaml',
            '.aios-core/security/source_whitelist.json'
        ];
    }

    async calculateHash(filePath) {
        try {
            const content = await fs.readFile(path.resolve(process.cwd(), filePath));
            return createHash('sha256').update(content).digest('hex');
        } catch (e) {
            return null;
        }
    }

    async seal() {
        const manifest = {
            timestamp: new Date().toISOString(),
            files: {}
        };

        for (const file of this.criticalFiles) {
            const hash = await this.calculateHash(file);
            if (hash) manifest.files[file] = hash;
        }

        await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
        console.log("🔒 Integridade Lacrada: Manifest gerado.");
    }

    async verify() {
        try {
            const data = await fs.readFile(this.manifestPath, 'utf-8');
            const manifest = JSON.parse(data);
            const violations = [];

            for (const [file, originalHash] of Object.entries(manifest.files)) {
                const currentHash = await this.calculateHash(file);
                if (currentHash !== originalHash) {
                    violations.push(file);
                }
            }

            return {
                valid: violations.length === 0,
                violations: violations
            };
        } catch (e) {
            return { valid: false, error: "Manifest missing or corrupt" };
        }
    }
}

export default IntegritySeal;
