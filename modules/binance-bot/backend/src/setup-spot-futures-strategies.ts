import StrategyStorageService from './services/StrategyStorageService';

async function setupSpotFuturesStrategies() {
    console.log('🚀 Configurando estratégias Spot e Futures do Sistema AURA...');

    const strategyService = new StrategyStorageService();

    // Estratégia 1: Spot Trading (1x) - $5
    const spotStrategy = strategyService.saveStrategy({
        id: 'spot-mathematical-5usd',
        name: 'Estratégia Spot $5',
        isActive: false,
        buyThreshold: 2.5,
        sellThreshold: 2.5,
        stopLoss: 2.0,
        takeProfit: 4.0,
        description: 'Estratégia matemática spot com aposta de $5.00 - trading direto sem alavancagem para crescimento sustentável.',
        strategyType: 'TREND_FOLLOWING',
        timeframes: ['5m', '15m', '1h'],
        indicators: ['RSI', 'SMA', 'Volume'],
        riskLevel: 'LOW',
        leverage: 1, // Spot trading
        tradingType: 'SPOT',
        betValue: 5.00, // Valor da aposta $5
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Spot Trading Universal criada');

    // Estratégia 2: Futures Trading (10x) - $5
    const futuresStrategy = strategyService.saveStrategy({
        id: 'futures-mathematical-5usd',
        name: 'Estratégia Futures $5',
        isActive: false,
        buyThreshold: 1.8,
        sellThreshold: 1.8,
        stopLoss: 1.2,
        takeProfit: 2.5,
        description: 'Estratégia matemática futures com aposta de $5.00 e alavancagem 10x - para traders experientes que buscam maior retorno.',
        strategyType: 'SCALPING',
        timeframes: ['1m', '5m', '15m'],
        indicators: ['RSI', 'MACD', 'BollingerBands'],
        riskLevel: 'HIGH',
        leverage: 10, // Futures trading
        tradingType: 'FUTURES',
        betValue: 5.00, // Valor da aposta $5
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Futures Trading Universal criada');

    console.log('🎯 Estratégias Matemáticas Padrão configuradas com sucesso!');
    console.log('📊 Resumo das estratégias:');
    console.log('   • Estratégia Spot $5 (1x) - Baixo risco');
    console.log('   • Estratégia Futures $5 (10x) - Alto risco');
}

export default setupSpotFuturesStrategies;
