
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

async function checkLastMemory() {
    console.log(`📡 Conectando a: ${SUPABASE_URL}`);
    console.log(`🔑 Usando Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Sim' : 'Não'}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verificar conteúdo direto da tabela (Raw SQL Access via Client)
    console.log('\n--- Buscando Últimas 3 Entradas na Memória ---');
    const { data, error } = await supabase
        .from('corporate_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error('❌ Erro Supabase:', error);
    } else {
        if (data.length === 0) {
            console.log('⚠️ Tabela corporate_memory VAZIA neste banco!');
        } else {
            data.forEach((item, i) => {
                console.log(`\n[${i + 1}] ID: ${item.id} | Data: ${item.created_at}`);
                console.log(`Conteúdo (início): ${item.content.substring(0, 100)}...`);
            });
        }
    }

    // 2. Verificar se existe divergência de tabelas
    const { data: tables } = await supabase.from('information_schema.tables').select('*').limit(1);
    console.log(`\n✅ Conexão estabelecida com sucesso. Acesso ao banco verificado.`);
}

checkLastMemory();
