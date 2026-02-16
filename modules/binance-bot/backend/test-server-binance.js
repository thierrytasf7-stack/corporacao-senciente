const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function testServerBinance() {
    try {
        console.log('🔍 TESTANDO BINANCE SERVICE NO SERVIDOR...');

        // Simular exatamente o que o servidor faz
        const configLoader = ConfigLoader.getInstance();
        const config = configLoader.loadConfig();
        const binanceConfig = config.binance;

        console.log('📋 Configuração carregada:', {
            apiKey: binanceConfig.apiKey ? '✅ Configurada' : '❌ Não configurada',
            secretKey: binanceConfig.secretKey ? '✅ Configurada' : '❌ Não configurada',
            useTestnet: binanceConfig.useTestnet
        });

        // Criar serviço exatamente como o servidor faz
        const binanceService = new BinanceApiService({
            apiKey: binanceConfig.apiKey,
            secretKey: binanceConfig.secretKey,
            isTestnet: binanceConfig.useTestnet
        });

        console.log('🔗 Testando testApiKey...');
        const result = await binanceService.testApiKey();

        console.log('📊 Resultado:', {
            isValid: result.isValid,
            hasAccountInfo: !!result.accountInfo,
            error: result.error
        });

        if (result.isValid) {
            console.log('✅ Serviço funcionando perfeitamente!');
            console.log('📊 Account Type:', result.accountInfo.accountType);
        } else {
            console.log('❌ Erro no serviço:', result.error);
        }

    } catch (error) {
        console.error('❌ ERRO no teste do servidor:', {
            message: error.message,
            stack: error.stack
        });
    }
}

testServerBinance();
