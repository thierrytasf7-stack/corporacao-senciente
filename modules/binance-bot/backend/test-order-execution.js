const { BinanceApiService } = require('./dist/services/BinanceApiService');
const { ConfigLoader } = require('./dist/config/ConfigLoader');

async function testOrderExecution() {
    try {
        console.log('🔍 TESTANDO EXECUÇÃO DE ORDENS...');

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

        // Verificar saldo primeiro
        console.log('💰 Verificando saldo...');
        const accountInfo = await binanceService.getAccountInfo();
        const usdtBalance = accountInfo.balances.find(b => b.asset === 'USDT');

        if (!usdtBalance || parseFloat(usdtBalance.free) < 10) {
            console.log('❌ Saldo insuficiente de USDT:', usdtBalance ? usdtBalance.free : '0');
            console.log('💡 Você precisa depositar USDT na Binance Testnet');
            console.log('🌐 Acesse: https://testnet.binance.vision/');
            return;
        }

        console.log('✅ Saldo USDT disponível:', usdtBalance.free);

        // Obter preço atual do BTC
        const btcPrice = await binanceService.getCurrentPrice('BTCUSDT');
        console.log('📈 Preço BTCUSDT:', btcPrice);

        // Calcular quantidade para $5
        const orderValue = 5; // $5
        const quantity = (orderValue / parseFloat(btcPrice)).toFixed(8);
        console.log('📊 Quantidade calculada para $5:', quantity);

        // Verificar se quantidade atende ao mínimo
        const symbolInfo = await binanceService.getSymbolInfo('BTCUSDT');
        const minNotional = symbolInfo.filters.find(f => f.filterType === 'NOTIONAL')?.minNotional;
        const minQty = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE')?.minQty;

        console.log('📋 Filtros do símbolo:', {
            minNotional: minNotional || 'N/A',
            minQty: minQty || 'N/A',
            stepSize: symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE')?.stepSize || 'N/A'
        });

        const notionalValue = parseFloat(quantity) * parseFloat(btcPrice);
        console.log('💵 Valor da ordem:', notionalValue);

        if (minNotional && notionalValue < parseFloat(minNotional)) {
            console.log('❌ Valor da ordem muito baixo. Mínimo:', minNotional);
            console.log('💡 Ajustando quantidade...');

            const adjustedQuantity = (parseFloat(minNotional) / parseFloat(btcPrice)).toFixed(8);
            console.log('📊 Nova quantidade ajustada:', adjustedQuantity);

            // Testar ordem com quantidade ajustada
            console.log('\n🚀 Testando ordem de compra...');
            try {
                const order = await binanceService.placeOrder({
                    symbol: 'BTCUSDT',
                    side: 'BUY',
                    type: 'MARKET',
                    quantity: adjustedQuantity
                });

                console.log('✅ Ordem executada com sucesso!', {
                    orderId: order.orderId,
                    status: order.status,
                    executedQty: order.executedQty,
                    cummulativeQuoteQty: order.cummulativeQuoteQty
                });

            } catch (orderError) {
                console.log('❌ Erro ao executar ordem:', {
                    message: orderError.message,
                    code: orderError.response?.data?.code,
                    msg: orderError.response?.data?.msg
                });
            }
        } else {
            console.log('✅ Valor da ordem atende aos requisitos mínimos');
        }

    } catch (error) {
        console.error('❌ ERRO no teste de execução:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testOrderExecution();
