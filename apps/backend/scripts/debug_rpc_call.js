
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import EmbeddingsService from './utils/embeddings_service.js';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const svc = new EmbeddingsService();

async function testRPC() {
    console.log('🧪 Testando chamada RPC match_corporate_memory...');

    const query = "Plano ultra-detalhado";
    const embedding = await svc.generateEmbedding(query);

    console.log(`Dimensões do vetor gerado: ${embedding.length}`);
    console.log(`Amostra: [${embedding.slice(0, 3).join(', ')}...]`);

    // Chamar RPC
    const { data, error } = await supabase.rpc('match_corporate_memory', {
        query_embedding: embedding, // Passando array diretamente (Supabase JS converte)
        match_count: 5
    });

    if (error) {
        console.error('❌ ERRO RPC:', error);

        // Tentar passando como string se falhar
        console.log('Tentando como string...');
        const { data: data2, error: error2 } = await supabase.rpc('match_corporate_memory', {
            query_embedding: `[${embedding.join(',')}]`,
            match_count: 5
        });

        if (error2) {
            console.error('❌ ERRO RPC (String):', error2);
        } else {
            console.log('✅ SUCESSO com String!');
            console.log('Resultados:', data2.length);
        }

    } else {
        console.log('✅ SUCESSO com Array!');
        console.log('Resultados:', data.length);
        if (data.length > 0) {
            console.log('Top 1 ID:', data[0].id);
            console.log('Top 1 Sim:', data[0].similarity);
            console.log('Top 1 Content:', data[0].content.substring(0, 50));
        }
    }
}

testRPC();
