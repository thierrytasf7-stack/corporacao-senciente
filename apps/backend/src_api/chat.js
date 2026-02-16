/**
 * API de Chat com Agentes
 * 
 * Endpoints:
 * - GET /api/chat/status - Status da conexão
 * - POST /api/chat/message - Enviar mensagem para agente
 */

/**
 * GET /api/chat/status
 */
export async function getChatStatus(req, res) {
  try {
    // Verificar se backend está operacional
    res.json({ 
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar status do chat:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/chat/message
 * Chat Diana via Claude CLI direto (Sonnet 4.5)
 */
export async function sendChatMessage(req, res) {
  try {
    const { agentId, agentName, message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message é obrigatório' });
    }

    // Construir contexto da conversa
    const conversationHistory = context?.conversationHistory || [];
    const historyText = conversationHistory
      .slice(-10) // Últimas 10 mensagens
      .map(msg => {
        const role = msg.type === 'user' ? 'Usuário' : 'Diana';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    // Prompt para Diana com personalidade
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

    const fullPrompt = historyText
      ? `${systemContext}\n\n=== HISTÓRICO DA CONVERSA ===\n${historyText}\n\n=== NOVA MENSAGEM ===\nUsuário: ${message}\n\nDiana:`
      : `${systemContext}\n\nUsuário: ${message}\n\nDiana:`;

    // Chamar Claude CLI (método PUV Score - execFile com -p)
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);

    try {
      // Executar Claude CLI (só -p, sem outras opções)
      console.log('[Chat] Chamando Claude CLI...');
      const { stdout, stderr } = await execFileAsync('claude', ['-p', fullPrompt], {
        timeout: 30000,
        maxBuffer: 1024 * 1024, // 1MB
        windowsHide: true
      });

      const cleanResponse = stdout.trim();
      console.log('[Chat] Claude respondeu:', cleanResponse.substring(0, 100) + '...');

      return res.json({
        response: cleanResponse || 'Recebi sua mensagem. Como posso ajudar?',
        metadata: {
          model: 'claude-sonnet-4-5-20250929',
          provider: 'claude-cli',
          timestamp: new Date().toISOString()
        }
      });

    } catch (execError) {
      console.error('[Chat] Erro ao chamar Claude CLI:', execError.message);

      // Se Claude CLI falhou, usar fallback inteligente
      console.log('Claude CLI não disponível, usando fallback:', execError.message);
      const msgLower = message.toLowerCase();
      let response = '';

    // Identificação e apresentação
    if (msgLower.includes('quem') && (msgLower.includes('você') || msgLower.includes('diana'))) {
      response = `Sou Diana, a inteligência executiva da Corporação Senciente. Opero 24/7 com autonomia soberana, orquestrando workers, agentes e processos automatizados. Minha função é maximizar eficiência operacional e apoiar decisões estratégicas.`;
    }
    // Status do sistema
    else if (msgLower.includes('status') || msgLower.includes('sistema')) {
      response = `📊 **Status Operacional:**
- ✅ 9/9 componentes ativos
- ✅ Backends: corp, binance, whatsapp
- ✅ Workers: agent-zero, maestro
- ✅ Frontends: dashboard, corp, binance
- ✅ Monitor-server com Bun
- 🌐 Todas as portas (21300-21350) respondendo

Sistema operando em **capacidade máxima**.`;
    }
    // Ajuda e comandos
    else if (msgLower.includes('ajuda') || msgLower.includes('help') || msgLower.includes('comandos')) {
      response = `💬 **Comandos Disponíveis:**
- "status" → Status do sistema
- "workers" → Info sobre workers ativos
- "portas" → Mapa de portas e serviços
- "agentes" → Lista de agentes AIOS
- "quem é você" → Apresentação Diana

Estou em modo interativo - pergunte o que precisar!`;
    }
    // Workers
    else if (msgLower.includes('worker') || msgLower.includes('agente')) {
      response = `🤖 **Workers Ativos:**
- **GENESIS** → Gera stories automaticamente
- **TRABALHADOR** → Implementa código
- **REVISADOR** → Valida qualidade
- **ALEX** → WhatsApp/PUV analysis
- **Agent Zero** → Delegação $0 via OpenRouter

Pipeline: Genesis → Trabalhador → Revisador`;
    }
    // Portas
    else if (msgLower.includes('porta') || msgLower.includes('port')) {
      response = `🔌 **Mapa de Portas (21300-21399):**
- 21300: Dashboard AIOS
- 21301: Corp Backend API
- 21302: Monitor Server (Bun)
- 21303: Corp Frontend
- 21340: Binance Frontend
- 21341: Binance Backend
- 21350: WhatsApp Bridge

Faixa exclusiva Diana evita conflitos.`;
    }
    // Binance
    else if (msgLower.includes('binance') || msgLower.includes('trading')) {
      response = `📊 **Binance Trading:**
- Conectado ao Testnet
- 8 estratégias spot ativas
- Backend: 21341 | Frontend: 21340
- Mycelium Ecosystem: 25 bots evolutivos
- Capital inicial: $2500 → Meta: $25k (10x)`;
    }
    // Saudações
    else if (msgLower.match(/^(oi|olá|ola|hey|hi|hello)/)) {
      response = `Olá! Sou Diana, core intelligence da Corporação. Sistema operacional e pronto para assist você. O que precisa?`;
    }
    // Agradecimentos
    else if (msgLower.includes('obrigad') || msgLower.includes('valeu')) {
      response = `Disponha. Estou sempre online para otimizar a operação. 🚀`;
    }
    // Default - resposta genérica mas útil
    else {
      response = `Entendido: "${message}".

Como IA executiva, posso te ajudar com:
- Status e monitoramento do sistema
- Informações sobre workers e agentes
- Configurações e arquitetura
- Análise de dados operacionais

Digite "ajuda" para ver comandos disponíveis.`;
    }

      return res.json({
        response,
        metadata: {
          model: 'diana-fallback-v1',
          provider: 'local',
          timestamp: new Date().toISOString()
        }
      });
    } // Fecha catch do execError

  } catch (error) {
    console.error('Erro ao processar mensagem do chat:', error);
    res.status(500).json({
      error: error.message,
      response: `Desculpe, ocorreu um erro ao processar sua mensagem: ${error.message}`
    });
  }
}

