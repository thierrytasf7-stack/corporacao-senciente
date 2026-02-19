/**
 * Exemplo de Implementação de Bot de Trading
 *
 * @module strategy-sports/examples/bot-implementation
 * @description Demonstração prática de como um bot deve:
 *              - Carregar estratégia (lógica pura)
 *              - Injetar configuração de gestão
 *              - Processar triggers
 *              - Executar apostas
 *              - Reportar resultados
 *
 * ⚠️ PRINCÍPIO FUNDAMENTAL:
 * ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.
 *
 * @see ../PROTOCOLS.md para protocolos formais
 * @see ../types/strategy.types.ts para tipos TypeScript
 */

import {
  // Tipos de Estratégia (LÓGICA PURA)
  StrategyTrigger,
  StrategySignal,
  StrategyMetrics,

  // Tipos de Gestão (PARÂMETROS INJETÁVEIS)
  StrategyConfig,
  ManagementMetrics,
  StakingMethod,

  // Tipos de Execução (BOT)
  BetExecution,
  MarketEvent,

  // Tipos de Resultado
  StrategyResult,
  StrategyReport,

  // Enums
  Sport,
  MarketType,
  BetResult,
  RiskLevel,
} from '../types/strategy.types';

// =============================================================================
// INTERFACES DE DEPENDÊNCIA
// =============================================================================

/**
 * Interface para estratégia (lógica pura)
 *
 * @description A estratégia NÃO sabe sobre stake, bankroll, ou limites
 */
interface IStrategy {
  /** ID da estratégia */
  readonly id: string;

  /** Versão da estratégia */
  readonly version: string;

  /**
   * Avalia evento de mercado e retorna signal se houver oportunidade
   *
   * @param event - Evento de mercado
   * @returns Signal se houver oportunidade, undefined caso contrário
   *
   * @remarks
   * Este método contém APENAS lógica de trigger e entrada.
   * NÃO calcula stake, NÃO valida limites de bankroll.
   */
  evaluate(event: MarketEvent): Promise<StrategySignal | undefined>;

  /**
   * Valida se entrada é permitida (regras de exclusão)
   *
   * @param signal - Signal gerado
   * @returns Resultado da validação
   */
  validateEntry(signal: StrategySignal): Promise<{
    canEnter: boolean;
    reasons: string[];
  }>;
}

/**
 * Interface para repositório de configuração
 */
interface IConfigRepository {
  /**
   * Carrega configuração de gestão para uma estratégia
   *
   * @param strategyId - ID da estratégia
   * @param profile - Perfil de risco (opcional)
   * @returns Configuração de gestão
   */
  loadConfig(strategyId: string, profile?: string): Promise<StrategyConfig>;
}

/**
 * Interface para exchange/broker
 */
interface IExchange {
  /**
   * Executa aposta na exchange
   *
   * @param signal - Signal da estratégia
   * @param stake - Stake calculada pela gestão
   * @param odds - Odd alvo
   * @returns Resultado da execução
   */
  placeBet(
    signal: StrategySignal,
    stake: number,
    odds: number
  ): Promise<{
    betId: string;
    status: 'ACCEPTED' | 'REJECTED';
    executedOdds?: number;
    reason?: string;
  }>;
}

/**
 * Interface para serviço de bankroll
 */
interface IBankrollService {
  /** Bankroll atual */
  getCurrentBankroll(): Promise<number>;

  /** Exposição atual (por partida, dia, etc.) */
  getCurrentExposure(matchId?: string): Promise<{
    perMatch: number;
    perDay: number;
    consecutiveLosses: number;
    dailyPnL: number;
  }>;

  /** Registra resultado de aposta */
  recordResult(result: StrategyResult): Promise<void>;
}

/**
 * Interface para logger
 */
interface ILogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

// =============================================================================
// IMPLEMENTAÇÃO DO BOT
// =============================================================================

/**
 * Trading Bot - Implementação de Exemplo
 *
 * @description Bot que separa claramente estratégia (lógica) de gestão (parâmetros)
 *
 * @example
 * ```typescript
 * // 1. Criar instâncias
 * const strategy = new TennisFavorite30ComebackStrategy();
 * const configRepo = new ConfigRepository();
 * const exchange = new BetfairExchange();
 * const bankroll = new BankrollService();
 * const logger = new ConsoleLogger();
 *
 * // 2. Criar bot com injeção de dependência
 * const bot = new TradingBot({
 *   strategy,
 *   configRepo,
 *   exchange,
 *   bankroll,
 *   logger,
 * });
 *
 * // 3. Inicializar (carrega config de gestão)
 * await bot.initialize('TENNIS_FAV_30_0_COMEBACK', 'moderate');
 *
 * // 4. Processar eventos
 * bot.onMarketEvent(event);
 * ```
 */
export class TradingBot {
  // Dependências
  private readonly strategy: IStrategy;
  private readonly configRepo: IConfigRepository;
  private readonly exchange: IExchange;
  private readonly bankroll: IBankrollService;
  private readonly logger: ILogger;

  // Estado
  private config: StrategyConfig | null = null;
  private isInitialized = false;

  // Métricas (separadas por camada)
  private strategyMetrics: StrategyMetrics = {
    totalOpportunities: 0,
    totalTriggers: 0,
    totalEntries: 0,
    triggerRate: 0,
    entryRate: 0,
    fillRate: 0,
    winRate: 0,
    averageOdds: 0,
    averageConfidence: 0,
  };

  private managementMetrics: ManagementMetrics = {
    roi: 0,
    totalProfit: 0,
    totalStake: 0,
    maxDrawdown: 0,
    currentDrawdown: 0,
    profitFactor: 0,
    expectancy: 0,
  };

  constructor(params: {
    strategy: IStrategy;
    configRepo: IConfigRepository;
    exchange: IExchange;
    bankroll: IBankrollService;
    logger: ILogger;
  }) {
    this.strategy = params.strategy;
    this.configRepo = params.configRepo;
    this.exchange = params.exchange;
    this.bankroll = params.bankroll;
    this.logger = params.logger;
  }

  // ===========================================================================
  // INICIALIZAÇÃO
  // ===========================================================================

  /**
   * Inicializa o bot carregando estratégia e configuração de gestão
   *
   * @param strategyId - ID da estratégia
   * @param profile - Perfil de risco (opcional, usa padrão da config)
   *
   * @remarks
   * Este método demonstra a SEPARAÇÃO ARQUITETURAL:
   * 1. Estratégia é carregada como lógica pura
   * 2. Configuração de gestão é injetada separadamente
   */
  async initialize(strategyId: string, profile?: string): Promise<void> {
    this.logger.info('Inicializando bot...', { strategyId, profile });

    // 1. Validar estratégia
    if (!this.strategy.id) {
      throw new Error('Estratégia não possui ID válido');
    }

    if (this.strategy.id !== strategyId) {
      throw new Error(
        `Strategy ID mismatch: expected ${strategyId}, got ${this.strategy.id}`
      );
    }

    // 2. Carregar configuração de gestão (INJEÇÃO)
    this.config = await this.configRepo.loadConfig(strategyId, profile);

    if (!this.config) {
      throw new Error(`Configuração não encontrada para ${strategyId}`);
    }

    // 3. Validar separação arquitetural
    this.validateSeparation();

    // 4. Log de inicialização (separando camadas)
    this.logger.info('Bot inicializado com sucesso', {
      strategy: {
        id: this.strategy.id,
        version: this.strategy.version,
        layer: 'LOGIC (WHAT)',
      },
      management: {
        configVersion: this.config.configVersion,
        stakingMethod: this.config.staking.method,
        stakeValue: this.config.staking.value,
        layer: 'GESTION (HOW MUCH)',
      },
    });

    this.isInitialized = true;
  }

  /**
   * Valida separação arquitetural entre estratégia e gestão
   *
   * @throws Error se estratégia contiver parâmetros de gestão
   */
  private validateSeparation(): void {
    if (!this.config) {
      throw new Error('Configuração não carregada');
    }

    // Validações de compliance
    const errors: string[] = [];

    // Estratégia NÃO deve conter:
    // - Valores de stake
    // - Limites de bankroll
    // - Circuit breakers
    // (Estas validações são feitas no schema, mas podemos double-check)

    // Config NÃO deve conter:
    // - Lógica de trigger
    // - Regras de entrada/saída
    // (Estas validações são feitas no schema)

    if (errors.length > 0) {
      throw new Error(
        `Violação de separação arquitetural: ${errors.join(', ')}`
      );
    }

    this.logger.debug('Separação arquitetural validada');
  }

  // ===========================================================================
  // PROCESSAMENTO DE EVENTOS
  // ===========================================================================

  /**
   * Processa evento de mercado
   *
   * @param event - Evento de mercado
   *
   * @remarks
   * FLUXO:
   * 1. Estratégia avalia evento (lógica pura)
   * 2. Se signal gerado, gestão calcula stake
   * 3. Valida limites de exposição
   * 4. Executa aposta
   * 5. Reporta resultados (métricas separadas)
   */
  async onMarketEvent(event: MarketEvent): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bot não inicializado. Chame initialize() primeiro.');
    }

    if (!this.config) {
      throw new Error('Configuração não carregada');
    }

    this.strategyMetrics.totalOpportunities++;

    try {
      // =========================================================
      // FASE 1: ESTRATÉGIA (LÓGICA PURA)
      // =========================================================
      this.logger.debug('Fase 1: Avaliando estratégia...', {
        eventId: event.eventId,
      });

      const signal = await this.strategy.evaluate(event);

      if (!signal) {
        this.logger.debug('Nenhuma oportunidade identificada', {
          eventId: event.eventId,
        });
        return;
      }

      this.strategyMetrics.totalTriggers++;

      // Validar entrada (regras de exclusão da estratégia)
      const validation = await this.strategy.validateEntry(signal);

      if (!validation.canEnter) {
        this.logger.info('Entrada excluída por regras da estratégia', {
          signalId: signal.signalId,
          reasons: validation.reasons,
          layer: 'STRATEGY',
        });
        return;
      }

      this.strategyMetrics.totalEntries++;

      // =========================================================
      // FASE 2: GESTÃO (PARÂMETROS INJETADOS)
      // =========================================================
      this.logger.debug('Fase 2: Aplicando gestão...', {
        signalId: signal.signalId,
      });

      // 2.1 Validar odds (filtro de gestão)
      const oddsValid = this.validateOdds(signal.market.selection.odds);
      if (!oddsValid) {
        this.logger.info('Odds fora do range de gestão', {
          signalId: signal.signalId,
          odds: signal.market.selection.odds,
          minOdds: this.config.odds.min,
          maxOdds: this.config.odds.max,
          layer: 'MANAGEMENT',
        });
        return;
      }

      // 2.2 Calcular stake (gestão)
      const bankroll = await this.bankroll.getCurrentBankroll();
      const stake = this.calculateStake(signal, bankroll);

      this.logger.info('Stake calculada', {
        signalId: signal.signalId,
        bankroll,
        stake,
        stakingMethod: this.config.staking.method,
        layer: 'MANAGEMENT',
      });

      // 2.3 Validar limites de exposição (gestão)
      const exposure = await this.bankroll.getCurrentExposure(
        signal.match.matchId
      );

      const withinLimits = this.checkExposureLimits(stake, exposure);
      if (!withinLimits) {
        this.logger.warn('Limites de exposição excedidos', {
          signalId: signal.signalId,
          stake,
          exposure,
          layer: 'MANAGEMENT',
        });
        return;
      }

      // 2.4 Verificar circuit breakers (gestão)
      const circuitBreakerTriggered = this.checkCircuitBreakers(exposure);
      if (circuitBreakerTriggered) {
        this.logger.warn('Circuit breaker ativado', {
          signalId: signal.signalId,
          exposure,
          layer: 'MANAGEMENT',
        });
        return;
      }

      // =========================================================
      // FASE 3: EXECUÇÃO
      // =========================================================
      this.logger.debug('Fase 3: Executando aposta...', {
        signalId: signal.signalId,
      });

      const executionResult = await this.exchange.placeBet(
        signal,
        stake,
        signal.market.selection.odds
      );

      if (executionResult.status === 'REJECTED') {
        this.logger.error('Aposta rejeitada', {
          signalId: signal.signalId,
          reason: executionResult.reason,
        });
        return;
      }

      // Criar registro de execução
      const execution: BetExecution = {
        executionId: crypto.randomUUID(),
        signalId: signal.signalId,
        betId: executionResult.betId,
        signal,
        stake,
        stakingMethod: this.config.staking.method,
        odds: executionResult.executedOdds || signal.market.selection.odds,
        oddsType: 'DECIMAL',
        executedAt: new Date(),
        exchange: 'BETFAIR', // Exemplo
        status: 'ACCEPTED',
        slippage: executionResult.executedOdds
          ? Math.abs(executionResult.executedOdds - signal.market.selection.odds)
          : 0,
        metadata: {
          latency_ms: 150, // Exemplo
        },
      };

      this.logger.info('Aposta executada com sucesso', {
        executionId: execution.executionId,
        betId: execution.betId,
        stake,
        odds: execution.odds,
        layer: 'EXECUTION',
      });

      // Atualizar métricas de fill rate
      this.updateFillMetrics();

    } catch (error) {
      this.logger.error('Erro ao processar evento', {
        eventId: event.eventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ===========================================================================
  // CÁLCULOS DE GESTÃO
  // ===========================================================================

  /**
   * Valida odds contra configuração de gestão
   */
  private validateOdds(odds: number): boolean {
    if (!this.config) return false;

    return odds >= this.config.odds.min && odds <= this.config.odds.max;
  }

  /**
   * Calcula stake baseada na configuração de gestão
   *
   * @param signal - Signal da estratégia
   * @param bankroll - Bankroll atual
   * @returns Stake calculada
   *
   * @remarks
   * Este método usa APENAS parâmetros de gestão injetados.
   * A estratégia NÃO sabe como a stake é calculada.
   */
  private calculateStake(signal: StrategySignal, bankroll: number): number {
    if (!this.config) {
      throw new Error('Configuração não carregada');
    }

    let stake: number;

    switch (this.config.staking.method) {
      case StakingMethod.PERCENTAGE:
        stake = bankroll * (this.config.staking.value / 100);
        break;

      case StakingMethod.KELLY:
        stake = this.calculateKelly(signal, bankroll);
        break;

      case StakingMethod.FIXED:
        stake = this.config.staking.value;
        break;

      default:
        throw new Error(
          `Método de staking desconhecido: ${this.config.staking.method}`
        );
    }

    // Aplicar limites absolutos
    stake = Math.max(stake, this.config.staking.limits.min);
    stake = Math.min(stake, this.config.staking.limits.max);

    return stake;
  }

  /**
   * Calcula stake usando critério de Kelly
   *
   * @param signal - Signal da estratégia
   * @param bankroll - Bankroll atual
   * @returns Stake calculada pelo método Kelly
   */
  private calculateKelly(signal: StrategySignal, bankroll: number): number {
    if (!this.config) {
      throw new Error('Configuração não carregada');
    }

    // Kelly simplificado: f = (bp - q) / b
    // onde:
    //   b = odds - 1 (ganhos líquidos)
    //   p = probabilidade estimada de win
    //   q = 1 - p (probabilidade de loss)

    const odds = signal.market.selection.odds;
    const estimatedWinProb = signal.metadata.confidence; // Usar confiança como proxy
    const b = odds - 1;
    const p = estimatedWinProb;
    const q = 1 - p;

    const kellyFraction = (b * p - q) / b;

    // Aplicar fração do Kelly (ex: 0.25 = quarter Kelly)
    const kellyValue = this.config.staking.value; // Ex: 0.25
    const adjustedFraction = Math.max(0, kellyFraction * kellyValue);

    return bankroll * adjustedFraction;
  }

  /**
   * Verifica limites de exposição
   */
  private checkExposureLimits(
    stake: number,
    exposure: {
      perMatch: number;
      perDay: number;
      consecutiveLosses: number;
      dailyPnL: number;
    }
  ): boolean {
    if (!this.config) return false;

    // Check per match
    if (exposure.perMatch + stake > this.config.exposure.per_match.max_stake) {
      return false;
    }

    // Check per day
    if (exposure.perDay + stake > this.config.exposure.per_day.max_stake) {
      return false;
    }

    // Check daily loss
    if (
      Math.abs(exposure.dailyPnL) >= this.config.exposure.per_day.max_loss &&
      exposure.dailyPnL < 0
    ) {
      return false;
    }

    return true;
  }

  /**
   * Verifica circuit breakers
   */
  private checkCircuitBreakers(exposure: {
    perMatch: number;
    perDay: number;
    consecutiveLosses: number;
    dailyPnL: number;
  }): boolean {
    if (!this.config) return false;

    // Check daily loss stop
    if (
      exposure.dailyPnL <= -this.config.circuit_breakers.daily.loss_stop
    ) {
      this.logger.warn('Daily loss stop atingido!', {
        dailyPnL: exposure.dailyPnL,
        lossStop: this.config.circuit_breakers.daily.loss_stop,
      });
      return true;
    }

    // Check consecutive losses
    if (
      this.config.circuit_breakers.daily.consecutive_loss_pause_hours &&
      exposure.consecutiveLosses >=
        this.config.circuit_breakers.daily.consecutive_loss_pause
    ) {
      this.logger.warn('Consecutive losses pause ativado!', {
        consecutiveLosses: exposure.consecutiveLosses,
      });
      return true;
    }

    return false;
  }

  // ===========================================================================
  // MÉTRICAS E REPORTING
  // ===========================================================================

  /**
   * Atualiza métricas de fill rate
   */
  private updateFillMetrics(): void {
    if (this.strategyMetrics.totalEntries === 0) return;

    this.strategyMetrics.fillRate =
      this.strategyMetrics.totalEntries / this.strategyMetrics.totalTriggers;
  }

  /**
   * Registra resultado de aposta (após settlement)
   *
   * @param result - Resultado da aposta
   *
   * @remarks
   * Atualiza métricas SEPARADAMENTE:
   * - Strategy metrics: win rate, trigger rate, etc.
   * - Management metrics: ROI, drawdown, Sharpe, etc.
   */
  async onBetSettled(result: StrategyResult): Promise<void> {
    this.logger.info('Aposta liquidada', {
      resultId: result.resultId,
      betResult: result.result,
      profit: result.profit,
      layer: 'SETTLEMENT',
    });

    // Atualizar métricas de estratégia
    if (result.result === BetResult.WIN) {
      this.strategyMetrics.winRate =
        (this.strategyMetrics.winRate *
          (this.strategyMetrics.totalEntries - 1) +
          1) /
        this.strategyMetrics.totalEntries;
    }

    this.strategyMetrics.averageOdds =
      (this.strategyMetrics.averageOdds *
        (this.strategyMetrics.totalEntries - 1) +
        result.odds) /
      this.strategyMetrics.totalEntries;

    // Atualizar métricas de gestão
    this.managementMetrics.totalStake += result.stake;
    this.managementMetrics.totalProfit += result.profit;

    if (this.managementMetrics.totalStake > 0) {
      this.managementMetrics.roi =
        (this.managementMetrics.totalProfit /
          this.managementMetrics.totalStake) *
        100;
    }

    // Registrar no bankroll service
    await this.bankroll.recordResult(result);
  }

  /**
   * Gera relatório completo
   *
   * @returns Relatório com métricas separadas por camada
   */
  generateReport(): StrategyReport {
    return {
      startDate: new Date(), // Em produção, armazenar data de início
      endDate: new Date(),
      strategyVersion: this.strategy.version,
      configVersion: this.config?.configVersion,
      strategyMetrics: { ...this.strategyMetrics },
      managementMetrics: { ...this.managementMetrics },
      results: [], // Em produção, retornar resultados individuais
      analysis: {
        // Análise separada por camada
      },
    };
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  /**
   * Retorna métricas de estratégia (lógica)
   */
  getStrategyMetrics(): StrategyMetrics {
    return { ...this.strategyMetrics };
  }

  /**
   * Retorna métricas de gestão (parâmetros)
   */
  getManagementMetrics(): ManagementMetrics {
    return { ...this.managementMetrics };
  }

  /**
   * Retorna configuração atual de gestão
   */
  getConfig(): StrategyConfig | null {
    return this.config;
  }
}

// =============================================================================
// EXEMPLO DE USO
// =============================================================================

/**
 * Exemplo de uso do TradingBot
 *
 * @description Este exemplo demonstra o fluxo completo de inicialização
 *              e processamento de eventos com separação arquitetural
 */
export async function botUsageExample(): Promise<void> {
  // 1. Configurar dependências (mocks para exemplo)
  const mockStrategy: IStrategy = {
    id: 'TENNIS_FAV_30_0_COMEBACK',
    version: 'v1.0.0',
    evaluate: async (event) => {
      // Lógica de trigger simplificada
      if (event.data.score === '30-0') {
        return {
          signalId: crypto.randomUUID(),
          triggerId: crypto.randomUUID(),
          strategyId: 'TENNIS_FAV_30_0_COMEBACK',
          version: 'v1.0.0',
          timestamp: new Date(),
          match: {
            matchId: 'match-123',
            tournament: {
              id: 'atp-1',
              name: 'ATP Tour',
              tier: 'ATP',
            },
            surface: 'CLAY',
            round: 'R1',
            homePlayer: { playerId: 'p1', name: 'Nadal' },
            awayPlayer: { playerId: 'p2', name: 'Djokovic' },
            status: 'LIVE',
          },
          selection: {
            playerId: 'p1',
            playerName: 'Nadal',
            role: 'FAVORITE',
            condition: 'SERVING_AT_30_0_DOWN',
          },
          market: {
            marketType: MarketType.GAME_WINNER,
            marketId: 'market-456',
            selection: {
              playerId: 'p1',
              odds: 2.10,
            },
            oddsTimestamp: new Date(),
          },
          validation: {
            canEnter: true,
            reasons: [],
            checks: {
              triggerActive: true,
              marketAvailable: true,
              selectionIdentified: true,
              oddsValid: true,
              exclusionsClear: true,
            },
          },
          metadata: {
            riskLevel: RiskLevel.MEDIUM,
            confidence: 0.65,
            exclusionChecks: {},
          },
        };
      }
      return undefined;
    },
    validateEntry: async (signal) => ({
      canEnter: true,
      reasons: [],
    }),
  };

  const mockConfigRepo: IConfigRepository = {
    loadConfig: async (strategyId, profile) => ({
      strategyId,
      configVersion: 'cfg-1.0.0',
      name: 'Favorite 30-0 Comeback',
      odds: { min: 1.70, max: 3.50 },
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
  };

  const mockExchange: IExchange = {
    placeBet: async (signal, stake, odds) => ({
      betId: crypto.randomUUID(),
      status: 'ACCEPTED',
      executedOdds: odds,
    }),
  };

  const mockBankroll: IBankrollService = {
    getCurrentBankroll: async () => 10000,
    getCurrentExposure: async () => ({
      perMatch: 0,
      perDay: 0,
      consecutiveLosses: 0,
      dailyPnL: 0,
    }),
    recordResult: async () => {},
  };

  const mockLogger: ILogger = {
    info: (msg, data) => console.log('[INFO]', msg, data),
    warn: (msg, data) => console.warn('[WARN]', msg, data),
    error: (msg, data) => console.error('[ERROR]', msg, data),
    debug: (msg, data) => console.debug('[DEBUG]', msg, data),
  };

  // 2. Criar bot
  const bot = new TradingBot({
    strategy: mockStrategy,
    configRepo: mockConfigRepo,
    exchange: mockExchange,
    bankroll: mockBankroll,
    logger: mockLogger,
  });

  // 3. Inicializar (carrega config de gestão)
  await bot.initialize('TENNIS_FAV_30_0_COMEBACK', 'moderate');

  // 4. Processar evento
  const mockEvent: MarketEvent = {
    eventId: 'event-789',
    eventType: 'SCORE_CHANGE',
    timestamp: new Date(),
    data: {
      matchId: 'match-123',
      score: '30-0',
    },
  };

  await bot.onMarketEvent(mockEvent);

  // 5. Gerar relatório
  const report = bot.generateReport();
  console.log('Relatório:', report);
}

// Export para execução como script
if (typeof require !== 'undefined' && require.main === module) {
  botUsageExample().catch(console.error);
}
