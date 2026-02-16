import express from 'express';
import { MathStrategyController } from './src/controllers/MathStrategyController';
import { RotativeAnalysisController } from './src/controllers/RotativeAnalysisController';
import { TradingStrategyController } from './src/controllers/TradingStrategyController';
import analysisRouter from './src/routes/analysis';
import marketsRouter from './src/routes/markets';
import positionMonitorRouter from './src/routes/positionMonitor';
import strategyRiskRouter from './src/routes/strategyRiskRoutes';

const app = express();
const PORT = process.env.PORT || 13010;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:13000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Rotas da API
app.use('/api/markets', marketsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/v1/strategy-risk', strategyRiskRouter);
app.use('/api/v1/position-monitor', positionMonitorRouter);

// Novas rotas v1
const mathStrategyController = new MathStrategyController();
const tradingStrategyController = new TradingStrategyController();
const rotativeAnalysisController = new RotativeAnalysisController();

// Rotas para Estratégias Matemáticas
app.get('/api/v1/math-strategies', (req, res) => mathStrategyController.getAllStrategies(req, res));
app.post('/api/v1/math-strategies', (req, res) => mathStrategyController.createStrategy(req, res));
app.post('/api/v1/math-strategies/:id/toggle', (req, res) => mathStrategyController.toggleStrategy(req, res));
app.get('/api/v1/math-strategies/active', (req, res) => mathStrategyController.getActiveStrategy(req, res));
app.post('/api/v1/math-strategies/initialize-default', (req, res) => mathStrategyController.initializeDefaultStrategy(req, res));

// Rotas para Estratégias de Trading
app.get('/api/v1/trading-strategies', (req, res) => tradingStrategyController.getAllStrategies(req, res));
app.post('/api/v1/trading-strategies', (req, res) => tradingStrategyController.createStrategy(req, res));
app.post('/api/v1/trading-strategies/:id/toggle', (req, res) => tradingStrategyController.toggleStrategy(req, res));
app.delete('/api/v1/trading-strategies/:id', (req, res) => tradingStrategyController.deleteStrategy(req, res));
app.get('/api/v1/trading-strategies/active', (req, res) => tradingStrategyController.getActiveStrategies(req, res));
app.get('/api/v1/trading-strategies/timeframes', (req, res) => tradingStrategyController.getTimeframes(req, res));
app.get('/api/v1/trading-strategies/by-timeframe/:timeframe', (req, res) => tradingStrategyController.getStrategiesByTimeframe(req, res));

// Rota para todas as estratégias (matemáticas e de trading)
app.get('/api/v1/strategies', async (req, res) => {
    try {
        const { MathStrategyService } = require('./src/services/MathStrategyService');
        const TradingStrategyService = require('./src/services/TradingStrategyService').default;

        const mathStrategyService = new MathStrategyService();
        const tradingStrategyService = new TradingStrategyService();

        const mathStrategies = await mathStrategyService.getAllStrategies();
        const tradingStrategies = await tradingStrategyService.getAllStrategies();

        res.json({
            success: true,
            data: {
                mathStrategies,
                tradingStrategies
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estratégias',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Rotas para Análise Rotativa
app.get('/api/v1/rotative-analysis/status', (req, res) => rotativeAnalysisController.getStatus(req, res));
app.post('/api/v1/rotative-analysis/start', (req, res) => rotativeAnalysisController.startAnalysis(req, res));
app.post('/api/v1/rotative-analysis/stop', (req, res) => rotativeAnalysisController.stopAnalysis(req, res));
app.get('/api/v1/rotative-analysis/signals', (req, res) => rotativeAnalysisController.getSignals(req, res));
app.get('/api/v1/rotative-analysis/logs', (req, res) => rotativeAnalysisController.getLogs(req, res));
app.get('/api/v1/rotative-analysis/stats', (req, res) => rotativeAnalysisController.getStats(req, res));

// Rota para preços atuais da Binance - ESTÁTICA
app.get('/api/v1/binance/price/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: 'Símbolo é obrigatório',
                error: 'Parâmetro symbol não fornecido'
            });
        }

        console.log('💰 [PREÇO] Retornando preço estático para:', symbol);

        // Dados estáticos de demonstração
        const staticPrices: { [key: string]: number } = {
            'BTCUSDT': 45000,
            'ETHUSDT': 2800,
            'BNBUSDT': 300,
            'ADAUSDT': 0.5,
            'DOTUSDT': 7.5
        };

        const price = staticPrices[symbol] || 1000;

        console.log('✅ [PREÇO] Preço estático retornado:', { symbol, price });

        return res.json({
            success: true,
            symbol,
            price: price.toString(),
            timestamp: new Date().toISOString(),
            note: 'Dados estáticos de demonstração'
        });
    } catch (error) {
        console.error('❌ [PREÇO] Erro ao obter preço:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter preço atual',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Inicializar mercados padrão se não existirem
app.post('/api/markets/initialize-defaults', (req, res) => {
    try {
        const marketService = new (require('./src/services/MarketService').default)();
        const markets = marketService.getMarkets();

        if (markets.length === 0) {
            marketService.initializeDefaultMarkets();
            res.json({
                success: true,
                message: 'Mercados padrão inicializados com sucesso',
                data: marketService.getMarkets()
            });
        } else {
            res.json({
                success: true,
                message: 'Mercados já existem',
                data: markets
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao inicializar mercados padrão',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Rotas de status e health check
app.get('/api/v1/status', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnected: true
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnected: true
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnected: true
    });
});

// Binance API routes - DADOS ESTÁTICOS (SEM BinanceRealService)
app.get('/api/v1/binance/test-connection', async (_, res) => {
    try {
        console.log('🔗 Retornando conexão estática com Binance Testnet...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        res.json({
            success: true,
            message: 'Conexão estática com Binance Testnet estabelecida',
            status: 'connected',
            timestamp: new Date().toISOString(),
            note: 'Dados estáticos de demonstração'
        });
    } catch (error: any) {
        console.error('❌ Erro no teste de conexão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno no teste de conexão',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/v1/binance/validate-credentials', async (_, res) => {
    try {
        console.log('🔐 Retornando validação estática de credenciais...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        res.json({
            success: true,
            message: 'Credenciais estáticas da Binance Testnet válidas',
            data: { valid: true, note: 'Dados estáticos de demonstração' }
        });
    } catch (error: any) {
        console.error('❌ Erro na validação de credenciais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno na validação de credenciais',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/v1/binance/account-info', async (_, res) => {
    try {
        console.log('📊 Retornando informações estáticas da conta...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticAccountInfo = {
            accountType: 'SPOT',
            canTrade: true,
            canWithdraw: true,
            canDeposit: true,
            updateTime: Date.now(),
            balances: [
                { asset: 'USDT', free: '1000.00', locked: '0.00' },
                { asset: 'BTC', free: '0.001', locked: '0.00' },
                { asset: 'ETH', free: '0.01', locked: '0.00' }
            ]
        };

        res.json({
            success: true,
            message: 'Informações estáticas da conta Binance Testnet obtidas',
            data: staticAccountInfo
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter informações da conta:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter informações da conta',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/v1/binance/portfolio', async (_, res) => {
    try {
        console.log('📊 Retornando dados estáticos do portfolio...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticPortfolio = {
            totalValue: 1500.00,
            totalPnL: 50.00,
            totalPnLPercent: 3.33,
            availableBalance: 1000.00,
            investedAmount: 500.00,
            balances: [
                { asset: 'USDT', free: '1000.00', locked: '0.00' },
                { asset: 'BTC', free: '0.001', locked: '0.00' },
                { asset: 'ETH', free: '0.01', locked: '0.00' },
                { asset: 'BNB', free: '0.1', locked: '0.00' },
                { asset: 'ADA', free: '100', locked: '0.00' }
            ]
        };

        res.json({
            success: true,
            message: 'Dados estáticos do portfolio Binance Testnet obtidos',
            data: staticPortfolio
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter dados do portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter dados do portfolio',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Binance Balances endpoint - DADOS ESTÁTICOS
app.get('/api/v1/binance/balances', async (_, res) => {
    try {
        console.log('💰 Retornando saldos estáticos da Binance Testnet...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticBalances = [
            { asset: 'USDT', free: '1000.00', locked: '0.00' },
            { asset: 'BTC', free: '0.001', locked: '0.00' },
            { asset: 'ETH', free: '0.01', locked: '0.00' },
            { asset: 'BNB', free: '0.1', locked: '0.00' },
            { asset: 'ADA', free: '100', locked: '0.00' }
        ];

        res.json({
            success: true,
            message: 'Saldos estáticos da Binance Testnet obtidos',
            data: staticBalances,
            count: staticBalances.length
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter saldos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter saldos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Binance Positions endpoint - DADOS ESTÁTICOS
app.get('/api/v1/binance/positions', async (_, res) => {
    try {
        console.log('📈 Retornando posições estáticas da Binance Testnet...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticPositions = [
            {
                symbol: 'BTCUSDT',
                side: 'LONG',
                size: '0.001',
                entryPrice: '44000.00',
                markPrice: '45000.00',
                notional: '45.00',
                unrealizedPnl: '1.00',
                unrealizedPnlPercent: '2.22',
                leverage: '1',
                liquidationPrice: '0.00'
            },
            {
                symbol: 'ETHUSDT',
                side: 'LONG',
                size: '0.01',
                entryPrice: '2700.00',
                markPrice: '2800.00',
                notional: '28.00',
                unrealizedPnl: '1.00',
                unrealizedPnlPercent: '3.70',
                leverage: '1',
                liquidationPrice: '0.00'
            }
        ];

        res.json({
            success: true,
            message: 'Posições estáticas da Binance Testnet obtidas',
            data: staticPositions,
            count: staticPositions.length
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter posições ativas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter posições ativas',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Binance Trades endpoint - DADOS ESTÁTICOS
app.get('/api/v1/binance/trades', async (req, res) => {
    try {
        const { symbol, limit = 50 } = req.query;
        console.log('📊 Retornando histórico de trades estáticos...');

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticTrades = [
            {
                id: '123456789',
                symbol: symbol || 'BTCUSDT',
                orderId: '987654321',
                orderListId: -1,
                price: '45000.00',
                qty: '0.001',
                quoteQty: '45.00',
                commission: '0.000001',
                commissionAsset: 'BTC',
                time: Date.now() - 3600000,
                isBuyer: true,
                isMaker: false,
                isBestMatch: true
            }
        ];

        res.json({
            success: true,
            message: 'Histórico de trades estáticos da Binance Testnet obtido',
            data: staticTrades,
            count: staticTrades.length
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter histórico de trades:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter histórico de trades',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Binance Prices endpoint - DADOS ESTÁTICOS
app.post('/api/v1/binance/prices', async (req, res) => {
    try {
        const { symbols } = req.body;

        if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lista de símbolos é obrigatória',
                error: 'Parâmetro symbols deve ser um array não vazio'
            });
        }

        console.log('💰 Retornando preços estáticos para:', symbols.join(','));

        // Simular delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const staticPrices: { [key: string]: string } = {
            'BTCUSDT': '45000.00',
            'ETHUSDT': '2800.00',
            'BNBUSDT': '300.00',
            'ADAUSDT': '0.50',
            'DOTUSDT': '7.50'
        };

        const prices: { [key: string]: string } = {};
        symbols.forEach((symbol: string) => {
            prices[symbol] = staticPrices[symbol] || '1000.00';
        });

        res.json({
            success: true,
            message: 'Preços estáticos da Binance Testnet obtidos',
            data: prices,
            count: Object.keys(prices).length
        });
    } catch (error: any) {
        console.error('❌ Erro ao obter preços:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao obter preços',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ESTÁTICO da Binance Testnet rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Binance Testnet: Conectado (dados estáticos)`);
    console.log(`⚡ Sistema AURA - DADOS ESTÁTICOS da Binance Testnet`);
});
