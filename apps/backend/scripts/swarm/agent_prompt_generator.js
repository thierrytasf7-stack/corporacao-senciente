#!/usr/bin/env node
/**
 * Agent Prompt Generator
 * 
 * Gera prompts estruturados de agentes para incorporação no chat/IDE
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { logger } from '../utils/logger.js';
import { getBrain } from './brain.js';
import { getMemory } from './memory.js';
import { getPromptCache } from './prompt_cache.js';

const log = logger.child({ module: 'agent_prompt_generator' });

/**
 * Agent Prompt Generator
 */
class AgentPromptGenerator {
    constructor() {
        this._memory = null;
        this._brain = null;
        this._llbProtocol = null;
        this._cache = null;
    }

    // Lazy getters
    get memory() {
        if (!this._memory) this._memory = getMemory();
        return this._memory;
    }

    get brain() {
        if (!this._brain) this._brain = getBrain();
        return this._brain;
    }

    get llbProtocol() {
        if (!this._llbProtocol) this._llbProtocol = getLLBProtocol();
        return this._llbProtocol;
    }

    get cache() {
        if (!this._cache) this._cache = getPromptCache();
        return this._cache;
    }

    /**
     * Gera prompt estruturado de um agente
     * 
     * @param {string} agentName - Nome do agente
     * @param {string|object} task - Tarefa a executar
     * @param {object} context - Contexto adicional (pode incluir brainContext)
     * @returns {Promise<string>} Prompt estruturado
     */
    async generateAgentPrompt(agentName, task, context = {}) {
        // Garantir que o Brain está inicializado (e agentes registrados)
        await this.brain.initialize();

        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const cacheKey = `${agentName}:${taskDescription}`;

        log.info('Generating agent prompt', {
            agent: agentName,
            task: taskDescription.substring(0, 100),
            cacheKey: cacheKey.substring(0, 50)
        });

        try {
            // 1. Verificar cache primeiro
            const cachedResult = this.cache.get(cacheKey, { agentName, task, context });
            if (cachedResult) {
                log.info('Using cached prompt', {
                    agent: agentName,
                    hash: cachedResult.hash,
                    successRate: cachedResult.metadata?.successRate
                });
                return cachedResult.result;
            }

            // 2. Verificar similaridade se não encontrou exato
            const similarResult = this.cache.getSimilar(cacheKey, { agentName, task, context });
            if (similarResult) {
                log.info('Using similar cached prompt', {
                    agent: agentName,
                    similarity: similarResult.similarity?.toFixed(3),
                    hash: similarResult.hash
                });
                return similarResult.result;
            }

            // 3. Buscar agente registrado no Brain
            const agent = this.brain.agents.get(agentName);

            if (agent && typeof agent.generatePrompt === 'function') {
                // Se agente tem método generatePrompt, usar dele
                log.debug('Using agent.generatePrompt', { agent: agentName });
                const result = await agent.generatePrompt(task, context);

                // Armazenar no cache (considerar sucesso por padrão)
                this.cache.store(cacheKey, { agentName, task, context }, result, {
                    successRate: 0.9, // Valor padrão alto para prompts gerados
                    source: 'agent.generatePrompt'
                });

                return result;
            }

            // 2. Caso contrário, gerar prompt genérico baseado em configuração
            const agentConfig = await this.getAgentConfig(agentName);
            const agentHistory = await this.memory.getAgentHistory(agentName, 5);

            // 3. Se task envolve criar módulo, verificar dependências no LangMem
            let dependencyCheck = null;
            if (this.isModuleCreationTask(task)) {
                const moduleName = this.extractModuleName(task);
                if (moduleName) {
                    dependencyCheck = await this.llbProtocol.checkDependencies(moduleName);
                }
            }

            // 4. Construir prompt estruturado
            const prompt = this.buildPrompt(agentName, agentConfig, task, context, agentHistory, dependencyCheck);

            // 5. Armazenar no cache
            this.cache.store(cacheKey, { agentName, task, context }, prompt, {
                successRate: 0.8, // Valor conservador para prompts genéricos
                source: 'agent.buildPrompt',
                hasDependencies: !!dependencyCheck,
                hasHistory: agentHistory.length > 0
            });

            log.debug('Agent prompt generated and cached', {
                agent: agentName,
                length: prompt.length,
                hash: this.cache.generatePromptHash(cacheKey, { agentName, task, context })
            });

            return prompt;
        } catch (err) {
            log.error('Error generating agent prompt', {
                error: err.message,
                agent: agentName
            });
            // Fallback: prompt básico
            return this.buildFallbackPrompt(agentName, task);
        }
    }

    /**
     * Obtém configuração do agente
     * 
     * @param {string} agentName - Nome do agente
     * @returns {Promise<object>} Configuração do agente
     */
    async getAgentConfig(agentName) {
        // Tentar buscar do agente registrado
        const agent = this.brain.agents.get(agentName);
        if (agent) {
            return {
                name: agent.name,
                sector: agent.sector,
                specialization: agent.specialization,
                tools: agent.tools || [],
                canCallAgents: agent.canCallAgents || []
            };
        }

        // Fallback: configuração padrão baseada em nome
        return this.getDefaultAgentConfig(agentName);
    }

    /**
     * Obtém configuração padrão do agente (fallback)
     */
    getDefaultAgentConfig(agentName) {
        const defaultConfigs = {
            marketing: {
                name: 'marketing',
                sector: 'Business',
                specialization: 'Estratégia de marketing, campanhas, publicidade, SEO, análise de mercado',
                tools: ['write_file', 'read_file', 'codebase_search'],
                canCallAgents: ['copywriting', 'sales', 'finance']
            },
            copywriting: {
                name: 'copywriting',
                sector: 'Business',
                specialization: 'Criação de textos persuasivos, storytelling, comunicação eficaz',
                tools: ['write_file', 'read_file'],
                canCallAgents: []
            },
            sales: {
                name: 'sales',
                sector: 'Business',
                specialization: 'Vendas, conversão, funil de vendas, CRM',
                tools: ['read_file', 'codebase_search'],
                canCallAgents: ['marketing', 'finance']
            },
            architect: {
                name: 'architect',
                sector: 'Technical',
                specialization: 'Arquitetura de software, segurança, escalabilidade, design de sistemas',
                tools: ['write_file', 'read_file', 'codebase_search'],
                canCallAgents: ['dev', 'validation', 'devex']
            },
            dev: {
                name: 'dev',
                sector: 'Technical',
                specialization: 'Desenvolvimento, código, implementação, testes',
                tools: ['write_file', 'search_replace', 'read_file', 'codebase_search'],
                canCallAgents: ['validation', 'architect']
            },
            validation: {
                name: 'validation',
                sector: 'Technical',
                specialization: 'QA, testes, validação, garantia de qualidade',
                tools: ['read_file', 'run_terminal_cmd'],
                canCallAgents: ['dev']
            },
            finance: {
                name: 'finance',
                sector: 'Business',
                specialization: 'Finanças, custos, ROI, orçamento, análise financeira',
                tools: ['read_file', 'codebase_search'],
                canCallAgents: ['marketing', 'sales']
            }
        };

        return defaultConfigs[agentName] || {
            name: agentName,
            sector: 'General',
            specialization: 'Agente especializado',
            tools: ['write_file', 'read_file'],
            canCallAgents: []
        };
    }

    /**
     * Constrói prompt estruturado completo
     */
    buildPrompt(agentName, config, task, context, history, dependencyCheck = null) {
        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const brainContext = context.brainContext || {};

        return `Você é o agente **${config.name}** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO
${config.specialization}

## SETOR
${config.sector}

## FERRAMENTAS DISPONÍVEIS
Você tem acesso às seguintes ferramentas do chat/IDE:
${config.tools.map(tool => `- **${tool}**: ${this.getToolDescription(tool)}`).join('\n')}

## AGENTES QUE PODE CHAMAR
${config.canCallAgents.length > 0
                ? config.canCallAgents.map(agent => `- **${agent}**: Para tarefas relacionadas a ${agent}`).join('\n')
                : 'Nenhum (agente independente)'}

## TASK ESPECÍFICA
${taskDescription}

## CONTEXTO DO BRAIN
${brainContext.analysis ? `**Análise do Brain:** ${brainContext.analysis}` : ''}
${brainContext.reasoning ? `**Razão da Delegação:** ${brainContext.reasoning}` : ''}
${brainContext.state ? `**Estado Atual (Letta):** ${JSON.stringify(brainContext.state, null, 2)}` : ''}
${brainContext.wisdom && brainContext.wisdom.length > 0
                ? `**Sabedoria Relevante (LangMem):**\n${brainContext.wisdom.map(w => `- ${w.content.substring(0, 100)}...`).join('\n')}`
                : ''}

${dependencyCheck && !dependencyCheck.canCreate
                ? `## ⚠️ VERIFICAÇÃO DE DEPENDÊNCIAS (LangMem)
**ATENÇÃO:** Verificação de dependências detectou conflitos:
${dependencyCheck.dependencies.conflicts.map(c => `- **Conflito:** ${c}`).join('\n')}

**Ação requerida:** ${dependencyCheck.message}

**Sugestão:** Revise as dependências antes de criar o módulo.
`
                : dependencyCheck && dependencyCheck.hasWarnings
                    ? `## ⚠️ AVISOS DE DEPENDÊNCIAS (LangMem)
**Avisos detectados:**
${dependencyCheck.dependencies.warnings.map(w => `- ${w}`).join('\n')}

**Dependências obrigatórias:**
${dependencyCheck.dependencies.required.map(d => `- ${d}`).join('\n')}
`
                    : dependencyCheck
                        ? `## ✅ VERIFICAÇÃO DE DEPENDÊNCIAS (LangMem)
**Status:** Sem conflitos detectados
**Dependências obrigatórias:**
${dependencyCheck.dependencies.required.length > 0
                            ? dependencyCheck.dependencies.required.map(d => `- ${d}`).join('\n')
                            : 'Nenhuma'}
`
                        : ''}

## HISTÓRICO DO AGENTE
${history.length > 0
                ? history.slice(0, 3).map(h => `- ${h.task_description?.substring(0, 100) || 'N/A'} (${new Date(h.created_at).toLocaleDateString()})`).join('\n')
                : 'Nenhum histórico disponível'}

## INSTRUÇÕES

1. **Analise a task** cuidadosamente considerando sua especialização
2. **Se houver verificação de dependências**, respeite as regras do LangMem antes de criar módulos
3. **Use as ferramentas disponíveis** para executar a task:
   - Use \`write_file\` para criar novos arquivos
   - Use \`search_replace\` para modificar código existente
   - Use \`read_file\` para ler arquivos relevantes
   - Use \`codebase_search\` para buscar informações no código
4. **Se precisar de outro agente**, gere um prompt estruturado para incorporá-lo usando o formato:
   \`\`\`
   @agent:[nome_do_agente]
   Task: [descrição da subtask]
   Context: [contexto adicional]
   \`\`\`
5. **Após executar**, atualize o Letta com o resultado (via Protocolo L.L.B.)
6. **Se descobrir um padrão**, armazene no LangMem automaticamente
7. **Retorne resultado estruturado** com:
   - O que foi feito
   - Arquivos criados/modificados
   - Próximos passos (se houver)
   - Agentes chamados (se houver)

## FORMATO DE RESPOSTA

Após executar, retorne um resultado estruturado:

\`\`\`json
{
  "result": "Descrição do resultado da execução",
  "actions": ["ação1 executada", "ação2 executada"],
  "files_created": ["arquivo1.js", "arquivo2.js"],
  "files_modified": ["arquivo3.js"],
  "agents_called": ["agent1", "agent2"],
  "next_steps": ["próximo passo 1", "próximo passo 2"],
  "success": true
}
\`\`\`

Execute a task agora usando as ferramentas disponíveis.`;
    }

    /**
     * Verifica se task envolve criar módulo
     */
    isModuleCreationTask(task) {
        const taskStr = typeof task === 'string' ? task : JSON.stringify(task);
        const lower = taskStr.toLowerCase();
        return lower.includes('criar módulo') ||
            lower.includes('create module') ||
            lower.includes('novo módulo') ||
            lower.includes('new module');
    }

    /**
     * Extrai nome do módulo da task
     */
    extractModuleName(task) {
        const taskStr = typeof task === 'string' ? task : JSON.stringify(task);
        // Tentar extrair nome do módulo (implementação básica)
        const match = taskStr.match(/(?:módulo|module)\s+['"]?(\w+)['"]?/i);
        return match ? match[1] : null;
    }

    /**
     * Obtém descrição de uma ferramenta
     */
    getToolDescription(tool) {
        const descriptions = {
            'write_file': 'Criar ou modificar arquivos',
            'search_replace': 'Modificar código existente (substituir texto)',
            'read_file': 'Ler conteúdo de arquivos',
            'list_dir': 'Listar arquivos e diretórios',
            'grep': 'Buscar padrões em arquivos',
            'run_terminal_cmd': 'Executar comandos no terminal',
            'codebase_search': 'Busca semântica no código (encontrar código relacionado)',
        };

        return descriptions[tool] || `Ferramenta ${tool}`;
    }

    /**
     * Prompt de fallback (básico)
     */
    buildFallbackPrompt(agentName, task) {
        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';

        return `Você é o agente **${agentName}** da Corporação Senciente 7.0.

## TASK
${taskDescription}

## INSTRUÇÕES
Execute esta task usando as ferramentas disponíveis do chat/IDE.

**Nota:** Configuração completa do agente não disponível no momento.`;
    }
}

// Singleton
let generatorInstance = null;

export function getAgentPromptGenerator() {
    if (!generatorInstance) {
        generatorInstance = new AgentPromptGenerator();
    }
    return generatorInstance;
}

export default AgentPromptGenerator;
