import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkRealDimensions() {
    console.log('🔍 VERIFICAÇÃO CORRETA DAS DIMENSÕES (string → array)\n');

    const { data, error } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .in('id', [286, 285])
        .limit(2);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    data.forEach(mem => {
        const embeddingStr = mem.embedding;
        console.log(`ID ${mem.id}:`);
        console.log(`  String length: ${embeddingStr.length} chars`);

        try {
            // Converter string JSON para array
            const embeddingArray = JSON.parse(embeddingStr);
            console.log(`  Array dimensions: ${embeddingArray.length} ✅`);
            console.log(`  Tipo: ${typeof embeddingArray} (array)`);
            console.log(`  Primeiros 3 valores: [${embeddingArray.slice(0, 3).map(x => x.toFixed(4)).join(', ')}]`);
        } catch (e) {
            console.log(`  ❌ Erro ao parsear JSON: ${e.message}`);
        }
        console.log('');
    });
}

checkRealDimensions().catch(console.error);

