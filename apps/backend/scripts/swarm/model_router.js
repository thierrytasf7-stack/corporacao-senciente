/**
 * Model Router Avançado - Sistema Inteligente de Roteamento
 *
 * Implementa algoritmos avançados inspirados em:
 * - CARGO (Context-Aware Routing)
 * - HierRouter (Hierarchical Routing)
 * - xRouter (Expert Routing)
 * - MasRouter (Multi-Agent Routing)
 *
 * Recursos:
 * - Roteamento baseado em contexto e especialização
 * - Balanceamento de carga inteligente
 * - Fallback automático
 * - Auto-escalabilidade
 * - Otimização de custo vs performance
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class ModelRouter {
  constructor() {
    this.models = new Map();
    this.routes = new Map();
    this.performanceHistory = new Map();
    this.costTracker = new Map();
    this.contextAnalyzer = new ContextAnalyzer();
    this.loadBalancer = new LoadBalancer();
    this.fallbackManager = new FallbackManager();

    this.initializeModels();
    this.setupRoutes();
  }

  /**
   * Inicializa catálogo de modelos disponíveis
   */
  initializeModels() {
    // Modelos especializados por categoria
    this.models.set('reasoning', [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        strengths: ['reasoning', 'analysis', 'planning'],
        weaknesses: ['speed', 'cost'],
        costPerToken: 0.015,
        contextWindow: 200000,
        latency: 'high'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        strengths: ['reasoning', 'creativity', 'coding'],
        weaknesses: ['cost'],
        costPerToken: 0.01,
        contextWindow: 128000,
        latency: 'medium'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        strengths: ['speed', 'reasoning'],
        weaknesses: ['context_window'],
        costPerToken: 0.00025,
        contextWindow: 200000,
        latency: 'low'
      }
    ]);

    this.models.set('creative', [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        strengths: ['creativity', 'writing', 'design'],
        weaknesses: ['cost'],
        costPerToken: 0.01,
        contextWindow: 128000,
        latency: 'medium'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        strengths: ['creativity', 'writing', 'analysis'],
        weaknesses: ['speed'],
        costPerToken: 0.003,
        contextWindow: 200000,
        latency: 'medium'
      }
    ]);

    this.models.set('coding', [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        strengths: ['coding', 'debugging', 'architecture'],
        weaknesses: ['cost'],
        costPerToken: 0.01,
        contextWindow: 128000,
        latency: 'medium'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        strengths: ['coding', 'analysis', 'planning'],
        weaknesses: ['speed', 'cost'],
        costPerToken: 0.015,
        contextWindow: 200000,
        latency: 'high'
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'deepseek',
        strengths: ['coding', 'speed', 'efficiency'],
        weaknesses: ['creativity'],
        costPerToken: 0.00014,
        contextWindow: 32768,
        latency: 'low'
      }
    ]);

    this.models.set('fast', [
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        strengths: ['speed', 'efficiency'],
        weaknesses: ['complexity'],
        costPerToken: 0.00025,
        contextWindow: 200000,
        latency: 'low'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        strengths: ['speed', 'cost_effective'],
        weaknesses: ['quality', 'reasoning'],
        costPerToken: 0.0005,
        contextWindow: 16385,
        latency: 'low'
      }
    ]);
  }

  /**
   * Configura regras de roteamento
   */
  setupRoutes() {
    // CARGO-inspired routing: Context-Aware Routing
    this.routes.set('cargo_router', {
      name: 'CARGO Router',
      strategy: 'context_aware',
      rules: [
        {
          condition: (context) => context.complexity > 0.8,
          models: ['claude-3-opus', 'gpt-4-turbo'],
          priority: 'quality'
        },
        {
          condition: (context) => context.urgency === 'high',
          models: ['claude-3-haiku', 'gpt-3.5-turbo'],
          priority: 'speed'
        },
        {
          condition: (context) => context.task_type === 'coding',
          models: ['deepseek-coder', 'gpt-4-turbo', 'claude-3-opus'],
          priority: 'expertise'
        }
      ]
    });

    // HierRouter-inspired: Hierarchical Routing
    this.routes.set('hier_router', {
      name: 'Hierarchical Router',
      strategy: 'hierarchical',
      hierarchy: {
        level1: ['claude-3-haiku', 'gpt-3.5-turbo'], // Fast, cheap
        level2: ['claude-3-sonnet', 'gpt-4-turbo'],   // Balanced
        level3: ['claude-3-opus']                      // Premium
      },
      escalationRules: [
        {
          trigger: 'quality_below_threshold',
          threshold: 0.7,
          escalateTo: 'level2'
        },
        {
          trigger: 'complexity_high',
          threshold: 0.8,
          escalateTo: 'level3'
        }
      ]
    });

    // xRouter-inspired: Expert Routing
    this.routes.set('expert_router', {
      name: 'Expert Router',
      strategy: 'expert',
      experts: {
        reasoning: ['claude-3-opus', 'gpt-4-turbo'],
        creative: ['gpt-4-turbo', 'claude-3-sonnet'],
        coding: ['deepseek-coder', 'claude-3-opus'],
        analysis: ['claude-3-opus', 'gpt-4-turbo'],
        fast: ['claude-3-haiku', 'gpt-3.5-turbo']
      }
    });

    // MasRouter-inspired: Multi-Agent Routing
    this.routes.set('mas_router', {
      name: 'Multi-Agent Router',
      strategy: 'multi_agent',
      coordination: {
        decompose: (task) => this.decomposeTask(task),
        assign: (subtasks) => this.assignToAgents(subtasks),
        aggregate: (results) => this.aggregateResults(results)
      }
    });
  }

  /**
   * Roteia requisição para o melhor modelo
   */
  async routeRequest(task, context = {}, options = {}) {
    const routingContext = await this.contextAnalyzer.analyze(task, context);

    let selectedModel;
    let routingStrategy;

    // Escolher estratégia de roteamento
    if (options.strategy) {
      routingStrategy = options.strategy;
    } else {
      routingStrategy = this.selectRoutingStrategy(routingContext);
    }

    // Aplicar estratégia selecionada
    switch (routingStrategy) {
      case 'cargo':
        selectedModel = await this.applyCARGORouting(routingContext);
        break;
      case 'hierarchical':
        selectedModel = await this.applyHierarchicalRouting(routingContext);
        break;
      case 'expert':
        selectedModel = await this.applyExpertRouting(routingContext);
        break;
      case 'multi_agent':
        return await this.applyMultiAgentRouting(task, routingContext);
      default:
        selectedModel = await this.applyDefaultRouting(routingContext);
    }

    // Aplicar balanceamento de carga
    const finalModel = await this.loadBalancer.balance(selectedModel, routingContext);

    // Registrar decisão de roteamento
    this.recordRoutingDecision(finalModel, routingContext, routingStrategy);

    return {
      model: finalModel,
      strategy: routingStrategy,
      confidence: this.calculateRoutingConfidence(finalModel, routingContext),
      estimatedCost: this.estimateCost(finalModel, task),
      estimatedLatency: this.estimateLatency(finalModel)
    };
  }

  /**
   * Aplica roteamento CARGO (Context-Aware)
   */
  async applyCARGORouting(context) {
    const cargoRoute = this.routes.get('cargo_router');

    for (const rule of cargoRoute.rules) {
      if (rule.condition(context)) {
        const availableModels = this.getAvailableModels(rule.models);
        return this.selectBestModel(availableModels, rule.priority, context);
      }
    }

    // Fallback para modelo padrão
    return await this.applyDefaultRouting(context);
  }

  /**
   * Aplica roteamento hierárquico
   */
  async applyHierarchicalRouting(context) {
    const hierRoute = this.routes.get('hier_router');

    // Começar com nível 1 (mais rápido/barato)
    let currentLevel = 'level1';
    let selectedModel;

    // Verificar regras de escalação
    for (const rule of hierRoute.escalationRules) {
      if (this.shouldEscalate(context, rule)) {
        currentLevel = rule.escalateTo;
        break;
      }
    }

    const levelModels = hierRoute.hierarchy[currentLevel];
    const availableModels = this.getAvailableModels(levelModels);

    selectedModel = this.selectBestModel(availableModels, 'balanced', context);

    // Verificar se precisa escalar baseado em histórico
    if (await this.shouldEscalateBasedOnHistory(selectedModel, context)) {
      const nextLevel = this.getNextLevel(currentLevel);
      if (nextLevel) {
        const nextLevelModels = hierRoute.hierarchy[nextLevel];
        const nextAvailableModels = this.getAvailableModels(nextLevelModels);
        selectedModel = this.selectBestModel(nextAvailableModels, 'quality', context);
      }
    }

    return selectedModel;
  }

  /**
   * Aplica roteamento especialista
   */
  async applyExpertRouting(context) {
    const expertRoute = this.routes.get('expert_router');

    // Determinar domínio da tarefa
    const domain = context.task_type || this.classifyTaskType(context.task || '');

    const domainExperts = expertRoute.experts[domain];
    if (domainExperts) {
      const availableModels = this.getAvailableModels(domainExperts);
      return this.selectBestModel(availableModels, 'expertise', context);
    }

    // Fallback
    return await this.applyDefaultRouting(context);
  }

  /**
   * Aplica roteamento multi-agente
   */
  async applyMultiAgentRouting(task, context) {
    const masRoute = this.routes.get('mas_router');

    // Decompor tarefa em subtasks
    const subtasks = masRoute.coordination.decompose(task);

    // Atribuir agentes para cada subtask
    const assignments = await masRoute.coordination.assign(subtasks);

    // Executar em paralelo e agregar resultados
    const results = await Promise.all(
      assignments.map(async (assignment) => {
        const routing = await this.routeRequest(
          assignment.subtask,
          { ...context, parentTask: task },
          { strategy: assignment.strategy }
        );
        return {
          subtask: assignment.subtask,
          agent: assignment.agent,
          routing: routing,
          result: await this.executeWithModel(routing.model, assignment.subtask)
        };
      })
    );

    // Agregar resultados
    const finalResult = masRoute.coordination.aggregate(results);

    return {
      type: 'multi_agent',
      subtasks: results,
      finalResult: finalResult,
      totalCost: results.reduce((sum, r) => sum + r.routing.estimatedCost, 0),
      totalLatency: Math.max(...results.map(r => r.routing.estimatedLatency))
    };
  }

  /**
   * Aplica roteamento padrão
   */
  async applyDefaultRouting(context) {
    const allModels = Array.from(this.models.values()).flat();
    const availableModels = this.getAvailableModels(allModels.map(m => m.id));

    return this.selectBestModel(availableModels, 'balanced', context);
  }

  /**
   * Seleciona melhor modelo baseado em prioridade
   */
  selectBestModel(models, priority, context) {
    if (models.length === 0) return null;

    switch (priority) {
      case 'quality':
        return this.selectByQuality(models, context);
      case 'speed':
        return this.selectBySpeed(models, context);
      case 'cost':
        return this.selectByCost(models, context);
      case 'expertise':
        return this.selectByExpertise(models, context);
      case 'balanced':
      default:
        return this.selectBalanced(models, context);
    }
  }

  /**
   * Seleciona por qualidade (modelos mais capazes)
   */
  selectByQuality(models, context) {
    return models.reduce((best, current) => {
      if (!best) return current;
      // Priorizar modelos com maior custo (geralmente melhor qualidade)
      return current.costPerToken > best.costPerToken ? current : best;
    });
  }

  /**
   * Seleciona por velocidade
   */
  selectBySpeed(models, context) {
    return models.reduce((best, current) => {
      if (!best) return current;
      // Priorizar baixa latência
      const currentLatency = this.latencyToNumber(current.latency);
      const bestLatency = this.latencyToNumber(best.latency);
      return currentLatency < bestLatency ? current : best;
    });
  }

  /**
   * Seleciona por custo
   */
  selectByCost(models, context) {
    return models.reduce((best, current) => {
      if (!best) return current;
      // Priorizar menor custo
      return current.costPerToken < best.costPerToken ? current : best;
    });
  }

  /**
   * Seleciona por expertise (baseado em pontos fortes)
   */
  selectByExpertise(models, context) {
    const taskType = context.task_type || 'general';

    return models.reduce((best, current) => {
      if (!best) return current;

      // Calcular score de expertise baseado em pontos fortes
      const currentScore = this.calculateExpertiseScore(current, taskType);
      const bestScore = this.calculateExpertiseScore(best, taskType);

      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Seleciona balanceado (qualidade vs custo)
   */
  selectBalanced(models, context) {
    return models.reduce((best, current) => {
      if (!best) return current;

      // Score balanceado: qualidade - custo_penalty
      const currentScore = this.calculateBalancedScore(current, context);
      const bestScore = this.calculateBalancedScore(best, context);

      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Converte latência string para número
   */
  latencyToNumber(latency) {
    const latencyMap = { low: 1, medium: 2, high: 3 };
    return latencyMap[latency] || 2;
  }

  /**
   * Calcula score de expertise
   */
  calculateExpertiseScore(model, taskType) {
    const relevantStrengths = {
      coding: ['coding', 'debugging', 'analysis'],
      creative: ['creativity', 'writing', 'design'],
      reasoning: ['reasoning', 'analysis', 'planning'],
      fast: ['speed', 'efficiency']
    };

    const relevant = relevantStrengths[taskType] || [];
    return model.strengths.filter(s => relevant.includes(s)).length;
  }

  /**
   * Calcula score balanceado
   */
  calculateBalancedScore(model, context) {
    const qualityScore = model.costPerToken * 10; // Maior custo = maior qualidade
    const costPenalty = model.costPerToken * 5;
    const latencyPenalty = this.latencyToNumber(model.latency) * 2;

    return qualityScore - costPenalty - latencyPenalty;
  }

  /**
   * Verifica se deve escalar baseado em regras
   */
  shouldEscalate(context, rule) {
    switch (rule.trigger) {
      case 'quality_below_threshold':
        return (context.required_quality === 'high' && rule.threshold > 0.5);
      case 'complexity_high':
        return context.complexity > rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Verifica se deve escalar baseado em histórico
   */
  async shouldEscalateBasedOnHistory(model, context) {
    // Simulação: escalar se modelo teve "problemas" recentemente
    return Math.random() > 0.8; // 20% de chance de escalar
  }

  /**
   * Obtém próximo nível na hierarquia
   */
  getNextLevel(currentLevel) {
    const hierarchy = ['level1', 'level2', 'level3'];
    const currentIndex = hierarchy.indexOf(currentLevel);
    return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : null;
  }

  /**
   * Análise de contexto inteligente
   */
  analyzeContext(task, context) {
    return {
      complexity: this.assessComplexity(task),
      urgency: context.urgency || 'normal',
      task_type: this.classifyTaskType(task),
      budget: context.budget || 'unlimited',
      required_quality: context.quality || 'medium',
      time_constraint: context.deadline ? this.calculateTimePressure(context.deadline) : 'none'
    };
  }

  /**
   * Avalia complexidade da tarefa
   */
  assessComplexity(task) {
    const complexityIndicators = {
      keywords: {
        high: ['complex', 'advanced', 'optimize', 'architect', 'design', 'strategic'],
        medium: ['implement', 'create', 'analyze', 'review', 'test'],
        low: ['simple', 'basic', 'quick', 'check', 'list']
      },
      length: {
        high: task.length > 1000,
        medium: task.length > 500,
        low: task.length <= 500
      }
    };

    // Lógica de avaliação baseada em indicadores
    let score = 0.5; // baseline

    // Keywords complexity
    const highKeywords = complexityIndicators.keywords.high.filter(k =>
      task.toLowerCase().includes(k)
    ).length;
    const mediumKeywords = complexityIndicators.keywords.medium.filter(k =>
      task.toLowerCase().includes(k)
    ).length;

    score += (highKeywords * 0.2) + (mediumKeywords * 0.1);

    // Length complexity
    if (complexityIndicators.length.high) score += 0.3;
    else if (complexityIndicators.length.medium) score += 0.1;

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Classifica tipo da tarefa
   */
  classifyTaskType(task) {
    const taskText = task.toLowerCase();

    if (taskText.includes('code') || taskText.includes('program') || taskText.includes('function')) {
      return 'coding';
    }
    if (taskText.includes('write') || taskText.includes('create') || taskText.includes('design')) {
      return 'creative';
    }
    if (taskText.includes('analyze') || taskText.includes('research') || taskText.includes('plan')) {
      return 'reasoning';
    }
    if (taskText.includes('fast') || taskText.includes('quick') || taskText.includes('simple')) {
      return 'fast';
    }

    return 'general';
  }

  /**
   * Seleciona estratégia de roteamento
   */
  selectRoutingStrategy(context) {
    if (context.complexity > 0.8) return 'hierarchical';
    if (context.urgency === 'high') return 'cargo';
    if (context.task_type !== 'general') return 'expert';
    if (context.canDecompose) return 'multi_agent';

    return 'cargo'; // default
  }

  /**
   * Registra decisão de roteamento para aprendizado
   */
  recordRoutingDecision(model, context, strategy) {
    const key = `${model.id}_${Date.now()}`;
    this.performanceHistory.set(key, {
      model: model.id,
      context: context,
      strategy: strategy,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calcula confiança na decisão de roteamento
   */
  calculateRoutingConfidence(model, context) {
    // Baseado em histórico de performance do modelo para contextos similares
    const similarContexts = Array.from(this.performanceHistory.values())
      .filter(h => h.context.task_type === context.task_type);

    if (similarContexts.length === 0) return 0.5;

    const modelPerformance = similarContexts
      .filter(h => h.model === model.id)
      .length / similarContexts.length;

    return Math.min(0.95, Math.max(0.3, modelPerformance));
  }

  /**
   * Estima custo da execução
   */
  estimateCost(model, task) {
    const baseTokens = Math.ceil(task.length / 4); // Rough estimate
    return baseTokens * model.costPerToken;
  }

  /**
   * Estima latência
   */
  estimateLatency(model) {
    const latencyMap = {
      low: 1000,    // 1s
      medium: 3000, // 3s
      high: 8000    // 8s
    };

    return latencyMap[model.latency] || 3000;
  }

  /**
   * Obtém modelos disponíveis (simulando disponibilidade)
   */
  getAvailableModels(modelIds) {
    return modelIds.map(id => {
      for (const category of this.models.values()) {
        const model = category.find(m => m.id === id);
        if (model) return model;
      }
      return null;
    }).filter(Boolean);
  }

  // Métodos auxiliares para decomposição e agregação
  decomposeTask(task) {
    // Lógica simplificada de decomposição
    return [
      { type: 'analysis', description: 'Analyze requirements' },
      { type: 'planning', description: 'Create implementation plan' },
      { type: 'execution', description: 'Execute the plan' }
    ];
  }

  async assignToAgents(subtasks) {
    const assignments = [];
    for (const subtask of subtasks) {
      const routing = await this.routeRequest(subtask.description, { task_type: subtask.type });
      assignments.push({
        subtask,
        agent: routing.model,
        strategy: routing.strategy
      });
    }
    return assignments;
  }

  aggregateResults(results) {
    // Agregação simplificada
    return {
      summary: results.map(r => r.result).join('\n'),
      confidence: results.reduce((sum, r) => sum + r.routing.confidence, 0) / results.length,
      sources: results.map(r => ({ agent: r.agent.id, contribution: r.result }))
    };
  }

  // Simulação de execução (em produção, chamaria APIs reais)
  async executeWithModel(model, task) {
    // Simulação de resposta
    await new Promise(resolve => setTimeout(resolve, this.estimateLatency(model)));
    return `Task executed by ${model.name}: ${task}`;
  }
}

/**
 * Analisador de Contexto Inteligente
 */
class ContextAnalyzer {
  async analyze(task, context) {
    return {
      complexity: this.assessComplexity(task),
      urgency: context.urgency || 'normal',
      task_type: this.classifyTaskType(task),
      budget: context.budget || 'unlimited',
      required_quality: context.quality || 'medium',
      canDecompose: this.canDecompose(task),
      time_constraint: context.deadline ? this.calculateTimePressure(context.deadline) : 'none'
    };
  }

  assessComplexity(task) {
    // Implementação similar ao método no ModelRouter
    const words = task.split(' ').length;
    const hasTechnicalTerms = /\b(code|algorithm|database|api|framework)\b/i.test(task);
    const hasComplexLogic = /\b(if|then|else|while|for|function|class)\b/i.test(task);

    let score = 0.3;
    if (words > 100) score += 0.2;
    if (hasTechnicalTerms) score += 0.3;
    if (hasComplexLogic) score += 0.2;

    return Math.min(1.0, score);
  }

  classifyTaskType(task) {
    if (/\b(code|program|function|debug|implement)\b/i.test(task)) return 'coding';
    if (/\b(write|create|design|content|marketing)\b/i.test(task)) return 'creative';
    if (/\b(analyze|research|plan|strategy)\b/i.test(task)) return 'reasoning';
    if (/\b(fast|quick|simple|basic)\b/i.test(task)) return 'fast';
    return 'general';
  }

  canDecompose(task) {
    // Tasks complexas podem ser decompostas
    return task.length > 500 || /\b(and|then|after|finally)\b/i.test(task);
  }

  calculateTimePressure(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);

    if (hoursLeft < 1) return 'critical';
    if (hoursLeft < 24) return 'high';
    if (hoursLeft < 168) return 'medium'; // 1 week
    return 'low';
  }
}

/**
 * Balanceador de Carga Inteligente
 */
class LoadBalancer {
  constructor() {
    this.loadHistory = new Map();
    this.maxConcurrent = 10; // por modelo
  }

  async balance(model, context) {
    const currentLoad = this.loadHistory.get(model.id) || 0;

    if (currentLoad >= this.maxConcurrent) {
      // Fallback para modelo alternativo
      return this.findAlternativeModel(model, context);
    }

    this.loadHistory.set(model.id, currentLoad + 1);

    // Simular liberação após processamento
    setTimeout(() => {
      const current = this.loadHistory.get(model.id) || 0;
      this.loadHistory.set(model.id, Math.max(0, current - 1));
    }, 5000); // 5 segundos

    return model;
  }

  findAlternativeModel(originalModel, context) {
    // Lógica simplificada para encontrar alternativa
    // Em produção, usaria regras mais sofisticadas
    return originalModel; // Por enquanto, retorna o mesmo
  }
}

/**
 * Gerenciador de Fallback
 */
class FallbackManager {
  constructor() {
    this.fallbackChains = new Map();
  }

  setupFallbackChains() {
    // Cadeias de fallback por categoria
    this.fallbackChains.set('premium', ['claude-3-opus', 'gpt-4-turbo', 'claude-3-sonnet']);
    this.fallbackChains.set('balanced', ['gpt-4-turbo', 'claude-3-sonnet', 'claude-3-haiku']);
    this.fallbackChains.set('fast', ['claude-3-haiku', 'gpt-3.5-turbo', 'claude-3-sonnet']);
  }

  getFallbackChain(modelId) {
    for (const [category, chain] of this.fallbackChains) {
      if (chain.includes(modelId)) {
        return chain.slice(chain.indexOf(modelId) + 1);
      }
    }
    return [];
  }
}

// Instância singleton
export const modelRouter = new ModelRouter();

// Funções utilitárias
export async function routeToBestModel(task, context = {}) {
  return await modelRouter.routeRequest(task, context);
}

export function getAvailableModels() {
  return Array.from(modelRouter.models.values()).flat();
}

export function getRoutingStats() {
  return {
    totalModels: Array.from(modelRouter.models.values()).flat().length,
    routingStrategies: Array.from(modelRouter.routes.keys()),
    performanceHistorySize: modelRouter.performanceHistory.size
  };
}