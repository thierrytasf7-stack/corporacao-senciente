/**
 * Bridge Service Daemon
 * Polls Supabase for tasks and executes them on the local machine.
 * 
 * Usage: node scripts/daemon/bridge_service.js <PC_UUID>
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert __dirname to ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars manually
const envPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../frontend/.env')
];

envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
        console.log(`Loading env from: ${envPath}`);
        try {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const lines = envFile.split(/\r?\n/);
            lines.forEach(line => {
                // simple KEY=VAL parser
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let val = match[2] || '';
                    // Remove quotes if present
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key] = val;
                }
            });
            console.log(`Loaded keys from ${envPath}:`, Object.keys(process.env).filter(k => k.includes('SUPABASE')));
        } catch (e) {
            console.error(`Failed to parse ${envPath}`, e);
        }
    }
});

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const POLLING_INTERVAL = 3000; // 3 seconds

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase Credentials in .env');
    // For Dev ease, maybe we can hardcode or just warn?
    // process.exit(1); 
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// PC Identity (Passed as arg or hardcoded for dev)
const PC_ID = process.argv[2] || '00000000-0000-0000-0000-000000000000';
const HOSTNAME = os.hostname();

console.log(`🚀 Daemon Bridge Starting on ${HOSTNAME} (${PC_ID})`);
console.log(`📡 Connecting to Supabase...`);

/**
 * Main Loop
 */
async function startDaemon() {
    // 1. Send Heartbeat
    await sendHeartbeat();
    setInterval(sendHeartbeat, 60000); // Heartbeat every 1 minute

    // 2. Poll Tasks
    console.log('👀 Watching for tasks...');
    setInterval(pollTasks, POLLING_INTERVAL);
}

async function sendHeartbeat() {
    try {
        const specs = {
            platform: os.platform(),
            cpus: os.cpus().length,
            ram: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
        };

        await supabase.from('pc_hosts').upsert({
            id: PC_ID,
            hostname: HOSTNAME,
            status: 'online',
            last_seen_at: new Date().toISOString(),
            specs
        });
        // console.log('💓 Heartbeat sent');
    } catch (err) {
        console.error('💓 Heartbeat failed:', err.message);
    }
}

async function pollTasks() {
    try {
        // Call RPC function to pop next task atomically
        const { data: task, error } = await supabase.rpc('pop_next_task', {
            worker_pc_id: PC_ID
        });

        if (error) {
            console.error('Polling error:', error.message);
            return;
        }

        if (task) {
            console.log(`⚡ Executing Task [${task.task_type}]:`, task.id);
            await executeTask(task);
        }
    } catch (err) {
        console.error('Polling exception:', err);
    }
}

async function executeTask(task) {
    const { task_type, payload } = task;
    let resultLog = '';
    let success = false;

    try {
        if (task_type === 'OPEN_CURSOR') {
            // Inject Task ID for feedback loop
            payload.taskId = task.id;
            await handleOpenCursor(payload);
            resultLog = 'Cursor opened successfully with context.';
            success = true;
        } else if (task_type === 'RUN_SHELL') {
            resultLog = await handleRunShell(payload);
            success = true;
        } else {
            resultLog = 'Unknown Task Type';
        }
    } catch (err) {
        resultLog = `Error: ${err.message}`;
        console.error(`❌ Task Failed:`, err);
    }

    // Update Task Status
    await supabase.from('execution_queue').update({
        status: success ? 'completed' : 'failed',
        result_log: resultLog
    }).eq('id', task.id);

    console.log(`✅ Task [${task.id}] Completed.`);
}

/**
 * Handler: OPEN_CURSOR
 * Logic: Write _AI_CONTEXT.md -> Open Cursor
 */
async function handleOpenCursor(payload) {
    const { repoPath, prompt, contextFiles } = payload;

    // Normalize path for Windows
    const targetPath = path.normalize(repoPath);

    if (!fs.existsSync(targetPath)) {
        console.error(`Repository path not found: ${targetPath}`);
        throw new Error(`Repository path not found: ${targetPath}`);
    }

    // 1. Write Context File
    const contextFilePath = path.join(targetPath, '_AI_CONTEXT.md');
    // Ensure content is not circular or huge
    const relevantFiles = contextFiles ? JSON.stringify(contextFiles, null, 2) : 'No specific files logged.';

    const content = `# AI Instruction Context
    
**Goal**: ${prompt}

**Relevant Files**:
\`\`\`json
${relevantFiles}
\`\`\`

> [!TIP]
> Press Ctrl+L in Cursor and reference this file (@_AI_CONTEXT.md) to start.`;

    fs.writeFileSync(contextFilePath, content);
    console.log(`📝 Context written to ${contextFilePath}`);

    // 1b. Write Task ID for Feedback Script
    const taskContextPath = path.join(__dirname, '..', '..', '.current_task_context');
    // We write to root of repo to make it easy for the python script to find (it looks in ROOT/..)
    // Actually the python script looks in ROOT/.current_task_context relative to itself?
    // Let's write it to where the script expects it: repository root of "Coorporacao autonoma"

    // NOTE: 'targetPath' is the project being opened, NOT necessarily the repo where the bridge scripts live.
    // Ideally, the feedback script should be absolute path.

    // We will update the PROMPT to include the mandatory rules.
    const feedbackScriptPath = path.resolve(__dirname, '..', 'feedback_pulse.py').replace(/\\/g, '/'); // Normalize slashes

    const augmentedPrompt = `${prompt}

---
**MANDATORY OPERATIONAL RULES (PROTOCOL 1999)**:
1. **IMPLEMENT**: Perform the requested task.
2. **VERIFY**: Ensure code compiles/runs if possible.
3. **COMMIT**: Run \`git add . && git commit -m "AI: Task Completed"\`
4. **FEEDBACK PULSE**: You MUST run this command at the end:
   \`python "${feedbackScriptPath}" "Task Completed: [Brief Summary of Changes]"\`
   
   *This command invalidates the task in the central brain and logs your work.*
   *DO NOT SKIP THIS STEP.*
`;

    // Write context file with augmented prompt
    // Write context file with augmented prompt
    const taskIdPath = path.resolve(__dirname, '..', '..', '.current_task_context');
    // Using payload.taskId (we need to pass it) or 'unknown'
    fs.writeFileSync(taskIdPath, JSON.stringify({ taskId: payload.taskId || 'unknown' }, null, 2));

    // 1c. Create .cursorrules (Native Cursor AI Context)
    const rulesPath = path.join(targetPath, '.cursorrules');
    const rulesContent = `
# Project Rules & Current Objective

${augmentedPrompt}

# Context Files
${(contextFiles || []).map(f => `- ${f}`).join('\n')}

ALWAYS FOLLOW THESE INSTRUCTIONS IMMEDIATELY UPON OPENING.
`;
    fs.writeFileSync(rulesPath, rulesContent);
    console.log(`📝 .cursorrules written to ${rulesPath}`);

    // 1d. Copy to Clipboard (Windows)
    try {
        const proc = exec('clip');
        proc.stdin.write(augmentedPrompt);
        proc.stdin.end();
        console.log("📋 Augmented Prompt copied to clipboard!");
    } catch (e) {
        console.error("⚠️ Failed to copy to clipboard", e);
    }

    // 2. Open Cursor
    // We prioritize 'cursor' command. If it fails, we assume it's not in PATH or user uses 'code'.
    const cursorCmd = `cursor "${targetPath}"`;
    const codeCmd = `code "${targetPath}"`;

    console.log(`💻 Executing: ${cursorCmd}`);

    return new Promise((resolve, reject) => {
        // Run Cursor
        exec(cursorCmd, (error) => {
            if (error) {
                console.log("⚠️ 'cursor' cmd failed. Trying 'code'...");
                exec(codeCmd);
            }

            // Trigger Automator (Python)
            // Trigger Automator (Python)
            const automatorPath = path.resolve(__dirname, 'automator.py');
            const pythonCmd = `python "${automatorPath}"`;

            // Smart Delay Logic: Check if project window is already open
            const projectName = path.basename(targetPath);
            const checkWindowCmd = `powershell -Command "Get-Process | Where-Object {$_.MainWindowTitle -like '*${projectName}*'} | Select-Object -First 1"`;

            exec(checkWindowCmd, (chkErr, chkOut) => {
                const isAlreadyOpen = chkOut && chkOut.trim().length > 0;
                // If open: 3s delay. If closed: 30s delay.
                const WAIT_MS = isAlreadyOpen ? 3000 : 30000;

                console.log(isAlreadyOpen ? `⚡ Window found for '${projectName}'. Quick start (${WAIT_MS / 1000}s).` : `🐢 Window not found. Waiting full load (${WAIT_MS / 1000}s).`);

                console.log(`⏳ Waiting ${WAIT_MS / 1000}s...`);
                setTimeout(() => {
                    console.log(`🤖 Triggering Automator: ${pythonCmd}`);
                    exec(pythonCmd, (pyErr, pyOut) => {
                        if (pyErr) console.error("❌ Automator error:", pyErr);
                        else console.log("✅ Automator finished:", pyOut);

                        resolve(pyOut || "Cursor Opened & Automator Triggered");
                    });
                }, WAIT_MS);
            });
        });
    });
}

/**
 * Handler: RUN_SHELL
 */
async function handleRunShell(payload) {
    const { command, cwd } = payload;

    return new Promise((resolve, reject) => {
        exec(command, { cwd: cwd || undefined }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });
    });
}

// Start
startDaemon();
