/**
 * Tree of Thoughts (ToT) Framework Implementation
 * 
 * Framework para raciocínio explorando múltiplas linhas de pensamento
 * Baseado em "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"
 * (Yao et al., 2023)
 * 
 * Pattern: Gera múltiplas "thoughts" -> Avalia -> Expande melhores -> Repete
 */

import { logger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const log = logger.child({ module: 'tree_of_thoughts' });

/**
 * Representa um nó na árvore de pensamentos
 */
class ThoughtNode {
    constructor(thought, parent = null, score = 0) {
        this.thought = thought;
        this.parent = parent;
        this.children = [];
        this.score = score;
        this.depth = parent ? parent.depth + 1 : 0;
    }

    addChild(child) {
        this.children.push(child);
    }
}

/**
 * Avalia a qualidade de um pensamento
 */
async function evaluateThought(thought, evaluator, context) {
    const startTime = Date.now();
    log.debug('Avaliando pensamento', { thought: thought.substring(0, 100) });

    try {
        const evaluation = await evaluator(thought, context);
        const duration = Date.now() - startTime;

        metrics.recordPerformance('tot_evaluate', duration, {
            success: true,
        });

        return {
            score: evaluation.score || 0,
            reasoning: evaluation.reasoning || '',
            duration,
        };
    } catch (error) {
        log.error('Erro ao avaliar pensamento', { error: error.message });
        return {
            score: 0,
            reasoning: `Erro: ${error.message}`,
            duration: Date.now() - startTime,
        };
    }
}

/**
 * Gera múltiplas linhas de pensamento
 */
async function generateThoughts(problem, currentThoughts, generator, numThoughts = 5) {
    const startTime = Date.now();
    log.debug('Gerando pensamentos', { numThoughts, problem: problem.substring(0, 100) });

    try {
        const prompt = `Problem: ${problem}\n\n`;
        const promptContext = currentThoughts.length > 0 
            ? `Current thoughts:\n${currentThoughts.map((t, i) => `${i + 1}. ${t.thought}`).join('\n')}\n\n`
            : '';
        const fullPrompt = `${prompt}${promptContext}Generate ${numThoughts} different approaches or lines of reasoning to solve this problem. Be creative and diverse. Number each approach:\n\n`;

        const response = await generator(fullPrompt);
        const thoughts = parseMultipleThoughts(response, numThoughts);

        const duration = Date.now() - startTime;
        metrics.recordPerformance('tot_generate', duration, {
            numThoughts: thoughts.length,
            success: true,
        });

        log.debug('Pensamentos gerados', { count: thoughts.length });
        return thoughts;
    } catch (error) {
        log.error('Erro ao gerar pensamentos', { error: error.message });
        return [];
    }
}

/**
 * Parse múltiplos pensamentos da resposta do LLM
 */
function parseMultipleThoughts(text, expectedCount) {
    const thoughts = [];
    const lines = text.split('\n');

    for (const line of lines) {
        // Procura por padrões: "1. thought", "1) thought", "- thought"
        const match = line.match(/^\s*(?:\d+[.)]|\-|\*)\s+(.+)$/);
        if (match) {
            thoughts.push(match[1].trim());
        }
    }

    // Se não encontrou pensamentos numerados, tenta dividir por parágrafos
    if (thoughts.length === 0) {
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
        thoughts.push(...paragraphs.slice(0, expectedCount).map(p => p.trim()));
    }

    return thoughts.slice(0, expectedCount);
}

/**
 * Seleciona os melhores pensamentos baseado em score
 */
function selectBestThoughts(nodes, numToSelect) {
    const sorted = [...nodes].sort((a, b) => b.score - a.score);
    return sorted.slice(0, numToSelect);
}

/**
 * Expande um pensamento em sub-pensamentos
 */
async function expandThought(thought, problem, generator, numExpansions = 3) {
    log.debug('Expandindo pensamento', { thought: thought.substring(0, 100) });

    const prompt = `Problem: ${problem}\n\n`;
    const promptContext = `Current approach: ${thought}\n\n`;
    const fullPrompt = `${prompt}${promptContext}Based on this approach, generate ${numExpansions} more specific or refined steps or sub-approaches. Number each:\n\n`;

    try {
        const response = await generator(fullPrompt);
        const expansions = parseMultipleThoughts(response, numExpansions);
        return expansions;
    } catch (error) {
        log.error('Erro ao expandir pensamento', { error: error.message });
        return [];
    }
}

/**
 * Executa Tree of Thoughts completo
 * 
 * @param {Function} llmGenerator - Função que gera pensamentos via LLM
 * @param {Function} llmEvaluator - Função que avalia pensamentos via LLM
 * @param {string} problem - Problema a resolver
 * @param {Object} options - Opções de configuração
 * @returns {Promise<Object>} Resultado com melhor solução e árvore de pensamentos
 */
export async function runTreeOfThoughts(
    llmGenerator,
    llmEvaluator,
    problem,
    options = {}
) {
    const {
        maxDepth = 3,
        numThoughtsPerLevel = 5,
        numBestToKeep = 3,
        numExpansions = 3,
        minScore = 0.5,
    } = options;

    log.info('Iniciando Tree of Thoughts', { 
        problem: problem.substring(0, 100), 
        maxDepth,
        numThoughtsPerLevel 
    });

    const startTime = Date.now();
    const root = new ThoughtNode('Initial problem', null, 1);
    let currentLevel = [root];
    let bestSolution = null;
    let bestScore = 0;

    // Nível por nível
    for (let depth = 0; depth < maxDepth; depth++) {
        log.info(`Explorando nível ${depth + 1}/${maxDepth}`, { 
            nodes: currentLevel.length 
        });

        const nextLevel = [];

        // Para cada nó no nível atual
        for (const node of currentLevel) {
            // Gera pensamentos filhos
            const thoughts = await generateThoughts(
                problem,
                currentLevel.map(n => ({ thought: n.thought })),
                llmGenerator,
                numThoughtsPerLevel
            );

            // Cria nós filhos e avalia
            for (const thought of thoughts) {
                const childNode = new ThoughtNode(thought, node);
                
                // Avalia o pensamento
                const evaluation = await evaluateThought(
                    thought,
                    llmEvaluator,
                    { problem, parentThought: node.thought }
                );

                childNode.score = evaluation.score;
                node.addChild(childNode);

                // Se é uma solução completa (score alto), pode ser a melhor
                if (evaluation.score >= minScore && evaluation.score > bestScore) {
                    bestScore = evaluation.score;
                    bestSolution = {
                        thought,
                        score: evaluation.score,
                        reasoning: evaluation.reasoning,
                        path: getPathToRoot(childNode),
                    };
                }

                // Se ainda não chegou no máximo, adiciona para próxima expansão
                if (depth < maxDepth - 1 && evaluation.score >= minScore) {
                    nextLevel.push(childNode);
                }
            }
        }

        // Seleciona os melhores para expandir no próximo nível
        if (nextLevel.length > 0 && depth < maxDepth - 1) {
            currentLevel = selectBestThoughts(nextLevel, numBestToKeep);
            log.info('Melhores pensamentos selecionados', { 
                count: currentLevel.length,
                scores: currentLevel.map(n => n.score)
            });
        } else {
            break;
        }
    }

    // Se não encontrou solução durante exploração, usa melhor do último nível
    if (!bestSolution && currentLevel.length > 0) {
        const best = selectBestThoughts(currentLevel, 1)[0];
        if (best) {
            bestSolution = {
                thought: best.thought,
                score: best.score,
                reasoning: '',
                path: getPathToRoot(best),
            };
        }
    }

    const duration = Date.now() - startTime;
    const treeStructure = buildTreeStructure(root);

    metrics.recordPerformance('tot_complete', duration, {
        maxDepth,
        finalNodes: countNodes(root),
        bestScore: bestSolution?.score || 0,
        success: !!bestSolution,
    });

    log.info('Tree of Thoughts concluído', { 
        depth: maxDepth,
        nodesExplored: countNodes(root),
        bestScore: bestSolution?.score || 0,
        duration 
    });

    return {
        solution: bestSolution,
        tree: treeStructure,
        nodesExplored: countNodes(root),
        depth: maxDepth,
        duration,
        success: !!bestSolution,
    };
}

/**
 * Obtém caminho da raiz até um nó
 */
function getPathToRoot(node) {
    const path = [];
    let current = node;
    while (current) {
        path.unshift(current.thought);
        current = current.parent;
    }
    return path;
}

/**
 * Constrói estrutura da árvore para retorno
 */
function buildTreeStructure(node, maxDepth = 10, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
        return { thought: node.thought.substring(0, 100) + '...', truncated: true };
    }

    return {
        thought: node.thought,
        score: node.score,
        depth: node.depth,
        children: node.children.slice(0, 3).map(child => 
            buildTreeStructure(child, maxDepth, currentDepth + 1)
        ),
        totalChildren: node.children.length,
    };
}

/**
 * Conta nós na árvore
 */
function countNodes(node) {
    let count = 1;
    for (const child of node.children) {
        count += countNodes(child);
    }
    return count;
}

/**
 * Cria prompt de avaliação para o LLM
 */
export function createEvaluationPrompt(thought, problem, context = {}) {
    let prompt = `Evaluate the following approach to solving this problem:\n\n`;
    prompt += `Problem: ${problem}\n\n`;
    prompt += `Approach: ${thought}\n\n`;
    
    if (context.parentThought) {
        prompt += `This approach builds on: ${context.parentThought}\n\n`;
    }

    prompt += `Rate this approach from 0.0 to 1.0 based on:\n`;
    prompt += `- Feasibility (can it be done?)\n`;
    prompt += `- Effectiveness (will it solve the problem well?)\n`;
    prompt += `- Completeness (is it a full solution?)\n\n`;
    prompt += `Respond with:\n`;
    prompt += `Score: <0.0-1.0>\n`;
    prompt += `Reasoning: <brief explanation>\n\n`;

    return prompt;
}

export default {
    runTreeOfThoughts,
    createEvaluationPrompt,
    ThoughtNode,
};























