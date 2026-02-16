const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function testBinanceConnection() {
    try {
        console.log('🔍 TESTANDO CONEXÃO COM BINANCE...');

        // Carregar configuração
        const configLoader = ConfigLoader.getInstance();
        const config = configLoader.loadConfig();
        const binanceConfig = config.binance;

        console.log('📋 Configuração carregada:', {
            apiKey: binanceConfig.apiKey ? '✅ Configurada' : '❌ Não configurada',
            secretKey: binanceConfig.secretKey ? '✅ Configurada' : '❌ Não configurada',
            useTestnet: binanceConfig.useTestnet
        });

        if (!binanceConfig.apiKey || !binanceConfig.secretKey) {
            console.error('❌ Credenciais da Binance não configuradas!');
            return;
        }

        // Criar serviço
        const binanceService = new BinanceApiService({
            apiKey: binanceConfig.apiKey,
            secretKey: binanceConfig.secretKey,
            isTestnet: binanceConfig.useTestnet
        });

        console.log('🔗 Testando conexão...');

        // Testar conexão
        const accountInfo = await binanceService.getAccountInfo();
        console.log('✅ Conexão com Binance OK!');
        console.log('📊 Account Info:', {
            accountType: accountInfo.accountType,
            canTrade: accountInfo.canTrade,
            canWithdraw: accountInfo.canWithdraw,
            canDeposit: accountInfo.canDeposit
        });

        // Testar preço
        const price = await binanceService.getCurrentPrice('BTCUSDT');
        console.log('💰 Preço BTCUSDT:', price);

        // Testar se símbolo é válido
        const isValid = await binanceService.isSymbolTradeable('BTCUSDT');
        console.log('✅ BTCUSDT é válido para trading:', isValid);

    } catch (error) {
        console.error('❌ ERRO na conexão com Binance:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testBinanceConnection();
