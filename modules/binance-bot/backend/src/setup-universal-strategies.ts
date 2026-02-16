import StrategyStorageService from './services/StrategyStorageService';

async function setupUniversalStrategies() {
    console.log('🚀 Configurando estratégias universais do Sistema AURA...');

    const strategyService = new StrategyStorageService();

    // Estratégia 1: Scalping Universal
    strategyService.saveStrategy({
        id: 'scalping-universal',
        name: 'Scalping Universal',
        isActive: false,
        buyThreshold: 2.0,
        sellThreshold: 2.0,
        stopLoss: 1.5,
        takeProfit: 3.0,
        description: 'Estratégia de scalping universal para qualquer mercado - entrada rápida baseada em RSI e volume',
        strategyType: 'SCALPING',
        timeframes: ['1m', '5m', '15m'],
        indicators: ['RSI', 'Volume', 'SMA'],
        riskLevel: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Scalping Universal criada');

    // Estratégia 2: Trend Following Universal
    strategyService.saveStrategy({
        id: 'trend-following-universal',
        name: 'Trend Following Universal',
        isActive: false,
        buyThreshold: 3.0,
        sellThreshold: 3.0,
        stopLoss: 2.0,
        takeProfit: 5.0,
        description: 'Estratégia de seguimento de tendência universal usando médias móveis',
        strategyType: 'TREND_FOLLOWING',
        timeframes: ['1h', '4h', '1d'],
        indicators: ['SMA', 'EMA', 'RSI'],
        riskLevel: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Trend Following Universal criada');

    // Estratégia 3: Mean Reversion Universal
    strategyService.saveStrategy({
        id: 'mean-reversion-universal',
        name: 'Mean Reversion Universal',
        isActive: false,
        buyThreshold: 4.0,
        sellThreshold: 4.0,
        stopLoss: 2.5,
        takeProfit: 6.0,
        description: 'Estratégia de reversão à média universal baseada em RSI extremo',
        strategyType: 'MEAN_REVERSION',
        timeframes: ['4h', '1d'],
        indicators: ['RSI', 'Bollinger Bands', 'SMA'],
        riskLevel: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Mean Reversion Universal criada');

    // Estratégia 4: Breakout Universal
    strategyService.saveStrategy({
        id: 'breakout-universal',
        name: 'Breakout Universal',
        isActive: false,
        buyThreshold: 3.5,
        sellThreshold: 3.5,
        stopLoss: 2.2,
        takeProfit: 5.5,
        description: 'Estratégia de breakout universal para capturar movimentos de rompimento',
        strategyType: 'BREAKOUT',
        timeframes: ['1h', '4h', '1d'],
        indicators: ['Bollinger Bands', 'Volume', 'RSI'],
        riskLevel: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Breakout Universal criada');

    // Estratégia 5: Swing Universal
    strategyService.saveStrategy({
        id: 'swing-universal',
        name: 'Swing Universal',
        isActive: false,
        buyThreshold: 2.5,
        sellThreshold: 2.5,
        stopLoss: 1.8,
        takeProfit: 4.0,
        description: 'Estratégia de swing universal para movimentos médios',
        strategyType: 'SWING',
        timeframes: ['4h', '1d'],
        indicators: ['RSI', 'MACD', 'SMA'],
        riskLevel: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Estratégia Swing Universal criada');

    // Verificar estratégias criadas
    const strategies = strategyService.getStrategies();
    console.log(`\n📊 Total de estratégias universais configuradas: ${strategies.length}`);

    strategies.forEach(strategy => {
        console.log(`- ${strategy.name} (${strategy.strategyType}) - ${strategy.isActive ? '🟢 ATIVA' : '🔴 INATIVA'}`);
    });

    console.log('\n🎯 Estratégias universais configuradas com sucesso!');
    console.log('💡 Estas estratégias podem ser aplicadas a qualquer mercado configurado.');
    console.log('🌐 Acesse: http://localhost:13000/strategies');
}

// Executar configuração
setupUniversalStrategies().catch(console.error);
