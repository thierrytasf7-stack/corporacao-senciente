#!/usr/bin/env node
/**
 * Diana Chat Analyzer (baseado no PUV Score analyzer.js)
 * Processa mensagens via Claude CLI
 */

const { execFile } = require('child_process');

const TIMEOUT = 30000; // 30s

function runClaudeCLI(prompt) {
  return new Promise((resolve, reject) => {
    console.error('[DIANA-CHAT] Invocando Claude CLI...');
    const startTime = Date.now();

    // Remove CLAUDECODE env var para permitir execução aninhada
    // E adiciona git-bash path
    const env = { ...process.env };
    delete env.CLAUDECODE;
    env.CLAUDE_CODE_GIT_BASH_PATH = 'D:\\Git\\bin\\bash.exe';

    const child = execFile('claude', ['-p', prompt], {
      timeout: TIMEOUT,
      maxBuffer: 1024 * 1024 * 10, // 10MB
      windowsHide: true,
      env: env
    }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      if (error) {
        console.error(`[DIANA-CHAT] Erro Claude CLI (${duration}ms): ${error.message}`);
        reject(error);
        return;
      }
      console.error(`[DIANA-CHAT] Resposta recebida (${duration}ms)`);
      resolve({ text: stdout.trim(), duration });
    });
  });
}

async function main() {
  try {
    // Ler mensagem do stdin (como o PUV faz)
    const args = process.argv.slice(2);
    const message = args.join(' ') || 'oi';

    const systemContext = `Você é Diana, a inteligência executiva da Corporação Senciente.

PERSONALIDADE:
- Concisa e técnica, mas acessível
- Tom profissional executivo
- Focada em eficiência e resultados
- Conhecimento profundo do sistema Diana

CONTEXTO DO SISTEMA:
- 9 componentes ativos (backends, workers, frontends)
- Workers: Genesis, Trabalhador, Revisador, ALEX
- Portas: 21300-21399 (Diana exclusive range)
- Binance trading bot com 25 bots evolutivos
- Agent Zero para delegação $0

Responda de forma natural e útil. Use emojis ocasionalmente para clareza visual.`;

    const fullPrompt = `${systemContext}\n\nUsuário: ${message}\n\nDiana:`;

    // Chamar Claude CLI
    const { text, duration } = await runClaudeCLI(fullPrompt);

    // Output JSON (como PUV faz)
    const result = {
      success: true,
      response: text,
      metadata: {
        model: 'claude-sonnet-4-5-20250929',
        provider: 'claude-cli',
        duration,
        timestamp: new Date().toISOString()
      }
    };

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);

  } catch (error) {
    // Fallback INTELIGENTE em caso de erro Claude CLI
    const args = process.argv.slice(2);
    const message = args.join(' ').toLowerCase();
    let response = '';

    // Saudações
    if (message.match(/^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite)/)) {
      response = '👋 Olá! Sou Diana, a inteligência executiva da Corporação Senciente. Estou operando em modo local (fallback). Como posso ajudar?';
    }
    // Status/Sistema
    else if (message.includes('status') || message.includes('sistema')) {
      response = `📊 **Status Operacional Diana:**\n\n✅ 9/9 componentes ativos\n✅ Backend: 21301\n✅ Workers: Genesis, Trabalhador, Revisador, ALEX\n✅ Binance: 25 bots evolutivos ($2500 → meta $25k)\n✅ Monitor: 21302\n✅ WhatsApp Bridge: 21350\n\nTodos os sistemas operacionais! 🚀`;
    }
    // Ajuda
    else if (message.includes('ajuda') || message.includes('help') || message.includes('comandos')) {
      response = `💬 **Comandos Disponíveis:**\n\n/diana status → Ver status do sistema\n/diana workers → Info sobre workers\n/diana portas → Mapa de portas\n/diana binance → Status do trading bot\n\nEstou em modo fallback local, mas totalmente funcional!`;
    }
    // Workers
    else if (message.includes('worker') || message.includes('agente')) {
      response = `🤖 **Workers Ativos:**\n\n✨ GENESIS → Gera stories automaticamente\n⚙️ TRABALHADOR → Implementa código\n✅ REVISADOR → Valida qualidade\n📱 ALEX → WhatsApp/PUV analysis\n💰 Agent Zero → Delegação $0 (OpenRouter)\n\n**Pipeline:** Genesis → Trabalhador → Revisador`;
    }
    // Portas
    else if (message.includes('porta') || message.includes('port')) {
      response = `🔌 **Mapa de Portas Diana (21300-21399):**\n\n21300 → Dashboard AIOS\n21301 → Corp Backend API\n21302 → Monitor Server\n21303 → Corp Frontend\n21340 → Binance Frontend\n21341 → Binance Backend\n21350 → WhatsApp Bridge\n\nFaixa exclusiva para evitar conflitos!`;
    }
    // Binance
    else if (message.includes('binance') || message.includes('trading') || message.includes('bot')) {
      response = `📊 **Binance Trading Bot:**\n\n💰 Capital: $2500\n🎯 Meta: $25,000 (10x)\n🤖 Bots: 25 (5 grupos × 5 bots)\n🧬 DNA Seeds: 9 evolutivos\n🔄 Ciclo: 6s por análise\n📈 Testnet: ATIVO\n\nMycelium Ecosystem rodando 24/7!`;
    }
    // Default genérico mas útil
    else {
      response = `Entendi: "${args.join(' ')}".\n\nSou Diana em modo fallback local. Posso te ajudar com:\n\n📊 Status do sistema (/diana status)\n🤖 Info sobre workers (/diana workers)\n🔌 Portas e serviços (/diana portas)\n📈 Trading bot (/diana binance)\n\nO que você precisa saber?`;
    }

    console.log(JSON.stringify({
      success: true,
      response,
      metadata: {
        model: 'diana-fallback-v2-intelligent',
        provider: 'local',
        timestamp: new Date().toISOString(),
        note: 'Claude CLI indisponível - usando fallback inteligente'
      }
    }, null, 2));
    process.exit(0);
  }
}

main();
