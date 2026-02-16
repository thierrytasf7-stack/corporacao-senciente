#!/usr/bin/env node
/**
 * Commits Inteligentes com Protocolo L.L.B.
 * 
 * Gera commits com metadados do Protocolo L.L.B. (Letta, LangMem, ByteRover)
 * 
 * Uso:
 *   node scripts/memory/intelligent_git_commit.js "mensagem do commit" [--files=file1.js,file2.js]
 */

import { logger } from '../utils/logger.js';
import { getByteRover } from './byterover.js';
import { getLangMem } from './langmem.js';
import { getLetta } from './letta.js';
import { getLLBProtocol } from './llb_protocol.js';

const log = logger.child({ module: 'intelligent_git_commit' });

/**
 * Gera mensagem de commit inteligente
 */
async function generateIntelligentCommitMessage(baseMessage, files = []) {
    const letta = getLetta();
    const langmem = getLangMem();
    const byterover = getByteRover();

    // 1. Obter contexto do Letta (estado atual)
    const state = await letta.getCurrentState();
    const nextStep = await letta.getNextEvolutionStep();

    // 2. Mapear impacto via ByteRover
    let impact = null;
    if (files.length > 0) {
        const impactResult = await byterover.mapVisualImpact({
            type: 'modify',
            files: files.map(f => ({ path: f }))
        });
        impact = impactResult.impact;
    }

    // 3. Buscar sabedoria relevante no LangMem
    const wisdom = await langmem.getWisdom(baseMessage, 'architecture');

    // 4. Construir mensagem inteligente
    let message = baseMessage;

    // Adicionar contexto do Letta se relevante
    if (state.current_phase && state.current_phase !== 'initialization') {
        message += `\n\n[Letta] Fase: ${state.current_phase}`;
    }

    // Adicionar impacto se houver
    if (impact) {
        const breaking = impact.breaking_changes ? ' ⚠️ BREAKING' : '';
        message += `\n[ByteRover] Arquivos: ${impact.files_affected.length}${breaking}`;
    }

    // Adicionar sabedoria relevante se houver
    if (wisdom.length > 0) {
        message += `\n[LangMem] Sabedoria relacionada: ${wisdom.length} item(s)`;
    }

    return message;
}

/**
 * Executa commit inteligente com Protocolo L.L.B.
 */
async function intelligentCommit(message, files = [], options = {}) {
    log.info('Executando commit inteligente', { message: message.substring(0, 50), filesCount: files.length });

    try {
        const protocol = getLLBProtocol();
        const byterover = getByteRover();

        // 1. Gerar mensagem inteligente
        const intelligentMessage = await generateIntelligentCommitMessage(message, files);

        // 2. Preparar metadados para Letta
        const lettaMetadata = {
            updateState: true,
            task: message,
            files: files
        };

        // 3. Preparar metadados para LangMem
        const langmemMetadata = {
            storeWisdom: options.storeWisdom || false,
            dependencies: null
        };

        // 4. Executar commit via Protocolo L.L.B.
        const result = await protocol.commitWithMemory(
            intelligentMessage,
            lettaMetadata,
            langmemMetadata
        );

        if (result.success) {
            log.info('Commit inteligente executado', {
                commit_hash: result.commit_hash,
                message: intelligentMessage.substring(0, 50)
            });

            return {
                success: true,
                commit_hash: result.commit_hash,
                message: intelligentMessage
            };
        } else {
            log.error('Erro ao executar commit', { error: result.error });
            return {
                success: false,
                error: result.error
            };
        }
    } catch (err) {
        log.error('Erro ao executar commit inteligente', { error: err.message, stack: err.stack });
        return {
            success: false,
            error: err.message
        };
    }
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        log.error('Uso: node intelligent_git_commit.js "mensagem do commit" [--files=file1.js,file2.js] [--store-wisdom]');
        process.exit(1);
    }

    const message = args[0];
    const filesArg = args.find(arg => arg.startsWith('--files='));
    const files = filesArg ? filesArg.split('=')[1].split(',') : [];
    const storeWisdom = args.includes('--store-wisdom');

    log.info('Commit Inteligente com Protocolo L.L.B.', { message, files, storeWisdom });

    const result = await intelligentCommit(message, files, { storeWisdom });

    if (result.success) {
        console.log('✅ Commit executado com sucesso');
        console.log(`Hash: ${result.commit_hash}`);
        console.log(`Mensagem: ${result.message}`);
    } else {
        console.error('❌ Erro ao executar commit:', result.error);
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

export { generateIntelligentCommitMessage, intelligentCommit };



