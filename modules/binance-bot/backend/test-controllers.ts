import { MathStrategyController } from './src/controllers/MathStrategyController';
import { RotativeAnalysisController } from './src/controllers/RotativeAnalysisController';
import { TradingStrategyController } from './src/controllers/TradingStrategyController';

async function testControllers() {
    console.log('🚀 Testando inicialização dos controllers...');

    try {
        console.log('🧪 Testando MathStrategyController...');
        const mathStrategyController = new MathStrategyController();
        console.log('✅ MathStrategyController inicializado com sucesso');

        console.log('🧪 Testando TradingStrategyController...');
        const tradingStrategyController = new TradingStrategyController();
        console.log('✅ TradingStrategyController inicializado com sucesso');

        console.log('🧪 Testando RotativeAnalysisController...');
        const rotativeAnalysisController = new RotativeAnalysisController();
        console.log('✅ RotativeAnalysisController inicializado com sucesso');

        console.log('🎉 Todos os controllers foram inicializados com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante o teste dos controllers:', error);
    }
}

testControllers();
