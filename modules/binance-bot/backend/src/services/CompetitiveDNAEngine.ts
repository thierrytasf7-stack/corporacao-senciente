/**
 * COMPETITIVE DNA TRADING ENGINE
 *
 * 3 bots competindo com estratégias matemáticas diferentes (dupla camada)
 * Cada bot começa com $100 de bankroll virtual
 * Objetivo: $100 → $10,000
 * Se bankroll chega a $0: registra DNA, aprende, reinicia com $100
 * Melhor bot gera filhos (variações) para próxima geração
 *
 * Paper trading com preços REAIS do futures market
 */

import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from './BinanceApiService';

// ======================== INTERFACES ========================

export interface BotDNA {
    id: string;
    name: string;
    generation: number;
    parentId: string | null;

    // Double-layer strategy config
    layer1: BettingStrategy;
    layer2: BettingStrategy;

    // Trading signal config
    tradingStyle: 'MOMENTUM' | 'MEAN_REVERSION' | 'TREND_FOLLOWING';
    signalParams: SignalParams;

    // Risk config
    maxBetPercent: number;       // Max % of bankroll per trade
    maxOpenPositions: number;    // Max concurrent positions
    takeProfitPercent: number;   // TP on price (before leverage)
    stopLossPercent: number;     // SL on price (before leverage)
    leverage: number;            // Futures leverage

    // Symbols
    symbols: string[];
}

export interface BettingStrategy {
    type: 'ANTI_MARTINGALE' | 'MARTINGALE' | 'FIBONACCI' | 'KELLY_CRITERION' | 'DALEMBERT' | 'FIXED_PERCENT';
    params: Record<string, number>;
}

export interface SignalParams {
    rsiPeriod: number;
    rsiOversold: number;
    rsiOverbought: number;
    emaPeriodFast: number;
    emaPeriodSlow: number;
    stochPeriod: number;
    stochOversold: number;
    stochOverbought: number;
    momentumPeriod: number;
    volumeMultiplier: number;
    minSignalStrength: number;
}

export interface BotState {
    botId: string;
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
    openPositions: Map<string, BotPosition>;
    totalExposure: number;       // Sum of all open position bet amounts
    tradeHistory: TradeRecord[];
    fibSequenceIndex: number;    // For Fibonacci strategy
    dalembertUnit: number;       // For D'Alembert strategy
    isAlive: boolean;
    startTime: string;
    lastTradeTime: string | null;
    deathCount: number;          // How many times hit $0
    sessionId: string;
}

export interface BotPosition {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    quantity: number;
    leverage: number;
    betAmount: number;           // Actual $ risked from bankroll
    takeProfitPrice: number;
    stopLossPrice: number;
    openTime: string;
    orderId: string;
}

export interface TradeRecord {
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
    layer1Decision: string;
    layer2Decision: string;
}

export interface DNASession {
    sessionId: string;
    botId: string;
    botName: string;
    generation: number;
    dna: BotDNA;
    startBankroll: number;
    endBankroll: number;
    peakBankroll: number;
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    maxDrawdown: number;
    finalReason: 'BANKRUPT' | 'GOAL_REACHED' | 'RUNNING' | 'STOPPED';
    startTime: string;
    endTime: string;
    trades: TradeRecord[];
    performance: {
        sharpeRatio: number;
        profitFactor: number;
        avgWin: number;
        avgLoss: number;
        bestTrade: number;
        worstTrade: number;
        avgTradesPerHour: number;
    };
}

// ======================== MAIN ENGINE ========================

export class CompetitiveDNAEngine {
    private binanceService: BinanceApiService;
    private bots: Map<string, { dna: BotDNA; state: BotState }> = new Map();
    private isRunning: boolean = false;
    private cycleInterval: NodeJS.Timeout | null = null;
    private currentCycle: number = 0;
    private generation: number = 1;

    private readonly INITIAL_BANKROLL = 100;
    private readonly GOAL_BANKROLL = 10000;
    private readonly CYCLE_INTERVAL_MS = 6000;  // 6 seconds - fast cycles
    private readonly DATA_DIR = path.join(process.cwd(), 'data', 'DNA-ARENA');
    private readonly SESSIONS_DIR = path.join(process.cwd(), 'data', 'DNA-ARENA', 'sessions');
    private readonly LEADERBOARD_FILE = path.join(process.cwd(), 'data', 'DNA-ARENA', 'leaderboard.json');

    constructor(binanceService: BinanceApiService) {
        this.binanceService = binanceService;
        this.ensureDirectories();
        this.loadLeaderboard();
    }

    private ensureDirectories(): void {
        [this.DATA_DIR, this.SESSIONS_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // ======================== BOT DNA DEFINITIONS ========================

    /**
     * Create the 3 initial competing bot DNAs
     */
    private createGenesis(): BotDNA[] {
        return [
            // BOT ALPHA - "Hydra"
            // L1: Anti-Martingale (increase bet after win)
            // L2: Martingale (increase bet after consecutive losses)
            // Trading: Momentum (EMA crossover + RSI confirmation)
            {
                id: 'alpha-gen1',
                name: 'Hydra',
                generation: this.generation,
                parentId: null,
                layer1: {
                    type: 'ANTI_MARTINGALE',
                    params: {
                        basePercent: 3,          // Base 3% of bankroll
                        winMultiplier: 1.5,      // 1.5x after win
                        maxPercent: 15,          // Cap at 15%
                        resetAfterLoss: 1        // Reset to base after 1 loss
                    }
                },
                layer2: {
                    type: 'MARTINGALE',
                    params: {
                        lossMultiplier: 1.8,     // 1.8x after loss
                        maxDoubles: 3,           // Max 3 consecutive doublings
                        resetAfterWin: 1         // Reset after 1 win
                    }
                },
                tradingStyle: 'MOMENTUM',
                signalParams: {
                    rsiPeriod: 14,
                    rsiOversold: 35,
                    rsiOverbought: 65,
                    emaPeriodFast: 9,
                    emaPeriodSlow: 21,
                    stochPeriod: 14,
                    stochOversold: 25,
                    stochOverbought: 75,
                    momentumPeriod: 5,
                    volumeMultiplier: 1.3,
                    minSignalStrength: 55
                },
                maxBetPercent: 15,
                maxOpenPositions: 3,
                takeProfitPercent: 0.15,   // Tight for testnet: 0.15% on price = 7.5% with 50x leverage
                stopLossPercent: 0.10,     // 0.10% = 5% loss with 50x
                leverage: 50,
                symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
            },

            // BOT BETA - "Phoenix"
            // L1: Fibonacci (bet sizes follow Fibonacci sequence)
            // L2: Anti-Martingale (scale up after winning streaks)
            // Trading: Mean Reversion (RSI extremes + Stochastic)
            {
                id: 'beta-gen1',
                name: 'Phoenix',
                generation: this.generation,
                parentId: null,
                layer1: {
                    type: 'FIBONACCI',
                    params: {
                        baseAmount: 2,           // $2 base (2% of $100)
                        maxSequenceIndex: 8,     // Max Fibonacci index (21 in sequence)
                        resetOnWin: 1            // Reset to start of sequence on win
                    }
                },
                layer2: {
                    type: 'ANTI_MARTINGALE',
                    params: {
                        basePercent: 2,
                        winMultiplier: 1.3,
                        maxPercent: 12,
                        resetAfterLoss: 1
                    }
                },
                tradingStyle: 'MEAN_REVERSION',
                signalParams: {
                    rsiPeriod: 14,
                    rsiOversold: 25,
                    rsiOverbought: 75,
                    emaPeriodFast: 7,
                    emaPeriodSlow: 25,
                    stochPeriod: 14,
                    stochOversold: 15,
                    stochOverbought: 85,
                    momentumPeriod: 3,
                    volumeMultiplier: 1.5,
                    minSignalStrength: 60
                },
                maxBetPercent: 12,
                maxOpenPositions: 4,
                takeProfitPercent: 0.20,   // 0.20% on price = 8% with 40x leverage
                stopLossPercent: 0.12,     // 0.12% = 4.8% loss with 40x
                leverage: 40,
                symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
            },

            // BOT GAMMA - "Cerberus"
            // L1: Kelly Criterion (optimal bankroll fraction)
            // L2: D'Alembert (linear increase after loss, decrease after win)
            // Trading: Trend Following (EMA alignment + Volume + Momentum)
            {
                id: 'gamma-gen1',
                name: 'Cerberus',
                generation: this.generation,
                parentId: null,
                layer1: {
                    type: 'KELLY_CRITERION',
                    params: {
                        winRate: 0.55,           // Estimated 55% win rate
                        avgWinLossRatio: 1.8,    // Average win is 1.8x average loss
                        fractionMultiplier: 0.5, // Half-Kelly for safety
                        minPercent: 1,
                        maxPercent: 10
                    }
                },
                layer2: {
                    type: 'DALEMBERT',
                    params: {
                        baseUnit: 1.5,           // $1.50 base unit
                        incrementUnit: 0.5,      // +$0.50 after loss
                        decrementUnit: 0.5,      // -$0.50 after win
                        minUnit: 1,              // Minimum $1
                        maxUnit: 8               // Maximum $8 unit
                    }
                },
                tradingStyle: 'TREND_FOLLOWING',
                signalParams: {
                    rsiPeriod: 21,
                    rsiOversold: 40,
                    rsiOverbought: 60,
                    emaPeriodFast: 12,
                    emaPeriodSlow: 26,
                    stochPeriod: 21,
                    stochOversold: 30,
                    stochOverbought: 70,
                    momentumPeriod: 8,
                    volumeMultiplier: 1.2,
                    minSignalStrength: 50
                },
                maxBetPercent: 10,
                maxOpenPositions: 5,
                takeProfitPercent: 0.25,   // 0.25% on price = 7.5% with 30x leverage
                stopLossPercent: 0.15,     // 0.15% = 4.5% loss with 30x
                leverage: 30,
                symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
            }
        ];
    }

    // ======================== BANKROLL & BET SIZING ========================

    /**
     * Calculate bet amount using double-layer strategy
     */
    private calculateBetAmount(dna: BotDNA, state: BotState): number {
        // Layer 1 calculation
        let layer1Amount = this.calculateLayer(dna.layer1, state);

        // Layer 2 adjustment
        let layer2Modifier = this.calculateLayer2Modifier(dna.layer2, state);

        // Combine layers: L1 base * L2 modifier
        let betAmount = layer1Amount * layer2Modifier;

        // Cap at maxBetPercent of current bankroll
        const maxBet = state.bankroll * (dna.maxBetPercent / 100);
        betAmount = Math.min(betAmount, maxBet);

        // Can't bet more than bankroll minus open exposure
        const availableBankroll = state.bankroll - state.totalExposure;
        betAmount = Math.min(betAmount, availableBankroll * 0.95); // 5% safety margin

        // Minimum bet $1
        betAmount = Math.max(betAmount, 1);

        // Can't bet if insufficient bankroll
        if (betAmount > availableBankroll || availableBankroll < 1) {
            return 0;
        }

        return parseFloat(betAmount.toFixed(2));
    }

    private calculateLayer(layer: BettingStrategy, state: BotState): number {
        switch (layer.type) {
            case 'ANTI_MARTINGALE': {
                const base = state.bankroll * (layer.params.basePercent / 100);
                if (state.consecutiveWins > 0) {
                    const multiplier = Math.pow(layer.params.winMultiplier, Math.min(state.consecutiveWins, 5));
                    return Math.min(base * multiplier, state.bankroll * (layer.params.maxPercent / 100));
                }
                return base;
            }

            case 'MARTINGALE': {
                const base = state.bankroll * 0.03; // 3% base
                if (state.consecutiveLosses > 0) {
                    const doublings = Math.min(state.consecutiveLosses, layer.params.maxDoubles);
                    return base * Math.pow(layer.params.lossMultiplier, doublings);
                }
                return base;
            }

            case 'FIBONACCI': {
                const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
                const idx = Math.min(state.fibSequenceIndex, layer.params.maxSequenceIndex, fib.length - 1);
                return layer.params.baseAmount * fib[idx];
            }

            case 'KELLY_CRITERION': {
                // Kelly: f* = (bp - q) / b
                // b = avg win/loss ratio, p = win probability, q = 1-p
                const p = state.totalTrades > 10
                    ? state.wins / state.totalTrades
                    : layer.params.winRate;
                const q = 1 - p;
                const b = layer.params.avgWinLossRatio;
                let kellyPercent = ((b * p - q) / b) * layer.params.fractionMultiplier * 100;
                kellyPercent = Math.max(kellyPercent, layer.params.minPercent);
                kellyPercent = Math.min(kellyPercent, layer.params.maxPercent);
                return state.bankroll * (kellyPercent / 100);
            }

            case 'DALEMBERT': {
                return state.dalembertUnit;
            }

            case 'FIXED_PERCENT': {
                return state.bankroll * (layer.params.percent / 100);
            }

            default:
                return state.bankroll * 0.03;
        }
    }

    private calculateLayer2Modifier(layer: BettingStrategy, state: BotState): number {
        switch (layer.type) {
            case 'ANTI_MARTINGALE':
                if (state.consecutiveWins >= 2) {
                    return Math.min(1 + (state.consecutiveWins * 0.15), 2.0);
                }
                return 1.0;

            case 'MARTINGALE':
                if (state.consecutiveLosses >= 1) {
                    return Math.min(1 + (state.consecutiveLosses * 0.3), 2.5);
                }
                return 1.0;

            case 'DALEMBERT':
                return state.dalembertUnit / (layer.params.baseUnit || 1.5);

            default:
                return 1.0;
        }
    }

    /**
     * Update bet sizing state after a trade result
     */
    private updateBettingState(dna: BotDNA, state: BotState, won: boolean): void {
        if (won) {
            state.consecutiveWins++;
            state.consecutiveLosses = 0;

            // Fibonacci: reset to start on win
            if (dna.layer1.type === 'FIBONACCI') {
                state.fibSequenceIndex = 0;
            }

            // D'Alembert: decrease unit on win
            if (dna.layer2.type === 'DALEMBERT') {
                state.dalembertUnit = Math.max(
                    state.dalembertUnit - dna.layer2.params.decrementUnit,
                    dna.layer2.params.minUnit
                );
            }
        } else {
            state.consecutiveLosses++;
            state.consecutiveWins = 0;

            // Fibonacci: advance sequence on loss
            if (dna.layer1.type === 'FIBONACCI') {
                state.fibSequenceIndex = Math.min(
                    state.fibSequenceIndex + 1,
                    dna.layer1.params.maxSequenceIndex
                );
            }

            // D'Alembert: increase unit on loss
            if (dna.layer2.type === 'DALEMBERT') {
                state.dalembertUnit = Math.min(
                    state.dalembertUnit + dna.layer2.params.incrementUnit,
                    dna.layer2.params.maxUnit
                );
            }
        }
    }

    // ======================== TRADING SIGNALS ========================

    private async analyzeSignal(symbol: string, dna: BotDNA): Promise<{ strength: number; direction: 'LONG' | 'SHORT'; diagnostics: string }> {
        try {
            let klines: any[];
            try {
                klines = await this.binanceService.getFuturesKlines(symbol, '1m', 60);
            } catch {
                return { strength: 0, direction: 'LONG', diagnostics: 'No klines data' };
            }

            if (!klines || klines.length < 30) {
                return { strength: 0, direction: 'LONG', diagnostics: 'Insufficient data' };
            }

            const closes = klines.map((k: any) => parseFloat(k.close));
            const highs = klines.map((k: any) => parseFloat(k.high));
            const lows = klines.map((k: any) => parseFloat(k.low));
            const volumes = klines.map((k: any) => parseFloat(k.volume));

            const sp = dna.signalParams;

            // Common indicators
            const rsi = this.calculateRSI(closes, sp.rsiPeriod);
            const emaFast = this.calculateEMA(closes, sp.emaPeriodFast);
            const emaSlow = this.calculateEMA(closes, sp.emaPeriodSlow);
            const stochK = this.calculateStochK(closes, highs, lows, sp.stochPeriod);
            const momentum = ((closes[closes.length - 1] - closes[closes.length - 1 - sp.momentumPeriod]) / closes[closes.length - 1 - sp.momentumPeriod]) * 100;
            const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
            const volumeRatio = volumes[volumes.length - 1] / avgVolume;

            let longScore = 0;
            let shortScore = 0;

            switch (dna.tradingStyle) {
                case 'MOMENTUM':
                    // EMA crossover is primary
                    if (emaFast > emaSlow) longScore += 25; else shortScore += 25;
                    // RSI confirmation
                    if (rsi < sp.rsiOversold) longScore += 20;
                    if (rsi > sp.rsiOverbought) shortScore += 20;
                    // Momentum
                    if (momentum > 0.05) longScore += 20; else if (momentum < -0.05) shortScore += 20;
                    // Volume spike
                    if (volumeRatio > sp.volumeMultiplier) { longScore += 15; shortScore += 15; }
                    // Trend alignment
                    if (closes[closes.length - 1] > emaFast && emaFast > emaSlow) longScore += 15;
                    if (closes[closes.length - 1] < emaFast && emaFast < emaSlow) shortScore += 15;
                    // Stoch confirmation
                    if (stochK < sp.stochOversold) longScore += 10;
                    if (stochK > sp.stochOverbought) shortScore += 10;
                    break;

                case 'MEAN_REVERSION':
                    // RSI extremes are primary
                    if (rsi < sp.rsiOversold) longScore += 30;
                    else if (rsi < 40) longScore += 10;
                    if (rsi > sp.rsiOverbought) shortScore += 30;
                    else if (rsi > 60) shortScore += 10;
                    // Stochastic extremes
                    if (stochK < sp.stochOversold) longScore += 25;
                    if (stochK > sp.stochOverbought) shortScore += 25;
                    // Price vs EMA (overextended = reversal)
                    const priceEmaRatio = (closes[closes.length - 1] - emaSlow) / emaSlow * 100;
                    if (priceEmaRatio < -0.5) longScore += 15; // Price way below EMA = buy
                    if (priceEmaRatio > 0.5) shortScore += 15; // Price way above EMA = sell
                    // Volume on extreme = confirmation
                    if (volumeRatio > sp.volumeMultiplier) { longScore += 10; shortScore += 10; }
                    // Counter-momentum
                    if (momentum < -0.1 && rsi < 40) longScore += 15;
                    if (momentum > 0.1 && rsi > 60) shortScore += 15;
                    break;

                case 'TREND_FOLLOWING':
                    // EMA alignment + triple confirmation
                    const ema8 = this.calculateEMA(closes, 8);
                    if (ema8 > emaFast && emaFast > emaSlow) longScore += 30;
                    if (ema8 < emaFast && emaFast < emaSlow) shortScore += 30;
                    // Momentum strong
                    if (momentum > 0.1) longScore += 20; else if (momentum < -0.1) shortScore += 20;
                    // Volume confirms trend
                    if (volumeRatio > sp.volumeMultiplier) { longScore += 15; shortScore += 15; }
                    // RSI trend zone (not extreme)
                    if (rsi > 50 && rsi < 70) longScore += 10;
                    if (rsi < 50 && rsi > 30) shortScore += 10;
                    // Stochastic direction
                    if (stochK > 50) longScore += 10;
                    if (stochK < 50) shortScore += 10;
                    // Price above all EMAs = strong trend
                    if (closes[closes.length - 1] > ema8) longScore += 10;
                    if (closes[closes.length - 1] < ema8) shortScore += 10;
                    break;
            }

            const direction = longScore >= shortScore ? 'LONG' : 'SHORT';
            const strength = Math.max(longScore, shortScore);
            const diagnostics = `${dna.tradingStyle} RSI:${rsi.toFixed(1)} EMA${sp.emaPeriodFast}>${sp.emaPeriodSlow}:${emaFast > emaSlow} Stoch:${stochK.toFixed(1)} Mom:${momentum.toFixed(3)}% Vol:${volumeRatio.toFixed(1)}x`;

            return { strength, direction, diagnostics };
        } catch (error: any) {
            return { strength: 0, direction: 'LONG', diagnostics: `Error: ${error.message}` };
        }
    }

    // ======================== ENGINE LIFECYCLE ========================

    async start(): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) {
            return { success: false, message: 'DNA Arena já está rodando' };
        }

        // Create or load bots
        if (this.bots.size === 0) {
            const genesisBot = this.createGenesis();
            for (const dna of genesisBot) {
                const state = this.createInitialState(dna);
                this.bots.set(dna.id, { dna, state });
            }
        }

        console.log('\n🧬 ═══════════════════════════════════════════════════════════');
        console.log('   DNA ARENA - COMPETITIVE TRADING ENGINE');
        console.log(`   Generation: ${this.generation} | Bots: ${this.bots.size}`);
        console.log(`   Bankroll: $${this.INITIAL_BANKROLL} → Goal: $${this.GOAL_BANKROLL}`);
        console.log('   ───────────────────────────────────────────────────────');

        for (const [id, { dna, state }] of this.bots) {
            console.log(`   🤖 ${dna.name} (${id})`);
            console.log(`      L1: ${dna.layer1.type} | L2: ${dna.layer2.type}`);
            console.log(`      Style: ${dna.tradingStyle} | Leverage: ${dna.leverage}x`);
            console.log(`      Bankroll: $${state.bankroll.toFixed(2)} | TP: ${dna.takeProfitPercent}% | SL: ${dna.stopLossPercent}%`);
        }

        console.log('═══════════════════════════════════════════════════════════\n');

        this.isRunning = true;
        this.currentCycle = 0;

        // Start cycle
        this.cycleInterval = setInterval(() => {
            this.executeCycle().catch(err => {
                console.error('❌ [DNA] Cycle error:', err.message);
            });
        }, this.CYCLE_INTERVAL_MS);

        // First cycle immediate
        this.executeCycle().catch(err => {
            console.error('❌ [DNA] First cycle error:', err.message);
        });

        return { success: true, message: `DNA Arena iniciada com ${this.bots.size} bots, Gen ${this.generation}` };
    }

    stop(): { success: boolean; message: string; summary: any } {
        if (!this.isRunning) {
            return { success: false, message: 'DNA Arena não está rodando', summary: null };
        }

        if (this.cycleInterval) {
            clearInterval(this.cycleInterval);
            this.cycleInterval = null;
        }

        this.isRunning = false;

        const summary = this.getLeaderboard();

        // Save all sessions
        for (const [id, { dna, state }] of this.bots) {
            this.saveDNASession(dna, state, 'STOPPED');
        }

        console.log('\n🛑 [DNA] Arena parada. Salvo estado de todos os bots.');

        return { success: true, message: `DNA Arena parada após ${this.currentCycle} ciclos`, summary };
    }

    private createInitialState(dna: BotDNA): BotState {
        return {
            botId: dna.id,
            bankroll: this.INITIAL_BANKROLL,
            initialBankroll: this.INITIAL_BANKROLL,
            totalTrades: 0,
            wins: 0,
            losses: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            maxBankroll: this.INITIAL_BANKROLL,
            minBankroll: this.INITIAL_BANKROLL,
            maxDrawdown: 0,
            openPositions: new Map(),
            totalExposure: 0,
            tradeHistory: [],
            fibSequenceIndex: 0,
            dalembertUnit: dna.layer2.type === 'DALEMBERT' ? dna.layer2.params.baseUnit : 1.5,
            isAlive: true,
            startTime: new Date().toISOString(),
            lastTradeTime: null,
            deathCount: 0,
            sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        };
    }

    // ======================== MAIN CYCLE ========================

    private async executeCycle(): Promise<void> {
        if (!this.isRunning) return;

        this.currentCycle++;

        for (const [botId, { dna, state }] of this.bots) {
            if (!state.isAlive) continue;

            try {
                // 1. Monitor open positions for TP/SL
                await this.monitorPositions(dna, state);

                // 2. Check bankroll status
                if (state.bankroll <= 0) {
                    await this.handleBankrupt(dna, state);
                    continue;
                }

                if (state.bankroll >= this.GOAL_BANKROLL) {
                    await this.handleGoalReached(dna, state);
                    continue;
                }

                // 3. Scan for new trades if room
                if (state.openPositions.size < dna.maxOpenPositions) {
                    await this.scanAndTrade(dna, state);
                }
            } catch (error: any) {
                // Don't crash the whole engine on one bot error
            }
        }

        // Periodic status report
        if (this.currentCycle % 30 === 0) {
            this.printStatusReport();
        }

        // Save state periodically
        if (this.currentCycle % 100 === 0) {
            this.saveEngineState();
        }
    }

    // ======================== POSITION MANAGEMENT ========================

    private async monitorPositions(dna: BotDNA, state: BotState): Promise<void> {
        if (state.openPositions.size === 0) return;

        for (const [key, pos] of state.openPositions.entries()) {
            try {
                let currentPrice: number;
                try {
                    currentPrice = await this.binanceService.getFuturesPrice(pos.symbol);
                } catch {
                    continue; // Skip if can't get price
                }

                if (!currentPrice) continue;

                let shouldClose = false;
                let reason: 'TAKE_PROFIT' | 'STOP_LOSS' = 'TAKE_PROFIT';
                let pnlPercent = 0;

                if (pos.side === 'LONG') {
                    pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * pos.leverage;
                    if (currentPrice >= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice <= pos.stopLossPrice) { shouldClose = true; reason = 'STOP_LOSS'; }
                } else {
                    pnlPercent = ((pos.entryPrice - currentPrice) / pos.entryPrice) * 100 * pos.leverage;
                    if (currentPrice <= pos.takeProfitPrice) { shouldClose = true; reason = 'TAKE_PROFIT'; }
                    else if (currentPrice >= pos.stopLossPrice) { shouldClose = true; reason = 'STOP_LOSS'; }
                }

                if (shouldClose) {
                    const pnlValue = (pnlPercent / 100) * pos.betAmount;
                    const bankrollBefore = state.bankroll;

                    state.bankroll += pnlValue;
                    state.totalExposure -= pos.betAmount;
                    state.totalTrades++;
                    state.lastTradeTime = new Date().toISOString();

                    const won = pnlValue >= 0;
                    if (won) state.wins++; else state.losses++;

                    // Update max/min bankroll
                    state.maxBankroll = Math.max(state.maxBankroll, state.bankroll);
                    state.minBankroll = Math.min(state.minBankroll, state.bankroll);

                    // Update max drawdown
                    const drawdown = ((state.maxBankroll - state.bankroll) / state.maxBankroll) * 100;
                    state.maxDrawdown = Math.max(state.maxDrawdown, drawdown);

                    // Update betting state (consecutive wins/losses, fibonacci, d'alembert)
                    this.updateBettingState(dna, state, won);

                    // Record trade
                    const trade: TradeRecord = {
                        symbol: pos.symbol,
                        side: pos.side,
                        entryPrice: pos.entryPrice,
                        exitPrice: currentPrice,
                        betAmount: pos.betAmount,
                        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                        pnlValue: parseFloat(pnlValue.toFixed(4)),
                        reason,
                        bankrollBefore: parseFloat(bankrollBefore.toFixed(2)),
                        bankrollAfter: parseFloat(state.bankroll.toFixed(2)),
                        timestamp: new Date().toISOString(),
                        layer1Decision: `${dna.layer1.type}: bet $${pos.betAmount.toFixed(2)}`,
                        layer2Decision: `${dna.layer2.type}: modifier applied`
                    };
                    state.tradeHistory.push(trade);

                    const emoji = reason === 'TAKE_PROFIT' ? '🎯' : '🛑';
                    console.log(`${emoji} [${dna.name}] ${pos.side} ${pos.symbol} | ${reason} | PnL: ${pnlPercent.toFixed(1)}% ($${pnlValue.toFixed(2)}) | Bankroll: $${state.bankroll.toFixed(2)}`);

                    state.openPositions.delete(key);
                }
            } catch (error: any) {
                // Skip single position errors
            }
        }
    }

    private async scanAndTrade(dna: BotDNA, state: BotState): Promise<void> {
        const symbols = [...dna.symbols].sort(() => Math.random() - 0.5);

        for (const symbol of symbols) {
            if (state.openPositions.size >= dna.maxOpenPositions) break;

            // Check for existing position on this symbol
            const hasLong = state.openPositions.has(`${symbol}_LONG`);
            const hasShort = state.openPositions.has(`${symbol}_SHORT`);
            if (hasLong && hasShort) continue;

            try {
                const signal = await this.analyzeSignal(symbol, dna);

                if (signal.strength >= dna.signalParams.minSignalStrength) {
                    if (signal.direction === 'LONG' && !hasLong) {
                        await this.openPosition(dna, state, symbol, 'LONG', signal);
                    } else if (signal.direction === 'SHORT' && !hasShort) {
                        await this.openPosition(dna, state, symbol, 'SHORT', signal);
                    }
                }
            } catch (error: any) {
                // Skip symbol
            }
        }
    }

    private async openPosition(
        dna: BotDNA,
        state: BotState,
        symbol: string,
        side: 'LONG' | 'SHORT',
        signal: { strength: number; diagnostics: string }
    ): Promise<void> {
        // Calculate bet amount using double-layer strategy
        const betAmount = this.calculateBetAmount(dna, state);
        if (betAmount <= 0) return;

        // Get real price
        let currentPrice: number;
        try {
            currentPrice = await this.binanceService.getFuturesPrice(symbol);
        } catch {
            return;
        }
        if (!currentPrice) return;

        // Calculate quantity
        const notional = betAmount * dna.leverage;
        const rawQuantity = notional / currentPrice;

        let quantity: number;
        if (currentPrice > 1000) quantity = parseFloat(rawQuantity.toFixed(3));
        else if (currentPrice > 10) quantity = parseFloat(rawQuantity.toFixed(1));
        else quantity = parseFloat(rawQuantity.toFixed(0));
        if (quantity <= 0) return;

        // Calculate TP/SL
        let takeProfitPrice: number;
        let stopLossPrice: number;

        if (side === 'LONG') {
            takeProfitPrice = currentPrice * (1 + dna.takeProfitPercent / 100);
            stopLossPrice = currentPrice * (1 - dna.stopLossPercent / 100);
        } else {
            takeProfitPrice = currentPrice * (1 - dna.takeProfitPercent / 100);
            stopLossPrice = currentPrice * (1 + dna.stopLossPercent / 100);
        }

        const position: BotPosition = {
            symbol,
            side,
            entryPrice: currentPrice,
            quantity,
            leverage: dna.leverage,
            betAmount,
            takeProfitPrice,
            stopLossPrice,
            openTime: new Date().toISOString(),
            orderId: `dna_${dna.id}_${Date.now()}`
        };

        state.openPositions.set(`${symbol}_${side}`, position);
        state.totalExposure += betAmount;

        const emoji = side === 'LONG' ? '🟢' : '🔴';
        console.log(`${emoji} [${dna.name}] ${side} ${symbol} ${dna.leverage}x | Bet: $${betAmount.toFixed(2)} (${(betAmount/state.bankroll*100).toFixed(1)}%) | Entry: $${currentPrice.toFixed(2)} | Bankroll: $${state.bankroll.toFixed(2)}`);
    }

    // ======================== LIFECYCLE EVENTS ========================

    private async handleBankrupt(dna: BotDNA, state: BotState): Promise<void> {
        console.log(`\n💀 ═══════════════════════════════════════════════════`);
        console.log(`   ${dna.name} BANKRUPT! Bankroll: $${state.bankroll.toFixed(2)}`);
        console.log(`   Trades: ${state.totalTrades} | Wins: ${state.wins} | Losses: ${state.losses}`);
        console.log(`   Max Bankroll: $${state.maxBankroll.toFixed(2)} | Max Drawdown: ${state.maxDrawdown.toFixed(1)}%`);
        console.log(`═══════════════════════════════════════════════════\n`);

        // Save DNA session
        this.saveDNASession(dna, state, 'BANKRUPT');

        // Restart with fresh $100
        state.deathCount++;
        state.bankroll = this.INITIAL_BANKROLL;
        state.totalExposure = 0;
        state.openPositions.clear();
        state.consecutiveWins = 0;
        state.consecutiveLosses = 0;
        state.maxBankroll = this.INITIAL_BANKROLL;
        state.minBankroll = this.INITIAL_BANKROLL;
        state.maxDrawdown = 0;
        state.fibSequenceIndex = 0;
        state.dalembertUnit = dna.layer2.type === 'DALEMBERT' ? dna.layer2.params.baseUnit : 1.5;
        state.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        state.startTime = new Date().toISOString();
        // Keep trade history for learning

        console.log(`🔄 [${dna.name}] Reiniciado com $${this.INITIAL_BANKROLL}. Morte #${state.deathCount}`);
    }

    private async handleGoalReached(dna: BotDNA, state: BotState): Promise<void> {
        console.log(`\n🏆 ═══════════════════════════════════════════════════`);
        console.log(`   ${dna.name} GOAL REACHED! $${this.INITIAL_BANKROLL} → $${state.bankroll.toFixed(2)}`);
        console.log(`   Trades: ${state.totalTrades} | Win Rate: ${state.totalTrades > 0 ? ((state.wins / state.totalTrades) * 100).toFixed(1) : 0}%`);
        console.log(`   Generation: ${dna.generation} | Deaths: ${state.deathCount}`);
        console.log(`═══════════════════════════════════════════════════\n`);

        // Save session
        this.saveDNASession(dna, state, 'GOAL_REACHED');

        // Evolve: spawn children with mutations
        this.evolveBot(dna, state);

        // Restart bot with fresh bankroll
        state.bankroll = this.INITIAL_BANKROLL;
        state.totalExposure = 0;
        state.openPositions.clear();
        state.consecutiveWins = 0;
        state.consecutiveLosses = 0;
        state.maxBankroll = this.INITIAL_BANKROLL;
        state.minBankroll = this.INITIAL_BANKROLL;
        state.maxDrawdown = 0;
        state.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        state.startTime = new Date().toISOString();
    }

    // ======================== EVOLUTION ========================

    private evolveBot(parentDna: BotDNA, parentState: BotState): void {
        console.log(`\n🧬 [EVOLUTION] ${parentDna.name} spawning evolved children...`);

        // Find worst performing bot to replace
        let worstBot: { id: string; bankroll: number } | null = null;
        for (const [id, { state }] of this.bots) {
            if (id === parentDna.id) continue;
            if (!worstBot || state.bankroll < worstBot.bankroll) {
                worstBot = { id, bankroll: state.bankroll };
            }
        }

        if (worstBot) {
            // Create mutated child
            const childDna = this.mutateDNA(parentDna);
            const childState = this.createInitialState(childDna);

            console.log(`   🔀 Replacing ${worstBot.id} (bankroll: $${worstBot.bankroll.toFixed(2)}) with child: ${childDna.name}`);
            console.log(`   🧬 Child mutations: TP ${childDna.takeProfitPercent}%, SL ${childDna.stopLossPercent}%, Leverage ${childDna.leverage}x`);

            this.bots.delete(worstBot.id);
            this.bots.set(childDna.id, { dna: childDna, state: childState });
        }
    }

    private mutateDNA(parent: BotDNA): BotDNA {
        this.generation++;

        const mutate = (value: number, range: number): number => {
            const mutation = (Math.random() - 0.5) * 2 * range;
            return parseFloat((value + mutation).toFixed(2));
        };

        const child: BotDNA = JSON.parse(JSON.stringify(parent));
        child.id = `${parent.id.split('-gen')[0]}-gen${this.generation}`;
        child.name = `${parent.name}-G${this.generation}`;
        child.generation = this.generation;
        child.parentId = parent.id;

        // Mutate trading parameters (tight for testnet low-vol)
        child.takeProfitPercent = Math.max(0.05, mutate(parent.takeProfitPercent, 0.05));
        child.stopLossPercent = Math.max(0.03, mutate(parent.stopLossPercent, 0.03));
        child.leverage = Math.max(10, Math.min(125, Math.round(mutate(parent.leverage, 10))));

        // Mutate signal parameters
        child.signalParams.minSignalStrength = Math.max(30, Math.min(80, Math.round(mutate(parent.signalParams.minSignalStrength, 5))));
        child.signalParams.rsiOversold = Math.max(15, Math.min(45, Math.round(mutate(parent.signalParams.rsiOversold, 5))));
        child.signalParams.rsiOverbought = Math.max(55, Math.min(85, Math.round(mutate(parent.signalParams.rsiOverbought, 5))));

        // Mutate bet sizing
        child.maxBetPercent = Math.max(5, Math.min(25, mutate(parent.maxBetPercent, 2)));

        // Small chance to mutate layer params
        if (Math.random() < 0.3) {
            if (child.layer1.params.basePercent !== undefined) {
                child.layer1.params.basePercent = Math.max(1, mutate(child.layer1.params.basePercent, 1));
            }
        }

        return child;
    }

    // ======================== DNA SESSION PERSISTENCE ========================

    private saveDNASession(dna: BotDNA, state: BotState, reason: 'BANKRUPT' | 'GOAL_REACHED' | 'RUNNING' | 'STOPPED'): void {
        const winRate = state.totalTrades > 0 ? (state.wins / state.totalTrades) * 100 : 0;
        const wins = state.tradeHistory.filter(t => t.pnlValue >= 0);
        const losses = state.tradeHistory.filter(t => t.pnlValue < 0);

        const session: DNASession = {
            sessionId: state.sessionId,
            botId: dna.id,
            botName: dna.name,
            generation: dna.generation,
            dna,
            startBankroll: state.initialBankroll,
            endBankroll: parseFloat(state.bankroll.toFixed(2)),
            peakBankroll: parseFloat(state.maxBankroll.toFixed(2)),
            totalTrades: state.totalTrades,
            wins: state.wins,
            losses: state.losses,
            winRate: parseFloat(winRate.toFixed(1)),
            maxDrawdown: parseFloat(state.maxDrawdown.toFixed(1)),
            finalReason: reason,
            startTime: state.startTime,
            endTime: new Date().toISOString(),
            trades: state.tradeHistory.slice(-500), // Last 500 trades
            performance: {
                sharpeRatio: this.calculateSharpeRatio(state.tradeHistory),
                profitFactor: this.calculateProfitFactor(state.tradeHistory),
                avgWin: wins.length > 0 ? parseFloat((wins.reduce((s, t) => s + t.pnlValue, 0) / wins.length).toFixed(4)) : 0,
                avgLoss: losses.length > 0 ? parseFloat((losses.reduce((s, t) => s + t.pnlValue, 0) / losses.length).toFixed(4)) : 0,
                bestTrade: state.tradeHistory.length > 0 ? Math.max(...state.tradeHistory.map(t => t.pnlValue)) : 0,
                worstTrade: state.tradeHistory.length > 0 ? Math.min(...state.tradeHistory.map(t => t.pnlValue)) : 0,
                avgTradesPerHour: this.calculateTradesPerHour(state)
            }
        };

        try {
            const filePath = path.join(this.SESSIONS_DIR, `${session.sessionId}.json`);
            fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
        } catch (error) {
            console.warn('⚠️ Failed to save DNA session');
        }
    }

    private calculateSharpeRatio(trades: TradeRecord[]): number {
        if (trades.length < 5) return 0;
        const returns = trades.map(t => t.pnlPercent);
        const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        return stdDev > 0 ? parseFloat((avg / stdDev).toFixed(2)) : 0;
    }

    private calculateProfitFactor(trades: TradeRecord[]): number {
        const grossProfit = trades.filter(t => t.pnlValue > 0).reduce((s, t) => s + t.pnlValue, 0);
        const grossLoss = Math.abs(trades.filter(t => t.pnlValue < 0).reduce((s, t) => s + t.pnlValue, 0));
        return grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 999 : 0;
    }

    private calculateTradesPerHour(state: BotState): number {
        const startMs = new Date(state.startTime).getTime();
        const now = Date.now();
        const hours = (now - startMs) / (1000 * 60 * 60);
        return hours > 0 ? parseFloat((state.totalTrades / hours).toFixed(1)) : 0;
    }

    // ======================== LEADERBOARD ========================

    private loadLeaderboard(): void {
        // Load existing generation data if any
        try {
            if (fs.existsSync(this.LEADERBOARD_FILE)) {
                const data = JSON.parse(fs.readFileSync(this.LEADERBOARD_FILE, 'utf-8'));
                if (data.generation) this.generation = data.generation;
            }
        } catch {}
    }

    private saveEngineState(): void {
        try {
            const leaderboard = this.getLeaderboard();
            fs.writeFileSync(this.LEADERBOARD_FILE, JSON.stringify({
                generation: this.generation,
                cycle: this.currentCycle,
                timestamp: new Date().toISOString(),
                bots: leaderboard
            }, null, 2));
        } catch {}
    }

    // ======================== STATUS & REPORTING ========================

    getStatus(): any {
        const botsStatus = Array.from(this.bots.entries()).map(([id, { dna, state }]) => ({
            id,
            name: dna.name,
            generation: dna.generation,
            layer1: dna.layer1.type,
            layer2: dna.layer2.type,
            tradingStyle: dna.tradingStyle,
            leverage: dna.leverage,
            bankroll: parseFloat(state.bankroll.toFixed(2)),
            bankrollChange: parseFloat((state.bankroll - state.initialBankroll).toFixed(2)),
            bankrollChangePercent: parseFloat(((state.bankroll / state.initialBankroll - 1) * 100).toFixed(1)),
            totalTrades: state.totalTrades,
            wins: state.wins,
            losses: state.losses,
            winRate: state.totalTrades > 0 ? parseFloat(((state.wins / state.totalTrades) * 100).toFixed(1)) : 0,
            openPositions: state.openPositions.size,
            totalExposure: parseFloat(state.totalExposure.toFixed(2)),
            maxBankroll: parseFloat(state.maxBankroll.toFixed(2)),
            maxDrawdown: parseFloat(state.maxDrawdown.toFixed(1)),
            consecutiveWins: state.consecutiveWins,
            consecutiveLosses: state.consecutiveLosses,
            deathCount: state.deathCount,
            isAlive: state.isAlive,
            positions: Array.from(state.openPositions.values()),
            lastTrades: state.tradeHistory.slice(-5)
        }));

        return {
            isRunning: this.isRunning,
            generation: this.generation,
            currentCycle: this.currentCycle,
            totalBots: this.bots.size,
            initialBankroll: this.INITIAL_BANKROLL,
            goalBankroll: this.GOAL_BANKROLL,
            bots: botsStatus
        };
    }

    getLeaderboard(): any[] {
        return Array.from(this.bots.entries())
            .map(([id, { dna, state }]) => ({
                rank: 0,
                id,
                name: dna.name,
                bankroll: parseFloat(state.bankroll.toFixed(2)),
                totalTrades: state.totalTrades,
                winRate: state.totalTrades > 0 ? parseFloat(((state.wins / state.totalTrades) * 100).toFixed(1)) : 0,
                maxBankroll: parseFloat(state.maxBankroll.toFixed(2)),
                maxDrawdown: parseFloat(state.maxDrawdown.toFixed(1)),
                deathCount: state.deathCount,
                generation: dna.generation,
                strategy: `${dna.layer1.type} + ${dna.layer2.type} | ${dna.tradingStyle}`
            }))
            .sort((a, b) => b.bankroll - a.bankroll)
            .map((bot, idx) => ({ ...bot, rank: idx + 1 }));
    }

    getDNASessions(): string[] {
        try {
            return fs.readdirSync(this.SESSIONS_DIR)
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse();
        } catch {
            return [];
        }
    }

    getDNASession(sessionId: string): DNASession | null {
        try {
            const filePath = path.join(this.SESSIONS_DIR, `${sessionId}.json`);
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
        } catch {}
        return null;
    }

    private printStatusReport(): void {
        const board = this.getLeaderboard();
        console.log(`\n📊 [DNA ARENA] Ciclo #${this.currentCycle} | Gen ${this.generation}`);
        console.log('   ┌─────────────┬──────────┬────────┬──────────┬───────────┬────────┐');
        console.log('   │ Bot         │ Bankroll │ Trades │ Win Rate │ Drawdown  │ Deaths │');
        console.log('   ├─────────────┼──────────┼────────┼──────────┼───────────┼────────┤');
        for (const bot of board) {
            const name = bot.name.padEnd(11);
            const bankroll = `$${bot.bankroll.toFixed(0)}`.padStart(8);
            const trades = bot.totalTrades.toString().padStart(6);
            const wr = `${bot.winRate}%`.padStart(8);
            const dd = `${bot.maxDrawdown}%`.padStart(9);
            const deaths = bot.deathCount.toString().padStart(6);
            console.log(`   │ ${name} │ ${bankroll} │ ${trades} │ ${wr} │ ${dd} │ ${deaths} │`);
        }
        console.log('   └─────────────┴──────────┴────────┴──────────┴───────────┴────────┘\n');
    }

    // ======================== TECHNICAL INDICATORS ========================

    private calculateRSI(closes: number[], period: number): number {
        if (closes.length < period + 1) return 50;
        let gains = 0, losses = 0;
        for (let i = closes.length - period; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff > 0) gains += diff;
            else losses += Math.abs(diff);
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100;
        return 100 - (100 / (1 + avgGain / avgLoss));
    }

    private calculateEMA(data: number[], period: number): number {
        if (data.length < period) return data[data.length - 1];
        const multiplier = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }
        return ema;
    }

    private calculateStochK(closes: number[], highs: number[], lows: number[], period: number): number {
        if (closes.length < period) return 50;
        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);
        const highest = Math.max(...recentHighs);
        const lowest = Math.min(...recentLows);
        if (highest === lowest) return 50;
        return ((closes[closes.length - 1] - lowest) / (highest - lowest)) * 100;
    }
}
