
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { getLangMem } from './langmem.js';

// Configure logger
logger.level = 'info';

async function ingestCompletion() {
    const langmem = getLangMem();

    console.log('🚀 INICIANDO INGESTÃO DE FINALIZAÇÃO DE PROJETO...');

    // 1. Ingest AUDITORIA_FINAL.md
    try {
        const auditPath = path.resolve('docs/audit/AUDITORIA_FINAL.md');
        if (fs.existsSync(auditPath)) {
            console.log(`\n📄 Lendo Auditoria Final: ${auditPath}`);
            const auditContent = fs.readFileSync(auditPath, 'utf8');

            console.log('💾 Gravando na Memória Corporativa (Categoria: AUDIT)...');
            const success = await langmem.storeWisdom(auditContent, 'audit', {
                type: 'final_audit',
                status: 'GOLD_MASTER',
                date: new Date().toISOString()
            });

            if (success) console.log('✅ Auditoria Final gravada com sucesso!');
            else console.error('❌ Falha ao gravar Auditoria Final.');
        } else {
            console.error(`❌ Arquivo não encontrado: ${auditPath}`);
        }
    } catch (err) {
        console.error('❌ Erro ao processar Auditoria:', err.message);
    }

    // 2. Ingest Restoration Plan
    try {
        const planPath = path.resolve('.cursor/plans/reestruturação_completa_corporação_senciente_b4623469.plan copy.md');
        if (fs.existsSync(planPath)) {
            console.log(`\n📄 Lendo Plano de Reestruturação Finalizado: ${planPath}`);
            const planContent = fs.readFileSync(planPath, 'utf8');

            console.log('💾 Gravando na Memória Corporativa (Categoria: PLANNING)...');
            const success = await langmem.storeWisdom(planContent, 'planning', {
                type: 'master_plan_completed',
                status: 'COMPLETED',
                date: new Date().toISOString()
            });

            if (success) console.log('✅ Plano de Reestruturação gravado com sucesso!');
            else console.error('❌ Falha ao gravar Plano de Reestruturação.');
        } else {
            console.error(`❌ Arquivo não encontrado: ${planPath}`);
        }
    } catch (err) {
        console.error('❌ Erro ao processar Plano:', err.message);
    }

    console.log('\n✨ Ingestão concluída.');
}

ingestCompletion();
