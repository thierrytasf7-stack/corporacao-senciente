const express = require('express');
import BinanceRealService from './src/services/BinanceRealService';

const app = express();
const PORT = process.env.PORT || 13001;

// Inicializar serviço da Binance
console.log('🧪 Inicializando BinanceRealService...');
const binanceService = new BinanceRealService();
console.log('✅ BinanceRealService inicializado');

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

// Rota de teste básica
app.get('/test', (req, res) => {
    console.log('✅ Rota de teste funcionando');
    res.json({ success: true, message: 'Teste básico funcionando' });
});

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

// Binance API routes - DADOS REAIS
app.get('/api/v1/binance/test-connection', async (_, res) => {
    try {
        console.log('🔗 Testando conexão REAL com Binance Testnet...');
        const result = await binanceService.testConnection();

        if (result.success) {
            return res.json({
                success: true,
                message: 'Conexão REAL com Binance Testnet estabelecida',
                data: result,
                note: 'Dados REAIS da Binance Testnet'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Falha na conexão REAL com Binance Testnet',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ [CONEXÃO] Erro ao testar conexão:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao testar conexão com Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

app.get('/api/v1/binance/validate-credentials', async (_, res) => {
    try {
        console.log('🔐 Validando credenciais REAIS da Binance Testnet...');
        const result = await binanceService.validateCredentials();

        if (result.valid) {
            return res.json({
                success: true,
                message: 'Credenciais REAIS da Binance Testnet válidas',
                data: result
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Credenciais REAIS da Binance Testnet inválidas',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ [CREDENCIAIS] Erro ao validar credenciais:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao validar credenciais da Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

app.get('/api/v1/binance/account-info', async (_, res) => {
    try {
        console.log('📊 Obtendo informações REAIS da conta Binance Testnet...');
        const accountInfo = await binanceService.getAccountInfo();

        return res.json({
            success: true,
            message: 'Informações REAIS da conta Binance Testnet obtidas',
            data: accountInfo
        });
    } catch (error) {
        console.error('❌ [CONTA] Erro ao obter informações da conta:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter informações da conta Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

app.get('/api/v1/binance/portfolio', async (_, res) => {
    try {
        console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
        const portfolioData = await binanceService.getPortfolioData();

        return res.json({
            success: true,
            message: 'Dados REAIS do portfolio Binance Testnet obtidos',
            data: portfolioData
        });
    } catch (error) {
        console.error('❌ [PORTFOLIO] Erro ao obter dados do portfolio:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter dados do portfolio Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Binance Balances endpoint - DADOS REAIS
app.get('/api/v1/binance/balances', async (_, res) => {
    try {
        console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
        const balances = await binanceService.getBalances();

        return res.json({
            success: true,
            message: 'Saldos REAIS da Binance Testnet obtidos',
            data: balances,
            count: balances.length
        });
    } catch (error) {
        console.error('❌ [SALDOS] Erro ao obter saldos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter saldos da Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Binance Positions endpoint - DADOS REAIS
app.get('/api/v1/binance/positions', async (_, res) => {
    try {
        console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');
        const positions = await binanceService.getActivePositions();

        return res.json({
            success: true,
            message: 'Posições ativas REAIS da Binance Testnet obtidas',
            data: positions,
            count: positions.length
        });
    } catch (error) {
        console.error('❌ [POSIÇÕES] Erro ao obter posições ativas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter posições ativas da Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Binance Trades endpoint - DADOS REAIS
app.get('/api/v1/binance/trades', async (req, res) => {
    try {
        const { symbol, limit = 50 } = req.query;
        console.log('📊 Obtendo histórico de trades REAIS da Binance Testnet...');

        const trades = await binanceService.getTradeHistory(
            symbol as string,
            parseInt(limit as string)
        );

        return res.json({
            success: true,
            message: 'Histórico de trades REAIS da Binance Testnet obtido',
            data: trades,
            count: trades.length
        });
    } catch (error) {
        console.error('❌ [TRADES] Erro ao obter histórico de trades:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter histórico de trades da Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
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

        const prices = await binanceService.getPrices(symbolsString);

        return res.json({
            success: true,
            message: 'Preços REAIS da Binance Testnet obtidos',
            data: prices,
            count: Object.keys(prices).length
        });
    } catch (error) {
        console.error('❌ [PREÇOS] Erro ao obter preços:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter preços da Binance Testnet',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema AURA funcionando',
        timestamp: new Date().toISOString(),
        binanceConnection: binanceService.isConnectedToBinance()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor REAL da Binance Testnet rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Binance Testnet: ${binanceService.isConnectedToBinance() ? 'Conectado' : 'Desconectado'}`);
    console.log(`⚡ Sistema AURA - DADOS REAIS da Binance Testnet`);
});
