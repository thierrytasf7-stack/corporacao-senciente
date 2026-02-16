const express = require('express');

const app = express();
const PORT = 13002; // Porta diferente para teste

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

// Rota de teste ultra-simples
app.get('/test', (req, res) => {
    console.log('✅ Rota de teste funcionando');
    res.json({ success: true, message: 'Teste básico funcionando' });
});

// Rota para testar BinanceRealService
app.get('/test-binance', async (req, res) => {
    console.log('🧪 Tentando importar BinanceRealService...');

    try {
        // Importar o serviço
        const BinanceRealService = require('./src/services/BinanceRealService').default;
        console.log('✅ BinanceRealService importado com sucesso');

        // Criar instância
        console.log('🧪 Criando instância do BinanceRealService...');
        const binanceService = new BinanceRealService();
        console.log('✅ Instância criada com sucesso');

        // Testar método simples
        console.log('🧪 Testando método testConnection...');
        const result = await binanceService.testConnection();
        console.log('✅ Método testado com sucesso:', result);

        res.json({
            success: true,
            message: 'BinanceRealService funcionando',
            result
        });
    } catch (error: any) {
        console.error('❌ Erro ao testar BinanceRealService:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
    console.log(`📍 Teste básico: http://localhost:${PORT}/test`);
    console.log(`📍 Teste Binance: http://localhost:${PORT}/test-binance`);
});
