/**
 * Analyze Market Tool
 * Corporacao Senciente - Trading MCP
 */

import { z } from 'zod';
import type { MarketData } from '../types/binance';

export const analyzeMarketSchema = z.object({
  symbol: z.string().describe('Trading pair symbol'),
  includeIndicators: z.boolean().default(true).describe('Include technical indicators'),
});

export type AnalyzeMarketInput = z.infer<typeof analyzeMarketSchema>;

export interface MarketAnalysis extends MarketData {
  indicators?: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    bollinger: { upper: number; middle: number; lower: number };
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

export async function analyzeMarket(
  input: AnalyzeMarketInput,
  binanceClient: any
): Promise<MarketAnalysis | { error: string }> {
  try {
    // Get current price
    const ticker = await binanceClient.futuresDailyStats({ symbol: input.symbol });
    
    const marketData: MarketData = {
      symbol: ticker.symbol,
      price: parseFloat(ticker.lastPrice),
      priceChange24h: parseFloat(ticker.priceChange),
      priceChangePercent24h: parseFloat(ticker.priceChangePercent),
      volume24h: parseFloat(ticker.volume),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      timestamp: Date.now(),
    };
    
    let analysis: MarketAnalysis = {
      ...marketData,
      recommendation: 'HOLD',
      confidence: 0.5,
    };
    
    if (input.includeIndicators) {
      // Get klines for indicator calculation
      const klines = await binanceClient.futuresCandles({
        symbol: input.symbol,
        interval: '1h',
        limit: 100,
      });
      
      const closes = klines.map((k: any) => parseFloat(k.close));
      
      // Calculate RSI
      const rsi = calculateRSI(closes, 14);
      
      // Calculate MACD
      const macd = calculateMACD(closes);
      
      // Calculate Bollinger Bands
      const bollinger = calculateBollinger(closes, 20, 2);
      
      // Determine trend
      const trend = determineTrend(closes, rsi, macd);
      
      analysis.indicators = {
        rsi,
        macd,
        bollinger,
        trend,
      };
      
      // Generate recommendation
      const { recommendation, confidence } = generateRecommendation(
        marketData.price,
        rsi,
        macd,
        bollinger
      );
      
      analysis.recommendation = recommendation;
      analysis.confidence = confidence;
    }
    
    return analysis;
  } catch (error: any) {
    return { error: `Market analysis failed: ${error.message}` };
  }
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdValue = ema12 - ema26;
  
  // For signal, we'd need the MACD line history, simplified here
  const signal = macdValue * 0.9; // Simplified
  const histogram = macdValue - signal;
  
  return { value: macdValue, signal, histogram };
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateBollinger(prices: number[], period: number, stdDev: number): { upper: number; middle: number; lower: number } {
  const recent = prices.slice(-period);
  const middle = recent.reduce((a, b) => a + b) / period;
  
  const variance = recent.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: middle + (std * stdDev),
    middle,
    lower: middle - (std * stdDev),
  };
}

function determineTrend(
  prices: number[],
  rsi: number,
  macd: { value: number; signal: number; histogram: number }
): 'bullish' | 'bearish' | 'neutral' {
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  // RSI
  if (rsi > 50) bullishSignals++;
  else if (rsi < 50) bearishSignals++;
  
  // MACD
  if (macd.histogram > 0) bullishSignals++;
  else if (macd.histogram < 0) bearishSignals++;
  
  // Price trend (simple moving average comparison)
  const sma20 = prices.slice(-20).reduce((a, b) => a + b) / 20;
  const currentPrice = prices[prices.length - 1];
  
  if (currentPrice > sma20) bullishSignals++;
  else bearishSignals++;
  
  if (bullishSignals > bearishSignals) return 'bullish';
  if (bearishSignals > bullishSignals) return 'bearish';
  return 'neutral';
}

function generateRecommendation(
  price: number,
  rsi: number,
  macd: { value: number; signal: number; histogram: number },
  bollinger: { upper: number; middle: number; lower: number }
): { recommendation: 'BUY' | 'SELL' | 'HOLD'; confidence: number } {
  let score = 0;
  
  // RSI signals
  if (rsi < 30) score += 2; // Oversold - buy signal
  else if (rsi > 70) score -= 2; // Overbought - sell signal
  else if (rsi < 45) score += 1;
  else if (rsi > 55) score -= 1;
  
  // MACD signals
  if (macd.histogram > 0 && macd.value > macd.signal) score += 1;
  else if (macd.histogram < 0 && macd.value < macd.signal) score -= 1;
  
  // Bollinger signals
  if (price < bollinger.lower) score += 2; // Below lower band
  else if (price > bollinger.upper) score -= 2; // Above upper band
  
  // Calculate confidence based on signal strength
  const absScore = Math.abs(score);
  const confidence = Math.min(0.9, 0.5 + (absScore * 0.1));
  
  if (score >= 2) return { recommendation: 'BUY', confidence };
  if (score <= -2) return { recommendation: 'SELL', confidence };
  return { recommendation: 'HOLD', confidence: 0.5 };
}
