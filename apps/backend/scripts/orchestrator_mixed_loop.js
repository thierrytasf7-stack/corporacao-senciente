
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve('C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;
const TARGET_PC_ID = '7e937667-0000-4000-8000-000000000000';

// REPOS
const REPO_PROJECT = 'C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma/projects/Projeto-Teste-1-Geracao-Totalmente-Autonoma';
const REPO_BRAIN = 'C:/Users/Ryzen/Desktop/GITHUB/Coorporacao autonoma';

const supabase = createClient(supabaseUrl, supabaseKey);

const STEPS = [
    // --- BATCH 1: EXTERNAL ACTION ---
    {
        name: "1. PROJECT: INIT MODULE",
        repo: REPO_PROJECT,
        prompt: `TASK: MIXED LOOP 1/6 (ACTION).
Create \`mixed_module.py\` in the project repo.
Add a simple function \`action_one()\`.
MANDATORY: Commit & Pulse.`
    },
    {
        name: "2. PROJECT: EXPAND MODULE",
        repo: REPO_PROJECT,
        prompt: `TASK: MIXED LOOP 2/6 (ACTION).
Update \`mixed_module.py\`. Add \`action_two()\`.
MANDATORY: Commit & Pulse.`
    },

    // --- BATCH 2: INTERNAL BRAIN EVOLUTION ---
    {
        name: "3. BRAIN: SELF-REFLECTION LOG",
        repo: REPO_BRAIN,
        prompt: `TASK: MIXED LOOP 3/6 (BRAIN).
You are operating on the BRAIN repository itself.
Create a file \`knowledge/self_reflection_test.md\`.
Log this event: "The Brain is modifying itself."
MANDATORY: Commit & Pulse.
WARNING: Be careful not to break existing scripts.`
    },

    // --- BATCH 3: EXTERNAL ACTION ---
    {
        name: "4. PROJECT: INTEGRATE",
        repo: REPO_PROJECT,
        prompt: `TASK: MIXED LOOP 4/6 (ACTION).
Create \`main_entry.py\` that imports \`mixed_module\`.
MANDATORY: Commit & Pulse.`
    },
    {
        name: "5. PROJECT: TEST",
        repo: REPO_PROJECT,
        prompt: `TASK: MIXED LOOP 5/6 (ACTION).
Create \`test_mixed.py\` and write a unit test for \`mixed_module.py\`.
MANDATORY: Commit & Pulse.`
    },

    // --- BATCH 4: INTERNAL BRAIN EVOLUTION ---
    {
        name: "6. BRAIN: ARCHIVE",
        repo: REPO_BRAIN,
        prompt: `TASK: MIXED LOOP 6/6 (BRAIN).
Update \`knowledge/self_reflection_test.md\`.
Append: "Mixed loop sequence completed successfully."
MANDATORY: Commit & Pulse.`
    }
];

async function waitForCompletion(taskId) {
    console.log(`⏳ Waiting for Task ${taskId}...`);
    let retries = 0;
    while (true) {
        const { data } = await supabase.from('execution_queue').select('status, result_log').eq('id', taskId).single();

        if (data && data.result_log && data.result_log.startsWith('Task Completed')) {
            console.log(`✅ Pulse Received: ${data.result_log}`);
            return true;
        }

        if (retries > 60) {
            console.log("❌ Timeout waiting for pulse.");
            return false;
        }

        await new Promise(r => setTimeout(r, 5000));
        retries++;
    }
}

async function runSequence() {
    console.log("🚀 STARTING MIXED LOOP SEQUENCE (6 STEPS)");
    console.log(`POJECT REPO: ${REPO_PROJECT}`);
    console.log(`BRAIN  REPO: ${REPO_BRAIN}`);

    for (const step of STEPS) {
        console.log(`\n\n🔹 PROCESSING: ${step.name}`);
        console.log(`   TARGET: ${step.repo === REPO_PROJECT ? 'EXTERNAL PROJECT' : '🧠 BRAIN CORE'}`);

        const payload = {
            repoPath: step.repo,
            prompt: step.prompt,
            contextFiles: []
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

        const success = await waitForCompletion(taskId);

        if (!success) {
            console.log("⛔ Sequence Aborted.");
            break;
        }

        console.log("   Cooldown 10s...");
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log("\n✅ MIXED SEQUENCE FINISHED.");
}

runSequence();
