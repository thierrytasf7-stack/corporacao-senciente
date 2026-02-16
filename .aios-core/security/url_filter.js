import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class UrlFilter {
    constructor() {
        this.whitelistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'source_whitelist.json');
        this.cache = null;
    }

    async loadRules() {
        if (this.cache) return this.cache;
        try {
            const data = await fs.readFile(this.whitelistPath, 'utf-8');
            this.cache = JSON.parse(data);
            return this.cache;
        } catch (e) {
            console.error("Failed to load whitelist");
            return { allowed_domains: [] };
        }
    }

    async isAllowed(urlStr) {
        const rules = await this.loadRules();
        try {
            const url = new URL(urlStr);
            const domain = url.hostname.replace('www.', '');
            
            // Check exact domain or subdomain
            const allowed = rules.allowed_domains.some(d => domain === d || domain.endsWith('.' + d));
            
            if (!allowed) {
                console.warn(`🚫 Acesso Bloqueado: ${domain} não está na Whitelist.`);
            }
            return allowed;
        } catch (e) {
            return false;
        }
    }
}

export default UrlFilter;
