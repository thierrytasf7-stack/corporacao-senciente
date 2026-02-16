/**
 * Corporacao Senciente Adapter
 * BINANCE-BOT Integration Layer
 * 
 * Connects BINANCE-BOT with the Corporacao Senciente ecosystem
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface CorporateWillDecision {
  approved: boolean;
  reason: string;
  confidence: number;
  decisionId: string;
  ethicalCheck: {
    passed: boolean;
    violations: string[];
    warnings: string[];
  };
  riskAssessment: {
    overallRisk: number;
    factors: Array<{ name: string; level: number; description: string }>;
  };
}

export interface SensoryFeedback {
  type: 'trade_signal' | 'trade_result' | 'market_update' | 'risk_alert';
  content: Record<string, any>;
  sentimentScore: number;
  timestamp: number;
}

export interface LLBMemory {
  id: string;
  content: string;
  memoryType: 'lang' | 'letta' | 'byterover';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
  timestamp: string;
}

export interface TradeApprovalRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  leverage: number;
  strategyName: string;
  confidence: number;
  stopLoss: number;
  takeProfit: number;
}

export class CorporacaoAdapter {
  private httpClient: AxiosInstance;
  private corporateWillUrl: string;
  private sensoryFeedbackUrl: string;
  private llbProtocolUrl: string;
  private agentId: string;

  constructor(config: {
    baseUrl?: string;
    corporateWillUrl?: string;
    sensoryFeedbackUrl?: string;
    llbProtocolUrl?: string;
    agentId?: string;
  } = {}) {
    const baseUrl = config.baseUrl || process.env.CORPORACAO_BASE_URL || 'http://localhost:8000';
    
    this.corporateWillUrl = config.corporateWillUrl || `${baseUrl}/api/corporate-will`;
    this.sensoryFeedbackUrl = config.sensoryFeedbackUrl || `${baseUrl}/api/sensory-feedback`;
    this.llbProtocolUrl = config.llbProtocolUrl || `${baseUrl}/api/llb-protocol`;
    this.agentId = config.agentId || 'binance-bot-trading-agent';

    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-ID': this.agentId,
      },
    });

    logger.info('CorporacaoAdapter initialized', {
      corporateWillUrl: this.corporateWillUrl,
      agentId: this.agentId,
    });
  }

  /**
   * Request trade approval from Corporate Will
   */
  async requestTradeApproval(request: TradeApprovalRequest): Promise<CorporateWillDecision> {
    try {
      const tradeValue = request.quantity * request.price;
      const riskLevel = this.calculateRiskLevel(request);

      const response = await this.httpClient.post(`${this.corporateWillUrl}/evaluate`, {
        category: 'trading',
        priority: request.confidence > 0.8 ? 'high' : 'medium',
        description: `Execute ${request.side} on ${request.symbol} using ${request.strategyName}`,
        options: [{
          action: `${request.side.toLowerCase()}_${request.symbol}`,
          cost: tradeValue,
          risk_level: riskLevel,
          expected_return: this.estimateReturn(request),
          time_to_implement: 'immediate',
        }],
        metadata: {
          symbol: request.symbol,
          leverage: request.leverage,
          stopLoss: request.stopLoss,
          takeProfit: request.takeProfit,
          strategyConfidence: request.confidence,
        },
        requestor: this.agentId,
      });

      logger.info('Trade approval received', {
        symbol: request.symbol,
        approved: response.data.approved,
        confidence: response.data.confidence,
      });

      return {
        approved: response.data.approved,
        reason: response.data.reasoning,
        confidence: response.data.confidence,
        decisionId: response.data.decision_id,
        ethicalCheck: response.data.ethical_check,
        riskAssessment: response.data.risk_assessment,
      };
    } catch (error: any) {
      logger.error('Error requesting trade approval:', error.message);
      
      // Fail-safe: deny on error
      return {
        approved: false,
        reason: `Corporate Will unavailable: ${error.message}`,
        confidence: 1.0,
        decisionId: 'error',
        ethicalCheck: {
          passed: false,
          violations: ['System unavailable'],
          warnings: [],
        },
        riskAssessment: {
          overallRisk: 1.0,
          factors: [{ name: 'system_error', level: 1.0, description: error.message }],
        },
      };
    }
  }

  /**
   * Send sensory feedback to the system
   */
  async sendSensoryFeedback(feedback: SensoryFeedback): Promise<boolean> {
    try {
      await this.httpClient.post(`${this.sensoryFeedbackUrl}/process`, {
        user_id: this.agentId,
        interaction_type: feedback.type,
        content: feedback.content,
        sentiment_score: feedback.sentimentScore,
        timestamp: feedback.timestamp,
      });

      logger.debug('Sensory feedback sent', { type: feedback.type });
      return true;
    } catch (error: any) {
      logger.warn('Failed to send sensory feedback:', error.message);
      return false;
    }
  }

  /**
   * Store memory in L.L.B. Protocol
   */
  async storeMemory(memory: Omit<LLBMemory, 'id' | 'timestamp'>): Promise<string | null> {
    try {
      const response = await this.httpClient.post(`${this.llbProtocolUrl}/store`, {
        agent_id: this.agentId,
        content: memory.content,
        memory_type: memory.memoryType,
        priority: memory.priority,
        metadata: memory.metadata,
      });

      logger.debug('Memory stored', { memoryId: response.data.memory_id });
      return response.data.memory_id;
    } catch (error: any) {
      logger.warn('Failed to store memory:', error.message);
      return null;
    }
  }

  /**
   * Retrieve memories from L.L.B. Protocol
   */
  async retrieveMemories(query: string, limit: number = 5): Promise<LLBMemory[]> {
    try {
      const response = await this.httpClient.get(`${this.llbProtocolUrl}/retrieve`, {
        params: {
          agent_id: this.agentId,
          query,
          limit,
        },
      });

      return response.data.memories;
    } catch (error: any) {
      logger.warn('Failed to retrieve memories:', error.message);
      return [];
    }
  }

  /**
   * Get preservation status
   */
  async getPreservationStatus(): Promise<{
    threatLevel: 'nominal' | 'elevated' | 'high' | 'critical';
    tradingAllowed: boolean;
    recommendations: string[];
  }> {
    try {
      const response = await this.httpClient.get(`${this.corporateWillUrl}/preservation-status`);
      
      return {
        threatLevel: response.data.threat_level,
        tradingAllowed: response.data.threat_level !== 'critical',
        recommendations: response.data.recommended_actions || [],
      };
    } catch (error: any) {
      logger.error('Error getting preservation status:', error.message);
      
      // Fail-safe: assume high threat on error
      return {
        threatLevel: 'high',
        tradingAllowed: false,
        recommendations: ['Wait for system recovery'],
      };
    }
  }

  /**
   * Notify trade result to the system
   */
  async notifyTradeResult(result: {
    symbol: string;
    side: 'BUY' | 'SELL' | 'CLOSE';
    success: boolean;
    orderId?: string;
    price: number;
    quantity: number;
    pnl?: number;
    error?: string;
  }): Promise<void> {
    // Send sensory feedback
    await this.sendSensoryFeedback({
      type: 'trade_result',
      content: result,
      sentimentScore: result.success ? 0.7 : -0.3,
      timestamp: Date.now(),
    });

    // Store in L.L.B.
    const content = result.success
      ? `Trade executed: ${result.side} ${result.quantity} ${result.symbol} @ ${result.price}${result.pnl ? ` (P&L: ${result.pnl})` : ''}`
      : `Trade failed: ${result.side} ${result.symbol} - ${result.error}`;

    await this.storeMemory({
      content,
      memoryType: result.success ? 'lang' : 'letta',
      priority: result.success ? 'high' : 'critical',
      metadata: result,
    });
  }

  /**
   * Get trading wisdom from past experiences
   */
  async getTradingWisdom(symbol: string): Promise<string[]> {
    const memories = await this.retrieveMemories(`trade ${symbol}`, 10);
    return memories.map(m => m.content);
  }

  private calculateRiskLevel(request: TradeApprovalRequest): number {
    let risk = 0;

    // Leverage risk (up to 0.3)
    risk += Math.min(0.3, request.leverage / 20 * 0.3);

    // Confidence inverse (up to 0.2)
    risk += (1 - request.confidence) * 0.2;

    // Stop loss distance (up to 0.3)
    const slDistance = Math.abs(request.price - request.stopLoss) / request.price;
    risk += Math.min(0.3, slDistance * 3);

    // Position size (up to 0.2)
    const tradeValue = request.quantity * request.price;
    if (tradeValue > 1000) risk += 0.1;
    if (tradeValue > 5000) risk += 0.1;

    return Math.min(1, risk);
  }

  private estimateReturn(request: TradeApprovalRequest): number {
    const tpDistance = Math.abs(request.takeProfit - request.price) / request.price;
    return request.quantity * request.price * tpDistance * request.leverage;
  }
}

// Singleton instance
let _adapter: CorporacaoAdapter | null = null;

export function getCorporacaoAdapter(config?: Parameters<typeof CorporacaoAdapter>[0]): CorporacaoAdapter {
  if (!_adapter) {
    _adapter = new CorporacaoAdapter(config);
  }
  return _adapter;
}
