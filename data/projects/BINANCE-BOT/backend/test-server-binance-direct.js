const axios = require('axios');

async function testServerBinanceDirect() {
    try {
        console.log('🔍 TESTANDO SERVIDOR DIRETAMENTE...');

        // Testar rota de teste simples primeiro
        console.log('🔗 Testando rota de teste...');
        const testResponse = await axios.get('http://localhost:13001/api/test-all-signals');
        console.log('✅ Rota de teste funcionando:', testResponse.data.message);

        // Testar rota da análise rotativa
        console.log('🔗 Testando análise rotativa...');
        const analysisResponse = await axios.get('http://localhost:13001/api/v1/real-analysis/status');
        console.log('✅ Análise rotativa funcionando:', analysisResponse.data.success);

        // Testar rota da Binance
        console.log('🔗 Testando Binance test-connection...');
        try {
            const binanceResponse = await axios.get('http://localhost:13001/api/v1/binance/test-connection');
            console.log('✅ Binance funcionando:', binanceResponse.data);
        } catch (error) {
            console.log('❌ Erro na Binance:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        }

    } catch (error) {
        console.error('❌ ERRO no teste do servidor:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testServerBinanceDirect();
