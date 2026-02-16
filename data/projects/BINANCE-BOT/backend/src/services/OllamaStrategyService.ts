/**
 * =============================================================================
 * CORPORACAO SENCIENTE - Ollama Strategy Service
 * Industry 7.0 Ready - Integração com LLMs Locais para Decisões de Trading
 * =============================================================================
 */

import { AggregatedSignal } from './MultiSignalService';
import { MarketTicker } from './MarketWatcherService';

// Response types
export interface StrategyAnalysis {
  id: string;
  symbol: string;
  decision: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number;
  reasoning: string;
  riskAssessment: string;
  suggestedEntryPrice?: number;
  suggestedStopLoss?: number;
  suggestedTakeProfit?: number;
  timeframe: string;
  model: string;
  timestamp: Date;
}

export interface MarketContext {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  signals: AggregatedSignal | null;
  tickers: MarketTicker[];
  recentAlerts: string[];
}

interface OllamaConfig {
  baseUrl: string;
  model: string;
  fallbackModel: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: 'qwen2.5:3b',
  fallbackModel: 'gemma2:2b',
  temperature: 0.3,
  maxTokens: 500,
};

export class OllamaStrategyService {
  private config: OllamaConfig;
  private isAvailable = false;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[OllamaStrategy] Service initialized');
    console.log(`[OllamaStrategy] Using model: ${this.config.model}`);
    this.checkAvailability();
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        console.log('[OllamaStrategy] Available models:', models);
        this.isAvailable = true;
        return true;
      }
    } catch (error) {
      console.warn('[OllamaStrategy] Ollama not available:', error);
    }
    this.isAvailable = false;
    return false;
  }

  /**
   * Analyze market context and generate trading decision
   */
  async analyzeMarket(context: MarketContext): Promise<StrategyAnalysis> {
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await this.query(prompt);
      return this.parseResponse(response, context);
    } catch (error) {
      console.error('[OllamaStrategy] Analysis error:', error);
      return this.getDefaultAnalysis(context);
    }
  }

  /**
   * Build prompt for market analysis
   */
  private buildPrompt(context: MarketContext): string {
    const signalInfo = context.signals 
      ? `\nAggregated Signal: ${context.signals.consensusType} with ${(context.signals.consensusConfidence * 100).toFixed(1)}% confidence`
      : '\nNo aggregated signals available';

    const alertInfo = context.recentAlerts.length > 0
      ? `\nRecent Alerts:\n${context.recentAlerts.map(a => `- ${a}`).join('\n')}`
      : '';

    return `You are a professional cryptocurrency trading analyst. Analyze the following market data and provide a trading recommendation.

Market Data for ${context.symbol}:
- Current Price: $${context.currentPrice.toFixed(2)}
- 24h Change: ${context.priceChange24h >= 0 ? '+' : ''}${context.priceChange24h.toFixed(2)}%
- 24h Volume: $${(context.volume24h / 1000000).toFixed(2)}M
${signalInfo}
${alertInfo}

Provide your analysis in the following JSON format only (no other text):
{
  "decision": "BUY|SELL|HOLD|WAIT",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "riskAssessment": "LOW|MEDIUM|HIGH",
  "suggestedStopLossPercent": 2.0,
  "suggestedTakeProfitPercent": 6.0,
  "timeframe": "SHORT|MEDIUM|LONG"
}`;
  }

  /**
   * Query Ollama API
   */
  private async query(prompt: string, useBackup = false): Promise<string> {
    const model = useBackup ? this.config.fallbackModel : this.config.model;
    
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      if (!useBackup) {
        console.warn(`[OllamaStrategy] Primary model failed, trying fallback...`);
        return this.query(prompt, true);
      }
      throw error;
    }
  }

  /**
   * Parse LLM response into structured analysis
   */
  private parseResponse(response: string, context: MarketContext): StrategyAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize
      const decision = this.normalizeDecision(parsed.decision);
      const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));
      const stopLossPercent = parsed.suggestedStopLossPercent || 2;
      const takeProfitPercent = parsed.suggestedTakeProfitPercent || 6;

      return {
        id: `ANALYSIS-${context.symbol}-${Date.now()}`,
        symbol: context.symbol,
        decision,
        confidence,
        reasoning: parsed.reasoning || 'Analysis completed',
        riskAssessment: parsed.riskAssessment || 'MEDIUM',
        suggestedEntryPrice: context.currentPrice,
        suggestedStopLoss: context.currentPrice * (1 - stopLossPercent / 100),
        suggestedTakeProfit: context.currentPrice * (1 + takeProfitPercent / 100),
        timeframe: parsed.timeframe || 'SHORT',
        model: this.config.model,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[OllamaStrategy] Parse error:', error);
      return this.getDefaultAnalysis(context);
    }
  }

  /**
   * Normalize decision string
   */
  private normalizeDecision(decision: string): 'BUY' | 'SELL' | 'HOLD' | 'WAIT' {
    const normalized = (decision || '').toUpperCase().trim();
    if (['BUY', 'SELL', 'HOLD', 'WAIT'].includes(normalized)) {
      return normalized as 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
    }
    return 'HOLD';
  }

  /**
   * Get default analysis when LLM is unavailable
   */
  private getDefaultAnalysis(context: MarketContext): StrategyAnalysis {
    // Use signal-based decision if available
    let decision: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' = 'HOLD';
    let confidence = 0.5;

    if (context.signals) {
      if (context.signals.consensusType === 'LONG' && context.signals.consensusConfidence > 0.6) {
        decision = 'BUY';
        confidence = context.signals.consensusConfidence;
      } else if (context.signals.consensusType === 'SHORT' && context.signals.consensusConfidence > 0.6) {
        decision = 'SELL';
        confidence = context.signals.consensusConfidence;
      } else {
        decision = 'WAIT';
        confidence = 0.4;
      }
    }

    return {
      id: `ANALYSIS-${context.symbol}-${Date.now()}`,
      symbol: context.symbol,
      decision,
      confidence,
      reasoning: 'Analysis based on aggregated signals (LLM unavailable)',
      riskAssessment: 'MEDIUM',
      suggestedEntryPrice: context.currentPrice,
      suggestedStopLoss: context.currentPrice * 0.98,
      suggestedTakeProfit: context.currentPrice * 1.06,
      timeframe: 'SHORT',
      model: 'signal-based',
      timestamp: new Date(),
    };
  }

  /**
   * Get multiple analyses for portfolio optimization
   */
  async analyzePortfolio(contexts: MarketContext[]): Promise<StrategyAnalysis[]> {
    const analyses: StrategyAnalysis[] = [];
    
    for (const context of contexts) {
      const analysis = await this.analyzeMarket(context);
      analyses.push(analysis);
      
      // Small delay to avoid overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return analyses;
  }

  /**
   * Get service status
   */
  getStatus(): { available: boolean; model: string; baseUrl: string } {
    return {
      available: this.isAvailable,
      model: this.config.model,
      baseUrl: this.config.baseUrl,
    };
  }
}

// Singleton instance
let instance: OllamaStrategyService | null = null;

export function getOllamaStrategyService(config?: Partial<OllamaConfig>): OllamaStrategyService {
  if (!instance) {
    instance = new OllamaStrategyService(config);
  }
  return instance;
}

export default OllamaStrategyService;
