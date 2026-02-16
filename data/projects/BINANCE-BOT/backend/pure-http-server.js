const http = require('http');

const PORT = 13006;

const server = http.createServer((req, res) => {
    console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/test') {
        console.log('✅ Rota de teste funcionando');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Teste básico funcionando' }));
        return;
    }

    if (req.url === '/test-import') {
        console.log('🧪 Tentando importar BinanceRealService...');

        try {
            // Compilar TypeScript para JavaScript primeiro
            const { execSync } = require('child_process');
            console.log('🔧 Compilando TypeScript...');
            execSync('npx tsc src/services/BinanceRealService.ts --outDir ./compiled --target es2020 --module commonjs', { stdio: 'inherit' });

            const BinanceRealService = require('./compiled/src/services/BinanceRealService').default;
            console.log('✅ BinanceRealService importado com sucesso');

            const binanceService = new BinanceRealService();
            console.log('✅ Instância criada com sucesso');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'BinanceRealService importado e instanciado com sucesso'
            }));
        } catch (error) {
            console.error('❌ Erro ao importar BinanceRealService:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            }));
        }
        return;
    }

    // Rota não encontrada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor HTTP puro rodando na porta ${PORT}`);
    console.log(`📍 Teste básico: http://localhost:${PORT}/test`);
    console.log(`📍 Teste import: http://localhost:${PORT}/test-import`);
});
