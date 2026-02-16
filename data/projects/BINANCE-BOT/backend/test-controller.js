const { BinanceController } = require('./dist/controllers/BinanceController');

async function testController() {
    try {
        console.log('🔍 TESTANDO BINANCE CONTROLLER...');

        const controller = new BinanceController();

        // Simular request e response
        const mockReq = {};
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log('📊 Response Status:', code);
                    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
                    return mockRes;
                }
            })
        };

        console.log('🚀 Testando testConnection...');
        await controller.testConnection(mockReq, mockRes);

    } catch (error) {
        console.error('❌ ERRO no teste do controller:', error.message);
    }
}

testController();
