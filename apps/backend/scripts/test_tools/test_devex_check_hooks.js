/**
 * Teste da Tool: checkGitHooks
 * DevEx Agent - Tool 2/4
 */

import { checkGitHooks } from '../cerebro/tools/devex_tools.js';

async function test() {
    console.log('🧪 Testando: checkGitHooks\n');

    try {
        const result = await checkGitHooks();

        console.log('✅ Resultado:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log(`\n📊 Total de Hooks: ${result.totalHooks}`);
            console.log(`📊 Hooks Executáveis: ${result.executableHooks}`);

            if (result.hooks && result.hooks.length > 0) {
                console.log(`\n🔍 Hooks encontrados:`);
                result.hooks.forEach((hook, idx) => {
                    console.log(`  ${idx + 1}. ${hook.name} ${hook.executable ? '✅' : '⚠️'} ${hook.hasContent ? '(tem conteúdo)' : '(vazio)'}`);
                });
            }

            if (result.recommendations && result.recommendations.length > 0) {
                console.log(`\n💡 Recomendações:`);
                result.recommendations.forEach((rec, idx) => {
                    console.log(`  ${idx + 1}. ${rec}`);
                });
            }
        } else {
            console.log('❌ Erro:', result.error);
            if (result.recommendation) {
                console.log('💡 Recomendação:', result.recommendation);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao executar teste:', error.message);
        process.exit(1);
    }
}

test();














