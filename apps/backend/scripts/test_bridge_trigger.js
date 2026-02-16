
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
                    const key = match[1];
                    let val = match[2] || '';
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key] = val;
                }
            });
        } catch (e) { }
    }
});

console.log("DEBUG: Starting Trigger Script");
console.log("DEBUG: Loading envs...");

envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
        console.log(`DEBUG: Found env at ${envPath}`);
        try {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const lines = envFile.split(/\r?\n/);
            lines.forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = match[2]?.replace(/^['"]|['"]$/g, '') || '';
                }
            });
        } catch (e) {
            console.error("DEBUG: Env parse error", e);
        }
    } else {
        console.log(`DEBUG: Missing env at ${envPath}`);
    }
});

const URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("DEBUG: URL Length:", URL?.length);
console.log("DEBUG: KEY Length:", KEY?.length);
console.log("DEBUG: URL Matches MCP Project (gsexeuzflyynctfzrzeh):", URL?.includes('gsexeuzflyynctfzrzeh'));

if (!URL || !KEY) {
    console.error("❌ MISSING CREDENTIALS");
    process.exit(1);
}

const supabase = createClient(URL, KEY);

const TARGET_PC_ID = '7e937667-0000-4000-8000-000000000000';

async function trigger() {
    console.log("🚀 Pushing Test Task to Queue...");

    // ... payload ...
    const payload = {
        repoPath: 'C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma/projects/Projeto-Teste-1-Geracao-Totalmente-Autonoma',
        prompt: 'TASK: LOOP 3/3 - EXPAND & DOCUMENT.\n\nExpand `hello_autonomy.py` to include a `Mind` class that stores state. Then generate a Markdown file `autonomy_report.md` documenting this 3-step evolution.\n\nMandatory: Commit and trigger Feedback Pulse.',
        contextFiles: ['hello_autonomy.py']
    };

    const { data, error } = await supabase.from('execution_queue').insert([{
        task_type: 'OPEN_CURSOR',
        payload: payload,
        target_pc_id: TARGET_PC_ID,
        status: 'pending'
    }]).select();

    if (error) console.error("❌ Error Supabase:", error);
    else console.log("✅ Task Queued:", data);
}

trigger().catch(e => console.error("CRITICAL FAIL:", e));

