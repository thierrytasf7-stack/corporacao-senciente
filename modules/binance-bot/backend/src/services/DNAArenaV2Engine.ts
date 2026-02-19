/**
 * DNA ARENA V2 ENGINE - Consensus Signal Evolution
 *
 * Bots NÃO geram sinais próprios. Eles EVOLUEM quais das 30 estratégias
 * do Signal Pool ouvir e COMO combinar os sinais (consenso).
 *
 * Genome V2:
 *   - strategyMask[30]: quais estratégias ouvir (true/false)
 *   - strategyWeights[30]: peso de cada estratégia (0-2)
 *   - consensusRules: min sinais, max opostos, min força
 *   - riskParams: TP/SL/leverage
 *   - bettingParams: layer1 + layer2 (dupla camada preservada)
 *
 * Evolução: crossover de 2 pais + mutação por gene
 * Fitness: Sharpe Ratio × Profit Factor × Consistency
 */

import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from './BinanceApiService';
import { SignalPoolEngine, MarketSignals, PoolSignal } from './SignalPoolEngine';

// ======================== GENOME V2 INTERFACES ========================

export interface GenomeV2 {
    id: string;
    name: string;
    generation: number;
    parentIds: string[];     // Can have 2 parents (crossover)

    // GENE 1: Which strategies to listen to (30 bits)
    strategyMask: boolean[];

    // GENE 2: Weight per strategy (0-2, multiplier on signal strength)
    strategyWeights: number[];

    // GENE 3: Consensus rules
    consensus: {
        minAgreeingSignals: number;    // Min signals in same direction to trade
        maxOpposingSignals: number;    // Max signals in opposite direction allowed
        minWeightedStrength: number;   // Min weighted average strength (0-100)
        preferredDirection: 'ANY' | 'LONG_BIAS' | 'SHORT_BIAS';  // Directional bias
    };

    // GENE 4: Risk parameters (ATR-based dynamic TP/SL)
    risk: {
        atrMultiplierTP: number;       // TP = price ± ATR * this (1.0-5.0)
        atrMultiplierSL: number;       // SL = price ∓ ATR * this (0.5-3.0)
        trailingStopATR: number;       // Trailing stop distance in ATR units (0=disabled, 0.5-3.0)
        flipExitThreshold: number;     // Close position when N opposing signals appear (0=disabled, 3-15)
        leverage: number;              // 1-75x
        maxOpenPositions: number;      // Max concurrent
        maxExposurePercent: number;    // Max % of bankroll in open positions
    };

    // GENE 5: Bet sizing (dual layer preserved)
    betting: {
        basePercent: number;           // Base % of bankroll per trade
        winMultiplier: number;         // Multiply bet after win
        lossMultiplier: number;        // Multiply bet after loss
        maxBetPercent: number;         // Cap
        resetAfterLosses: number;      // Reset to base after N consecutive losses
    };

    // Symbols to trade
    symbols: string[];
}

export interface BotStateV2 {
    genome: GenomeV2;
    bankroll: number;
    initialBankroll: number;
    totalTrades: number;
    wins: number;
    losses: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    maxBankroll: number;
    minBankroll: number;
    maxDrawdown: number;
    openPositions: Map<string, PositionV2>;
    totalExposure: number;
    tradeHistory: TradeRecordV2[];
    pnlHistory: number[];         // Sequential PnL % per trade (for Sharpe/Sortino)
    isAlive: boolean;
    startTime: string;
    lastTradeTime: string | null;
    deathCount: number;
    sessionId: string;
    currentBetPercent: number;
    symbolCooldowns: Map<string, number>;  // symbol -> cycle when cooldown expires
    
    // ===== ODDS TRACKING (CEO-BINANCE directive) =====
    totalTakeProfitValue: number;   // Soma dos valores ganhos em TP
    totalStopLossValue: number;     // Soma dos valores perdidos em SL
    avgTakeProfitOdd: number;       // Média de odd do TP (quanto ganha quando acerta)
    avgStopLossOdd: number;         // Média de odd do SL (quanto perde quando erra)
    expectedValue: number;          // Expectativa matemática: (winRate * avgTP) - (lossRate * avgSL)
    
    // ===== STRATEGY METRICS (CEO-BINANCE directive) =====
    strategyMetrics: { [key: string]: StrategyMetrics };  // Métricas por estratégia
}

export interface PositionV2 {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    quantity: number;
    leverage: number;
    betAmount: number;
    takeProfitPrice: number;
    stopLossPrice: number;
    trailingStopDistance: number;  // ATR-based trailing distance (0 = disabled)
    highWaterMark: number;        // Best price seen since entry (for trailing)
    openTime: string;
    orderId: string;
    consensusSnapshot: {
        agreeingCount: number;
        opposingCount: number;
        weightedStrength: number;
        topStrategies: string[];
    };
}

export interface TradeRecordV2 {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    betAmount: number;
    pnlPercent: number;
    pnlValue: number;
    reason: 'TAKE_PROFIT' | 'STOP_LOSS';
    bankrollBefore: number;
    bankrollAfter: number;
    timestamp: string;
    consensusSnapshot: { agreeingCount: number; opposingCount: number; weightedStrength: number; topStrategies: string[] };
    // ===== STRATEGY METRICS (CEO-BINANCE directive) =====
    activeStrategies: string[];           // Lista de estratégias ativas no trade
    strategyStrengths: { [key: string]: number };  // Força de cada estratégia
    topStrategy: string;                  // Estratégia com maior força
    topStrategyStrength: number;          // Força da melhor estratégia
}

// ===== STRATEGY PERFORMANCE TRACKING =====
export interface StrategyMetrics {
    strategyId: string;
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalTakeProfitValue: number;
    totalStopLossValue: number;
    avgTakeProfitOdd: number;
    avgStopLossOdd: number;
    expectedValue: number;
    avgSignalStrength: number;            // Força média do sinal quando esta estratégia participou
    participationRate: number;            // % de trades que esta estratégia participou
}

interface DNASessionV2 {
    sessionId: string;
    botId: string;
    botName: string;
    generation: number;
    genome: GenomeV2;
    startBankroll: number;
    endBankroll: number;
    peakBankroll: number;
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    maxDrawdown: number;
    finalReason: 'BANKRUPT' | 'GOAL_REACHED' | 'RUNNING' | 'STOPPED' | 'EVOLVED_OUT';
    startTime: string;
    endTime: string;
    trades: TradeRecordV2[];
    fitness: number;
    activeStrategies: string[];
}

// ======================== CONSTANTS ========================

const INITIAL_BANKROLL = 100;
const GOAL_BANKROLL = 10000;
const CYCLE_INTERVAL_MS = 6000;
const STRATEGY_COUNT = 30;
const EVOLUTION_CYCLE_INTERVAL = 50;  // Evolve every 50 cycles (~5 min)

// ======================== CONSENSUS THRESHOLDS (TUNED) ========================
// Adjusted based on performance analysis (win rate ~40% -> target 50%+)
const CONSENSUS_DEFAULTS = {
    MIN_AGREEING_SIGNALS: 5,        // Increased from 2-4 (stricter entry)
    MAX_OPPOSING_SIGNALS: 2,        // Reduced from 3-4 (stricter confirmation)
    MIN_WEIGHTED_STRENGTH: 50,      // Increased from 39-45 (higher quality signals)
    PREFERRED_DIRECTION: 'ANY' as const
};

const BOT_NAMES = [
    'Hydra', 'Phoenix', 'Cerberus', 'Atlas', 'Kraken',
    'Titan', 'Nexus', 'Vortex', 'Zenith', 'Apex',
    'Sigma', 'Delta', 'Omega', 'Nova', 'Pulse',
    'Forge', 'Storm', 'Drift', 'Blaze', 'Echo'
];

// ======================== GENESIS GENOMES ========================

function createGenesisGenomes(): GenomeV2[] {
    const strategyIds = SignalPoolEngine.getStrategyIds();

    // Bot 1: AGGRESSIVE TREND - listens to trend + momentum, tight ATR TP/SL
    const aggressive: GenomeV2 = {
        id: 'v2-alpha-gen1', name: 'Hydra', generation: 1, parentIds: [],
        strategyMask: strategyIds.map((_, i) => i < 15), // First 15 (all trend + all momentum)
        strategyWeights: strategyIds.map((_, i) => i < 10 ? 1.5 : i < 20 ? 1.0 : 0.3),
        consensus: { minAgreeingSignals: 5, maxOpposingSignals: 2, minWeightedStrength: 50, preferredDirection: 'ANY' },
        risk: { atrMultiplierTP: 2.0, atrMultiplierSL: 1.0, trailingStopATR: 1.5, flipExitThreshold: 8, leverage: 50, maxOpenPositions: 5, maxExposurePercent: 50 },
        betting: { basePercent: 5, winMultiplier: 1.3, lossMultiplier: 0.8, maxBetPercent: 15, resetAfterLosses: 4 },
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    };

    // Bot 2: CONSERVATIVE CONSENSUS - needs many agreeing, wide ATR stops
    const conservative: GenomeV2 = {
        id: 'v2-beta-gen1', name: 'Phoenix', generation: 1, parentIds: [],
        strategyMask: strategyIds.map(() => true), // Listens to ALL 30
        strategyWeights: strategyIds.map(() => 1.0), // Equal weight
        consensus: { minAgreeingSignals: 7, maxOpposingSignals: 2, minWeightedStrength: 55, preferredDirection: 'ANY' },
        risk: { atrMultiplierTP: 3.0, atrMultiplierSL: 1.5, trailingStopATR: 2.0, flipExitThreshold: 10, leverage: 30, maxOpenPositions: 3, maxExposurePercent: 30 },
        betting: { basePercent: 3, winMultiplier: 1.1, lossMultiplier: 0.9, maxBetPercent: 10, resetAfterLosses: 3 },
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    };

    // Bot 3: VOLATILITY HUNTER - focuses on volatility strategies, wide ATR
    const volHunter: GenomeV2 = {
        id: 'v2-gamma-gen1', name: 'Cerberus', generation: 1, parentIds: [],
        strategyMask: strategyIds.map((_, i) => i >= 20 || i < 5), // Volatility (20-29) + first 5 trend
        strategyWeights: strategyIds.map((_, i) => i >= 20 ? 1.8 : i < 5 ? 1.0 : 0.2),
        consensus: { minAgreeingSignals: 6, maxOpposingSignals: 2, minWeightedStrength: 50, preferredDirection: 'ANY' },
        risk: { atrMultiplierTP: 2.5, atrMultiplierSL: 1.2, trailingStopATR: 1.0, flipExitThreshold: 6, leverage: 40, maxOpenPositions: 4, maxExposurePercent: 40 },
        betting: { basePercent: 4, winMultiplier: 1.2, lossMultiplier: 0.85, maxBetPercent: 12, resetAfterLosses: 5 },
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    };

    // Bot 4: MOMENTUM SPECIALIST - tight trailing stop for quick profits
    const momSpec: GenomeV2 = {
        id: 'v2-delta-gen1', name: 'Atlas', generation: 1, parentIds: [],
        strategyMask: strategyIds.map((_, i) => i >= 10 && i < 20), // Only momentum (10-19)
        strategyWeights: strategyIds.map((_, i) => (i >= 10 && i < 20) ? 1.5 : 0),
        consensus: { minAgreeingSignals: 5, maxOpposingSignals: 2, minWeightedStrength: 55, preferredDirection: 'ANY' },
        risk: { atrMultiplierTP: 2.0, atrMultiplierSL: 0.8, trailingStopATR: 0.8, flipExitThreshold: 5, leverage: 45, maxOpenPositions: 4, maxExposurePercent: 35 },
        betting: { basePercent: 4, winMultiplier: 1.25, lossMultiplier: 0.85, maxBetPercent: 12, resetAfterLosses: 3 },
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    };

    // Bot 5: DIVERSIFIED BALANCED - wide stops, no trailing (hold positions)
    const balanced: GenomeV2 = {
        id: 'v2-epsilon-gen1', name: 'Kraken', generation: 1, parentIds: [],
        strategyMask: strategyIds.map(() => true),
        strategyWeights: strategyIds.map((_, i) => {
            if (i % 3 === 0) return 1.4;
            if (i % 3 === 1) return 1.0;
            return 0.7;
        }),
        consensus: { minAgreeingSignals: 7, maxOpposingSignals: 3, minWeightedStrength: 50, preferredDirection: 'ANY' },
        risk: { atrMultiplierTP: 3.5, atrMultiplierSL: 1.8, trailingStopATR: 0, flipExitThreshold: 0, leverage: 35, maxOpenPositions: 3, maxExposurePercent: 25 },
        betting: { basePercent: 3, winMultiplier: 1.15, lossMultiplier: 0.9, maxBetPercent: 8, resetAfterLosses: 4 },
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    };

    return [aggressive, conservative, volHunter, momSpec, balanced];
}

// ======================== GENOME VALIDATION (INTEGRITY CHECK) ========================

function validateGenome(genome: GenomeV2): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check strategy arrays
    if (genome.strategyMask.length !== STRATEGY_COUNT) {
        errors.push(`strategyMask length ${genome.strategyMask.length} != ${STRATEGY_COUNT}`);
    }
    if (genome.strategyWeights.length !== STRATEGY_COUNT) {
        errors.push(`strategyWeights length ${genome.strategyWeights.length} != ${STRATEGY_COUNT}`);
    }

    // Check weight bounds
    for (let i = 0; i < genome.strategyWeights.length; i++) {
        if (genome.strategyWeights[i] < 0 || genome.strategyWeights[i] > 2.5) {
            errors.push(`strategyWeights[${i}] = ${genome.strategyWeights[i]} out of bounds [0, 2.5]`);
        }
    }

    // Check consensus rules
    if (genome.consensus.minAgreeingSignals < 2 || genome.consensus.minAgreeingSignals > 15) {
        errors.push(`minAgreeingSignals ${genome.consensus.minAgreeingSignals} out of bounds [2, 15]`);
    }
    if (genome.consensus.maxOpposingSignals < 0 || genome.consensus.maxOpposingSignals > 10) {
        errors.push(`maxOpposingSignals ${genome.consensus.maxOpposingSignals} out of bounds [0, 10]`);
    }
    if (genome.consensus.minWeightedStrength < 30 || genome.consensus.minWeightedStrength > 95) {
        errors.push(`minWeightedStrength ${genome.consensus.minWeightedStrength} out of bounds [30, 95]`);
    }
    if (!['ANY', 'LONG_BIAS', 'SHORT_BIAS'].includes(genome.consensus.preferredDirection)) {
        errors.push(`Invalid preferredDirection: ${genome.consensus.preferredDirection}`);
    }

    // Check risk parameters
    if (genome.risk.atrMultiplierTP < 1.0 || genome.risk.atrMultiplierTP > 6.0) {
        errors.push(`atrMultiplierTP ${genome.risk.atrMultiplierTP} out of bounds [1.0, 6.0]`);
    }
    if (genome.risk.atrMultiplierSL < 0.5 || genome.risk.atrMultiplierSL > 4.0) {
        errors.push(`atrMultiplierSL ${genome.risk.atrMultiplierSL} out of bounds [0.5, 4.0]`);
    }
    if (genome.risk.trailingStopATR < 0 || genome.risk.trailingStopATR > 4.0) {
        errors.push(`trailingStopATR ${genome.risk.trailingStopATR} out of bounds [0, 4.0]`);
    }
    if (genome.risk.flipExitThreshold < 0 || genome.risk.flipExitThreshold > 20) {
        errors.push(`flipExitThreshold ${genome.risk.flipExitThreshold} out of bounds [0, 20]`);
    }
    if (genome.risk.leverage < 1 || genome.risk.leverage > 75) {
        errors.push(`leverage ${genome.risk.leverage} out of bounds [1, 75]`);
    }
    if (genome.risk.maxOpenPositions < 1 || genome.risk.maxOpenPositions > 10) {
        errors.push(`maxOpenPositions ${genome.risk.maxOpenPositions} out of bounds [1, 10]`);
    }
    if (genome.risk.maxExposurePercent < 10 || genome.risk.maxExposurePercent > 100) {
        errors.push(`maxExposurePercent ${genome.risk.maxExposurePercent} out of bounds [10, 100]`);
    }

    // Check betting parameters
    if (genome.betting.basePercent < 1 || genome.betting.basePercent > 15) {
        errors.push(`basePercent ${genome.betting.basePercent} out of bounds [1, 15]`);
    }
    if (genome.betting.winMultiplier < 0.5 || genome.betting.winMultiplier > 3.0) {
        errors.push(`winMultiplier ${genome.betting.winMultiplier} out of bounds [0.5, 3.0]`);
    }
    if (genome.betting.lossMultiplier < 0.3 || genome.betting.lossMultiplier > 1.5) {
        errors.push(`lossMultiplier ${genome.betting.lossMultiplier} out of bounds [0.3, 1.5]`);
    }
    if (genome.betting.maxBetPercent < 5 || genome.betting.maxBetPercent > 25) {
        errors.push(`maxBetPercent ${genome.betting.maxBetPercent} out of bounds [5, 25]`);
    }

    // Check symbols
    if (!Array.isArray(genome.symbols) || genome.symbols.length === 0) {
        errors.push('symbols array is empty or invalid');
    }

    // Ensure TP > SL (logical consistency)
    if (genome.risk.atrMultiplierTP <= genome.risk.atrMultiplierSL * 0.8) {
        errors.push(`TP multiplier (${genome.risk.atrMultiplierTP}) should be > SL multiplier (${genome.risk.atrMultiplierSL}) * 0.8`);
    }

    return { valid: errors.length === 0, errors };
}

// ======================== MAIN ENGINE V2 ========================

export class DNAArenaV2Engine {
    private binanceService: BinanceApiService;
    private signalPool: SignalPoolEngine;
    private bots: Map<string, BotStateV2> = new Map();
    private isRunning = false;
    private cycleInterval: NodeJS.Timeout | null = null;
    private persistInterval: NodeJS.Timeout | null = null;
    private currentCycle = 0;
    private generation = 1;
    private hallOfFame: Array<{
        name: string; generation: number; fitness: number; sharpe: number;
        sortino: number; profitFactor: number; bankroll: number;
        trades: number; winRate: number; activeStrategies: number;
        recordedAt: string; genomeSummary: { consensus: any; risk: any };
    }> = [];
    private readonly HALL_OF_FAME_MAX = 20;

    private readonly DATA_DIR = path.join(process.cwd(), 'data', 'DNA-ARENA-V2');
    private readonly SESSIONS_DIR = path.join(process.cwd(), 'data', 'DNA-ARENA-V2', 'sessions');
    private readonly STATE_FILE = path.join(process.cwd(), 'data', 'DNA-ARENA-V2', 'arena-state.json');
    private readonly PERSIST_INTERVAL_MS = 30000; // Save state every 30s

    constructor(binanceService: BinanceApiService) {
        this.binanceService = binanceService;
        this.signalPool = new SignalPoolEngine(binanceService);
        this.ensureDataDirs();
    }

    private ensureDataDirs(): void {
        if (!fs.existsSync(this.DATA_DIR)) fs.mkdirSync(this.DATA_DIR, { recursive: true });
        if (!fs.existsSync(this.SESSIONS_DIR)) fs.mkdirSync(this.SESSIONS_DIR, { recursive: true });
    }

    // ======================== STATE PERSISTENCE ========================

    private persistState(): void {
        try {
            const state = {
                generation: this.generation,
                currentCycle: this.currentCycle,
                savedAt: new Date().toISOString(),
                bots: Array.from(this.bots.entries()).map(([id, bot]) => ({
                    id,
                    genome: bot.genome,
                    bankroll: bot.bankroll,
                    initialBankroll: bot.initialBankroll,
                    totalTrades: bot.totalTrades,
                    wins: bot.wins,
                    losses: bot.losses,
                    consecutiveWins: bot.consecutiveWins,
                    consecutiveLosses: bot.consecutiveLosses,
                    maxBankroll: bot.maxBankroll,
                    minBankroll: bot.minBankroll,
                    maxDrawdown: bot.maxDrawdown,
                    pnlHistory: bot.pnlHistory.slice(-200), // Keep last 200
                    totalExposure: 0, // Reset exposure on reload (positions are closed)
                    isAlive: bot.isAlive,
                    startTime: bot.startTime,
                    lastTradeTime: bot.lastTradeTime,
                    deathCount: bot.deathCount,
                    sessionId: bot.sessionId,
                    currentBetPercent: bot.currentBetPercent,
                    tradeHistory: bot.tradeHistory.slice(-50)
                })),
                hallOfFame: this.hallOfFame
            };
            fs.writeFileSync(this.STATE_FILE, JSON.stringify(state, null, 2));
        } catch { /* silent */ }
    }

    private loadPersistedState(): boolean {
        try {
            if (!fs.existsSync(this.STATE_FILE)) return false;
            const raw = fs.readFileSync(this.STATE_FILE, 'utf8');
            const state = JSON.parse(raw);

            // Accept persisted state up to 7 days old (was 1h - caused data loss on restarts)
            const savedAt = new Date(state.savedAt).getTime();
            const stateAgeMs = Date.now() - savedAt;
            const stateAgeHours = (stateAgeMs / 3600000).toFixed(1);
            if (stateAgeMs > 7 * 24 * 3600000) {
                console.log(`⚠️ Persisted state too old (${stateAgeHours}h), starting fresh`);
                return false;
            }
            if (stateAgeMs > 3600000) {
                console.log(`📦 Restoring state from ${stateAgeHours}h ago (gen ${state.generation}, cycle ${state.currentCycle})`);
            }

            this.generation = state.generation || 1;
            this.currentCycle = state.currentCycle || 0;

            for (const botData of state.bots) {
                const botState: BotStateV2 = {
                    genome: botData.genome,
                    bankroll: botData.bankroll,
                    initialBankroll: botData.initialBankroll || INITIAL_BANKROLL,
                    totalTrades: botData.totalTrades,
                    wins: botData.wins,
                    losses: botData.losses,
                    consecutiveWins: botData.consecutiveWins,
                    consecutiveLosses: botData.consecutiveLosses,
                    maxBankroll: botData.maxBankroll,
                    minBankroll: botData.minBankroll,
                    maxDrawdown: botData.maxDrawdown,
                    openPositions: new Map(),
                    totalExposure: 0,
                    tradeHistory: botData.tradeHistory || [],
                    pnlHistory: botData.pnlHistory || [],
                    isAlive: botData.isAlive,
                    startTime: botData.startTime,
                    lastTradeTime: botData.lastTradeTime,
                    deathCount: botData.deathCount,
                    sessionId: botData.sessionId,
                    currentBetPercent: botData.currentBetPercent,
                    symbolCooldowns: new Map(),
                    // ===== ODDS TRACKING =====
                    totalTakeProfitValue: botData.totalTakeProfitValue || 0,
                    totalStopLossValue: botData.totalStopLossValue || 0,
                    avgTakeProfitOdd: botData.avgTakeProfitOdd || 0,
                    avgStopLossOdd: botData.avgStopLossOdd || 0,
                    expectedValue: botData.expectedValue || 0,
                    // ===== STRATEGY METRICS =====
                    strategyMetrics: botData.strategyMetrics || {}
                };
                // Migrate old genomes that have takeProfitPercent instead of atrMultiplierTP
                if ((botState.genome.risk as any).takeProfitPercent !== undefined) {
                    const old = botState.genome.risk as any;
                    botState.genome.risk = {
                        atrMultiplierTP: 2.0,
                        atrMultiplierSL: 1.0,
                        trailingStopATR: 1.0,
                        flipExitThreshold: 8,
                        leverage: old.leverage || 30,
                        maxOpenPositions: old.maxOpenPositions || 5,
                        maxExposurePercent: old.maxExposurePercent || 50
                    };
                }
                this.bots.set(botData.id, botState);
            }

            // Restore Hall of Fame
            if (state.hallOfFame && Array.isArray(state.hallOfFame)) {
                this.hallOfFame = state.hallOfFame;
            }

            console.log(`♻️ Resumed from persisted state: Gen ${this.generation}, Cycle ${this.currentCycle}, ${this.bots.size} bots, HoF=${this.hallOfFame.length}`);
            return true;
        } catch (err) {
            console.log('⚠️ Failed to load persisted state, starting fresh');
            return false;
        }
    }

    // ======================== START / STOP ========================

    async start(): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) return { success: false, message: 'V2 Arena already running' };

        console.log('🧬 DNA Arena V2 starting with Signal Pool consensus...');
        console.log(`📊 Signal Pool: ${SignalPoolEngine.getStrategyCount()} fixed strategies`);

        // Try to resume from persisted state
        const resumed = this.loadPersistedState();

        if (!resumed) {
            // Create genesis bots
            const genomes = createGenesisGenomes();
            for (const genome of genomes) {
                this.bots.set(genome.id, this.createBotState(genome));
                const activeCount = genome.strategyMask.filter(m => m).length;
                console.log(`  🤖 ${genome.name}: ${activeCount} strategies, TP=${genome.risk.atrMultiplierTP}xATR SL=${genome.risk.atrMultiplierSL}xATR trail=${genome.risk.trailingStopATR}xATR`);
            }
            this.currentCycle = 0;
        }

        this.isRunning = true;

        this.cycleInterval = setInterval(() => this.runCycle(), CYCLE_INTERVAL_MS);
        this.persistInterval = setInterval(() => this.persistState(), this.PERSIST_INTERVAL_MS);
        console.log(`🏟️ V2 Arena LIVE with ${this.bots.size} bots | Cycle: ${CYCLE_INTERVAL_MS / 1000}s | ATR-based TP/SL + Trailing Stop`);

        return { success: true, message: `V2 Arena ${resumed ? 'RESUMED' : 'started'} with ${this.bots.size} bots, 30 signal strategies` };
    }

    stop(): { success: boolean; message: string } {
        if (!this.isRunning) return { success: false, message: 'V2 Arena not running' };

        if (this.cycleInterval) clearInterval(this.cycleInterval);
        if (this.persistInterval) clearInterval(this.persistInterval);
        this.isRunning = false;

        // Persist state for resume
        this.persistState();

        // Save all sessions
        for (const [, botState] of this.bots) {
            this.saveDNASession(botState, 'STOPPED');
        }

        console.log('🛑 DNA Arena V2 stopped (state persisted for resume)');
        return { success: true, message: 'V2 Arena stopped, sessions saved, state persisted' };
    }

    async reset(): Promise<{ success: boolean; message: string }> {
        // Stop if running
        if (this.isRunning) this.stop();

        // Delete persisted state
        try {
            if (fs.existsSync(this.STATE_FILE)) fs.unlinkSync(this.STATE_FILE);
        } catch { /* ok */ }

        // Clear bots
        this.bots.clear();
        this.generation = 1;
        this.currentCycle = 0;
        this.hallOfFame = [];

        console.log('🔄 DNA Arena V2 reset - starting fresh');

        // Start fresh
        return this.start();
    }

    // ======================== CYCLE LOGIC ========================

    private cycleRunning = false;
    private consecutiveErrors = 0;

    private async runCycle(): Promise<void> {
        // Overlap guard: skip if previous cycle still running
        if (this.cycleRunning) return;
        this.cycleRunning = true;
        this.currentCycle++;

        try {
            // Step 1: Get ALL signals from the pool for ALL symbols
            const allSignals = await this.signalPool.generateAllSignals();

            // Step 2: For each bot, evaluate consensus and trade
            for (const [botId, botState] of this.bots) {
                if (!botState.isAlive) continue;

                // Check TP/SL on open positions
                await this.monitorPositions(botState, allSignals);

                // Check bankroll status
                if (botState.bankroll <= 0) {
                    this.handleBankrupt(botState);
                    continue;
                }
                if (botState.bankroll >= GOAL_BANKROLL) {
                    this.handleGoalReached(botState);
                    continue;
                }

                // Evaluate consensus for each symbol (use 5m ATR for more stable TP/SL)
                for (const marketSignals of allSignals) {
                    const decision = this.evaluateConsensus(botState.genome, marketSignals);
                    if (decision.shouldTrade) {
                        await this.openPosition(botState, marketSignals.symbol, decision, marketSignals.atr14_5m || marketSignals.atr14);
                    }
                }
            }
            // Step 3: Periodic evolution check
            if (this.currentCycle % EVOLUTION_CYCLE_INTERVAL === 0 && this.currentCycle > 0) {
                this.periodicEvolution();
            }
            this.consecutiveErrors = 0;
        } catch (err) {
            this.consecutiveErrors++;
            // Log errors: always first 10, then every 50 cycles
            if (this.consecutiveErrors <= 10 || this.consecutiveErrors % 50 === 0) {
                console.error(`❌ Arena V2 cycle ${this.currentCycle} error (${this.consecutiveErrors} consecutive):`, err instanceof Error ? err.message : err);
            }
        } finally {
            this.cycleRunning = false;
        }
    }

    // ======================== CONSENSUS EVALUATOR ========================

    private evaluateConsensus(genome: GenomeV2, marketSignals: MarketSignals): {
        shouldTrade: boolean;
        direction: 'LONG' | 'SHORT';
        confidence: number;
        agreeingCount: number;
        opposingCount: number;
        weightedStrength: number;
        topStrategies: string[];
    } {
        const noTrade = { shouldTrade: false, direction: 'LONG' as const, confidence: 0, agreeingCount: 0, opposingCount: 0, weightedStrength: 0, topStrategies: [] };

        // Step 1: Filter signals by strategy mask
        const activeSignals: { signal: PoolSignal; weight: number }[] = [];
        for (let i = 0; i < marketSignals.signals.length && i < STRATEGY_COUNT; i++) {
            if (genome.strategyMask[i]) {
                activeSignals.push({
                    signal: marketSignals.signals[i],
                    weight: genome.strategyWeights[i] || 1.0
                });
            }
        }

        if (activeSignals.length === 0) return noTrade;

        // Step 2: Count weighted votes by direction
        let longScore = 0, shortScore = 0;
        let longCount = 0, shortCount = 0;
        const longStrategies: { id: string; score: number }[] = [];
        const shortStrategies: { id: string; score: number }[] = [];

        for (const { signal, weight } of activeSignals) {
            if (signal.direction === 'NEUTRAL') continue;
            const weightedStr = signal.strength * weight;

            if (signal.direction === 'LONG') {
                longScore += weightedStr;
                longCount++;
                longStrategies.push({ id: signal.strategyId, score: weightedStr });
            } else {
                shortScore += weightedStr;
                shortCount++;
                shortStrategies.push({ id: signal.strategyId, score: weightedStr });
            }
        }

        // Step 3: Determine dominant direction
        const dominantDir = longScore >= shortScore ? 'LONG' : 'SHORT';
        const agreeingCount = dominantDir === 'LONG' ? longCount : shortCount;
        const opposingCount = dominantDir === 'LONG' ? shortCount : longCount;
        const agreeingScore = dominantDir === 'LONG' ? longScore : shortScore;
        const weightedStrength = agreeingCount > 0 ? agreeingScore / agreeingCount : 0;

        // Apply directional bias
        if (genome.consensus.preferredDirection === 'LONG_BIAS' && dominantDir === 'SHORT') {
            // Need extra confirmation for shorts
            if (agreeingCount < genome.consensus.minAgreeingSignals + 2) return noTrade;
        }
        if (genome.consensus.preferredDirection === 'SHORT_BIAS' && dominantDir === 'LONG') {
            if (agreeingCount < genome.consensus.minAgreeingSignals + 2) return noTrade;
        }

        // Step 4: Check consensus rules
        if (agreeingCount < genome.consensus.minAgreeingSignals) return noTrade;
        if (opposingCount > genome.consensus.maxOpposingSignals) return noTrade;
        if (weightedStrength < genome.consensus.minWeightedStrength) return noTrade;

        // Step 5: Multi-timeframe confirmation bonus/penalty
        // If 5m trend confirms direction, boost confidence. If opposing, reduce it.
        const htf = marketSignals.higherTF;
        let htfMultiplier = 1.0;
        if (htf.bias === dominantDir && htf.strength > 30) {
            htfMultiplier = 1.15; // 15% confidence boost when 5m confirms
        } else if (htf.bias !== 'NEUTRAL' && htf.bias !== dominantDir && htf.strength > 50) {
            htfMultiplier = 0.85; // 15% confidence reduction when 5m opposes
        }

        // Step 6: Build result
        const topStrats = (dominantDir === 'LONG' ? longStrategies : shortStrategies)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(s => s.id);

        const rawConfidence = (agreeingCount / Math.max(1, agreeingCount + opposingCount)) * weightedStrength;
        const confidence = Math.min(100, rawConfidence * htfMultiplier);

        return {
            shouldTrade: true,
            direction: dominantDir,
            confidence,
            agreeingCount,
            opposingCount,
            weightedStrength,
            topStrategies: topStrats
        };
    }

    // ======================== POSITION MANAGEMENT ========================

    private async openPosition(botState: BotStateV2, symbol: string, decision: {
        direction: 'LONG' | 'SHORT'; confidence: number;
        agreeingCount: number; opposingCount: number; weightedStrength: number; topStrategies: string[];
    }, atr: number | null): Promise<void> {
        const genome = botState.genome;

        // Check limits
        if (botState.openPositions.size >= genome.risk.maxOpenPositions) return;
        if (botState.openPositions.has(symbol)) return;

        // Check cooldown (skip symbols that recently hit SL)
        const cooldownExpiry = botState.symbolCooldowns.get(symbol);
        if (cooldownExpiry && this.currentCycle < cooldownExpiry) return;

        const exposurePercent = (botState.totalExposure / botState.bankroll) * 100;
        if (exposurePercent >= genome.risk.maxExposurePercent) return;

        // Calculate bet amount
        const betPercent = Math.min(botState.currentBetPercent, genome.betting.maxBetPercent);
        const betAmount = Math.max(1, Math.min(botState.bankroll * betPercent / 100, botState.bankroll - botState.totalExposure));
        if (betAmount < 1) return;

        try {
            const price = await this.binanceService.getFuturesPrice(symbol);
            if (!price) return;

            const leverage = genome.risk.leverage;
            const notional = betAmount * leverage;
            const quantity = parseFloat((notional / price).toFixed(symbol === 'BTCUSDT' ? 3 : symbol === 'ETHUSDT' ? 3 : 1));

            // ATR-based dynamic TP/SL (adapts to market volatility)
            const effectiveATR = atr || (price * 0.001); // Fallback: 0.1% of price
            const tpDistance = effectiveATR * genome.risk.atrMultiplierTP;
            const slDistance = effectiveATR * genome.risk.atrMultiplierSL;
            const trailDistance = genome.risk.trailingStopATR > 0 ? effectiveATR * genome.risk.trailingStopATR : 0;

            const tp = decision.direction === 'LONG' ? price + tpDistance : price - tpDistance;
            const sl = decision.direction === 'LONG' ? price - slDistance : price + slDistance;

            const position: PositionV2 = {
                symbol, side: decision.direction, entryPrice: price, quantity, leverage,
                betAmount, takeProfitPrice: tp, stopLossPrice: sl,
                trailingStopDistance: trailDistance,
                highWaterMark: price,
                openTime: new Date().toISOString(),
                orderId: `dna2_${genome.id}_${Date.now()}`,
                consensusSnapshot: {
                    agreeingCount: decision.agreeingCount,
                    opposingCount: decision.opposingCount,
                    weightedStrength: decision.weightedStrength,
                    topStrategies: decision.topStrategies
                }
            };

            botState.openPositions.set(symbol, position);
            botState.totalExposure += betAmount;
        } catch { /* skip */ }
    }

    private async monitorPositions(botState: BotStateV2, allSignals: MarketSignals[]): Promise<void> {
        const toClose: string[] = [];

        for (const [symbol, pos] of botState.openPositions) {
            try {
                const currentPrice = await this.binanceService.getFuturesPrice(symbol);
                if (!currentPrice) continue;

                // Breakeven stop: once 50% of TP distance is reached, move SL to entry
                const tpDistance = Math.abs(pos.takeProfitPrice - pos.entryPrice);
                const currentProfit = pos.side === 'LONG'
                    ? currentPrice - pos.entryPrice
                    : pos.entryPrice - currentPrice;
                if (currentProfit > tpDistance * 0.5 && pos.stopLossPrice !== pos.entryPrice) {
                    const oldSL = pos.stopLossPrice;
                    if (pos.side === 'LONG' && pos.stopLossPrice < pos.entryPrice) {
                        pos.stopLossPrice = pos.entryPrice;
                    } else if (pos.side === 'SHORT' && pos.stopLossPrice > pos.entryPrice) {
                        pos.stopLossPrice = pos.entryPrice;
                    }
                    if (pos.stopLossPrice !== oldSL) {
                        // Breakeven activated - loss eliminated
                    }
                }

                // Update trailing stop (move stop in favorable direction)
                if (pos.trailingStopDistance > 0) {
                    if (pos.side === 'LONG') {
                        if (currentPrice > pos.highWaterMark) {
                            pos.highWaterMark = currentPrice;
                            const newSL = currentPrice - pos.trailingStopDistance;
                            if (newSL > pos.stopLossPrice) pos.stopLossPrice = newSL;
                        }
                    } else {
                        if (currentPrice < pos.highWaterMark) {
                            pos.highWaterMark = currentPrice;
                            const newSL = currentPrice + pos.trailingStopDistance;
                            if (newSL < pos.stopLossPrice) pos.stopLossPrice = newSL;
                        }
                    }
                }

                let shouldClose = false;
                let reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'SIGNAL_FLIP' = 'TAKE_PROFIT';

                // Check TP/SL
                if (pos.side === 'LONG') {
                    if (currentPrice >= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice <= pos.stopLossPrice) {
                        shouldClose = true;
                        reason = pos.trailingStopDistance > 0 && pos.highWaterMark > pos.entryPrice ? 'TRAILING_STOP' : 'STOP_LOSS';
                    }
                } else {
                    if (currentPrice <= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice >= pos.stopLossPrice) {
                        shouldClose = true;
                        reason = pos.trailingStopDistance > 0 && pos.highWaterMark < pos.entryPrice ? 'TRAILING_STOP' : 'STOP_LOSS';
                    }
                }

                // Signal-based exit: close when consensus flips against position
                if (!shouldClose && botState.genome.risk.flipExitThreshold > 0) {
                    const marketData = allSignals.find(s => s.symbol === symbol);
                    if (marketData) {
                        const opposingDirection = pos.side === 'LONG' ? 'SHORT' : 'LONG';
                        const opposingCount = marketData.signals.filter(s => s.direction === opposingDirection).length;
                        if (opposingCount >= botState.genome.risk.flipExitThreshold) {
                            shouldClose = true;
                            reason = 'SIGNAL_FLIP';
                        }
                    }
                }

                if (shouldClose) {
                    this.closePosition(botState, symbol, currentPrice, reason);
                    toClose.push(symbol);
                }
            } catch { /* skip */ }
        }

        for (const sym of toClose) botState.openPositions.delete(sym);
    }

    private closePosition(botState: BotStateV2, symbol: string, exitPrice: number, reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'SIGNAL_FLIP'): void {
        const pos = botState.openPositions.get(symbol);
        if (!pos) return;

        const priceDiff = pos.side === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
        const pnlPercent = (priceDiff / pos.entryPrice) * 100 * pos.leverage;
        const pnlValue = pos.betAmount * (pnlPercent / 100);

        const bankrollBefore = botState.bankroll;
        botState.bankroll = Math.max(0, bankrollBefore + pnlValue);
        botState.totalExposure = Math.max(0, botState.totalExposure - pos.betAmount);

        // Track PnL for Sharpe/Sortino calculation
        botState.pnlHistory.push(pnlPercent);
        if (botState.pnlHistory.length > 200) botState.pnlHistory = botState.pnlHistory.slice(-200);

        // Update stats
        botState.totalTrades++;
        if (pnlValue > 0) {
            botState.wins++;
            botState.consecutiveWins++;
            botState.consecutiveLosses = 0;
            botState.currentBetPercent = Math.min(
                botState.genome.betting.maxBetPercent,
                botState.currentBetPercent * botState.genome.betting.winMultiplier
            );
        } else {
            botState.losses++;
            botState.consecutiveLosses++;
            botState.consecutiveWins = 0;
            botState.currentBetPercent = Math.max(1, botState.currentBetPercent * botState.genome.betting.lossMultiplier);
            if (botState.consecutiveLosses >= botState.genome.betting.resetAfterLosses) {
                botState.currentBetPercent = botState.genome.betting.basePercent;
            }
        }

        botState.maxBankroll = Math.max(botState.maxBankroll, botState.bankroll);
        botState.minBankroll = Math.min(botState.minBankroll, botState.bankroll);
        const drawdown = botState.maxBankroll > 0 ? ((botState.maxBankroll - botState.bankroll) / botState.maxBankroll) * 100 : 0;
        botState.maxDrawdown = Math.max(botState.maxDrawdown, drawdown);
        botState.lastTradeTime = new Date().toISOString();

        // Cooldown: after a loss, prevent re-entering this symbol for 10 cycles
        if (pnlValue < 0) {
            botState.symbolCooldowns.set(symbol, this.currentCycle + 10);
        }

        // Normalize reason for TradeRecordV2
        const recordReason: 'TAKE_PROFIT' | 'STOP_LOSS' = (reason === 'TRAILING_STOP' || reason === 'SIGNAL_FLIP')
            ? (pnlValue > 0 ? 'TAKE_PROFIT' : 'STOP_LOSS')
            : reason;

        botState.tradeHistory.push({
            symbol, side: pos.side, entryPrice: pos.entryPrice, exitPrice,
            betAmount: pos.betAmount, pnlPercent: Math.round(pnlPercent * 100) / 100,
            pnlValue: Math.round(pnlValue * 100) / 100, reason: recordReason,
            bankrollBefore: Math.round(bankrollBefore * 100) / 100,
            bankrollAfter: Math.round(botState.bankroll * 100) / 100,
            timestamp: new Date().toISOString(),
            consensusSnapshot: pos.consensusSnapshot,
            // ===== STRATEGY METRICS =====
            activeStrategies: pos.consensusSnapshot.topStrategies || [],
            strategyStrengths: {},
            topStrategy: pos.consensusSnapshot.topStrategies?.[0] || '',
            topStrategyStrength: 0
        });

        if (botState.tradeHistory.length > 100) botState.tradeHistory = botState.tradeHistory.slice(-100);
    }

    // ======================== BANKROLL EVENTS ========================

    private handleBankrupt(botState: BotStateV2): void {
        console.log(`💀 ${botState.genome.name} BANKRUPT (Gen ${botState.genome.generation}) | ${botState.totalTrades} trades | Deaths: ${botState.deathCount + 1}`);
        this.saveDNASession(botState, 'BANKRUPT');
        botState.deathCount++;

        // Find the best bot to use as parent for replacement
        let bestBot: BotStateV2 | null = null;
        let bestFitness = -Infinity;
        let secondBest: BotStateV2 | null = null;
        let secondFitness = -Infinity;

        for (const [, bot] of this.bots) {
            if (bot.genome.id === botState.genome.id) continue;
            const fitness = this.calculateFitness(bot);
            if (fitness > bestFitness) {
                secondBest = bestBot;
                secondFitness = bestFitness;
                bestBot = bot;
                bestFitness = fitness;
            } else if (fitness > secondFitness) {
                secondBest = bot;
                secondFitness = fitness;
            }
        }

        // Create child genome from best parents (or mutate best if only 1)
        this.generation++;
        let childGenome: GenomeV2;
        if (bestBot && secondBest && bestFitness > 0) {
            childGenome = this.crossover(bestBot.genome, secondBest.genome);
        } else if (bestBot && bestFitness > 0) {
            childGenome = this.mutate(bestBot.genome);
        } else {
            // No good parents, create random mutation of bankrupt bot
            childGenome = this.mutate(botState.genome);
        }

        childGenome.generation = this.generation;
        childGenome.id = `v2-evo-gen${this.generation}-${Date.now()}`;
        childGenome.name = BOT_NAMES[this.generation % BOT_NAMES.length];

        const activeCount = childGenome.strategyMask.filter(m => m).length;
        console.log(`🧬 BANKRUPT EVOLUTION Gen ${this.generation} | ${childGenome.name} (${activeCount} strats) replaces ${botState.genome.name}`);

        // Replace bankrupt bot
        this.bots.delete(botState.genome.id);
        this.bots.set(childGenome.id, this.createBotState(childGenome));
    }

    /**
     * Periodic evolution: every N cycles, replace the worst performer
     */
    private periodicEvolution(): void {
        // Calculate fitness for all bots
        const rankings: { bot: BotStateV2; fitness: number }[] = [];
        for (const [, bot] of this.bots) {
            rankings.push({ bot, fitness: this.calculateFitness(bot) });
        }
        rankings.sort((a, b) => b.fitness - a.fitness);

        const best = rankings[0];
        const secondBest = rankings[1];
        const worst = rankings[rankings.length - 1];

        if (!best || !worst || best.bot.genome.id === worst.bot.genome.id) return;

        // Only evolve if best actually has some fitness (has traded)
        // Also evolve if worst has never traded (stuck bot)
        const worstNeverTraded = worst.bot.totalTrades === 0;
        const bestHasFitness = best.fitness > 0;

        if (!bestHasFitness && !worstNeverTraded) {
            console.log(`⏳ Cycle ${this.currentCycle}: No evolution yet (best fitness: ${best.fitness.toFixed(1)})`);
            return;
        }

        this.generation++;
        let childGenome: GenomeV2;
        if (secondBest && best.fitness > 0) {
            childGenome = this.crossover(best.bot.genome, secondBest.bot.genome);
        } else {
            childGenome = this.mutate(best.bot.genome);
        }

        childGenome.generation = this.generation;
        childGenome.id = `v2-periodic-gen${this.generation}-${Date.now()}`;
        childGenome.name = BOT_NAMES[this.generation % BOT_NAMES.length];

        const activeCount = childGenome.strategyMask.filter(m => m).length;
        console.log(`🔄 PERIODIC EVOLUTION Gen ${this.generation} @ Cycle ${this.currentCycle}`);
        console.log(`  📊 Rankings: ${rankings.map(r => `${r.bot.genome.name}=${r.fitness.toFixed(1)}`).join(', ')}`);
        console.log(`  👶 ${childGenome.name} (${activeCount} strats) replaces ${worst.bot.genome.name} (fitness: ${worst.fitness.toFixed(1)})`);

        // Save worst bot's session and replace
        this.saveDNASession(worst.bot, 'EVOLVED_OUT');
        this.bots.delete(worst.bot.genome.id);
        this.bots.set(childGenome.id, this.createBotState(childGenome));
    }

    private handleGoalReached(botState: BotStateV2): void {
        console.log(`🏆 ${botState.genome.name} reached $${GOAL_BANKROLL}! (Gen ${botState.genome.generation})`);
        this.saveDNASession(botState, 'GOAL_REACHED');
        this.evolve(botState);
    }

    // ======================== EVOLUTION ========================

    private evolve(winner: BotStateV2): void {
        this.generation++;
        console.log(`🧬 EVOLUTION! Generation ${this.generation} | Winner: ${winner.genome.name}`);

        // ELITISM: Find elite bot (highest Sharpe with min 5 trades) - immune from replacement
        let eliteBot: BotStateV2 | null = null;
        let bestSharpe = -Infinity;
        for (const [, bot] of this.bots) {
            if (bot.totalTrades >= 5) {
                const sharpe = this.calculateSharpeRatio(bot.pnlHistory);
                if (sharpe > bestSharpe) {
                    bestSharpe = sharpe;
                    eliteBot = bot;
                }
            }
        }
        if (eliteBot) {
            console.log(`  🏆 Elite (immune): ${eliteBot.genome.name} Sharpe=${bestSharpe.toFixed(2)}`);
        }

        // Record winner in Hall of Fame
        this.recordHallOfFame(winner);

        // Find worst bot (lowest bankroll) - but NOT the elite bot
        let worstBot: BotStateV2 | null = null;
        let worstBankroll = Infinity;
        for (const [, bot] of this.bots) {
            const isElite = eliteBot && bot.genome.id === eliteBot.genome.id;
            if (bot.genome.id !== winner.genome.id && !isElite && bot.bankroll < worstBankroll) {
                worstBankroll = bot.bankroll;
                worstBot = bot;
            }
        }

        // Find second best bot for crossover
        let secondBest: BotStateV2 | null = null;
        let secondBestBankroll = -Infinity;
        for (const [, bot] of this.bots) {
            if (bot.genome.id !== winner.genome.id && bot.bankroll > secondBestBankroll) {
                secondBestBankroll = bot.bankroll;
                secondBest = bot;
            }
        }

        if (!worstBot) return;

        // Crossover + Mutation: combine winner + second best genomes
        const childGenome = secondBest
            ? this.crossover(winner.genome, secondBest.genome)
            : this.mutate(winner.genome);

        childGenome.generation = this.generation;
        childGenome.id = `v2-child-gen${this.generation}-${Date.now()}`;
        childGenome.name = BOT_NAMES[this.generation % BOT_NAMES.length];

        const activeCount = childGenome.strategyMask.filter(m => m).length;
        console.log(`  👶 Child: ${childGenome.name} (${activeCount} strategies) replaces ${worstBot.genome.name}`);

        // Save worst bot session and replace
        this.saveDNASession(worstBot, 'STOPPED');
        this.bots.delete(worstBot.genome.id);
        this.bots.set(childGenome.id, this.createBotState(childGenome));

        // Reset winner (but NOT the elite - elite keeps running)
        if (!eliteBot || winner.genome.id !== eliteBot.genome.id) {
            winner.bankroll = INITIAL_BANKROLL;
            winner.totalTrades = 0;
            winner.wins = 0;
            winner.losses = 0;
            winner.openPositions.clear();
            winner.totalExposure = 0;
            winner.tradeHistory = [];
            winner.pnlHistory = [];
            winner.maxBankroll = INITIAL_BANKROLL;
            winner.currentBetPercent = winner.genome.betting.basePercent;
            winner.sessionId = `session_${Date.now()}`;
            winner.symbolCooldowns.clear();
        } else {
            console.log(`  🏆 Winner IS elite - preserving state (Sharpe=${bestSharpe.toFixed(2)})`);
        }
    }

    private recordHallOfFame(bot: BotStateV2): void {
        const fitness = this.calculateFitness(bot);
        const sharpe = this.calculateSharpeRatio(bot.pnlHistory);
        const entry = {
            name: bot.genome.name,
            generation: bot.genome.generation,
            fitness: Math.round(fitness * 100) / 100,
            sharpe: Math.round(sharpe * 100) / 100,
            sortino: Math.round(this.calculateSortinoRatio(bot.pnlHistory) * 100) / 100,
            profitFactor: Math.round(this.calculateProfitFactor(bot) * 100) / 100,
            bankroll: Math.round(bot.bankroll * 100) / 100,
            trades: bot.totalTrades,
            winRate: bot.totalTrades > 0 ? Math.round((bot.wins / bot.totalTrades) * 1000) / 10 : 0,
            activeStrategies: bot.genome.strategyMask.filter(m => m).length,
            recordedAt: new Date().toISOString(),
            genomeSummary: { consensus: bot.genome.consensus, risk: bot.genome.risk }
        };
        this.hallOfFame.push(entry);
        // Keep sorted by fitness desc, trim to max
        this.hallOfFame.sort((a, b) => b.fitness - a.fitness);
        if (this.hallOfFame.length > this.HALL_OF_FAME_MAX) {
            this.hallOfFame = this.hallOfFame.slice(0, this.HALL_OF_FAME_MAX);
        }
    }

    private crossover(parent1: GenomeV2, parent2: GenomeV2): GenomeV2 {
        const child: GenomeV2 = JSON.parse(JSON.stringify(parent1));
        child.parentIds = [parent1.id, parent2.id];

        // Crossover strategy mask: random mix
        for (let i = 0; i < STRATEGY_COUNT; i++) {
            child.strategyMask[i] = Math.random() > 0.5 ? parent1.strategyMask[i] : parent2.strategyMask[i];
            child.strategyWeights[i] = Math.random() > 0.5 ? parent1.strategyWeights[i] : parent2.strategyWeights[i];
        }

        // Crossover consensus rules
        child.consensus.minAgreeingSignals = Math.random() > 0.5
            ? parent1.consensus.minAgreeingSignals : parent2.consensus.minAgreeingSignals;
        child.consensus.maxOpposingSignals = Math.random() > 0.5
            ? parent1.consensus.maxOpposingSignals : parent2.consensus.maxOpposingSignals;
        child.consensus.minWeightedStrength = Math.random() > 0.5
            ? parent1.consensus.minWeightedStrength : parent2.consensus.minWeightedStrength;

        // Crossover risk (ATR-based)
        child.risk.atrMultiplierTP = Math.random() > 0.5
            ? parent1.risk.atrMultiplierTP : parent2.risk.atrMultiplierTP;
        child.risk.atrMultiplierSL = Math.random() > 0.5
            ? parent1.risk.atrMultiplierSL : parent2.risk.atrMultiplierSL;
        child.risk.trailingStopATR = Math.random() > 0.5
            ? parent1.risk.trailingStopATR : parent2.risk.trailingStopATR;
        child.risk.flipExitThreshold = Math.random() > 0.5
            ? parent1.risk.flipExitThreshold : parent2.risk.flipExitThreshold;
        child.risk.leverage = Math.random() > 0.5
            ? parent1.risk.leverage : parent2.risk.leverage;

        // Crossover betting
        child.betting.basePercent = Math.random() > 0.5
            ? parent1.betting.basePercent : parent2.betting.basePercent;
        child.betting.winMultiplier = Math.random() > 0.5
            ? parent1.betting.winMultiplier : parent2.betting.winMultiplier;

        // Apply mutation on top
        const mutated = this.mutate(child);

        // Validate genome integrity (INTEGRITY CHECK)
        const validation = validateGenome(mutated);
        if (!validation.valid) {
            console.warn(`⚠️ Genome validation failed for ${mutated.name}, auto-correcting...`);
            // Auto-correct critical issues
            if (mutated.consensus.minAgreeingSignals < CONSENSUS_DEFAULTS.MIN_AGREEING_SIGNALS - 2) {
                mutated.consensus.minAgreeingSignals = CONSENSUS_DEFAULTS.MIN_AGREEING_SIGNALS - 2;
            }
            if (mutated.risk.atrMultiplierTP < 1.5) mutated.risk.atrMultiplierTP = 1.5;
            if (mutated.risk.leverage > 50) mutated.risk.leverage = 50;
        }

        return mutated;
    }

    private mutate(genome: GenomeV2): GenomeV2 {
        const child: GenomeV2 = JSON.parse(JSON.stringify(genome));
        const mutationRate = 0.10; // Reduced from 0.15 to 0.10 (more stability, less chaos)

        // Mutate strategy mask (flip random bits)
        for (let i = 0; i < STRATEGY_COUNT; i++) {
            if (Math.random() < mutationRate) child.strategyMask[i] = !child.strategyMask[i];
        }

        // Ensure at least 5 strategies active (increased from 3 for better diversification)
        const activeCount = child.strategyMask.filter(m => m).length;
        if (activeCount < 5) {
            const inactiveIndices = child.strategyMask.map((m, i) => m ? -1 : i).filter(i => i >= 0);
            for (let i = 0; i < 5 - activeCount && i < inactiveIndices.length; i++) {
                const idx = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
                child.strategyMask[idx] = true;
            }
        }

        // Mutate strategy weights (with bounds to prevent extreme values)
        for (let i = 0; i < STRATEGY_COUNT; i++) {
            if (Math.random() < mutationRate) {
                child.strategyWeights[i] = Math.max(0.1, Math.min(2.0, child.strategyWeights[i] + (Math.random() - 0.5) * 0.4));
            }
        }

        // Mutate consensus rules (with improved defaults for better win rate)
        if (Math.random() < mutationRate) {
            child.consensus.minAgreeingSignals = Math.max(
                CONSENSUS_DEFAULTS.MIN_AGREEING_SIGNALS - 2,
                Math.min(15, child.consensus.minAgreeingSignals + Math.round((Math.random() - 0.5) * 4))
            );
        }
        if (Math.random() < mutationRate) {
            child.consensus.maxOpposingSignals = Math.max(
                CONSENSUS_DEFAULTS.MAX_OPPOSING_SIGNALS - 1,
                Math.min(10, child.consensus.maxOpposingSignals + Math.round((Math.random() - 0.5) * 3))
            );
        }
        if (Math.random() < mutationRate) {
            child.consensus.minWeightedStrength = Math.max(
                CONSENSUS_DEFAULTS.MIN_WEIGHTED_STRENGTH - 10,
                Math.min(90, child.consensus.minWeightedStrength + (Math.random() - 0.5) * 20)
            );
        }

        // Mutate risk (ATR-based) - tighter bounds for stability
        if (Math.random() < mutationRate) child.risk.atrMultiplierTP = Math.max(1.5, Math.min(5.0, child.risk.atrMultiplierTP + (Math.random() - 0.5) * 1.0));
        if (Math.random() < mutationRate) child.risk.atrMultiplierSL = Math.max(0.8, Math.min(3.0, child.risk.atrMultiplierSL + (Math.random() - 0.5) * 0.6));
        if (Math.random() < mutationRate) child.risk.trailingStopATR = Math.max(0.5, Math.min(3.0, child.risk.trailingStopATR + (Math.random() - 0.5) * 0.8));
        if (Math.random() < mutationRate) child.risk.flipExitThreshold = Math.max(3, Math.min(15, Math.round(child.risk.flipExitThreshold + (Math.random() - 0.5) * 4)));
        if (Math.random() < mutationRate) child.risk.leverage = Math.max(5, Math.min(50, child.risk.leverage + Math.round((Math.random() - 0.5) * 20))); // Reduced max leverage from 75 to 50

        // Mutate betting (conservative adjustments)
        if (Math.random() < mutationRate) child.betting.basePercent = Math.max(2, Math.min(8, child.betting.basePercent + (Math.random() - 0.5) * 2));
        if (Math.random() < mutationRate) child.betting.winMultiplier = Math.max(1.0, Math.min(2.0, child.betting.winMultiplier + (Math.random() - 0.5) * 0.3));
        if (Math.random() < mutationRate) child.betting.lossMultiplier = Math.max(0.5, Math.min(1.0, child.betting.lossMultiplier + (Math.random() - 0.5) * 0.2));

        return child;
    }

    // ======================== HELPERS ========================

    private createBotState(genome: GenomeV2): BotStateV2 {
        // Validate genome before creating bot (INTEGRITY CHECK)
        const validation = validateGenome(genome);
        if (!validation.valid) {
            console.error(`❌ Invalid genome for ${genome.name}:`, validation.errors);
            // Auto-correct where possible
            if (genome.consensus.minAgreeingSignals < 3) genome.consensus.minAgreeingSignals = 3;
            if (genome.risk.atrMultiplierTP < 1.5) genome.risk.atrMultiplierTP = 1.5;
            if (genome.risk.atrMultiplierSL < 0.8) genome.risk.atrMultiplierSL = 0.8;
            if (genome.risk.leverage > 50) genome.risk.leverage = 50;
        }

        return {
            genome,
            bankroll: INITIAL_BANKROLL,
            initialBankroll: INITIAL_BANKROLL,
            totalTrades: 0, wins: 0, losses: 0,
            consecutiveWins: 0, consecutiveLosses: 0,
            maxBankroll: INITIAL_BANKROLL, minBankroll: INITIAL_BANKROLL,
            maxDrawdown: 0,
            openPositions: new Map(),
            totalExposure: 0,
            tradeHistory: [],
            pnlHistory: [],
            isAlive: true,
            startTime: new Date().toISOString(),
            lastTradeTime: null,
            deathCount: 0,
            sessionId: `session_${Date.now()}`,
            currentBetPercent: genome.betting.basePercent,
            symbolCooldowns: new Map(),
            // ===== ODDS TRACKING =====
            totalTakeProfitValue: 0,
            totalStopLossValue: 0,
            avgTakeProfitOdd: 0,
            avgStopLossOdd: 0,
            expectedValue: 0,
            // ===== STRATEGY METRICS =====
            strategyMetrics: {}
        };
    }

    private calculateFitness(botState: BotStateV2): number {
        if (botState.totalTrades < 3) return 0;

        const winRate = botState.totalTrades > 0 ? botState.wins / botState.totalTrades : 0;
        const returns = (botState.bankroll - INITIAL_BANKROLL) / INITIAL_BANKROLL;
        const drawdownPenalty = 1 - (botState.maxDrawdown / 100);
        const consistency = botState.totalTrades > 10 ? Math.min(1, botState.totalTrades / 50) : 0.5;

        // Sharpe Ratio (annualized approximation)
        const sharpe = this.calculateSharpeRatio(botState.pnlHistory);
        // Sortino Ratio (penalizes only downside)
        const sortino = this.calculateSortinoRatio(botState.pnlHistory);
        // Profit Factor (total wins / total losses)
        const profitFactor = this.calculateProfitFactor(botState);

        // Weighted fitness: Sharpe matters most, then returns, then consistency
        return (
            sharpe * 20 +                          // Risk-adjusted returns (big weight)
            sortino * 10 +                          // Downside risk awareness
            winRate * 15 +                          // Win rate
            Math.min(returns * 15, 20) +            // Returns (capped)
            Math.min(profitFactor * 5, 15) +        // Profit factor (capped)
            drawdownPenalty * 15 +                   // Low drawdown
            consistency * 5                          // Trading activity
        );
    }

    private calculateSharpeRatio(pnlHistory: number[]): number {
        if (pnlHistory.length < 5) return 0;
        const mean = pnlHistory.reduce((a, b) => a + b, 0) / pnlHistory.length;
        const variance = pnlHistory.reduce((sum, pnl) => sum + Math.pow(pnl - mean, 2), 0) / pnlHistory.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0) return mean > 0 ? 3 : 0;
        return Math.max(-2, Math.min(5, mean / stdDev));
    }

    private calculateSortinoRatio(pnlHistory: number[]): number {
        if (pnlHistory.length < 5) return 0;
        const mean = pnlHistory.reduce((a, b) => a + b, 0) / pnlHistory.length;
        const downsideReturns = pnlHistory.filter(p => p < 0);
        if (downsideReturns.length === 0) return mean > 0 ? 3 : 0;
        const downsideVariance = downsideReturns.reduce((sum, pnl) => sum + Math.pow(pnl, 2), 0) / downsideReturns.length;
        const downsideDev = Math.sqrt(downsideVariance);
        if (downsideDev === 0) return mean > 0 ? 3 : 0;
        return Math.max(-2, Math.min(5, mean / downsideDev));
    }

    private calculateProfitFactor(botState: BotStateV2): number {
        const wins = botState.pnlHistory.filter(p => p > 0);
        const losses = botState.pnlHistory.filter(p => p < 0);
        const totalWins = wins.reduce((a, b) => a + b, 0);
        const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));
        if (totalLosses === 0) return totalWins > 0 ? 5 : 0;
        return Math.min(10, totalWins / totalLosses);
    }

    private saveDNASession(botState: BotStateV2, reason: 'BANKRUPT' | 'GOAL_REACHED' | 'STOPPED' | 'EVOLVED_OUT'): void {
        const session: DNASessionV2 = {
            sessionId: botState.sessionId,
            botId: botState.genome.id,
            botName: botState.genome.name,
            generation: botState.genome.generation,
            genome: botState.genome,
            startBankroll: INITIAL_BANKROLL,
            endBankroll: Math.round(botState.bankroll * 100) / 100,
            peakBankroll: Math.round(botState.maxBankroll * 100) / 100,
            totalTrades: botState.totalTrades,
            wins: botState.wins,
            losses: botState.losses,
            winRate: botState.totalTrades > 0 ? Math.round((botState.wins / botState.totalTrades) * 1000) / 10 : 0,
            maxDrawdown: Math.round(botState.maxDrawdown * 100) / 100,
            finalReason: reason,
            startTime: botState.startTime,
            endTime: new Date().toISOString(),
            trades: botState.tradeHistory.slice(-50),
            fitness: this.calculateFitness(botState),
            activeStrategies: botState.genome.strategyMask
                .map((m, i) => m ? SignalPoolEngine.getStrategyIds()[i] : null)
                .filter(Boolean) as string[]
        };

        try {
            const filePath = path.join(this.SESSIONS_DIR, `${session.sessionId}_${botState.genome.name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
        } catch { /* skip */ }
    }

    // ======================== STATUS API ========================

    getStatus(): any {
        const bots = [];
        for (const [, botState] of this.bots) {
            const genome = botState.genome;
            const activeStrategies = genome.strategyMask.filter(m => m).length;
            const strategyNames = genome.strategyMask
                .map((m, i) => m ? SignalPoolEngine.getStrategyInfo()[i]?.name : null)
                .filter(Boolean);

            bots.push({
                id: genome.id,
                name: genome.name,
                generation: genome.generation,
                activeStrategies,
                strategyNames,
                consensus: genome.consensus,
                risk: genome.risk,
                bankroll: Math.round(botState.bankroll * 100) / 100,
                bankrollChange: Math.round((botState.bankroll - INITIAL_BANKROLL) * 100) / 100,
                bankrollChangePercent: Math.round(((botState.bankroll - INITIAL_BANKROLL) / INITIAL_BANKROLL) * 1000) / 10,
                totalTrades: botState.totalTrades,
                wins: botState.wins,
                losses: botState.losses,
                winRate: botState.totalTrades > 0 ? Math.round((botState.wins / botState.totalTrades) * 1000) / 10 : 0,
                openPositions: botState.openPositions.size,
                totalExposure: Math.round(botState.totalExposure * 100) / 100,
                maxDrawdown: Math.round(botState.maxDrawdown * 100) / 100,
                consecutiveWins: botState.consecutiveWins,
                consecutiveLosses: botState.consecutiveLosses,
                deathCount: botState.deathCount,
                fitness: Math.round(this.calculateFitness(botState) * 100) / 100,
                sharpeRatio: Math.round(this.calculateSharpeRatio(botState.pnlHistory) * 100) / 100,
                sortinoRatio: Math.round(this.calculateSortinoRatio(botState.pnlHistory) * 100) / 100,
                profitFactor: Math.round(this.calculateProfitFactor(botState) * 100) / 100,
                isAlive: botState.isAlive,
                positions: Array.from(botState.openPositions.values()).map(p => ({
                    symbol: p.symbol, side: p.side, entryPrice: p.entryPrice,
                    quantity: p.quantity, leverage: p.leverage, betAmount: p.betAmount,
                    takeProfitPrice: p.takeProfitPrice, stopLossPrice: p.stopLossPrice,
                    openTime: p.openTime, orderId: p.orderId,
                    consensus: p.consensusSnapshot
                })),
                lastTrades: botState.tradeHistory.slice(-5).map(t => ({
                    symbol: t.symbol, side: t.side, entryPrice: t.entryPrice,
                    exitPrice: t.exitPrice, betAmount: t.betAmount,
                    pnlPercent: t.pnlPercent, pnlValue: t.pnlValue, reason: t.reason,
                    bankrollBefore: t.bankrollBefore, bankrollAfter: t.bankrollAfter,
                    timestamp: t.timestamp, consensus: t.consensusSnapshot
                }))
            });
        }

        return {
            isRunning: this.isRunning,
            version: 2,
            generation: this.generation,
            currentCycle: this.currentCycle,
            totalBots: this.bots.size,
            signalPoolSize: SignalPoolEngine.getStrategyCount(),
            initialBankroll: INITIAL_BANKROLL,
            goalBankroll: GOAL_BANKROLL,
            bots
        };
    }

    getLeaderboard(): any {
        const bots = Array.from(this.bots.values())
            .sort((a, b) => b.bankroll - a.bankroll)
            .map((bot, rank) => ({
                rank: rank + 1,
                name: bot.genome.name,
                bankroll: Math.round(bot.bankroll * 100) / 100,
                trades: bot.totalTrades,
                winRate: bot.totalTrades > 0 ? Math.round((bot.wins / bot.totalTrades) * 1000) / 10 : 0,
                fitness: Math.round(this.calculateFitness(bot) * 100) / 100,
                activeStrategies: bot.genome.strategyMask.filter(m => m).length,
                consensus: `${bot.genome.consensus.minAgreeingSignals}/${bot.genome.consensus.maxOpposingSignals}`,
                generation: bot.genome.generation
            }));

        return { version: 2, generation: this.generation, cycle: this.currentCycle, bots };
    }

    getSessions(): any {
        try {
            const files = fs.readdirSync(this.SESSIONS_DIR).filter(f => f.endsWith('.json'));
            return files.map(f => {
                const data = JSON.parse(fs.readFileSync(path.join(this.SESSIONS_DIR, f), 'utf8'));
                return {
                    sessionId: data.sessionId, botName: data.botName, generation: data.generation,
                    endBankroll: data.endBankroll, totalTrades: data.totalTrades,
                    winRate: data.winRate, fitness: data.fitness,
                    finalReason: data.finalReason, endTime: data.endTime,
                    activeStrategies: data.activeStrategies?.length || 0
                };
            });
        } catch { return []; }
    }

    getSession(sessionId: string): any {
        try {
            const files = fs.readdirSync(this.SESSIONS_DIR).filter(f => f.includes(sessionId));
            if (files.length === 0) return null;
            return JSON.parse(fs.readFileSync(path.join(this.SESSIONS_DIR, files[0]), 'utf8'));
        } catch { return null; }
    }

    // ======================== STATS & ANALYTICS ========================

    getStats(): any {
        const allBots = Array.from(this.bots.values());
        const activeBots = allBots.filter(b => b.isAlive);

        // Aggregate metrics
        const totalTrades = allBots.reduce((s, b) => s + b.totalTrades, 0);
        const totalWins = allBots.reduce((s, b) => s + b.wins, 0);
        const totalLosses = allBots.reduce((s, b) => s + b.losses, 0);
        const totalBankroll = allBots.reduce((s, b) => s + b.bankroll, 0);
        const avgBankroll = allBots.length > 0 ? totalBankroll / allBots.length : 0;

        // Best performers
        let bestSharpeBot = { name: 'N/A', value: 0 };
        let bestWinRateBot = { name: 'N/A', value: 0 };
        let bestProfitBot = { name: 'N/A', value: 0 };
        let bestFitnessBot = { name: 'N/A', value: 0 };

        for (const bot of allBots) {
            if (bot.totalTrades < 3) continue;
            const sharpe = this.calculateSharpeRatio(bot.pnlHistory);
            const wr = bot.totalTrades > 0 ? bot.wins / bot.totalTrades * 100 : 0;
            const profit = bot.bankroll - INITIAL_BANKROLL;
            const fitness = this.calculateFitness(bot);

            if (sharpe > bestSharpeBot.value) bestSharpeBot = { name: bot.genome.name, value: Math.round(sharpe * 100) / 100 };
            if (wr > bestWinRateBot.value) bestWinRateBot = { name: bot.genome.name, value: Math.round(wr * 10) / 10 };
            if (profit > bestProfitBot.value) bestProfitBot = { name: bot.genome.name, value: Math.round(profit * 100) / 100 };
            if (fitness > bestFitnessBot.value) bestFitnessBot = { name: bot.genome.name, value: Math.round(fitness * 100) / 100 };
        }

        // Elitism status
        let eliteBot: { name: string; sharpe: number; trades: number } | null = null;
        let topSharpe = -Infinity;
        for (const bot of allBots) {
            if (bot.totalTrades >= 5) {
                const s = this.calculateSharpeRatio(bot.pnlHistory);
                if (s > topSharpe) {
                    topSharpe = s;
                    eliteBot = { name: bot.genome.name, sharpe: Math.round(s * 100) / 100, trades: bot.totalTrades };
                }
            }
        }

        // Trade distribution by reason
        const reasonCounts: Record<string, number> = {};
        for (const bot of allBots) {
            for (const t of bot.tradeHistory) {
                reasonCounts[t.reason] = (reasonCounts[t.reason] || 0) + 1;
            }
        }

        return {
            version: 2,
            generation: this.generation,
            currentCycle: this.currentCycle,
            isRunning: this.isRunning,
            uptime: this.isRunning ? Math.round((Date.now() - new Date(activeBots[0]?.startTime || Date.now()).getTime()) / 60000) : 0,
            aggregate: {
                totalBots: allBots.length,
                aliveBots: activeBots.length,
                totalTrades,
                totalWins,
                totalLosses,
                overallWinRate: totalTrades > 0 ? Math.round(totalWins / totalTrades * 1000) / 10 : 0,
                totalBankroll: Math.round(totalBankroll * 100) / 100,
                avgBankroll: Math.round(avgBankroll * 100) / 100,
                combinedPnL: Math.round((totalBankroll - INITIAL_BANKROLL * allBots.length) * 100) / 100
            },
            bestPerformers: {
                sharpe: bestSharpeBot,
                winRate: bestWinRateBot,
                profit: bestProfitBot,
                fitness: bestFitnessBot
            },
            eliteBot,
            tradeReasons: reasonCounts,
            hallOfFame: this.hallOfFame.slice(0, 10)
        };
    }

    getHallOfFame(): any {
        return {
            version: 2,
            entries: this.hallOfFame,
            totalRecorded: this.hallOfFame.length
        };
    }
}

export default DNAArenaV2Engine;
