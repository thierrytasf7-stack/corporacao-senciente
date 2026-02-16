import { logger } from '../utils/logger';

export interface CandleData {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
}

export interface TechnicalIndicators {
    rsi: number;
    macd: {
        macd: number;
        signal: number;
        histogram: number;
    };
    ema12: number;
    ema26: number;
    sma20: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
    };
    stochastic: {
        k: number;
        d: number;
    };
}

export interface TradingSignal {
    // Identificação
    id?: string;
    strategyId?: string;

    // Dados básicos
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    side?: 'BUY' | 'SELL'; // Compatibilidade com StrategyStorageService
    strength: number; // 0-100
    confidence?: number; // Compatibilidade com StrategyStorageService

    // Indicadores técnicos
    indicators: TechnicalIndicators;

    // Preço e quantidade
    price: number;
    quantity?: number;

    // Timestamp
    timestamp: number;
    timestampDate?: Date; // Compatibilidade com StrategyStorageService

    // Razões e status
    reasons: string[];
    reason?: string; // Compatibilidade com StrategyStorageService
    status?: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
    orderStatus?: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED' | 'WAITING';

    // Execução
    executionPrice?: number;
    executionTime?: Date;
    orderId?: string;
    orderValue?: number;

    // Gestão de risco
    stopLoss?: number;
    takeProfit?: number;

    // PnL
    pnl?: number;

    // Condições de mercado
    marketConditions?: {
        volatility: number;
        trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
        volume: number;
        rsi?: number;
        macd?: string;
        bollingerBands?: {
            upper: number;
            middle: number;
            lower: number;
        };
    };

    // Erros
    errorMessage?: string;
}

export class TechnicalAnalysisService {
    /**
     * Calculate RSI (Relative Strength Index)
     */
    static calculateRSI(closes: number[], period: number = 14): number {
        if (closes.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        // Calculate initial average gain and loss
        for (let i = 1; i <= period; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Calculate RSI for remaining periods
        for (let i = period + 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? Math.abs(change) : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate EMA (Exponential Moving Average)
     */
    static calculateEMA(prices: number[], period: number): number {
        if (prices.length < period) return prices[prices.length - 1];

        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }

        return ema;
    }

    /**
     * Calculate SMA (Simple Moving Average)
     */
    static calculateSMA(prices: number[], period: number): number {
        if (prices.length < period) return prices[prices.length - 1];

        const sum = prices.slice(-period).reduce((sum, price) => sum + price, 0);
        return sum / period;
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     */
    static calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);
        const macd = ema12 - ema26;

        // Calculate signal line (9-period EMA of MACD)
        const macdValues = [];
        for (let i = 26; i <= closes.length; i++) {
            const slice = closes.slice(0, i);
            const ema12_temp = this.calculateEMA(slice, 12);
            const ema26_temp = this.calculateEMA(slice, 26);
            macdValues.push(ema12_temp - ema26_temp);
        }

        const signal = this.calculateEMA(macdValues, 9);
        const histogram = macd - signal;

        return { macd, signal, histogram };
    }

    /**
     * Calculate Bollinger Bands
     */
    static calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2): {
        upper: number;
        middle: number;
        lower: number;
    } {
        const middle = this.calculateSMA(closes, period);

        if (closes.length < period) {
            return { upper: middle, middle, lower: middle };
        }

        const recentPrices = closes.slice(-period);
        const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);

        return {
            upper: middle + (standardDeviation * stdDev),
            middle,
            lower: middle - (standardDeviation * stdDev)
        };
    }

    /**
     * Calculate Stochastic Oscillator
     */
    static calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3): {
        k: number;
        d: number;
    } {
        if (highs.length < kPeriod) {
            return { k: 50, d: 50 };
        }

        const recentHighs = highs.slice(-kPeriod);
        const recentLows = lows.slice(-kPeriod);
        const currentClose = closes[closes.length - 1];

        const highestHigh = Math.max(...recentHighs);
        const lowestLow = Math.min(...recentLows);

        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

        // Calculate %D (3-period SMA of %K)
        const kValues = [];
        for (let i = kPeriod - 1; i < closes.length; i++) {
            const sliceHighs = highs.slice(i - kPeriod + 1, i + 1);
            const sliceLows = lows.slice(i - kPeriod + 1, i + 1);
            const sliceClose = closes[i];

            const maxHigh = Math.max(...sliceHighs);
            const minLow = Math.min(...sliceLows);

            kValues.push(((sliceClose - minLow) / (maxHigh - minLow)) * 100);
        }

        const d = this.calculateSMA(kValues, dPeriod);

        return { k: isNaN(k) ? 50 : k, d: isNaN(d) ? 50 : d };
    }

    /**
     * Generate trading signal based on technical indicators
     */
    static generateTradingSignal(symbol: string, candles: CandleData[]): TradingSignal {
        try {
            if (candles.length < 50) {
                logger.warn(`Insufficient data for ${symbol}: ${candles.length} candles`);
                return {
                    symbol,
                    signal: 'HOLD',
                    strength: 0,
                    indicators: this.getDefaultIndicators(),
                    price: candles[candles.length - 1]?.close || 0,
                    timestamp: Date.now(),
                    reasons: ['Dados insuficientes para análise']
                };
            }

            // Extract price data
            const closes = candles.map(c => c.close);
            const highs = candles.map(c => c.high);
            const lows = candles.map(c => c.low);
            const currentPrice = closes[closes.length - 1];

            // Calculate indicators
            const rsi = this.calculateRSI(closes);
            const macd = this.calculateMACD(closes);
            const ema12 = this.calculateEMA(closes, 12);
            const ema26 = this.calculateEMA(closes, 26);
            const sma20 = this.calculateSMA(closes, 20);
            const bollingerBands = this.calculateBollingerBands(closes);
            const stochastic = this.calculateStochastic(highs, lows, closes);

            const indicators: TechnicalIndicators = {
                rsi,
                macd,
                ema12,
                ema26,
                sma20,
                bollingerBands,
                stochastic
            };

            // Generate signal
            const signalData = this.analyzeSignals(currentPrice, indicators);

            return {
                symbol,
                signal: signalData.signal,
                strength: signalData.strength,
                indicators,
                price: currentPrice,
                timestamp: Date.now(),
                reasons: signalData.reasons
            };

        } catch (error) {
            logger.error(`Error generating signal for ${symbol}:`, error);
            return {
                symbol,
                signal: 'HOLD',
                strength: 0,
                indicators: this.getDefaultIndicators(),
                price: candles[candles.length - 1]?.close || 0,
                timestamp: Date.now(),
                reasons: ['Erro na análise técnica']
            };
        }
    }

    /**
     * Analyze signals based on indicators - VERSÃO MAIS RESTRITIVA E REALISTA
     */
    private static analyzeSignals(price: number, indicators: TechnicalIndicators): {
        signal: 'BUY' | 'SELL' | 'HOLD';
        strength: number;
        reasons: string[];
    } {
        const reasons: string[] = [];
        let buyScore = 0;
        let sellScore = 0;

        // ✅ RSI Analysis - MUITO MAIS RESTRITIVO E REALISTA
        if (indicators.rsi < 20) { // Apenas extremos muito severos
            buyScore += 25; // Reduzido de 30 para 25
            reasons.push(`RSI extremely oversold (${indicators.rsi.toFixed(1)})`);
        } else if (indicators.rsi > 80) { // Apenas extremos muito severos
            sellScore += 25; // Reduzido de 30 para 25
            reasons.push(`RSI extremely overbought (${indicators.rsi.toFixed(1)})`);
        } else if (indicators.rsi < 30) { // Zona de oversold moderado - mais restritivo
            buyScore += 5; // Reduzido de 10 para 5
            reasons.push(`RSI moderately oversold (${indicators.rsi.toFixed(1)})`);
        } else if (indicators.rsi > 70) { // Zona de overbought moderado - mais restritivo
            sellScore += 5; // Reduzido de 10 para 5
            reasons.push(`RSI moderately overbought (${indicators.rsi.toFixed(1)})`);
        }

        // ✅ MACD Analysis - MUITO MAIS RESTRITIVO E REALISTA
        const macdStrength = Math.abs(indicators.macd.histogram);
        if (indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0 && macdStrength > 0.005) { // Aumentado de 0.001 para 0.005
            buyScore += 20; // Reduzido de 25 para 20
            reasons.push(`MACD very strong bullish crossover (${indicators.macd.histogram.toFixed(4)})`);
        } else if (indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0 && macdStrength > 0.005) { // Aumentado de 0.001 para 0.005
            sellScore += 20; // Reduzido de 25 para 20
            reasons.push(`MACD very strong bearish crossover (${indicators.macd.histogram.toFixed(4)})`);
        } else if (indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0 && macdStrength > 0.002) { // Sinal moderado
            buyScore += 8; // Aumentado de 5 para 8
            reasons.push(`MACD moderate bullish crossover (${indicators.macd.histogram.toFixed(4)})`);
        } else if (indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0 && macdStrength > 0.002) { // Sinal moderado
            sellScore += 8; // Aumentado de 5 para 8
            reasons.push(`MACD moderate bearish crossover (${indicators.macd.histogram.toFixed(4)})`);
        } else if (indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0) {
            buyScore += 2; // Reduzido de 5 para 2
            reasons.push(`MACD weak bullish crossover (${indicators.macd.histogram.toFixed(4)})`);
        } else if (indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0) {
            sellScore += 2; // Reduzido de 5 para 2
            reasons.push(`MACD weak bearish crossover (${indicators.macd.histogram.toFixed(4)})`);
        }

        // ✅ EMA Analysis - MUITO MAIS RESTRITIVO E REALISTA
        const emaSpread = Math.abs(indicators.ema12 - indicators.ema26);
        const emaSpreadPercent = (emaSpread / indicators.ema26) * 100;

        if (indicators.ema12 > indicators.ema26 && emaSpreadPercent > 1.0) { // Aumentado de 0.5% para 1.0%
            buyScore += 18; // Reduzido de 20 para 18
            reasons.push(`EMA12 > EMA26 very strong bullish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        } else if (indicators.ema12 < indicators.ema26 && emaSpreadPercent > 1.0) { // Aumentado de 0.5% para 1.0%
            sellScore += 18; // Reduzido de 20 para 18
            reasons.push(`EMA12 < EMA26 very strong bearish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        } else if (indicators.ema12 > indicators.ema26 && emaSpreadPercent > 0.3) { // Sinal moderado
            buyScore += 8; // Aumentado de 5 para 8
            reasons.push(`EMA12 > EMA26 moderate bullish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        } else if (indicators.ema12 < indicators.ema26 && emaSpreadPercent > 0.3) { // Sinal moderado
            sellScore += 8; // Aumentado de 5 para 8
            reasons.push(`EMA12 < EMA26 moderate bearish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        } else if (indicators.ema12 > indicators.ema26) {
            buyScore += 2; // Reduzido de 5 para 2
            reasons.push(`EMA12 > EMA26 weak bullish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        } else if (indicators.ema12 < indicators.ema26) {
            sellScore += 2; // Reduzido de 5 para 2
            reasons.push(`EMA12 < EMA26 weak bearish trend (${emaSpreadPercent.toFixed(2)}% spread)`);
        }

        // ✅ Price vs SMA20 - MUITO MAIS RESTRITIVO E REALISTA
        const smaDeviation = ((price - indicators.sma20) / indicators.sma20) * 100;
        if (smaDeviation > 3) { // Aumentado de 2% para 3%
            buyScore += 12; // Reduzido de 15 para 12
            reasons.push(`Price very significantly above SMA20 (+${smaDeviation.toFixed(2)}%)`);
        } else if (smaDeviation < -3) { // Aumentado de 2% para 3%
            sellScore += 12; // Reduzido de 15 para 12
            reasons.push(`Price very significantly below SMA20 (${smaDeviation.toFixed(2)}%)`);
        } else if (smaDeviation > 1.5) { // Sinal moderado
            buyScore += 6; // Aumentado de 3 para 6
            reasons.push(`Price moderately above SMA20 (+${smaDeviation.toFixed(2)}%)`);
        } else if (smaDeviation < -1.5) { // Sinal moderado
            sellScore += 6; // Aumentado de 3 para 6
            reasons.push(`Price moderately below SMA20 (${smaDeviation.toFixed(2)}%)`);
        } else if (smaDeviation > 0) {
            buyScore += 1; // Reduzido de 3 para 1
            reasons.push(`Price slightly above SMA20 (+${smaDeviation.toFixed(2)}%)`);
        } else {
            sellScore += 1; // Reduzido de 3 para 1
            reasons.push(`Price slightly below SMA20 (${smaDeviation.toFixed(2)}%)`);
        }

        // ✅ Bollinger Bands Analysis - MUITO MAIS RESTRITIVO E REALISTA
        const bbPosition = (price - indicators.bollingerBands.lower) / (indicators.bollingerBands.upper - indicators.bollingerBands.lower);
        if (bbPosition < 0.05) { // Apenas muito próximo da banda inferior
            buyScore += 15; // Reduzido de 20 para 15
            reasons.push(`Price very near lower Bollinger Band (${bbPosition.toFixed(2)})`);
        } else if (bbPosition > 0.95) { // Apenas muito próximo da banda superior
            sellScore += 15; // Reduzido de 20 para 15
            reasons.push(`Price very near upper Bollinger Band (${bbPosition.toFixed(2)})`);
        } else if (bbPosition < 0.15) { // Sinal moderado
            buyScore += 8; // Aumentado de 5 para 8
            reasons.push(`Price approaching lower Bollinger Band (${bbPosition.toFixed(2)})`);
        } else if (bbPosition > 0.85) { // Sinal moderado
            sellScore += 8; // Aumentado de 5 para 8
            reasons.push(`Price approaching upper Bollinger Band (${bbPosition.toFixed(2)})`);
        } else if (bbPosition < 0.25) { // Sinal fraco
            buyScore += 2; // Reduzido de 5 para 2
            reasons.push(`Price near lower Bollinger Band area (${bbPosition.toFixed(2)})`);
        } else if (bbPosition > 0.75) { // Sinal fraco
            sellScore += 2; // Reduzido de 5 para 2
            reasons.push(`Price near upper Bollinger Band area (${bbPosition.toFixed(2)})`);
        }

        // ✅ Stochastic Analysis - MUITO MAIS RESTRITIVO E REALISTA
        if (indicators.stochastic.k < 10 && indicators.stochastic.d < 10) { // Apenas extremos muito severos
            buyScore += 18; // Reduzido de 20 para 18
            reasons.push(`Stochastic extremely oversold (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        } else if (indicators.stochastic.k > 90 && indicators.stochastic.d > 90) { // Apenas extremos muito severos
            sellScore += 18; // Reduzido de 20 para 18
            reasons.push(`Stochastic extremely overbought (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        } else if (indicators.stochastic.k < 20 && indicators.stochastic.d < 20) { // Sinal moderado
            buyScore += 8; // Aumentado de 5 para 8
            reasons.push(`Stochastic moderately oversold (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        } else if (indicators.stochastic.k > 80 && indicators.stochastic.d > 80) { // Sinal moderado
            sellScore += 8; // Aumentado de 5 para 8
            reasons.push(`Stochastic moderately overbought (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        } else if (indicators.stochastic.k < 30 && indicators.stochastic.d < 30) { // Sinal fraco
            buyScore += 2; // Reduzido de 5 para 2
            reasons.push(`Stochastic slightly oversold (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        } else if (indicators.stochastic.k > 70 && indicators.stochastic.d > 70) { // Sinal fraco
            sellScore += 2; // Reduzido de 5 para 2
            reasons.push(`Stochastic slightly overbought (K:${indicators.stochastic.k.toFixed(1)}, D:${indicators.stochastic.d.toFixed(1)})`);
        }

        // ✅ ANÁLISE BIDIRECIONAL - MUITO MAIS RESTRITIVA E REALISTA
        const netScore = buyScore - sellScore;

        // ✅ FORÇA REALISTA BASEADA EM PERCENTUAL DO NETSCORE MÁXIMO POSSÍVEL
        // Em vez de usar netScore diretamente, calcular como percentual
        const maxPossibleScore = 150; // Score máximo teórico (todos indicadores favoráveis)
        const normalizedScore = Math.abs(netScore) / maxPossibleScore * 100;
        const strength = Math.min(normalizedScore, 100);

        let signal: 'BUY' | 'SELL' | 'HOLD';

        // ✅ DEBUG: Log dos scores para entender o problema
        console.log(`🔍 [DEBUG] analyzeSignals: buyScore=${buyScore}, sellScore=${sellScore}, netScore=${netScore}, normalizedScore=${normalizedScore.toFixed(2)}, strength=${strength.toFixed(2)}`);

        // ✅ THRESHOLDS ULTRA RESTRITIVOS PARA MAIOR RIGOR
        if (netScore >= 60) { // Aumentado de 50 para 60 (ultra restritivo)
            signal = 'BUY';
            reasons.push(`Very strong bullish consensus (${netScore} points)`);
        } else if (netScore <= -60) { // Aumentado de -50 para -60 (ultra restritivo)
            signal = 'SELL';
            reasons.push(`Very strong bearish consensus (${netScore} points)`);
        } else if (netScore >= 40) { // Zona de compra moderada
            signal = 'HOLD';
            reasons.push(`Moderate bullish signals (${netScore} points) - insufficient for trade`);
        } else if (netScore <= -40) { // Zona de venda moderada
            signal = 'HOLD';
            reasons.push(`Moderate bearish signals (${netScore} points) - insufficient for trade`);
        } else if (netScore >= 20) { // Zona de compra fraca
            signal = 'HOLD';
            reasons.push(`Weak bullish signals (${netScore} points) - insufficient for trade`);
        } else if (netScore <= -20) { // Zona de venda fraca
            signal = 'HOLD';
            reasons.push(`Weak bearish signals (${netScore} points) - insufficient for trade`);
        } else {
            signal = 'HOLD';
            reasons.push(`Mixed or neutral signals (${netScore} points) - no clear direction`);
        }

        // ✅ VALIDAÇÃO ADICIONAL - CONFIRMAÇÃO DE TENDÊNCIA
        if (signal !== 'HOLD') {
            // Verificar se há confirmação de volume (se disponível)
            // Verificar se a tendência é consistente em múltiplos timeframes
            // Adicionar validações adicionais aqui se necessário
        }

        return { signal, strength, reasons };
    }

    /**
     * Get default indicators for error cases
     */
    private static getDefaultIndicators(): TechnicalIndicators {
        return {
            rsi: 50,
            macd: { macd: 0, signal: 0, histogram: 0 },
            ema12: 0,
            ema26: 0,
            sma20: 0,
            bollingerBands: { upper: 0, middle: 0, lower: 0 },
            stochastic: { k: 50, d: 50 }
        };
    }
}