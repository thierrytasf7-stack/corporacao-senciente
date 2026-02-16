/**
 * Teste da Tool: generateOnboardingChecklist
 * DevEx Agent - Tool 4/4
 */

import { generateOnboardingChecklist } from '../cerebro/tools/devex_tools.js';

async function test() {
    console.log('🧪 Testando: generateOnboardingChecklist\n');

    try {
        const result = await generateOnboardingChecklist();

        if (result.success) {
            console.log('✅ Checklist gerado com sucesso!\n');
            console.log('📋 Ambiente:');
            console.log(`  Status: ${result.environment.status}`);
            console.log(`  Score: ${result.environment.score.toFixed(1)}/10\n`);

            console.log('📋 Git Hooks:');
            console.log(`  Status: ${result.gitHooks.status}`);
            console.log(`  Total: ${result.gitHooks.hooks?.length || 0}\n`);

            console.log('📋 CI/CD:');
            console.log(`  Status: ${result.cicd.status}`);
            console.log(`  Configs: ${result.cicd.configs?.length || 0}\n`);

            console.log('📝 Passos de Onboarding:');
            result.steps.forEach((step, idx) => {
                console.log(`  ${step}`);
            });

            if (result.recommendations && result.recommendations.length > 0) {
                console.log('\n💡 Recomendações:');
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














