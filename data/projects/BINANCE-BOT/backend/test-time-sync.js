const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function testTimeSync() {
    try {
        console.log('🔍 TESTANDO SINCRONIZAÇÃO DE TEMPO...');

        // Carregar configuração
        const configLoader = ConfigLoader.getInstance();
        const config = configLoader.loadConfig();
        const binanceConfig = config.binance;

        // Criar serviço
        const binanceService = new BinanceApiService({
            apiKey: binanceConfig.apiKey,
            secretKey: binanceConfig.secretKey,
            isTestnet: binanceConfig.useTestnet
        });

        // Aguardar um pouco para a sincronização
        console.log('⏳ Aguardando sincronização de tempo...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Testar múltiplas vezes
        for (let i = 0; i < 3; i++) {
            console.log(`\n🔄 Tentativa ${i + 1}:`);

            try {
                const accountInfo = await binanceService.getAccountInfo();
                console.log('✅ Conta acessada com sucesso!');
                console.log('📊 Account Type:', accountInfo.accountType);
                console.log('💰 Balances:', accountInfo.balances.filter(b => parseFloat(b.free) > 0).length, 'ativos com saldo');

                // Se chegou aqui, a sincronização funcionou
                break;

            } catch (error) {
                console.log('❌ Erro:', {
                    message: error.message,
                    code: error.response?.data?.code,
                    msg: error.response?.data?.msg
                });

                if (i < 2) {
                    console.log('⏳ Aguardando 3 segundos antes da próxima tentativa...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }

    } catch (error) {
        console.error('❌ ERRO geral:', error.message);
    }
}

testTimeSync();
