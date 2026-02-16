#!/usr/bin/env node
/**
 * Teste: Agentes de Operações
 */

import { DevExAgent } from './agents/operations/devex_agent.js';
import { MetricsAgent } from './agents/operations/metrics_agent.js';
import { QualityAgent } from './agents/operations/quality_agent.js';
import { SecurityAgent } from './agents/operations/security_agent.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_operations_agents' });

async function testOperationsAgents() {
    log.info('🧪 Testando Agentes de Operações\n');

    const devex = new DevExAgent();
    const metrics = new MetricsAgent();
    const security = new SecurityAgent();
    const quality = new QualityAgent();

    try {
        log.info('1. Testando geração de prompts...\n');

        const devexPrompt = await devex.generatePrompt('Configurar CI/CD pipeline', {});
        console.log('✅ DevEx Agent - Prompt gerado');
        console.log(`   Tamanho: ${devexPrompt.length} caracteres\n`);

        const metricsPrompt = await metrics.generatePrompt('Criar dashboard de métricas', {});
        console.log('✅ Metrics Agent - Prompt gerado');
        console.log(`   Tamanho: ${metricsPrompt.length} caracteres\n`);

        const securityPrompt = await security.generatePrompt('Auditar segurança do sistema', {});
        console.log('✅ Security Agent - Prompt gerado');
        console.log(`   Tamanho: ${securityPrompt.length} caracteres\n`);

        const qualityPrompt = await quality.generatePrompt('Auditar qualidade de processos', {});
        console.log('✅ Quality Agent - Prompt gerado');
        console.log(`   Tamanho: ${qualityPrompt.length} caracteres\n`);

        log.info('📊 RESUMO');
        log.info('✅ DevEx Agent: Implementado');
        log.info('✅ Metrics Agent: Implementado');
        log.info('✅ Security Agent: Implementado');
        log.info('✅ Quality Agent: Implementado');

        return true;
    } catch (err) {
        log.error('❌ Erro', { error: err.message });
        return false;
    }
}

testOperationsAgents().then(success => process.exit(success ? 0 : 1));


