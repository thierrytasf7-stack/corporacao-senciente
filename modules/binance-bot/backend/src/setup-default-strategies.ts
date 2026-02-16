import TradingStrategyService from './services/TradingStrategyService';

async function setupDefaultStrategies() {
    console.log('🚀 Configurando estratégias padrão do Sistema AURA...');

    const strategyService = new TradingStrategyService();

    // Estratégia 1: Scalping BTC/USDT
    const scalpingBTC = strategyService.createStrategy({
        name: 'Scalping BTC/USDT',
        symbol: 'BTCUSDT',
        strategyType: 'SCALPING',
        quantity: 0.001,
        buyThreshold: 2.0,
        sellThreshold: 2.0,
        stopLoss: 1.5,
        takeProfit: 3.0,
        maxPositions: 2,
        isActive: false,
        description: 'Estratégia de scalping para Bitcoin com entrada rápida baseada em RSI e volume',
        timeframes: ['1m', '5m', '15m'],
        indicators: ['RSI', 'Volume', 'SMA'],
        riskLevel: 'HIGH'
    });

    if (scalpingBTC.success) {
        console.log('✅ Estratégia Scalping BTC/USDT criada');
    }

    // Estratégia 2: Trend Following ETH/USDT
    const trendETH = strategyService.createStrategy({
        name: 'Trend Following ETH/USDT',
        symbol: 'ETHUSDT',
        strategyType: 'TREND_FOLLOWING',
        quantity: 0.01,
        buyThreshold: 3.0,
        sellThreshold: 3.0,
        stopLoss: 2.0,
        takeProfit: 5.0,
        maxPositions: 1,
        isActive: false,
        description: 'Estratégia de seguimento de tendência para Ethereum usando médias móveis',
        timeframes: ['1h', '4h', '1d'],
        indicators: ['SMA', 'EMA', 'RSI'],
        riskLevel: 'MEDIUM'
    });

    if (trendETH.success) {
        console.log('✅ Estratégia Trend Following ETH/USDT criada');
    }

    // Estratégia 3: Mean Reversion ADA/USDT
    const meanReversionADA = strategyService.createStrategy({
        name: 'Mean Reversion ADA/USDT',
        symbol: 'ADAUSDT',
        strategyType: 'MEAN_REVERSION',
        quantity: 100,
        buyThreshold: 4.0,
        sellThreshold: 4.0,
        stopLoss: 2.5,
        takeProfit: 6.0,
        maxPositions: 1,
        isActive: false,
        description: 'Estratégia de reversão à média para Cardano baseada em RSI extremo',
        timeframes: ['4h', '1d'],
        indicators: ['RSI', 'Bollinger Bands', 'SMA'],
        riskLevel: 'MEDIUM'
    });

    if (meanReversionADA.success) {
        console.log('✅ Estratégia Mean Reversion ADA/USDT criada');
    }

    // Estratégia 4: Scalping SOL/USDT
    const scalpingSOL = strategyService.createStrategy({
        name: 'Scalping SOL/USDT',
        symbol: 'SOLUSDT',
        strategyType: 'SCALPING',
        quantity: 0.1,
        buyThreshold: 2.5,
        sellThreshold: 2.5,
        stopLoss: 1.8,
        takeProfit: 4.0,
        maxPositions: 2,
        isActive: false,
        description: 'Estratégia de scalping para Solana com foco em momentum e volume',
        timeframes: ['1m', '5m', '15m'],
        indicators: ['RSI', 'Volume', 'MACD'],
        riskLevel: 'HIGH'
    });

    if (scalpingSOL.success) {
        console.log('✅ Estratégia Scalping SOL/USDT criada');
    }

    // Estratégia 5: Trend Following DOT/USDT
    const trendDOT = strategyService.createStrategy({
        name: 'Trend Following DOT/USDT',
        symbol: 'DOTUSDT',
        strategyType: 'TREND_FOLLOWING',
        quantity: 1,
        buyThreshold: 3.5,
        sellThreshold: 3.5,
        stopLoss: 2.2,
        takeProfit: 5.5,
        maxPositions: 1,
        isActive: false,
        description: 'Estratégia de seguimento de tendência para Polkadot com análise técnica',
        timeframes: ['1h', '4h', '1d'],
        indicators: ['SMA', 'EMA', 'RSI', 'MACD'],
        riskLevel: 'MEDIUM'
    });

    if (trendDOT.success) {
        console.log('✅ Estratégia Trend Following DOT/USDT criada');
    }

    // Verificar estratégias criadas
    const strategies = strategyService.getStrategies();
    console.log(`\n📊 Total de estratégias configuradas: ${strategies.length}`);

    strategies.forEach(strategy => {
        console.log(`- ${strategy.name} - ${strategy.isActive ? '🟢 ATIVA' : '🔴 INATIVA'}`);
    });

    console.log('\n🎯 Estratégias padrão configuradas com sucesso!');
    console.log('💡 Para ativar uma estratégia, use o painel de controle no frontend.');
    console.log('🌐 Acesse: http://localhost:13000/strategies');
}

// Executar configuração
setupDefaultStrategies().catch(console.error);
