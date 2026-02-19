/**
 * GroupArena - Arena of 5 bots with shared DNA personality
 * Reuses all DNAArenaV2 genetics: SignalPool, consensus, crossover, mutation, fitness.
 * Each group has a distinct "personality" (genesis gene pool).
 */

import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from '../BinanceApiService';
import { SignalPoolEngine, MarketSignals, PoolSignal } from '../SignalPoolEngine';
import { GenomeV2, BotStateV2, PositionV2, TradeRecordV2 } from '../DNAArenaV2Engine';
import { DNAVectorMemory } from './DNAVectorMemory';
import { StrategyParamDNA } from './StrategyParamDNA';
import { MarketRegimeDNA } from './MarketRegimeDNA';
import { TemporalDNA } from './TemporalDNA';
import { CorrelationDNA } from './CorrelationDNA';
import { SentimentDNA } from './SentimentDNA';
import { RiskAdaptDNA } from './RiskAdaptDNA';
import { MetaEvolutionDNA } from './MetaEvolutionDNA';
import { PatternDNA } from './PatternDNA';
import { SymbolSelectionDNA } from './SymbolSelectionDNA';
import { AdaptiveMutationEngine, MutationType, MutationDirection } from './AdaptiveMutationEngine';
import { checkpointMonitor } from '../checkpoint-monitor';
import { strategyArena } from './StrategyArena';
import { dynamicRiskManager } from '../DynamicRiskManager';
import { PortfolioExposureManager } from '../PortfolioExposureManager';
import { correlationMonitor } from '../CorrelationMonitor';

const STRATEGY_COUNT = 30;
const INITIAL_BANKROLL = 100;
const GOAL_BANKROLL = 10000;
const BOTS_PER_GROUP = 5;
const INTRA_EVOLUTION_INTERVAL = 50; // Every 50 cycles

export type GroupPersonality = 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA' | 'OMEGA';

interface GroupConfig {
    style: string;
    consensusMin: number;
    preferredDirection: 'ANY' | 'LONG_BIAS' | 'SHORT_BIAS';
    atrTP: number;
    atrSL: number;
    leverageMin: number;
    leverageMax: number;
    strategyRange?: [number, number]; // Optional: restrict to strategy range
}

const GROUP_CONFIGS: Record<GroupPersonality, GroupConfig> = {
    ALPHA: {
        style: 'Aggressive Trend-Following',
        consensusMin: 3, preferredDirection: 'LONG_BIAS',
        atrTP: 2.0, atrSL: 1.0, leverageMin: 40, leverageMax: 50
    },
    BETA: {
        style: 'Conservative Mean-Reversion',
        consensusMin: 6, preferredDirection: 'ANY',
        atrTP: 3.0, atrSL: 1.5, leverageMin: 20, leverageMax: 30
    },
    GAMMA: {
        style: 'Balanced Multi-Strategy',
        consensusMin: 4, preferredDirection: 'ANY',
        atrTP: 2.5, atrSL: 1.2, leverageMin: 30, leverageMax: 40
    },
    DELTA: {
        style: 'Momentum Specialist',
        consensusMin: 4, preferredDirection: 'ANY',
        atrTP: 2.0, atrSL: 0.8, leverageMin: 35, leverageMax: 45,
        strategyRange: [10, 19]
    },
    OMEGA: {
        style: 'Volatility Hunter',
        consensusMin: 5, preferredDirection: 'ANY',
        atrTP: 3.5, atrSL: 1.8, leverageMin: 25, leverageMax: 35,
        strategyRange: [20, 29]
    }
};

const BOT_NAME_POOL = [
    'Hydra', 'Phoenix', 'Cerberus', 'Atlas', 'Kraken', 'Titan', 'Nexus',
    'Vortex', 'Zenith', 'Apex', 'Sigma', 'Nova', 'Pulse', 'Forge', 'Storm',
    'Drift', 'Blaze', 'Echo', 'Shard', 'Flux', 'Rune', 'Cipher', 'Ember',
    'Frost', 'Prism', 'Arc', 'Bolt', 'Crest', 'Dawn', 'Edge'
];

export class GroupArena {
    readonly groupId: GroupPersonality;
    readonly config: GroupConfig;
    private bots: Map<string, BotStateV2> = new Map();
    private generation: number = 1;
    public currentCycle: number = 0;
    private dnaMemory: DNAVectorMemory | null = null;
    private _pauseMultiplier: number = 1.0; // 1.0 = normal, <1 = reduced activity

    // Mycelium Seeds (9 evolutionary dimensions)
    strategyParamDNA: StrategyParamDNA;
    regimeDNA: MarketRegimeDNA;
    temporalDNA: TemporalDNA;
    correlationDNA: CorrelationDNA;
    sentimentDNA: SentimentDNA;
    riskAdaptDNA: RiskAdaptDNA;
    metaEvolutionDNA: MetaEvolutionDNA;
    patternDNA: PatternDNA;
    symbolSelectionDNA: SymbolSelectionDNA;

    // Per-group portfolio exposure (isolated from other groups)
    private portfolioExposureManager: PortfolioExposureManager;

    // Adaptive Mutation System (CEO-BINANCE directive)
    private adaptiveMutation: AdaptiveMutationEngine;

    constructor(
        groupId: GroupPersonality,
        private binanceService: BinanceApiService,
        private signalPool: SignalPoolEngine
    ) {
        this.groupId = groupId;
        this.config = GROUP_CONFIGS[groupId];

        // Per-group portfolio exposure manager (isolated correlation tracking)
        this.portfolioExposureManager = new PortfolioExposureManager();
        this.portfolioExposureManager.setLimits({ maxOpenPositions: 5 });

        // Initialize all mycelium seeds with group personality
        this.strategyParamDNA = new StrategyParamDNA(groupId);
        this.regimeDNA = new MarketRegimeDNA(groupId);
        this.temporalDNA = new TemporalDNA(groupId);
        this.correlationDNA = new CorrelationDNA(groupId);
        this.sentimentDNA = new SentimentDNA(groupId);
        this.riskAdaptDNA = new RiskAdaptDNA(groupId);
        this.metaEvolutionDNA = new MetaEvolutionDNA(groupId);
        this.patternDNA = new PatternDNA(groupId);
        this.symbolSelectionDNA = new SymbolSelectionDNA(groupId);

        // Initialize adaptive mutation engine with checkpoint monitoring
        this.adaptiveMutation = new AdaptiveMutationEngine(
            groupId,
            (event) => checkpointMonitor.recordMutation(event)
        );
    }

    setDNAMemory(memory: DNAVectorMemory): void {
        this.dnaMemory = memory;
    }

    /**
     * Initialize group with 5 genesis bots
     */
    initialize(): void {
        this.bots.clear();
        this.generation = 1;
        this.currentCycle = 0;

        // Reset all mycelium seeds to fresh genesis state
        this.strategyParamDNA = new StrategyParamDNA(this.groupId);
        this.regimeDNA = new MarketRegimeDNA(this.groupId);
        this.temporalDNA = new TemporalDNA(this.groupId);
        this.correlationDNA = new CorrelationDNA(this.groupId);
        this.sentimentDNA = new SentimentDNA(this.groupId);
        this.riskAdaptDNA = new RiskAdaptDNA(this.groupId);
        this.metaEvolutionDNA = new MetaEvolutionDNA(this.groupId);
        this.patternDNA = new PatternDNA(this.groupId);
        this.symbolSelectionDNA = new SymbolSelectionDNA(this.groupId);

        for (let i = 0; i < BOTS_PER_GROUP; i++) {
            const genome = this.createGenesisGenome(i);
            this.bots.set(genome.id, this.createBotState(genome));
        }
    }

    /**
     * Execute one cycle: seeds → signals → consensus → trade → monitor
     */
    async executeCycle(allSignals: MarketSignals[]): Promise<void> {
        this.currentCycle++;

        // Update portfolio exposure manager with current group bankroll
        this.portfolioExposureManager.updateBankroll(this.getGroupBankroll());

        // Seed 3: Temporal check - apply minimum floor (0.15) so bots never fully stop
        // TemporalDNA can reduce activity but not block it entirely (was causing 12h+ silent periods)
        const rawTemporalWeight = this.temporalDNA.getActivityWeight();
        const temporalWeight = Math.max(rawTemporalWeight, 0.15);

        // Seed 2: Classify market regime
        this.regimeDNA.classify(allSignals, this.currentCycle);
        const regimeBoosts = this.regimeDNA.getRegimeBoosts();

        // Seed 5: Update sentiment from market data
        if (allSignals.length > 0) {
            const avgPrice = allSignals.reduce((s, ms) => s + ms.currentPrice, 0) / allSignals.length;
            const avgVolume = allSignals.reduce((s, ms) => s + ms.summary.longCount + ms.summary.shortCount, 0) / allSignals.length;
            this.sentimentDNA.update(avgPrice, avgVolume, this.currentCycle);
        }

        // Seed 4: Update correlation state
        for (const ms of allSignals) {
            const dominantDir = ms.summary.longCount > ms.summary.shortCount ? 'LONG'
                : ms.summary.shortCount > ms.summary.longCount ? 'SHORT' : 'NEUTRAL';
            this.correlationDNA.updatePairState(ms.symbol, dominantDir as 'LONG' | 'SHORT' | 'NEUTRAL', ms.currentPrice);
        }

        // Seed 9: Symbol rotation check
        this.symbolSelectionDNA.maybeRotate(this.currentCycle);

        // Apply RANGING optimizations for DELTA group
        if (this.groupId === 'DELTA' && this.regimeDNA.getCurrentRegime() === 'RANGING') {
            this.applyRangingOptimizations();
        }

        for (const [, botState] of this.bots) {
            if (!botState.isAlive) continue;

            // Monitor open positions (TP/SL/Trailing)
            await this.monitorPositions(botState, allSignals);

            // Check bankroll
            if (botState.bankroll <= 0) {
                this.handleBankrupt(botState);
                continue;
            }
            if (botState.bankroll >= GOAL_BANKROLL) {
                this.handleGoalReached(botState);
                continue;
            }

            // Evaluate consensus for each symbol
            for (const marketSignals of allSignals) {
                // Seed 9: Check symbol weight
                const symbolWeight = this.symbolSelectionDNA.getSymbolWeight(marketSignals.symbol);
                if (symbolWeight < 0.2) continue; // Symbol filtered out

                // Seed 1: Process signals through evolvable parameters
                const processedSignals = this.strategyParamDNA.processSignals(
                    marketSignals.signals, marketSignals.higherTF
                );
                const processedMarket: MarketSignals = {
                    ...marketSignals,
                    signals: processedSignals,
                    summary: {
                        longCount: processedSignals.filter(s => s.direction === 'LONG').length,
                        shortCount: processedSignals.filter(s => s.direction === 'SHORT').length,
                        neutralCount: processedSignals.filter(s => s.direction === 'NEUTRAL').length,
                        avgLongStrength: processedSignals.filter(s => s.direction === 'LONG').reduce((sum, s) => sum + s.strength, 0) / Math.max(1, processedSignals.filter(s => s.direction === 'LONG').length),
                        avgShortStrength: processedSignals.filter(s => s.direction === 'SHORT').reduce((sum, s) => sum + s.strength, 0) / Math.max(1, processedSignals.filter(s => s.direction === 'SHORT').length),
                    }
                };

                const decision = this.evaluateConsensus(botState.genome, processedMarket);
                if (decision.shouldTrade) {
                    // Seed 4: Correlation modifier
                    const corrMod = this.correlationDNA.getCorrelationModifier(marketSignals.symbol, decision.direction);

                    // Seed 5: Sentiment modifier
                    const sentMod = this.sentimentDNA.getSentimentModifier(decision.direction);
                    if (!sentMod.shouldTrade) continue;

                    // Seed 8: Pattern analysis
                    const candles = this.extractCandles(marketSignals);
                    const patternResult = this.patternDNA.analyze(candles, marketSignals.currentPrice);

                    // Weighted ensemble (not multiplicative - prevents single seed veto)
                    const seedModifier = 0.25 * corrMod + 0.20 * sentMod.modifier + 0.20 * patternResult.modifier + 0.15 * temporalWeight + 0.20 * symbolWeight;

                    // Only trade if combined seeds agree (threshold lowered from 0.6 to 0.45 - was too restrictive)
                    const tradeThreshold = 0.45 + (1 - this._pauseMultiplier) * 0.3; // 0.45 normal, up to 0.75 when paused
                    if (seedModifier > tradeThreshold) {
                        // Seed 6: Risk adaptation
                        const drawdown = botState.maxBankroll > 0
                            ? ((botState.maxBankroll - botState.bankroll) / botState.maxBankroll) * 100 : 0;
                        const riskMult = this.riskAdaptDNA.getRiskMultiplier({
                            currentDrawdown: drawdown,
                            consecutiveWins: botState.consecutiveWins,
                            consecutiveLosses: botState.consecutiveLosses,
                            bankroll: botState.bankroll,
                            initialBankroll: botState.initialBankroll,
                            isHighVolatility: this.regimeDNA.getCurrentRegime() === 'VOLATILE'
                        });

                        await this.openPosition(botState, marketSignals.symbol, decision,
                            marketSignals.atr14_5m || marketSignals.atr14, riskMult);
                    }
                }
            }
        }

        // Intra-group evolution (Seed 7: MetaEvolution controls interval)
        const evoInterval = this.metaEvolutionDNA.getEvolutionInterval();
        if (this.currentCycle % evoInterval === 0 && this.currentCycle > 0) {
            this.intraGroupEvolution();
        }
        
        // ===== STRATEGY ARENA COMPETITION (CEO-BINANCE directive) =====
        // Execute strategy competition cycle every 10 cycles
        if (this.currentCycle % 10 === 0 && this.currentCycle > 0) {
            strategyArena.executeCycle().catch(err => {
                console.error('⚠️ Strategy Arena error:', err);
            });
        }
    }

    private extractCandles(ms: MarketSignals): { open: number; high: number; low: number; close: number }[] {
        // Try to get real OHLC candles from SignalPool cache
        const cached = this.signalPool.getCachedCandles(ms.symbol, '1m');
        if (cached && cached.open.length >= 10) {
            // Use last 10 real candles for pattern detection
            const len = cached.open.length;
            const start = Math.max(0, len - 10);
            const candles: { open: number; high: number; low: number; close: number }[] = [];
            for (let i = start; i < len; i++) {
                candles.push({ open: cached.open[i], high: cached.high[i], low: cached.low[i], close: cached.close[i] });
            }
            return candles;
        }

        // Fallback: synthetic candles from price + ATR
        const price = ms.currentPrice;
        const atr = ms.atr14 || price * 0.001;
        const bias = ms.summary.longCount > ms.summary.shortCount ? 1 : -1;
        return [
            { open: price - atr * 0.5 * bias, high: price + atr * 0.3, low: price - atr * 0.3, close: price - atr * 0.2 * bias },
            { open: price - atr * 0.2 * bias, high: price + atr * 0.4, low: price - atr * 0.4, close: price + atr * 0.1 * bias },
            { open: price + atr * 0.1 * bias, high: price + atr * 0.5, low: price - atr * 0.2, close: price }
        ];
    }

    // ======================== CONSENSUS (reused from V2) ========================

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

        const activeSignals: { signal: PoolSignal; weight: number }[] = [];
        for (let i = 0; i < marketSignals.signals.length && i < STRATEGY_COUNT; i++) {
            if (genome.strategyMask[i]) {
                activeSignals.push({ signal: marketSignals.signals[i], weight: genome.strategyWeights[i] || 1.0 });
            }
        }
        if (activeSignals.length === 0) return noTrade;

        let longScore = 0, shortScore = 0, longCount = 0, shortCount = 0;
        const longStrategies: { id: string; score: number }[] = [];
        const shortStrategies: { id: string; score: number }[] = [];

        for (const { signal, weight } of activeSignals) {
            if (signal.direction === 'NEUTRAL') continue;
            const weightedStr = signal.strength * weight;
            if (signal.direction === 'LONG') {
                longScore += weightedStr; longCount++;
                longStrategies.push({ id: signal.strategyId, score: weightedStr });
            } else {
                shortScore += weightedStr; shortCount++;
                shortStrategies.push({ id: signal.strategyId, score: weightedStr });
            }
        }

        const dominantDir = longScore >= shortScore ? 'LONG' : 'SHORT';
        const agreeingCount = dominantDir === 'LONG' ? longCount : shortCount;
        const opposingCount = dominantDir === 'LONG' ? shortCount : longCount;
        const agreeingScore = dominantDir === 'LONG' ? longScore : shortScore;
        const weightedStrength = agreeingCount > 0 ? agreeingScore / agreeingCount : 0;

        // Directional bias
        if (genome.consensus.preferredDirection === 'LONG_BIAS' && dominantDir === 'SHORT') {
            if (agreeingCount < genome.consensus.minAgreeingSignals + 2) return noTrade;
        }
        if (genome.consensus.preferredDirection === 'SHORT_BIAS' && dominantDir === 'LONG') {
            if (agreeingCount < genome.consensus.minAgreeingSignals + 2) return noTrade;
        }

        if (agreeingCount < genome.consensus.minAgreeingSignals) return noTrade;
        if (opposingCount > genome.consensus.maxOpposingSignals) return noTrade;
        if (weightedStrength < genome.consensus.minWeightedStrength) return noTrade;

        // Multi-timeframe confirmation
        const htf = marketSignals.higherTF;
        let htfMultiplier = 1.0;
        if (htf.bias === dominantDir && htf.strength > 30) htfMultiplier = 1.15;
        else if (htf.bias !== 'NEUTRAL' && htf.bias !== dominantDir && htf.strength > 50) htfMultiplier = 0.85;

        const topStrats = (dominantDir === 'LONG' ? longStrategies : shortStrategies)
            .sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.id);

        const rawConfidence = (agreeingCount / Math.max(1, agreeingCount + opposingCount)) * weightedStrength;
        return {
            shouldTrade: true, direction: dominantDir,
            confidence: Math.min(100, rawConfidence * htfMultiplier),
            agreeingCount, opposingCount, weightedStrength, topStrategies: topStrats
        };
    }

    // ======================== POSITION MANAGEMENT (reused from V2) ========================

    private async openPosition(botState: BotStateV2, symbol: string, decision: {
        direction: 'LONG' | 'SHORT'; confidence: number;
        agreeingCount: number; opposingCount: number; weightedStrength: number; topStrategies: string[];
    }, atr: number | null, riskMultiplier: number = 1.0): Promise<void> {
        const genome = botState.genome;
        if (botState.openPositions.size >= genome.risk.maxOpenPositions) return;
        if (botState.openPositions.has(symbol)) return;

        const cooldownExpiry = botState.symbolCooldowns.get(symbol);
        if (cooldownExpiry && this.currentCycle < cooldownExpiry) return;

        // C2 fix: guard against division by zero when bankroll is 0
        if (botState.bankroll <= 0) return;
        
        // ===== DYNAMIC RISK MANAGEMENT (CEO-BINANCE directive) =====
        // Calculate optimal risk based on multiple factors
        const riskCalculation = dynamicRiskManager.calculateOptimalRisk({
            marketVolatility: atr ? (atr / botState.bankroll) : 0.001,
            botConfidence: decision.weightedStrength,
            recentPerformance: botState.pnlHistory.length > 0
                ? botState.pnlHistory.reduce((a, b) => a + b, 0) / botState.pnlHistory.length
                : 0,
            correlationWithOtherBots: correlationMonitor.getAverageCorrelation(),
            timeOfDay: new Date().getHours(),
            currentDrawdown: botState.maxBankroll > 0
                ? (botState.maxBankroll - botState.bankroll) / botState.maxBankroll
                : 0,
            consecutiveLosses: botState.consecutiveLosses,
            groupId: this.groupId
        });
        
        // Check portfolio exposure limits
        const canOpen = this.portfolioExposureManager.canOpenPosition(
            symbol,
            decision.direction,
            botState.bankroll * (riskCalculation.optimalRiskPercent / 100),
            riskCalculation.leverageLimit
        );
        
        if (!canOpen.allowed) {
            console.log(`⚠️ Posição recusada: ${canOpen.reason}`);
            return;
        }
        
        const exposurePercent = (botState.totalExposure / botState.bankroll) * 100;
        if (exposurePercent >= genome.risk.maxExposurePercent) return;

        // Use dynamic risk calculation instead of static betPercent
        const dynamicBetPercent = riskCalculation.optimalRiskPercent * riskMultiplier;
        const betAmount = Math.max(1, Math.min(
            botState.bankroll * (dynamicBetPercent / 100),
            botState.bankroll - botState.totalExposure
        ));
        if (betAmount < 1) return;

        try {
            const price = await this.binanceService.getFuturesPrice(symbol);
            if (!price) return;

            // Use dynamic leverage limit from risk manager
            const leverage = Math.min(genome.risk.leverage, riskCalculation.leverageLimit);
            const notional = betAmount * leverage;
            const quantity = parseFloat((notional / price).toFixed(symbol === 'BTCUSDT' ? 3 : symbol === 'ETHUSDT' ? 3 : 1));

            // Use dynamic stop loss and take profit distances
            const effectiveATR = atr || (price * 0.001);
            const tpDistance = riskCalculation.takeProfitDistance > 0 
                ? (riskCalculation.takeProfitDistance / 100) * price 
                : effectiveATR * genome.risk.atrMultiplierTP;
            const slDistance = riskCalculation.stopLossDistance > 0 
                ? (riskCalculation.stopLossDistance / 100) * price 
                : effectiveATR * genome.risk.atrMultiplierSL;
            const trailDistance = genome.risk.trailingStopATR > 0 ? effectiveATR * genome.risk.trailingStopATR : 0;

            const tp = decision.direction === 'LONG' ? price + tpDistance : price - tpDistance;
            const sl = decision.direction === 'LONG' ? price - slDistance : price + slDistance;

            const position: PositionV2 = {
                symbol, side: decision.direction, entryPrice: price, quantity, leverage,
                betAmount, takeProfitPrice: tp, stopLossPrice: sl,
                trailingStopDistance: trailDistance, highWaterMark: price,
                openTime: new Date().toISOString(),
                orderId: `eco_${this.groupId}_${botState.genome.id}_${Date.now()}`,
                consensusSnapshot: {
                    agreeingCount: decision.agreeingCount, opposingCount: decision.opposingCount,
                    weightedStrength: decision.weightedStrength, topStrategies: decision.topStrategies
                }
            };

            botState.openPositions.set(symbol, position);
            botState.totalExposure += betAmount;
            
            // ===== REGISTER WITH RISK MANAGERS =====
            this.portfolioExposureManager.addPosition({
                symbol,
                side: decision.direction,
                betAmount,
                leverage,
                notionalValue: notional,
                entryPrice: price,
                currentPrice: price,
                unrealizedPnl: 0
            });
            
            correlationMonitor.addPosition({
                botId: botState.sessionId,
                symbol,
                side: decision.direction,
                betAmount,
                leverage,
                entryTime: this.currentCycle
            });
            
            console.log(`✅ [${this.groupId}] Posição aberta: ${symbol} ${decision.direction} - $${betAmount.toFixed(2)} x${leverage} (TP: ${tp.toFixed(2)}, SL: ${sl.toFixed(2)})`);
        } catch (err) {
            console.error(`❌ [${this.groupId}] openPosition error ${symbol}:`, err instanceof Error ? err.message : err);
        }
    }

    private async monitorPositions(botState: BotStateV2, allSignals: MarketSignals[]): Promise<void> {
        const toClose: string[] = [];

        for (const [symbol, pos] of botState.openPositions) {
            try {
                const currentPrice = await this.binanceService.getFuturesPrice(symbol);
                if (!currentPrice) continue;

                // Breakeven stop at 50% TP
                const tpDistance = Math.abs(pos.takeProfitPrice - pos.entryPrice);
                const currentProfit = pos.side === 'LONG' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
                if (currentProfit > tpDistance * 0.5) {
                    if (pos.side === 'LONG' && pos.stopLossPrice < pos.entryPrice) pos.stopLossPrice = pos.entryPrice;
                    else if (pos.side === 'SHORT' && pos.stopLossPrice > pos.entryPrice) pos.stopLossPrice = pos.entryPrice;
                }

                // Trailing stop
                if (pos.trailingStopDistance > 0) {
                    if (pos.side === 'LONG' && currentPrice > pos.highWaterMark) {
                        pos.highWaterMark = currentPrice;
                        const newSL = currentPrice - pos.trailingStopDistance;
                        if (newSL > pos.stopLossPrice) pos.stopLossPrice = newSL;
                    } else if (pos.side === 'SHORT' && currentPrice < pos.highWaterMark) {
                        pos.highWaterMark = currentPrice;
                        const newSL = currentPrice + pos.trailingStopDistance;
                        if (newSL < pos.stopLossPrice) pos.stopLossPrice = newSL;
                    }
                }

                let shouldClose = false;
                let reason: 'TAKE_PROFIT' | 'STOP_LOSS' = 'TAKE_PROFIT';

                if (pos.side === 'LONG') {
                    if (currentPrice >= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice <= pos.stopLossPrice) { shouldClose = true; reason = 'STOP_LOSS'; }
                } else {
                    if (currentPrice <= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice >= pos.stopLossPrice) { shouldClose = true; reason = 'STOP_LOSS'; }
                }

                // Signal-based exit
                if (!shouldClose && botState.genome.risk.flipExitThreshold > 0) {
                    const marketData = allSignals.find(s => s.symbol === symbol);
                    if (marketData) {
                        const opposingDir = pos.side === 'LONG' ? 'SHORT' : 'LONG';
                        const opposingCount = marketData.signals.filter(s => s.direction === opposingDir).length;
                        if (opposingCount >= botState.genome.risk.flipExitThreshold) {
                            shouldClose = true;
                            reason = currentProfit > 0 ? 'TAKE_PROFIT' : 'STOP_LOSS';
                        }
                    }
                }

                if (shouldClose) {
                    // C1 fix: delete position atomically with close to prevent double PnL
                    botState.openPositions.delete(symbol);
                    this.closePosition(botState, symbol, currentPrice, reason, pos);
                }
            } catch (err) {
                console.error(`❌ [${this.groupId}] monitorPositions error ${symbol}:`, err instanceof Error ? err.message : err);
            }
        }
    }

    private closePosition(botState: BotStateV2, symbol: string, exitPrice: number, reason: 'TAKE_PROFIT' | 'STOP_LOSS', pos?: PositionV2): void {
        // C1 fix: accept pos directly (already deleted from map) or fallback to map lookup
        const position = pos || botState.openPositions.get(symbol);
        if (!position) return;
        const posRef = position;

        const priceDiff = posRef.side === 'LONG' ? exitPrice - posRef.entryPrice : posRef.entryPrice - exitPrice;
        const pnlPercent = (priceDiff / posRef.entryPrice) * 100 * posRef.leverage;
        const pnlValue = posRef.betAmount * (pnlPercent / 100);

        const bankrollBefore = botState.bankroll;
        botState.bankroll = Math.max(0, bankrollBefore + pnlValue);
        botState.totalExposure = Math.max(0, botState.totalExposure - posRef.betAmount);

        botState.pnlHistory.push(pnlPercent);
        if (botState.pnlHistory.length > 200) botState.pnlHistory = botState.pnlHistory.slice(-200);

        botState.totalTrades++;

        // ===== ODDS TRACKING (CEO-BINANCE directive) =====
        // Calculate actual odds: how much was won/lost relative to bet
        const actualOdd = pnlValue > 0 ? (pnlValue / posRef.betAmount) : (Math.abs(pnlValue) / posRef.betAmount);

        // ===== STRATEGY METRICS (CEO-BINANCE directive) =====
        // Extract strategy data from consensus snapshot
        const activeStrategies = posRef.consensusSnapshot.topStrategies || [];
        const strategyStrengths: { [key: string]: number } = {};
        let topStrategy = '';
        let topStrategyStrength = 0;

        // Initialize strategy metrics if not exists
        if (Object.keys(botState.strategyMetrics).length === 0) {
            // Initialize for all 30 strategies
            for (let i = 0; i < 30; i++) {
                const stratId = `strat_${i}`;
                botState.strategyMetrics[stratId] = {
                    strategyId: stratId,
                    totalTrades: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    totalTakeProfitValue: 0,
                    totalStopLossValue: 0,
                    avgTakeProfitOdd: 0,
                    avgStopLossOdd: 0,
                    expectedValue: 0,
                    avgSignalStrength: 0,
                    participationRate: 0
                };
            }
        }

        if (pnlValue > 0) {
            botState.wins++;
            botState.consecutiveWins++;
            botState.consecutiveLosses = 0;
            botState.currentBetPercent = Math.min(botState.genome.betting.maxBetPercent, botState.currentBetPercent * botState.genome.betting.winMultiplier);

            // Update TP tracking
            botState.totalTakeProfitValue += pnlValue;
            // Recalculate average TP odd
            botState.avgTakeProfitOdd = botState.wins > 0 ? botState.totalTakeProfitValue / botState.wins / posRef.betAmount : 0;

            // Update strategy metrics for wins
            for (const stratId of activeStrategies) {
                if (botState.strategyMetrics[stratId]) {
                    botState.strategyMetrics[stratId].wins++;
                    botState.strategyMetrics[stratId].totalTakeProfitValue += pnlValue;
                    botState.strategyMetrics[stratId].avgTakeProfitOdd =
                        botState.strategyMetrics[stratId].wins > 0
                            ? botState.strategyMetrics[stratId].totalTakeProfitValue / botState.strategyMetrics[stratId].wins / posRef.betAmount
                            : 0;
                }
            }
        } else {
            botState.losses++;
            botState.consecutiveLosses++;
            botState.consecutiveWins = 0;
            botState.currentBetPercent = Math.max(1, botState.currentBetPercent * botState.genome.betting.lossMultiplier);
            if (botState.consecutiveLosses >= botState.genome.betting.resetAfterLosses) {
                botState.currentBetPercent = botState.genome.betting.basePercent;
            }

            // Update SL tracking
            botState.totalStopLossValue += Math.abs(pnlValue);
            // Recalculate average SL odd
            botState.avgStopLossOdd = botState.losses > 0 ? botState.totalStopLossValue / botState.losses / posRef.betAmount : 0;

            // Update strategy metrics for losses
            for (const stratId of activeStrategies) {
                if (botState.strategyMetrics[stratId]) {
                    botState.strategyMetrics[stratId].losses++;
                    botState.strategyMetrics[stratId].totalStopLossValue += Math.abs(pnlValue);
                    botState.strategyMetrics[stratId].avgStopLossOdd =
                        botState.strategyMetrics[stratId].losses > 0
                            ? botState.strategyMetrics[stratId].totalStopLossValue / botState.strategyMetrics[stratId].losses / posRef.betAmount
                            : 0;
                }
            }
        }

        // Update strategy participation and expected value
        for (const stratId of activeStrategies) {
            if (botState.strategyMetrics[stratId]) {
                const metrics = botState.strategyMetrics[stratId];
                metrics.totalTrades++;
                metrics.winRate = metrics.totalTrades > 0 ? metrics.wins / metrics.totalTrades : 0;
                metrics.expectedValue = (metrics.winRate * metrics.avgTakeProfitOdd) - ((1 - metrics.winRate) * metrics.avgStopLossOdd);
                metrics.participationRate = botState.totalTrades > 0 ? metrics.totalTrades / botState.totalTrades : 0;
                
                // ===== STRATEGY ARENA UPDATE =====
                // Update arena with strategy performance
                strategyArena.updateStrategyMetrics(
                    stratId,
                    pnlValue,
                    posRef.betAmount,
                    pnlValue > 0,
                    posRef.consensusSnapshot.weightedStrength
                );
            }
        }

        // Calculate expected value: (winRate * avgTP) - (lossRate * avgSL)
        const winRate = botState.totalTrades > 0 ? botState.wins / botState.totalTrades : 0;
        const lossRate = 1 - winRate;
        botState.expectedValue = (winRate * botState.avgTakeProfitOdd) - (lossRate * botState.avgStopLossOdd);

        botState.maxBankroll = Math.max(botState.maxBankroll, botState.bankroll);
        botState.minBankroll = Math.min(botState.minBankroll, botState.bankroll);
        const drawdown = botState.maxBankroll > 0 ? ((botState.maxBankroll - botState.bankroll) / botState.maxBankroll) * 100 : 0;
        botState.maxDrawdown = Math.max(botState.maxDrawdown, drawdown);
        botState.lastTradeTime = new Date().toISOString();

        if (pnlValue < 0) botState.symbolCooldowns.set(symbol, this.currentCycle + 10);

        // Record outcomes to ALL mycelium seeds (with pnlPercent for Sharpe fitness)
        const profitable = pnlValue > 0;
        this.strategyParamDNA.recordOutcome(profitable, pnlPercent);
        this.regimeDNA.recordOutcome(profitable, pnlPercent);
        this.temporalDNA.recordTrade(profitable, pnlPercent);
        this.correlationDNA.recordOutcome(profitable, pnlPercent);
        this.sentimentDNA.recordOutcome(profitable, pnlPercent);
        this.patternDNA.recordOutcome(profitable, pnlPercent);
        this.symbolSelectionDNA.recordTrade(symbol, profitable, pnlPercent, this.currentCycle);

        botState.tradeHistory.push({
            symbol, side: posRef.side, entryPrice: posRef.entryPrice, exitPrice,
            betAmount: posRef.betAmount, pnlPercent: Math.round(pnlPercent * 100) / 100,
            pnlValue: Math.round(pnlValue * 100) / 100, reason,
            bankrollBefore: Math.round(bankrollBefore * 100) / 100,
            bankrollAfter: Math.round(botState.bankroll * 100) / 100,
            timestamp: new Date().toISOString(),
            consensusSnapshot: posRef.consensusSnapshot,
            // ===== STRATEGY METRICS =====
            activeStrategies,
            strategyStrengths,
            topStrategy,
            topStrategyStrength
        });

        if (botState.tradeHistory.length > 100) botState.tradeHistory = botState.tradeHistory.slice(-100);
        
        // ===== RISK MANAGER UPDATE =====
        // Register loss for circuit breaker (per group)
        dynamicRiskManager.recordLoss(pnlValue, bankrollBefore, this.groupId);

        // Remove from portfolio exposure (per group instance)
        this.portfolioExposureManager.removePosition(symbol, posRef.side);
        
        // Remove from correlation monitor
        correlationMonitor.removePosition(botState.sessionId);
    }

    // ======================== EVOLUTION ========================

    private handleBankrupt(botState: BotStateV2): void {
        console.log(`💀 [${this.groupId}] ${botState.genome.name} BANKRUPT (Gen ${botState.genome.generation})`);

        // Record experience in DNA memory
        if (this.dnaMemory) {
            this.dnaMemory.recordExperience(
                botState.genome, botState,
                this.calculateFitness(botState), false, 0, this.groupId
            );
        }

        botState.deathCount++;
        this.replaceBot(botState);
    }

    private handleGoalReached(botState: BotStateV2): void {
        console.log(`🏆 [${this.groupId}] ${botState.genome.name} REACHED $${GOAL_BANKROLL}!`);

        if (this.dnaMemory) {
            const milestone = botState.bankroll >= INITIAL_BANKROLL * 10 ? 10 :
                botState.bankroll >= INITIAL_BANKROLL * 5 ? 5 :
                botState.bankroll >= INITIAL_BANKROLL * 3 ? 3 : 2;
            this.dnaMemory.recordExperience(
                botState.genome, botState,
                this.calculateFitness(botState), true, milestone, this.groupId
            );
        }

        // Don't replace - let it keep running but record the achievement
    }

    private replaceBot(deadBot: BotStateV2): void {
        // CEO-BINANCE: Record death for adaptive mutation
        this.adaptiveMutation.recordDeath(this.currentCycle);

        const aliveBots = this.getAliveBots();
        if (aliveBots.length === 0) {
            // All dead - respawn with mutation of original
            const genome = this.createGenesisGenome(0);
            this.bots.delete(deadBot.genome.id);
            this.bots.set(genome.id, this.createBotState(genome));
            return;
        }

        // Find best and second best
        const sorted = aliveBots.sort((a, b) => this.calculateFitness(b) - this.calculateFitness(a));
        const best = sorted[0];
        const second = sorted.length > 1 ? sorted[1] : null;

        this.generation++;
        let childGenome: GenomeV2;
        if (second && this.calculateFitness(best) > 0) {
            childGenome = this.crossover(best.genome, second.genome);
        } else {
            childGenome = this.mutate(best.genome);
        }

        // Apply DNA memory guidance
        if (this.dnaMemory) {
            childGenome = this.dnaMemory.guideMutation(childGenome);
        }

        childGenome.generation = this.generation;
        childGenome.id = `eco-${this.groupId}-gen${this.generation}-${Date.now()}`;
        childGenome.name = BOT_NAME_POOL[this.generation % BOT_NAME_POOL.length];

        this.bots.delete(deadBot.genome.id);
        this.bots.set(childGenome.id, this.createBotState(childGenome));

        // CEO-BINANCE: Record evolution event
        this.adaptiveMutation.recordEvolution(this.currentCycle);
    }

    private intraGroupEvolution(): void {
        const alive = this.getAliveBots();
        if (alive.length < 3) return;

        // Seed 7: Tournament selection with evolvable pressure
        const pressure = this.metaEvolutionDNA.getSelectionPressure();
        const worst = this.tournamentSelect(alive, pressure, false); // select weakest
        const parent1 = this.tournamentSelect(alive.filter(b => b !== worst), pressure, true); // select strongest
        const parent2 = this.tournamentSelect(alive.filter(b => b !== worst && b !== parent1), pressure, true);

        // CEO-BINANCE: Record death for adaptive mutation (worst being replaced = "death")
        this.adaptiveMutation.recordDeath(this.currentCycle);

        // Record worst's experience before replacing
        if (this.dnaMemory) {
            this.dnaMemory.recordExperience(
                worst.genome, worst,
                this.calculateFitness(worst), true, 0, this.groupId
            );
        }

        const parentAvgFitness = (this.calculateFitness(parent1) + this.calculateFitness(parent2)) / 2;

        this.generation++;
        let child = this.crossover(parent1.genome, parent2.genome);
        if (this.dnaMemory) child = this.dnaMemory.guideMutation(child);

        child.generation = this.generation;
        child.id = `eco-${this.groupId}-evo-gen${this.generation}-${Date.now()}`;
        child.name = BOT_NAME_POOL[this.generation % BOT_NAME_POOL.length];

        // Replace worst with child
        this.bots.delete(worst.genome.id);
        this.bots.set(child.id, this.createBotState(child));

        // Track meta-evolution: previous child's performance vs parents
        this.metaEvolutionDNA.recordChildPerformance(this.calculateFitness(worst), parentAvgFitness);

        // CEO-BINANCE: Record evolution event
        this.adaptiveMutation.recordEvolution(this.currentCycle);

        // Evolve ALL mycelium seeds alongside bots
        this.evolveSeedsIntraGroup();
    }

    /**
     * Tournament selection: pick tournamentSize random bots, return best (or worst)
     * Higher pressure = larger tournament = more likely to pick extreme performers
     */
    private tournamentSelect(candidates: BotStateV2[], pressure: number, selectBest: boolean): BotStateV2 {
        const tournamentSize = Math.max(2, Math.min(candidates.length, Math.round(pressure)));
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        const tournament = shuffled.slice(0, tournamentSize);
        tournament.sort((a, b) => this.calculateFitness(a) - this.calculateFitness(b));
        return selectBest ? tournament[tournament.length - 1] : tournament[0];
    }

    /**
     * Evolve all 9 mycelium seeds during intra-group evolution
     */
    private evolveSeedsIntraGroup(): void {
        this.strategyParamDNA.evolve();
        this.regimeDNA.evolve();
        this.temporalDNA.evolve();
        this.correlationDNA.evolve();
        this.sentimentDNA.evolve();
        this.riskAdaptDNA.evolve();
        this.metaEvolutionDNA.evolve();
        this.patternDNA.evolve();
        this.symbolSelectionDNA.evolve();
    }

    // ======================== INTER-GROUP OPERATIONS ========================

    /**
     * Remove worst bot (called by CommunityEcosystem during migration)
     */
    removeWorstBot(): BotStateV2 | null {
        const alive = this.getAliveBots();
        if (alive.length === 0) return null;
        const sorted = alive.sort((a, b) => this.calculateFitness(a) - this.calculateFitness(b));
        const worst = sorted[0];

        // CEO-BINANCE: Record death for adaptive mutation (inter-group migration)
        this.adaptiveMutation.recordDeath(this.currentCycle);

        if (this.dnaMemory) {
            this.dnaMemory.recordExperience(worst.genome, worst, this.calculateFitness(worst), false, 0, this.groupId);
        }

        this.bots.delete(worst.genome.id);
        return worst;
    }

    /**
     * Add a bot (migrated from another group)
     */
    addBot(genome: GenomeV2): void {
        const newGenome: GenomeV2 = JSON.parse(JSON.stringify(genome));
        newGenome.id = `eco-${this.groupId}-migrant-${Date.now()}`;
        this.bots.set(newGenome.id, this.createBotState(newGenome));
    }

    /**
     * Get best bot genome (for cloning to other groups)
     */
    getBestGenome(): GenomeV2 | null {
        const alive = this.getAliveBots();
        if (alive.length === 0) return null;
        const sorted = alive.sort((a, b) => this.calculateFitness(b) - this.calculateFitness(a));
        return sorted[0].genome;
    }

    // ======================== GENETICS (reused from V2) ========================

    private crossover(parent1: GenomeV2, parent2: GenomeV2): GenomeV2 {
        const child: GenomeV2 = JSON.parse(JSON.stringify(parent1));
        child.parentIds = [parent1.id, parent2.id];

        // Seed 7: MetaEvolution controls crossover blend ratio
        const blend = this.metaEvolutionDNA.getCrossoverBlend();

        for (let i = 0; i < STRATEGY_COUNT; i++) {
            child.strategyMask[i] = Math.random() < blend ? parent1.strategyMask[i] : parent2.strategyMask[i];
            child.strategyWeights[i] = Math.random() < blend ? parent1.strategyWeights[i] : parent2.strategyWeights[i];
        }

        child.consensus.minAgreeingSignals = Math.random() < blend ? parent1.consensus.minAgreeingSignals : parent2.consensus.minAgreeingSignals;
        child.consensus.maxOpposingSignals = Math.random() < blend ? parent1.consensus.maxOpposingSignals : parent2.consensus.maxOpposingSignals;
        child.consensus.minWeightedStrength = Math.random() < blend ? parent1.consensus.minWeightedStrength : parent2.consensus.minWeightedStrength;

        child.risk.atrMultiplierTP = Math.random() < blend ? parent1.risk.atrMultiplierTP : parent2.risk.atrMultiplierTP;
        child.risk.atrMultiplierSL = Math.random() < blend ? parent1.risk.atrMultiplierSL : parent2.risk.atrMultiplierSL;
        child.risk.trailingStopATR = Math.random() < blend ? parent1.risk.trailingStopATR : parent2.risk.trailingStopATR;
        child.risk.flipExitThreshold = Math.random() < blend ? parent1.risk.flipExitThreshold : parent2.risk.flipExitThreshold;
        child.risk.leverage = Math.random() < blend ? parent1.risk.leverage : parent2.risk.leverage;

        child.betting.basePercent = Math.random() < blend ? parent1.betting.basePercent : parent2.betting.basePercent;
        child.betting.winMultiplier = Math.random() < blend ? parent1.betting.winMultiplier : parent2.betting.winMultiplier;

        return this.mutate(child);
    }

    private mutate(genome: GenomeV2): GenomeV2 {
        const child: GenomeV2 = JSON.parse(JSON.stringify(genome));

        // CEO-BINANCE: Adaptive Mutation System
        const bestFitness = this.getGroupFitness();
        const mutationType = this.adaptiveMutation.selectMutationType(this.currentCycle, bestFitness);
        const profile = this.adaptiveMutation.getMutationProfile(mutationType);

        // Base mutation parameters from MetaEvolution
        const baseMutationRate = this.metaEvolutionDNA.getMutationRate('strategyMask');
        const baseAmplitude = this.metaEvolutionDNA.getMutationAmplitude();

        // Apply adaptive multipliers
        const mutationRate = baseMutationRate * profile.rateMultiplier;
        const amplitude = baseAmplitude * profile.amplitudeMultiplier;
        const direction = profile.direction;

        console.log(`🧩 [${this.groupId}] Mutation: ${mutationType} (${profile.description}) | Rate: ${mutationRate.toFixed(2)} | Amp: ${amplitude.toFixed(2)}`);

        // Strategy mask mutation
        for (let i = 0; i < STRATEGY_COUNT; i++) {
            if (Math.random() < mutationRate) {
                // EXPLORATORY: flip more aggressively
                if (direction === MutationDirection.EXPLORATORY || Math.random() < 0.5) {
                    child.strategyMask[i] = !child.strategyMask[i];
                }
            }
        }

        // Ensure at least 3 strategies active
        const activeCount = child.strategyMask.filter(m => m).length;
        if (activeCount < 3) {
            const inactiveIndices = child.strategyMask.map((m, i) => m ? -1 : i).filter(i => i >= 0);
            for (let i = 0; i < 3 - activeCount && i < inactiveIndices.length; i++) {
                const idx = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
                child.strategyMask[idx] = true;
            }
        }

        // Strategy weights mutation with directional bias
        for (let i = 0; i < STRATEGY_COUNT; i++) {
            if (Math.random() < mutationRate) {
                child.strategyWeights[i] = this.adaptiveMutation.applyDirectionalBias(
                    child.strategyWeights[i], 0.1, 2.0, direction, amplitude * 0.4
                );
            }
        }

        // Consensus parameters
        if (Math.random() < mutationRate) {
            child.consensus.minAgreeingSignals = Math.round(
                this.adaptiveMutation.applyDirectionalBias(child.consensus.minAgreeingSignals, 2, 15, direction, amplitude * 4)
            );
        }
        if (Math.random() < mutationRate) {
            child.consensus.maxOpposingSignals = Math.round(
                this.adaptiveMutation.applyDirectionalBias(child.consensus.maxOpposingSignals, 0, 10, direction, amplitude * 3)
            );
        }
        if (Math.random() < mutationRate) {
            child.consensus.minWeightedStrength = this.adaptiveMutation.applyDirectionalBias(
                child.consensus.minWeightedStrength, 20, 90, direction, amplitude * 20
            );
        }

        // Risk parameters
        if (Math.random() < mutationRate) {
            child.risk.atrMultiplierTP = this.adaptiveMutation.applyDirectionalBias(
                child.risk.atrMultiplierTP, 1.0, 5.0, direction, amplitude * 1.0
            );
        }
        if (Math.random() < mutationRate) {
            child.risk.atrMultiplierSL = this.adaptiveMutation.applyDirectionalBias(
                child.risk.atrMultiplierSL, 0.5, 3.0, direction, amplitude * 0.6
            );
        }
        if (Math.random() < mutationRate) {
            child.risk.trailingStopATR = this.adaptiveMutation.applyDirectionalBias(
                child.risk.trailingStopATR, 0, 3.0, direction, amplitude * 0.8
            );
        }
        if (Math.random() < mutationRate) {
            child.risk.flipExitThreshold = Math.round(
                this.adaptiveMutation.applyDirectionalBias(child.risk.flipExitThreshold, 0, 15, direction, amplitude * 4)
            );
        }
        if (Math.random() < mutationRate) {
            child.risk.leverage = Math.round(
                this.adaptiveMutation.applyDirectionalBias(child.risk.leverage, 5, 75, direction, amplitude * 20)
            );
        }

        // Betting parameters
        if (Math.random() < mutationRate) {
            child.betting.basePercent = this.adaptiveMutation.applyDirectionalBias(
                child.betting.basePercent, 1, 10, direction, amplitude * 2
            );
        }
        if (Math.random() < mutationRate) {
            child.betting.winMultiplier = this.adaptiveMutation.applyDirectionalBias(
                child.betting.winMultiplier, 1.0, 2.0, direction, amplitude * 0.3
            );
        }
        if (Math.random() < mutationRate) {
            child.betting.lossMultiplier = this.adaptiveMutation.applyDirectionalBias(
                child.betting.lossMultiplier, 0.5, 1.0, direction, amplitude * 0.2
            );
        }

        return child;
    }

    // ======================== FITNESS ========================

    calculateFitness(botState: BotStateV2): number {
        if (botState.totalTrades < 3) return 0;

        const winRate = botState.totalTrades > 0 ? botState.wins / botState.totalTrades : 0;
        const returns = (botState.bankroll - INITIAL_BANKROLL) / INITIAL_BANKROLL;
        const drawdownPenalty = 1 - (botState.maxDrawdown / 100);
        const consistency = botState.totalTrades > 10 ? Math.min(1, botState.totalTrades / 50) : 0.5;

        const sharpe = this.calcRatio(botState.pnlHistory, false);
        const sortino = this.calcRatio(botState.pnlHistory, true);
        const profitFactor = this.calcProfitFactor(botState);

        // Seed 7: Diversity bonus - reward genomes that are different from population
        const populationMasks = this.getAliveBots()
            .filter(b => b.genome.id !== botState.genome.id)
            .map(b => b.genome.strategyMask);
        const diversityBonus = this.metaEvolutionDNA.calculateDiversityBonus(
            botState.genome.strategyMask, populationMasks
        );

        return (
            sharpe * 20 + sortino * 10 + winRate * 15 +
            Math.min(returns * 15, 20) + Math.min(profitFactor * 5, 15) +
            drawdownPenalty * 15 + consistency * 5 + diversityBonus
        );
    }

    private calcRatio(pnlHistory: number[], sortino: boolean): number {
        if (pnlHistory.length < 5) return 0;
        const mean = pnlHistory.reduce((a, b) => a + b, 0) / pnlHistory.length;
        if (sortino) {
            const downs = pnlHistory.filter(p => p < 0);
            if (downs.length === 0) return mean > 0 ? 3 : 0;
            const dVar = downs.reduce((sum, pnl) => sum + pnl * pnl, 0) / downs.length;
            const dDev = Math.sqrt(dVar);
            return dDev === 0 ? (mean > 0 ? 3 : 0) : Math.max(-2, Math.min(5, mean / dDev));
        }
        const variance = pnlHistory.reduce((sum, pnl) => sum + Math.pow(pnl - mean, 2), 0) / pnlHistory.length;
        const stdDev = Math.sqrt(variance);
        return stdDev === 0 ? (mean > 0 ? 3 : 0) : Math.max(-2, Math.min(5, mean / stdDev));
    }

    private calcProfitFactor(botState: BotStateV2): number {
        const wins = botState.pnlHistory.filter(p => p > 0);
        const losses = botState.pnlHistory.filter(p => p < 0);
        const totalWins = wins.reduce((a, b) => a + b, 0);
        const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));
        if (totalLosses === 0) return totalWins > 0 ? 5 : 0;
        return Math.min(10, totalWins / totalLosses);
    }

    // ======================== GENESIS ========================

    private createGenesisGenome(index: number): GenomeV2 {
        const cfg = this.config;
        const strategyMask = new Array(STRATEGY_COUNT).fill(false);
        const strategyWeights = new Array(STRATEGY_COUNT).fill(1.0);

        // Apply group personality
        if (cfg.strategyRange) {
            // Specialist: strongly favor range, but allow some others
            for (let i = cfg.strategyRange[0]; i <= cfg.strategyRange[1]; i++) {
                strategyMask[i] = true;
                strategyWeights[i] = 1.2 + Math.random() * 0.6;
            }
            // Add a few random ones outside range
            for (let i = 0; i < STRATEGY_COUNT; i++) {
                if (i < cfg.strategyRange[0] || i > cfg.strategyRange[1]) {
                    if (Math.random() < 0.2) { strategyMask[i] = true; strategyWeights[i] = 0.5 + Math.random() * 0.5; }
                }
            }
        } else {
            // Generalist: random selection with minimum
            for (let i = 0; i < STRATEGY_COUNT; i++) {
                strategyMask[i] = Math.random() < 0.4;
                strategyWeights[i] = 0.5 + Math.random() * 1.5;
            }
        }

        // Ensure minimum active strategies
        const activeCount = strategyMask.filter(m => m).length;
        if (activeCount < cfg.consensusMin + 1) {
            for (let i = 0; i < STRATEGY_COUNT && strategyMask.filter(m => m).length < cfg.consensusMin + 2; i++) {
                if (!strategyMask[i]) strategyMask[i] = true;
            }
        }

        const leverage = cfg.leverageMin + Math.round(Math.random() * (cfg.leverageMax - cfg.leverageMin));
        // Each bot gets slight variation for diversity
        const variation = (Math.random() - 0.5) * 0.4;

        const genome: GenomeV2 = {
            id: `eco-${this.groupId}-genesis-${index}-${Date.now()}`,
            name: BOT_NAME_POOL[(index + Object.keys(GROUP_CONFIGS).indexOf(this.groupId) * BOTS_PER_GROUP) % BOT_NAME_POOL.length],
            generation: 1,
            parentIds: [],
            strategyMask,
            strategyWeights,
            consensus: {
                minAgreeingSignals: cfg.consensusMin + Math.round((Math.random() - 0.5) * 2),
                maxOpposingSignals: Math.max(1, Math.round(3 + (Math.random() - 0.5) * 2)),
                minWeightedStrength: 30 + Math.round(Math.random() * 20),
                preferredDirection: cfg.preferredDirection
            },
            risk: {
                atrMultiplierTP: Math.max(1.0, cfg.atrTP + variation),
                atrMultiplierSL: Math.max(0.5, cfg.atrSL + variation * 0.5),
                trailingStopATR: 0.5 + Math.random() * 1.5,
                flipExitThreshold: Math.round(5 + Math.random() * 5),
                leverage,
                maxOpenPositions: 3,
                maxExposurePercent: 60 + Math.round(Math.random() * 20)
            },
            betting: {
                basePercent: 2 + Math.round(Math.random() * 3),
                winMultiplier: 1.1 + Math.random() * 0.3,
                lossMultiplier: 0.6 + Math.random() * 0.3,
                maxBetPercent: 8 + Math.round(Math.random() * 4),
                resetAfterLosses: 3 + Math.round(Math.random() * 2)
            },
            symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
        };

        return genome;
    }

    private createBotState(genome: GenomeV2): BotStateV2 {
        return {
            genome, bankroll: INITIAL_BANKROLL, initialBankroll: INITIAL_BANKROLL,
            totalTrades: 0, wins: 0, losses: 0,
            consecutiveWins: 0, consecutiveLosses: 0,
            maxBankroll: INITIAL_BANKROLL, minBankroll: INITIAL_BANKROLL,
            maxDrawdown: 0, openPositions: new Map(), totalExposure: 0,
            tradeHistory: [], pnlHistory: [], isAlive: true,
            startTime: new Date().toISOString(), lastTradeTime: null,
            deathCount: 0, sessionId: `eco_${this.groupId}_${Date.now()}`,
            currentBetPercent: genome.betting.basePercent,
            symbolCooldowns: new Map(),
            // ===== ODDS TRACKING (CEO-BINANCE directive) =====
            totalTakeProfitValue: 0,
            totalStopLossValue: 0,
            avgTakeProfitOdd: 0,
            avgStopLossOdd: 0,
            expectedValue: 0,
            // ===== STRATEGY METRICS =====
            strategyMetrics: {}
        };
    }

    // ======================== STATUS ========================

    getGroupBankroll(): number {
        let total = 0;
        for (const [, bot] of this.bots) total += bot.bankroll;
        return total;
    }

    getAliveBots(): BotStateV2[] {
        return Array.from(this.bots.values()).filter(b => b.isAlive);
    }

    getGroupFitness(): number {
        const alive = this.getAliveBots();
        if (alive.length === 0) return 0;
        return alive.reduce((sum, bot) => sum + this.calculateFitness(bot), 0) / alive.length;
    }

    /**
     * Get all bots (including dead ones)
     */
    getAllBots(): BotStateV2[] {
        return Array.from(this.bots.values());
    }

    /**
     * Get pause multiplier
     */
    getPauseMultiplier(): number {
        return this._pauseMultiplier;
    }

    /**
     * Set pause multiplier (reduces activity when group is struggling)
     */
    setPauseMultiplier(multiplier: number): void {
        this._pauseMultiplier = Math.max(0.1, Math.min(1.0, multiplier));
    }

    /**
     * Returns complete group status for API responses
     */
    getStatus(): any {
        const bots = Array.from(this.bots.values()).map(bot => {
            const winRate = bot.totalTrades > 0 ? (bot.wins / bot.totalTrades) : 0;
            const lossRate = 1 - winRate;
            
            return {
                id: bot.genome.id,
                name: bot.genome.name,
                bankroll: Math.round(bot.bankroll * 100) / 100,
                initialBankroll: bot.initialBankroll,
                fitness: Math.round(this.calculateFitness(bot) * 100) / 100,
                trades: bot.totalTrades,
                wins: bot.wins,
                losses: bot.losses,
                winRate: Math.round(winRate * 1000) / 10,
                lossRate: Math.round(lossRate * 1000) / 10,
                generation: bot.genome.generation,
                isAlive: bot.isAlive && bot.bankroll > 0,
                openPositions: bot.openPositions.size,
                maxDrawdown: Math.round(bot.maxDrawdown * 100) / 100,
                leverage: bot.genome.risk.leverage,
                activeStrategies: bot.genome.strategyMask.filter(m => m).length,
                // ===== ODDS METRICS =====
                avgTakeProfitOdd: Math.round(bot.avgTakeProfitOdd * 100) / 100,
                avgStopLossOdd: Math.round(bot.avgStopLossOdd * 100) / 100,
                expectedValue: Math.round(bot.expectedValue * 1000) / 10,
                totalTakeProfitValue: Math.round(bot.totalTakeProfitValue * 100) / 100,
                totalStopLossValue: Math.round(bot.totalStopLossValue * 100) / 100
            };
        });

        // Calculate group-level odds metrics
        const avgGroupTP = bots.reduce((sum, b) => sum + b.avgTakeProfitOdd, 0) / Math.max(1, bots.length);
        const avgGroupSL = bots.reduce((sum, b) => sum + b.avgStopLossOdd, 0) / Math.max(1, bots.length);
        const avgGroupEV = bots.reduce((sum, b) => sum + b.expectedValue, 0) / Math.max(1, bots.length);

        return {
            groupId: this.groupId,
            style: this.config.style,
            bankroll: Math.round(this.getGroupBankroll() * 100) / 100,
            initialBankroll: BOTS_PER_GROUP * INITIAL_BANKROLL,
            groupFitness: Math.round(this.getGroupFitness() * 100) / 100,
            generation: this.generation,
            cycle: this.currentCycle,
            totalBots: this.bots.size,
            aliveBots: this.getAliveBots().length,
            bots,
            seeds: this.getSeedsStatus(),
            pauseMultiplier: this._pauseMultiplier,
            // ===== GROUP ODDS METRICS =====
            avgTakeProfitOdd: Math.round(avgGroupTP * 100) / 100,
            avgStopLossOdd: Math.round(avgGroupSL * 100) / 100,
            expectedValue: Math.round(avgGroupEV * 1000) / 10
        };
    }

    /**
     * Export seed genomes for cross-pollination
     * Returns simplified genome snapshots for each DNA dimension
     */
    exportSeedGenomes(): any[] {
        // Return simplified state snapshots (full implementation would require DNA classes to support export)
        return [
            { type: 'strategyParamDNA', groupId: this.groupId },
            { type: 'regimeDNA', groupId: this.groupId, currentRegime: this.regimeDNA.getCurrentRegime() },
            { type: 'temporalDNA', groupId: this.groupId },
            { type: 'correlationDNA', groupId: this.groupId },
            { type: 'sentimentDNA', groupId: this.groupId, currentSentiment: this.sentimentDNA.getCurrentSentiment() },
            { type: 'riskAdaptDNA', groupId: this.groupId },
            { type: 'metaEvolutionDNA', groupId: this.groupId },
            { type: 'patternDNA', groupId: this.groupId },
            { type: 'symbolSelectionDNA', groupId: this.groupId }
        ];
    }

    /**
     * Import and cross-pollinate seeds from another group
     * Note: Full crossover would require DNA classes to support import/crossover operations
     */
    crossPollinateSeeds(_donorGenomes: any[]): void {
        // Simplified: Just apply small random mutations to simulate genetic influence
        // Full implementation would require DNA classes to support crossover operations
        const mutationRate = 0.05;
        
        // Apply light mutation to strategy weights
        for (const [, bot] of this.bots) {
            if (bot.isAlive) {
                for (let i = 0; i < bot.genome.strategyWeights.length; i++) {
                    if (Math.random() < mutationRate) {
                        bot.genome.strategyWeights[i] = Math.max(0.1, Math.min(2.0, bot.genome.strategyWeights[i] + (Math.random() - 0.5) * 0.2));
                    }
                }
            }
        }
    }

    /**
     * Get status of all 9 mycelium seeds
     * Returns simplified summaries since DNA classes don't have getSummary() method
     */
    getSeedsStatus(): any {
        return {
            strategyParamDNA: { type: 'StrategyParamDNA', groupId: this.groupId, initialized: true },
            marketRegime: { type: 'MarketRegimeDNA', groupId: this.groupId, currentRegime: this.regimeDNA.getCurrentRegime() },
            temporal: { type: 'TemporalDNA', groupId: this.groupId, activityWeight: this.temporalDNA.getActivityWeight() },
            correlation: { type: 'CorrelationDNA', groupId: this.groupId },
            sentiment: { type: 'SentimentDNA', groupId: this.groupId, currentSentiment: this.sentimentDNA.getCurrentSentiment() },
            riskAdapt: { type: 'RiskAdaptDNA', groupId: this.groupId },
            metaEvolution: { type: 'MetaEvolutionDNA', groupId: this.groupId },
            patterns: { type: 'PatternDNA', groupId: this.groupId },
            symbolSelection: { type: 'SymbolSelectionDNA', groupId: this.groupId }
        };
    }

    // ======================== RANGING OPTIMIZATIONS ========================

    private applyRangingOptimizations(): void {
        // Load ranging optimization config for DELTA group
        const rangingConfig = this.loadRangingConfig();
        if (!rangingConfig) return;

        // Apply leverage adjustments
        for (const [, botState] of this.bots) {
            if (botState.isAlive) {
                // Reduce leverage for ranging markets
                botState.genome.risk.leverage = Math.min(
                    botState.genome.risk.leverage,
                    rangingConfig.leverage.max
                );
                
                // Increase minSignalStrength threshold
                if (botState.genome.consensus.minWeightedStrength < rangingConfig.minSignalStrength) {
                    botState.genome.consensus.minWeightedStrength = rangingConfig.minSignalStrength;
                }

                // Apply cooldown for ranging markets
                botState.symbolCooldowns.forEach((expiry, symbol) => {
                    botState.symbolCooldowns.set(symbol, expiry + rangingConfig.cooldown);
                });

                // Activate mean-reversion strategies (20-29)
                for (let i = 20; i <= 29; i++) {
                    botState.genome.strategyMask[i] = true;
                    botState.genome.strategyWeights[i] = 1.0;
                }

                // Reduce momentum strategy weights
                for (let i = 10; i <= 19; i++) {
                    botState.genome.strategyWeights[i] *= rangingConfig.momentumPenalty;
                }
            }
        }
    }

    private rangingConfigLogged = false;
    private loadRangingConfig(): {
        leverage: { min: number; max: number };
        minSignalStrength: number;
        cooldown: number;
        strategyRange: [number, number];
        meanReversionBoost: number;
        momentumPenalty: number;
    } | null {
        try {
            // Try both src and dist paths
            const configPath = path.resolve(__dirname, 'configs', 'delta-ranging-optimization.json');
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            // Fallback to src path when running compiled
            const srcPath = path.resolve(__dirname, '..', '..', '..', 'src', 'services', 'ecosystem', 'configs', 'delta-ranging-optimization.json');
            if (fs.existsSync(srcPath)) {
                return JSON.parse(fs.readFileSync(srcPath, 'utf8'));
            }
            if (!this.rangingConfigLogged) {
                console.warn('Ranging config not found for DELTA group (logged once)');
                this.rangingConfigLogged = true;
            }
            return null;
        } catch {
            return null;
        }
    }
}