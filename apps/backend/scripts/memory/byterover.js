#!/usr/bin/env node
/**
 * ByteRover - A Ação
 * 
 * Interface nervosa com código que substitui GitKraken.
 * Injeta contexto em tempo real, gerencia mudanças atómicas,
 * garante execução respeitando memória das outras camadas.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'byterover' });

/**
 * ByteRover - Interface com Código GLOBAL
 */
class ByteRover {
    constructor() {
        this.mcpAvailable = false; // ByteRover MCP disponível
        this.forceGlobalSync = true; // Sempre forçar sincronização global
        this.checkMCPAvailability();
    }

    /**
     * Verifica se ByteRover MCP está disponível
     */
    checkMCPAvailability() {
        // Verificar se ferramentas MCP estão disponíveis
        // Por enquanto, assumir que está disponível via MCP tools
        this.mcpAvailable = true;
        log.debug('ByteRover MCP availability checked', { available: this.mcpAvailable });
    }

    /**
     * Injeta contexto em tempo real
     * 
     * @param {array} files - Arquivos relacionados
     * @param {object} changes - Mudanças propostas
     * @param {object} metadata - Metadados adicionais
     * @returns {Promise<object>} Contexto injetado
     */
    async injectContext(files, changes, metadata = {}) {
        log.info('Injecting context', {
            filesCount: files.length,
            changesType: changes.type || 'unknown'
        });

        try {
            // Usar ByteRover MCP se disponível
            if (this.mcpAvailable) {
                // Por enquanto, usar implementação básica
                // Futuramente: chamar byterover-retrieve-knowledge via MCP
                return await this.injectContextBasic(files, changes, metadata);
            }

            // Fallback: implementação básica
            return await this.injectContextBasic(files, changes, metadata);
        } catch (err) {
            log.error('Error injecting context', { error: err.message });
            return {
                success: false,
                error: err.message,
                context: null
            };
        }
    }

    /**
     * Implementação básica de injeção de contexto
     */
    async injectContextBasic(files, changes, metadata) {
        const context = {
            files: files.map(f => ({
                path: f,
                exists: fs.existsSync(f),
                size: fs.existsSync(f) ? fs.statSync(f).size : 0
            })),
            changes: changes,
            metadata: metadata,
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            context: context
        };
    }

    /**
     * Mapeia impacto visual e lógico das mudanças
     * 
     * @param {object} changes - Mudanças a mapear
     * @returns {Promise<object>} Impacto mapeado
     */
    async mapVisualImpact(changes) {
        log.info('Mapping visual impact', { changesType: changes.type });

        try {
            const impact = {
                files_affected: [],
                visual_changes: [],
                logical_changes: [],
                dependencies: [],
                breaking_changes: false
            };

            // Analisar mudanças
            if (changes.files) {
                for (const file of changes.files) {
                    impact.files_affected.push(file.path || file);

                    // Verificar se é mudança visual (frontend)
                    if (file.path && (file.path.includes('frontend') || file.path.endsWith('.jsx') || file.path.endsWith('.css'))) {
                        impact.visual_changes.push({
                            file: file.path,
                            type: 'visual',
                            description: 'Mudança visual no frontend'
                        });
                    }

                    // Verificar se é mudança lógica (backend/logic)
                    if (file.path && (file.path.includes('backend') || file.path.includes('scripts') || file.path.endsWith('.js'))) {
                        impact.logical_changes.push({
                            file: file.path,
                            type: 'logical',
                            description: 'Mudança lógica no código'
                        });
                    }
                }
            }

            // Detectar breaking changes básico
            if (changes.type === 'delete' || changes.type === 'refactor') {
                impact.breaking_changes = true;
            }

            return {
                success: true,
                impact: impact
            };
        } catch (err) {
            log.error('Error mapping visual impact', { error: err.message });
            return {
                success: false,
                error: err.message,
                impact: null
            };
        }
    }

    /**
     * Retorna "Linha do Tempo Evolutiva" (histórico de commits como evolução)
     * 
     * @param {number} limit - Limite de commits
     * @returns {Promise<array>} Timeline evolutiva
     */
    async getEvolutionTimeline(limit = 20) {
        log.info('Getting evolution timeline', { limit });

        try {
            // Buscar commits recentes via git
            const gitLog = execSync(
                `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso -n ${limit}`,
                { encoding: 'utf8', cwd: process.cwd() }
            );

            const timeline = gitLog
                .trim()
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => {
                    const [hash, author, email, date, ...messageParts] = line.split('|');
                    return {
                        hash: hash,
                        author: author,
                        email: email,
                        date: date,
                        message: messageParts.join('|'),
                        type: this.classifyCommitType(messageParts.join('|'))
                    };
                });

            return {
                success: true,
                timeline: timeline
            };
        } catch (err) {
            log.error('Error getting evolution timeline', { error: err.message });
            return {
                success: false,
                error: err.message,
                timeline: []
            };
        }
    }

    /**
     * Classifica tipo de commit
     */
    classifyCommitType(message) {
        const msgLower = message.toLowerCase();

        if (msgLower.includes('feat') || msgLower.includes('add')) {
            return 'feature';
        } else if (msgLower.includes('fix') || msgLower.includes('bug')) {
            return 'fix';
        } else if (msgLower.includes('refactor')) {
            return 'refactor';
        } else if (msgLower.includes('docs')) {
            return 'documentation';
        } else if (msgLower.includes('test')) {
            return 'test';
        }

        return 'other';
    }

    /**
     * Sincroniza commit com Letta e LangMem
     * 
     * @param {string} commit - Hash do commit
     * @param {object} letta_metadata - Metadados do Letta
     * @param {object} langmem_metadata - Metadados do LangMem
     * @returns {Promise<boolean>} Sucesso
     */
    async syncWithMemory(commit, letta_metadata = {}, langmem_metadata = {}) {
        log.info('Syncing commit with memory', { commit: commit.substring(0, 8) });

        try {
            // Obter informações do commit
            const commitInfo = execSync(
                `git show --pretty=format:"%H|%s|%b" --no-patch ${commit}`,
                { encoding: 'utf8', cwd: process.cwd() }
            );

            const [hash, subject, ...bodyParts] = commitInfo.trim().split('|');
            const body = bodyParts.join('|');

            // Atualizar Letta com estado do commit
            if (letta_metadata.updateState) {
                const { getLetta } = await import('./letta.js');
                const letta = getLetta();
                await letta.updateState(
                    `Commit: ${subject}`,
                    'done',
                    {
                        commit_hash: hash,
                        commit_message: body,
                        ...letta_metadata
                    }
                );
            }

            // Armazenar sabedoria no LangMem se houver padrão arquitetural
            if (langmem_metadata.storeWisdom) {
                const { getLangMem } = await import('./langmem.js');
                const langmem = getLangMem();
                await langmem.storeArchitecture(
                    subject,
                    body,
                    langmem_metadata.dependencies || null
                );
            }

            log.info('Commit synced with memory', { commit: hash.substring(0, 8) });
            return true;
        } catch (err) {
            log.error('Error syncing commit with memory', { error: err.message });
            return false;
        }
    }

    /**
     * SINCRONIZAÇÃO GLOBAL FORÇADA - Executa sync em todos os PCs
     *
     * @returns {Promise<boolean>} Sucesso
     */
    async forceGlobalMemorySync() {
        log.info('🚀 Iniciando sincronização global forçada');

        try {
            // 1. Executar script de sincronização global
            const { execSync } = await import('child_process');
            execSync('node scripts/global_memory_sync.js', {
                stdio: 'inherit',
                cwd: process.cwd()
            });

            log.info('✅ Sincronização global executada com sucesso');
            return true;

        } catch (error) {
            log.error('❌ Erro na sincronização global forçada', { error: error.message });
            return false;
        }
    }

    /**
     * Usa ByteRover MCP para armazenar conhecimento GLOBAL
     *
     * @param {string} knowledge - Conhecimento a armazenar
     * @param {object} metadata - Metadados
     * @returns {Promise<boolean>} Sucesso
     */
    async storeKnowledge(knowledge, metadata = {}) {
        log.info('Storing knowledge via ByteRover MCP (GLOBAL)', {
            knowledgeLength: knowledge.length
        });

        try {
            // Tentar usar MCP tool se disponível
            if (this.isMCPToolAvailable('byterover-store-knowledge')) {
                const result = await this.callMCPTool('byterover-store-knowledge', {
                    knowledge,
                    category: metadata.category || 'architecture',
                    metadata
                });

                // Forçar sincronização global após armazenar
                if (this.forceGlobalSync) {
                    await this.forceGlobalMemorySync();
                }

                return result;
            }

            // Fallback: usar LangMem diretamente
            const { getLangMem } = await import('./langmem.js');
            const langmem = getLangMem();
            const success = await langmem.storeWisdom(
                knowledge,
                metadata.category || 'architecture',
                metadata
            );

            // Forçar sincronização global após armazenar
            if (this.forceGlobalSync && success) {
                await this.forceGlobalMemorySync();
            }

            log.info('Knowledge stored via fallback (GLOBAL)', { success });
            return success;
        } catch (error) {
            log.error('Error storing knowledge globally', { error: error.message });
            return false;
        }
    }

    /**
     * Usa ByteRover MCP para recuperar conhecimento
     *
     * @param {string} query - Query de busca
     * @returns {Promise<array>} Conhecimento encontrado
     */
    async retrieveKnowledge(query) {
        log.info('Retrieving knowledge via ByteRover MCP', { query: query.substring(0, 50) });

        try {
            // Tentar usar MCP tool se disponível
            if (this.isMCPToolAvailable('byterover-retrieve-knowledge')) {
                const result = await this.callMCPTool('byterover-retrieve-knowledge', {
                    query,
                    limit: 5
                });

                // Parsear resultado MCP
                if (result && result.content && result.content[0]) {
                    // Extrair conhecimento do texto de resposta
                    const text = result.content[0].text;
                    // Implementar parsing da resposta MCP
                    return this.parseKnowledgeFromMCPResponse(text);
                }
            }

            // Fallback: usar LangMem diretamente
            const { getLangMem } = await import('./langmem.js');
            const langmem = getLangMem();
            const wisdom = await langmem.getWisdom(query);

            log.info('Knowledge retrieved via fallback', { count: wisdom.length });
            return wisdom;
        } catch (error) {
            log.error('Error retrieving knowledge', { error: error.message });
            return [];
        }
    }

    /**
     * Verifica se ferramenta MCP está disponível
     */
    isMCPToolAvailable(toolName) {
        // Por enquanto, assumir que está disponível se MCP estiver ativo
        return this.mcpAvailable;
    }

    /**
     * Chama ferramenta MCP
     */
    async callMCPTool(toolName, args) {
        // Implementação básica - em produção, usar MCP client
        log.debug('Calling MCP tool', { tool: toolName, args });

        // Simulação: chamar diretamente o servidor MCP
        // Em produção, isso seria feito via MCP client
        try {
            const { spawn } = await import('child_process');

            return new Promise((resolve, reject) => {
                const serverProcess = spawn('node', [
                    'scripts/mcp/byterover_mcp_server.js'
                ], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let response = '';
                let errorResponse = '';

                serverProcess.stdout.on('data', (data) => {
                    response += data.toString();
                });

                serverProcess.stderr.on('data', (data) => {
                    errorResponse += data.toString();
                });

                serverProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(response);
                            resolve(result);
                        } catch (e) {
                            resolve({ content: [{ type: 'text', text: response }] });
                        }
                    } else {
                        reject(new Error(`MCP server exited with code ${code}: ${errorResponse}`));
                    }
                });

                // Enviar request MCP
                const request = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/call',
                    params: {
                        name: toolName,
                        arguments: args
                    }
                };

                serverProcess.stdin.write(JSON.stringify(request) + '\n');
                serverProcess.stdin.end();
            });
        } catch (error) {
            log.warn('MCP tool call failed, using fallback', { error: error.message });
            throw error;
        }
    }

    /**
     * Parse conhecimento da resposta MCP
     */
    parseKnowledgeFromMCPResponse(text) {
        // Implementação básica de parsing
        // Em produção, implementar parsing mais robusto
        const items = text.split('\n\n').filter(line => line.includes('📚'));

        return items.map(item => ({
            content: item,
            category: 'mcp_result',
            similarity: 0.8
        }));
    }
}

// Singleton
let byteroverInstance = null;

export function getByteRover() {
    if (!byteroverInstance) {
        byteroverInstance = new ByteRover();
    }
    return byteroverInstance;
}

export default ByteRover;



