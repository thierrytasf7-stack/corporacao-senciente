/**
 * ReAct Framework Implementation
 * 
 * Reasoning + Acting Framework para agentes autônomos
 * Implementação baseada no padrão ReAct (Yao et al., 2022)
 * 
 * Pattern: Thought -> Action -> Observation -> Thought -> ...
 */

import { logger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const log = logger.child({ module: 'react_framework' });

/**
 * Executa uma ação e observa o resultado
 */
async function executeAction(action, tools = {}) {
    const startTime = Date.now();
    log.debug('Executando ação', { action: action.type });

    try {
        const tool = tools[action.type];
        if (!tool) {
            throw new Error(`Tool "${action.type}" não encontrada`);
        }

        const observation = await tool(action.params || {});
        const duration = Date.now() - startTime;

        metrics.recordPerformance('react_action', duration, {
            actionType: action.type,
            success: true,
        });

        return {
            success: true,
            observation,
            duration,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        log.error('Erro ao executar ação', { action: action.type, error: error.message });

        metrics.recordPerformance('react_action', duration, {
            actionType: action.type,
            success: false,
        });

        return {
            success: false,
            observation: `Erro: ${error.message}`,
            duration,
        };
    }
}

/**
 * Extrai ação do texto do modelo
 */
function parseAction(text) {
    // Procura por padrão: Action: <tipo> Params: <json>
    const actionMatch = text.match(/Action:\s*(\w+)/i);
    const paramsMatch = text.match(/Params:\s*(\{.*?\})/s);

    if (!actionMatch) {
        return null;
    }

    let params = {};
    if (paramsMatch) {
        try {
            params = JSON.parse(paramsMatch[1]);
        } catch (e) {
            log.warn('Erro ao parsear params da ação', { error: e.message });
        }
    }

    return {
        type: actionMatch[1],
        params,
    };
}

/**
 * Extrai pensamento do texto do modelo
 */
function parseThought(text) {
    const thoughtMatch = text.match(/Thought:\s*(.*?)(?=\nAction:|\nFinal Answer:|$)/s);
    return thoughtMatch ? thoughtMatch[1].trim() : null;
}

/**
 * Extrai resposta final do texto do modelo
 */
function parseFinalAnswer(text) {
    const answerMatch = text.match(/Final Answer:\s*(.*?)$/s);
    return answerMatch ? answerMatch[1].trim() : null;
}

/**
 * Executa um ciclo ReAct completo
 * 
 * @param {Function} llmCall - Função que chama o LLM
 * @param {Object} tools - Objeto com ferramentas disponíveis { toolName: async function(params) }
 * @param {string} question - Pergunta/objetivo inicial
 * @param {Object} options - Opções de configuração
 * @returns {Promise<Object>} Resultado com resposta final e histórico
 */
export async function runReAct(llmCall, tools, question, options = {}) {
    const {
        maxIterations = 10,
        maxIterationsWithoutProgress = 3,
        initialContext = '',
        onIteration = null, // Callback para cada iteração (permite early abandonment)
    } = options;

    log.info('Iniciando ciclo ReAct', { question: question.substring(0, 100), maxIterations });

    const history = [];
    let iteration = 0;
    let iterationsWithoutProgress = 0;
    let finalAnswer = null;

    let currentContext = initialContext || `Question: ${question}\n\n`;
    if (Object.keys(tools).length > 0) {
        currentContext += `Available Tools: ${Object.keys(tools).join(', ')}\n\n`;
    }
    currentContext += `You can use tools by responding with:\nThought: <your reasoning>\nAction: <tool_name>\nParams: <json_params>\n\nOr provide a Final Answer:\nFinal Answer: <your answer>\n\n`;

    const startTime = Date.now();

    while (iteration < maxIterations && !finalAnswer) {
        iteration++;
        log.debug(`Iteração ReAct ${iteration}`, { iteration });

        // Callback de iteração (para early abandonment)
        if (onIteration) {
            const callbackResult = await onIteration(iteration, history);
            if (callbackResult?.shouldAbort) {
                log.info('ReAct abortado por callback', { iteration });
                break;
            }
        }

        // Chama LLM com contexto atual
        const prompt = `${currentContext}\nThought:`;
        const llmResponse = await llmCall(prompt);

        // Parse da resposta
        const thought = parseThought(llmResponse);
        const action = parseAction(llmResponse);
        const answer = parseFinalAnswer(llmResponse);

        if (answer) {
            finalAnswer = answer;
            history.push({
                iteration,
                type: 'final_answer',
                content: answer,
            });
            break;
        }

        if (!thought || !action) {
            log.warn('Resposta do LLM não seguiu padrão ReAct', { 
                iteration, 
                response: llmResponse.substring(0, 200) 
            });
            iterationsWithoutProgress++;
            
            if (iterationsWithoutProgress >= maxIterationsWithoutProgress) {
                log.warn('Muitas iterações sem progresso, finalizando');
                break;
            }
            continue;
        }

        // Executa ação
        history.push({
            iteration,
            type: 'thought',
            content: thought,
        });

        history.push({
            iteration,
            type: 'action',
            action: action.type,
            params: action.params,
        });

        const actionResult = await executeAction(action, tools);

        history.push({
            iteration,
            type: 'observation',
            content: actionResult.observation,
            success: actionResult.success,
        });

        // Atualiza contexto para próxima iteração
        currentContext += `Thought: ${thought}\n`;
        currentContext += `Action: ${action.type}\n`;
        if (Object.keys(action.params || {}).length > 0) {
            currentContext += `Params: ${JSON.stringify(action.params)}\n`;
        }
        currentContext += `Observation: ${actionResult.observation}\n\n`;

        iterationsWithoutProgress = 0;
    }

    const duration = Date.now() - startTime;

    if (!finalAnswer && iteration >= maxIterations) {
        log.warn('ReAct atingiu máximo de iterações sem resposta final', { iterations: iteration });
        finalAnswer = history[history.length - 1]?.content || 'Não foi possível chegar a uma resposta final.';
    }

    metrics.recordPerformance('react_cycle', duration, {
        iterations: iteration,
        success: !!finalAnswer,
        historyLength: history.length,
    });

    log.info('Ciclo ReAct concluído', { 
        iterations: iteration, 
        success: !!finalAnswer, 
        duration 
    });

    return {
        answer: finalAnswer,
        history,
        iterations: iteration,
        success: !!finalAnswer,
        duration,
    };
}

/**
 * Cria um prompt formatado para ReAct
 */
export function createReActPrompt(question, availableTools = [], context = '') {
    let prompt = context ? `${context}\n\n` : '';
    prompt += `Question: ${question}\n\n`;

    if (availableTools.length > 0) {
        prompt += `Available Tools:\n`;
        availableTools.forEach(tool => {
            prompt += `- ${tool.name}: ${tool.description}\n`;
        });
        prompt += `\n`;
    }

    prompt += `You must respond in the following format:\n`;
    prompt += `Thought: <your reasoning about what to do>\n`;
    prompt += `Action: <tool_name or "none">\n`;
    prompt += `Params: <json object with parameters>\n\n`;
    prompt += `When you have enough information, provide:\n`;
    prompt += `Final Answer: <your complete answer>\n\n`;
    prompt += `Let's begin:\nThought:`;

    return prompt;
}

export default {
    runReAct,
    createReActPrompt,
    parseAction,
    parseThought,
    parseFinalAnswer,
};
