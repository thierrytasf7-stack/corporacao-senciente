#!/usr/bin/env node
/**
 * Executor - Executor Híbrido Inteligente
 * 
 * Executa ações com decisão automática entre execução direta (autônoma) 
 * e incorporação via prompts (assistida) baseada em complexidade e confiança.
 */

import fs from 'fs';
import path from 'path';
import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getTraceAlerts } from '../observability/trace_alerts.js';
import { logger } from '../utils/logger.js';
import { getAgentPromptGenerator } from './agent_prompt_generator.js';
import ChatInterface from './chat_interface.js';
import ConfidenceScorer from './confidence_scorer.js';

const log = logger.child({ module: 'executor' });

/**
 * Executor Híbrido Inteligente
 */
class Executor {
    constructor() {
        this.dryRun = false; // Modo dry-run (não executa, apenas mostra)
        this.confidenceScorer = new ConfidenceScorer();
        this.chatInterface = new ChatInterface();
        this.agentPromptGenerator = getAgentPromptGenerator();
        this.llbProtocol = getLLBProtocol();

        // Inicializar observabilidade
        this.distributedTracer = getDistributedTracer();
        this.traceAlerts = getTraceAlerts();
    }

    /**
     * Executa uma ação com decisão automática (modo híbrido inteligente)
     * 
     * @param {object} action - Ação a executar
     * @param {object} context - Contexto adicional (pode incluir agentName, brainContext)
     * @returns {Promise<object>} Resultado da execução
     */
    async executeAction(action, context = {}) {
        // Iniciar trace para operação crítica
        const traceResult = await this.distributedTracer.traceCriticalOperation(
            'execute_action',
            async () => {
                return await this._executeActionWithTracing(action, context);
            },
            {
                type: 'action_execution',
                agent: context.agentName || 'unknown',
                actionType: action.type,
                userId: context.userId || 'system'
            }
        );

        return traceResult;
    }

    async _executeActionWithTracing(action, context = {}) {
        log.info('Executing action (hybrid mode)', {
            type: action.type,
            dryRun: this.dryRun,
            agent: context.agentName || 'unknown'
        });

        if (this.dryRun) {
            log.info('[DRY-RUN] Would execute:', action);
            return { success: true, dryRun: true, action };
        }

        try {
            // 1. Decidir modo de execução (direto vs prompt vs confirmação)
            const shouldUsePrompt = await this.shouldUsePrompt(action, context);
            const confidence = await this.confidenceScorer.calculateConfidence(action, context);
            const executionMode = this.confidenceScorer.determineExecutionMode(confidence);

            log.debug('Execution decision', {
                actionType: action.type,
                confidence: confidence.toFixed(2),
                mode: executionMode,
                shouldUsePrompt
            });

            // 2. Executar conforme decisão
            if (executionMode === 'confirmation') {
                // Baixa confiança: solicitar confirmação
                return {
                    success: false,
                    requiresConfirmation: true,
                    action: action,
                    confidence: confidence,
                    message: 'Ação requer confirmação do usuário devido à baixa confiança',
                    prompt: await this.generateActionPrompt(action, context)
                };
            } else if (shouldUsePrompt || executionMode === 'prompt') {
                // Média confiança ou ação complexa: incorporar via prompt
                return await this.executeViaPrompt(action, context);
            } else {
                // Alta confiança: execução direta
                return await this.executeDirect(action);
            }
        } catch (err) {
            log.error('Error executing action', { error: err.message, action });
            return { success: false, error: err.message, action };
        }
    }

    /**
     * Decide se deve usar prompt ou execução direta
     * 
     * @param {object} action - Ação a executar
     * @param {object} context - Contexto adicional
     * @returns {Promise<boolean>} true se deve usar prompt
     */
    async shouldUsePrompt(action, context = {}) {
        const actionType = action.type;

        // Ações que sempre devem ser via prompt (código complexo)
        const alwaysPromptActions = [
            'create_file',      // Criar código novo
            'modify_code',      // Modificar código existente
            'refactor_code',    // Refatoração
            'create_module'     // Criar novo módulo
        ];

        if (alwaysPromptActions.includes(actionType)) {
            return true;
        }

        // Ações que sempre devem ser diretas (Protocolo L.L.B.)
        const alwaysDirectActions = [
            'update_letta_state',
            'store_langmem_wisdom',
            'intelligent_git_commit',
            'read_file',
            'list_dir',
            'codebase_search'
        ];

        if (alwaysDirectActions.includes(actionType)) {
            return false;
        }

        // Para outras ações, usar score de confiança
        const confidence = await this.confidenceScorer.calculateConfidence(action, context);
        return confidence < 0.8; // Se confiança < 80%, usar prompt
    }

    /**
     * Gera prompt para ação de código
     * 
     * @param {object} action - Ação a executar
     * @param {object} context - Contexto adicional
     * @returns {Promise<string>} Prompt estruturado
     */
    async generateActionPrompt(action, context = {}) {
        const agentName = context.agentName || 'dev';
        const task = this.actionToTask(action);

        // Gerar prompt do agente com a ação
        const prompt = await this.agentPromptGenerator.generateAgentPrompt(
            agentName,
            task,
            {
                ...context,
                action: action
            }
        );

        return prompt;
    }

    /**
     * Converte ação em task descritiva
     */
    actionToTask(action) {
        switch (action.type) {
            case 'create_file':
                return `Criar arquivo ${action.path} com o conteúdo especificado`;
            case 'modify_code':
                return `Modificar código em ${action.path} com ${action.modifications?.length || 0} modificações`;
            case 'refactor_code':
                return `Refatorar código em ${action.path}`;
            default:
                return `Executar ação ${action.type}`;
        }
    }

    /**
     * Executa ação via prompt (incorporação no chat)
     */
    async executeViaPrompt(action, context = {}) {
        log.info('Executing via prompt', { actionType: action.type });

        try {
            // Gerar prompt da ação
            const prompt = await this.generateActionPrompt(action, context);

            // Incorporar no chat
            const result = await this.chatInterface.incorporate(prompt, {
                action: action,
                context: context
            });

            return {
                success: result.success,
                mode: 'prompt',
                action: action,
                prompt: prompt,
                result: result,
                extractedInfo: result.extractedInfo
            };
        } catch (err) {
            log.error('Error executing via prompt', { error: err.message });
            // Fallback: tentar execução direta
            log.warn('Falling back to direct execution');
            return await this.executeDirect(action);
        }
    }

    /**
     * Executa ação diretamente (modo autônomo)
     */
    async executeDirect(action) {
        log.info('Executing directly', { actionType: action.type });

        try {
            switch (action.type) {
                case 'create_file':
                    return await this.createFile(action);

                case 'modify_code':
                    return await this.modifyCode(action);

                case 'update_letta_state':
                    return await this.updateLettaState(action);

                case 'store_langmem_wisdom':
                    return await this.storeLangmemWisdom(action);

                case 'intelligent_git_commit':
                    return await this.intelligentGitCommit(action);

                case 'create_jira_task':
                    return await this.createJiraTask(action);

                case 'create_confluence_page':
                    return await this.createConfluencePage(action);

                case 'git_commit':
                    return await this.gitCommit(action);

                case 'git_branch':
                    return await this.gitBranch(action);

                case 'git_pr':
                    return await this.gitPR(action);

                case 'run_test':
                    return await this.runTest(action);

                case 'call_api':
                    return await this.callAPI(action);

                case 'read_file':
                    return await this.readFile(action);

                case 'list_dir':
                    return await this.listDir(action);

                case 'codebase_search':
                    return await this.codebaseSearch(action);

                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
        } catch (err) {
            log.error('Error executing action directly', { error: err.message, action });
            return { success: false, error: err.message, action };
        }
    }

    /**
     * Cria um arquivo
     */
    async createFile(action) {
        const { path: filePath, content } = action;

        // Validar que arquivo não existe
        if (fs.existsSync(filePath)) {
            throw new Error(`File already exists: ${filePath}`);
        }

        // Criar diretório se não existir
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Criar arquivo
        fs.writeFileSync(filePath, content, 'utf8');

        log.info('File created', { path: filePath });
        return { success: true, path: filePath };
    }

    /**
     * Modifica código (básico - apenas substituição de texto por enquanto)
     */
    async modifyCode(action) {
        const { path: filePath, modifications } = action;

        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        // Criar backup
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);

        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Aplicar modificações (formato: { find: '...', replace: '...' })
            for (const mod of modifications) {
                if (mod.find && mod.replace !== undefined) {
                    content = content.replace(mod.find, mod.replace);
                }
            }

            // Validar sintaxe básica (verificar se é JavaScript válido)
            if (filePath.endsWith('.js')) {
                // Tentar parsear (básico)
                try {
                    // eslint-disable-next-line no-eval
                    new Function(content);
                } catch (err) {
                    // Restaurar backup
                    fs.copyFileSync(backupPath, filePath);
                    throw new Error(`Invalid JavaScript after modification: ${err.message}`);
                }
            }

            // Salvar modificação
            fs.writeFileSync(filePath, content, 'utf8');

            // Remover backup se sucesso
            fs.unlinkSync(backupPath);

            log.info('Code modified', { path: filePath });
            return { success: true, path: filePath, backup: backupPath };
        } catch (err) {
            // Restaurar backup em caso de erro
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, filePath);
                fs.unlinkSync(backupPath);
            }
            throw err;
        }
    }

    /**
     * Cria task no Protocolo L.L.B. (Letta)
     * Substitui Jira tasks
     */
    async createLLBTask(action) {
        const { summary, description, priority = 'medium', category = 'task' } = action;

        try {
            // Usar Protocolo L.L.B. - Letta para gerenciar estado de tasks
            const { LettaManager } = await import('../memory/letta.js');
            const letta = new LettaManager();

            const taskData = {
                type: 'task',
                title: summary,
                description: description,
                priority: priority,
                category: category,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const result = await letta.registerTask(taskData);

            log.info('L.L.B. task created (Letta)', { id: result.id });
            return { success: true, taskId: result.id, result };
        } catch (err) {
            log.error('Error creating L.L.B. task', { error: err.message });
            throw err;
        }
    }

    /**
     * Armazena conhecimento no Protocolo L.L.B. (LangMem)
     * Substitui Confluence pages
     */
    async storeLLBKnowledge(action) {
        const { title, content, category = 'documentation', tags = [] } = action;

        try {
            // Usar Protocolo L.L.B. - LangMem para armazenar conhecimento
            const { LangMemManager } = await import('../memory/langmem.js');
            const langmem = new LangMemManager();

            const knowledgeData = {
                title: title,
                content: content,
                category: category,
                tags: tags,
                created_at: new Date().toISOString(),
                source: 'agent_execution'
            };

            const result = await langmem.storeWisdom(knowledgeData, category, []);

            log.info('L.L.B. knowledge stored (LangMem)', { id: result.id });
            return { success: true, knowledgeId: result.id, result };
        } catch (err) {
            log.error('Error storing L.L.B. knowledge', { error: err.message });
            throw err;
        }
    }

    /**
     * Faz commit no Git (via GitKraken MCP)
     */
    async gitCommit(action) {
        const { message, files = [] } = action;

        // TODO: Implementar via GitKraken MCP quando disponível
        // Por enquanto, usar git diretamente
        const { execSync } = await import('child_process');

        try {
            if (files.length > 0) {
                execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });
            } else {
                execSync('git add -A', { stdio: 'inherit' });
            }

            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

            log.info('Git commit created', { message });
            return { success: true, message };
        } catch (err) {
            log.error('Error creating git commit', { error: err.message });
            throw err;
        }
    }

    /**
     * Cria branch no Git
     */
    async gitBranch(action) {
        const { name, checkout = true } = action;

        const { execSync } = await import('child_process');

        try {
            execSync(`git branch ${name}`, { stdio: 'inherit' });

            if (checkout) {
                execSync(`git checkout ${name}`, { stdio: 'inherit' });
            }

            log.info('Git branch created', { name });
            return { success: true, branch: name };
        } catch (err) {
            log.error('Error creating git branch', { error: err.message });
            throw err;
        }
    }

    /**
     * Cria PR no Git (via GitKraken MCP)
     */
    async gitPR(action) {
        const { title, body, base, head } = action;

        // TODO: Implementar via GitKraken MCP quando disponível
        log.warn('Git PR creation not yet implemented via MCP');
        return { success: false, error: 'Not implemented yet' };
    }

    /**
     * Executa testes
     */
    async runTest(action) {
        const { command = 'npm test', cwd = process.cwd() } = action;

        const { execSync } = await import('child_process');

        try {
            const output = execSync(command, {
                cwd,
                encoding: 'utf8',
                stdio: 'pipe'
            });

            log.info('Tests executed', { command });
            return { success: true, output };
        } catch (err) {
            log.error('Tests failed', { error: err.message, output: err.stdout });
            return { success: false, error: err.message, output: err.stdout };
        }
    }

    /**
     * Chama API externa
     */
    async callAPI(action) {
        const { url, method = 'GET', headers = {}, body } = action;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await response.json();

            log.info('API called', { url, status: response.status });
            return { success: response.ok, status: response.status, data };
        } catch (err) {
            log.error('Error calling API', { error: err.message, url });
            throw err;
        }
    }

    /**
     * Atualiza estado no Letta (Protocolo L.L.B.)
     */
    async updateLettaState(action) {
        const { task, status, metadata = {} } = action;

        log.info('Updating Letta state via LLB Protocol', { task, status });

        try {
            const result = await this.llbProtocol.letta.updateState(task, status, metadata);
            return {
                success: !!result,
                message: result ? 'Letta state updated' : 'Failed to update Letta state',
                result
            };
        } catch (err) {
            log.error('Error updating Letta state', { error: err.message });
            throw err;
        }
    }

    /**
     * Armazena sabedoria no LangMem (Protocolo L.L.B.)
     */
    async storeLangmemWisdom(action) {
        const { content, category = 'wisdom', metadata = {} } = action;

        log.info('Storing LangMem wisdom via LLB Protocol', { category });

        try {
            const result = await this.llbProtocol.langmem.storeWisdom(content, category, metadata);
            return {
                success: !!result,
                message: result ? 'LangMem wisdom stored' : 'Failed to store LangMem wisdom',
                knowledgeId: result?.id,
                result
            };
        } catch (err) {
            log.error('Error storing LangMem wisdom', { error: err.message });
            throw err;
        }
    }

    /**
     * Commit inteligente com metadados L.L.B.
     */
    async intelligentGitCommit(action) {
        const { message, files = [], letta_metadata = {}, langmem_metadata = {} } = action;

        log.info('Performing intelligent git commit via LLB Protocol', { message });

        try {
            // Se houver arquivos específicos, adicionar antes
            if (files.length > 0) {
                const { execSync } = await import('child_process');
                execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });
            }

            const result = await this.llbProtocol.commitWithMemory(message, letta_metadata, langmem_metadata);

            return {
                success: result.success,
                commit_hash: result.commit_hash,
                message: result.message,
                error: result.error
            };
        } catch (err) {
            log.error('Error in intelligent git commit', { error: err.message });
            throw err;
        }
    }

    /**
     * Lê arquivo
     */
    async readFile(action) {
        const { path: filePath } = action;

        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, path: filePath, content: content };
    }

    /**
     * Lista diretório
     */
    async listDir(action) {
        const { path: dirPath = process.cwd() } = action;

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory does not exist: ${dirPath}`);
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const result = items.map(item => ({
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file',
            path: path.join(dirPath, item.name)
        }));

        return { success: true, path: dirPath, items: result };
    }

    /**
     * Busca semântica no código
     */
    async codebaseSearch(action) {
        const { query } = action;

        // TODO: Implementar busca semântica real (usar codebase_search tool)
        log.info('Codebase search', { query });
        return { success: true, query: query, results: [] };
    }

    /**
     * Ativa modo dry-run
     */
    setDryRun(enabled) {
        this.dryRun = enabled;
        log.info('Dry-run mode', { enabled });
    }
}

// Singleton
let executorInstance = null;

export function getExecutor() {
    if (!executorInstance) {
        executorInstance = new Executor();
    }
    return executorInstance;
}

export default Executor;





