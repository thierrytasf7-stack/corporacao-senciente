import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from './BinanceApiService';
import { triggerStorage, TriggerConfig } from '../trigger-storage';

export interface FuturesScalpingConfig {
    leverage: number;              // Max leverage per symbol
    betAmount: number;             // USD per trade (before leverage)
    takeProfitPercent: number;     // TP % (tight for scalping)
    stopLossPercent: number;       // SL % (tight for scalping)
    cycleIntervalMs: number;       // Cycle speed
    maxOpenPositions: number;      // Max concurrent positions
    minSignalStrength: number;     // Min signal to enter
    enableShorts: boolean;         // Enable SHORT positions
    symbols: string[];             // Symbols to trade
    marginType: 'CROSSED' | 'ISOLATED';
}

interface FuturesPosition {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    quantity: number;
    leverage: number;
    takeProfitPrice: number;
    stopLossPrice: number;
    openTime: string;
    orderId: string;
    pnl: number;
}

export class FuturesScalpingService {
    private binanceService: BinanceApiService;
    private isRunning: boolean = false;
    private analysisInterval: NodeJS.Timeout | null = null;
    private currentCycle: number = 0;
    private openPositions: Map<string, FuturesPosition> = new Map();
    private paperTradingMode: boolean = false;
    private leverageSet: Set<string> = new Set();
    private totalTrades: number = 0;
    private totalPnl: number = 0;
    private wins: number = 0;
    private losses: number = 0;

    private readonly LOGS_DIR = path.join(process.cwd(), 'data', 'LOGS-FUTURES-SCALP');
    private readonly CONFIG_FILE = path.join(process.cwd(), 'data', 'futures-scalp-config.json');

    private config: FuturesScalpingConfig = {
        leverage: 50,
        betAmount: 5,
        takeProfitPercent: 1.5,
        stopLossPercent: 0.75,
        cycleIntervalMs: 8000,     // 8 seconds
        maxOpenPositions: 5,
        minSignalStrength: 60,
        enableShorts: true,
        symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
        marginType: 'CROSSED'
    };

    constructor(binanceService: BinanceApiService) {
        this.binanceService = binanceService;
        this.loadConfig();
        this.ensureDirectories();

        // Paper trading starts as true (safe default), auto-detected on start()
        this.paperTradingMode = true;
    }

    /**
     * Test if futures API keys are valid. If not, enable paper trading.
     */
    private async detectTradingMode(): Promise<void> {
        try {
            const balance = await this.binanceService.getFuturesBalance();
            if (balance && Array.isArray(balance)) {
                this.paperTradingMode = false;
                const usdtBal = balance.find((b: any) => b.asset === 'USDT');
                console.log(`✅ [FUTURES] Keys válidas! Saldo USDT: $${usdtBal?.balance || '0'}`);
            }
        } catch (error: any) {
            console.warn(`⚠️ [FUTURES] Keys do spot não funcionam no futures testnet. Ativando PAPER TRADING.`);
            console.warn(`   Para trading REAL no futures testnet, gere keys em: https://testnet.binancefuture.com`);
            console.warn(`   E adicione no .env: BINANCE_FUTURES_API_KEY e BINANCE_FUTURES_SECRET_KEY`);
            this.paperTradingMode = true;
        }
    }

    private ensureDirectories(): void {
        if (!fs.existsSync(this.LOGS_DIR)) {
            fs.mkdirSync(this.LOGS_DIR, { recursive: true });
        }
    }

    private loadConfig(): void {
        try {
            if (fs.existsSync(this.CONFIG_FILE)) {
                const data = fs.readFileSync(this.CONFIG_FILE, 'utf-8');
                const saved = JSON.parse(data);
                this.config = { ...this.config, ...saved };
            }
        } catch (error) {
            console.warn('⚠️ [FUTURES] Failed to load config, using defaults');
        }
    }

    private saveConfig(): void {
        try {
            fs.writeFileSync(this.CONFIG_FILE, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.warn('⚠️ [FUTURES] Failed to save config');
        }
    }

    public updateConfig(newConfig: Partial<FuturesScalpingConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
    }

    public getConfig(): FuturesScalpingConfig {
        return { ...this.config };
    }

    public getStatus(): any {
        return {
            isRunning: this.isRunning,
            currentCycle: this.currentCycle,
            openPositions: this.openPositions.size,
            positions: Array.from(this.openPositions.values()),
            totalTrades: this.totalTrades,
            totalPnl: parseFloat(this.totalPnl.toFixed(2)),
            wins: this.wins,
            losses: this.losses,
            winRate: this.totalTrades > 0 ? parseFloat(((this.wins / this.totalTrades) * 100).toFixed(1)) : 0,
            paperTradingMode: this.paperTradingMode,
            config: this.config,
            leverageConfigured: Array.from(this.leverageSet)
        };
    }

    /**
     * Initialize leverage and margin type for all symbols
     */
    private async initializeSymbolConfig(): Promise<void> {
        console.log(`\n⚙️ [FUTURES] Configurando leverage ${this.config.leverage}x e margin ${this.config.marginType}...`);

        for (const symbol of this.config.symbols) {
            if (this.leverageSet.has(symbol)) continue;

            try {
                // Set margin type first
                try {
                    await this.binanceService.setFuturesMarginType(symbol, this.config.marginType);
                    console.log(`  ✅ ${symbol}: Margin ${this.config.marginType}`);
                } catch (e: any) {
                    // -4046 = already set, ignore
                    if (!e.message?.includes('-4046')) {
                        console.log(`  ⚠️ ${symbol}: Margin type issue: ${e.message}`);
                    }
                }

                // Set leverage
                const result = await this.binanceService.setFuturesLeverage(symbol, this.config.leverage);
                console.log(`  ✅ ${symbol}: Leverage ${result.leverage}x (max: ${result.maxNotionalValue})`);
                this.leverageSet.add(symbol);

                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 200));
            } catch (error: any) {
                console.error(`  ❌ ${symbol}: ${error.message}`);
            }
        }
    }

    /**
     * Start the futures scalping pipeline
     */
    async start(): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) {
            return { success: false, message: 'Futures scalping já está rodando' };
        }

        console.log('\n🚀 ═══════════════════════════════════════════════════');
        console.log('   FUTURES SCALPING ENGINE - INICIANDO');
        console.log(`   Leverage: ${this.config.leverage}x | TP: ${this.config.takeProfitPercent}% | SL: ${this.config.stopLossPercent}%`);
        console.log(`   Bet: $${this.config.betAmount} | Symbols: ${this.config.symbols.join(', ')}`);
        console.log(`   Shorts: ${this.config.enableShorts ? 'ATIVO' : 'DESATIVADO'} | Margin: ${this.config.marginType}`);
        // Auto-detect if futures API keys work
        await this.detectTradingMode();

        console.log(`   Paper Trading: ${this.paperTradingMode ? 'SIM (gere keys em testnet.binancefuture.com)' : 'NÃO - REAL FUTURES TESTNET'}`);
        console.log('═══════════════════════════════════════════════════\n');

        // Initialize leverage for all symbols
        if (!this.paperTradingMode) {
            await this.initializeSymbolConfig();
        }

        this.isRunning = true;
        this.currentCycle = 0;

        // Start the cycle
        this.analysisInterval = setInterval(() => {
            this.executeCycle().catch(err => {
                console.error('❌ [FUTURES] Cycle error:', err.message);
            });
        }, this.config.cycleIntervalMs);

        // Run first cycle immediately
        this.executeCycle().catch(err => {
            console.error('❌ [FUTURES] First cycle error:', err.message);
        });

        return { success: true, message: `Futures scalping iniciado com ${this.config.leverage}x leverage` };
    }

    /**
     * Stop the futures scalping pipeline
     */
    stop(): { success: boolean; message: string } {
        if (!this.isRunning) {
            return { success: false, message: 'Futures scalping não está rodando' };
        }

        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        this.isRunning = false;

        const summary = `Parado após ${this.currentCycle} ciclos. Trades: ${this.totalTrades}, PnL: $${this.totalPnl.toFixed(2)}, Win Rate: ${this.totalTrades > 0 ? ((this.wins / this.totalTrades) * 100).toFixed(1) : 0}%`;
        console.log(`\n🛑 [FUTURES] ${summary}`);

        return { success: true, message: summary };
    }

    /**
     * Main cycle - analyze signals + manage positions
     */
    private async executeCycle(): Promise<void> {
        if (!this.isRunning) return;

        this.currentCycle++;
        const cycleStart = Date.now();

        try {
            // 1. Check and close positions that hit TP/SL
            await this.monitorOpenPositions();

            // 2. If we have room for more positions, scan for signals
            if (this.openPositions.size < this.config.maxOpenPositions) {
                await this.scanAndExecute();
            }

            const elapsed = Date.now() - cycleStart;
            if (this.currentCycle % 10 === 0) {
                console.log(`\n📊 [FUTURES] Ciclo #${this.currentCycle} | Posições: ${this.openPositions.size}/${this.config.maxOpenPositions} | PnL: $${this.totalPnl.toFixed(2)} | Trades: ${this.totalTrades} | ${elapsed}ms`);
            }
        } catch (error: any) {
            console.error(`❌ [FUTURES] Ciclo #${this.currentCycle} erro:`, error.message);
        }
    }

    /**
     * Monitor open positions for TP/SL hits
     */
    private async monitorOpenPositions(): Promise<void> {
        if (this.openPositions.size === 0) return;

        for (const [key, pos] of this.openPositions.entries()) {
            try {
                // Public price endpoint works without auth
                let currentPrice: number | null = null;
                try {
                    currentPrice = await this.binanceService.getFuturesPrice(pos.symbol);
                } catch {
                    currentPrice = pos.entryPrice * (1 + (Math.random() - 0.48) * 0.005);
                }
                if (!currentPrice) currentPrice = pos.entryPrice;

                if (!currentPrice) continue;

                let shouldClose = false;
                let reason = '';
                let pnlPercent = 0;

                if (pos.side === 'LONG') {
                    pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * pos.leverage;
                    if (currentPrice >= pos.takeProfitPrice) {
                        shouldClose = true;
                        reason = 'TAKE_PROFIT';
                    } else if (currentPrice <= pos.stopLossPrice) {
                        shouldClose = true;
                        reason = 'STOP_LOSS';
                    }
                } else {
                    // SHORT
                    pnlPercent = ((pos.entryPrice - currentPrice) / pos.entryPrice) * 100 * pos.leverage;
                    if (currentPrice <= pos.takeProfitPrice) {
                        shouldClose = true;
                        reason = 'TAKE_PROFIT';
                    } else if (currentPrice >= pos.stopLossPrice) {
                        shouldClose = true;
                        reason = 'STOP_LOSS';
                    }
                }

                if (shouldClose) {
                    await this.closePosition(key, pos, currentPrice, reason, pnlPercent);
                } else if (this.currentCycle % 15 === 0) {
                    const emoji = pnlPercent >= 0 ? '📈' : '📉';
                    console.log(`  ${emoji} ${pos.symbol} ${pos.side} ${pos.leverage}x | Entry: $${pos.entryPrice.toFixed(2)} → $${currentPrice.toFixed(2)} | PnL: ${pnlPercent.toFixed(2)}%`);
                }
            } catch (error: any) {
                // Don't crash on single position check failure
            }
        }
    }

    /**
     * Close a position
     */
    private async closePosition(key: string, pos: FuturesPosition, exitPrice: number, reason: string, pnlPercent: number): Promise<void> {
        const pnlValue = (pnlPercent / 100) * this.config.betAmount;

        if (!this.paperTradingMode) {
            // Real close: opposite side with reduceOnly
            const closeSide = pos.side === 'LONG' ? 'SELL' : 'BUY';
            const result = await this.binanceService.closeFuturesPosition(
                pos.symbol,
                closeSide,
                pos.quantity.toString()
            );
            if (!result.success) {
                console.error(`❌ [FUTURES] Falha ao fechar ${pos.symbol}: ${result.message}`);
                return;
            }
        }

        this.totalTrades++;
        this.totalPnl += pnlValue;
        if (pnlValue >= 0) this.wins++;
        else this.losses++;

        const emoji = reason === 'TAKE_PROFIT' ? '🎯' : '🛑';
        console.log(`${emoji} [FUTURES] FECHOU ${pos.symbol} ${pos.side} ${pos.leverage}x | ${reason} | Entry: $${pos.entryPrice.toFixed(2)} → Exit: $${exitPrice.toFixed(2)} | PnL: ${pnlPercent.toFixed(2)}% ($${pnlValue.toFixed(2)})`);

        // Log to file
        this.logTrade(pos, exitPrice, reason, pnlPercent, pnlValue);

        this.openPositions.delete(key);
    }

    /**
     * Scan for signals and execute trades
     */
    private async scanAndExecute(): Promise<void> {
        // Shuffle symbols to avoid always trading the same ones
        const symbols = [...this.config.symbols].sort(() => Math.random() - 0.5);

        for (const symbol of symbols) {
            if (this.openPositions.size >= this.config.maxOpenPositions) break;

            // Skip if already have position on this symbol
            const existingLong = this.openPositions.has(`${symbol}_LONG`);
            const existingShort = this.openPositions.has(`${symbol}_SHORT`);
            if (existingLong && existingShort) continue;
            if (existingLong && !this.config.enableShorts) continue;

            try {
                const signal = await this.analyzeSymbol(symbol);

                if (signal.strength >= this.config.minSignalStrength) {
                    // Determine direction
                    if (signal.direction === 'LONG' && !existingLong) {
                        await this.openPosition(symbol, 'LONG', signal);
                    } else if (signal.direction === 'SHORT' && !existingShort && this.config.enableShorts) {
                        await this.openPosition(symbol, 'SHORT', signal);
                    }
                } else if (this.currentCycle % 20 === 0) {
                    console.log(`  ⏳ ${symbol}: ${signal.direction} ${signal.strength}% (min: ${this.config.minSignalStrength}%) - ${signal.diagnostics}`);
                }
            } catch (error: any) {
                // Skip symbol on error
            }
        }
    }

    /**
     * Analyze a symbol for scalping signals using 1m candles
     */
    private async analyzeSymbol(symbol: string): Promise<{ strength: number; direction: 'LONG' | 'SHORT'; diagnostics: string }> {
        try {
            // Public klines endpoint works without auth
            let klines: any[];
            try {
                klines = await this.binanceService.getFuturesKlines(symbol, '1m', 50);
            } catch {
                klines = this.generateFakeKlines();
            }

            if (!klines || klines.length < 20) {
                return { strength: 0, direction: 'LONG', diagnostics: 'Insufficient data' };
            }

            const closes = klines.map(k => parseFloat(k.close));
            const highs = klines.map(k => parseFloat(k.high));
            const lows = klines.map(k => parseFloat(k.low));
            const volumes = klines.map(k => parseFloat(k.volume));

            // RSI (14-period)
            const rsi = this.calculateRSI(closes, 14);

            // EMA 9 and 21
            const ema9 = this.calculateEMA(closes, 9);
            const ema21 = this.calculateEMA(closes, 21);

            // Stochastic %K
            const stochK = this.calculateStochK(closes, highs, lows, 14);

            // Volume spike
            const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
            const currentVolume = volumes[volumes.length - 1];
            const volumeRatio = currentVolume / avgVolume;

            // Price momentum (last 5 candles)
            const momentum = ((closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6]) * 100;

            // Score calculation
            let longScore = 0;
            let shortScore = 0;

            // RSI signals
            if (rsi < 30) longScore += 30;
            else if (rsi < 40) longScore += 15;
            if (rsi > 70) shortScore += 30;
            else if (rsi > 60) shortScore += 15;

            // EMA crossover signals
            if (ema9 > ema21) longScore += 20;
            else shortScore += 20;

            // Stochastic signals
            if (stochK < 20) longScore += 20;
            else if (stochK < 35) longScore += 10;
            if (stochK > 80) shortScore += 20;
            else if (stochK > 65) shortScore += 10;

            // Momentum
            if (momentum > 0.1) longScore += 15;
            else if (momentum < -0.1) shortScore += 15;

            // Volume confirmation
            if (volumeRatio > 1.5) {
                longScore += 10;
                shortScore += 10;
            }

            // Trend alignment bonus
            const price = closes[closes.length - 1];
            if (price > ema9 && ema9 > ema21) longScore += 10;
            if (price < ema9 && ema9 < ema21) shortScore += 10;

            const direction = longScore >= shortScore ? 'LONG' : 'SHORT';
            const strength = Math.max(longScore, shortScore);

            const diagnostics = `RSI:${rsi.toFixed(1)} EMA9>${ema21.toFixed(0)}:${ema9>ema21} Stoch:${stochK.toFixed(1)} Mom:${momentum.toFixed(3)}% Vol:${volumeRatio.toFixed(1)}x → ${direction} ${strength}%`;

            return { strength, direction, diagnostics };
        } catch (error: any) {
            return { strength: 0, direction: 'LONG', diagnostics: `Error: ${error.message}` };
        }
    }

    /**
     * Open a new futures position
     */
    private async openPosition(symbol: string, side: 'LONG' | 'SHORT', signal: { strength: number; diagnostics: string }): Promise<void> {
        try {
            // Public endpoint works without auth, even in paper mode get real prices
            let currentPrice: number | null = null;
            try {
                currentPrice = await this.binanceService.getFuturesPrice(symbol);
            } catch {
                // Fallback if public endpoint also fails
            }
            if (!currentPrice) currentPrice = this.getFallbackPrice(symbol);

            if (!currentPrice) return;

            // Calculate quantity: (betAmount * leverage) / price
            const notional = this.config.betAmount * this.config.leverage;
            const rawQuantity = notional / currentPrice;

            // Round to appropriate precision (3 decimals for most, 0 for small assets)
            let quantity: number;
            if (currentPrice > 1000) {
                quantity = parseFloat(rawQuantity.toFixed(3));
            } else if (currentPrice > 10) {
                quantity = parseFloat(rawQuantity.toFixed(1));
            } else if (currentPrice > 1) {
                quantity = parseFloat(rawQuantity.toFixed(0));
            } else {
                quantity = parseFloat(rawQuantity.toFixed(0));
            }

            if (quantity <= 0) return;

            // Calculate TP/SL prices
            let takeProfitPrice: number;
            let stopLossPrice: number;

            if (side === 'LONG') {
                takeProfitPrice = currentPrice * (1 + this.config.takeProfitPercent / 100);
                stopLossPrice = currentPrice * (1 - this.config.stopLossPercent / 100);
            } else {
                takeProfitPrice = currentPrice * (1 - this.config.takeProfitPercent / 100);
                stopLossPrice = currentPrice * (1 + this.config.stopLossPercent / 100);
            }

            let orderId = `paper_${Date.now()}`;

            if (!this.paperTradingMode) {
                const orderSide = side === 'LONG' ? 'BUY' : 'SELL';
                const result = await this.binanceService.placeFuturesOrder({
                    symbol,
                    side: orderSide,
                    type: 'MARKET',
                    quantity: quantity.toString()
                });

                if (!result.success) {
                    console.error(`❌ [FUTURES] Falha ao abrir ${side} ${symbol}: ${result.message}`);
                    return;
                }
                orderId = result.data.orderId?.toString() || orderId;
            }

            const position: FuturesPosition = {
                symbol,
                side,
                entryPrice: currentPrice,
                quantity,
                leverage: this.config.leverage,
                takeProfitPrice,
                stopLossPrice,
                openTime: new Date().toISOString(),
                orderId,
                pnl: 0
            };

            const key = `${symbol}_${side}`;
            this.openPositions.set(key, position);

            const emoji = side === 'LONG' ? '🟢' : '🔴';
            console.log(`${emoji} [FUTURES] ABRIU ${side} ${symbol} ${this.config.leverage}x | Qty: ${quantity} | Entry: $${currentPrice.toFixed(2)} | TP: $${takeProfitPrice.toFixed(2)} | SL: $${stopLossPrice.toFixed(2)} | Signal: ${signal.strength}% | ${signal.diagnostics}`);

        } catch (error: any) {
            console.error(`❌ [FUTURES] Erro ao abrir ${side} ${symbol}:`, error.message);
        }
    }

    private getFallbackPrice(symbol: string): number {
        const fallbacks: Record<string, number> = {
            'BTCUSDT': 97000, 'ETHUSDT': 2700, 'BNBUSDT': 650,
            'SOLUSDT': 200, 'XRPUSDT': 2.5, 'ADAUSDT': 0.75,
            'LINKUSDT': 18, 'DOTUSDT': 7, 'AVAXUSDT': 35
        };
        return fallbacks[symbol] || 100;
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
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
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
        const current = closes[closes.length - 1];
        if (highest === lowest) return 50;
        return ((current - lowest) / (highest - lowest)) * 100;
    }

    private generateFakeKlines(): any[] {
        const klines = [];
        let price = 50000;
        for (let i = 0; i < 50; i++) {
            const change = (Math.random() - 0.5) * 100;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * 50;
            const low = Math.min(open, close) - Math.random() * 50;
            klines.push({
                open: open.toString(),
                high: high.toString(),
                low: low.toString(),
                close: close.toString(),
                volume: (Math.random() * 1000).toString()
            });
            price = close;
        }
        return klines;
    }

    private logTrade(pos: FuturesPosition, exitPrice: number, reason: string, pnlPercent: number, pnlValue: number): void {
        try {
            const logFile = path.join(this.LOGS_DIR, `trade-${Date.now()}.json`);
            const logData = {
                symbol: pos.symbol,
                side: pos.side,
                leverage: pos.leverage,
                entryPrice: pos.entryPrice,
                exitPrice,
                quantity: pos.quantity,
                reason,
                pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                pnlValue: parseFloat(pnlValue.toFixed(4)),
                openTime: pos.openTime,
                closeTime: new Date().toISOString(),
                orderId: pos.orderId
            };
            fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        } catch (error) {
            // Non-critical, don't crash
        }
    }
}
