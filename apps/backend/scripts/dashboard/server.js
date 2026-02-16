import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configuração básica
app.use(cors());
app.use(express.json());

// Caminhos importantes (ajustar conforme estrutura real)
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');
const DAEMON_STATE_FILE = path.join(PROJECT_ROOT, '.daemon_state.json');

// Middleware de Logging
app.use((req, res, next) => {
    console.log(`[DASHBOARD-API] ${req.method} ${req.path}`);
    next();
});

// --- ENPOINTS API ---

// 1. Status Geral (Daemon + Sistema)
app.get('/api/status', (req, res) => {
    let daemonState = { status: 'UNKNOWN', lastUpdate: null };

    if (fs.existsSync(DAEMON_STATE_FILE)) {
        try {
            daemonState = JSON.parse(fs.readFileSync(DAEMON_STATE_FILE, 'utf8'));
        } catch (e) {
            daemonState.status = 'ERROR_READING_STATE';
        }
    } else {
        daemonState.status = 'OFFLINE';
    }

    res.json({
        system: 'Corporação Senciente',
        version: '7.0',
        daemon: daemonState,
        downtime: process.uptime()
    });
});

// 2. Logs Recentes
app.get('/api/logs', (req, res) => {
    const logFile = path.join(LOGS_DIR, 'daemon-combined.log'); // Exemplo

    if (!fs.existsSync(logFile)) {
        return res.json({ logs: ['Nenhum log encontrado.'] });
    }

    // Ler últimas 50 linhas (simplificado)
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0).slice(-50);

    res.json({ logs: lines });
});

// 3. Fila de Tarefas (Simulação/Leitura Real)
app.get('/api/tasks', (req, res) => {
    // Integração futura com inbox real.
    // Por enquanto retorna mock se não houver arquivo real
    res.json({
        queue: [
            { id: 1, desc: 'Análise de Mercado', status: 'pending', priority: 'high' },
            { id: 2, desc: 'Refatoração de API', status: 'processing', priority: 'medium' }
        ]
    });
});

// --- STATIC FRONTEND SERVER (Futuro) ---
// app.use(express.static(path.join(PROJECT_ROOT, 'frontend/dist')));

// Iniciar
app.listen(PORT, () => {
    console.log(`🚀 Dashboard Server rodando em http://localhost:${PORT}`);
    console.log(`📊 API disponível em http://localhost:${PORT}/api/status`);
});
