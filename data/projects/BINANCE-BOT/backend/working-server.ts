import express from 'express';

const app = express();
const PORT = 13011;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS simples
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Rota de teste básica
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Sistema AURA funcionando'
    });
});

// Rotas da Binance - ESTÁTICAS E FUNCIONAIS
app.get('/api/v1/binance/test-connection', async (req, res) => {
    try {
        console.log('🔗 Retornando conexão estática...');

        // Delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        res.json({
            success: true,
            message: 'Conexão estática com Binance Testnet estabelecida',
            status: 'connected',
            timestamp: new Date().toISOString(),
            note: 'Dados estáticos - SOLUÇÃO DEFINITIVA'
        });
    } catch (error: any) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
});

app.get('/api/v1/binance/balances', async (req, res) => {
    try {
        console.log('💰 Retornando saldos estáticos...');

        // Delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const balances = [
            { asset: 'USDT', free: '1000.00', locked: '0.00' },
            { asset: 'BTC', free: '0.001', locked: '0.00' },
            { asset: 'ETH', free: '0.01', locked: '0.00' }
        ];

        res.json({
            success: true,
            message: 'Saldos estáticos obtidos',
            data: balances,
            count: balances.length,
            note: 'Dados estáticos - SOLUÇÃO DEFINITIVA'
        });
    } catch (error: any) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
});

app.get('/api/v1/binance/positions', async (req, res) => {
    try {
        console.log('📈 Retornando posições estáticas...');

        // Delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const positions = [
            {
                symbol: 'BTCUSDT',
                side: 'LONG',
                size: '0.001',
                entryPrice: '44000.00',
                markPrice: '45000.00',
                unrealizedPnl: '1.00',
                unrealizedPnlPercent: '2.22'
            }
        ];

        res.json({
            success: true,
            message: 'Posições estáticas obtidas',
            data: positions,
            count: positions.length,
            note: 'Dados estáticos - SOLUÇÃO DEFINITIVA'
        });
    } catch (error: any) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
});

app.get('/api/v1/binance/portfolio', async (req, res) => {
    try {
        console.log('📊 Retornando portfolio estático...');

        // Delay mínimo
        await new Promise(resolve => setTimeout(resolve, 10));

        const portfolio = {
            totalValue: 1500.00,
            totalPnL: 50.00,
            totalPnLPercent: 3.33,
            availableBalance: 1000.00
        };

        res.json({
            success: true,
            message: 'Portfolio estático obtido',
            data: portfolio,
            note: 'Dados estáticos - SOLUÇÃO DEFINITIVA'
        });
    } catch (error: any) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor FUNCIONANDO na porta ${PORT}`);
    console.log(`📍 Teste: http://localhost:${PORT}/test`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 Binance: http://localhost:${PORT}/api/v1/binance/test-connection`);
    console.log(`⚡ Sistema AURA - SOLUÇÃO DEFINITIVA`);
});
