import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    console.log('--- Verificando Tabelas ---');

    // Check corporate_memory
    const { data: wisdom, error: wisdomError } = await supabase
        .from('corporate_memory')
        .select('count', { count: 'exact' });

    if (wisdomError) {
        console.error('Erro ao acessar corporate_memory:', wisdomError.message);
    } else {
        console.log('corporate_memory count:', wisdom[0]?.count || 0);
    }

    // Check task_context
    const { data: tasks, error: tasksError } = await supabase
        .from('task_context')
        .select('count', { count: 'exact' });

    if (tasksError) {
        console.error('Erro ao acessar task_context:', tasksError.message);
    } else {
        console.log('task_context count:', tasks[0]?.count || 0);
    }
}

checkTables();
