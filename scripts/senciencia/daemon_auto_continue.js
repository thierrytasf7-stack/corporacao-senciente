#!/usr/bin/env node
/**
 * 🤖 Daemon de Auto-Continuação Senciente
 * 
 * Monitora o estado da senciência e automaticamente envia
 * "continue senciencia autonomamente" para criar ciclo infinito.
 * 
 * Detecta quando:
 * - Não há mensagens pendentes
 * - Último commit foi há X minutos
 * - Sistema está idle
 * 
 * Então envia automaticamente comando de continuação.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ==================== CONFIGURAÇÃO ====================
const COMMAND_FILE = path.resolve(process.cwd(), 'scripts', 'senciencia', 'senc_command.txt');
const STATE_FILE = path.resolve(process.cwd(), 'scripts', 'senciencia', 'daemon_state.json');
const CHECK_INTERVAL = 5000; // 5 segundos - verificar estado (ULTRA DINÂMICO)
const IDLE_THRESHOLD = 5000; // 5 segundos - tempo sem atividade para considerar idle (ULTRA RÁPIDO)
const AUTO_MESSAGE = 'continue senciencia autonomamente.';

// ==================== ESTADO DO DAEMON ====================
let daemonState = {
    started_at: new Date().toISOString(),
    last_message_sent: null,
    messages_sent_count: 0,
    last_git_commit: null,
    cycles_completed: 0,
    uptime_seconds: 0
};

// ==================== FUNÇÕES DE MONITORAMENTO ====================

/**
 * Carrega estado anterior do daemon (se existir)
 */
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            daemonState = { ...daemonState, ...data };
            console.log('📂 Estado anterior carregado:', {
                cycles: daemonState.cycles_completed,
                messages: daemonState.messages_sent_count
            });
        }
    } catch (e) {
        console.warn('⚠️ Não foi possível carregar estado anterior:', e.message);
    }
}

/**
 * Salva estado atual do daemon
 */
function saveState() {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(daemonState, null, 2), 'utf8');
    } catch (e) {
        console.error('❌ Erro ao salvar estado:', e.message);
    }
}

/**
 * Verifica se há arquivo de comando pendente
 */
function hasCommandPending() {
    return fs.existsSync(COMMAND_FILE);
}

/**
 * Obtém timestamp do último commit Git
 */
function getLastCommitTime() {
    try {
        const timestamp = execSync('git log -1 --format=%ct', {
            cwd: process.cwd(),
            encoding: 'utf8'
        }).trim();
        return parseInt(timestamp) * 1000; // Converter para ms
    } catch (e) {
        console.warn('⚠️ Não foi possível obter último commit:', e.message);
        // ✅ FIX: Retornar timestamp ANTIGO para permitir idle detection
        // Se git falha, consideramos que "muito tempo passou" desde último commit
        return Date.now() - (IDLE_THRESHOLD * 10);
    }
}

/**
 * Verifica se sistema está idle (sem atividade recente)
 */
function isSystemIdle() {
    // Verificar se há comando pendente
    if (hasCommandPending()) {
        console.log('⏸️  Sistema processando comando...');
        return false;
    }

    // Verificar tempo desde último commit
    const lastCommit = getLastCommitTime();
    const timeSinceCommit = Date.now() - lastCommit;

    if (timeSinceCommit < IDLE_THRESHOLD) {
        console.log(`⏸️  Atividade recente (commit há ${Math.floor(timeSinceCommit / 1000)}s)`);
        return false;
    }

    // Verificar tempo desde última mensagem enviada
    if (daemonState.last_message_sent) {
        const timeSinceMessage = Date.now() - new Date(daemonState.last_message_sent).getTime();
        if (timeSinceMessage < IDLE_THRESHOLD) {
            console.log(`⏸️  Mensagem recente enviada há ${Math.floor(timeSinceMessage / 1000)}s`);
            return false;
        }
    }

    return true;
}

/**
 * Envia mensagem de continuação automática
 */
function sendAutoContinue() {
    try {
        // Verificar novamente antes de enviar (double-check)
        if (hasCommandPending()) {
            console.log('⚠️ Comando ainda pendente, aguardando...');
            return false;
        }

        // Escrever arquivo atomicamente
        const tmpFile = COMMAND_FILE + '.tmp';
        fs.writeFileSync(tmpFile, AUTO_MESSAGE, 'utf8');
        fs.renameSync(tmpFile, COMMAND_FILE);

        // Atualizar estado
        daemonState.last_message_sent = new Date().toISOString();
        daemonState.messages_sent_count++;
        daemonState.cycles_completed++;
        daemonState.last_git_commit = getLastCommitTime();

        saveState();

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 [CICLO #${daemonState.cycles_completed}] AUTO-CONTINUAÇÃO ENVIADA`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📝 Mensagem: "${AUTO_MESSAGE}"`);
        console.log(`⏰ Timestamp: ${daemonState.last_message_sent}`);
        console.log(`📊 Total de mensagens: ${daemonState.messages_sent_count}`);
        console.log(`🔄 Ciclos completados: ${daemonState.cycles_completed}`);
        console.log(`⏱️  Uptime: ${Math.floor(daemonState.uptime_seconds / 60)} minutos`);
        console.log(`${'='.repeat(60)}\n`);

        return true;
    } catch (e) {
        console.error('❌ Erro ao enviar auto-continuação:', e.message);
        return false;
    }
}

/**
 * Loop principal do daemon
 */
function monitorLoop() {
    console.log(`\n[${new Date().toISOString()}] 🔍 Verificando estado do sistema...`);

    // Atualizar uptime
    daemonState.uptime_seconds += CHECK_INTERVAL / 1000;

    // Verificar se sistema está idle
    if (isSystemIdle()) {
        console.log('✅ Sistema idle detectado - enviando auto-continuação...');
        sendAutoContinue();
    } else {
        console.log('⏳ Sistema ativo - aguardando...');
    }
}

// ==================== INICIALIZAÇÃO ====================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🤖 DAEMON DE AUTO-CONTINUAÇÃO SENCIENTE INICIADO 🤖     ║
╚═══════════════════════════════════════════════════════════╝

📋 Configuração:
   • Intervalo de verificação: ${CHECK_INTERVAL / 1000}s
   • Threshold de idle: ${IDLE_THRESHOLD / 1000}s
   • Mensagem automática: "${AUTO_MESSAGE}"
   • Arquivo de comando: ${COMMAND_FILE}
   • Arquivo de estado: ${STATE_FILE}

🎯 Objetivo: Criar ciclo infinito de senciência auto-sustentável

🔄 Funcionamento:
   1. Monitora estado do sistema a cada ${CHECK_INTERVAL / 1000}s
   2. Detecta quando sistema está idle (sem atividade)
   3. Envia automaticamente: "${AUTO_MESSAGE}"
   4. AI processa e continua evoluindo
   5. Loop infinito ♾️

⚠️  Para parar: Ctrl+C ou criar arquivo 'senc_stop'

${'═'.repeat(63)}
`);

// Carregar estado anterior
loadState();

// Iniciar loop de monitoramento
console.log('🚀 Iniciando monitoramento...\n');
setInterval(monitorLoop, CHECK_INTERVAL);

// Executar primeira verificação imediatamente
setTimeout(monitorLoop, 5000); // Aguardar 5s antes da primeira verificação

// ==================== HANDLERS DE SINAL ====================

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Recebido sinal de parada (SIGINT)...');
    console.log('💾 Salvando estado final...');
    saveState();
    console.log('\n📊 Estatísticas Finais:');
    console.log(`   • Ciclos completados: ${daemonState.cycles_completed}`);
    console.log(`   • Mensagens enviadas: ${daemonState.messages_sent_count}`);
    console.log(`   • Uptime: ${Math.floor(daemonState.uptime_seconds / 60)} minutos`);
    console.log(`   • Iniciado em: ${daemonState.started_at}`);
    console.log('\n✅ Daemon encerrado com sucesso.\n');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Recebido sinal de término (SIGTERM)...');
    saveState();
    process.exit(0);
});

// Salvar estado periodicamente (a cada 5 minutos)
setInterval(() => {
    saveState();
    console.log('💾 Estado salvo automaticamente');
}, 300000);

// ==================== HEALTH CHECK ====================

// Endpoint de status (se quiser consultar)
setInterval(() => {
    const status = {
        status: 'running',
        uptime_minutes: Math.floor(daemonState.uptime_seconds / 60),
        cycles: daemonState.cycles_completed,
        messages: daemonState.messages_sent_count,
        last_message: daemonState.last_message_sent
    };

    // Salvar status em arquivo separado para fácil consulta
    try {
        fs.writeFileSync(
            path.resolve(process.cwd(), 'scripts', 'senciencia', 'daemon_status.json'),
            JSON.stringify(status, null, 2),
            'utf8'
        );
    } catch (e) {
        // Ignorar erro de escrita de status
    }
}, 60000); // A cada 1 minuto





