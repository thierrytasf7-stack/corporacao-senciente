const express = require('express');

const app = express();
const PORT = 13003; // Porta diferente para teste

// Middleware básico
app.use(express.json());

// CORS básico
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Rota de teste básica
app.get('/test', (req, res) => {
    console.log('✅ Rota de teste funcionando');
    res.json({ success: true, message: 'Teste básico funcionando' });
});

// Inicializar serviço da Binance
console.log('🧪 Inicializando BinanceRealService...');
const BinanceRealService = require('./src/services/BinanceRealService').default;
const binanceService = new BinanceRealService();
console.log('✅ BinanceRealService inicializado');

// Rota de teste de conexão
app.get('/api/v1/binance/test-connection', async (req, res) => {
    console.log('🧪 Testando rota test-connection...');
    try {
        const result = await binanceService.testConnection();
        console.log('✅ test-connection funcionou:', result);
        res.json(result);
    } catch (error) {
        console.error('❌ Erro em test-connection:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota de posições
app.get('/api/v1/binance/positions', async (req, res) => {
    console.log('🧪 Testando rota positions...');
    try {
        const result = await binanceService.getActivePositions();
        console.log('✅ positions funcionou:', result.length, 'posições');
        res.json(result);
    } catch (error) {
        console.error('❌ Erro em positions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota de saldos
app.get('/api/v1/binance/balances', async (req, res) => {
    console.log('🧪 Testando rota balances...');
    try {
        const result = await binanceService.getBalances();
        console.log('✅ balances funcionou:', result.length, 'saldos');
        res.json(result);
    } catch (error) {
        console.error('❌ Erro em balances:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota de portfolio
app.get('/api/v1/binance/portfolio', async (req, res) => {
    console.log('🧪 Testando rota portfolio...');
    try {
        const result = await binanceService.getPortfolioData();
        console.log('✅ portfolio funcionou');
        res.json(result);
    } catch (error) {
        console.error('❌ Erro em portfolio:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor mínimo da Binance rodando na porta ${PORT}`);
    console.log(`📍 Teste básico: http://localhost:${PORT}/test`);
    console.log(`📍 Teste conexão: http://localhost:${PORT}/api/v1/binance/test-connection`);
    console.log(`📍 Teste posições: http://localhost:${PORT}/api/v1/binance/positions`);
    console.log(`📍 Teste saldos: http://localhost:${PORT}/api/v1/binance/balances`);
    console.log(`📍 Teste portfolio: http://localhost:${PORT}/api/v1/binance/portfolio`);
});
