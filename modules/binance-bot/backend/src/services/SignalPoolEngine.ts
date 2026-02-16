/**
 * SIGNAL POOL ENGINE - 30 Fixed Trading Strategies
 *
 * Motor independente que roda 30 estratégias de análise técnica em paralelo.
 * Cada estratégia emite sinais LONG/SHORT/NEUTRAL com força 0-100 para cada símbolo.
 * As estratégias são FIXAS - nunca mudam. São as "leis da física" do mercado.
 * Os bots DNA evoluem QUAIS estratégias ouvir e COMO combinar os sinais.
 *
 * Categorias: 10 TREND + 10 MOMENTUM + 10 VOLATILITY/VOLUME
 */

import { BinanceApiService } from './BinanceApiService';
import { TechnicalIndicators } from '../trading/indicators/TechnicalIndicators';

// ======================== INTERFACES ========================

export interface PoolSignal {
    strategyId: string;
    strategyName: string;
    category: 'TREND' | 'MOMENTUM' | 'VOLATILITY';
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    strength: number;       // 0-100
    symbol: string;
    timestamp: number;
}

export interface MarketSignals {
    symbol: string;
    timestamp: number;
    signals: PoolSignal[];
    summary: {
        longCount: number;
        shortCount: number;
        neutralCount: number;
        avgLongStrength: number;
        avgShortStrength: number;
    };
    atr14: number | null;    // ATR(14) from 1m candles
    atr14_5m: number | null; // ATR(14) from 5m candles (for position sizing - more stable)
    currentPrice: number;    // Last close price
    // Multi-timeframe confirmation (5m candles)
    higherTF: {
        bias: 'LONG' | 'SHORT' | 'NEUTRAL';  // Dominant direction on 5m
        strength: number;                       // 0-100 strength of confirmation
        longCount: number;
        shortCount: number;
    };
}

interface CandleData {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
    timestamps: number[];
}

type StrategyFn = (data: CandleData, symbol: string) => PoolSignal;

interface StrategyDefinition {
    id: string;
    name: string;
    category: 'TREND' | 'MOMENTUM' | 'VOLATILITY';
    analyze: StrategyFn;
}

// ======================== STRATEGY DEFINITIONS ========================

function makeSignal(id: string, name: string, cat: 'TREND' | 'MOMENTUM' | 'VOLATILITY', dir: 'LONG' | 'SHORT' | 'NEUTRAL', str: number, sym: string): PoolSignal {
    return { strategyId: id, strategyName: name, category: cat, direction: dir, strength: Math.max(0, Math.min(100, Math.round(str))), symbol: sym, timestamp: Date.now() };
}

function clamp(val: number, min: number, max: number): number { return Math.max(min, Math.min(max, val)); }

// ============ TREND STRATEGIES (1-10) ============

const STRATEGIES: StrategyDefinition[] = [

    // 1. EMA Crossover 9/21
    {
        id: 'ema_cross_9_21', name: 'EMA Cross 9/21', category: 'TREND',
        analyze: (d, sym) => {
            const ema9 = TechnicalIndicators.calculateEMA(d.close, 9);
            const ema21 = TechnicalIndicators.calculateEMA(d.close, 21);
            if (!ema9 || !ema21) return makeSignal('ema_cross_9_21', 'EMA Cross 9/21', 'TREND', 'NEUTRAL', 0, sym);
            const diff = (ema9 - ema21) / ema21 * 100;
            if (diff > 0.02) return makeSignal('ema_cross_9_21', 'EMA Cross 9/21', 'TREND', 'LONG', clamp(diff * 500, 30, 95), sym);
            if (diff < -0.02) return makeSignal('ema_cross_9_21', 'EMA Cross 9/21', 'TREND', 'SHORT', clamp(Math.abs(diff) * 500, 30, 95), sym);
            return makeSignal('ema_cross_9_21', 'EMA Cross 9/21', 'TREND', 'NEUTRAL', 20, sym);
        }
    },

    // 2. EMA Crossover 12/26
    {
        id: 'ema_cross_12_26', name: 'EMA Cross 12/26', category: 'TREND',
        analyze: (d, sym) => {
            const ema12 = TechnicalIndicators.calculateEMA(d.close, 12);
            const ema26 = TechnicalIndicators.calculateEMA(d.close, 26);
            if (!ema12 || !ema26) return makeSignal('ema_cross_12_26', 'EMA Cross 12/26', 'TREND', 'NEUTRAL', 0, sym);
            const diff = (ema12 - ema26) / ema26 * 100;
            if (diff > 0.015) return makeSignal('ema_cross_12_26', 'EMA Cross 12/26', 'TREND', 'LONG', clamp(diff * 600, 30, 95), sym);
            if (diff < -0.015) return makeSignal('ema_cross_12_26', 'EMA Cross 12/26', 'TREND', 'SHORT', clamp(Math.abs(diff) * 600, 30, 95), sym);
            return makeSignal('ema_cross_12_26', 'EMA Cross 12/26', 'TREND', 'NEUTRAL', 15, sym);
        }
    },

    // 3. EMA Triple Alignment 9/21/55
    {
        id: 'ema_triple_9_21_55', name: 'EMA Triple 9/21/55', category: 'TREND',
        analyze: (d, sym) => {
            const ema9 = TechnicalIndicators.calculateEMA(d.close, 9);
            const ema21 = TechnicalIndicators.calculateEMA(d.close, 21);
            const ema55 = TechnicalIndicators.calculateEMA(d.close, 55);
            if (!ema9 || !ema21 || !ema55) return makeSignal('ema_triple_9_21_55', 'EMA Triple 9/21/55', 'TREND', 'NEUTRAL', 0, sym);
            if (ema9 > ema21 && ema21 > ema55) {
                const alignment = ((ema9 - ema55) / ema55) * 100;
                return makeSignal('ema_triple_9_21_55', 'EMA Triple 9/21/55', 'TREND', 'LONG', clamp(alignment * 300, 50, 98), sym);
            }
            if (ema9 < ema21 && ema21 < ema55) {
                const alignment = ((ema55 - ema9) / ema55) * 100;
                return makeSignal('ema_triple_9_21_55', 'EMA Triple 9/21/55', 'TREND', 'SHORT', clamp(alignment * 300, 50, 98), sym);
            }
            return makeSignal('ema_triple_9_21_55', 'EMA Triple 9/21/55', 'TREND', 'NEUTRAL', 10, sym);
        }
    },

    // 4. MACD Standard 12,26,9
    {
        id: 'macd_standard', name: 'MACD 12/26/9', category: 'TREND',
        analyze: (d, sym) => {
            const macd = TechnicalIndicators.calculateMACD(d.close, 12, 26, 9);
            if (!macd) return makeSignal('macd_standard', 'MACD 12/26/9', 'TREND', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const normalized = (macd.macd / price) * 10000;
            if (normalized > 0.5) return makeSignal('macd_standard', 'MACD 12/26/9', 'TREND', 'LONG', clamp(normalized * 30, 30, 90), sym);
            if (normalized < -0.5) return makeSignal('macd_standard', 'MACD 12/26/9', 'TREND', 'SHORT', clamp(Math.abs(normalized) * 30, 30, 90), sym);
            return makeSignal('macd_standard', 'MACD 12/26/9', 'TREND', 'NEUTRAL', 15, sym);
        }
    },

    // 5. MACD Fast 5,13,6
    {
        id: 'macd_fast', name: 'MACD Fast 5/13/6', category: 'TREND',
        analyze: (d, sym) => {
            const macd = TechnicalIndicators.calculateMACD(d.close, 5, 13, 6);
            if (!macd) return makeSignal('macd_fast', 'MACD Fast 5/13/6', 'TREND', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const normalized = (macd.macd / price) * 10000;
            if (normalized > 0.3) return makeSignal('macd_fast', 'MACD Fast 5/13/6', 'TREND', 'LONG', clamp(normalized * 40, 35, 90), sym);
            if (normalized < -0.3) return makeSignal('macd_fast', 'MACD Fast 5/13/6', 'TREND', 'SHORT', clamp(Math.abs(normalized) * 40, 35, 90), sym);
            return makeSignal('macd_fast', 'MACD Fast 5/13/6', 'TREND', 'NEUTRAL', 10, sym);
        }
    },

    // 6. ADX Trend Strength
    {
        id: 'adx_trend', name: 'ADX Trend', category: 'TREND',
        analyze: (d, sym) => {
            if (d.close.length < 28) return makeSignal('adx_trend', 'ADX Trend', 'TREND', 'NEUTRAL', 0, sym);
            // Simplified ADX: use ATR direction + price direction
            const atr = TechnicalIndicators.calculateATR(d.high, d.low, d.close, 14);
            if (!atr) return makeSignal('adx_trend', 'ADX Trend', 'TREND', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const pricePrev = d.close[d.close.length - 14];
            const trendDir = price - pricePrev;
            const trendStrength = Math.abs(trendDir) / (atr * 14) * 100;
            if (trendDir > 0 && trendStrength > 20) return makeSignal('adx_trend', 'ADX Trend', 'TREND', 'LONG', clamp(trendStrength, 30, 95), sym);
            if (trendDir < 0 && trendStrength > 20) return makeSignal('adx_trend', 'ADX Trend', 'TREND', 'SHORT', clamp(trendStrength, 30, 95), sym);
            return makeSignal('adx_trend', 'ADX Trend', 'TREND', 'NEUTRAL', 15, sym);
        }
    },

    // 7. Parabolic SAR
    {
        id: 'parabolic_sar', name: 'Parabolic SAR', category: 'TREND',
        analyze: (d, sym) => {
            const sar = TechnicalIndicators.calculateParabolicSAR(d.high, d.low, 0.02, 0.2);
            if (!sar) return makeSignal('parabolic_sar', 'Parabolic SAR', 'TREND', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const diff = (price - sar) / price * 100;
            if (diff > 0.01) return makeSignal('parabolic_sar', 'Parabolic SAR', 'TREND', 'LONG', clamp(diff * 300, 40, 85), sym);
            if (diff < -0.01) return makeSignal('parabolic_sar', 'Parabolic SAR', 'TREND', 'SHORT', clamp(Math.abs(diff) * 300, 40, 85), sym);
            return makeSignal('parabolic_sar', 'Parabolic SAR', 'TREND', 'NEUTRAL', 20, sym);
        }
    },

    // 8. SuperTrend (ATR-based)
    {
        id: 'supertrend', name: 'SuperTrend', category: 'TREND',
        analyze: (d, sym) => {
            const atr = TechnicalIndicators.calculateATR(d.high, d.low, d.close, 10);
            if (!atr) return makeSignal('supertrend', 'SuperTrend', 'TREND', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const hl2 = (d.high[d.high.length - 1] + d.low[d.low.length - 1]) / 2;
            const upperBand = hl2 + 3 * atr;
            const lowerBand = hl2 - 3 * atr;
            if (price > upperBand) return makeSignal('supertrend', 'SuperTrend', 'TREND', 'LONG', 75, sym);
            if (price < lowerBand) return makeSignal('supertrend', 'SuperTrend', 'TREND', 'SHORT', 75, sym);
            const distUp = (upperBand - price) / atr;
            const distDown = (price - lowerBand) / atr;
            if (distDown < distUp) return makeSignal('supertrend', 'SuperTrend', 'TREND', 'LONG', clamp(50 + (distUp - distDown) * 10, 30, 70), sym);
            return makeSignal('supertrend', 'SuperTrend', 'TREND', 'SHORT', clamp(50 + (distDown - distUp) * 10, 30, 70), sym);
        }
    },

    // 9. Ichimoku Cloud (Simplified)
    {
        id: 'ichimoku', name: 'Ichimoku Cloud', category: 'TREND',
        analyze: (d, sym) => {
            if (d.close.length < 52) return makeSignal('ichimoku', 'Ichimoku Cloud', 'TREND', 'NEUTRAL', 0, sym);
            // Tenkan-sen (9-period high+low)/2
            const h9 = Math.max(...d.high.slice(-9));
            const l9 = Math.min(...d.low.slice(-9));
            const tenkan = (h9 + l9) / 2;
            // Kijun-sen (26-period high+low)/2
            const h26 = Math.max(...d.high.slice(-26));
            const l26 = Math.min(...d.low.slice(-26));
            const kijun = (h26 + l26) / 2;
            // Senkou Span A & B
            const spanA = (tenkan + kijun) / 2;
            const h52 = Math.max(...d.high.slice(-52));
            const l52 = Math.min(...d.low.slice(-52));
            const spanB = (h52 + l52) / 2;
            const price = d.close[d.close.length - 1];
            const cloudTop = Math.max(spanA, spanB);
            const cloudBottom = Math.min(spanA, spanB);
            if (price > cloudTop && tenkan > kijun) {
                const str = ((price - cloudTop) / cloudTop) * 5000;
                return makeSignal('ichimoku', 'Ichimoku Cloud', 'TREND', 'LONG', clamp(55 + str, 55, 95), sym);
            }
            if (price < cloudBottom && tenkan < kijun) {
                const str = ((cloudBottom - price) / cloudBottom) * 5000;
                return makeSignal('ichimoku', 'Ichimoku Cloud', 'TREND', 'SHORT', clamp(55 + str, 55, 95), sym);
            }
            return makeSignal('ichimoku', 'Ichimoku Cloud', 'TREND', 'NEUTRAL', 25, sym);
        }
    },

    // 10. Aroon
    {
        id: 'aroon', name: 'Aroon 25', category: 'TREND',
        analyze: (d, sym) => {
            const period = 25;
            if (d.close.length < period) return makeSignal('aroon', 'Aroon 25', 'TREND', 'NEUTRAL', 0, sym);
            const recent = d.close.slice(-period);
            const highIdx = recent.indexOf(Math.max(...recent));
            const lowIdx = recent.indexOf(Math.min(...recent));
            const aroonUp = ((period - (period - 1 - highIdx)) / period) * 100;
            const aroonDown = ((period - (period - 1 - lowIdx)) / period) * 100;
            const diff = aroonUp - aroonDown;
            if (diff > 30) return makeSignal('aroon', 'Aroon 25', 'TREND', 'LONG', clamp(50 + diff / 2, 40, 90), sym);
            if (diff < -30) return makeSignal('aroon', 'Aroon 25', 'TREND', 'SHORT', clamp(50 + Math.abs(diff) / 2, 40, 90), sym);
            return makeSignal('aroon', 'Aroon 25', 'TREND', 'NEUTRAL', 20, sym);
        }
    },

    // ============ MOMENTUM STRATEGIES (11-20) ============

    // 11. RSI Classic 14
    {
        id: 'rsi_14', name: 'RSI Classic 14', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const rsi = TechnicalIndicators.calculateRSI(d.close, 14);
            if (rsi === null) return makeSignal('rsi_14', 'RSI Classic 14', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (rsi < 30) return makeSignal('rsi_14', 'RSI Classic 14', 'MOMENTUM', 'LONG', clamp((30 - rsi) * 3, 40, 95), sym);
            if (rsi > 70) return makeSignal('rsi_14', 'RSI Classic 14', 'MOMENTUM', 'SHORT', clamp((rsi - 70) * 3, 40, 95), sym);
            return makeSignal('rsi_14', 'RSI Classic 14', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // 12. RSI Fast 7
    {
        id: 'rsi_7', name: 'RSI Fast 7', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const rsi = TechnicalIndicators.calculateRSI(d.close, 7);
            if (rsi === null) return makeSignal('rsi_7', 'RSI Fast 7', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (rsi < 25) return makeSignal('rsi_7', 'RSI Fast 7', 'MOMENTUM', 'LONG', clamp((25 - rsi) * 3.5, 40, 95), sym);
            if (rsi > 75) return makeSignal('rsi_7', 'RSI Fast 7', 'MOMENTUM', 'SHORT', clamp((rsi - 75) * 3.5, 40, 95), sym);
            return makeSignal('rsi_7', 'RSI Fast 7', 'MOMENTUM', 'NEUTRAL', 10, sym);
        }
    },

    // 13. Stochastic 14,3
    {
        id: 'stochastic_14', name: 'Stochastic 14/3', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const stoch = TechnicalIndicators.calculateStochastic(d.high, d.low, d.close, 14, 3);
            if (!stoch) return makeSignal('stochastic_14', 'Stochastic 14/3', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (stoch.k < 20) return makeSignal('stochastic_14', 'Stochastic 14/3', 'MOMENTUM', 'LONG', clamp((20 - stoch.k) * 4, 40, 90), sym);
            if (stoch.k > 80) return makeSignal('stochastic_14', 'Stochastic 14/3', 'MOMENTUM', 'SHORT', clamp((stoch.k - 80) * 4, 40, 90), sym);
            return makeSignal('stochastic_14', 'Stochastic 14/3', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // 14. Williams %R
    {
        id: 'williams_r', name: 'Williams %R 14', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const wr = TechnicalIndicators.calculateWilliamsR(d.high, d.low, d.close, 14);
            if (wr === null) return makeSignal('williams_r', 'Williams %R 14', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (wr < -80) return makeSignal('williams_r', 'Williams %R 14', 'MOMENTUM', 'LONG', clamp((-80 - wr) * 4, 40, 90), sym);
            if (wr > -20) return makeSignal('williams_r', 'Williams %R 14', 'MOMENTUM', 'SHORT', clamp((wr + 20) * 4, 40, 90), sym);
            return makeSignal('williams_r', 'Williams %R 14', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // 15. CCI 20
    {
        id: 'cci_20', name: 'CCI 20', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const cci = TechnicalIndicators.calculateCCI(d.high, d.low, d.close, 20);
            if (cci === null) return makeSignal('cci_20', 'CCI 20', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (cci < -100) return makeSignal('cci_20', 'CCI 20', 'MOMENTUM', 'LONG', clamp(50 + Math.abs(cci + 100) / 3, 50, 95), sym);
            if (cci > 100) return makeSignal('cci_20', 'CCI 20', 'MOMENTUM', 'SHORT', clamp(50 + (cci - 100) / 3, 50, 95), sym);
            return makeSignal('cci_20', 'CCI 20', 'MOMENTUM', 'NEUTRAL', 20, sym);
        }
    },

    // 16. ROC (Rate of Change) 12
    {
        id: 'roc_12', name: 'ROC 12', category: 'MOMENTUM',
        analyze: (d, sym) => {
            if (d.close.length < 13) return makeSignal('roc_12', 'ROC 12', 'MOMENTUM', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const prev = d.close[d.close.length - 13];
            const roc = ((price - prev) / prev) * 100;
            if (roc > 0.1) return makeSignal('roc_12', 'ROC 12', 'MOMENTUM', 'LONG', clamp(roc * 200, 30, 90), sym);
            if (roc < -0.1) return makeSignal('roc_12', 'ROC 12', 'MOMENTUM', 'SHORT', clamp(Math.abs(roc) * 200, 30, 90), sym);
            return makeSignal('roc_12', 'ROC 12', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // 17. Momentum 10
    {
        id: 'momentum_10', name: 'Momentum 10', category: 'MOMENTUM',
        analyze: (d, sym) => {
            if (d.close.length < 11) return makeSignal('momentum_10', 'Momentum 10', 'MOMENTUM', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const prev = d.close[d.close.length - 11];
            const mom = price - prev;
            const momPct = (mom / prev) * 100;
            if (momPct > 0.05) return makeSignal('momentum_10', 'Momentum 10', 'MOMENTUM', 'LONG', clamp(momPct * 300, 30, 90), sym);
            if (momPct < -0.05) return makeSignal('momentum_10', 'Momentum 10', 'MOMENTUM', 'SHORT', clamp(Math.abs(momPct) * 300, 30, 90), sym);
            return makeSignal('momentum_10', 'Momentum 10', 'MOMENTUM', 'NEUTRAL', 10, sym);
        }
    },

    // 18. TRIX 15 (Triple EMA Rate of Change)
    {
        id: 'trix_15', name: 'TRIX 15', category: 'MOMENTUM',
        analyze: (d, sym) => {
            if (d.close.length < 50) return makeSignal('trix_15', 'TRIX 15', 'MOMENTUM', 'NEUTRAL', 0, sym);
            const ema1 = TechnicalIndicators.calculateEMA(d.close, 15);
            const ema2Arr = d.close.map((_, i) => TechnicalIndicators.calculateEMA(d.close.slice(0, i + 1), 15)).filter(v => v !== null) as number[];
            const ema2 = TechnicalIndicators.calculateEMA(ema2Arr, 15);
            if (!ema1 || !ema2) return makeSignal('trix_15', 'TRIX 15', 'MOMENTUM', 'NEUTRAL', 0, sym);
            const trix = ((ema1 - ema2) / ema2) * 10000;
            if (trix > 0.5) return makeSignal('trix_15', 'TRIX 15', 'MOMENTUM', 'LONG', clamp(trix * 20, 35, 85), sym);
            if (trix < -0.5) return makeSignal('trix_15', 'TRIX 15', 'MOMENTUM', 'SHORT', clamp(Math.abs(trix) * 20, 35, 85), sym);
            return makeSignal('trix_15', 'TRIX 15', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // 19. Elder Ray (Bull + Bear Power)
    {
        id: 'elder_ray', name: 'Elder Ray', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const ema13 = TechnicalIndicators.calculateEMA(d.close, 13);
            if (!ema13) return makeSignal('elder_ray', 'Elder Ray', 'MOMENTUM', 'NEUTRAL', 0, sym);
            const bullPower = d.high[d.high.length - 1] - ema13;
            const bearPower = d.low[d.low.length - 1] - ema13;
            const price = d.close[d.close.length - 1];
            const bullNorm = (bullPower / price) * 10000;
            const bearNorm = (bearPower / price) * 10000;
            if (bullNorm > 1 && bearNorm > -2) return makeSignal('elder_ray', 'Elder Ray', 'MOMENTUM', 'LONG', clamp(50 + bullNorm * 5, 40, 85), sym);
            if (bearNorm < -1 && bullNorm < 2) return makeSignal('elder_ray', 'Elder Ray', 'MOMENTUM', 'SHORT', clamp(50 + Math.abs(bearNorm) * 5, 40, 85), sym);
            return makeSignal('elder_ray', 'Elder Ray', 'MOMENTUM', 'NEUTRAL', 20, sym);
        }
    },

    // 20. MFI (Money Flow Index) 14
    {
        id: 'mfi_14', name: 'MFI 14', category: 'MOMENTUM',
        analyze: (d, sym) => {
            const mfi = TechnicalIndicators.calculateMFI(d.high, d.low, d.close, d.volume, 14);
            if (mfi === null) return makeSignal('mfi_14', 'MFI 14', 'MOMENTUM', 'NEUTRAL', 0, sym);
            if (mfi < 20) return makeSignal('mfi_14', 'MFI 14', 'MOMENTUM', 'LONG', clamp((20 - mfi) * 4, 45, 95), sym);
            if (mfi > 80) return makeSignal('mfi_14', 'MFI 14', 'MOMENTUM', 'SHORT', clamp((mfi - 80) * 4, 45, 95), sym);
            return makeSignal('mfi_14', 'MFI 14', 'MOMENTUM', 'NEUTRAL', 15, sym);
        }
    },

    // ============ VOLATILITY/VOLUME STRATEGIES (21-30) ============

    // 21. Bollinger Bands 20,2
    {
        id: 'bollinger_20_2', name: 'Bollinger 20/2', category: 'VOLATILITY',
        analyze: (d, sym) => {
            const bb = TechnicalIndicators.calculateBollingerBands(d.close, 20, 2);
            if (!bb) return makeSignal('bollinger_20_2', 'Bollinger 20/2', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const bandWidth = bb.upper - bb.lower;
            if (price < bb.lower) {
                const depth = (bb.lower - price) / bandWidth * 100;
                return makeSignal('bollinger_20_2', 'Bollinger 20/2', 'VOLATILITY', 'LONG', clamp(50 + depth * 3, 50, 95), sym);
            }
            if (price > bb.upper) {
                const depth = (price - bb.upper) / bandWidth * 100;
                return makeSignal('bollinger_20_2', 'Bollinger 20/2', 'VOLATILITY', 'SHORT', clamp(50 + depth * 3, 50, 95), sym);
            }
            return makeSignal('bollinger_20_2', 'Bollinger 20/2', 'VOLATILITY', 'NEUTRAL', 20, sym);
        }
    },

    // 22. Bollinger Bands 10,1.5 (Tight)
    {
        id: 'bollinger_10_15', name: 'Bollinger 10/1.5', category: 'VOLATILITY',
        analyze: (d, sym) => {
            const bb = TechnicalIndicators.calculateBollingerBands(d.close, 10, 1.5);
            if (!bb) return makeSignal('bollinger_10_15', 'Bollinger 10/1.5', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const bandWidth = bb.upper - bb.lower;
            if (price < bb.lower) {
                const depth = (bb.lower - price) / bandWidth * 100;
                return makeSignal('bollinger_10_15', 'Bollinger 10/1.5', 'VOLATILITY', 'LONG', clamp(45 + depth * 4, 45, 90), sym);
            }
            if (price > bb.upper) {
                const depth = (price - bb.upper) / bandWidth * 100;
                return makeSignal('bollinger_10_15', 'Bollinger 10/1.5', 'VOLATILITY', 'SHORT', clamp(45 + depth * 4, 45, 90), sym);
            }
            return makeSignal('bollinger_10_15', 'Bollinger 10/1.5', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 23. Keltner Channels (EMA + ATR based)
    {
        id: 'keltner', name: 'Keltner Channels', category: 'VOLATILITY',
        analyze: (d, sym) => {
            const ema20 = TechnicalIndicators.calculateEMA(d.close, 20);
            const atr = TechnicalIndicators.calculateATR(d.high, d.low, d.close, 10);
            if (!ema20 || !atr) return makeSignal('keltner', 'Keltner Channels', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const upper = ema20 + 2 * atr;
            const lower = ema20 - 2 * atr;
            const price = d.close[d.close.length - 1];
            if (price < lower) {
                const depth = (lower - price) / atr;
                return makeSignal('keltner', 'Keltner Channels', 'VOLATILITY', 'LONG', clamp(50 + depth * 20, 45, 90), sym);
            }
            if (price > upper) {
                const depth = (price - upper) / atr;
                return makeSignal('keltner', 'Keltner Channels', 'VOLATILITY', 'SHORT', clamp(50 + depth * 20, 45, 90), sym);
            }
            return makeSignal('keltner', 'Keltner Channels', 'VOLATILITY', 'NEUTRAL', 20, sym);
        }
    },

    // 24. ATR Breakout
    {
        id: 'atr_breakout', name: 'ATR Breakout', category: 'VOLATILITY',
        analyze: (d, sym) => {
            const atr = TechnicalIndicators.calculateATR(d.high, d.low, d.close, 14);
            if (!atr) return makeSignal('atr_breakout', 'ATR Breakout', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const prevClose = d.close[d.close.length - 2];
            const move = Math.abs(price - prevClose);
            const breakoutRatio = move / atr;
            if (breakoutRatio > 1.5) {
                const dir = price > prevClose ? 'LONG' : 'SHORT';
                return makeSignal('atr_breakout', 'ATR Breakout', 'VOLATILITY', dir, clamp(breakoutRatio * 30, 50, 95), sym);
            }
            return makeSignal('atr_breakout', 'ATR Breakout', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 25. OBV Trend
    {
        id: 'obv_trend', name: 'OBV Trend', category: 'VOLATILITY',
        analyze: (d, sym) => {
            if (d.close.length < 20) return makeSignal('obv_trend', 'OBV Trend', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const obv = TechnicalIndicators.calculateOBV(d.close, d.volume);
            const obvPrev = TechnicalIndicators.calculateOBV(d.close.slice(0, -5), d.volume.slice(0, -5));
            if (obv === null || obvPrev === null || obvPrev === 0) return makeSignal('obv_trend', 'OBV Trend', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const change = ((obv - obvPrev) / Math.abs(obvPrev)) * 100;
            if (change > 5) return makeSignal('obv_trend', 'OBV Trend', 'VOLATILITY', 'LONG', clamp(40 + change, 40, 85), sym);
            if (change < -5) return makeSignal('obv_trend', 'OBV Trend', 'VOLATILITY', 'SHORT', clamp(40 + Math.abs(change), 40, 85), sym);
            return makeSignal('obv_trend', 'OBV Trend', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 26. VWAP Deviation
    {
        id: 'vwap_dev', name: 'VWAP Deviation', category: 'VOLATILITY',
        analyze: (d, sym) => {
            const vwap = TechnicalIndicators.calculateVWAP(d.high, d.low, d.close, d.volume);
            if (!vwap) return makeSignal('vwap_dev', 'VWAP Deviation', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - 1];
            const dev = ((price - vwap) / vwap) * 100;
            if (dev < -0.1) return makeSignal('vwap_dev', 'VWAP Deviation', 'VOLATILITY', 'LONG', clamp(Math.abs(dev) * 200, 35, 90), sym);
            if (dev > 0.1) return makeSignal('vwap_dev', 'VWAP Deviation', 'VOLATILITY', 'SHORT', clamp(dev * 200, 35, 90), sym);
            return makeSignal('vwap_dev', 'VWAP Deviation', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 27. CMF (Chaikin Money Flow) 20
    {
        id: 'cmf_20', name: 'CMF 20', category: 'VOLATILITY',
        analyze: (d, sym) => {
            if (d.close.length < 20) return makeSignal('cmf_20', 'CMF 20', 'VOLATILITY', 'NEUTRAL', 0, sym);
            // CMF = Sum(((C-L)-(H-C))/(H-L)*V) / Sum(V) over period
            let mfvSum = 0, volSum = 0;
            for (let i = d.close.length - 20; i < d.close.length; i++) {
                const hl = d.high[i] - d.low[i];
                if (hl === 0) continue;
                const mfm = ((d.close[i] - d.low[i]) - (d.high[i] - d.close[i])) / hl;
                mfvSum += mfm * d.volume[i];
                volSum += d.volume[i];
            }
            if (volSum === 0) return makeSignal('cmf_20', 'CMF 20', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const cmf = mfvSum / volSum;
            if (cmf > 0.05) return makeSignal('cmf_20', 'CMF 20', 'VOLATILITY', 'LONG', clamp(cmf * 500, 40, 90), sym);
            if (cmf < -0.05) return makeSignal('cmf_20', 'CMF 20', 'VOLATILITY', 'SHORT', clamp(Math.abs(cmf) * 500, 40, 90), sym);
            return makeSignal('cmf_20', 'CMF 20', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 28. Volume Spike
    {
        id: 'volume_spike', name: 'Volume Spike 2x', category: 'VOLATILITY',
        analyze: (d, sym) => {
            if (d.volume.length < 21) return makeSignal('volume_spike', 'Volume Spike 2x', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const avgVol = d.volume.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
            const currentVol = d.volume[d.volume.length - 1];
            const ratio = currentVol / (avgVol || 1);
            if (ratio < 1.5) return makeSignal('volume_spike', 'Volume Spike 2x', 'VOLATILITY', 'NEUTRAL', 10, sym);
            const price = d.close[d.close.length - 1];
            const prevPrice = d.close[d.close.length - 2];
            const dir = price > prevPrice ? 'LONG' : 'SHORT';
            return makeSignal('volume_spike', 'Volume Spike 2x', 'VOLATILITY', dir, clamp(ratio * 25, 40, 90), sym);
        }
    },

    // 29. Mass Index (Reversal)
    {
        id: 'mass_index', name: 'Mass Index', category: 'VOLATILITY',
        analyze: (d, sym) => {
            if (d.close.length < 30) return makeSignal('mass_index', 'Mass Index', 'VOLATILITY', 'NEUTRAL', 0, sym);
            // Simplified Mass Index: sum of (high-low EMA9) / (high-low EMA9 EMA9)
            const ranges: number[] = [];
            for (let i = 0; i < d.close.length; i++) ranges.push(d.high[i] - d.low[i]);
            const ema9 = TechnicalIndicators.calculateEMA(ranges, 9);
            const emaEma9 = TechnicalIndicators.calculateEMA(ranges.slice(0, -5), 9);
            if (!ema9 || !emaEma9 || emaEma9 === 0) return makeSignal('mass_index', 'Mass Index', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const ratio = ema9 / emaEma9;
            // Mass Index reversal bulge: ratio > 1.05 = potential reversal
            if (ratio > 1.05) {
                const price = d.close[d.close.length - 1];
                const ema21 = TechnicalIndicators.calculateEMA(d.close, 21);
                const dir = ema21 && price < ema21 ? 'LONG' : 'SHORT';
                return makeSignal('mass_index', 'Mass Index', 'VOLATILITY', dir, clamp((ratio - 1) * 500, 40, 85), sym);
            }
            return makeSignal('mass_index', 'Mass Index', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },

    // 30. DPO (Detrended Price Oscillator)
    {
        id: 'dpo', name: 'DPO 20', category: 'VOLATILITY',
        analyze: (d, sym) => {
            if (d.close.length < 30) return makeSignal('dpo', 'DPO 20', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const period = 20;
            const lookback = Math.floor(period / 2) + 1;
            const sma = TechnicalIndicators.calculateSMA(d.close.slice(0, -lookback), period);
            if (!sma) return makeSignal('dpo', 'DPO 20', 'VOLATILITY', 'NEUTRAL', 0, sym);
            const price = d.close[d.close.length - lookback];
            const dpo = price - sma;
            const dpoPct = (dpo / sma) * 100;
            if (dpoPct < -0.05) return makeSignal('dpo', 'DPO 20', 'VOLATILITY', 'LONG', clamp(Math.abs(dpoPct) * 300, 35, 85), sym);
            if (dpoPct > 0.05) return makeSignal('dpo', 'DPO 20', 'VOLATILITY', 'SHORT', clamp(dpoPct * 300, 35, 85), sym);
            return makeSignal('dpo', 'DPO 20', 'VOLATILITY', 'NEUTRAL', 15, sym);
        }
    },
];

// ======================== SIGNAL POOL ENGINE ========================

export class SignalPoolEngine {
    private binanceService: BinanceApiService;
    // MEMORY-LEAK-FIX: Candle cache with TTL eviction and max size limit (max 500 candles per entry, max 20 entries)
    private candleCache: Map<string, { data: CandleData; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5000; // 5s cache
    private readonly MAX_CACHE_ENTRIES = 20;
    private readonly SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

    constructor(binanceService: BinanceApiService) {
        this.binanceService = binanceService;
    }

    /**
     * Get all 30 strategy definitions (for DNA genomes to reference)
     */
    static getStrategyIds(): string[] {
        return STRATEGIES.map(s => s.id);
    }

    static getStrategyCount(): number {
        return STRATEGIES.length;
    }

    static getStrategyInfo(): { id: string; name: string; category: string }[] {
        return STRATEGIES.map(s => ({ id: s.id, name: s.name, category: s.category }));
    }

    /**
     * Generate signals from ALL 30 strategies for a single symbol
     */
    async generateSignals(symbol: string): Promise<MarketSignals> {
        const candles = await this.fetchCandles(symbol, '1m');
        if (!candles) {
            return {
                symbol, timestamp: Date.now(), signals: [],
                summary: { longCount: 0, shortCount: 0, neutralCount: 0, avgLongStrength: 0, avgShortStrength: 0 },
                atr14: null, atr14_5m: null, currentPrice: 0,
                higherTF: { bias: 'NEUTRAL', strength: 0, longCount: 0, shortCount: 0 }
            };
        }

        const signals: PoolSignal[] = [];
        for (const strategy of STRATEGIES) {
            try {
                const signal = strategy.analyze(candles, symbol);
                signals.push(signal);
            } catch {
                signals.push(makeSignal(strategy.id, strategy.name, strategy.category, 'NEUTRAL', 0, symbol));
            }
        }

        // Calculate ATR(14) for dynamic TP/SL
        const atr14 = TechnicalIndicators.calculateATR(candles.high, candles.low, candles.close, 14);
        const currentPrice = candles.close[candles.close.length - 1];

        // Multi-timeframe: Run trend strategies on 5m candles for confirmation
        const higherTF = await this.generateHigherTFConfirmation(symbol);

        // Calculate 5m ATR for position sizing (more stable than 1m)
        let atr14_5m: number | null = null;
        try {
            const candles5m = await this.fetchCandles(symbol, '5m');
            if (candles5m) {
                atr14_5m = TechnicalIndicators.calculateATR(candles5m.high, candles5m.low, candles5m.close, 14);
            }
        } catch { /* use null fallback */ }

        // Calculate summary
        const longs = signals.filter(s => s.direction === 'LONG');
        const shorts = signals.filter(s => s.direction === 'SHORT');
        const neutrals = signals.filter(s => s.direction === 'NEUTRAL');

        return {
            symbol,
            timestamp: Date.now(),
            signals,
            summary: {
                longCount: longs.length,
                shortCount: shorts.length,
                neutralCount: neutrals.length,
                avgLongStrength: longs.length > 0 ? longs.reduce((a, s) => a + s.strength, 0) / longs.length : 0,
                avgShortStrength: shorts.length > 0 ? shorts.reduce((a, s) => a + s.strength, 0) / shorts.length : 0,
            },
            atr14,
            atr14_5m,
            currentPrice,
            higherTF
        };
    }

    /**
     * Generate signals for ALL symbols
     */
    async generateAllSignals(): Promise<MarketSignals[]> {
        const results: MarketSignals[] = [];
        for (const symbol of this.SYMBOLS) {
            const signals = await this.generateSignals(symbol);
            results.push(signals);
        }
        return results;
    }

    /**
     * Multi-timeframe: run key TREND strategies on 5m candles for directional confirmation.
     * Returns the dominant higher-TF bias that the consensus evaluator can use.
     */
    private async generateHigherTFConfirmation(symbol: string): Promise<{
        bias: 'LONG' | 'SHORT' | 'NEUTRAL'; strength: number; longCount: number; shortCount: number;
    }> {
        const neutral = { bias: 'NEUTRAL' as const, strength: 0, longCount: 0, shortCount: 0 };
        try {
            const candles5m = await this.fetchCandles(symbol, '5m');
            if (!candles5m) return neutral;

            // Run first 10 strategies (TREND) on 5m data
            let longCount = 0, shortCount = 0, totalStr = 0;
            for (let i = 0; i < 10 && i < STRATEGIES.length; i++) {
                try {
                    const signal = STRATEGIES[i].analyze(candles5m, symbol);
                    if (signal.direction === 'LONG') { longCount++; totalStr += signal.strength; }
                    else if (signal.direction === 'SHORT') { shortCount++; totalStr += signal.strength; }
                } catch { /* skip */ }
            }

            const total = longCount + shortCount;
            if (total === 0) return neutral;
            const avgStr = totalStr / total;
            const bias = longCount > shortCount ? 'LONG' : shortCount > longCount ? 'SHORT' : 'NEUTRAL';
            return { bias: bias as any, strength: Math.round(avgStr), longCount, shortCount };
        } catch { return neutral; }
    }

    /**
     * Fetch and parse kline data with caching
     */
    private async fetchCandles(symbol: string, interval: string = '1m'): Promise<CandleData | null> {
        const cacheKey = `${symbol}_${interval}`;
        const cached = this.candleCache.get(cacheKey);
        const ttl = interval === '1m' ? this.CACHE_TTL : 15000; // 15s cache for higher TFs
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        try {
            const klines = await this.binanceService.getFuturesKlines(symbol, interval, 100);
            if (!klines || klines.length < 55) return null;

            const data: CandleData = {
                open: klines.map((k: any) => parseFloat(k.open)),
                high: klines.map((k: any) => parseFloat(k.high)),
                low: klines.map((k: any) => parseFloat(k.low)),
                close: klines.map((k: any) => parseFloat(k.close)),
                volume: klines.map((k: any) => parseFloat(k.volume)),
                timestamps: klines.map((k: any) => k.openTime),
            };

            this.candleCache.set(cacheKey, { data, timestamp: Date.now() });

            // MEMORY-LEAK-FIX: Evict stale cache entries when cache grows beyond limit
            if (this.candleCache.size > this.MAX_CACHE_ENTRIES) {
                const now = Date.now();
                for (const [key, entry] of this.candleCache) {
                    if (now - entry.timestamp > 30000) { // Evict entries older than 30s
                        this.candleCache.delete(key);
                    }
                }
            }

            return data;
        } catch {
            return null;
        }
    }
    /**
     * Get cached candle data for a symbol (used by ecosystem PatternDNA)
     */
    getCachedCandles(symbol: string, interval: string = '1m'): { open: number[]; high: number[]; low: number[]; close: number[] } | null {
        const cached = this.candleCache.get(`${symbol}_${interval}`);
        if (!cached) return null;
        return { open: cached.data.open, high: cached.data.high, low: cached.data.low, close: cached.data.close };
    }
}

export default SignalPoolEngine;
