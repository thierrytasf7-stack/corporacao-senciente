const path = require('path');
const fs = require('fs');
// Try loading from local dir or root dir
const rootEnv = path.resolve(__dirname, '../../.env');
const localEnv = path.resolve(__dirname, '.env');
const envPath = fs.existsSync(localEnv) ? localEnv : rootEnv;
require('dotenv').config({ path: envPath });
const { createClient } = require('@supabase/supabase-js');
const si = require('systeminformation');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const WebSocket = require('ws');
const pty = require('node-pty');
const localtunnel = require('localtunnel');
const screenshot = require('screenshot-desktop');

// --- PID CHECK (Optimization: Prevent multiple instances) ---
const PID_FILE = path.resolve(__dirname, 'daemon.pid');
if (fs.existsSync(PID_FILE)) {
    const oldPid = fs.readFileSync(PID_FILE, 'utf8');
    try {
        process.kill(oldPid, 0); // Check if process still exists
        console.error(`❌ Daemon já está rodando (PID: ${oldPid}). Saindo.`);
        process.exit(1);
    } catch (e) {
        // Process not running, we can proceed
        fs.unlinkSync(PID_FILE);
    }
}
fs.writeFileSync(PID_FILE, process.pid.toString());

// --- CONFIGURATION ---
// --- CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const DAEMON_ID = process.env.DAEMON_ID || uuidv4();
const HEARTBEAT_INTERVAL = 30000; // 30s

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERRO: SUPABASE_URL e SUPABASE_KEY são obrigatórios no .env');
    console.error('   Vars encontradas:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(`🤖 Senciente Daemon Iniciando... [ID: ${DAEMON_ID}] [PID: ${process.pid}]`);

// --- ESTADO GLOBAL ---
let wsServer = null;

// --- FUNÇÕES CORE ---

async function registerDaemon() {
    const specs = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: os.totalmem(),
        hostname: os.hostname(),
        node_version: process.version,
        screen_width: robot.getScreenSize().width,
        screen_height: robot.getScreenSize().height
    };

    const { error } = await supabase.from('pc_hosts').upsert({
        id: DAEMON_ID,
        hostname: os.hostname(),
        status: 'online',
        specs: specs,
        last_seen_at: new Date().toISOString()
    });

    if (error) console.error('❌ Erro ao registrar Daemon:', error.message);
    else console.log('✅ Daemon registrado no Supabase com sucesso.');
}

async function sendHeartbeat() {
    try {
        const cpuLoad = await si.currentLoad();
        const mem = await si.mem();

        const liveMetrics = {
            cpu: cpuLoad.currentLoad.toFixed(1),
            ram: ((mem.active / mem.total) * 100).toFixed(1),
            uptime: os.uptime()
        };

        const { error } = await supabase.from('pc_hosts').update({
            last_seen_at: new Date().toISOString(),
            status: 'online',
            last_metrics: liveMetrics // Optimized: Send live stats in heartbeat
        }).eq('id', DAEMON_ID);

        if (error) console.warn('⚠️ Alerta Heartbeat:', error.message);
    } catch (err) {
        console.error('Erro no heartbeat:', err.message);
    }
}

// --- TERMINAL REMOTO ---
async function startTerminalServer() {
    const PORT = 3050;
    wsServer = new WebSocket.Server({ port: PORT });

    console.log(`💻 Terminal WebSocket Server ouvindo na porta ${PORT}`);

    // Start Tunnel (Smart-Agent Fix for Mixed Content)
    try {
        const tunnel = await localtunnel({ port: PORT });

        // Fix: Handle tunnel errors to prevent daemon crash
        tunnel.on('error', (err) => {
            console.error('⚠️ Tunnel Error:', err.message);
            // Optionally try to reconnect or just survive without tunnel
        });

        console.log(`🌍 Tunnel online: ${tunnel.url}`);

        // Update Host with Tunnel URL in 'specs' (JSONB)
        // We replace http/https with ws/wss for clarity.
        const secureWsUrl = tunnel.url.replace(/^http/, 'ws');

        // Fetch current specs to merge
        const { data: currentHost } = await supabase
            .from('pc_hosts')
            .select('specs')
            .eq('id', DAEMON_ID)
            .single();

        if (currentHost && currentHost.specs) {
            const newSpecs = { ...currentHost.specs, tunnel_url: secureWsUrl };
            await supabase.from('pc_hosts').update({
                specs: newSpecs
            }).eq('id', DAEMON_ID);
            console.log(`✅ Tunnel URL salvo no Supabase: ${secureWsUrl}`);
        }

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });

        // Log to Supabase for debugging
        await supabase.from('agent_logs').insert({
            agent_id: 'daemon',
            task_id: 'system',
            action: 'TUNNEL_OPEN',
            thought_process: `Tunnel established at ${secureWsUrl} for ID ${DAEMON_ID}`
        });

    } catch (err) {
        console.error('Failed to start tunnel:', err.message);
        await supabase.from('agent_logs').insert({
            agent_id: 'daemon',
            task_id: 'system',
            action: 'TUNNEL_ERROR',
            thought_process: `Failed to create tunnel: ${err.message}`
        });
    }

    const robot = require('robotjs');

    wsServer.on('connection', (ws) => {
        console.log('🔌 Cliente conectado ao Terminal/Controle');
        const shellName = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

        const shell = pty.spawn(shellName, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || process.cwd(),
            env: process.env
        });

        shell.on('data', (data) => ws.readyState === WebSocket.OPEN && ws.send(data));

        ws.on('message', (msg) => {
            // Check for Remote Control Commands
            try {
                // Peek if it looks like JSON
                const strMsg = msg.toString();
                if (strMsg.trim().startsWith('{')) {
                    const cmd = JSON.parse(strMsg);

                    if (cmd.type === 'MOUSE_MOVE') {
                        // robot.moveMouse(cmd.x, cmd.y); // Absolute
                        // Robust: Handle scaling if needed, but for now absolute
                        robot.moveMouse(cmd.x, cmd.y);
                        return;
                    }
                    if (cmd.type === 'MOUSE_CLICK') {
                        robot.mouseClick(cmd.button || 'left', cmd.double ? true : false);
                        return;
                    }
                    if (cmd.type === 'KEY_TAP') {
                        robot.keyTap(cmd.key, cmd.modifiers || []);
                        return;
                    }
                    if (cmd.type === 'SCROLL') {
                        robot.scrollMouse(cmd.x || 0, cmd.y || 0);
                        return;
                    }
                    if (cmd.type === 'TYPE_STRING') {
                        robot.typeString(cmd.text);
                        return;
                    }
                }
            } catch (e) {
                // Not a valid control command, pass to shell
            }

            // Normal Shell Input
            shell.write(msg);
        });

        ws.on('close', () => {
            console.log('🔌 Cliente desconectado');
            shell.kill();
        });
    });
}

// --- LOOP PRINCIPAL ---
async function main() {
    await registerDaemon();
    startTerminalServer();

    // Initial heartbeat
    await sendHeartbeat();

    // Heartbeat Loop
    setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Screen Capture Loop (every 5 seconds)
    setInterval(captureScreen, 5000);

    // Task Execution is handled by bridge_service.js
    // We do not subscribe here to avoid race conditions with the mock.
}

// Mock handleTask removed.

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Desligando Daemon...');
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    process.exit(0);
});

main().catch(err => {
    console.error('Fatal Error:', err);
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
});

// --- SCREEN CAPTURE ---
async function captureScreen() {
    try {
        const imgBuffer = await screenshot({ format: 'png' });
        const imgBase64 = imgBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${imgBase64}`;

        const { error } = await supabase.from('pc_screenshots').upsert({
            pc_id: DAEMON_ID,
            image_data: dataUrl,
            updated_at: new Date().toISOString()
        });

        if (error) console.warn('⚠️ Erro ao enviar screenshot:', error.message);
    } catch (err) {
        // Suppress errors if screen is locked or unavailable
        // console.warn('Falha captura tela:', err.message); 
    }
}

