/**
 * Agente Integrado com Frameworks de Vanguarda
 * 
 * Combina ReAct, Tree of Thoughts e LLMs (Grok/Gemini)
 * para criar agentes poderosos e atualizados
 */

import { runReAct, createReActPrompt } from './react.js';
import { runTreeOfThoughts, createEvaluationPrompt } from './tree_of_thoughts.js';
import { callLLM, simpleLLMCall } from '../utils/llm_client.js';
import { logger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const log = logger.child({ module: 'integrated_agent' });

/**
 * Agente com ReAct para operações estruturadas
 */
export async function reactAgent(question, tools = {}, options = {}) {
    const {
        systemPrompt = 'Você é um agente autônomo inteligente. Use ferramentas disponíveis para resolver problemas.',
        temperature = 0.7,
        maxIterations = 10,
    } = options;

    log.info('Iniciando agente ReAct', { question: question.substring(0, 100) });

    const llmCall = async (prompt) => {
        return await callLLM(prompt, systemPrompt, temperature);
    };

    const result = await runReAct(llmCall, tools, question, { maxIterations });

    return result;
}

/**
 * Agente com Tree of Thoughts para decisões estratégicas
 */
export async function totAgent(problem, options = {}) {
    const {
        systemPrompt = 'Você é um agente estratégico especializado em resolver problemas complexos.',
        temperature = 0.8,
        maxDepth = 3,
        numThoughtsPerLevel = 5,
    } = options;

    log.info('Iniciando agente Tree of Thoughts', { problem: problem.substring(0, 100) });

    const llmGenerator = async (prompt) => {
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;
        return await callLLM(fullPrompt, '', temperature);
    };

    const llmEvaluator = async (thought, context) => {
        const evaluationPrompt = createEvaluationPrompt(thought, context.problem || problem, context);
        const fullPrompt = `${systemPrompt}\n\n${evaluationPrompt}`;
        const response = await callLLM(fullPrompt, '', temperature);

        // Parse resposta
        const scoreMatch = response.match(/Score:\s*([\d.]+)/i);
        const reasoningMatch = response.match(/Reasoning:\s*(.+?)(?:\n|$)/s);

        return {
            score: scoreMatch ? parseFloat(scoreMatch[1]) : 0.5,
            reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
        };
    };

    const result = await runTreeOfThoughts(
        llmGenerator,
        llmEvaluator,
        problem,
        { maxDepth, numThoughtsPerLevel }
    );

    return result;
}

/**
 * Agente Híbrido: ReAct para operações + ToT para decisões complexas
 */
export async function hybridAgent(question, tools = {}, options = {}) {
    const {
        useToT = false,
        totThreshold = 0.7, // Se complexidade > threshold, usa ToT
        ...reactOptions
    } = options;

    // Decide qual framework usar
    const complexity = estimateComplexity(question);

    if (useToT || complexity > totThreshold) {
        log.info('Usando Tree of Thoughts (alta complexidade)', { complexity });
        return await totAgent(question, options);
    } else {
        log.info('Usando ReAct (complexidade moderada)', { complexity });
        return await reactAgent(question, tools, reactOptions);
    }
}

/**
 * Estima complexidade de uma questão
 */
function estimateComplexity(question) {
    // Heurísticas simples
    let complexity = 0.3; // Base

    // Perguntas estratégicas
    if (/estratég|planej|decisão|arquitet|design|futuro/i.test(question)) {
        complexity += 0.3;
    }

    // Múltiplas partes
    const questionCount = (question.match(/\?/g) || []).length;
    complexity += questionCount * 0.1;

    // Tamanho
    if (question.length > 500) {
        complexity += 0.2;
    }

    // Palavras-chave complexas
    const complexKeywords = ['otimizar', 'maximizar', 'minimizar', 'balancear', 'trade-off'];
    complexKeywords.forEach(kw => {
        if (question.toLowerCase().includes(kw)) {
            complexity += 0.1;
        }
    });

    return Math.min(complexity, 1.0);
}

/**
 * Agente Especializado: Combina role específica com frameworks
 */
export async function specializedAgent(role, question, tools = {}, options = {}) {
    const {
        specialization = '',
        useToT = false,
        ...frameworkOptions
    } = options;

    const systemPrompt = `Você é um ${role} especializado.${specialization ? ` ${specialization}` : ''} 
Use seu conhecimento especializado para resolver problemas de forma eficiente e precisa.`;

    if (useToT) {
        return await totAgent(question, { ...frameworkOptions, systemPrompt });
    } else {
        return await reactAgent(question, tools, { ...frameworkOptions, systemPrompt });
    }
}

export default {
    reactAgent,
    totAgent,
    hybridAgent,
    specializedAgent,
};























