#!/usr/bin/env node
/**
 * Inicialização do Protocolo L.L.B.
 * 
 * Popula LangMem e Letta com dados iniciais para ativar o sistema
 * 
 * Uso:
 *   node scripts/memory/initialize_llb.js
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { getLangMem } from './langmem.js';
import { getLetta } from './letta.js';
import { getLLBProtocol } from './llb_protocol.js';

const log = logger.child({ module: 'initialize_llb' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Sabedoria inicial para LangMem
 */
const INITIAL_WISDOM = [
    {
        content: 'Protocolo L.L.B. (LangMem, Letta, ByteRover) substitui Jira, Confluence e GitKraken. Sistema opera de forma independente usando memória vetorial no Supabase.',
        category: 'architecture'
    },
    {
        content: 'Arquitetura Chat/IDE: Brain e Agentes interagem com IDE via prompts estruturados, não execução direta de código. Executor Híbrido decide automaticamente entre execução direta e incorporação via prompt.',
        category: 'architecture'
    },
    {
        content: 'BaseAgent é a classe base para todos os agentes. Implementa execute(), generatePrompt(), callAgent(), getKnowledge() e registerDecision().',
        category: 'patterns'
    },
    {
        content: 'Confidence Scorer calcula score (0-1) baseado em: histórico de sucesso (40%), complexidade (30%), qualidade do contexto (20%), segurança (10%).',
        category: 'patterns'
    },
    {
        content: 'Letta gerencia estado de evolução. Fases: planning, coding, review, execution. Mantém próximos passos, bloqueios e histórico.',
        category: 'architecture'
    },
    {
        content: 'LangMem armazena sabedoria arquitetural de longo prazo. Categorias: architecture, business_rules, patterns. Suporta grafos de dependência.',
        category: 'architecture'
    },
    {
        content: 'ByteRover é interface com código. Mapeia impacto visual/lógico, mantém timeline evolutiva, sincroniza commits com memória.',
        category: 'architecture'
    }
];

/**
 * Tasks iniciais para Letta
 */
const INITIAL_TASKS = [
    {
        task: 'Implementar Protocolo L.L.B. (LangMem, Letta, ByteRover)',
        status: 'done',
        metadata: {
            phase: 'Fase Manual MVP',
            completed_at: new Date().toISOString()
        }
    },
    {
        task: 'Integrar Protocolo L.L.B. com Brain e Agent Prompt Generators',
        status: 'done',
        metadata: {
            phase: 'Fase Manual MVP',
            completed_at: new Date().toISOString()
        }
    },
    {
        task: 'Criar scripts de migração e descontinuação de Jira/Confluence/GitKraken',
        status: 'done',
        metadata: {
            phase: 'Fase Manual MVP',
            completed_at: new Date().toISOString()
        }
    },
    {
        task: 'Continuar desenvolvimento usando Protocolo L.L.B.',
        status: 'coding',
        metadata: {
            phase: 'Fase Manual MVP',
            priority: 'high'
        }
    },
    {
        task: 'Evoluir sistema para Fase Autônoma',
        status: 'planning',
        metadata: {
            phase: 'Fase Autônoma',
            priority: 'medium'
        }
    }
];

/**
 * Inicializa LangMem com sabedoria inicial
 */
async function initializeLangMem() {
    log.info('Inicializando LangMem com sabedoria inicial');

    const langmem = getLangMem();
    let successCount = 0;
    let failCount = 0;

    for (const wisdom of INITIAL_WISDOM) {
        try {
            const success = await langmem.storeWisdom(
                wisdom.content,
                wisdom.category
            );

            if (success) {
                successCount++;
                log.debug('Sabedoria armazenada', {
                    category: wisdom.category,
                    content: wisdom.content.substring(0, 50)
                });
            } else {
                failCount++;
                log.warn('Falha ao armazenar sabedoria', { category: wisdom.category });
            }
        } catch (err) {
            failCount++;
            log.error('Erro ao armazenar sabedoria', {
                error: err.message,
                category: wisdom.category
            });
        }
    }

    log.info('LangMem inicializado', {
        success: successCount,
        failed: failCount,
        total: INITIAL_WISDOM.length
    });

    return { success: successCount, failed: failCount };
}

/**
 * Inicializa Letta com tasks iniciais
 */
async function initializeLetta() {
    log.info('Inicializando Letta com tasks iniciais');

    const letta = getLetta();
    let successCount = 0;
    let failCount = 0;

    for (const task of INITIAL_TASKS) {
        try {
            const success = await letta.updateState(
                task.task,
                task.status,
                task.metadata
            );

            if (success) {
                successCount++;
                log.debug('Task armazenada', {
                    status: task.status,
                    task: task.task.substring(0, 50)
                });
            } else {
                failCount++;
                log.warn('Falha ao armazenar task', { task: task.task.substring(0, 50) });
            }
        } catch (err) {
            failCount++;
            log.error('Erro ao armazenar task', {
                error: err.message,
                task: task.task.substring(0, 50)
            });
        }
    }

    log.info('Letta inicializado', {
        success: successCount,
        failed: failCount,
        total: INITIAL_TASKS.length
    });

    return { success: successCount, failed: failCount };
}

/**
 * Valida inicialização
 */
async function validateInitialization() {
    log.info('Validando inicialização do Protocolo L.L.B.');

    const protocol = getLLBProtocol();
    const langmem = getLangMem();
    const letta = getLetta();

    try {
        // 1. Testar LangMem
        const wisdom = await langmem.getWisdom('Protocolo L.L.B.', 'architecture');
        log.info('LangMem validado', { wisdomFound: wisdom.length > 0 });

        // 2. Testar Letta
        const state = await letta.getCurrentState();
        log.info('Letta validado', {
            phase: state.current_phase,
            nextSteps: state.next_steps?.length || 0
        });

        // 3. Testar Protocolo L.L.B.
        const session = await protocol.startSession();
        log.info('Protocolo L.L.B. validado', {
            phase: session.state?.current_phase,
            hasNextStep: !!session.nextStep
        });

        return {
            langmem: wisdom.length > 0,
            letta: state.current_phase !== 'initialization',
            protocol: !!session.state
        };
    } catch (err) {
        log.error('Erro na validação', { error: err.message });
        return {
            langmem: false,
            letta: false,
            protocol: false
        };
    }
}

/**
 * Função principal
 */
async function main() {
    log.info('🚀 Iniciando inicialização do Protocolo L.L.B.\n');

    try {
        // 1. Inicializar LangMem
        const langmemResult = await initializeLangMem();
        log.info('');

        // 2. Inicializar Letta
        const lettaResult = await initializeLetta();
        log.info('');

        // 3. Validar inicialização
        const validation = await validateInitialization();
        log.info('');

        // Resumo
        log.info('📊 RESUMO DA INICIALIZAÇÃO');
        log.info('==========================');
        log.info(`LangMem: ${langmemResult.success}/${INITIAL_WISDOM.length} sabedoria armazenada`);
        log.info(`Letta: ${lettaResult.success}/${INITIAL_TASKS.length} tasks armazenadas`);
        log.info(`Validação:`);
        log.info(`  - LangMem: ${validation.langmem ? '✅' : '❌'}`);
        log.info(`  - Letta: ${validation.letta ? '✅' : '❌'}`);
        log.info(`  - Protocolo L.L.B.: ${validation.protocol ? '✅' : '❌'}`);

        if (validation.langmem && validation.letta && validation.protocol) {
            log.info('');
            log.info('🎉 Protocolo L.L.B. inicializado e ativo!');
            log.info('');
            log.info('O sistema está pronto para uso:');
            log.info('  - LangMem: Armazenando sabedoria arquitetural');
            log.info('  - Letta: Gerenciando estado de evolução');
            log.info('  - ByteRover: Interface com código');
            log.info('');
            log.info('Próximos passos:');
            log.info('  - Continuar desenvolvimento usando Protocolo L.L.B.');
            log.info('  - Sistema opera independente de Jira/Confluence/GitKraken');
            process.exit(0);
        } else {
            log.warn('⚠️ Algumas validações falharam. Verifique os logs acima.');
            process.exit(1);
        }
    } catch (err) {
        log.error('Erro fatal na inicialização', { error: err.message, stack: err.stack });
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        log.error('Erro fatal', { error: err.message, stack: err.stack });
        process.exit(1);
    });
}

export { initializeLangMem, initializeLetta, validateInitialization };


