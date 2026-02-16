#!/usr/bin/env node

/**
 * Migração Unificada: Jira + Confluence → Protocolo L.L.B.
 * Corporação Senciente - Fase 2
 *
 * Orquestra a migração completa dos dados do Atlassian para o Protocolo L.L.B.
 * antes da descontinuação do Jira e Confluence.
 *
 * Sequência de migração:
 * 1. Jira Issues → Letta (estado e evolução)
 * 2. Confluence Pages → LangMem (conhecimento arquitetural)
 * 3. Validação da migração
 * 4. Atualização de referências
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { getLLBProtocol } from './llb_protocol.js';

const log = logger.child({ module: 'migrate_atlassian_to_llb' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Status da migração
 */
class MigrationStatus {
    constructor() {
        this.startTime = new Date();
        this.phases = {
            jira: { completed: false, items: 0, errors: 0 },
            confluence: { completed: false, items: 0, errors: 0 },
            validation: { completed: false, passed: 0, failed: 0 },
            references: { completed: false, updated: 0, skipped: 0 }
        };
        this.log = [];
    }

    logPhase(phase, message) {
        const entry = {
            timestamp: new Date().toISOString(),
            phase,
            message
        };
        this.log.push(entry);
        log.info(`[${phase.toUpperCase()}] ${message}`);
    }

    updatePhase(phase, updates) {
        Object.assign(this.phases[phase], updates);
    }

    getSummary() {
        const duration = Date.now() - this.startTime.getTime();
        const totalItems = Object.values(this.phases).reduce((sum, phase) => sum + (phase.items || 0), 0);
        const totalErrors = Object.values(this.phases).reduce((sum, phase) => sum + (phase.errors || 0), 0);

        return {
            duration: Math.round(duration / 1000),
            totalItems,
            totalErrors,
            phases: this.phases,
            log: this.log.slice(-10) // Últimas 10 entradas
        };
    }
}

/**
 * Executor de scripts de migração
 */
class MigrationExecutor {
    constructor() {
        this.status = new MigrationStatus();
        this.llbProtocol = getLLBProtocol();
    }

    /**
     * Executa comando do sistema
     */
    async executeCommand(command, description) {
        return new Promise((resolve, reject) => {
            const { spawn } = require('child_process');

            log.info(`Executando: ${description}`);
            log.debug(`Comando: ${command}`);

            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Comando falhou (${code}): ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Migração do Jira para Letta
     */
    async migrateJira(dryRun = false) {
        this.status.logPhase('jira', 'Iniciando migração Jira → Letta');

        try {
            const command = `node scripts/memory/migrate_jira_to_letta.js ${dryRun ? '--dry-run' : ''}`;
            const result = await this.executeCommand(command, 'Migração Jira para Letta');

            // Parsear resultado (simulado)
            const migratedItems = (result.stdout.match(/migrated/g) || []).length || 0;
            const errors = (result.stderr.match(/error|Error/g) || []).length || 0;

            this.status.updatePhase('jira', {
                completed: !dryRun,
                items: migratedItems,
                errors
            });

            this.status.logPhase('jira', `Migração concluída: ${migratedItems} items, ${errors} erros`);

        } catch (error) {
            this.status.logPhase('jira', `Erro na migração: ${error.message}`);
            this.status.updatePhase('jira', { errors: 1 });
            throw error;
        }
    }

    /**
     * Migração do Confluence para LangMem
     */
    async migrateConfluence(dryRun = false) {
        this.status.logPhase('confluence', 'Iniciando migração Confluence → LangMem');

        try {
            const command = `node scripts/memory/migrate_confluence_to_langmem.js ${dryRun ? '--dry-run' : ''}`;
            const result = await this.executeCommand(command, 'Migração Confluence para LangMem');

            // Parsear resultado (simulado)
            const migratedItems = (result.stdout.match(/migrated|stored/g) || []).length || 0;
            const errors = (result.stderr.match(/error|Error/g) || []).length || 0;

            this.status.updatePhase('confluence', {
                completed: !dryRun,
                items: migratedItems,
                errors
            });

            this.status.logPhase('confluence', `Migração concluída: ${migratedItems} items, ${errors} erros`);

        } catch (error) {
            this.status.logPhase('confluence', `Erro na migração: ${error.message}`);
            this.status.updatePhase('confluence', { errors: 1 });
            throw error;
        }
    }

    /**
     * Validação da migração
     */
    async validateMigration() {
        this.status.logPhase('validation', 'Iniciando validação da migração');

        let passed = 0;
        let failed = 0;

        try {
            // Verificar se dados foram migrados para L.L.B.
            const context = await this.llbProtocol.getFullContext('test migration');
            if (context && context.wisdom && context.wisdom.length > 0) {
                passed++;
                this.status.logPhase('validation', '✅ LangMem contém dados migrados');
            } else {
                failed++;
                this.status.logPhase('validation', '❌ LangMem não contém dados migrados');
            }

            // Verificar se estado foi inicializado
            const session = await this.llbProtocol.startSession();
            if (session && session.state) {
                passed++;
                this.status.logPhase('validation', '✅ Letta contém estado migrado');
            } else {
                failed++;
                this.status.logPhase('validation', '❌ Letta não contém estado migrado');
            }

            // Verificar timeline
            if (context && context.timeline && context.timeline.length > 0) {
                passed++;
                this.status.logPhase('validation', '✅ ByteRover contém timeline migrado');
            } else {
                failed++;
                this.status.logPhase('validation', '❌ ByteRover não contém timeline migrado');
            }

        } catch (error) {
            failed++;
            this.status.logPhase('validation', `❌ Erro na validação: ${error.message}`);
        }

        this.status.updatePhase('validation', { completed: true, passed, failed });
        this.status.logPhase('validation', `Validação concluída: ${passed} passed, ${failed} failed`);
    }

    /**
     * Atualização de referências
     */
    async updateReferences() {
        this.status.logPhase('references', 'Iniciando atualização de referências');

        let updated = 0;
        let skipped = 0;

        try {
            // Adicionar avisos de descontinuação
            await this.executeCommand('node scripts/memory/add_jira_discontinuation_notice.js',
                'Adicionando aviso de descontinuação do Jira');

            await this.executeCommand('node scripts/memory/add_confluence_discontinuation_notice.js',
                'Adicionando aviso de descontinuação do Confluence');

            updated += 2;
            this.status.logPhase('references', '✅ Avisos de descontinuação adicionados');

            // Outras atualizações poderiam ser feitas aqui
            // Por exemplo, atualizar links em documentação

        } catch (error) {
            this.status.logPhase('references', `Erro na atualização: ${error.message}`);
            skipped++;
        }

        this.status.updatePhase('references', { completed: true, updated, skipped });
    }

    /**
     * Migração completa
     */
    async migrateAll(options = {}) {
        const { dryRun = false, skipValidation = false, skipReferences = false } = options;

        console.log('🚀 INICIANDO MIGRAÇÃO UNIFICADA ATLASSIAN → L.L.B.');
        console.log('='.repeat(70));
        console.log('Corporação Senciente - Fase 2');
        console.log('='.repeat(70));

        try {
            // Fase 1: Jira → Letta
            await this.migrateJira(dryRun);

            // Fase 2: Confluence → LangMem
            await this.migrateConfluence(dryRun);

            // Fase 3: Validação (se não for dry-run)
            if (!dryRun && !skipValidation) {
                await this.validateMigration();
            }

            // Fase 4: Atualização de referências
            if (!dryRun && !skipReferences) {
                await this.updateReferences();
            }

            // Relatório final
            const summary = this.status.getSummary();

            console.log('\n' + '='.repeat(70));
            console.log('📊 RELATÓRIO FINAL - MIGRAÇÃO ATLASSIAN → L.L.B.');
            console.log('='.repeat(70));

            console.log(`⏱️  Duração total: ${summary.duration}s`);
            console.log(`📦 Items migrados: ${summary.totalItems}`);
            console.log(`❌ Erros encontrados: ${summary.totalErrors}`);

            console.log('\n📋 STATUS POR FASE:');
            Object.entries(summary.phases).forEach(([phase, data]) => {
                const status = data.completed ? '✅' : '⏳';
                const details = phase === 'validation'
                    ? `${data.passed || 0} passed, ${data.failed || 0} failed`
                    : phase === 'references'
                        ? `${data.updated || 0} updated, ${data.skipped || 0} skipped`
                        : `${data.items || 0} items, ${data.errors || 0} errors`;

                console.log(`  ${status} ${phase.charAt(0).toUpperCase() + phase.slice(1)}: ${details}`);
            });

            if (summary.totalErrors === 0 && (!dryRun || summary.totalItems > 0)) {
                console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
                console.log('🏆 Jira e Confluence podem ser descontinuados');
                console.log('\n✅ Protocolo L.L.B. agora contém:');
                console.log('   🧠 LangMem: Conhecimento arquitetural');
                console.log('   🧠 Letta: Estado e evolução do sistema');
                console.log('   🚀 ByteRover: Timeline histórica');
            } else {
                console.log('\n⚠️  Migração concluída com ressalvas');
                if (dryRun) {
                    console.log('💡 Execute sem --dry-run para realizar a migração real');
                }
            }

            console.log('='.repeat(70));

            return {
                success: summary.totalErrors === 0,
                summary
            };

        } catch (error) {
            console.log(`\n💥 ERRO FATAL NA MIGRAÇÃO: ${error.message}`);
            console.log('='.repeat(70));

            return {
                success: false,
                error: error.message,
                summary: this.status.getSummary()
            };
        }
    }
}

// CLI Interface
async function main() {
    const executor = new MigrationExecutor();

    const dryRun = process.argv.includes('--dry-run');
    const skipValidation = process.argv.includes('--skip-validation');
    const skipReferences = process.argv.includes('--skip-references');

    if (dryRun) {
        console.log('🔍 MODO DRY-RUN: Simulando migração sem alterar dados\n');
    }

    const result = await executor.migrateAll({
        dryRun,
        skipValidation,
        skipReferences
    });

    process.exit(result.success ? 0 : 1);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export default MigrationExecutor;






