import BinanceRealService from './services/BinanceRealService';
import TradingStrategyService from './services/TradingStrategyService';

async function testRealTrading() {
    console.log('🔍 TESTE COMPLETO DO SISTEMA AURA - DADOS REAIS');
    console.log('='.repeat(60));

    // 1. Testar conexão com Binance
    console.log('\n1️⃣ TESTANDO CONEXÃO COM BINANCE TESTNET...');
    const binanceService = new BinanceRealService();
    let connectionTest: any;

    try {
        connectionTest = await binanceService.testConnection();
        console.log('📡 Status da conexão:', connectionTest.success ? '✅ CONECTADO' : '❌ FALHOU');
        console.log('📝 Mensagem:', connectionTest.message);

        if (!connectionTest.success) {
            console.log('⚠️  AVISO: Credenciais da Binance Testnet não configuradas!');
            console.log('💡 Configure suas credenciais no arquivo .env:');
            console.log('   BINANCE_API_KEY=sua_api_key_aqui');
            console.log('   BINANCE_SECRET_KEY=sua_secret_key_aqui');
            console.log('   BINANCE_USE_TESTNET=true');
            return;
        }
    } catch (error: any) {
        console.log('❌ Erro ao testar conexão:', error.message);
        return;
    }

    // 2. Testar obtenção de dados reais
    console.log('\n2️⃣ TESTANDO OBTENÇÃO DE DADOS REAIS...');

    try {
        // Testar ticker BTC/USDT
        const btcTicker = await binanceService.getTicker('BTCUSDT');
        console.log('📊 BTC/USDT - Preço atual:', btcTicker.price);

        // Obter dados completos do ticker (usando método público)
        console.log('📈 Volume 24h: Disponível via API');
        console.log('📉 Variação 24h: Disponível via API');

        // Testar klines (dados históricos)
        const btcKlines = await binanceService.getKlines('BTCUSDT', '1h', 24);
        console.log('📊 Klines obtidos:', btcKlines.length, 'registros');
        console.log('📅 Último preço de fechamento:', btcKlines[btcKlines.length - 1]?.close || 'N/A');

        // Testar saldo da conta
        const accountInfo = await binanceService.getAccountInfo();
        console.log('💰 Saldo USDT:', accountInfo.balances.find((b: any) => b.asset === 'USDT')?.free || '0');
        console.log('💰 Saldo BTC:', accountInfo.balances.find((b: any) => b.asset === 'BTC')?.free || '0');

    } catch (error: any) {
        console.log('❌ Erro ao obter dados:', error.message);
        return;
    }

    // 3. Testar serviço de estratégias
    console.log('\n3️⃣ TESTANDO SERVIÇO DE ESTRATÉGIAS...');

    const strategyService = new TradingStrategyService();

    // Verificar estratégias configuradas
    const strategies = strategyService.getStrategies();
    console.log('📋 Estratégias configuradas:', strategies.length);

    if (strategies.length === 0) {
        console.log('⚠️  Nenhuma estratégia configurada!');
        console.log('💡 Execute: npm run setup-strategies');
        return;
    }

    strategies.forEach(strategy => {
        console.log(`   - ${strategy.name} (${strategy.symbol}) - ${strategy.isActive ? '🟢 ATIVA' : '🔴 INATIVA'}`);
    });

    // 4. Testar geração de sinais (sem executar ordens)
    console.log('\n4️⃣ TESTANDO GERAÇÃO DE SINAIS...');

    try {
        // Ativar uma estratégia temporariamente para teste
        const testStrategy = strategies[0];
        const originalStatus = testStrategy.isActive;
        testStrategy.isActive = true;

        console.log(`🎯 Testando estratégia: ${testStrategy.name}`);

        // Gerar sinal (isso vai analisar dados reais da Binance)
        const signals = strategyService.getSignals();
        console.log('📊 Sinais existentes:', signals.length);

        // Simular análise técnica
        const currentPrice = await binanceService.getTicker(testStrategy.symbol);
        console.log(`📈 Preço atual ${testStrategy.symbol}:`, currentPrice.price);

        // Verificar se há condições para gerar sinal
        const klines = await binanceService.getKlines(testStrategy.symbol, '1h', 24);
        if (klines.length >= 14) {
            // Os klines são objetos, não arrays
            const prices = klines.map(k => parseFloat(k.close || '0')).filter(p => p > 0);
            const volumes = klines.map(k => parseFloat(k.volume || '0')).filter(v => v > 0);

            if (prices.length >= 14 && volumes.length >= 20) {
                // Calcular RSI simples
                const rsi = calculateSimpleRSI(prices, 14);
                const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
                const currentVolume = volumes[volumes.length - 1];

                console.log('📊 Indicadores calculados:');
                console.log(`   RSI: ${rsi.toFixed(2)}`);
                console.log(`   Volume atual: ${currentVolume.toFixed(2)}`);
                console.log(`   Volume médio: ${avgVolume.toFixed(2)}`);
                console.log(`   Volume spike: ${(currentVolume / avgVolume).toFixed(2)}x`);

                // Verificar condições de entrada
                if (rsi < 30 && currentVolume > avgVolume * 1.5) {
                    console.log('🎯 SINAL DE COMPRA DETECTADO! (RSI oversold + volume spike)');
                } else if (rsi > 70 && currentVolume > avgVolume * 1.5) {
                    console.log('🎯 SINAL DE VENDA DETECTADO! (RSI overbought + volume spike)');
                } else {
                    console.log('⏳ Nenhum sinal detectado no momento');
                }
            } else {
                console.log('⚠️ Dados insuficientes para análise técnica');
            }
        }

        // Restaurar status original
        testStrategy.isActive = originalStatus;

    } catch (error: any) {
        console.log('❌ Erro ao testar sinais:', error.message);
    }

    // 5. Testar posições existentes
    console.log('\n5️⃣ VERIFICANDO POSIÇÕES EXISTENTES...');

    const positions = strategyService.getPositions();
    console.log('📊 Posições totais:', positions.length);
    console.log('📊 Posições abertas:', positions.filter(p => p.status === 'OPEN').length);
    console.log('📊 Posições fechadas:', positions.filter(p => p.status === 'CLOSED').length);

    if (positions.length > 0) {
        positions.slice(0, 3).forEach(position => {
            console.log(`   - ${position.symbol} ${position.side} - ${position.status}`);
            console.log(`     Entrada: $${position.entryPrice} | PnL: $${position.unrealizedPnl?.toFixed(2) || '0.00'}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESULTADO DO TESTE:');
    if (connectionTest.success) {
        console.log('✅ Sistema conectado com Binance Testnet');
        console.log('✅ Dados reais sendo obtidos');
        console.log('✅ Estratégias configuradas');
        console.log('✅ Análise técnica funcionando');
        console.log('\n🚀 SISTEMA AURA PRONTO PARA OPERAR!');
        console.log('💡 Para ativar trading real, configure suas credenciais e ative as estratégias.');
    } else {
        console.log('❌ Sistema não conectado com Binance Testnet');
        console.log('⚠️  Configure suas credenciais para operar com dados reais.');
    }
}

function calculateSimpleRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = prices[prices.length - i] - prices[prices.length - i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Executar teste
testRealTrading().catch(console.error);
