import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple TF-IDF / Keyword matching RAG for bootstrap (No heavy deps)
class RagEngine {
    constructor() {
        this.knowledgeBase = [];
        this.basePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'axioms');
    }

    async indexAxioms() {
        try {
            const truthPath = path.join(this.basePath, 'truth_base.yaml');
            const content = await fs.readFile(truthPath, 'utf-8');
            
            // Naive parsing for YAML lines
            const lines = content.split('
');
            lines.forEach((line, idx) => {
                if (line.includes('statement:')) {
                    this.knowledgeBase.push({
                        id: `axiom-${idx}`,
                        content: line.split('statement:')[1].replace(/"/g, '').trim(),
                        source: 'truth_base.yaml'
                    });
                }
            });
            console.log(`📚 Indexed ${this.knowledgeBase.length} facts.`);
        } catch (e) {
            console.error("Failed to index axioms");
        }
    }

    async retrieve(query, limit = 3) {
        if (this.knowledgeBase.length === 0) await this.indexAxioms();

        const queryTerms = query.toLowerCase().split(/\s+/);
        
        const scored = this.knowledgeBase.map(doc => {
            let score = 0;
            queryTerms.forEach(term => {
                if (term.length > 3 && doc.content.toLowerCase().includes(term)) {
                    score += 1;
                }
            });
            return { ...doc, score };
        });

        return scored
            .filter(d => d.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
}

export default RagEngine;
