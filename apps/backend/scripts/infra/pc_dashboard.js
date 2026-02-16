#!/usr/bin/env node

/**
 * PC Dashboard - Dashboard de Controle Remoto
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Dashboard web simples para visualização e controle remoto
 * dos PCs da corporação senciente.
 */

import http from 'http';
import { logger } from '../utils/logger.js';
import PCCommunication from './pc_communication.js';
import PCMonitor from './pc_monitor.js';

const log = logger.child({ module: 'pc_dashboard' });

/**
 * Classe PC Dashboard
 */
class PCDashboard {
    constructor(port = 21301) {
        this.port = port;
        this.server = null;
        this.monitor = new PCMonitor();
        this.communication = new PCCommunication();
        this.isRunning = false;

        // Integrar componentes da CLI
        this.brainPromptGen = null;
        this.agentPromptGen = null;
        this.confidenceScorer = null;
        this.activeChats = new Map();

        // Inicializar componentes dinamicamente
        this.initializeComponents();
    }

    async initializeComponents() {
        try {
            // Importar componentes dinamicamente para evitar dependências circulares
            const { default: BrainPromptGenerator } = await import('../swarm/brain_prompt_generator.js');
            const { default: AgentPromptGenerator } = await import('../swarm/agent_prompt_generator.js');
            const { default: ConfidenceScorer } = await import('../swarm/confidence_scorer.js');

            this.brainPromptGen = new BrainPromptGenerator();
            this.agentPromptGen = new AgentPromptGenerator();
            this.confidenceScorer = new ConfidenceScorer();

            log.info('✅ Componentes CLI integrados ao dashboard');
        } catch (error) {
            log.warn('⚠️ Alguns componentes CLI não disponíveis:', error.message);
        }
    }

    /**
     * Inicia dashboard
     */
    async start() {
        if (this.isRunning) {
            log.warn('Dashboard já está executando');
            return;
        }

        log.info(`🚀 Iniciando dashboard na porta ${this.port}...`);

        // Inicializar componentes
        await this.communication.initialize();
        await this.monitor.startMonitoring();

        // Criar servidor HTTP
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        // Iniciar servidor
        await new Promise((resolve, reject) => {
            this.server.listen(this.port, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        this.isRunning = true;
        log.info(`✅ Dashboard disponível em http://localhost:${this.port}`);
    }

    /**
     * Para dashboard
     */
    stop() {
        if (!this.isRunning) {
            log.warn('Dashboard não está executando');
            return;
        }

        log.info('🛑 Parando dashboard...');

        if (this.server) {
            this.server.close();
            this.server = null;
        }

        this.monitor.stopMonitoring();
        this.communication.stop();
        this.isRunning = false;

        log.info('✅ Dashboard parado');
    }

    /**
     * Trata requisições HTTP
     */
    async handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${this.port}`);
        const pathname = url.pathname;

        log.debug(`📨 ${req.method} ${pathname}`);

        try {
            // Headers CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            switch (pathname) {
                case '/':
                case '/dashboard':
                    await this.serveDashboard(res);
                    break;

                case '/api/status':
                    await this.serveAPIStatus(res);
                    break;

                case '/api/pcs':
                    await this.serveAPIPCs(res);
                    break;

                case '/api/metrics':
                    await this.serveAPIMetrics(res);
                    break;

                case '/api/think':
                    if (req.method === 'POST') {
                        await this.handleAPIThink(req, res);
                    } else {
                        res.writeHead(405);
                        res.end('Method not allowed');
                    }
                    break;

                case '/api/execute':
                    if (req.method === 'POST') {
                        await this.handleAPIExecute(req, res);
                    } else {
                        res.writeHead(405);
                        res.end('Method not allowed');
                    }
                    break;

                case '/api/chat':
                    if (req.method === 'POST') {
                        await this.handleAPIChat(req, res);
                    } else {
                        res.writeHead(405);
                        res.end('Method not allowed');
                    }
                    break;

                case '/api/agents':
                    await this.serveAPIAgents(res);
                    break;

                case '/api/control':
                    if (req.method === 'POST') {
                        await this.handleControlRequest(req, res);
                    } else {
                        res.writeHead(405);
                        res.end('Method not allowed');
                    }
                    break;

                default:
                    if (pathname.startsWith('/static/')) {
                        await this.serveStaticFile(pathname, res);
                    } else {
                        res.writeHead(404);
                        res.end('Not found');
                    }
            }
        } catch (error) {
            log.error('Erro na requisição:', error);
            res.writeHead(500);
            res.end('Internal server error');
        }
    }

    /**
     * Serve página principal do dashboard
     */
    async serveDashboard(res) {
        const html = this.generateDashboardHTML();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    /**
     * Gera HTML do dashboard
     */
    generateDashboardHTML() {
        const status = this.monitor.getStatus();
        const commStatus = this.communication.getStatus();

        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 Corporação Senciente - Controle Remoto</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #ffffff;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #00d4ff, #090979);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header .subtitle {
            color: #cccccc;
            font-size: 1.1em;
            margin-bottom: 20px;
        }

        .tabs {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px 5px 0 0;
            margin: 0 5px;
            transition: background 0.3s ease;
        }

        .tab.active {
            background: rgba(0, 212, 255, 0.3);
            color: #00d4ff;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-card h3 {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #00d4ff;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .pcs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .pc-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }

        .pc-card:hover {
            transform: translateY(-5px);
        }

        .pc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .pc-name {
            font-size: 1.2em;
            font-weight: bold;
        }

        .pc-status {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .status-online { background: #4CAF50; color: white; }
        .status-offline { background: #f44336; color: white; }
        .status-error { background: #ff9800; color: white; }

        .pc-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }

        .metric {
            text-align: center;
        }

        .metric-label {
            font-size: 0.8em;
            color: #cccccc;
            margin-bottom: 5px;
        }

        .metric-value {
            font-size: 1.2em;
            font-weight: bold;
        }

        .pc-actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s ease;
        }

        .btn-primary { background: #00d4ff; color: #16213e; }
        .btn-secondary { background: #666; color: white; }
        .btn-danger { background: #f44336; color: white; }

        .btn:hover {
            opacity: 0.8;
        }

        .alerts {
            margin-bottom: 30px;
        }

        .alert {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 10px;
        }

        .alert-warning { background: rgba(255, 193, 7, 0.2); border-left: 4px solid #ffc107; }
        .alert-critical { background: rgba(244, 67, 54, 0.2); border-left: 4px solid #f44336; }

        .refresh-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00d4ff;
            color: #16213e;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .header h1 {
                font-size: 2em;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .pcs-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🧠 Corporação Senciente 7.0</h1>
            <div class="subtitle">Interface Unificada de Controle - Fase 3</div>
            <div class="tabs">
                <div class="tab active" onclick="showTab('overview')">📊 Visão Geral</div>
                <div class="tab" onclick="showTab('think')">🧠 Pensar</div>
                <div class="tab" onclick="showTab('execute')">⚡ Executar</div>
                <div class="tab" onclick="showTab('chat')">💬 Chat</div>
                <div class="tab" onclick="showTab('swarm')">🐛 Swarm</div>
            </div>
        </header>

        <button class="refresh-btn" onclick="location.reload()">🔄 Atualizar</button>

        <!-- Estatísticas Gerais -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>PCs Totais</h3>
                <div class="stat-value">${status.metrics.totalPCs}</div>
            </div>
            <div class="stat-card">
                <h3>PCs Online</h3>
                <div class="stat-value">${status.metrics.onlinePCs}</div>
            </div>
            <div class="stat-card">
                <h3>PCs Offline</h3>
                <div class="stat-value">${status.metrics.offlinePCs}</div>
            </div>
            <div class="stat-card">
                <h3>Comunicação Ativa</h3>
                <div class="stat-value">${commStatus.total_connected}</div>
            </div>
        </div>

        <!-- Alertas -->
        ${status.metrics.alerts.length > 0 ? `
        <div class="alerts">
            <h2>🚨 Alertas</h2>
            ${status.metrics.alerts.map(alert => `
                <div class="alert alert-${alert.severity}">
                    <strong>${alert.pc ? alert.pc + ': ' : ''}</strong>${alert.message}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- PCs -->
        <h2>🖥️ PCs da Corporação</h2>
        <div class="pcs-grid">
            ${status.pcs.map(pc => `
                <div class="pc-card">
                    <div class="pc-header">
                        <div class="pc-name">${pc.hostname}</div>
                        <div class="pc-status status-${pc.status}">
                            ${pc.status === 'online' ? '🟢 Online' :
                pc.status === 'offline' ? '🔴 Offline' : '🟡 Erro'}
                        </div>
                    </div>

                    <div class="pc-info">
                        <p><strong>IP:</strong> ${pc.ip_address}</p>
                        <p><strong>Especialização:</strong> ${pc.specialization || 'N/A'}</p>
                        ${pc.lastSeen ? `<p><strong>Último contato:</strong> ${new Date(pc.lastSeen).toLocaleString('pt-BR')}</p>` : ''}
                    </div>

                    ${pc.metrics ? `
                    <div class="pc-metrics">
                        <div class="metric">
                            <div class="metric-label">CPU</div>
                            <div class="metric-value">${pc.metrics.cpu?.usage?.toFixed(1) || 'N/A'}%</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">RAM</div>
                            <div class="metric-value">${pc.metrics.ram?.usage?.toFixed(1) || 'N/A'}%</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Disco</div>
                            <div class="metric-value">${pc.metrics.disk?.usage || 'N/A'}%</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Uptime</div>
                            <div class="metric-value">N/A</div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="pc-actions">
                        <button class="btn btn-primary" onclick="sendCommand('${pc.hostname}', 'status')">
                            📊 Status
                        </button>
                        <button class="btn btn-secondary" onclick="sendCommand('${pc.hostname}', 'ping')">
                            🔔 Ping
                        </button>
                        <button class="btn btn-danger" onclick="sendCommand('${pc.hostname}', 'restart')">
                            🔄 Restart
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Aba: Pensar -->
        <div id="think" class="tab-content">
            <h2>🧠 Análise do Brain</h2>
            <div class="think-section">
                <div class="input-group">
                    <input type="text" id="think-task" placeholder="Digite uma tarefa para o Brain analisar..." style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
                    <button onclick="brainThink()" style="padding: 10px 20px; background: #00d4ff; color: #16213e; border: none; border-radius: 5px; cursor: pointer;">🧠 Fazer Brain Pensar</button>
                </div>
                <div id="think-result" class="result-area" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; min-height: 200px; white-space: pre-wrap; font-family: monospace;"></div>
            </div>
        </div>

        <!-- Aba: Executar -->
        <div id="execute" class="tab-content">
            <h2>⚡ Execução de Agentes</h2>
            <div class="execute-section">
                <div class="input-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <select id="execute-agent" style="padding: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
                        <option value="">Selecione um agente...</option>
                    </select>
                    <select id="execute-mode" style="padding: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
                        <option value="auto">🤖 Automático</option>
                        <option value="direct">⚡ Direto</option>
                        <option value="prompt">📝 Via Prompt</option>
                    </select>
                </div>
                <div class="input-group">
                    <input type="text" id="execute-task" placeholder="Digite a tarefa a executar..." style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
                    <button onclick="executeTask()" style="padding: 10px 20px; background: #00d4ff; color: #16213e; border: none; border-radius: 5px; cursor: pointer;">⚡ Executar</button>
                </div>
                <div id="execute-result" class="result-area" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; min-height: 200px; white-space: pre-wrap; font-family: monospace;"></div>
                <div id="execute-confidence" style="margin-top: 10px; padding: 10px; background: rgba(255,193,7,0.2); border-radius: 5px; display: none;"></div>
            </div>
        </div>

        <!-- Aba: Chat -->
        <div id="chat" class="tab-content">
            <h2>💬 Chat Interativo</h2>
            <div class="chat-section">
                <div class="chat-messages" id="chat-messages" style="height: 300px; overflow-y: auto; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; margin-bottom: 15px; font-family: monospace;"></div>
                <div class="input-group" style="display: grid; grid-template-columns: 1fr auto; gap: 10px;">
                    <input type="text" id="chat-message" placeholder="Digite sua mensagem..." style="padding: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;" onkeypress="handleChatKeyPress(event)">
                    <select id="chat-agent" style="padding: 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
                        <option value="brain">🧠 Brain</option>
                        <option value="technical_agent">🛠️ Técnico</option>
                        <option value="business_agent">💼 Business</option>
                        <option value="operations_agent">⚙️ Operações</option>
                    </select>
                    <button onclick="sendChatMessage()" style="padding: 10px 20px; background: #00d4ff; color: #16213e; border: none; border-radius: 5px; cursor: pointer;">📤 Enviar</button>
                </div>
            </div>
        </div>

        <!-- Aba: Swarm -->
        <div id="swarm" class="tab-content">
            <h2>🐛 Controle do Swarm Multi-PC</h2>
            <div class="swarm-section">
                <div class="swarm-controls" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <button onclick="swarmCommand('status')" style="padding: 15px; background: rgba(0,212,255,0.2); border: 1px solid #00d4ff; border-radius: 5px; color: white; cursor: pointer;">📊 Status do Swarm</button>
                    <button onclick="swarmCommand('discover')" style="padding: 15px; background: rgba(76,175,80,0.2); border: 1px solid #4CAF50; border-radius: 5px; color: white; cursor: pointer;">🔍 Descobrir PCs</button>
                    <button onclick="swarmCommand('monitor')" style="padding: 15px; background: rgba(255,193,7,0.2); border: 1px solid #FFC107; border-radius: 5px; color: white; cursor: pointer;">📈 Monitor</button>
                </div>
                <div id="swarm-result" class="result-area" style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; min-height: 200px; white-space: pre-wrap; font-family: monospace;"></div>
            </div>
        </div>
    </div>

    <script>
        let currentChatSession = null;

        // Inicializar dashboard
        async function initializeDashboard() {
            // Carregar lista de agentes
            await loadAgents();

            // Mostrar aba inicial
            showTab('overview');
        }

        // Mostrar aba
        function showTab(tabName) {
            // Esconder todas as abas
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Mostrar aba selecionada
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        // Carregar agentes
        async function loadAgents() {
            try {
                const response = await fetch('/api/agents');
                const agents = await response.json();

                const select = document.getElementById('execute-agent');
                select.innerHTML = '<option value="">Selecione um agente...</option>';

                Object.entries(agents).forEach(([category, agentList]) => {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);

                    agentList.forEach(agent => {
                        const option = document.createElement('option');
                        option.value = agent.name;
                        option.textContent = `${ agent.name } - ${ agent.description } `;
                        optgroup.appendChild(option);
                    });

                    select.appendChild(optgroup);
                });
            } catch (error) {
                console.error('Erro ao carregar agentes:', error);
            }
        }

        // Brain Think
        async function brainThink() {
            const task = document.getElementById('think-task').value.trim();
            if (!task) {
                alert('Digite uma tarefa para o Brain analisar!');
                return;
            }

            const resultDiv = document.getElementById('think-result');
            resultDiv.textContent = '🧠 Analisando tarefa...';

            try {
                const response = await fetch('/api/think', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task })
                });

                const data = await response.json();

                if (data.success) {
                    // Formatar resultado
                    let formatted = `🎯 Tarefa: ${ data.task } \n\n`;
                    formatted += `🧠 ANÁLISE DO BRAIN: \n`;
                    formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

                    // Extrair seções da análise
                    const lines = data.prompt.split('\n');
                    let inSection = false;

                    for (const line of lines) {
                        if (line.includes('CONTEXTO:') || line.includes('CONTEXT:')) {
                            formatted += `\n📋 CONTEXTO: \n`;
                            inSection = true;
                        } else if (line.includes('ANÁLISE:') || line.includes('ANALYSIS:')) {
                            formatted += `\n🧠 ANÁLISE: \n`;
                            inSection = true;
                        } else if (line.includes('DELEGAÇÃO:') || line.includes('DELEGATION:')) {
                            formatted += `\n🎯 DELEGAÇÃO: \n`;
                            inSection = true;
                        } else if (line.includes('PRÓXIMO PASSO:') || line.includes('NEXT STEP:')) {
                            formatted += `\n🚀 PRÓXIMO PASSO: \n`;
                            inSection = true;
                        } else if (inSection && line.trim()) {
                            formatted += `  ${ line.trim() } \n`;
                        }
                    }

                    resultDiv.textContent = formatted;
                } else {
                    resultDiv.textContent = `❌ Erro: ${ data.error } `;
                }
            } catch (error) {
                resultDiv.textContent = `❌ Erro de rede: ${ error.message } `;
            }
        }

        // Execute Task
        async function executeTask() {
            const agent = document.getElementById('execute-agent').value;
            const task = document.getElementById('execute-task').value.trim();
            const mode = document.getElementById('execute-mode').value;

            if (!agent || !task) {
                alert('Selecione um agente e digite uma tarefa!');
                return;
            }

            const resultDiv = document.getElementById('execute-result');
            const confidenceDiv = document.getElementById('execute-confidence');

            resultDiv.textContent = `⚡ Preparando execução com ${ agent }...`;
            confidenceDiv.style.display = 'none';

            try {
                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agent, task, mode })
                });

                const data = await response.json();

                if (data.success) {
                    // Mostrar confiança se modo auto
                    if (mode === 'auto' || data.confidence) {
                        const confidencePercent = (data.confidence * 100).toFixed(1);
                        confidenceDiv.textContent = `🎯 Confiança: ${ confidencePercent }% | Modo: ${ data.executionMode } `;
                        confidenceDiv.style.display = 'block';
                    }

                    // Mostrar prompt
                    resultDiv.textContent = `🤖 PROMPT GERADO PARA: ${ data.agent.toUpperCase() } \n`;
                    resultDiv.textContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    resultDiv.textContent += data.prompt;

                    // Adicionar instruções
                    if (data.executionMode === 'prompt') {
                        resultDiv.textContent += `\n\n📋 COPIE ESTE PROMPT E COLE NO CURSOR PARA EXECUÇÃO!`;
                    }
                } else {
                    resultDiv.textContent = `❌ Erro: ${ data.error } `;
                }
            } catch (error) {
                resultDiv.textContent = `❌ Erro de rede: ${ error.message } `;
            }
        }

        // Send Chat Message
        async function sendChatMessage() {
            const message = document.getElementById('chat-message').value.trim();
            const agent = document.getElementById('chat-agent').value;

            if (!message) {
                return;
            }

            const messagesDiv = document.getElementById('chat-messages');
            const input = document.getElementById('chat-message');

            // Adicionar mensagem do usuário
            messagesDiv.innerHTML += `< div style = "color: #00d4ff; margin: 5px 0;" >👤 Você: ${ message }</div > `;

            // Limpar input
            input.value = '';

            // Mostrar typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.style.color = '#666';
            typingDiv.style.margin = '5px 0';
            typingDiv.textContent = `${ agent } está digitando...`;
            messagesDiv.appendChild(typingDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        agent,
                        sessionId: currentChatSession
                    })
                });

                const data = await response.json();

                // Remover typing indicator
                messagesDiv.removeChild(typingDiv);

                if (data.success) {
                    currentChatSession = data.sessionId;
                    messagesDiv.innerHTML += `< div style = "color: #4CAF50; margin: 5px 0;" >🤖 ${ data.agent }: ${ data.response }</div > `;
                } else {
                    messagesDiv.innerHTML += `< div style = "color: #f44336; margin: 5px 0;" >❌ Erro: ${ data.error }</div > `;
                }

                messagesDiv.scrollTop = messagesDiv.scrollHeight;

            } catch (error) {
                messagesDiv.removeChild(typingDiv);
                messagesDiv.innerHTML += `< div style = "color: #f44336; margin: 5px 0;" >❌ Erro de rede: ${ error.message }</div > `;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        }

        // Handle chat key press
        function handleChatKeyPress(event) {
            if (event.key === 'Enter') {
                sendChatMessage();
            }
        }

        // Swarm Commands
        async function swarmCommand(action) {
            const resultDiv = document.getElementById('swarm-result');
            resultDiv.textContent = `🐛 Executando comando: ${ action }...`;

            try {
                let endpoint = `/ api / control`;
                let body = { command: action };

                // Para comandos específicos
                if (action === 'status') {
                    endpoint = '/api/status';
                    body = {};
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const data = await response.json();

                if (action === 'status') {
                    // Formatar status do swarm
                    let statusText = `🐛 STATUS DO SWARM MULTI - PC\n`;
                    statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

                    statusText += `📊 PCs Monitorados: ${ data.monitor?.metrics?.totalPCs || 0 } \n`;
                    statusText += `🟢 PCs Online: ${ data.monitor?.metrics?.onlinePCs || 0 } \n`;
                    statusText += `🔴 PCs Offline: ${ data.monitor?.metrics?.offlinePCs || 0 } \n\n`;

                    if (data.communication?.local_pc) {
                        statusText += `🤖 PC Local: ${ data.communication.local_pc.hostname } \n`;
                        statusText += `🎯 Especialização: ${ data.communication.local_pc.specialization } \n`;
                        statusText += `🔗 PCs Conectados: ${ data.communication.total_connected } \n`;
                    }

                    resultDiv.textContent = statusText;
                } else {
                    resultDiv.textContent = `✅ Comando "${action}" executado com sucesso!\n\n${ JSON.stringify(data, null, 2) } `;
                }

            } catch (error) {
                resultDiv.textContent = `❌ Erro no comando swarm: ${ error.message } `;
            }
        }

        // Função existente para compatibilidade
        function sendCommand(hostname, command) {
            fetch('/api/control', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hostname: hostname,
                    command: command
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Comando enviado: ' + JSON.stringify(data, null, 2));
            })
            .catch(error => {
                alert('Erro ao enviar comando: ' + error.message);
            });
        }

        // Inicializar quando DOM estiver pronto
        document.addEventListener('DOMContentLoaded', initializeDashboard);
    </script>
</body>
</html>`;
    }

    /**
     * Serve API de status
     */
    async serveAPIStatus(res) {
        const status = {
            monitor: this.monitor.getStatus(),
            communication: this.communication.getStatus(),
            dashboard: {
                is_running: this.isRunning,
                port: this.port,
                uptime: process.uptime()
            }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
    }

    /**
     * Serve API de PCs
     */
    async serveAPIPCs(res) {
        const pcs = this.monitor.getStatus().pcs;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pcs, null, 2));
    }

    /**
     * Serve API de métricas
     */
    async serveAPIMetrics(res) {
        const metrics = this.monitor.getStatus().metrics;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics, null, 2));
    }

    /**
     * Handler API: Think (Brain analysis)
     */
    async handleAPIThink(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { task, context } = JSON.parse(body);

                if (!this.brainPromptGen) {
                    throw new Error('Brain Prompt Generator não disponível');
                }

                const prompt = await this.brainPromptGen.generateBrainPrompt(task, {
                    userId: 'dashboard_user',
                    sessionId: `web_${Date.now()}`,
                    ...context
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    task,
                    prompt,
                    timestamp: new Date().toISOString()
                }));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * Handler API: Execute (Agent execution)
     */
    async handleAPIExecute(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { agent, task, mode = 'auto', context = {} } = JSON.parse(body);

                if (!this.agentPromptGen || !this.confidenceScorer) {
                    throw new Error('Componentes CLI não disponíveis');
                }

                // Calcular confiança
                const mockAction = { type: 'execute_task', agent, task };
                const confidence = await this.confidenceScorer.calculateConfidence(mockAction, context);
                const executionMode = this.confidenceScorer.determineExecutionMode(confidence);

                // Gerar prompt do agente
                const prompt = await this.agentPromptGen.generateAgentPrompt(agent, task, {
                    userId: 'dashboard_user',
                    sessionId: `web_exec_${Date.now()}`,
                    executionMode: mode === 'auto' ? executionMode : mode,
                    ...context
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    agent,
                    task,
                    confidence,
                    executionMode,
                    prompt,
                    timestamp: new Date().toISOString()
                }));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * Handler API: Chat
     */
    async handleAPIChat(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { message, agent = 'brain', sessionId } = JSON.parse(body);
                const chatSessionId = sessionId || `web_chat_${Date.now()}`;

                // Iniciar conversa se necessário
                if (!this.activeChats.has(chatSessionId)) {
                    this.chatInterface.startConversation(chatSessionId, {
                        agentName: agent,
                        userId: 'dashboard_user',
                        mode: 'web'
                    });
                    this.activeChats.set(chatSessionId, { agent, messages: [] });
                }

                // Enviar mensagem
                const response = await this.chatInterface.sendMessage(chatSessionId, message);

                // Armazenar no histórico
                const chatData = this.activeChats.get(chatSessionId);
                chatData.messages.push({
                    timestamp: new Date().toISOString(),
                    user: message,
                    agent: response
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    sessionId: chatSessionId,
                    agent,
                    userMessage: message,
                    response,
                    messageCount: chatData.messages.length,
                    timestamp: new Date().toISOString()
                }));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * Serve API: Lista de agentes disponíveis
     */
    async serveAPIAgents(res) {
        const agents = {
            business: [
                { name: 'marketing_agent', description: 'Marketing e campanhas' },
                { name: 'sales_agent', description: 'Vendas e prospecção' },
                { name: 'finance_agent', description: 'Análise financeira' },
                { name: 'copywriting_agent', description: 'Redação e conteúdo' }
            ],
            technical: [
                { name: 'architect_agent', description: 'Arquitetura de sistemas' },
                { name: 'dev_agent', description: 'Desenvolvimento de código' },
                { name: 'debug_agent', description: 'Debugging e troubleshooting' },
                { name: 'validation_agent', description: 'Testes e validação' }
            ],
            operations: [
                { name: 'devex_agent', description: 'Experiência do desenvolvedor' },
                { name: 'metrics_agent', description: 'Métricas e monitoramento' },
                { name: 'quality_agent', description: 'Controle de qualidade' },
                { name: 'security_agent', description: 'Segurança e compliance' }
            ]
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(agents, null, 2));
    }

    /**
     * Trata requisições de controle
     */
    async handleControlRequest(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const command = JSON.parse(body);

                // Processar comando (simplificado)
                const result = await this.processControlCommand(command);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * Processa comandos de controle
     */
    async processControlCommand(command) {
        const { hostname, command: cmd } = command;

        log.info(`🎮 Comando de controle: ${cmd} para ${hostname}`);

        switch (cmd) {
            case 'status':
                return await this.communication.requestPCStatus(hostname);

            case 'ping':
                const pc = this.monitor.monitoredPCs.get(hostname);
                if (pc) {
                    return { success: true, message: `Ping enviado para ${hostname}` };
                } else {
                    throw new Error(`PC ${hostname} não encontrado`);
                }

            case 'restart':
                // Comando perigoso - apenas simular por enquanto
                log.warn(`Tentativa de restart do PC ${hostname} - não implementado`);
                return { success: false, message: 'Restart não implementado (segurança)' };

            default:
                throw new Error(`Comando desconhecido: ${cmd}`);
        }
    }

    /**
     * Serve arquivos estáticos (CSS, JS, etc)
     */
    async serveStaticFile(pathname, res) {
        // Implementação básica - em produção usaria express.static
        res.writeHead(404);
        res.end('Static file not found');
    }
}

// Exportar classe
export default PCDashboard;

// Instância global
let globalDashboard = null;

export function getPCDashboard() {
    if (!globalDashboard) {
        globalDashboard = new PCDashboard();
    }
    return globalDashboard;
}

// Função main para CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const dashboard = getPCDashboard();

    switch (command) {
        case 'start':
            await dashboard.start();
            // Manter processo rodando
            process.on('SIGINT', () => {
                dashboard.stop();
                process.exit(0);
            });
            break;

        case 'stop':
            dashboard.stop();
            break;

        default:
            console.log('Uso: pc_dashboard.js <command>');
            console.log('Comandos:');
            console.log('  start    - Inicia dashboard');
            console.log('  stop     - Para dashboard');
            break;
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}





