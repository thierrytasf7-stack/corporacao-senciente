import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class HallucinationLogger {
    constructor() {
        this.logPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'hallucinations.jsonl');
    }

    async log(context, output, confidence, type = 'suspected') {
        const entry = {
            id: Date.now().toString(36),
            timestamp: new Date().toISOString(),
            type: type,
            confidence: confidence,
            context_summary: context.substring(0, 100),
            output_snippet: output.substring(0, 100),
            reviewed: false
        };

        const line = JSON.stringify(entry) + '
';
        await fs.appendFile(this.logPath, line);
        return entry.id;
    }

    async getStats() {
        try {
            const content = await fs.readFile(this.logPath, 'utf-8');
            const lines = content.trim().split('
');
            return {
                total_events: lines.length,
                last_event: lines.length > 0 ? JSON.parse(lines[lines.length - 1]).timestamp : null
            };
        } catch (e) {
            return { total_events: 0 };
        }
    }
}

// Decorator Pattern Simulation (Wrapper)
export function monitorHallucination(fn, threshold = 0.7) {
    const logger = new HallucinationLogger();
    
    return async function(...args) {
        const result = await fn(...args);
        
        // Simulação de verificação de confiança (em produção viria do modelo)
        const confidence = result.confidence || 0.9; 
        
        if (confidence < threshold) {
            console.warn(`⚠️ Alerta de Alucinação (Confiança: ${confidence})`);
            await logger.log(JSON.stringify(args), JSON.stringify(result), confidence);
        }
        
        return result;
    };
}

export default HallucinationLogger;
