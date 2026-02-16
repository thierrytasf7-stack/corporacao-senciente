#!/usr/bin/env node
/**
 * Brain Prompt Generator
 * 
 * Gera prompts estruturados do Brain para incorporação no chat/IDE
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { logger } from '../utils/logger.js';
import { getMemory } from './memory.js';
import { getPromptCache } from './prompt_cache.js';
import { getRouter } from './router.js';

const log = logger.child({ module: 'brain_prompt_generator' });

/**
 * Brain Prompt Generator
 */
class BrainPromptGenerator {
    constructor() {
        this.router = getRouter();
        this.memory = getMemory();
        this.llbProtocol = getLLBProtocol();
        this.cache = getPromptCache();
    }

    /**
     * Gera prompt estruturado do Brain
     * 
     * @param {string|object} task - Tarefa a processar
     * @param {object} context - Contexto adicional
     * @returns {Promise<string>} Prompt estruturado
     */
    async generateBrainPrompt(task, context = {}) {
        const taskDescription = typeof task === 'string' ? task : task.task || task.description || '';
        const cacheKey = `brain:${taskDescription}`;

        log.info('Generating Brain prompt', {
            task: taskDescription.substring(0, 100),
            cacheKey: cacheKey.substring(0, 50)
        });

        try {
            // 0. Verificar cache primeiro
            const cachedResult = this.cache.get(cacheKey, { task, context });
            if (cachedResult) {
                log.info('Using cached Brain prompt', {
                    hash: cachedResult.hash,
                    successRate: cachedResult.metadata?.successRate
                });
                return cachedResult.result;
            }

            // 1. Verificar similaridade se não encontrou exato
            const similarResult = this.cache.getSimilar(cacheKey, { task, context });
            if (similarResult) {
                log.info('Using similar cached Brain prompt', {
                    similarity: similarResult.similarity?.toFixed(3),
                    hash: similarResult.hash
                });
                return similarResult.result;
            }

            // 2. Buscar contexto via Protocolo L.L.B. (Letta, LangMem, ByteRover)
            const llbContext = await this.llbProtocol.getFullContext(taskDescription);

            // 2. Iniciar sessão L.L.B. (substitui consulta ao Jira)
            const session = await this.llbProtocol.startSession();

            // 2. Buscar memória (decisões similares)
            const similarDecisions = await this.memory.getSimilarDecisions(taskDescription, 5);

            // 3. Usar Router para encontrar melhor agente
            const routing = await this.router.findBestAgent(taskDescription, context);

            // 4. Construir contexto completo usando L.L.B.
            const brainContext = {
                state: session.state, // Do Letta
                wisdom: llbContext.wisdom.slice(0, 3).map(k => ({
                    content: k.content,
                    category: k.category,
                    similarity: k.similarity
                })),
                timeline: llbContext.timeline.slice(0, 3), // Do ByteRover
                similarDecisions: similarDecisions.slice(0, 3).map(d => ({
                    agent: d.agent_name,
                    task: d.task_description?.substring(0, 100),
                    similarity: d.similarity
                })),
                routing: {
                    primaryAgent: routing.primaryAgent,
                    score: routing.primaryScore,
                    reasoning: routing.reasoning,
                    orchestration: routing.orchestration
                },
                nextStep: session.nextStep // Do Letta
            };

            // 5. Gerar prompt estruturado
            const prompt = this.buildPrompt(taskDescription, brainContext, llbContext);

            // 6. Armazenar no cache
            this.cache.store(cacheKey, { task, context }, prompt, {
                successRate: 0.85, // Valor conservador para Brain prompts
                source: 'brain.generateBrainPrompt',
                agent: routing.primaryAgent,
                llbContext: !!llbContext
            });

            log.debug('Brain prompt generated and cached', {
                length: prompt.length,
                agent: routing.primaryAgent,
                hash: this.cache.generatePromptHash(cacheKey, { task, context })
            });

            return prompt;
        } catch (err) {
            log.error('Error generating Brain prompt', { error: err.message });
            // Fallback: prompt básico
            return this.buildFallbackPrompt(taskDescription);
        }
    }

    /**
     * Constrói prompt estruturado completo
     * 
     * @param {string} task - Descrição da task
     * @param {object} brainContext - Contexto do Brain
     * @param {object} llbContext - Contexto do Protocolo L.L.B.
     * @returns {string} Prompt estruturado
     */
    buildPrompt(task, brainContext, llbContext) {
        const state = brainContext.state || {};
        const routing = brainContext.routing || {};
        const nextStep = brainContext.nextStep || {};

        return `Você é o **Brain** da Corporação Senciente 7.0, o orquestrador central que coordena todos os agentes.

## CONTEXTO COMPLETO

### Estado Atual (Letta - Substitui Jira)
${this.formatState(state)}
${nextStep.action ? `\n**Próximo Passo Evolutivo:** ${nextStep.description || nextStep.action}` : ''}

### Sabedoria Arquitetural (LangMem)
${brainContext.wisdom && brainContext.wisdom.length > 0
                ? brainContext.wisdom.map(w => `- **${w.category}**: ${w.content.substring(0, 150)}${w.content.length > 150 ? '...' : ''} (similaridade: ${(w.similarity * 100).toFixed(1)}%)`).join('\n')
                : 'Nenhuma sabedoria específica encontrada'}

### Decisões Similares (Memória)
${brainContext.similarDecisions && brainContext.similarDecisions.length > 0
                ? brainContext.similarDecisions.map(d => `- **${d.agent}**: ${d.task} (similaridade: ${(d.similarity * 100).toFixed(1)}%)`).join('\n')
                : 'Nenhuma decisão similar encontrada'}

### Timeline Evolutiva (ByteRover - Substitui GitKraken)
${brainContext.timeline && brainContext.timeline.length > 0
                ? brainContext.timeline.slice(0, 3).map(t => `- **${t.type}** (${t.date}): ${t.message.substring(0, 80)}`).join('\n')
                : 'Nenhum commit recente'}

## TASK PRINCIPAL
${task}

## ANÁLISE DO BRAIN

### Agente Selecionado
**Agente:** ${routing.primaryAgent || 'Não determinado'}
**Score de Confiança:** ${routing.score ? (routing.score * 100).toFixed(1) + '%' : 'N/A'}
**Razão:** ${routing.reasoning || 'Análise em andamento'}

${routing.orchestration?.needed
                ? `### Orquestração Necessária
Esta task requer múltiplos agentes:
${routing.orchestration.subtasks?.map((st, i) => `${i + 1}. **${st.agent}**: ${st.description}`).join('\n') || 'Orquestração planejada'}
`
                : ''}

### Alternativas Consideradas
${routing.alternatives && routing.alternatives.length > 0
                ? routing.alternatives.map(a => `- **${a.name}** (score: ${(a.score * 100).toFixed(1)}%): ${a.reasoning}`).join('\n')
                : 'Nenhuma alternativa relevante'}

## DELEGAÇÃO

O melhor agente para esta task é: **${routing.primaryAgent || 'A determinar'}**

**Próximo Passo:**
Incorpore o agente **${routing.primaryAgent || 'selecionado'}** no chat com a seguinte task específica:

\`\`\`
${this.buildAgentTask(task, routing)}
\`\`\`

## INSTRUÇÕES PARA O CHAT

1. **Incorpore o agente** usando o Agent Prompt Generator
2. **Forneça o contexto completo** do Brain ao agente
3. **Monitore a execução** e ajuste se necessário
4. **Registre o resultado** na memória após conclusão

## FORMATO DE RESPOSTA ESPERADO

Após incorporar o agente, você deve receber um resultado estruturado:

\`\`\`json
{
  "agent": "${routing.primaryAgent || 'agente'}",
  "result": "Descrição do resultado",
  "actions": ["ação1", "ação2"],
  "files_modified": ["arquivo1.js"],
  "next_steps": ["próximo passo"]
}
\`\`\`

---

**Brain Session iniciada em:** ${new Date().toISOString()}
**Protocolo:** Chat/IDE - Incorporação via Prompts`;
    }

    /**
     * Formata estado do sistema
     */
    formatState(state) {
        if (!state || Object.keys(state).length === 0) {
            return 'Estado não disponível';
        }

        const parts = [];

        if (state.tempo) {
            parts.push(`- **Tempo**: Última atividade há ${state.tempo.recencia || 'N/A'} horas`);
        }

        if (state.decisao) {
            parts.push(`- **Decisões Pendentes**: ${state.decisao.issues_pendentes || 0} issues, ${state.decisao.tasks_pendentes || 0} tasks`);
        }

        if (state.presenca) {
            parts.push(`- **Agentes Ativos**: ${state.presenca.agentes_ativos || 0}`);
        }

        return parts.length > 0 ? parts.join('\n') : 'Estado básico disponível';
    }

    /**
     * Formata contexto do sistema (usando L.L.B.)
     */
    formatSystemContext(llbContext) {
        if (!llbContext) {
            return 'Contexto do sistema não disponível';
        }

        const parts = [];

        if (llbContext.state) {
            parts.push(`- **Fase Atual**: ${llbContext.state.current_phase || 'unknown'}`);
            parts.push(`- **Tasks Pendentes**: ${llbContext.state.next_steps?.length || 0}`);
            if (llbContext.state.blockages && llbContext.state.blockages.length > 0) {
                parts.push(`- **Bloqueios**: ${llbContext.state.blockages.length}`);
            }
        }

        return parts.length > 0 ? parts.join('\n') : 'Contexto básico disponível';
    }

    /**
     * Constrói task específica para o agente
     */
    buildAgentTask(task, routing) {
        if (routing.orchestration?.needed && routing.orchestration.subtasks) {
            // Se há orquestração, retornar primeira subtask
            const firstSubtask = routing.orchestration.subtasks[0];
            return `Task: ${firstSubtask.description}\nAgente: ${firstSubtask.agent}\nOrdem: ${firstSubtask.order}`;
        }

        return `Task: ${task}\nAgente: ${routing.primaryAgent || 'A determinar'}`;
    }

    /**
     * Prompt de fallback (básico)
     */
    buildFallbackPrompt(task) {
        return `Você é o **Brain** da Corporação Senciente 7.0.

## TASK
${task}

## ANÁLISE
Analisando task para determinar melhor agente...

## PRÓXIMO PASSO
Incorpore um agente apropriado para esta task.

**Nota:** Contexto completo não disponível no momento.`;
    }
}

// Singleton
let generatorInstance = null;

export function getBrainPromptGenerator() {
    if (!generatorInstance) {
        generatorInstance = new BrainPromptGenerator();
    }
    return generatorInstance;
}

export default BrainPromptGenerator;



