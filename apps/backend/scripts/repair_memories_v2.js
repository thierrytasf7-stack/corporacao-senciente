
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import EmbeddingsService from './utils/embeddings_service.js';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize Embeddings Service
const embeddingsService = new EmbeddingsService();

async function repairLatestMemories() {
    console.log('🔧 INICIANDO REPARO DE MEMÓRIAS (V2)...');

    // 1. Fetch latest broken memories
    const { data: memories, error } = await supabase
        .from('corporate_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

    if (error) {
        console.error('❌ Erro ao buscar memórias:', error);
        return;
    }

    if (!memories || memories.length === 0) {
        console.log('⚠️ Nenhuma memória encontrada para reparar.');
        return;
    }

    for (const memory of memories) {
        console.log(`\n🛠️ Processando ID: ${memory.id} (Categoria: ${memory.category})`);

        // 2. Clean Content
        let cleanContent = memory.content;
        let originalWasJson = false;

        // Tenta parsear se for JSON stringificado
        try {
            if (typeof cleanContent === 'string' && (cleanContent.startsWith('{') || cleanContent.startsWith('"'))) {
                const parsed = JSON.parse(cleanContent);
                if (parsed.content) {
                    cleanContent = parsed.content;
                    originalWasJson = true;
                } else if (parsed.overview) { // Fallback for specific structure
                    cleanContent = JSON.stringify(parsed); // Keep structure but cleaner
                }
            }
        } catch (e) {
            // Not JSON, ignore
        }

        // Remove wrapper quotes if any
        if (typeof cleanContent === 'string' && cleanContent.startsWith('"') && cleanContent.endsWith('"')) {
            cleanContent = cleanContent.slice(1, -1);
        }

        // Replace literal \n with real newlines
        cleanContent = cleanContent.replace(/\\n/g, '\n');

        console.log(`   📝 Conteúdo Limpo (início): ${cleanContent.substring(0, 50)}...`);

        // 3. Generate NEW Embedding
        console.log('   🧠 Gerando novo embedding...');
        try {
            const newEmbedding = await embeddingsService.generateEmbedding(cleanContent);

            if (!newEmbedding || newEmbedding.length === 0) {
                throw new Error('Embedding vazio gerado');
            }

            // 4. Update Supabase
            console.log('   💾 Atualizando Supabase...');
            const { error: updateError } = await supabase
                .from('corporate_memory')
                .update({
                    content: cleanContent, // Save the cleaner version
                    embedding: newEmbedding
                })
                .eq('id', memory.id);

            if (updateError) {
                console.error(`   ❌ Falha no update: ${updateError.message}`);
            } else {
                console.log(`   ✅ SUCESSO! Memória ${memory.id} reparada e reindexada.`);
            }

        } catch (err) {
            console.error(`   ❌ Erro durante reindexação: ${err.message}`);
        }
    }

    console.log('\n✨ Reparo concluído.');
}

repairLatestMemories();
