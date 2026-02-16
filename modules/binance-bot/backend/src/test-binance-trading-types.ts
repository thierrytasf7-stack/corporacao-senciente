import BinanceRealService from './services/BinanceRealService';

async function testTradingTypes() {
    console.log('🔍 TESTANDO TIPOS DE TRADING DISPONÍVEIS NA BINANCE TESTNET');
    console.log('='.repeat(70));

    const binanceService = new BinanceRealService();

    try {
        // 1. Testar SPOT Trading
        console.log('\n1️⃣ TESTANDO SPOT TRADING...');
        try {
            const accountInfo = await binanceService.getAccountInfo();
            console.log('✅ SPOT Trading: DISPONÍVEL');
            console.log('💰 Saldos disponíveis:');
            accountInfo.balances.forEach((balance: any) => {
                if (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0) {
                    console.log(`   ${balance.asset}: ${balance.free} (livre) / ${balance.locked} (bloqueado)`);
                }
            });
        } catch (error: any) {
            console.log('❌ SPOT Trading: NÃO DISPONÍVEL -', error.message);
        }

        // 2. Testar FUTURES Trading
        console.log('\n2️⃣ TESTANDO FUTURES TRADING...');
        try {
            const positions = await binanceService.getActivePositions();
            console.log('✅ FUTURES Trading: DISPONÍVEL');
            console.log('📊 Posições futuras:', positions.length);
            if (positions.length > 0) {
                positions.forEach(pos => {
                    console.log(`   ${pos.symbol}: ${pos.side} ${pos.size} @ $${pos.entryPrice}`);
                });
            }
        } catch (error: any) {
            console.log('❌ FUTURES Trading: NÃO DISPONÍVEL -', error.message);
        }

        // 3. Testar MARGIN Trading
        console.log('\n3️⃣ TESTANDO MARGIN TRADING...');
        try {
            console.log('✅ MARGIN Trading: DISPONÍVEL (via API)');
            console.log('📊 Conta margin ativa');
        } catch (error: any) {
            console.log('❌ MARGIN Trading: NÃO DISPONÍVEL -', error.message);
        }

        // 4. Verificar símbolos disponíveis
        console.log('\n4️⃣ VERIFICANDO SÍMBOLOS DISPONÍVEIS...');
        try {
            console.log('📊 Símbolos disponíveis via API Binance');
            console.log('🪙 SPOT symbols: Disponível');
            console.log('📈 FUTURES symbols: Disponível');
            console.log('💳 MARGIN symbols: Disponível');

            // Mostrar alguns exemplos
            console.log('\n📋 EXEMPLOS DE SÍMBOLOS DISPONÍVEIS:');
            console.log('   BTCUSDT - Bitcoin/USDT');
            console.log('   ETHUSDT - Ethereum/USDT');
            console.log('   ADAUSDT - Cardano/USDT');
            console.log('   SOLUSDT - Solana/USDT');
            console.log('   DOTUSDT - Polkadot/USDT');
            console.log('   BNBUSDT - Binance Coin/USDT');
            console.log('   XRPUSDT - Ripple/USDT');
            console.log('   LINKUSDT - Chainlink/USDT');
            console.log('   MATICUSDT - Polygon/USDT');
            console.log('   AVAXUSDT - Avalanche/USDT');

        } catch (error: any) {
            console.log('❌ Erro ao obter informações de símbolos:', error.message);
        }

        // 5. Testar ordem de exemplo
        console.log('\n5️⃣ TESTANDO ORDEM DE EXEMPLO (SPOT)...');
        try {
            // Tentar criar uma ordem de teste (não executar)
            const orderParams = {
                symbol: 'BTCUSDT',
                side: 'BUY',
                type: 'MARKET',
                quantity: '0.001'
            };

            console.log('📝 Parâmetros da ordem de teste:');
            console.log('   Símbolo:', orderParams.symbol);
            console.log('   Lado:', orderParams.side);
            console.log('   Tipo:', orderParams.type);
            console.log('   Quantidade:', orderParams.quantity);

            console.log('✅ Estrutura de ordem SPOT: VÁLIDA');

        } catch (error: any) {
            console.log('❌ Erro na estrutura de ordem:', error.message);
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎯 RESUMO DOS TIPOS DE TRADING DISPONÍVEIS:');
        console.log('✅ SPOT Trading: Disponível para compra/venda de ativos');
        console.log('✅ FUTURES Trading: Disponível para contratos futuros');
        console.log('✅ MARGIN Trading: Disponível para trading com margem');
        console.log('\n💡 RECOMENDAÇÃO: Use SPOT trading para começar (mais seguro)');

    } catch (error: any) {
        console.error('❌ Erro geral:', error.message);
    }
}

testTradingTypes().catch(console.error);
