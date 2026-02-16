
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../frontend/.env')
];

envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
        try {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const lines = envFile.split(/\r?\n/);
            lines.forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = match[2]?.replace(/^['"]|['"]$/g, '') || '';
                }
            });
        } catch (e) { }
    }
});

const URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

const TASK_ID = process.argv[2];

if (!TASK_ID) {
    console.error("Please provide a Task ID");
    process.exit(1);
}

async function check() {
    console.log(`🔍 Checking Task ${TASK_ID}...`);
    const { data, error } = await supabase.from('execution_queue').select('*').eq('id', TASK_ID).single();
    if (error) console.error("❌ Error:", error);
    else console.log("📊 Status:", data.status, "| Result:", data.result_log);
}

check();
