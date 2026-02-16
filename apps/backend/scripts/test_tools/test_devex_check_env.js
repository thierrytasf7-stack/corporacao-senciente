/**
 * Teste da Tool: checkDevelopmentEnvironment
 * DevEx Agent - Tool 1/4
 */

import { checkDevelopmentEnvironment } from '../cerebro/tools/devex_tools.js';

async function test() {
    console.log('🧪 Testando: checkDevelopmentEnvironment\n');

    try {
        const result = await checkDevelopmentEnvironment();

        console.log('✅ Resultado:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log(`\n📊 Score: ${result.score.toFixed(1)}/10`);
            console.log(`\n🔍 Checks:`);
            console.log(`  - Node.js: ${result.checks.nodeVersion || 'N/A'}`);
            console.log(`  - npm: ${result.checks.npmVersion || 'N/A'}`);
            console.log(`  - Git: ${result.checks.gitInstalled ? '✅' : '❌'}`);
            console.log(`  - package.json: ${result.checks.packageJson ? '✅' : '❌'}`);
            console.log(`  - .env: ${result.checks.envFile ? '✅' : '❌'}`);
            console.log(`  - Git Hooks: ${result.checks.gitHooks ? '✅' : '❌'}`);
            console.log(`  - CI/CD: ${result.checks.ciConfig ? '✅' : '❌'}`);

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














