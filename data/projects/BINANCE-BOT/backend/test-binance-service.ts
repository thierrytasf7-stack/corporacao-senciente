import BinanceRealService from './src/services/BinanceRealService';

async function testBinanceService() {
    console.log('🚀 Testando inicialização do BinanceRealService...');

    try {
        const binanceService = new BinanceRealService();
        console.log('✅ BinanceRealService inicializado com sucesso');

        // Testar método testConnection
        console.log('🧪 Testando método testConnection...');
        const connectionResult = await binanceService.testConnection();
        console.log('✅ testConnection resultado:', connectionResult);

        // Testar método getBalances
        console.log('🧪 Testando método getBalances...');
        const balances = await binanceService.getBalances();
        console.log('✅ getBalances resultado:', balances);

        console.log('🎉 Todos os testes passaram!');
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testBinanceService();
