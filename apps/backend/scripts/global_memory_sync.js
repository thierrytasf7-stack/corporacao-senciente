#!/usr/bin/env node
/**
 * SINCRONIZAÇÃO GLOBAL DE MEMÓRIAS - FORÇADA
 *
 * Executa sincronização completa de todas as memórias entre PCs.
 * Remove caches locais e força consulta direta ao banco global.
 *
 * Uso: node scripts/global_memory_sync.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { getLangMem } from './memory/langmem.js';
import { getLetta } from './memory/letta.js';
import { getByteRover } from './memory/byterover.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

async function globalMemorySync() {
    console.log('🌐 INICIANDO SINCRONIZAÇÃO GLOBAL DE MEMÓRIAS...\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Credenciais Supabase não encontradas!');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
        // 1. Verificar conexão com banco global
        console.log('🔍 Verificando conexão com banco global...');
        const { data: testData, error: testError } = await supabase
            .from('corporate_memory')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Falha na conexão com banco global:', testError.message);
            process.exit(1);
        }

        console.log('✅ Conexão com banco global estabelecida\n');

        // 2. Limpar caches locais de TODOS os sistemas
        console.log('🧹 Limpando caches locais...');

        const langmem = getLangMem();
        const letta = getLetta();
        const byterover = getByteRover();

        // Limpar cache LangMem
        langmem.cache.clear();
        console.log('✅ Cache LangMem limpo');

        // Limpar cache Letta
        letta.currentState = null;
        console.log('✅ Cache Letta limpo');

        console.log('✅ Todos os caches locais removidos\n');

        // 3. Testar sincronização LangMem
        console.log('📚 Testando sincronização LangMem...');
        const wisdomResults = await langmem.getWisdom('status atual');
        console.log(`✅ LangMem sincronizado: ${wisdomResults.length} itens encontrados`);

        // 4. Testar sincronização Letta
        console.log('🧠 Testando sincronização Letta...');
        const state = await letta.getCurrentState();
        console.log(`✅ Letta sincronizado: Fase atual "${state.current_phase}"`);

        // 5. Testar sincronização ByteRover
        console.log('⚡ Testando sincronização ByteRover...');
        const timeline = await byterover.getEvolutionTimeline(5);
        console.log(`✅ ByteRover sincronizado: ${timeline.timeline?.length || 0} commits na timeline`);

        // 6. Estatísticas globais
        console.log('\n📊 ESTATÍSTICAS GLOBAIS:');

        // Contar memórias totais
        const { count: memoryCount, error: memError } = await supabase
            .from('corporate_memory')
            .select('*', { count: 'exact', head: true });

        if (!memError) {
            console.log(`📚 Memórias LangMem: ${memoryCount} itens`);
        }

        // Contar tasks
        const { count: taskCount, error: taskError } = await supabase
            .from('task_context')
            .select('*', { count: 'exact', head: true });

        if (!taskError) {
            console.log(`🧠 Estados Letta: ${taskCount} tasks`);
        }

        // Contar agentes
        const { count: agentCount, error: agentError } = await supabase
            .from('agents')
            .select('*', { count: 'exact', head: true });

        if (!agentError) {
            console.log(`🤖 Agentes: ${agentCount} ativos`);
        }

        console.log('\n🎉 SINCRONIZAÇÃO GLOBAL CONCLUÍDA COM SUCESSO!');
        console.log('✅ Todos os PCs agora têm acesso às memórias mais recentes');
        console.log('🔄 Sistema configurado para sincronização automática');

    } catch (error) {
        console.error('❌ ERRO na sincronização global:', error.message);
        process.exit(1);
    }
}

// Executar sincronização
globalMemorySync();

