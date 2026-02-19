/**
 * Types TypeScript para Estratégias BET-SPORTS
 *
 * @module strategy-sports/types
 * @description Interfaces e tipos para separação arquitetural entre
 *              Estratégia (lógica) e Gestão (parâmetros)
 *
 * ⚠️ PRINCÍPIO FUNDAMENTAL:
 * ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.
 *
 * @see {@link ../PROTOCOLS.md} para protocolos formais
 */

// =============================================================================
// ENUMS BASE
// =============================================================================

/**
 * Esportes suportados
 */
export enum Sport {
  TENNIS = 'TENNIS',
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  BASEBALL = 'BASEBALL',
  HOCKEY = 'HOCKEY',
}

/**
 * Tipos de mercado
 */
export enum MarketType {
  MATCH_WINNER = 'MATCH_WINNER',
  GAME_WINNER = 'GAME_WINNER',
  SET_WINNER = 'SET_WINNER',
  POINT_WINNER = 'POINT_WINNER',
  HANDICAP = 'HANDICAP',
  TOTALS = 'TOTALS',
  CORRECT_SCORE = 'CORRECT_SCORE',
}

/**
 * Status de mercado
 */
export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  SETTLED = 'SETTLED',
  VOID = 'VOID',
}

/**
 * Status de partida
 */
export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  SUSPENDED = 'SUSPENDED',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

/**
 * Superfícies de tênis
 */
export enum TennisSurface {
  CLAY = 'CLAY',
  GRASS = 'GRASS',
  HARD = 'HARD',
  CARPET = 'CARPET',
}

/**
 * Níveis de torneio
 */
export enum TournamentTier {
  ATP = 'ATP',
  WTA = 'WTA',
  GRAND_SLAM = 'GRAND_SLAM',
  MASTERS = 'MASTERS',
  CHALLENGER = 'CHALLENGER',
  ITF = 'ITF',
}

/**
 * Resultado de aposta
 */
export enum BetResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  VOID = 'VOID',
  PENDING = 'PENDING',
}

/**
 * Nível de risco
 */
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Método de staking
 */
export enum StakingMethod {
  PERCENTAGE = 'percentage',
  KELLY = 'kelly',
  FIXED = 'fixed',
}

/**
 * Perfil de risco
 */
export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
}

/**
 * Fase de operação
 */
export enum OperationPhase {
  VALIDATION = 'validation',
  STANDARD = 'standard',
  FULL = 'full',
}

// =============================================================================
// TYPES DE ESTRATÉGIA (LÓGICA PURA)
// =============================================================================

/**
 * Identificador único de estratégia
 */
export type StrategyId = string;

/**
 * Versão de estratégia (SemVer)
 */
export type StrategyVersion = string; // Ex: "v1.0.0"

/**
 * Gatilho da estratégia - Define QUANDO entrar
 *
 * @description Contém APENAS lógica de identificação de oportunidade
 * @see StrategyConfig para parâmetros de gestão
 */
export interface StrategyTrigger {
  /** ID único do trigger */
  triggerId: string;

  /** ID da estratégia */
  strategyId: StrategyId;

  /** Versão da estratégia */
  version: StrategyVersion;

  /** Timestamp do trigger */
  timestamp: Date;

  /** Esporte */
  sport: Sport;

  /** Mercado alvo */
  marketType: MarketType;

  /** Condições atendidas */
  conditions: {
    [key: string]: boolean;
  };

  /** Dados contextuais do trigger */
  context: {
    [key: string]: unknown;
  };

  /** Metadados */
  metadata: {
    /** Nível de risco baseado na lógica */
    riskLevel: RiskLevel;

    /** Score de confiança (0-1) */
    confidence: number;

    /** Regras de exclusão aplicadas */
    exclusionChecks: {
      [key: string]: boolean;
    };
  };
}

/**
 * Sinal gerado pela estratégia
 *
 * @description Sinal de oportunidade SEM parâmetros de gestão
 *              (stake, limits, etc. são injetados depois)
 */
export interface StrategySignal {
  // Identificação
  /** ID único do signal */
  signalId: string;

  /** ID do trigger que gerou este signal */
  triggerId: string;

  /** ID da estratégia */
  strategyId: StrategyId;

  /** Versão da estratégia */
  version: StrategyVersion;

  /** Timestamp do signal */
  timestamp: Date;

  // Partida
  /** Dados da partida */
  match: {
    /** ID da partida */
    matchId: string;

    /** Torneio */
    tournament: {
      id: string;
      name: string;
      tier: TournamentTier;
    };

    /** Superfície */
    surface: TennisSurface | string;

    /** Rodada */
    round: string;

    /** Jogador da casa */
    homePlayer: Player;

    /** Jogador visitante */
    awayPlayer: Player;

    /** Status da partida */
    status: MatchStatus;
  };

  // Seleção
  /** Seleção identificada */
  selection: {
    /** ID do jogador/seleção */
    playerId: string;

    /** Nome do jogador/seleção */
    playerName: string;

    /** Papel na estratégia */
    role: string;

    /** Condição específica */
    condition: string;
  };

  // Mercado
  /** Dados do mercado */
  market: {
    /** Tipo de mercado */
    marketType: MarketType;

    /** ID do mercado */
    marketId: string;

    /** Seleção no mercado */
    selection: {
      playerId: string;
      odds: number;
    };

    /** Timestamp das odds */
    oddsTimestamp: Date;
  };

  // Placar/Contexto
  /** Placar atual */
  score?: {
    /** Placar do game/set/match */
    gameScore?: string;
    setScore?: string;
    matchScore?: string;

    /** Pontos específicos */
    [key: string]: string | undefined;
  };

  // Validação
  /** Validações de entrada */
  validation: {
    /** Pode entrar? */
    canEnter: boolean;

    /** Razões */
    reasons: string[];

    /** Checks individuais */
    checks: {
      triggerActive: boolean;
      marketAvailable: boolean;
      selectionIdentified: boolean;
      oddsValid: boolean;
      exclusionsClear: boolean;
    };
  };

  // Metadados
  /** Metadados da estratégia */
  metadata: {
    /** Nível de risco */
    riskLevel: RiskLevel;

    /** Score de confiança */
    confidence: number;

    /** Checks de exclusão */
    exclusionChecks: {
      [key: string]: boolean;
    };
  };
}

/**
 * Jogador/Participante
 */
export interface Player {
  /** ID do jogador */
  playerId: string;

  /** Nome */
  name: string;

  /** Ranking (se aplicável) */
  ranking?: number;

  /** País (opcional) */
  country?: string;
}

// =============================================================================
// TYPES DE GESTÃO (PARÂMETROS INJETÁVEIS)
// =============================================================================

/**
 * Configuração de gestão injetável
 *
 * @description Contém APENAS parâmetros matemáticos de alocação de risco
 *              NÃO contém lógica de trigger ou entrada
 */
export interface StrategyConfig {
  /** ID da estratégia */
  strategyId: StrategyId;

  /** Versão da config */
  configVersion: string; // Ex: "cfg-1.0.0"

  /** Nome da estratégia */
  name: string;

  // Odds (filtro de mercado)
  /** Range de odds aceitáveis */
  odds: {
    /** Odd mínima */
    min: number;

    /** Odd máxima */
    max: number;

    /** Faixa ideal (para análise) */
    ideal?: {
      min: number;
      max: number;
    };
  };

  // Staking (método de alocação)
  /** Configuração de stake */
  staking: {
    /** Método de cálculo */
    method: StakingMethod;

    /** Valor base */
    value: number;

    /** Limites absolutos */
    limits: {
      min: number;
      max: number;
    };
  };

  // Bankroll (gestão de capital)
  /** Configuração de bankroll */
  bankroll?: {
    /** Bankroll inicial */
    initial: number;

    /** Alocação percentual */
    allocation: {
      active: number;
      reserve: number;
      emergency: number;
    };

    /** Thresholds de rebalance */
    rebalance?: {
      active_threshold: number;
      reserve_threshold: number;
      take_profit_threshold: number;
    };
  };

  // Exposure (limites de risco)
  /** Limites de exposição */
  exposure: {
    /** Por partida */
    per_match: {
      max_bets: number;
      max_stake: number;
      stop_after_losses?: number;
    };

    /** Por dia */
    per_day: {
      max_bets: number;
      max_stake: number;
      max_loss: number;
      consecutive_loss_pause?: number;
    };

    /** Por semana (opcional) */
    per_week?: {
      max_drawdown: number;
      max_bets: number;
    };

    /** Por mês (opcional) */
    per_month?: {
      max_drawdown: number;
      target_roi?: number;
    };
  };

  // Circuit breakers (paradas de emergência)
  /** Circuit breakers */
  circuit_breakers: {
    /** Diário */
    daily: {
      loss_stop: number;
      consecutive_loss_pause_hours?: number;
      stake_reduction?: {
        trigger_loss: number;
        reduction_percent: number;
      };
    };

    /** Semanal (opcional) */
    weekly?: {
      drawdown_stop: number;
      roi_review_threshold?: number;
    };

    /** Mensal (opcional) */
    monthly?: {
      drawdown_stop: number;
      deactivate_after_negative_months?: number;
    };
  };

  // Perfis de risco (presets)
  /** Perfis disponíveis */
  profiles?: {
    conservative?: RiskProfileConfig;
    moderate?: RiskProfileConfig;
    aggressive?: RiskProfileConfig;
  };

  // Fases de operação
  /** Fases de ramp-up */
  phases?: {
    validation: OperationPhaseConfig;
    standard: OperationPhaseConfig;
    full: OperationPhaseConfig;
  };

  // Monitoramento
  /** Configuração de monitoramento */
  monitoring?: {
    alerts: {
      stake_exceeded: boolean;
      daily_loss_warning: number;
      daily_loss_critical: number;
      consecutive_losses_warning: number;
      consecutive_losses_critical: number;
    };
  };
}

/**
 * Configuração de perfil de risco
 */
export interface RiskProfileConfig {
  description: string;
  staking: {
    method: StakingMethod;
    value: number;
    limits: {
      min: number;
      max: number;
    };
  };
  exposure: {
    per_day: {
      max_bets: number;
      max_loss: number;
    };
  };
  circuit_breakers: {
    daily: {
      loss_stop: number;
    };
  };
}

/**
 * Configuração de fase de operação
 */
export interface OperationPhaseConfig {
  min_bets: number;
  max_bets: number | null;
  profile: RiskProfile;
  criteria_graduation?: {
    win_rate_min: number;
    roi_min: number;
  } | null;
}

// =============================================================================
// TYPES DE EXECUÇÃO (BOT)
// =============================================================================

/**
 * Dados de aposta executada
 *
 * @description Combina signal (estratégia) + stake (gestão)
 */
export interface BetExecution {
  // Referência
  /** ID da execução */
  executionId: string;

  /** ID do signal */
  signalId: string;

  /** ID da aposta na exchange */
  betId?: string;

  // Estratégia
  /** Dados do signal (estratégia) */
  signal: StrategySignal;

  // Gestão
  /** Stake calculada (gestão) */
  stake: number;

  /** Tipo de staking usado */
  stakingMethod: StakingMethod;

  // Execução
  /** Odd executada */
  odds: number;

  /** Tipo de odd */
  oddsType: 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL';

  /** Timestamp da execução */
  executedAt: Date;

  /** Exchange/Broker */
  exchange: string;

  /** Status da execução */
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

  /** Razão (se rejeitado/cancelado) */
  reason?: string;

  // Slippage
  /** Odd no signal */
  signalOdds?: number;

  /** Slippage */
  slippage?: number;

  // Metadados
  metadata: {
    /** Latência (ms) */
    latency_ms?: number;

    /** Tentativas */
    retries?: number;

    /** ID da ordem na exchange */
    exchangeOrderId?: string;
  };
}

// =============================================================================
// TYPES DE RESULTADO
// =============================================================================

/**
 * Resultado de backtest/live
 *
 * @description Contém métricas separadas por camada (estratégia vs gestão)
 */
export interface StrategyResult {
  // Identificação
  /** ID do resultado */
  resultId: string;

  /** ID do signal */
  signalId: string;

  /** ID da aposta (se executada) */
  betId?: string;

  /** ID da estratégia */
  strategyId: StrategyId;

  /** Versão da estratégia */
  version: StrategyVersion;

  /** Versão da config */
  configVersion?: string;

  // Execução
  /** Stake executada */
  stake: number;

  /** Odd executada */
  odds: number;

  /** Tipo de odd */
  oddsType: 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL';

  // Resultado
  /** Resultado da aposta */
  result: BetResult;

  /** Profit/prejuízo */
  profit: number;

  /** ROI da aposta */
  roi: number;

  /** Timestamp de settlement */
  settledAt: Date;

  // Análise (opcional)
  /** Análise pós-jogo */
  analysis?: {
    /** Probabilidade real observada */
    actualWinProbability?: number;

    /** Edge realizado */
    edgeRealized?: number;

    /** Duração (segundos) */
    duration?: number;

    /** Dados específicos do evento */
    [key: string]: unknown;
  };

  // Contexto (para análise agregada)
  context?: {
    /** Bankroll antes */
    bankrollBefore?: number;

    /** Bankroll depois */
    bankrollAfter?: number;

    /** Drawdown no momento */
    drawdown?: number;

    /** Sequência de losses */
    consecutiveLosses?: number;
  };
}

/**
 * Métricas de estratégia (lógica)
 */
export interface StrategyMetrics {
  // Volume
  /** Total de oportunidades */
  totalOpportunities: number;

  /** Total de triggers */
  totalTriggers: number;

  /** Total de entradas */
  totalEntries: number;

  // Taxas
  /** Trigger rate */
  triggerRate: number;

  /** Entry rate */
  entryRate: number;

  /** Fill rate */
  fillRate: number;

  // Qualidade
  /** Win rate */
  winRate: number;

  /** Odd média */
  averageOdds: number;

  /** Confiança média */
  averageConfidence: number;
}

/**
 * Métricas de gestão (parâmetros)
 */
export interface ManagementMetrics {
  // Financeiras
  /** ROI total */
  roi: number;

  /** Profit total */
  totalProfit: number;

  /** Stake total */
  totalStake: number;

  // Risk-adjusted
  /** Sharpe ratio */
  sharpeRatio?: number;

  /** Sortino ratio */
  sortinoRatio?: number;

  /** Calmar ratio */
  calmarRatio?: number;

  // Drawdown
  /** Max drawdown */
  maxDrawdown: number;

  /** Drawdown atual */
  currentDrawdown: number;

  /** Duração do drawdown */
  drawdownDuration?: number;

  // Consistência
  /** Profit factor */
  profitFactor: number;

  /** Expectancy */
  expectancy: number;

  /** Win streak */
  winStreak?: number;

  /** Loss streak */
  lossStreak?: number;

  // Exposure
  /** Exposure média */
  averageExposure?: number;

  /** Exposure máxima */
  maxExposure?: number;
}

/**
 * Relatório completo de resultados
 */
export interface StrategyReport {
  // Período
  startDate: Date;
  endDate: Date;

  // Versões
  strategyVersion: StrategyVersion;
  configVersion?: string;

  // Estratégia (lógica)
  strategyMetrics: StrategyMetrics;

  // Gestão (parâmetros)
  managementMetrics: ManagementMetrics;

  // Resultados individuais
  results: StrategyResult[];

  // Análise
  analysis?: {
    /** Por período (hora, dia, semana) */
    byPeriod?: Record<string, ManagementMetrics>;

    /** Por mercado */
    byMarket?: Record<string, ManagementMetrics>;

    /** Por odds range */
    byOddsRange?: Record<string, ManagementMetrics>;

    /** Overfitting checks */
    overfittingChecks?: {
      inSample: ManagementMetrics;
      outOfSample: ManagementMetrics;
      degradation: number;
    };
  };
}

// =============================================================================
// TYPES DE EVENTO DE MERCADO
// =============================================================================

/**
 * Evento de mercado
 */
export interface MarketEvent {
  /** ID do evento */
  eventId: string;

  /** Tipo de evento */
  eventType: 'ODDS_CHANGE' | 'SCORE_CHANGE' | 'MARKET_STATUS' | 'MATCH_STATUS';

  /** Timestamp */
  timestamp: Date;

  /** Dados do evento */
  data: {
    matchId?: string;
    marketId?: string;
    selectionId?: string;
    odds?: number;
    score?: string;
    status?: MarketStatus | MatchStatus;
    [key: string]: unknown;
  };
}

// =============================================================================
// TYPES DE DADOS HISTÓRICOS (BACKTEST)
// =============================================================================

/**
 * Dados históricos para backtest
 */
export interface HistoricalData {
  /** ID do registro */
  id: string;

  /** Timestamp */
  timestamp: Date;

  /** Dados da partida */
  match: {
    matchId: string;
    homePlayer: Player;
    awayPlayer: Player;
    surface?: string;
    tournament?: string;
  };

  /** Placar */
  score: {
    gameScore?: string;
    setScore?: string;
    matchScore?: string;
    server?: string;
    [key: string]: string | undefined;
  };

  /** Odds históricas */
  odds: {
    marketType: MarketType;
    selectionId: string;
    odds: number;
    timestamp: Date;
  }[];

  /** Resultado final */
  result: {
    winner: string;
    finalScore: string;
    [key: string]: unknown;
  };
}

// =============================================================================
// TYPES DE LOG
// =============================================================================

/**
 * Log de estratégia
 */
export interface StrategyLog {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  category: 'TRIGGER' | 'ENTRY' | 'EXIT' | 'VALIDATION';
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Log de gestão
 */
export interface ManagementLog {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  category: 'STAKE' | 'EXPOSURE' | 'CIRCUIT_BREAKER' | 'RISK';
  message: string;
  data?: Record<string, unknown>;
}

// =============================================================================
// TYPES DE VALIDAÇÃO
// =============================================================================

/**
 * Validação de entrada
 */
export interface EntryValidation {
  canEnter: boolean;
  reasons: string[];
  checks: {
    triggerActive: boolean;
    marketAvailable: boolean;
    selectionIdentified: boolean;
    oddsValid: boolean;
    exclusionsClear: boolean;
  };
}

/**
 * Resultado de validação de separação
 */
export interface SeparationValidation {
  /** Estratégia está pura? */
  strategyIsPure: boolean;

  /** Config está limpa? */
  configIsClean: boolean;

  /** Separação válida? */
  separationValid: boolean;

  /** Erros encontrados */
  errors: string[];

  /** Warnings */
  warnings: string[];
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Sport,
  MarketType,
  MarketStatus,
  MatchStatus,
  TennisSurface,
  TournamentTier,
  BetResult,
  RiskLevel,
  StakingMethod,
  RiskProfile,
  OperationPhase,
};
