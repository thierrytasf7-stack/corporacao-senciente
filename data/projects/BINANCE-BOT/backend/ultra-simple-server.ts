const express = require('express');

const app = express();
const PORT = 13004;

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

// Rota que tenta importar o BinanceRealService
app.get('/test-import', (req, res) => {
    console.log('🧪 Tentando importar BinanceRealService...');

    try {
        const BinanceRealService = require('./src/services/BinanceRealService').default;
        console.log('✅ BinanceRealService importado com sucesso');

        const binanceService = new BinanceRealService();
        console.log('✅ Instância criada com sucesso');

        res.json({
            success: true,
            message: 'BinanceRealService importado e instanciado com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao importar BinanceRealService:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ultra-simples rodando na porta ${PORT}`);
    console.log(`📍 Teste básico: http://localhost:${PORT}/test`);
    console.log(`📍 Teste import: http://localhost:${PORT}/test-import`);
});
