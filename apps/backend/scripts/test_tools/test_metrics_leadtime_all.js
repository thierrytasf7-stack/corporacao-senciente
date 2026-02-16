/**
 * Teste da Tool: calculateLeadTime (all time)
 * Metrics/DORA Agent - Tool 1/5
 */

import { calculateLeadTime } from '../cerebro/tools/metrics_tools.js';

async function test() {
    console.log('🧪 Testando: calculateLeadTime (all time)\n');

    try {
        console.log('📊 Calculando Lead Time (todos os commits)...\n');
        const result = await calculateLeadTime('all');

        if (result.success) {
            console.log('✅ Resultado:');
            console.log(`  Período: ${result.timeRange}`);
            console.log(`  Total de commits: ${result.totalCommits || 0}`);

            if (result.averageLeadTimeHours !== null && result.averageLeadTimeHours !== undefined) {
                console.log(`  Lead Time médio: ${result.averageLeadTimeHours.toFixed(2)}h (${result.averageLeadTimeDays.toFixed(2)} dias)`);
            } else {
                console.log(`  ${result.message || 'Nenhum commit encontrado'}`);
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














