/**
 * Teste da Tool: checkCICD
 * DevEx Agent - Tool 3/4
 */

import { checkCICD } from '../cerebro/tools/devex_tools.js';

async function test() {
    console.log('🧪 Testando: checkCICD\n');

    try {
        const result = await checkCICD();

        console.log('✅ Resultado:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log(`\n📊 CI/CD Configurado: ${result.hasCI ? '✅ Sim' : '❌ Não'}`);

            if (result.ciConfigs && result.ciConfigs.length > 0) {
                console.log(`\n🔍 Configurações encontradas (${result.ciConfigs.length}):`);
                result.ciConfigs.forEach((config, idx) => {
                    console.log(`  ${idx + 1}. ${config.type}: ${config.file}`);
                });

                console.log(`\n📋 Tipos: ${result.ciTypes.join(', ')}`);
            }

            if (result.recommendations && result.recommendations.length > 0) {
                console.log(`\n💡 Recomendações:`);
                result.recommendations.forEach((rec, idx) => {
                    console.log(`  ${idx + 1}. ${rec}`);
                });
            }
        } else {
            console.log('❌ Erro:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro ao executar teste:', error.message);
        process.exit(1);
    }
}

test();














