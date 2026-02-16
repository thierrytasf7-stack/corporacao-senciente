import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    const { data, error } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .in('id', [286, 285, 284])
        .limit(3);

    if (error) {
        console.error('Erro:', error);
    } else {
        console.log('VERIFICAÇÃO DE DIMENSÕES:');
        data.forEach(mem => {
            console.log(`ID ${mem.id}: ${mem.embedding ? mem.embedding.length : 0} dimensões`);
        });
    }
})();

