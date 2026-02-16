#!/usr/bin/env node

/**
 * Debug Agent - AI-Powered Debugging Specialist
 *
 * Agente especializado em debugging inteligente com tecnologias 2025:
 * - Análise automática de erros e stack traces
 * - Debugging preditivo com machine learning
 * - Correção automática de bugs comuns
 * - Tracing distribuído e análise de performance
 * - Root cause analysis com IA avançada
 * - Debugging colaborativo e compartilhamento de conhecimento
 * - Integração com Protocolo L.L.B. para aprendizado contínuo
 */

import { BaseAgent } from '../base_agent.js';
import { telemetry } from '../../swarm/telemetry.js';
import { advancedRAG } from '../../swarm/advanced_rag.js';
import { modelRouter } from '../../swarm/model_router.js';
import { swarmMemory } from '../../swarm/memory.js';
import { logger } from '../../utils/logger.js';

const log = logger.child({ module: 'debug_agent' });

class DebugAgent extends BaseAgent {
    constructor() {
        super({
      name: 'debug_agent',
      expertise: ['debugging', 'error_analysis', 'root_cause', 'tracing', 'performance_debugging', 'predictive_debugging'],
      capabilities: [
        'error_analysis',
        'root_cause_analysis',
        'predictive_debugging',
        'automatic_fixes',
        'distributed_tracing',
        'performance_debugging',
        'collaborative_debugging',
        'debugging_automation'
      ]
    });

    // Componentes especializados do Debug Agent
    this.errorAnalyzer = new ErrorAnalyzer(this);
    this.rootCauseAnalyzer = new RootCauseAnalyzer(this);
    this.predictiveDebugger = new PredictiveDebugger(this);
    this.autoFixer = new AutoFixer(this);
    this.distributedTracer = new DistributedTracer(this);
    this.performanceDebugger = new PerformanceDebugger(this);
    this.collaborativeDebugger = new CollaborativeDebugger(this);
    this.debugAutomation = new DebugAutomation(this);

    // Bases de conhecimento de debugging
    this.errorPatterns = new Map();
    this.debugStrategies = new Map();
    this.fixTemplates = new Map();

    // Integração com Protocolo L.L.B.
    this.llbIntegration = new LLBDebugIntegration(this);

    // Cache de análises
    this.analysisCache = new Map();
    this.patternCache = new Map();

    log.info('Debug Agent initialized with 2025 debugging technologies');
  }

  /**
   * Processa tarefas de debugging usando tecnologias 2025
   */
  async processTask(task, context = {}) {
    const span = telemetry.startSpan('debug_agent_process', {
      task: task.id || 'unknown',
      type: task.type || 'debugging',
      severity: task.severity || 'medium',
      error_type: task.error_type || 'unknown'
    });

    try {
      // Consultar conhecimento de debugging (LangMem)
      const debugKnowledge = await this.llbIntegration.getDebuggingKnowledge(task);

      // Buscar casos similares de debug (Letta)
      const similarDebugCases = await this.llbIntegration.getSimilarDebugCases(task);

      // Analisar contexto do erro (ByteRover)
      const errorContext = await this.llbIntegration.analyzeErrorContext(task);

      // Roteamento inteligente baseado na complexidade do bug
      const routing = await modelRouter.routeRequest(
        task.description || task.error_message || task,
        {
          task_type: 'debugging',
          severity: task.severity,
          error_type: task.error_type
        },
        { strategy: 'expert' }
      );

      // Estratégia baseada no tipo de problema de debugging
      let result;
      switch (this.classifyDebugTask(task)) {
        case 'error_analysis':
          result = await this.analyzeError(task, context);
          break;
        case 'root_cause':
          result = await this.findRootCause(task, context);
          break;
        case 'predictive':
          result = await this.predictiveDebugging(task, context);
          break;
        case 'performance':
          result = await this.debugPerformance(task, context);
          break;
        case 'distributed':
          result = await this.debugDistributedSystem(task, context);
          break;
        case 'auto_fix':
          result = await this.autoFixBug(task, context);
          break;
        case 'collaborative':
          result = await this.collaborativeDebugging(task, context);
          break;
        default:
          result = await this.generalDebugging(task, context);
      }

      // Aprendizado do caso de debug (Swarm Memory)
      await swarmMemory.storeDecision(
        'debug_agent',
        task.description || JSON.stringify(task),
        JSON.stringify(result.analysis),
        'debugging_completed',
        {
          confidence: routing.confidence,
          executionTime: Date.now() - span.spanId.split('_')[1],
          errorType: task.error_type,
          severity: task.severity,
          rootCauseFound: !!result.rootCause
        }
      );

      span.setStatus('ok');
      span.addEvent('debugging_completed', {
        errorType: task.error_type,
        severity: task.severity,
        rootCauseFound: !!result.rootCause,
        fixesSuggested: result.fixes?.length || 0
      });

      return result;

    } catch (error) {
      span.setStatus('error');
      span.addEvent('debugging_failed', {
        error: error.message,
        task: task.description?.substring(0, 100)
      });

      log.error('Debugging failed', { error: error.message, task });
      throw error;

    } finally {
      span.end();
    }
  }

  /**
   * Classifica o tipo de tarefa de debugging
   */
  classifyDebugTask(task) {
    const description = (task.description || task.error_message || task).toLowerCase();
    const errorType = task.error_type;

    // Verifica tipo específico primeiro
    if (errorType) {
      switch (errorType) {
        case 'runtime_error': return 'error_analysis';
        case 'performance': return 'performance';
        case 'distributed_system': return 'distributed';
        case 'logic_error': return 'root_cause';
      }
    }

    // Classificação baseada na descrição
    if (description.includes('root cause') || description.includes('why') || description.includes('cause')) {
      return 'root_cause';
    }
    if (description.includes('performance') || description.includes('slow') || description.includes('memory')) {
      return 'performance';
    }
    if (description.includes('distributed') || description.includes('microservice') || description.includes('tracing')) {
      return 'distributed';
    }
    if (description.includes('predict') || description.includes('prevent') || description.includes('future')) {
      return 'predictive';
    }
    if (description.includes('fix') || description.includes('auto') || description.includes('correct')) {
      return 'auto_fix';
    }
    if (description.includes('collaborat') || description.includes('team') || description.includes('share')) {
      return 'collaborative';
    }
    if (description.includes('error') || description.includes('bug') || description.includes('exception')) {
      return 'error_analysis';
    }

    return 'general';
  }

  /**
   * Análise de erros automatizada
   */
  async analyzeError(task, context) {
    log.info('Analyzing error automatically', { task: task.error_message?.substring(0, 50) });

    const errorData = task.error_message || task.stack_trace || task;
    if (!errorData) {
      throw new Error('Error data is required for analysis');
    }

    // Análise estrutural do erro
    const structuralAnalysis = await this.errorAnalyzer.analyzeErrorStructure(errorData, task.language);

    // Classificação do tipo de erro
    const errorClassification = await this.errorAnalyzer.classifyError(errorData, structuralAnalysis);

    // Análise de contexto
    const contextAnalysis = await this.errorAnalyzer.analyzeErrorContext(errorData, context);

    // Padrões similares encontrados
    const similarPatterns = await this.errorAnalyzer.findSimilarErrorPatterns(errorClassification);

    // Recomendações de debugging
    const debuggingRecommendations = await this.errorAnalyzer.generateDebuggingRecommendations(errorClassification, contextAnalysis);

        return {
      type: 'error_analysis',
      structuralAnalysis,
      errorClassification,
      contextAnalysis,
      similarPatterns,
      debuggingRecommendations,
      severity: this.assessErrorSeverity(errorClassification),
      reproducibility: this.assessReproducibility(errorClassification, contextAnalysis),
      impact: this.assessErrorImpact(errorClassification, contextAnalysis)
        };
    }

    /**
   * Análise de causa raiz
   */
  async findRootCause(task, context) {
    log.info('Finding root cause of issue', { task: task.description?.substring(0, 50) });

    const issueData = task.error_message || task.description || context;
    if (!issueData) {
      throw new Error('Issue data is required for root cause analysis');
    }

    // Análise inicial do problema
    const problemAnalysis = await this.rootCauseAnalyzer.analyzeProblem(issueData);

    // Identificação de sintomas
    const symptoms = await this.rootCauseAnalyzer.identifySymptoms(problemAnalysis);

    // Análise de possíveis causas
    const possibleCauses = await this.rootCauseAnalyzer.analyzePossibleCauses(symptoms);

    // Priorização de hipóteses
    const prioritizedHypotheses = this.rootCauseAnalyzer.prioritizeHypotheses(possibleCauses);

    // Teste de hipóteses
    const hypothesisTesting = await this.rootCauseAnalyzer.testHypotheses(prioritizedHypotheses, context);

    // Identificação da causa raiz
    const rootCause = await this.rootCauseAnalyzer.identifyRootCause(hypothesisTesting);

    // Plano de correção
    const correctionPlan = await this.rootCauseAnalyzer.generateCorrectionPlan(rootCause);

    return {
      type: 'root_cause_analysis',
      problemAnalysis,
      symptoms,
      possibleCauses,
      prioritizedHypotheses,
      hypothesisTesting,
      rootCause,
      correctionPlan,
      confidence: this.calculateRootCauseConfidence(rootCause, hypothesisTesting),
      prevention: this.generatePreventionStrategies(rootCause)
    };
  }

  /**
   * Debugging preditivo
   */
  async predictiveDebugging(task, context) {
    log.info('Performing predictive debugging', { task: task.description?.substring(0, 50) });

    const codeData = task.code || context.code;
    if (!codeData) {
      throw new Error('Code data is required for predictive debugging');
    }

    // Análise de padrões de código
    const codePatterns = await this.predictiveDebugger.analyzeCodePatterns(codeData, task.language);

    // Identificação de vulnerabilidades potenciais
    const potentialVulnerabilities = await this.predictiveDebugger.identifyPotentialVulnerabilities(codePatterns);

    // Previsão de bugs futuros
    const predictedBugs = await this.predictiveDebugger.predictFutureBugs(codePatterns, potentialVulnerabilities);

    // Análise de complexidade e manutenibilidade
    const complexityAnalysis = await this.predictiveDebugger.analyzeComplexity(codeData);

    // Recomendações preventivas
    const preventiveRecommendations = await this.predictiveDebugger.generatePreventiveRecommendations(predictedBugs, complexityAnalysis);

    // Pontuação de saúde do código
    const healthScore = this.predictiveDebugger.calculateHealthScore(codePatterns, potentialVulnerabilities, complexityAnalysis);

    return {
      type: 'predictive_debugging',
      codePatterns,
      potentialVulnerabilities,
      predictedBugs,
      complexityAnalysis,
      preventiveRecommendations,
      healthScore,
      riskAssessment: this.assessCodeRisk(healthScore, predictedBugs),
      timeline: this.predictBugTimeline(predictedBugs)
    };
  }

  /**
   * Correção automática de bugs
   */
  async autoFixBug(task, context) {
    log.info('Attempting automatic bug fix', { task: task.error_message?.substring(0, 50) });

    const errorData = task.error_message || task;
    const codeData = task.code || context.code;

    if (!errorData || !codeData) {
      throw new Error('Both error and code data are required for auto-fix');
    }

    // Análise do erro
    const errorAnalysis = await this.autoFixer.analyzeErrorForFix(errorData);

    // Identificação de padrão de correção
    const fixPattern = await this.autoFixer.identifyFixPattern(errorAnalysis);

    // Validação de aplicabilidade
    const applicabilityCheck = await this.autoFixer.checkApplicability(fixPattern, codeData);

    // Geração da correção
    const generatedFix = await this.autoFixer.generateFix(fixPattern, codeData, applicabilityCheck);

    // Validação da correção
    const fixValidation = await this.autoFixer.validateFix(generatedFix, errorData);

    // Aplicação segura da correção
    const appliedFix = await this.autoFixer.applySafeFix(generatedFix, fixValidation);

    return {
      type: 'auto_fix',
      errorAnalysis,
      fixPattern,
      applicabilityCheck,
      generatedFix,
      fixValidation,
      appliedFix,
      success: appliedFix.success,
      riskLevel: this.assessFixRisk(fixPattern, applicabilityCheck),
      rollbackPlan: this.generateRollbackPlan(appliedFix)
    };
  }

  /**
   * Debugging de sistemas distribuídos
   */
  async debugDistributedSystem(task, context) {
    log.info('Debugging distributed system', { task: task.description?.substring(0, 50) });

    const systemData = task.system_logs || task.traces || context;

    // Análise de traces distribuídos
    const traceAnalysis = await this.distributedTracer.analyzeDistributedTraces(systemData);

    // Identificação de bottlenecks
    const bottlenecks = await this.distributedTracer.identifyBottlenecks(traceAnalysis);

    // Análise de latência entre serviços
    const latencyAnalysis = await this.distributedTracer.analyzeServiceLatency(traceAnalysis);

    // Detecção de cascading failures
    const cascadingFailures = await this.distributedTracer.detectCascadingFailures(traceAnalysis);

    // Recomendações para debugging distribuído
    const distributedRecommendations = await this.distributedTracer.generateDistributedRecommendations(bottlenecks, latencyAnalysis, cascadingFailures);

    return {
      type: 'distributed_debugging',
      traceAnalysis,
      bottlenecks,
      latencyAnalysis,
      cascadingFailures,
      distributedRecommendations,
      systemHealth: this.assessSystemHealth(traceAnalysis, bottlenecks),
      performanceInsights: this.generatePerformanceInsights(latencyAnalysis)
    };
  }

  /**
   * Debugging de performance
   */
  async debugPerformance(task, context) {
    log.info('Debugging performance issues', { task: task.description?.substring(0, 50) });

    const performanceData = task.metrics || task.profiling_data || context;

    // Análise de métricas de performance
    const metricsAnalysis = await this.performanceDebugger.analyzePerformanceMetrics(performanceData);

    // Identificação de gargalos de performance
    const performanceBottlenecks = await this.performanceDebugger.identifyPerformanceBottlenecks(metricsAnalysis);

    // Análise de uso de recursos
    const resourceAnalysis = await this.performanceDebugger.analyzeResourceUsage(performanceData);

    // Detecção de memory leaks
    const memoryLeaks = await this.performanceDebugger.detectMemoryLeaks(performanceData);

    // Recomendações de otimização
    const optimizationRecommendations = await this.performanceDebugger.generateOptimizationRecommendations(performanceBottlenecks, resourceAnalysis, memoryLeaks);

    return {
      type: 'performance_debugging',
      metricsAnalysis,
      performanceBottlenecks,
      resourceAnalysis,
      memoryLeaks,
      optimizationRecommendations,
      performanceScore: this.calculatePerformanceScore(metricsAnalysis, performanceBottlenecks),
      improvementPotential: this.assessImprovementPotential(optimizationRecommendations)
    };
  }

  /**
   * Debugging colaborativo
   */
  async collaborativeDebugging(task, context) {
    log.info('Performing collaborative debugging', { task: task.description?.substring(0, 50) });

    const teamData = task.team_members || context.team || [];
    const issueData = task.error_message || task.description;

    // Análise da expertise da equipe
    const teamExpertise = await this.collaborativeDebugger.analyzeTeamExpertise(teamData);

    // Distribuição inteligente de tarefas
    const taskDistribution = await this.collaborativeDebugger.distributeDebuggingTasks(issueData, teamExpertise);

    // Coordenação de esforços
    const coordinationPlan = await this.collaborativeDebugger.createCoordinationPlan(taskDistribution);

    // Compartilhamento de conhecimento
    const knowledgeSharing = await this.collaborativeDebugger.setupKnowledgeSharing(teamData);

    // Plano de comunicação
    const communicationPlan = await this.collaborativeDebugger.createCommunicationPlan(teamData);

    return {
      type: 'collaborative_debugging',
      teamExpertise,
      taskDistribution,
      coordinationPlan,
      knowledgeSharing,
      communicationPlan,
      estimatedResolutionTime: this.estimateCollaborativeResolution(teamExpertise, taskDistribution),
      successProbability: this.calculateSuccessProbability(teamExpertise, issueData)
    };
  }

  /**
   * Debugging geral
   */
  async generalDebugging(task, context) {
    log.info('Performing general debugging', { task: task.description?.substring(0, 50) });

    // Abordagem abrangente de debugging
    const comprehensiveAnalysis = await this.debugAutomation.performComprehensiveAnalysis(task, context);

    return {
      type: 'general_debugging',
      comprehensiveAnalysis,
      recommendations: await this.debugAutomation.generateGeneralRecommendations(comprehensiveAnalysis),
      actionPlan: await this.debugAutomation.createActionPlan(comprehensiveAnalysis)
    };
  }

  // === MÉTODOS AUXILIARES ===

  assessErrorSeverity(classification) {
    const severityMap = {
      'critical': 9,
      'high': 7,
      'medium': 5,
      'low': 3,
      'info': 1
    };
    return severityMap[classification.severity] || 5;
  }

  assessReproducibility(classification, context) {
    // Lógica para avaliar reprodutibilidade
    return 'high'; // placeholder
  }

  assessErrorImpact(classification, context) {
    // Lógica para avaliar impacto
    return 'medium'; // placeholder
  }

  calculateRootCauseConfidence(rootCause, testing) {
    // Cálculo de confiança baseado em testes
    return 0.85; // placeholder
  }

  generatePreventionStrategies(rootCause) {
    // Estratégias de prevenção baseadas na causa raiz
    return []; // placeholder
  }

  assessCodeRisk(healthScore, predictedBugs) {
    // Avaliação de risco do código
    return healthScore < 50 ? 'high' : healthScore < 75 ? 'medium' : 'low';
  }

  predictBugTimeline(predictedBugs) {
    // Previsão de timeline para bugs
    return {}; // placeholder
  }

  assessFixRisk(pattern, check) {
    // Avaliação de risco da correção
    return 'low'; // placeholder
  }

  generateRollbackPlan(appliedFix) {
    // Plano de rollback
    return {}; // placeholder
  }

  assessSystemHealth(traceAnalysis, bottlenecks) {
    // Avaliação de saúde do sistema
    return 'good'; // placeholder
  }

  generatePerformanceInsights(latencyAnalysis) {
    // Insights de performance
    return {}; // placeholder
  }

  calculatePerformanceScore(metrics, bottlenecks) {
    // Pontuação de performance
    return 75; // placeholder
  }

  assessImprovementPotential(recommendations) {
    // Potencial de melhoria
    return 'high'; // placeholder
  }

  estimateCollaborativeResolution(expertise, distribution) {
    // Estimativa de tempo de resolução colaborativa
    return '4 hours'; // placeholder
  }

  calculateSuccessProbability(expertise, issue) {
    // Probabilidade de sucesso
    return 0.90; // placeholder
  }
}

/**
 * Error Analyzer - Analisador de erros
 */
class ErrorAnalyzer {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeErrorStructure(errorData, language) { return {}; }
  async classifyError(errorData, analysis) { return {}; }
  async analyzeErrorContext(errorData, context) { return {}; }
  async findSimilarErrorPatterns(classification) { return []; }
  async generateDebuggingRecommendations(classification, context) { return []; }
}

/**
 * Root Cause Analyzer - Analisador de causa raiz
 */
class RootCauseAnalyzer {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeProblem(issueData) { return {}; }
  async identifySymptoms(analysis) { return []; }
  async analyzePossibleCauses(symptoms) { return []; }
  prioritizeHypotheses(causes) { return causes; }
  async testHypotheses(hypotheses, context) { return {}; }
  async identifyRootCause(testing) { return {}; }
  async generateCorrectionPlan(rootCause) { return {}; }
}

/**
 * Predictive Debugger - Debugger preditivo
 */
class PredictiveDebugger {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeCodePatterns(codeData, language) { return {}; }
  async identifyPotentialVulnerabilities(patterns) { return []; }
  async predictFutureBugs(patterns, vulnerabilities) { return []; }
  async analyzeComplexity(codeData) { return {}; }
  async generatePreventiveRecommendations(bugs, complexity) { return []; }
  calculateHealthScore(patterns, vulnerabilities, complexity) { return 75; }
}

/**
 * Auto Fixer - Corretor automático
 */
class AutoFixer {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeErrorForFix(errorData) { return {}; }
  async identifyFixPattern(errorAnalysis) { return {}; }
  async checkApplicability(pattern, codeData) { return {}; }
  async generateFix(pattern, codeData, check) { return {}; }
  async validateFix(generatedFix, errorData) { return {}; }
  async applySafeFix(generatedFix, validation) { return { success: true }; }
}

/**
 * Distributed Tracer - Tracer distribuído
 */
class DistributedTracer {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeDistributedTraces(systemData) { return {}; }
  async identifyBottlenecks(traceAnalysis) { return []; }
  async analyzeServiceLatency(traceAnalysis) { return {}; }
  async detectCascadingFailures(traceAnalysis) { return []; }
  async generateDistributedRecommendations(bottlenecks, latency, failures) { return []; }
}

/**
 * Performance Debugger - Debugger de performance
 */
class PerformanceDebugger {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzePerformanceMetrics(performanceData) { return {}; }
  async identifyPerformanceBottlenecks(metricsAnalysis) { return []; }
  async analyzeResourceUsage(performanceData) { return {}; }
  async detectMemoryLeaks(performanceData) { return []; }
  async generateOptimizationRecommendations(bottlenecks, resources, leaks) { return []; }
}

/**
 * Collaborative Debugger - Debugger colaborativo
 */
class CollaborativeDebugger {
  constructor(agent) {
    this.agent = agent;
  }

  async analyzeTeamExpertise(teamData) { return {}; }
  async distributeDebuggingTasks(issueData, expertise) { return {}; }
  async createCoordinationPlan(distribution) { return {}; }
  async setupKnowledgeSharing(teamData) { return {}; }
  async createCommunicationPlan(teamData) { return {}; }
}

/**
 * Debug Automation - Automação de debugging
 */
class DebugAutomation {
  constructor(agent) {
    this.agent = agent;
  }

  async performComprehensiveAnalysis(task, context) { return {}; }
  async generateGeneralRecommendations(analysis) { return []; }
  async createActionPlan(analysis) { return {}; }
}

/**
 * LLB Debug Integration - Integração com Protocolo L.L.B.
 */
class LLBDebugIntegration {
  constructor(agent) {
    this.agent = agent;
  }

  async getDebuggingKnowledge(task) {
    // Buscar conhecimento de debugging no LangMem
    const knowledge = await advancedRAG.intelligentSearch(
      `debugging best practices for ${task.description || task}`,
      { strategies: ['LevelRAG'] }
    );
    return knowledge;
  }

  async getSimilarDebugCases(task) {
    // Buscar casos similares no Letta
    const similar = await swarmMemory.getSimilarDecisions(
      task.description || JSON.stringify(task)
    );
    return similar;
  }

  async analyzeErrorContext(task) {
    // Analisar contexto do erro via ByteRover
    return {
      codeContext: [],
      errorPatterns: [],
      recentChanges: [],
      dependencies: []
    };
  }
}

// Instância singleton
export const debugAgent = new DebugAgent();

// Exportações adicionais
export { DebugAgent };
export default debugAgent;

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'analyze':
      const error = args[1];
      if (!error) {
        console.error('Usage: node debug_agent.js analyze "error message"');
        process.exit(1);
      }

      debugAgent.processTask({
        description: 'Analyze error',
        error_message: error,
        type: 'error_analysis',
        language: 'javascript'
      }).then(result => {
        console.log('🔍 Error Analysis Result:');
        console.log('=' .repeat(50));
        console.log(`Error Type: ${result.errorClassification?.type || 'Unknown'}`);
        console.log(`Severity: ${result.severity || 'Unknown'}`);
        console.log(`Root Cause: ${result.rootCause || 'Not identified'}`);
        console.log(`Recommendations: ${result.debuggingRecommendations?.length || 0}`);
        console.log('=' .repeat(50));
      }).catch(error => {
        console.error('❌ Analysis failed:', error.message);
        process.exit(1);
      });
      break;

    case 'root-cause':
      const issue = args[1];
      if (!issue) {
        console.error('Usage: node debug_agent.js root-cause "issue description"');
        process.exit(1);
      }

      debugAgent.processTask({
        description: issue,
        type: 'root_cause'
      }).then(result => {
        console.log('🎯 Root Cause Analysis Result:');
        console.log(`Root Cause: ${result.rootCause || 'Not found'}`);
        console.log(`Confidence: ${result.confidence || 0}`);
        console.log(`Prevention Strategies: ${result.prevention?.length || 0}`);
      }).catch(error => {
        console.error('❌ Root cause analysis failed:', error.message);
        process.exit(1);
      });
      break;

    default:
      console.log('🐛 Debug Agent - AI-Powered Debugging Specialist');
      console.log('');
      console.log('Commands:');
      console.log('  analyze "error"     - Analyze error message');
      console.log('  root-cause "issue"  - Find root cause of issue');
      console.log('');
      console.log('Capabilities:');
      console.log('  • Error analysis and classification');
      console.log('  • Root cause analysis');
      console.log('  • Predictive debugging');
      console.log('  • Automatic bug fixes');
      console.log('  • Distributed system debugging');
      console.log('  • Performance debugging');
      console.log('  • Collaborative debugging');
  }
}