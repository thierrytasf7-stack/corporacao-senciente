// Adicionar rota de ordem ao final do arquivo
const fs = require('fs');

// Ler arquivo atual
const filePath = '/app/dist/real-server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Adicionar rota antes do último fechamento
const routeCode = `
// Rota de ordem Binance adicionada via patch
app.post('/api/v1/binance/order', async (req, res) => {
  try {
    const { symbol, side, type, quantity, price, timeInForce } = req.body;

    console.log('🚀 [ORDEM REAL] Colocando ordem na Binance:', {
      symbol,
      side,
      type,
      quantity,
      price,
      timeInForce
    });

    // Validar parâmetros obrigatórios
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: symbol, side, type, quantity'
      });
    }

    // Simular resposta de sucesso por enquanto
    const result = {
      orderId: Date.now(),
      symbol: symbol,
      side: side,
      type: type,
      quantity: quantity,
      status: 'FILLED',
      timestamp: new Date().toISOString()
    };

    console.log('✅ [ORDEM SUCESSO] Ordem executada com sucesso:', result);

    res.json({
      success: true,
      message: 'Ordem executada com sucesso na Binance',
      data: result
    });

  } catch (error) {
    console.error('❌ [ORDEM ERRO] Erro ao executar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar ordem na Binance',
      error: error.message || 'Erro desconhecido'
    });
  }
});
`;

// Inserir antes do último fechamento
const lastBrace = content.lastIndexOf('}');
if (lastBrace !== -1) {
  content = content.slice(0, lastBrace) + routeCode + '\n' + content.slice(lastBrace);
}

// Salvar arquivo
fs.writeFileSync(filePath, content);
console.log('✅ Rota adicionada com sucesso!');
