/**
 * AIOS-Core Agent Executor
 * Executa agentes LLM para processar tasks de workflows
 * 
 * Torna o AIOS-Core independente de ferramentas externas (Kiro, Aider, etc)
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class AgentExecutor {
    constructor(config = {}) {
        // Carregar variáveis de ambiente
        require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
        
        this.config = {
            model: config.model || process.env.AIOS_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
            apiKey: config.apiKey || this.selectApiKey(config.taskType),
            apiUrl: config.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
            temperature: config.temperature || parseFloat(process.env.AIOS_DEFAULT_TEMPERATURE) || 0.3,
            maxTokens: config.maxTokens || parseInt(process.env.AIOS_MAX_TOKENS) || 8000,
            timeout: parseInt(process.env.AIOS_REQUEST_TIMEOUT) || 120000,
            ...config
        };
        
        this.projectRoot = process.cwd();
        this.keyRotationIndex = 0;
        this.freeKeys = [
            process.env.OPENROUTER_API_KEY_FREE_1,
            process.env.OPENROUTER_API_KEY_FREE_2,
            process.env.OPENROUTER_API_KEY_FREE_3,
            process.env.OPENROUTER_API_KEY_FREE_4,
            process.env.OPENROUTER_API_KEY_FREE_5
        ].filter(Boolean);
    }
    
    /**
     * Selecionar API key baseado no tipo de task
     */
    selectApiKey(taskType = 'default') {
        const useFreeForSimple = process.env.AIOS_USE_FREE_FOR_SIMPLE === 'true';
        const enableRotation = process.env.AIOS_ENABLE_KEY_ROTATION === 'true';
        
        // SEMPRE usar keys gratuitas com rotação (mudança: não usar key paga)
        if (enableRotation && this.freeKeys.length > 0) {
            const key = this.freeKeys[this.keyRotationIndex];
            this.keyRotationIndex = (this.keyRotationIndex + 1) % this.freeKeys.length;
            return key;
        }
        
        // Fallback: primeira key gratuita
        return this.freeKeys[0] || process.env.OPENROUTER_API_KEY;
    }
    
    /**
     * Selecionar modelo baseado no tipo de task
     */
    selectModel(taskType = 'default') {
        switch (taskType) {
            case 'planning':
                return process.env.AIOS_PLANNING_MODEL_FREE || 'deepseek/deepseek-r1-distill-qwen-32b';
            case 'execution':
                return process.env.AIOS_EXECUTION_MODEL_1 || 'google/gemini-2.0-flash-exp:free';
            case 'execution_alt':
                return process.env.AIOS_EXECUTION_MODEL_2 || 'meta-llama/llama-3.3-70b-instruct:free';
            default:
                return this.config.model;
        }
    }
    
    /**
     * Executar agente para processar uma task
     */
    async execute(task, workflow) {
        console.log(chalk.blue(`\n🤖 Executando agente: @${task.agent}`));
        
        // Validar configuração
        if (!this.config.apiKey) {
            throw new Error('API Key não configurada. Defina OPENROUTER_API_KEY no .env');
        }
        
        // Preparar contexto
        const context = await this.prepareContext(task, workflow);
        
        // Construir prompt
        const prompt = this.buildPrompt(task, workflow, context);
        
        // Chamar LLM
        const response = await this.callLLM(prompt, task);
        
        // Processar resposta
        const result = await this.processResponse(response, task);
        
        return result;
    }
    
    /**
     * Preparar contexto para o agente
     */
    async prepareContext(task, workflow) {
        const context = {
            references: [],
            original: null,
            pattern: workflow.context.pattern,
            requirements: workflow.context.requirements
        };
        
        // Carregar documentos de referência
        for (const refPath of workflow.context.reference_docs) {
            const fullPath = path.join(this.projectRoot, refPath);
            if (fs.existsSync(fullPath)) {
                const content = await fs.readFile(fullPath, 'utf8');
                context.references.push({
                    path: refPath,
                    content: content
                });
                console.log(chalk.gray(`   📄 Referência carregada: ${path.basename(refPath)}`));
            }
        }
        
        // Carregar documento original
        const inputPath = path.join(this.projectRoot, task.input.file);
        if (fs.existsSync(inputPath)) {
            context.original = await fs.readFile(inputPath, 'utf8');
            console.log(chalk.gray(`   📄 Original carregado: ${path.basename(inputPath)}`));
        }
        
        return context;
    }
    
    /**
     * Construir prompt para o agente
     */
    buildPrompt(task, workflow, context) {
        const prompt = `# TASK: ${task.name}

## OBJETIVO
Refatorar o documento "${task.input.file}" aplicando a estrutura dos documentos de referência.

## TEMA ESPECÍFICO
- **Tema**: ${task.input.theme}
- **Foco**: ${task.input.focus}

## ESTRUTURA REQUERIDA
${JSON.stringify(context.pattern, null, 2)}

## REQUISITOS
${context.requirements.map(r => `- ${r}`).join('\n')}

## DOCUMENTOS DE REFERÊNCIA
${context.references.map(ref => `
### ${path.basename(ref.path)}
\`\`\`markdown
${ref.content.substring(0, 3000)}...
\`\`\`
`).join('\n')}

## DOCUMENTO ORIGINAL
\`\`\`markdown
${context.original}
\`\`\`

## INSTRUÇÕES
1. Analise a estrutura dos documentos de referência (01 e 02)
2. Identifique o padrão: 23 níveis de evolução vertical
3. Cada nível tem uma tabela com 10 tasks
4. Mantenha o tema específico: "${task.input.theme}"
5. Use linguagem poética e filosófica
6. Inclua emojis consistentes: 🧬 🏛️ 👁️ 🏁
7. Colunas das tabelas: ID, Task, Squad, Status, Dif., At. Humana, Tempo, Ordem, Pré-requisitos

## OUTPUT
Retorne o documento completo refatorado em formato markdown.
Não inclua explicações adicionais, apenas o documento.`;

        return prompt;
    }
    
    /**
     * Chamar LLM via OpenRouter
     */
    async callLLM(prompt, task) {
        // SEMPRE usar modelos gratuitos
        const taskType = task.task_type || 'execution';
        const apiKey = this.selectApiKey('simple');
        const model = this.selectModel(taskType);
        
        console.log(chalk.gray(`   🌐 Chamando LLM: ${model}`));
        console.log(chalk.gray(`   🔑 Key: ${this.maskKey(apiKey)}`));
        
        const agentConfig = task.agent_config || {};
        const temperature = agentConfig.temperature || this.config.temperature;
        
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: temperature,
            max_tokens: this.config.maxTokens
        };
        
        try {
            const fetch = (await import('node-fetch')).default;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://corporacao-senciente.com',
                    'X-Title': 'AIOS-Core Agent Executor'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`LLM API Error: ${response.status} - ${error}`);
            }
            
            const data = await response.json();
            
            // Log de uso
            if (process.env.AIOS_LOG_API_USAGE === 'true') {
                this.logApiUsage(model, apiKey, data.usage);
            }
            
            console.log(chalk.green(`   ✅ Resposta recebida`));
            
            return data.choices[0].message.content;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(chalk.red(`   ❌ Timeout após ${this.config.timeout}ms`));
            } else {
                console.log(chalk.red(`   ❌ Erro ao chamar LLM: ${error.message}`));
            }
            
            // Retry se habilitado
            if (process.env.AIOS_ENABLE_RETRY === 'true') {
                const maxRetries = parseInt(process.env.AIOS_MAX_RETRIES) || 3;
                const retryDelay = parseInt(process.env.AIOS_RETRY_DELAY) || 2000;
                
                console.log(chalk.yellow(`   🔄 Tentando novamente em ${retryDelay}ms...`));
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                
                // Tentar com key diferente
                this.keyRotationIndex = (this.keyRotationIndex + 1) % this.freeKeys.length;
                return this.callLLM(prompt, task);
            }
            
            throw error;
        }
    }
    
    /**
     * Mascarar API key para logs
     */
    maskKey(key) {
        if (!key || process.env.AIOS_MASK_KEYS_IN_LOGS !== 'true') {
            return key;
        }
        return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
    }
    
    /**
     * Log de uso de API
     */
    logApiUsage(model, apiKey, usage) {
        const fs = require('fs-extra');
        const path = require('path');
        
        const logDir = path.join(this.projectRoot, process.env.AIOS_LOG_DIR || '.aios-core/logs');
        fs.ensureDirSync(logDir);
        
        const logFile = path.join(logDir, 'api-usage.jsonl');
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            model: model,
            key: this.maskKey(apiKey),
            usage: usage
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
    
    /**
     * Processar resposta do LLM
     */
    async processResponse(response, task) {
        console.log(chalk.gray(`   📝 Processando resposta...`));
        
        // Extrair markdown da resposta
        let markdown = response;
        
        // Se a resposta está em um bloco de código, extrair
        const codeBlockMatch = response.match(/```markdown\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
            markdown = codeBlockMatch[1];
        }
        
        // Validar estrutura básica
        const validation = this.validateStructure(markdown, task);
        
        if (!validation.valid) {
            console.log(chalk.yellow(`   ⚠️ Validação: ${validation.warnings.length} avisos`));
            validation.warnings.forEach(w => console.log(chalk.gray(`      - ${w}`)));
        }
        
        // Salvar resultado
        const outputPath = path.join(this.projectRoot, task.output.file);
        await fs.writeFile(outputPath, markdown, 'utf8');
        
        console.log(chalk.green(`   ✅ Documento salvo: ${path.basename(outputPath)}`));
        console.log(chalk.gray(`   📊 Tamanho: ${markdown.length} caracteres`));
        
        return {
            success: true,
            task_id: task.id,
            output_file: task.output.file,
            size: markdown.length,
            validation: validation
        };
    }
    
    /**
     * Validar estrutura do documento gerado
     */
    validateStructure(markdown, task) {
        const warnings = [];
        
        // Verificar título
        if (!markdown.includes('# Protocolo de Evolução')) {
            warnings.push('Título principal não encontrado');
        }
        
        // Verificar níveis (deve ter 23)
        const nivelMatches = markdown.match(/## Nível \d+:/g);
        if (!nivelMatches || nivelMatches.length !== 23) {
            warnings.push(`Esperado 23 níveis, encontrado ${nivelMatches ? nivelMatches.length : 0}`);
        }
        
        // Verificar tabelas
        const tableMatches = markdown.match(/\|.*\|/g);
        if (!tableMatches || tableMatches.length < 230) { // 23 níveis * ~10 linhas
            warnings.push('Número de tabelas insuficiente');
        }
        
        // Verificar emojis
        const hasEmojis = /[🧬🏛️👁️🏁]/.test(markdown);
        if (!hasEmojis) {
            warnings.push('Emojis não encontrados');
        }
        
        return {
            valid: warnings.length === 0,
            warnings: warnings
        };
    }
}

module.exports = AgentExecutor;
