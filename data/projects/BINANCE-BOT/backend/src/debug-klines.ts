import BinanceRealService from './services/BinanceRealService';

async function debugKlines() {
    console.log('🔍 DEBUGANDO ESTRUTURA DOS KLINES...');
    
    const binanceService = new BinanceRealService();
    
    try {
        // Obter klines e verificar estrutura
        const klines = await binanceService.getKlines('BTCUSDT', '1h', 24);
        
        console.log('📊 Total de klines:', klines.length);
        
        if (klines.length > 0) {
            console.log('📋 Estrutura do primeiro kline:');
            console.log('Tipo:', typeof klines[0]);
            console.log('É array?', Array.isArray(klines[0]));
            console.log('Conteúdo:', JSON.stringify(klines[0], null, 2));
            
            if (Array.isArray(klines[0])) {
                console.log('📊 Elementos do array:');
                klines[0].forEach((item: any, index: number) => {
                    console.log(`  [${index}]: ${item} (${typeof item})`);
                });
                
                // Tentar parsear dados
                const prices = klines.map(k => {
                    const price = k[4];
                    console.log(`Preço [4]: ${price} (${typeof price})`);
                    return parseFloat(price || '0');
                }).filter(p => p > 0);
                
                const volumes = klines.map(k => {
                    const volume = k[5];
                    console.log(`Volume [5]: ${volume} (${typeof volume})`);
                    return parseFloat(volume || '0');
                }).filter(v => v > 0);
                
                console.log('📈 Preços válidos:', prices.length);
                console.log('📊 Volumes válidos:', volumes.length);
                
                if (prices.length > 0) {
                    console.log('💰 Último preço:', prices[prices.length - 1]);
                }
                if (volumes.length > 0) {
                    console.log('📊 Último volume:', volumes[volumes.length - 1]);
                }
            }
        }
        
    } catch (error: any) {
        console.error('❌ Erro:', error.message);
    }
}

debugKlines().catch(console.error);
