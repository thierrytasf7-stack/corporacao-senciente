/**
 * Exemplo de Implementação de Backtest Engine
 *
 * @module strategy-sports/examples/backtest-implementation
 * @description Demonstração prática de como rodar backtest com separação arquitetural:
 *              - Carregar estratégia (lógica pura)
 *              - Carregar dados históricos
 *              - Rodar lógica pura (FASE 1)
 *              - Otimizar gestão separadamente (FASE 2)
 *              - Reportar métricas separadas
 *
 * ⚠️ PRINCÍPIO FUNDAMENTAL:
 * ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.
 *
 * @see ../PROTOCOLS.md para protocolos formais
 * @see ../types/strategy.types.ts para tipos TypeScript
 */

import {
  // Tipos de Estratégia (LÓGICA PURA)
  StrategySignal,
  StrategyMetrics,
  HistoricalData,

  // Tipos de Gestão (PARÂMETROS INJETÁVEIS)
  StrategyConfig,
  ManagementMetrics,
  StakingMethod,

  // Tipos de Resultado
  StrategyResult,
  StrategyReport,
  BetResult,

  // Enums
  MarketType,
  RiskLevel,
} from '../types/strategy.types';

// =============================================================================
// INTERFACES DE DEPENDÊNCIA
// =============================================================================

/**
 * Interface para estratégia (lógica pura)
 */
interface IStrategy {
  readonly id: string;
  readonly version: string;

  /**
   * Avalia dados históricos e retorna signal se houver oportunidade
   */
  evaluate(data: HistoricalData): Promise<StrategySignal | undefined>;

  /**
   * Valida entrada (regras de exclusão)
   */
  validateEntry(signal: StrategySignal): Promise<{
    canEnter: boolean;
    reasons: string[];
  }>;
}

/**
 * Interface para repositório de dados históricos
 */
interface IDataRepository {
  /**
   * Carrega dados históricos para backtest
   */
  loadHistoricalData(
    strategyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalData[]>;

  /**
   * Carrega dados out-of-sample para validação
   */
  loadOutOfSampleData(
    strategyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalData[]>;
}

/**
 * Interface para repositório de configuração
 */
interface IConfigRepository {
  loadConfig(strategyId: string, version?: string): Promise<StrategyConfig>;

  saveConfig(config: StrategyConfig): Promise<void>;
}

/**
 * Interface para otimizador de parâmetros
 */
interface IOptimizer {
  /**
   * Otimiza parâmetros de gestão
   */
  optimize(
    results: StrategyResult[],
    paramRanges: ParameterRanges
  ): Promise<OptimizationResult>;
}

/**
 * Ranges de parâmetros para otimização
 */
interface ParameterRanges {
  stakePercent?: [number, number]; // [min, max]
  stopLoss?: [number, number];
  maxExposure?: [number, number];
  kellyFraction?: [number, number];
}

/**
 * Resultado de otimização
 */
interface OptimizationResult {
  optimalParams: {
    stakePercent?: number;
    stopLoss?: number;
    maxExposure?: number;
    kellyFraction?: number;
  };

  metrics: {
    roi: number;
    sharpeRatio: number;
    maxDrawdown: number;
    calmarRatio: number;
  };

  iterations: number;
  algorithm: 'grid-search' | 'bayesian' | 'genetic';
}

/**
 * Interface para logger
 */
interface ILogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
  progress(current: number, total: number): void;
}

// =============================================================================
// CLASSES DE RESULTADO
// =============================================================================

/**
 * Resultado do backtest de lógica (FASE 1)
 */
export interface LogicBacktestResult {
  // Identificação
  strategyId: string;
  strategyVersion: string;

  // Período
  startDate: Date;
  endDate: Date;
  totalDataPoints: number;

  // Métricas de lógica (ESTRATÉGIA)
  metrics: {
    // Volume
    totalOpportunities: number;
    totalTriggers: number;
    totalEntries: number;

    // Taxas
    triggerRate: number;
    entryRate: number;

    // Qualidade do trigger
    winRate: number;
    averageOdds: number;
    averageConfidence: number;

    // Validações
    triggerAccuracy: boolean;
    exclusionRulesWork: boolean;
    schemaIsValid: boolean;
  };

  // Signals gerados
  signals: StrategySignal[];

  // Validações
  validations: {
    triggerAccuracy: boolean;
    exclusionRulesWork: boolean;
    schemaIsValid: boolean;
  };
}

/**
 * Resultado do backtest de gestão (FASE 2)
 */
export interface ManagementBacktestResult {
  // Identificação
  strategyId: string;
  configVersion: string;

  // Parâmetros testados
  params: {
    stakingMethod: StakingMethod;
    stakePercent: number;
    stopLoss: number;
    maxExposure: number;
  };

  // Métricas de gestão (PARÂMETROS)
  metrics: ManagementMetrics;

  // Resultados individuais
  results: StrategyResult[];

  // Análise de drawdown
  drawdownAnalysis: {
    maxDrawdown: number;
    maxDrawdownDuration: number;
    drawdownPeriods: {
      start: Date;
      end: Date;
      depth: number;
    }[];
  };

  // Análise de consistência
  consistencyAnalysis: {
    profitFactor: number;
    expectancy: number;
    winStreak: number;
    lossStreak: number;
    monthlyReturns: number[];
  };
}

/**
 * Resultado completo do backtest
 */
export interface FullBacktestResult {
  // Identificação
  strategyId: string;
  strategyVersion: string;
  configVersion?: string;

  // Período
  startDate: Date;
  endDate: Date;

  // Fase 1: Lógica
  logicResult: LogicBacktestResult;

  // Fase 2: Gestão (se otimizada)
  managementResult?: ManagementBacktestResult;

  // Validação cruzada (se aplicável)
  validation?: {
    inSample: ManagementBacktestResult;
    outOfSample: ManagementBacktestResult;
    degradation: number;
    isOverfitting: boolean;
  };

  // Relatório consolidado
  report: StrategyReport;
}

// =============================================================================
// BACKTEST ENGINE
// =============================================================================

/**
 * Backtest Engine - Implementação de Exemplo
 *
 * @description Engine que separa claramente:
 *              - FASE 1: Backtest da lógica (estratégia pura)
 *              - FASE 2: Otimização de gestão (parâmetros)
 *              - FASE 3: Validação cruzada (out-of-sample)
 *
 * @example
 * ```typescript
 * const engine = new BacktestEngine({
 *   strategy,
 *   dataRepo,
 *   configRepo,
 *   optimizer,
 *   logger,
 * });
 *
 * // Fase 1: Backtest de lógica
 * const logicResult = await engine.backtestLogic({
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31'),
 * });
 *
 * // Fase 2: Otimização de gestão
 * const managementResult = await engine.optimizeManagement({
 *   logicResult,
 *   paramRanges: {
 *     stakePercent: [0.5, 2.0],
 *     stopLoss: [3.0, 10.0],
 *   },
 * });
 *
 * // Fase 3: Validação cruzada
 * const validation = await engine.validateOutOfSample({
 *   inSample: managementResult,
 *   validationStart: new Date('2025-01-01'),
 *   validationEnd: new Date('2025-06-30'),
 * });
 * ```
 */
export class BacktestEngine {
  private readonly strategy: IStrategy;
  private readonly dataRepo: IDataRepository;
  private readonly configRepo: IConfigRepository;
  private readonly optimizer: IOptimizer;
  private readonly logger: ILogger;

  constructor(params: {
    strategy: IStrategy;
    dataRepo: IDataRepository;
    configRepo: IConfigRepository;
    optimizer: IOptimizer;
    logger: ILogger;
  }) {
    this.strategy = params.strategy;
    this.dataRepo = params.dataRepo;
    this.configRepo = params.configRepo;
    this.optimizer = params.optimizer;
    this.logger = params.logger;
  }

  // ===========================================================================
  // FASE 1: BACKTEST DE LÓGICA (ESTRATÉGIA PURA)
  // ===========================================================================

  /**
   * Executa backtest APENAS da lógica da estratégia
   *
   * @description FASE 1: Valida se o trigger funciona corretamente
   *              SEM considerar parâmetros de gestão (stake, limits, etc.)
   *
   * @param params - Parâmetros do backtest
   * @returns Resultado do backtest de lógica
   *
   * @remarks
   * Esta fase responde: "A lógica de trigger funciona?"
   * NÃO responde: "A estratégia é lucrativa?" (isso é FASE 2)
   */
  async backtestLogic(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<LogicBacktestResult> {
    this.logger.info('FASE 1: Backtest de Lógica Iniciado', {
      strategyId: this.strategy.id,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    // 1. Carregar dados históricos
    this.logger.debug('Carregando dados históricos...');
    const historicalData = await this.dataRepo.loadHistoricalData(
      this.strategy.id,
      params.startDate,
      params.endDate
    );

    this.logger.info(`Dados carregados: ${historicalData.length} registros`);

    // 2. Inicializar contadores de métricas de LÓGICA
    let totalOpportunities = 0;
    let totalTriggers = 0;
    let totalEntries = 0;
    let wins = 0;
    let totalOdds = 0;
    let totalConfidence = 0;

    const signals: StrategySignal[] = [];
    const validationErrors: string[] = [];

    // 3. Processar cada dado histórico
    for (let i = 0; i < historicalData.length; i++) {
      this.logger.progress(i + 1, historicalData.length);

      const data = historicalData[i];
      totalOpportunities++;

      try {
        // 3.1 Avaliar estratégia (lógica pura)
        const signal = await this.strategy.evaluate(data);

        if (!signal) {
          continue; // Sem trigger
        }

        totalTriggers++;

        // 3.2 Validar entrada (regras de exclusão)
        const validation = await this.strategy.validateEntry(signal);

        if (!validation.canEnter) {
          this.logger.debug('Entrada excluída por regras', {
            dataId: data.id,
            reasons: validation.reasons,
          });
          continue;
        }

        totalEntries++;
        signals.push(signal);

        // 3.3 Simular resultado (para métricas de lógica)
        // Nota: Na FASE 1, usamos odds fixas ou médias para calcular win rate
        const simulatedOdds = data.odds[0]?.odds || 2.0;
        const simulatedResult = this.simulateOutcome(data, signal);

        if (simulatedResult === BetResult.WIN) {
          wins++;
        }

        totalOdds += simulatedOdds;
        totalConfidence += signal.metadata.confidence;

      } catch (error) {
        validationErrors.push(
          `Erro em ${data.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // 4. Calcular métricas de LÓGICA
    const metrics: LogicBacktestResult['metrics'] = {
      totalOpportunities,
      totalTriggers,
      totalEntries,

      triggerRate:
        totalOpportunities > 0 ? totalTriggers / totalOpportunities : 0,
      entryRate:
        totalTriggers > 0 ? totalEntries / totalTriggers : 0,

      winRate: totalEntries > 0 ? wins / totalEntries : 0,
      averageOdds: totalEntries > 0 ? totalOdds / totalEntries : 0,
      averageConfidence:
        totalEntries > 0 ? totalConfidence / totalEntries : 0,

      triggerAccuracy: validationErrors.length === 0,
      exclusionRulesWork: validationErrors.length === 0,
      schemaIsValid: signals.every((s) => this.validateSignalSchema(s)),
    };

    // 5. Validar lógica
    const validations = {
      triggerAccuracy: metrics.triggerRate > 0 && metrics.triggerRate < 1,
      exclusionRulesWork: metrics.entryRate <= metrics.triggerRate,
      schemaIsValid: metrics.schemaIsValid,
    };

    this.logger.info('FASE 1: Backtest de Lógica Concluído', {
      totalOpportunities,
      totalTriggers,
      totalEntries,
      triggerRate: metrics.triggerRate,
      entryRate: metrics.entryRate,
      winRate: metrics.winRate,
      validations,
    });

    return {
      strategyId: this.strategy.id,
      strategyVersion: this.strategy.version,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDataPoints: historicalData.length,
      metrics,
      signals,
      validations,
    };
  }

  /**
   * Simula resultado baseado nos dados históricos
   */
  private simulateOutcome(
    data: HistoricalData,
    signal: StrategySignal
  ): BetResult {
    // Simplificação para exemplo
    // Em produção, usar lógica específica da estratégia
    const winProbability = signal.metadata.confidence;
    const random = Math.random();

    if (random < winProbability) {
      return BetResult.WIN;
    } else {
      return BetResult.LOSS;
    }
  }

  /**
   * Valida schema do signal
   */
  private validateSignalSchema(signal: StrategySignal): boolean {
    // Validações básicas de schema
    return (
      !!signal.signalId &&
      !!signal.strategyId &&
      !!signal.match &&
      !!signal.selection &&
      !!signal.market &&
      !!signal.validation
    );
  }

  // ===========================================================================
  // FASE 2: OTIMIZAÇÃO DE GESTÃO (PARÂMETROS)
  // ===========================================================================

  /**
   * Otimiza parâmetros de gestão baseado nos resultados da FASE 1
   *
   * @description FASE 2: Encontra os melhores parâmetros de gestão
   *              (stake, stop loss, exposure) para maximizar ROI/Sharpe
   *
   * @param params - Parâmetros de otimização
   * @returns Resultado do backtest de gestão
   *
   * @remarks
   * Esta fase responde: "Qual a melhor gestão para esta lógica?"
   * Pressupõe que a FASE 1 já validou a lógica.
   */
  async optimizeManagement(params: {
    logicResult: LogicBacktestResult;
    paramRanges: ParameterRanges;
    algorithm?: 'grid-search' | 'bayesian' | 'genetic';
    objective?: 'sharpe-ratio' | 'roi' | 'calmar';
  }): Promise<ManagementBacktestResult> {
    this.logger.info('FASE 2: Otimização de Gestão Iniciada', {
      strategyId: this.strategy.id,
      algorithm: params.algorithm || 'grid-search',
      objective: params.objective || 'sharpe-ratio',
    });

    // 1. Carregar configuração padrão
    const config = await this.configRepo.loadConfig(this.strategy.id);

    // 2. Converter signals em resultados preliminares
    const preliminaryResults: StrategyResult[] = params.logicResult.signals.map(
      (signal, index) => ({
        resultId: `result-${index}`,
        signalId: signal.signalId,
        strategyId: signal.strategyId,
        version: signal.version,
        stake: 1.0, // Stake placeholder (será otimizada)
        odds: signal.market.selection.odds,
        oddsType: 'DECIMAL',
        result: this.simulateOutcome(
          { id: `data-${index}` } as HistoricalData,
          signal
        ),
        profit: 0, // Será calculado
        roi: 0,
        settledAt: new Date(),
      })
    );

    // 3. Calcular profit para cada resultado
    preliminaryResults.forEach((result) => {
      if (result.result === BetResult.WIN) {
        result.profit = result.stake * (result.odds - 1);
      } else {
        result.profit = -result.stake;
      }
      result.roi = (result.profit / result.stake) * 100;
    });

    // 4. Executar otimização
    this.logger.debug('Executando otimização...', {
      paramRanges: params.paramRanges,
    });

    const optimizationResult = await this.optimizer.optimize(
      preliminaryResults,
      params.paramRanges
    );

    this.logger.info('Otimização concluída', {
      iterations: optimizationResult.iterations,
      optimalParams: optimizationResult.optimalParams,
      metrics: optimizationResult.metrics,
    });

    // 5. Recalcular resultados com parâmetros ótimos
    const optimalStakePercent = optimizationResult.optimalParams.stakePercent || 1.0;
    const optimalStopLoss = optimizationResult.optimalParams.stopLoss || 5.0;

    const finalResults = this.recalculateWithParams(
      preliminaryResults,
      {
        stakePercent: optimalStakePercent,
        stopLoss: optimalStopLoss,
      }
    );

    // 6. Calcular métricas de GESTÃO
    const metrics = this.calculateManagementMetrics(finalResults);

    // 7. Análise de drawdown
    const drawdownAnalysis = this.analyzeDrawdown(finalResults);

    // 8. Análise de consistência
    const consistencyAnalysis = this.analyzeConsistency(finalResults);

    this.logger.info('FASE 2: Otimização de Gestão Concluída', {
      roi: metrics.roi,
      sharpeRatio: metrics.sharpeRatio,
      maxDrawdown: metrics.maxDrawdown,
      profitFactor: metrics.profitFactor,
    });

    return {
      strategyId: this.strategy.id,
      configVersion: config.configVersion,
      params: {
        stakingMethod: config.staking.method,
        stakePercent: optimalStakePercent,
        stopLoss: optimalStopLoss,
        maxExposure: optimizationResult.optimalParams.maxExposure || 10.0,
      },
      metrics,
      results: finalResults,
      drawdownAnalysis,
      consistencyAnalysis,
    };
  }

  /**
   * Recalcula resultados com parâmetros de gestão específicos
   */
  private recalculateWithParams(
    results: StrategyResult[],
    params: {
      stakePercent: number;
      stopLoss: number;
    }
  ): StrategyResult[] {
    const bankroll = 10000; // Bankroll inicial假设
    let currentBankroll = bankroll;
    const recalculated: StrategyResult[] = [];
    let stopped = false;
    let dailyLoss = 0;

    for (const result of results) {
      if (stopped) break;

      // Calcular stake
      const stake = currentBankroll * (params.stakePercent / 100);

      // Recalcular profit
      let profit: number;
      if (result.result === BetResult.WIN) {
        profit = stake * (result.odds - 1);
      } else {
        profit = -stake;
      }

      // Check stop loss diário
      dailyLoss += profit < 0 ? Math.abs(profit) : 0;
      if (dailyLoss >= bankroll * (params.stopLoss / 100)) {
        stopped = true;
        continue;
      }

      // Atualizar bankroll
      currentBankroll += profit;

      recalculated.push({
        ...result,
        stake,
        profit,
        roi: (profit / stake) * 100,
        context: {
          bankrollBefore: currentBankroll - profit,
          bankrollAfter: currentBankroll,
        },
      });
    }

    return recalculated;
  }

  /**
   * Calcula métricas de gestão
   */
  private calculateManagementMetrics(
    results: StrategyResult[]
  ): ManagementMetrics {
    const totalStake = results.reduce((sum, r) => sum + r.stake, 0);
    const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
    const wins = results.filter((r) => r.result === BetResult.WIN);
    const losses = results.filter((r) => r.result === BetResult.LOSS);

    const grossProfit = wins.reduce((sum, r) => sum + r.profit, 0);
    const grossLoss = Math.abs(
      losses.reduce((sum, r) => sum + r.profit, 0)
    );

    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const expectancy =
      results.length > 0
        ? totalProfit / results.length
        : 0;

    // Sharpe ratio simplificado
    const returns = results.map((r) => r.roi);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdReturn = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
        returns.length
    );
    const sharpeRatio = stdReturn > 0 ? avgReturn / stdReturn : 0;

    // Max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;

    for (const result of results) {
      cumulative += result.profit;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      roi,
      totalProfit,
      totalStake,
      sharpeRatio,
      sortinoRatio: sharpeRatio, // Simplificado
      calmarRatio: roi / maxDrawdown || 0,
      maxDrawdown,
      currentDrawdown: maxDrawdown,
      profitFactor,
      expectancy,
      winStreak: this.calculateWinStreak(results),
      lossStreak: this.calculateLossStreak(results),
    };
  }

  private calculateWinStreak(results: StrategyResult[]): number {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const result of results) {
      if (result.result === BetResult.WIN) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  private calculateLossStreak(results: StrategyResult[]): number {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const result of results) {
      if (result.result === BetResult.LOSS) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  /**
   * Analisa drawdown
   */
  private analyzeDrawdown(results: StrategyResult[]): ManagementBacktestResult['drawdownAnalysis'] {
    let maxDrawdown = 0;
    let maxDrawdownDuration = 0;
    let peak = 0;
    let cumulative = 0;
    let drawdownStart: Date | null = null;
    const drawdownPeriods: ManagementBacktestResult['drawdownAnalysis']['drawdownPeriods'] = [];

    for (const result of results) {
      cumulative += result.profit;

      if (cumulative > peak) {
        // Novo pico - drawdown terminou
        if (drawdownStart) {
          drawdownPeriods.push({
            start: drawdownStart,
            end: result.settledAt,
            depth: maxDrawdown,
          });
          const duration = result.settledAt.getTime() - drawdownStart.getTime();
          maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
          drawdownStart = null;
        }
        peak = cumulative;
      } else if (peak - cumulative > 0) {
        // Em drawdown
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
        if (!drawdownStart) {
          drawdownStart = result.settledAt;
        }
      }
    }

    return {
      maxDrawdown,
      maxDrawdownDuration,
      drawdownPeriods,
    };
  }

  /**
   * Analisa consistência
   */
  private analyzeConsistency(
    results: StrategyResult[]
  ): ManagementBacktestResult['consistencyAnalysis'] {
    const wins = results.filter((r) => r.result === BetResult.WIN);
    const losses = results.filter((r) => r.result === BetResult.LOSS);

    const grossProfit = wins.reduce((sum, r) => sum + r.profit, 0);
    const grossLoss = Math.abs(losses.reduce((sum, r) => sum + r.profit, 0));

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
    const expectancy = results.length > 0 ? totalProfit / results.length : 0;

    // Retornos mensais (simplificado)
    const monthlyReturns: number[] = [];
    // Em produção, agrupar por mês real

    return {
      profitFactor,
      expectancy,
      winStreak: this.calculateWinStreak(results),
      lossStreak: this.calculateLossStreak(results),
      monthlyReturns,
    };
  }

  // ===========================================================================
  // FASE 3: VALIDAÇÃO CRUZADA (OUT-OF-SAMPLE)
  // ===========================================================================

  /**
   * Valida parâmetros em dados out-of-sample
   *
   * @description FASE 3: Verifica se parâmetros otimizados generalizam
   *              para dados não vistos (detecção de overfitting)
   *
   * @param params - Parâmetros de validação
   * @returns Resultado da validação
   */
  async validateOutOfSample(params: {
    inSampleResult: ManagementBacktestResult;
    validationStart: Date;
    validationEnd: Date;
  }): Promise<{
    inSample: ManagementBacktestResult;
    outOfSample: ManagementBacktestResult;
    degradation: number;
    isOverfitting: boolean;
  }> {
    this.logger.info('FASE 3: Validação Out-of-Sample Iniciada', {
      validationStart: params.validationStart,
      validationEnd: params.validationEnd,
    });

    // 1. Carregar dados out-of-sample
    const oosData = await this.dataRepo.loadOutOfSampleData(
      this.strategy.id,
      params.validationStart,
      params.validationEnd
    );

    this.logger.info(`Dados OOS carregados: ${oosData.length} registros`);

    // 2. Rodar backtest com mesmos parâmetros
    const config = await this.configRepo.loadConfig(this.strategy.id);
    const optimalParams = params.inSampleResult.params;

    // Reutilizar lógica de otimização com dados OOS
    // (Em produção, implementar backtest direto com params fixos)
    const oosResult = await this.backtestWithParams(
      oosData,
      {
        stakePercent: optimalParams.stakePercent,
        stopLoss: optimalParams.stopLoss,
        maxExposure: optimalParams.maxExposure,
      },
      config
    );

    // 3. Calcular degradação
    const inSampleRoi = params.inSampleResult.metrics.roi;
    const outOfSampleRoi = oosResult.metrics.roi;

    const degradation =
      inSampleRoi !== 0
        ? ((inSampleRoi - outOfSampleRoi) / Math.abs(inSampleRoi)) * 100
        : 0;

    // 4. Detectar overfitting
    // Overfitting se:
    // - Degradação > 50%
    // - OOS Sharpe < 0.5
    // - OOS ROI negativo enquanto IS positivo
    const isOverfitting =
      degradation > 50 ||
      oosResult.metrics.sharpeRatio < 0.5 ||
      (inSampleRoi > 0 && outOfSampleRoi < 0);

    this.logger.info('FASE 3: Validação Out-of-Sample Concluída', {
      inSampleRoi,
      outOfSampleRoi,
      degradation,
      isOverfitting,
      oosSharpe: oosResult.metrics.sharpeRatio,
    });

    return {
      inSample: params.inSampleResult,
      outOfSample: oosResult,
      degradation,
      isOverfitting,
    };
  }

  /**
   * Backtest com parâmetros fixos (para validação OOS)
   */
  private async backtestWithParams(
    data: HistoricalData[],
    params: {
      stakePercent: number;
      stopLoss: number;
      maxExposure: number;
    },
    config: StrategyConfig
  ): Promise<ManagementBacktestResult> {
    // Implementação simplificada - reutiliza lógica existente
    // Em produção, implementar backtest direto sem otimização

    const mockLogicResult: LogicBacktestResult = {
      strategyId: this.strategy.id,
      strategyVersion: this.strategy.version,
      startDate: new Date(),
      endDate: new Date(),
      totalDataPoints: data.length,
      metrics: {
        totalOpportunities: data.length,
        totalTriggers: Math.floor(data.length * 0.3),
        totalEntries: Math.floor(data.length * 0.2),
        triggerRate: 0.3,
        entryRate: 0.67,
        winRate: 0.55,
        averageOdds: 2.0,
        averageConfidence: 0.6,
        triggerAccuracy: true,
        exclusionRulesWork: true,
        schemaIsValid: true,
      },
      signals: [],
      validations: {
        triggerAccuracy: true,
        exclusionRulesWork: true,
        schemaIsValid: true,
      },
    };

    const results: StrategyResult[] = [];
    // Em produção, processar dados reais

    const metrics = this.calculateManagementMetrics(results);

    return {
      strategyId: this.strategy.id,
      configVersion: config.configVersion,
      params: {
        stakingMethod: config.staking.method,
        stakePercent: params.stakePercent,
        stopLoss: params.stopLoss,
        maxExposure: params.maxExposure,
      },
      metrics,
      results,
      drawdownAnalysis: {
        maxDrawdown: 0,
        maxDrawdownDuration: 0,
        drawdownPeriods: [],
      },
      consistencyAnalysis: {
        profitFactor: 0,
        expectancy: 0,
        winStreak: 0,
        lossStreak: 0,
        monthlyReturns: [],
      },
    };
  }

  // ===========================================================================
  // RELATÓRIO CONSOLIDADO
  // ===========================================================================

  /**
   * Gera relatório completo do backtest
   */
  generateFullReport(result: FullBacktestResult): StrategyReport {
    return {
      startDate: result.startDate,
      endDate: result.endDate,
      strategyVersion: result.strategyVersion,
      configVersion: result.configVersion,
      strategyMetrics: {
        totalOpportunities: result.logicResult.metrics.totalOpportunities,
        totalTriggers: result.logicResult.metrics.totalTriggers,
        totalEntries: result.logicResult.metrics.totalEntries,
        triggerRate: result.logicResult.metrics.triggerRate,
        entryRate: result.logicResult.metrics.entryRate,
        fillRate: 1.0, // Assumindo fill rate de 100% no backtest
        winRate: result.logicResult.metrics.winRate,
        averageOdds: result.logicResult.metrics.averageOdds,
        averageConfidence: result.logicResult.metrics.averageConfidence,
      },
      managementMetrics: result.managementResult?.metrics || {
        roi: 0,
        totalProfit: 0,
        totalStake: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        profitFactor: 0,
        expectancy: 0,
      },
      results: result.managementResult?.results || [],
      analysis: {
        overfittingChecks: result.validation
          ? {
              inSample: result.validation.inSample.metrics,
              outOfSample: result.validation.outOfSample.metrics,
              degradation: result.validation.degradation,
            }
          : undefined,
      },
    };
  }
}

// =============================================================================
// EXEMPLO DE USO
// =============================================================================

/**
 * Exemplo de uso completo da Backtest Engine
 */
export async function backtestUsageExample(): Promise<void> {
  // Mocks para exemplo
  const mockStrategy: IStrategy = {
    id: 'TENNIS_FAV_30_0_COMEBACK',
    version: 'v1.0.0',
    evaluate: async () => undefined, // Implementar lógica real
    validateEntry: async () => ({ canEnter: true, reasons: [] }),
  };

  const mockDataRepo: IDataRepository = {
    loadHistoricalData: async () => [],
    loadOutOfSampleData: async () => [],
  };

  const mockConfigRepo: IConfigRepository = {
    loadConfig: async () => ({
      strategyId: 'TENNIS_FAV_30_0_COMEBACK',
      configVersion: 'cfg-1.0.0',
      name: 'Test',
      odds: { min: 1.7, max: 3.5 },
      staking: {
        method: StakingMethod.PERCENTAGE,
        value: 1.0,
        limits: { min: 0.25, max: 2.0 },
      },
      exposure: {
        per_match: { max_bets: 3, max_stake: 3.0 },
        per_day: { max_bets: 15, max_stake: 10.0, max_loss: 5.0 },
      },
      circuit_breakers: {
        daily: { loss_stop: 5.0 },
      },
    }),
    saveConfig: async () => {},
  };

  const mockOptimizer: IOptimizer = {
    optimize: async () => ({
      optimalParams: {
        stakePercent: 1.0,
        stopLoss: 5.0,
        maxExposure: 10.0,
      },
      metrics: {
        roi: 15.0,
        sharpeRatio: 1.5,
        maxDrawdown: 10.0,
        calmarRatio: 1.5,
      },
      iterations: 100,
      algorithm: 'grid-search',
    }),
  };

  const mockLogger: ILogger = {
    info: (msg, data) => console.log('[INFO]', msg, data),
    warn: (msg, data) => console.warn('[WARN]', msg, data),
    error: (msg, data) => console.error('[ERROR]', msg, data),
    debug: (msg, data) => console.debug('[DEBUG]', msg, data),
    progress: (current, total) =>
      process.stdout.write(`\rProgresso: ${current}/${total}`),
  };

  // Criar engine
  const engine = new BacktestEngine({
    strategy: mockStrategy,
    dataRepo: mockDataRepo,
    configRepo: mockConfigRepo,
    optimizer: mockOptimizer,
    logger: mockLogger,
  });

  // FASE 1: Backtest de lógica
  console.log('\n=== FASE 1: Backtest de Lógica ===');
  const logicResult = await engine.backtestLogic({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
  });

  console.log('Resultados da Lógica:', {
    triggerRate: logicResult.metrics.triggerRate,
    entryRate: logicResult.metrics.entryRate,
    winRate: logicResult.metrics.winRate,
  });

  // FASE 2: Otimização de gestão
  console.log('\n=== FASE 2: Otimização de Gestão ===');
  const managementResult = await engine.optimizeManagement({
    logicResult,
    paramRanges: {
      stakePercent: [0.5, 2.0],
      stopLoss: [3.0, 10.0],
    },
  });

  console.log('Resultados da Gestão:', {
    roi: managementResult.metrics.roi,
    sharpeRatio: managementResult.metrics.sharpeRatio,
    maxDrawdown: managementResult.metrics.maxDrawdown,
  });

  // FASE 3: Validação cruzada
  console.log('\n=== FASE 3: Validação Out-of-Sample ===');
  const validation = await engine.validateOutOfSample({
    inSampleResult: managementResult,
    validationStart: new Date('2025-01-01'),
    validationEnd: new Date('2025-06-30'),
  });

  console.log('Validação:', {
    degradation: validation.degradation,
    isOverfitting: validation.isOverfitting,
  });

  // Relatório final
  const fullResult: FullBacktestResult = {
    strategyId: mockStrategy.id,
    strategyVersion: mockStrategy.version,
    configVersion: managementResult.configVersion,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    logicResult,
    managementResult,
    validation,
    report: engine.generateFullReport({
      ...fullResult,
      logicResult,
      managementResult,
      validation,
    }),
  };

  console.log('\n=== Relatório Final ===');
  console.log(fullResult.report);
}

// Export para execução como script
if (typeof require !== 'undefined' && require.main === module) {
  backtestUsageExample().catch(console.error);
}
