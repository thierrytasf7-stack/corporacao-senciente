import express from 'express';
import { MathStrategyController } from './src/controllers/MathStrategyController';
import { RotativeAnalysisController } from './src/controllers/RotativeAnalysisController';
import { TradingStrategyController } from './src/controllers/TradingStrategyController';
import analysisRouter from './src/routes/analysis';
import marketsRouter from './src/routes/markets';
import positionMonitorRouter from './src/routes/positionMonitor';
import strategyRiskRouter from './src/routes/strategyRiskRoutes';
import BinanceRealService from './src/services/BinanceRealService';

const app = express();
const PORT = process.env.PORT || 13009;

// NÃO inicializar o binanceService no topo - fazer lazy loading
let binanceService: BinanceRealService | null = null;

// Função para obter o binanceService de forma lazy
const getBinanceService = (): BinanceRealService => {
    if (!binanceService) {
        console.log('🧪 Inicializando BinanceRealService de forma lazy...');
        binanceService = new BinanceRealService();
        console.log('✅ BinanceRealService inicializado com sucesso');
    }
    return binanceService;
};

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

// Rota para preços atuais da Binance
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

        console.log('💰 [PREÇO] Buscando preço atual para:', symbol);

        const service = getBinanceService();
        const prices = await service.getPrices(symbol);

        if (prices && prices[symbol]) {
            const price = prices[symbol];
            console.log('✅ [PREÇO] Preço obtido:', { symbol, price });

            return res.json({
                success: true,
                symbol,
                price: price.toString(),
                timestamp: new Date().toISOString()
            });
        } else {
            console.warn('⚠️ [PREÇO] Preço não encontrado para:', symbol);
            return res.status(404).json({
                success: false,
                message: 'Preço não encontrado',
                error: `Preço para ${symbol} não disponível`
            });
        }
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
        binanceConnected: binanceService ? binanceService.isConnectedToBinance() : false
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnected: binanceService ? binanceService.isConnectedToBinance() : false
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnected: binanceService ? binanceService.isConnectedToBinance() : false
    });
});

// Binance API routes - DADOS REAIS
app.get('/api/v1/binance/test-connection', async (_, res) => {
    try {
        console.log('🔗 Testando conexão REAL com Binance Testnet...');
        const service = getBinanceService();
        const result = await service.testConnection();

        if (result.success) {
            res.json({
                success: true,
                message: 'Conexão REAL com Binance Testnet estabelecida',
                status: 'connected',
                timestamp: new Date().toISOString(),
                note: 'Dados REAIS da Binance Testnet'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Falha na conexão REAL com Binance Testnet',
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
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
        console.log('🔐 Validando credenciais REAIS da Binance Testnet...');
        const service = getBinanceService();
        const result = await service.validateCredentials();

        if (result.valid) {
            res.json({
                success: true,
                message: 'Credenciais REAIS da Binance Testnet válidas',
                data: result
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Credenciais REAIS da Binance Testnet inválidas',
                error: result.error
            });
        }
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
        console.log('📊 Obtendo informações REAIS da conta Binance Testnet...');
        const service = getBinanceService();
        const accountInfo = await service.getAccountInfo();

        res.json({
            success: true,
            message: 'Informações REAIS da conta Binance Testnet obtidas',
            data: accountInfo
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
        console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
        const service = getBinanceService();
        const portfolioData = await service.getPortfolioData();

        res.json({
            success: true,
            message: 'Dados REAIS do portfolio Binance Testnet obtidos',
            data: portfolioData
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

// Binance Balances endpoint - DADOS REAIS
app.get('/api/v1/binance/balances', async (_, res) => {
    try {
        console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
        const service = getBinanceService();
        const balances = await service.getBalances();

        res.json({
            success: true,
            message: 'Saldos REAIS da Binance Testnet obtidos',
            data: balances,
            count: balances.length
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

// Binance Positions endpoint - DADOS REAIS
app.get('/api/v1/binance/positions', async (_, res) => {
    try {
        console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');
        const service = getBinanceService();
        const positions = await service.getActivePositions();

        res.json({
            success: true,
            message: 'Posições ativas REAIS da Binance Testnet obtidas',
            data: positions,
            count: positions.length
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

// Binance Trades endpoint - DADOS REAIS
app.get('/api/v1/binance/trades', async (req, res) => {
    try {
        const { symbol, limit = 50 } = req.query;
        console.log('📊 Obtendo histórico de trades REAIS da Binance Testnet...');

        const service = getBinanceService();
        const trades = await service.getTradeHistory(
            symbol as string,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            message: 'Histórico de trades REAIS da Binance Testnet obtido',
            data: trades,
            count: trades.length
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

// Binance Prices endpoint - DADOS REAIS
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

        const symbolsString = symbols.join(',');
        console.log('💰 Obtendo preços REAIS da Binance Testnet para:', symbolsString);

        const service = getBinanceService();
        const prices = await service.getPrices(symbolsString);

        res.json({
            success: true,
            message: 'Preços REAIS da Binance Testnet obtidos',
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
    console.log(`🚀 Servidor REAL da Binance Testnet rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Binance Testnet: ${binanceService ? 'Conectado' : 'Desconectado'}`);
    console.log(`⚡ Sistema AURA - DADOS REAIS da Binance Testnet`);
});
