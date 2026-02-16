
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ID of Step 1 Task (Found in orchestrator output: 5755785e-696f-4dd4-9d21-084325a8269f)
const TASK_ID = '5755785e-696f-4dd4-9d21-084325a8269f';

async function markComplete() {
    console.log(`Manually completing task ${TASK_ID}...`);

    // Simulate what feedback_pulse.py would have done
    const { error } = await supabase
        .from('execution_queue')
        .update({
            status: 'completed',
            result_log: 'Task Completed: Manual Override (Chaos Init verified by User)'
        })
        .eq('id', TASK_ID);

    if (error) console.error("Error:", error);
    else console.log("✅ Success. Orchestrator should pick this up shortly.");
}

markComplete();
