"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const BinanceRealService_1 = require("./src/services/BinanceRealService");
const app = express();
const PORT = 13008;
// Middleware básico
app.use(express.json());
// CORS básico
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
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
const binanceService = new BinanceRealService_1.default();
console.log('✅ BinanceRealService inicializado');
// Rotas da Binance
app.get('/api/v1/binance/test-connection', async (_, res) => {
    console.log('🧪 Testando rota test-connection...');
    try {
        console.log('🔗 Testando conexão REAL com Binance Testnet...');
        const result = await binanceService.testConnection();
        console.log('✅ test-connection funcionou:', result);
        if (result.success) {
            return res.json({
                success: true,
                message: 'Conexão REAL com Binance Testnet estabelecida',
                data: result,
                note: 'Dados REAIS da Binance Testnet'
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Falha na conexão REAL com Binance Testnet',
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('❌ Erro em test-connection:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/v1/binance/positions', async (_, res) => {
    console.log('🧪 Testando rota positions...');
    try {
        console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');
        const positions = await binanceService.getActivePositions();
        console.log('✅ positions funcionou:', positions.length, 'posições');
        return res.json({
            success: true,
            message: 'Posições ativas REAIS da Binance Testnet obtidas',
            data: positions,
            count: positions.length
        });
    }
    catch (error) {
        console.error('❌ Erro em positions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/v1/binance/balances', async (_, res) => {
    console.log('🧪 Testando rota balances...');
    try {
        console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
        const balances = await binanceService.getBalances();
        console.log('✅ balances funcionou:', balances.length, 'saldos');
        return res.json({
            success: true,
            message: 'Saldos REAIS da Binance Testnet obtidos',
            data: balances,
            count: balances.length
        });
    }
    catch (error) {
        console.error('❌ Erro em balances:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/v1/binance/portfolio', async (_, res) => {
    console.log('🧪 Testando rota portfolio...');
    try {
        console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
        const portfolioData = await binanceService.getPortfolioData();
        console.log('✅ portfolio funcionou');
        return res.json({
            success: true,
            message: 'Dados REAIS do portfolio Binance Testnet obtidos',
            data: portfolioData
        });
    }
    catch (error) {
        console.error('❌ Erro em portfolio:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/v1/binance/price/:symbol', async (req, res) => {
    console.log('🧪 Testando rota price...');
    try {
        const { symbol } = req.params;
        console.log('💰 [PREÇO] Buscando preço atual para:', symbol);
        const prices = await binanceService.getPrices(symbol);
        if (prices && prices[symbol]) {
            const price = prices[symbol];
            console.log('✅ [PREÇO] Preço obtido:', { symbol, price });
            return res.json({
                success: true,
                symbol,
                price: price.toString(),
                timestamp: new Date().toISOString()
            });
        }
        else {
            console.warn('⚠️ [PREÇO] Preço não encontrado para:', symbol);
            return res.status(404).json({
                success: false,
                message: 'Preço não encontrado',
                error: `Preço para ${symbol} não disponível`
            });
        }
    }
    catch (error) {
        console.error('❌ Erro em price:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor apenas Binance rodando na porta ${PORT}`);
    console.log(`📍 Teste básico: http://localhost:${PORT}/test`);
    console.log(`📍 Teste conexão: http://localhost:${PORT}/api/v1/binance/test-connection`);
    console.log(`📍 Teste posições: http://localhost:${PORT}/api/v1/binance/positions`);
    console.log(`📍 Teste saldos: http://localhost:${PORT}/api/v1/binance/balances`);
    console.log(`📍 Teste portfolio: http://localhost:${PORT}/api/v1/binance/portfolio`);
    console.log(`📍 Teste preço: http://localhost:${PORT}/api/v1/binance/price/BTCUSDT`);
});
