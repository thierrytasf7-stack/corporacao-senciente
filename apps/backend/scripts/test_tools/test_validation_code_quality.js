/**
 * Teste da Tool: analyzeCodeQuality
 * Validation Agent - Tool 2/4
 */

import { analyzeCodeQuality } from '../cerebro/tools/validation_tools.js';

async function test() {
    console.log('🧪 Testando: analyzeCodeQuality\n');

    try {
        console.log('📊 Analisando qualidade de código do projeto...\n');
        const result = await analyzeCodeQuality(); // Sem filePath = analisa projeto inteiro

        if (result.success) {
            console.log('✅ Análise concluída!\n');
            console.log('📊 Métricas:');
            console.log(`  Complexidade: ${result.metrics.complexity || 0}`);
            console.log(`  Maintainability: ${result.metrics.maintainability.toFixed(1)}/100\n`);

            if (result.issues && result.issues.length > 0) {
                console.log('⚠️ Issues encontradas:');
                result.issues.forEach((issue, idx) => {
                    console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`);
                });
                console.log('');
            } else {
                console.log('✅ Nenhum issue encontrado\n');
            }

            if (result.recommendations && result.recommendations.length > 0) {
                console.log('💡 Recomendações:');
                result.recommendations.forEach((rec, idx) => {
                    console.log(`  ${idx + 1}. ${rec}`);
                });
            }
        } else {
            console.log('❌ Erro:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro ao executar teste:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

test();














