const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function debugServerBinanceInit() {
    try {
        console.log('🔍 DEBUGANDO INICIALIZAÇÃO DO BINANCE NO SERVIDOR...');

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
            isTestnet: binanceConfig.useTestnet || true
        });

        console.log('🔗 Testando testApiKey...');
        const result = await binanceService.testApiKey();

        console.log('📊 Resultado testApiKey:', {
            isValid: result.isValid,
            hasAccountInfo: !!result.accountInfo,
            error: result.error
        });

        if (result.isValid) {
            console.log('✅ testApiKey funcionando!');

            // Testar getAccountInfo diretamente
            console.log('🔗 Testando getAccountInfo...');
            const accountInfo = await binanceService.getAccountInfo();
            console.log('📊 AccountInfo:', {
                success: !!accountInfo,
                accountType: accountInfo?.accountType,
                canTrade: accountInfo?.canTrade
            });

            // Testar se o problema está no método específico usado pelo servidor
            console.log('🔗 Testando getAccountInfo via client...');
            const params = await binanceService.createSignedParams();
            console.log('📊 Params gerados:', params.substring(0, 100) + '...');

        } else {
            console.log('❌ Erro no testApiKey:', result.error);
        }

    } catch (error) {
        console.error('❌ ERRO na inicialização:', {
            message: error.message,
            stack: error.stack
        });
    }
}

debugServerBinanceInit();
