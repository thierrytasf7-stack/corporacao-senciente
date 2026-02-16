/**
 * Teste da Tool: validateSecurity
 * Validation Agent - Tool 3/4
 */

import { validateSecurity } from '../cerebro/tools/validation_tools.js';

async function test() {
    console.log('🧪 Testando: validateSecurity\n');

    try {
        console.log('🔒 Analisando segurança do projeto (OWASP Top 10)...\n');
        const result = await validateSecurity(); // Sem filePath = analisa projeto inteiro

        if (result.success) {
            console.log('✅ Análise de segurança concluída!\n');
            console.log(`📊 Security Score: ${result.securityScore.toFixed(1)}/10\n`);

            if (result.vulnerabilities && result.vulnerabilities.length > 0) {
                console.log(`⚠️ ${result.vulnerabilities.length} vulnerabilidade(s) encontrada(s):\n`);
                result.vulnerabilities.forEach((vuln, idx) => {
                    console.log(`  ${idx + 1}. [${vuln.severity.toUpperCase()}] ${vuln.type}`);
                    console.log(`     ${vuln.message}\n`);
                });
            } else {
                console.log('✅ Nenhuma vulnerabilidade crítica encontrada\n');
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














