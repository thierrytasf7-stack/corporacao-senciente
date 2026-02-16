
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve('C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;
const TARGET_PC_ID = '7e937667-0000-4000-8000-000000000000'; // Hardcoded for this test
const REPO_PATH = 'C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma/projects/Projeto-Teste-1-Geracao-Totalmente-Autonoma';

const supabase = createClient(supabaseUrl, supabaseKey);

const STEPS = [
    {
        name: "STEP 1: INITIALIZE CHAOS",
        prompt: `TASK: SEQUENCE 1/5 - INIT.

Create a file \`chaos_simulation.py\`.
Define a basic class \`ChaosWorld\` with a constructor that takes a \`size\` parameter.
Print "Chaos Initialized" in the main block.

MANDATORY: Commit & Run Feedback Pulse.`
    },
    {
        name: "STEP 2: ADD ENTITIES",
        prompt: `TASK: SEQUENCE 2/5 - ENTITIES.

Update \`chaos_simulation.py\`.
Add an \`Entity\` class.
Add a method \`add_entity\` to \`ChaosWorld\`.

MANDATORY: Commit & Run Feedback Pulse.`
    },
    {
        name: "STEP 3: SIMULATE LOOP",
        prompt: `TASK: SEQUENCE 3/5 - LOOP.

Update \`chaos_simulation.py\`.
Implement a \`run_step\` method in \`ChaosWorld\` that moves entities randomly.
Run 10 steps in the main block.

MANDATORY: Commit & Run Feedback Pulse.`
    },
    {
        name: "STEP 4: LOGGING",
        prompt: `TASK: SEQUENCE 4/5 - LOGS.

Create \`simulation.log\` by redirecting output or writing to file in \`chaos_simulation.py\`.
Ensure the execution creates this file.

MANDATORY: Commit & Run Feedback Pulse.`
    },
    {
        name: "STEP 5: ANALYZE",
        prompt: `TASK: SEQUENCE 5/5 - REPORT.

Create \`chaos_report.md\`.
Read \`simulation.log\` (if exists) or just summarize the code structure of \`chaos_simulation.py\`.
Write a short analysis.

MANDATORY: Commit & Run Feedback Pulse.`
    }
];

async function waitForCompletion(taskId) {
    console.log(`⏳ Waiting for Task ${taskId} to complete...`);
    let retries = 0;
    while (true) {
        const { data } = await supabase.from('execution_queue').select('status, result_log').eq('id', taskId).single();

        // The Daemon sets it to 'completed' immediately after typing (Bridge Logic).
        // BUT the Feedback Pulse updates it AGAIN with the real result log.
        // We really want to wait for the Feedback Pulse.
        // The Bridge sets result_log to 'Cursor opened...' initially.
        // The Pulse sets result_log to 'Task Completed: ...'

        if (data && data.result_log && data.result_log.startsWith('Task Completed')) {
            console.log(`✅ Pulse Received: ${data.result_log}`);
            return true;
        }

        if (retries > 60) { // 5 minutes timeout
            console.log("❌ Timeout waiting for pulse.");
            return false;
        }

        await new Promise(r => setTimeout(r, 5000)); // Poll every 5s
        retries++;
    }
}

async function runSequence() {
    console.log("🚀 STARTING 5-STEP AUTONOMY SEQUENCE");

    for (const step of STEPS) {
        console.log(`\n\n🔹 PROCESSING: ${step.name}`);

        // 1. Push Task
        const payload = {
            repoPath: REPO_PATH,
            prompt: step.prompt,
            contextFiles: ['chaos_simulation.py']
        };

        const { data, error } = await supabase
            .from('execution_queue')
            .insert({
                task_type: 'OPEN_CURSOR',
                payload: payload,
                target_pc_id: TARGET_PC_ID,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Failed to push task:", error);
            break;
        }

        const taskId = data.id;
        console.log(`   Task ID: ${taskId} pushed.`);

        // 2. Wait for Brain Pulse (Feedback)
        const success = await waitForCompletion(taskId);

        if (!success) {
            console.log("⛔ Sequence Aborted due to timeout or failure.");
            break;
        }

        console.log("   Cooldown 10s...");
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log("\n✅ SEQUENCE FINISHED.");
}

runSequence();
