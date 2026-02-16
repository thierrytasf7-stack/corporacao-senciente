#!/usr/bin/env node
/**
 * TESTE DE DIMENSÕES DE EMBEDDINGS
 */

import { getEmbeddingsService } from './utils/embeddings_service.js';

async function testEmbeddingDimensions() {
    console.log('🧮 TESTANDO DIMENSÕES DE EMBEDDING...\n');

    const service = getEmbeddingsService();

    try {
        const testText = 'teste de embedding para verificar dimensões';
        console.log(`📝 Texto de teste: "${testText}"`);

        const embedding = await service.generateEmbedding(testText);

        console.log(`📏 Dimensões geradas: ${embedding.length}`);
        console.log(`🔢 Primeiros 5 valores: [${embedding.slice(0, 5).map(x => x.toFixed(4)).join(', ')}]`);
        console.log(`🔢 Últimos 5 valores: [${embedding.slice(-5).map(x => x.toFixed(4)).join(', ')}]`);

        // Verificar se é 768 dimensões
        if (embedding.length === 768) {
            console.log('✅ SUCESSO! Modelo gera 768 dimensões - compatível com Supabase');
        } else if (embedding.length === 384) {
            console.log('⚠️ AINDA 384 DIMENSÕES - modelo bge-large não funcionou');
            console.log('🔄 Tentando mudar para OpenAI embeddings...');
            await testOpenAIEmbeddings();
        } else {
            console.log(`❌ DIMENSÃO INESPERADA: ${embedding.length}`);
            console.log('🔄 Tentando OpenAI como alternativa...');
            await testOpenAIEmbeddings();
        }

    } catch (error) {
        console.error('❌ Erro ao testar embeddings:', error.message);
        console.log('🔄 Tentando OpenAI como alternativa...');
        await testOpenAIEmbeddings();
    }
}

async function testOpenAIEmbeddings() {
    console.log('\n🔄 TESTANDO OPENAI EMBEDDINGS...\n');

    // Temporariamente mudar provider
    process.env.EMBEDDINGS_PROVIDER = 'openai';
    process.env.EMBEDDINGS_MODEL = 'text-embedding-3-small';

    try {
        // Recarregar serviço
        delete require.cache[require.resolve('./utils/embeddings_service.js')];
        const { getEmbeddingsService } = await import('./utils/embeddings_service.js');
        const service = getEmbeddingsService();

        const testText = 'teste openai embedding';
        const embedding = await service.generateEmbedding(testText);

        console.log(`📏 OpenAI dimensões: ${embedding.length}`);

        if (embedding.length === 1536) {
            console.log('✅ OpenAI gera 1536 dimensões - compatível!');
            console.log('🎯 SOLUÇÃO: Mudar para OpenAI embeddings');
        } else {
            console.log(`❌ OpenAI também incompatível: ${embedding.length} dimensões`);
        }

    } catch (error) {
        console.error('❌ Erro com OpenAI:', error.message);
        console.log('💡 SOLUÇÃO ALTERNATIVA: Reconfigurar função Supabase para aceitar 384 dimensões');
    }
}

testEmbeddingDimensions();

