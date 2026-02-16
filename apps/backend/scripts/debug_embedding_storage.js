import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function debugEmbeddingStorage() {
    console.log('🔍 DEBUG: Verificando armazenamento de embeddings\n');

    // Gerar embedding
    const testText = 'teste simples de embedding';
    const embedding = await embeddingsService.generateEmbedding(testText);

    console.log(`Embedding gerado: ${embedding.length} dimensões`);
    console.log(`Tipo: ${typeof embedding}`);
    console.log(`Primeiros 5 valores: [${embedding.slice(0, 5).map(x => x.toFixed(4)).join(', ')}]\n`);

    // Converter embedding para string JSON (como no LangMem)
    const embeddingStr = `[${embedding.join(',')}]`;
    console.log(`📤 Enviando embedding como string: ${embeddingStr.length} chars`);

    // Inserir teste
    console.log('📤 Inserindo no Supabase...');
    const { error: insertError } = await supabase
        .from('corporate_memory')
        .insert({
            content: 'teste debug embedding storage',
            category: 'debug',
            embedding: embeddingStr
        });

    if (insertError) {
        console.log(`❌ Erro no insert: ${insertError.message}`);
        return;
    }

    console.log('✅ Insert realizado');

    // Verificar armazenamento
    const { data: stored, error: selectError } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .eq('content', 'teste debug embedding storage')
        .single();

    if (selectError) {
        console.log(`❌ Erro na consulta: ${selectError.message}`);
        return;
    }

    console.log(`📦 Embedding armazenado: ${stored.embedding?.length || 0} dimensões`);
    console.log(`📦 Tipo armazenado: ${typeof stored.embedding}`);

    if (stored.embedding && stored.embedding.length !== embedding.length) {
        console.log('\n🚨 PROBLEMA DETECTADO:');
        console.log(`   Enviado: ${embedding.length} dimensões`);
        console.log(`   Armazenado: ${stored.embedding.length} dimensões`);
        console.log('   Diferença:', Math.abs(stored.embedding.length - embedding.length));
    } else {
        console.log('\n✅ Embedding armazenado corretamente');
    }

    // Limpar
    await supabase
        .from('corporate_memory')
        .delete()
        .eq('content', 'teste debug embedding storage');

    console.log('\n🧹 Teste limpo');
}

debugEmbeddingStorage().catch(console.error);
