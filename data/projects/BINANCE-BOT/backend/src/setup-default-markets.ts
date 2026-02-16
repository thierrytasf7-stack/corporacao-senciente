import MarketService from './services/MarketService';

async function setupDefaultMarkets() {
    console.log('🚀 Configurando mercados padrão do Sistema AURA...');

    const marketService = new MarketService();

    // Mercado 1: Bitcoin
    const btcMarket = marketService.addMarket({
        symbol: 'BTCUSDT',
        name: 'Bitcoin',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 0.001,
        stopLoss: 1.5,
        takeProfit: 3.0,
        maxPositions: 2,
        description: 'Bitcoin - Principal criptomoeda',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        minQuantity: 0.0001,
        maxQuantity: 1.0,
        pricePrecision: 2,
        quantityPrecision: 4
    });

    if (btcMarket.success) {
        console.log('✅ Mercado Bitcoin adicionado');
    }

    // Mercado 2: Ethereum
    const ethMarket = marketService.addMarket({
        symbol: 'ETHUSDT',
        name: 'Ethereum',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 0.01,
        stopLoss: 2.0,
        takeProfit: 5.0,
        maxPositions: 2,
        description: 'Ethereum - Plataforma de contratos inteligentes',
        baseAsset: 'ETH',
        quoteAsset: 'USDT',
        minQuantity: 0.001,
        maxQuantity: 10.0,
        pricePrecision: 2,
        quantityPrecision: 3
    });

    if (ethMarket.success) {
        console.log('✅ Mercado Ethereum adicionado');
    }

    // Mercado 3: Cardano
    const adaMarket = marketService.addMarket({
        symbol: 'ADAUSDT',
        name: 'Cardano',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 100,
        stopLoss: 2.5,
        takeProfit: 6.0,
        maxPositions: 1,
        description: 'Cardano - Plataforma blockchain de terceira geração',
        baseAsset: 'ADA',
        quoteAsset: 'USDT',
        minQuantity: 1,
        maxQuantity: 10000,
        pricePrecision: 4,
        quantityPrecision: 0
    });

    if (adaMarket.success) {
        console.log('✅ Mercado Cardano adicionado');
    }

    // Mercado 4: Solana
    const solMarket = marketService.addMarket({
        symbol: 'SOLUSDT',
        name: 'Solana',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 0.1,
        stopLoss: 1.8,
        takeProfit: 4.0,
        maxPositions: 2,
        description: 'Solana - Plataforma blockchain de alta performance',
        baseAsset: 'SOL',
        quoteAsset: 'USDT',
        minQuantity: 0.01,
        maxQuantity: 100,
        pricePrecision: 2,
        quantityPrecision: 2
    });

    if (solMarket.success) {
        console.log('✅ Mercado Solana adicionado');
    }

    // Mercado 5: Polkadot
    const dotMarket = marketService.addMarket({
        symbol: 'DOTUSDT',
        name: 'Polkadot',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 1,
        stopLoss: 2.2,
        takeProfit: 5.5,
        maxPositions: 1,
        description: 'Polkadot - Protocolo de interoperabilidade blockchain',
        baseAsset: 'DOT',
        quoteAsset: 'USDT',
        minQuantity: 0.1,
        maxQuantity: 1000,
        pricePrecision: 3,
        quantityPrecision: 1
    });

    if (dotMarket.success) {
        console.log('✅ Mercado Polkadot adicionado');
    }

    // Mercado 6: Binance Coin
    const bnbMarket = marketService.addMarket({
        symbol: 'BNBUSDT',
        name: 'Binance Coin',
        tradingType: 'SPOT',
        isActive: true,
        quantity: 0.1,
        stopLoss: 2.0,
        takeProfit: 4.5,
        maxPositions: 2,
        description: 'Binance Coin - Token nativo da Binance',
        baseAsset: 'BNB',
        quoteAsset: 'USDT',
        minQuantity: 0.01,
        maxQuantity: 100,
        pricePrecision: 2,
        quantityPrecision: 2
    });

    if (bnbMarket.success) {
        console.log('✅ Mercado Binance Coin adicionado');
    }

    // Verificar mercados criados
    const markets = marketService.getMarkets();
    console.log(`\n📊 Total de mercados configurados: ${markets.length}`);

    markets.forEach(market => {
        console.log(`- ${market.symbol} (${market.name}) - ${market.tradingType} - ${market.isActive ? '🟢 ATIVO' : '🔴 INATIVO'}`);
    });

    console.log('\n🎯 Mercados padrão configurados com sucesso!');
    console.log('💡 Estes mercados serão analisados pelas estratégias universais.');
    console.log('🌐 Acesse: http://localhost:13000/markets');
}

// Executar configuração
setupDefaultMarkets().catch(console.error);
