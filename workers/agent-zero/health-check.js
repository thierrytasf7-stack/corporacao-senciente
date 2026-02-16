#!/usr/bin/env node
/**
 * Agent Zero v3.0 - Health Check CLI
 * Exibe status formatado do health.json
 */
const fs = require('fs');
const path = require('path');

const HEALTH_FILE = path.resolve(__dirname, 'data', 'health.json');

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function readHealthFile() {
  if (!fs.existsSync(HEALTH_FILE)) {
    console.log('❌ Arquivo health.json não encontrado');
    console.log(`   Caminho esperado: ${HEALTH_FILE}`);
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf-8'));
  } catch (err) {
    console.log('❌ Erro ao ler health.json:', err.message);
    process.exit(1);
  }
}

function displayStatus(health) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              Agent Zero v3.0 - Health Monitor              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Status geral
  console.log('📊 Status Geral');
  console.log('─'.repeat(62));
  console.log(`  Timestamp:        ${health.timestamp}`);
  console.log(`  Uptime:           ${formatUptime(health.uptime_ms)} (${health.uptime_seconds}s)`);
  console.log(`  Iniciado em:      ${health.started_at}`);

  // Tarefas
  console.log('\n📋 Tarefas');
  console.log('─'.repeat(62));
  console.log(`  Processadas:      ${health.tasks_processed}`);
  console.log(`  Falhadas:         ${health.tasks_failed}`);
  console.log(`  Taxa de sucesso:  ${health.success_rate}`);

  // Latência
  console.log('\n⏱️  Latência');
  console.log('─'.repeat(62));
  console.log(`  Média (ms):       ${health.avg_latency_ms}ms`);

  // Modelo ativo
  console.log('\n🤖 Modelo Ativo');
  console.log('─'.repeat(62));
  console.log(`  Modelo:           ${health.active_model}`);

  // Modelos utilizados
  if (Object.keys(health.models_used).length > 0) {
    console.log('\n  Histórico de modelos:');
    for (const [model, count] of Object.entries(health.models_used)) {
      console.log(`    • ${model}: ${count} tasks`);
    }
  }

  // Tokens
  console.log('\n🔢 Tokens');
  console.log('─'.repeat(62));
  console.log(`  Input total:      ${health.total_tokens_in}`);
  console.log(`  Output total:     ${health.total_tokens_out}`);
  console.log(`  Total:            ${health.total_tokens}`);

  // Rate limits
  if (Object.keys(health.rate_limits_hit).length > 0) {
    console.log('\n⚠️  Rate Limits Atingidos');
    console.log('─'.repeat(62));
    for (const [key, count] of Object.entries(health.rate_limits_hit)) {
      console.log(`  ${key}: ${count}x`);
    }
  }

  // Status de API keys
  if (Object.keys(health.api_keys_status).length > 0) {
    console.log('\n🔑 Status de API Keys');
    console.log('─'.repeat(62));
    for (const [key, status] of Object.entries(health.api_keys_status)) {
      const indicator = status === 'ok' ? '✓' : '✗';
      console.log(`  ${indicator} ${key}: ${status}`);
    }
  }

  // Último erro
  if (health.last_error) {
    console.log('\n❌ Último Erro');
    console.log('─'.repeat(62));
    console.log(`  Mensagem:    ${health.last_error.message}`);
    console.log(`  Timestamp:   ${health.last_error.timestamp}`);
    if (health.last_error.context && Object.keys(health.last_error.context).length > 0) {
      console.log(`  Contexto:    ${JSON.stringify(health.last_error.context)}`);
    }
  }

  console.log('\n');
}

function main() {
  const health = readHealthFile();
  displayStatus(health);

  // Modo JSON para parsing programático
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(health, null, 2));
  }

  // Modo raw (sem formatação)
  if (process.argv.includes('--raw')) {
    console.log(JSON.stringify(health));
  }

  // Modo watch (atualização a cada 2s)
  if (process.argv.includes('--watch')) {
    console.log('🔄 Modo watch ativo (Ctrl+C para sair)\n');
    setInterval(() => {
      console.clear();
      const updated = readHealthFile();
      displayStatus(updated);
    }, 2000);
  }
}

main();
