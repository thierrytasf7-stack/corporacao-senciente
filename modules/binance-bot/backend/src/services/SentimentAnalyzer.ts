/**
 * SentimentAnalyzer - Análise de Sentimento de Mercado
 * 
 * Analisa:
 * - Notícias crypto
 * - Social media (Twitter, Reddit)
 * - Whale alerts
 * - Sentiment score: -1 (bearish) a +1 (bullish)
 */

export interface SentimentData {
    source: 'NEWS' | 'SOCIAL' | 'WHALE';
    sentiment: number;      // -1 a +1
    confidence: number;     // 0-1
    timestamp: number;
    sourceName: string;
    content: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SentimentSummary {
    overall: number;        // -1 a +1
    news: number;
    social: number;
    whale: number;
    trend: 'IMPROVING' | 'WORSENING' | 'STABLE';
    confidence: number;
}

export interface WhaleAlert {
    symbol: string;
    amount: number;
    value: number;
    direction: 'BUY' | 'SELL' | 'TRANSFER';
    from: string;
    to: string;
    timestamp: number;
    sentimentImpact: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SentimentAnalyzer {
    // Histórico de sentiment
    private sentimentHistory: SentimentData[] = [];
    private readonly MAX_HISTORY = 1000;
    
    // Whale alerts recentes
    private whaleAlerts: WhaleAlert[] = [];
    
    // Thresholds
    private readonly POSITIVE_THRESHOLD = 0.3;
    private readonly NEGATIVE_THRESHOLD = -0.3;
    
    /**
     * Adiciona dado de sentiment
     */
    addSentiment(data: SentimentData): void {
        this.sentimentHistory.push(data);
        
        // Mantém histórico limitado
        if (this.sentimentHistory.length > this.MAX_HISTORY) {
            this.sentimentHistory.shift();
        }
        
        console.log(`📊 Sentiment: ${data.source} - ${data.sentiment.toFixed(2)} (${data.sourceName})`);
    }
    
    /**
     * Adiciona whale alert
     */
    addWhaleAlert(alert: WhaleAlert): void {
        this.whaleAlerts.push(alert);
        
        // Mantém últimos 50 alerts
        if (this.whaleAlerts.length > 50) {
            this.whaleAlerts.shift();
        }
        
        // Converte whale alert em sentiment
        const sentimentImpact = alert.direction === 'BUY' ? 0.5 : -0.5;
        
        this.addSentiment({
            source: 'WHALE',
            sentiment: sentimentImpact,
            confidence: 0.8,
            timestamp: alert.timestamp,
            sourceName: `Whale ${alert.symbol}`,
            content: `${alert.direction} $${alert.value.toLocaleString()} de ${alert.symbol}`,
            impact: alert.value > 10000000 ? 'HIGH' : 'MEDIUM'
        });
    }
    
    /**
     * Obtém resumo de sentiment
     */
    getSentimentSummary(): SentimentSummary {
        if (this.sentimentHistory.length === 0) {
            return {
                overall: 0,
                news: 0,
                social: 0,
                whale: 0,
                trend: 'STABLE',
                confidence: 0
            };
        }
        
        // Calcula médias por fonte
        const news = this.averageBySource('NEWS');
        const social = this.averageBySource('SOCIAL');
        const whale = this.averageBySource('WHALE');
        
        // Overall (ponderado)
        const overall = (news * 0.4) + (social * 0.4) + (whale * 0.2);
        
        // Trend
        const trend = this.calculateTrend();
        
        // Confiança
        const confidence = Math.min(1.0, this.sentimentHistory.length / 100);
        
        return {
            overall: Math.round(overall * 100) / 100,
            news: Math.round(news * 100) / 100,
            social: Math.round(social * 100) / 100,
            whale: Math.round(whale * 100) / 100,
            trend,
            confidence: Math.round(confidence * 100) / 100
        };
    }
    
    /**
     * Calcula média por fonte
     */
    private averageBySource(source: string): number {
        const filtered = this.sentimentHistory.filter(s => s.source === source);
        
        if (filtered.length === 0) return 0;
        
        const sum = filtered.reduce((acc, s) => acc + s.sentiment, 0);
        return sum / filtered.length;
    }
    
    /**
     * Calcula trend
     */
    private calculateTrend(): 'IMPROVING' | 'WORSENING' | 'STABLE' {
        if (this.sentimentHistory.length < 10) return 'STABLE';
        
        const recent = this.sentimentHistory.slice(-10);
        const older = this.sentimentHistory.slice(-20, -10);
        
        const recentAvg = recent.reduce((acc, s) => acc + s.sentiment, 0) / recent.length;
        const olderAvg = older.reduce((acc, s) => acc + s.sentiment, 0) / older.length;
        
        const diff = recentAvg - olderAvg;
        
        if (diff > 0.1) return 'IMPROVING';
        if (diff < -0.1) return 'WORSENING';
        return 'STABLE';
    }
    
    /**
     * Obtém recomendação de trading baseada em sentiment
     */
    getTradingRecommendation(): {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        reasoning: string;
    } {
        const summary = this.getSentimentSummary();
        
        if (summary.overall > this.POSITIVE_THRESHOLD && summary.confidence > 0.6) {
            return {
                action: 'BUY',
                confidence: summary.confidence,
                reasoning: `Sentimento positivo (${summary.overall.toFixed(2)}), trend ${summary.trend}`
            };
        }
        
        if (summary.overall < this.NEGATIVE_THRESHOLD && summary.confidence > 0.6) {
            return {
                action: 'SELL',
                confidence: summary.confidence,
                reasoning: `Sentimento negativo (${summary.overall.toFixed(2)}), trend ${summary.trend}`
            };
        }
        
        return {
            action: 'HOLD',
            confidence: summary.confidence,
            reasoning: `Sentimento neutro (${summary.overall.toFixed(2)}), trend ${summary.trend}`
        };
    }
    
    /**
     * Obtém whale alerts recentes
     */
    getRecentWhaleAlerts(limit: number = 10): WhaleAlert[] {
        return this.whaleAlerts.slice(-limit);
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const summary = this.getSentimentSummary();
        const recommendation = this.getTradingRecommendation();
        
        return {
            summary,
            recommendation,
            totalDataPoints: this.sentimentHistory.length,
            recentWhaleAlerts: this.whaleAlerts.length,
            criticalAlerts: this.whaleAlerts.filter(a => a.impact === 'CRITICAL').length
        };
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.sentimentHistory = [];
        this.whaleAlerts = [];
        console.log('📊 Sentiment Analyzer resetado');
    }
}

// Singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();
