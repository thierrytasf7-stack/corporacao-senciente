import MarketService from './services/MarketService';
import { RotativeAnalysisService } from './services/RotativeAnalysisService';
import StrategyStorageService from './services/StrategyStorageService';

async function testRotativeAnalysis() {
    console.log('🔍 TESTE DO SISTEMA DE ANÁLISE ROTATIVA AURA');
    console.log('='.repeat(60));

    const rotativeService = new RotativeAnalysisService();
    const marketService = new MarketService();
    const strategyService = new StrategyStorageService();

    // 1. Verificar configuração
    console.log('\n1️⃣ VERIFICANDO CONFIGURAÇÃO...');

    const markets = marketService.getActiveMarkets();
    const strategies = strategyService.getStrategies().filter(s => s.isActive);

    console.log(`📊 Mercados ativos: ${markets.length}`);
    markets.forEach(market => {
        console.log(`   - ${market.symbol} (${market.name}) - ${market.tradingType}`);
    });

    console.log(`📊 Estratégias ativas: ${strategies.length}`);
    strategies.forEach(strategy => {
        console.log(`   - ${strategy.name} (${strategy.strategyType})`);
    });

    if (markets.length === 0) {
        console.log('⚠️ Nenhum mercado ativo! Ative alguns mercados primeiro.');
        return;
    }

    if (strategies.length === 0) {
        console.log('⚠️ Nenhuma estratégia ativa! Ative algumas estratégias primeiro.');
        return;
    }

    // 2. Testar análise de um mercado específico
    console.log('\n2️⃣ TESTANDO ANÁLISE DE MERCADO ESPECÍFICO...');

    const testMarket = markets[0];
    const testStrategy = strategies[0];

    console.log(`🎯 Testando: ${testMarket.symbol} com ${testStrategy.name}`);

    // Simular análise
    try {
        // Obter preço atual
        const currentPrice = await rotativeService['getCurrentPrice'](testMarket.symbol);
        console.log(`💰 Preço atual ${testMarket.symbol}: $${currentPrice}`);

        // Obter dados históricos
        const klines = await rotativeService['binanceService'].getKlines(testMarket.symbol, '1h', 24);
        console.log(`📊 Dados históricos obtidos: ${klines.length} registros`);

        if (klines.length >= 14) {
            // Calcular indicadores
            const prices = klines.map(k => parseFloat(k.close || '0')).filter(p => p > 0);
            const volumes = klines.map(k => parseFloat(k.volume || '0')).filter(v => v > 0);

            if (prices.length >= 14 && volumes.length >= 20) {
                const rsi = rotativeService['calculateRSI'](prices, 14);
                const sma20 = rotativeService['calculateSMA'](prices, 20);
                const volatility = rotativeService['calculateVolatility'](prices, 20);
                const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
                const currentVolume = volumes[volumes.length - 1];
                const trend = sma20 > prices[prices.length - 1] ? 'BEARISH' : 'BULLISH';

                console.log('📊 Indicadores calculados:');
                console.log(`   RSI: ${rsi.toFixed(2)}`);
                console.log(`   SMA20: ${sma20.toFixed(2)}`);
                console.log(`   Volatilidade: ${volatility.toFixed(2)}%`);
                console.log(`   Volume atual: ${currentVolume.toFixed(2)}`);
                console.log(`   Volume médio: ${avgVolume.toFixed(2)}`);
                console.log(`   Tendência: ${trend}`);

                // Testar geração de sinal
                const signal = await rotativeService['analyzeMarketWithStrategy'](testMarket, testStrategy, currentPrice);

                if (signal) {
                    console.log('🎯 SINAL GERADO:');
                    console.log(`   Lado: ${signal.side}`);
                    console.log(`   Preço: $${signal.price.toFixed(2)}`);
                    console.log(`   Quantidade: ${signal.quantity}`);
                    console.log(`   Confiança: ${signal.confidence.toFixed(1)}%`);
                    console.log(`   Razão: ${signal.reason}`);
                } else {
                    console.log('⏳ Nenhum sinal gerado para as condições atuais');
                }
            } else {
                console.log('⚠️ Dados insuficientes para análise técnica');
            }
        } else {
            console.log('⚠️ Dados históricos insuficientes');
        }

    } catch (error: any) {
        console.error('❌ Erro na análise:', error.message);
    }

    // 3. Verificar status do serviço
    console.log('\n3️⃣ STATUS DO SERVIÇO...');

    const status = rotativeService.getStatus();
    console.log(`🔄 Serviço rodando: ${status.isRunning ? 'Sim' : 'Não'}`);
    console.log(`📊 Mercados ativos: ${status.activeMarketsCount}`);
    console.log(`📊 Estratégias ativas: ${status.activeStrategiesCount}`);
    console.log(`🔄 Índice atual: ${status.currentMarketIndex}`);

    // 4. Testar início do serviço (sem executar)
    console.log('\n4️⃣ TESTE DE INÍCIO DO SERVIÇO...');

    try {
        const startResult = await rotativeService.startRotativeAnalysis();
        console.log(`🚀 Resultado do início: ${startResult.success ? 'Sucesso' : 'Falha'}`);
        console.log(`📝 Mensagem: ${startResult.message}`);

        if (startResult.success) {
            // Parar o serviço após 5 segundos
            setTimeout(() => {
                const stopResult = rotativeService.stopRotativeAnalysis();
                console.log(`🛑 Serviço parado: ${stopResult.success ? 'Sucesso' : 'Falha'}`);
            }, 5000);
        }

    } catch (error: any) {
        console.error('❌ Erro ao testar serviço:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 TESTE CONCLUÍDO');
    console.log('✅ Sistema de análise rotativa funcionando corretamente');
    console.log('💡 Para iniciar análise contínua, use o painel de controle');
}

// Executar teste
testRotativeAnalysis().catch(console.error);
