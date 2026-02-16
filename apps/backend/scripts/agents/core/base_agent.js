#!/usr/bin/env node
/**
 * BaseAgent - Classe Base para Todos os Agentes
 * 
 * Define interface comum para todos os agentes com suporte a:
 * - Execução direta (compatibilidade)
 * - Geração de prompts para incorporação no chat/IDE
 * - Chamadas agent-to-agent via prompts
 * - Busca de conhecimento
 * - Registro de decisões
 */

import { logger } from '../utils/logger.js';
import { getGlobalTracker } from './agent_call_tracker.js';
import { getHandoffManager } from './handoff_manager.js';

const log = logger.child({ module: 'base_agent' });

/**
 * Classe Base para Agentes
 */
export class BaseAgent {
    /**
     * Construtor
     * 
     * @param {object} config - Configuração do agente
     * @param {string} config.name - Nome do agente
     * @param {string} config.sector - Setor (Technical, Business, Operations)
     * @param {string} config.specialization - Especialização do agente
     * @param {array} config.tools - Ferramentas disponíveis (write_file, search_replace, etc.)
     * @param {array} config.canCallAgents - Lista de agentes que pode chamar
     * @param {object} config.router - Router para roteamento (injetado pelo Brain)
     * @param {object} config.memory - Memory para memória compartilhada (injetado pelo Brain)
     */
    constructor(config) {
        if (!config.name) {
            throw new Error('Agent name is required');
        }

        this.name = config.name;
        this.sector = config.sector || 'General';
        this.specialization = config.specialization || '';
        this.tools = config.tools || [];
        this.canCallAgents = config.canCallAgents || [];
        this.router = config.router || null;
        this.memory = config.memory || null;
        this.config = config;

        log.info('BaseAgent created', { name: this.name, sector: this.sector });
    }

    /**
     * Executa tarefa (modo direto, compatibilidade)
     * 
     * @param {string|object} task - Tarefa a executar
     * @param {object} context - Contexto adicional
     * @returns {Promise<object>} Resultado da execução
     */
    async execute(task, context = {}) {
        log.info('BaseAgent.execute called', {
            agent: this.name,
            task: typeof task === 'string' ? task.substring(0, 100) : 'object'
        });

        // 1. Verificar se handoff é necessário
        const handoffManager = getHandoffManager();
        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const handoff = handoffManager.detectHandoff(this.name, taskDescription);

        if (handoff && handoff.confidence > 0.5) {
            log.info('Handoff detected during execute', {
                from: this.name,
                to: handoff.to,
                confidence: handoff.confidence
            });

            // Se handoff detectado, sugerir chamada ao agente
            return {
                agent: this.name,
                handoff: handoff,
                suggestion: `Esta task requer especialização do agente ${handoff.to}. Considere chamar: @agent:${handoff.to}`,
                prompt: handoffManager.generateHandoffPrompt(handoff, taskDescription, context)
            };
        }

        // 2. Se o agente implementa processTask (convenção nova), usar ele
        if (typeof this.processTask === 'function') {
            log.debug('Delegating to processTask', { agent: this.name });
            return await this.processTask(task, context);
        }

        // 3. Implementação padrão: retorna erro se não houver lógica específica
        // Agentes específicos devem sobrescrever execute() ou processTask()
        throw new Error(`Agent ${this.name} must implement execute() or processTask() method`);
    }

    /**
     * Gera prompt para incorporar agente no chat
     * 
     * @param {string|object} task - Tarefa a executar
     * @param {object} context - Contexto adicional (pode incluir brainContext)
     * @returns {Promise<string>} Prompt estruturado
     */
    async generatePrompt(task, context = {}) {
        log.info('BaseAgent.generatePrompt called', {
            agent: this.name,
            task: typeof task === 'string' ? task.substring(0, 100) : 'object'
        });

        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const brainContext = context.brainContext || {};
        const agentHistory = context.agentHistory || [];

        // Buscar histórico do agente se memory disponível
        let history = [];
        if (this.memory) {
            try {
                history = await this.memory.getAgentHistory(this.name, 5);
            } catch (err) {
                log.warn('Error getting agent history', { error: err.message });
            }
        }

        // Construir prompt estruturado
        const prompt = `Você é o agente **${this.name}** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO
${this.specialization || 'Agente especializado'}

## SETOR
${this.sector}

## FERRAMENTAS DISPONÍVEIS
Você tem acesso às seguintes ferramentas do chat/IDE:
${this.tools.map(tool => `- **${tool}**: ${this.getToolDescription(tool)}`).join('\n')}

## AGENTES QUE PODE CHAMAR
${this.canCallAgents.length > 0
                ? this.canCallAgents.map(agent => `- **${agent}**: Para tarefas relacionadas a ${agent}`).join('\n')
                : 'Nenhum (agente independente)'}

## TASK ESPECÍFICA
${taskDescription}

## CONTEXTO DO BRAIN
${brainContext.analysis ? `**Análise:** ${brainContext.analysis}` : ''}
${brainContext.reasoning ? `**Razão da Delegação:** ${brainContext.reasoning}` : ''}
${brainContext.state ? `**Estado Atual:** ${JSON.stringify(brainContext.state, null, 2)}` : ''}

## HISTÓRICO DO AGENTE
${history.length > 0
                ? history.slice(0, 3).map(h => `- ${h.task_description?.substring(0, 100) || 'N/A'}`).join('\n')
                : 'Nenhum histórico disponível'}

## INSTRUÇÕES
1. **Analise a task** cuidadosamente
2. **Use as ferramentas disponíveis** para executar a task
3. **Se precisar de outro agente**, gere um prompt estruturado para incorporá-lo usando o formato:
   \`\`\`
   @agent:[nome_do_agente]
   Task: [descrição da subtask]
   \`\`\`
4. **Retorne resultado estruturado** com:
   - O que foi feito
   - Arquivos criados/modificados
   - Próximos passos (se houver)
   - Agentes chamados (se houver)

## FORMATO DE RESPOSTA
\`\`\`json
{
  "result": "Descrição do resultado",
  "actions": ["ação1", "ação2"],
  "files_modified": ["arquivo1.js", "arquivo2.js"],
  "agents_called": ["agent1", "agent2"],
  "next_steps": ["próximo passo 1", "próximo passo 2"]
}
\`\`\`

Execute a task agora.`;

        return prompt;
    }

    /**
     * Chama outro agente (gera prompt completo do agente chamado)
     * 
     * @param {string} agentName - Nome do agente a chamar
     * @param {string|object} subtask - Subtarefa para o agente
     * @param {object} context - Contexto adicional
     * @param {number} depth - Profundidade atual da chamada (para evitar loops)
     * @param {number} timeout - Timeout em ms (padrão: 30000)
     * @returns {Promise<string>} Prompt estruturado para incorporar o agente
     */
    async callAgent(agentName, subtask, context = {}, depth = 0, timeout = 30000) {
        log.info('BaseAgent.callAgent', {
            caller: this.name,
            target: agentName,
            subtask: typeof subtask === 'string' ? subtask.substring(0, 100) : 'object',
            depth
        });

        // Rastrear chamada
        const tracker = getGlobalTracker();
        tracker.recordCall(this.name, agentName, subtask, depth);

        // Verificar loops infinitos
        if (tracker.detectLoop(this.name, agentName, depth)) {
            throw new Error(`Loop detected: ${this.name} -> ${agentName} at depth ${depth}`);
        }

        // Validar permissões
        if (!this.canCallAgents.includes(agentName)) {
            throw new Error(`Agent ${this.name} is not allowed to call agent ${agentName}`);
        }

        // Validar via router se disponível
        if (this.router && !this.router.canAgentCallAgent(this.name, agentName)) {
            throw new Error(`Router denied call from ${this.name} to ${agentName}`);
        }

        // Buscar instância do agente chamado (se disponível via router)
        let targetAgent = null;
        if (this.router && typeof this.router.getAgent === 'function') {
            try {
                targetAgent = await this.router.getAgent(agentName);
            } catch (err) {
                log.warn('Could not get agent instance', { agent: agentName, error: err.message });
            }
        }

        // Preparar contexto para o agente chamado
        const callContext = {
            ...context,
            caller: this.name,
            callerTask: typeof subtask === 'string' ? subtask : JSON.stringify(subtask),
            depth: depth + 1,
            callHistory: tracker.getAgentHistory(agentName, 3)
        };

        // Se temos instância do agente, gerar prompt completo
        if (targetAgent && typeof targetAgent.generatePrompt === 'function') {
            try {
                const fullPrompt = await Promise.race([
                    targetAgent.generatePrompt(subtask, callContext),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout generating prompt')), timeout)
                    )
                ]);

                // Adicionar metadados da chamada
                return `## CHAMADA AGENT-TO-AGENT
**Chamador:** ${this.name}
**Agente Chamado:** ${agentName}
**Contexto da Chamada:** ${JSON.stringify(callContext, null, 2)}

---

${fullPrompt}

---

## RETORNO PARA ${this.name.toUpperCase()}
Após executar a task acima, retorne o resultado estruturado para o agente ${this.name}.`;
            } catch (err) {
                log.error('Error generating prompt from agent instance', {
                    error: err.message,
                    agent: agentName
                });
                // Fallback para formato simples
            }
        }

        // Fallback: Gerar prompt básico para incorporar o agente chamado
        // Nota: Isso será usado pelo Agent Prompt Generator para gerar o prompt completo
        const prompt = `@agent:${agentName}
Task: ${typeof subtask === 'string' ? subtask : JSON.stringify(subtask)}
Context: ${JSON.stringify(callContext)}
Caller: ${this.name}
Depth: ${depth + 1}`;

        return prompt;
    }

    /**
     * Busca conhecimento
     * 
     * @param {string} query - Query de busca
     * @returns {Promise<array>} Conhecimento encontrado
     */
    async getKnowledge(query) {
        log.debug('BaseAgent.getKnowledge', { agent: this.name, query: query.substring(0, 50) });

        if (!this.memory) {
            log.warn('Memory not available for agent', { agent: this.name });
            return [];
        }

        try {
            const knowledge = await this.memory.getKnowledge(query);
            return knowledge;
        } catch (err) {
            log.error('Error getting knowledge', { error: err.message, agent: this.name });
            return [];
        }
    }

    /**
     * Busca decisões similares
     * 
     * @param {string} task - Tarefa para buscar similar
     * @param {number} limit - Limite de resultados
     * @returns {Promise<array>} Decisões similares
     */
    async getSimilarDecisions(task, limit = 5) {
        log.debug('BaseAgent.getSimilarDecisions', { agent: this.name, task: task.substring(0, 50) });

        if (!this.memory) {
            log.warn('Memory not available for agent', { agent: this.name });
            return [];
        }

        try {
            const decisions = await this.memory.getSimilarDecisions(task, limit);
            return decisions;
        } catch (err) {
            log.error('Error getting similar decisions', { error: err.message, agent: this.name });
            return [];
        }
    }

    /**
     * Registra decisão
     * 
     * @param {object} decision - Decisão tomada
     * @param {object} result - Resultado da execução
     * @returns {Promise<boolean>} Sucesso
     */
    async registerDecision(decision, result = null) {
        log.debug('BaseAgent.registerDecision', { agent: this.name });

        if (!this.memory) {
            log.warn('Memory not available for agent', { agent: this.name });
            return false;
        }

        const task = decision.task || decision.description || 'Unknown task';
        const success = await this.memory.storeDecision(this.name, task, decision, result);
        return success;
    }

    /**
     * Obtém descrição de uma ferramenta
     * 
     * @param {string} tool - Nome da ferramenta
     * @returns {string} Descrição
     */
    getToolDescription(tool) {
        const descriptions = {
            'write_file': 'Criar ou modificar arquivos',
            'search_replace': 'Modificar código existente',
            'read_file': 'Ler arquivos',
            'list_dir': 'Listar diretórios',
            'grep': 'Buscar padrões em arquivos',
            'run_terminal_cmd': 'Executar comandos no terminal',
            'codebase_search': 'Busca semântica no código',
        };

        return descriptions[tool] || `Ferramenta ${tool}`;
    }

    /**
     * Valida configuração do agente
     * 
     * @returns {boolean} true se válido
     */
    validateConfig() {
        if (!this.name) {
            throw new Error('Agent name is required');
        }

        if (!this.specialization) {
            log.warn('Agent has no specialization', { agent: this.name });
        }

        return true;
    }
}

export default BaseAgent;



