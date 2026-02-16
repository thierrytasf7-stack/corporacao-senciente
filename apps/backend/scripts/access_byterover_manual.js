
import { getByteRover } from './memory/byterover.js';
import { logger } from './utils/logger.js';

// Suppress excessive logging for this CLI output
logger.level = 'error';

async function main() {
    console.log('🔍 Acessando Memória Byterover (via LangMem/Supabase)...');

    const byterover = getByteRover();

    try {
        // Query 1: Status Geral
        console.log('\n--- Status do Projeto ---');
        const status = await byterover.retrieveKnowledge('status atual do projeto roadmap fase');

        if (status && status.length > 0) {
            status.forEach((item, index) => {
                console.log(`\n[${index + 1}] Categoria: ${item.category}`);
                // Safely handle content if it's an object or string
                let content = item.content;
                try {
                    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
                        const parsed = JSON.parse(content);
                        content = parsed.content || parsed;
                    }
                } catch (e) { } // ignore parse error

                console.log(`Conteúdo: ${typeof content === 'string' ? content.substring(0, 500) : JSON.stringify(content).substring(0, 500)}...`);
            });
        } else {
            console.log('Nenhuma informação de status encontrada.');
        }

        // Query 2: Próximos Passos / Pendências
        console.log('\n--- Próximos Passos & Pendências ---');
        const nextSteps = await byterover.retrieveKnowledge('próximos passos pendências auditoria');

        if (nextSteps && nextSteps.length > 0) {
            nextSteps.forEach((item, index) => {
                // Avoid duplication if the same item returned
                if (status.some(s => s.content === item.content)) return;

                console.log(`\n[${index + 1}] Categoria: ${item.category}`);
                let content = item.content;
                console.log(`Conteúdo: ${typeof content === 'string' ? content.substring(0, 300) : JSON.stringify(content).substring(0, 300)}...`);
            });
        }

    } catch (error) {
        console.error('Erro ao acessar Byterover:', error);
    }
}

main();
