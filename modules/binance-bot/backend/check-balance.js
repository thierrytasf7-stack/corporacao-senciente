const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function checkBalance() {
    try {
        console.log('🔍 VERIFICANDO SALDO DA CONTA BINANCE TESTNET...');

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

        // Verificar saldo da conta
        const accountInfo = await binanceService.getAccountInfo();
        console.log('📊 Account Info:', {
            accountType: accountInfo.accountType,
            canTrade: accountInfo.canTrade,
            canWithdraw: accountInfo.canWithdraw,
            canDeposit: accountInfo.canDeposit
        });

        // Mostrar saldos
        console.log('\n💰 SALDOS DISPONÍVEIS:');
        const balances = accountInfo.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);

        if (balances.length === 0) {
            console.log('❌ NENHUM SALDO ENCONTRADO!');
            console.log('💡 Você precisa depositar fundos na Binance Testnet');
            console.log('🌐 Acesse: https://testnet.binance.vision/');
            console.log('📝 Use o faucet para obter fundos de teste');
        } else {
            balances.forEach(balance => {
                console.log(`  ${balance.asset}: ${balance.free} (livre) + ${balance.locked} (bloqueado) = ${(parseFloat(balance.free) + parseFloat(balance.locked)).toFixed(8)}`);
            });
        }

        // Verificar preços dos símbolos
        console.log('\n📈 PREÇOS ATUAIS:');
        const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
        for (const symbol of symbols) {
            try {
                const price = await binanceService.getCurrentPrice(symbol);
                console.log(`  ${symbol}: $${price}`);
            } catch (error) {
                console.log(`  ${symbol}: ❌ Erro ao obter preço`);
            }
        }

    } catch (error) {
        console.error('❌ ERRO ao verificar saldo:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

checkBalance();
