
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRecentTasks() {
    console.log("🔍 Checking recent completed tasks...");

    const { data, error } = await supabase
        .from('execution_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    data.forEach(task => {
        console.log(`\n[${task.status.toUpperCase()}] ${task.task_type}`);
        console.log(`ID: ${task.id}`);
        console.log(`Prompt Preview: ${task.payload.prompt.substring(0, 50)}...`);
        console.log(`Result Log: ${task.result_log}`);
        console.log(`Completed At: ${task.completed_at}`);
        console.log("-".repeat(40));
    });
}

listRecentTasks();
