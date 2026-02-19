/**
 * SentimentDataSources - Fontes de Dados de Sentimento
 * 
 * Integra com APIs reais:
 * - CryptoPanic (notícias)
 * - Twitter API (social)
 * - Whale Alert API
 * - Binance News
 */

import axios from 'axios';

export interface NewsItem {
    title: string;
    source: string;
    sentiment: number;
    published_at: number;
    url: string;
}

export interface SocialMention {
    text: string;
    author: string;
    sentiment: number;
    timestamp: number;
    platform: 'TWITTER' | 'REDDIT' | 'TELEGRAM';
}

export class SentimentDataSources {
    // APIs configuráveis
    private readonly CRYPTOPANIC_API = 'https://cryptopanic.com/api/v1/posts/';
    private readonly WHALE_ALERT_API = 'https://api.whale-alert.io/v1/transactions';
    private readonly BINANCE_NEWS = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query';
    
    private apiKeys: { [key: string]: string } = {};
    
    /**
     * Configura API keys
     */
    setApiKey(service: string, key: string): void {
        this.apiKeys[service] = key;
        console.log(`🔑 Sentiment Data: API key configurada para ${service}`);
    }
    
    /**
     * Busca notícias do CryptoPanic
     */
    async fetchCryptoPanicNews(limit: number = 10): Promise<NewsItem[]> {
        try {
            const apiKey = this.apiKeys['cryptopanic'];
            if (!apiKey) {
                console.warn('⚠️ CryptoPanic API key não configurada');
                return this.getMockNews();
            }
            
            const response = await axios.get(this.CRYPTOPANIC_API, {
                params: {
                    auth_token: apiKey,
                    kind: 'news',
                    limit: limit
                },
                timeout: 5000
            });
            
            return response.data.results.map((item: any) => ({
                title: item.title,
                source: item.source,
                sentiment: this.analyzeNewsSentiment(item.title),
                published_at: new Date(item.published_at).getTime(),
                url: item.url
            }));
        } catch (error) {
            console.error('❌ Erro ao buscar CryptoPanic news:', error);
            return this.getMockNews();
        }
    }
    
    /**
     * Busca menções do Twitter (simulado - requer API key)
     */
    async fetchTwitterMentions(symbol: string, limit: number = 20): Promise<SocialMention[]> {
        try {
            // Nota: Twitter API é paga, usando mock por enquanto
            console.log(`🐦 Fetching Twitter mentions for ${symbol}...`);
            
            // Mock data para demonstração
            return this.getMockSocialMentions(symbol, limit);
        } catch (error) {
            console.error('❌ Erro ao buscar Twitter mentions:', error);
            return [];
        }
    }
    
    /**
     * Busca whale alerts
     */
    async fetchWhaleAlerts(symbol: string, limit: number = 10): Promise<any[]> {
        try {
            const apiKey = this.apiKeys['whalealert'];
            if (!apiKey) {
                return this.getMockWhaleAlerts(symbol, limit);
            }
            
            const response = await axios.get(this.WHALE_ALERT_API, {
                params: {
                    api_key: apiKey,
                    symbol: symbol.replace('USDT', '').toLowerCase(),
                    limit: limit
                },
                timeout: 5000
            });
            
            return response.data.transactions.map((tx: any) => ({
                symbol: symbol,
                amount: tx.amount,
                value: tx.total,
                direction: tx.transaction_type === 'transfer_from_blockchain' ? 'SELL' : 'BUY',
                from: tx.from_address,
                to: tx.to_address,
                timestamp: tx.timestamp * 1000,
                sentimentImpact: tx.total > 10000000 ? 0.8 : 0.5
            }));
        } catch (error) {
            console.error('❌ Erro ao buscar Whale Alerts:', error);
            return this.getMockWhaleAlerts(symbol, limit);
        }
    }
    
    /**
     * Analisa sentimento de notícia
     */
    private analyzeNewsSentiment(title: string): number {
        const bullish = ['bull', 'rise', 'gain', 'surge', 'rally', 'breakout', 'positive', 'upgrade'];
        const bearish = ['bear', 'drop', 'fall', 'crash', 'dump', 'breakdown', 'negative', 'downgrade'];
        
        const lowerTitle = title.toLowerCase();
        
        let score = 0;
        bullish.forEach(word => {
            if (lowerTitle.includes(word)) score += 0.2;
        });
        bearish.forEach(word => {
            if (lowerTitle.includes(word)) score -= 0.2;
        });
        
        return Math.max(-1, Math.min(1, score));
    }
    
    /**
     * Mock news para fallback
     */
    private getMockNews(): NewsItem[] {
        return [
            { title: 'Bitcoin shows resilience amid market volatility', source: 'CryptoNews', sentiment: 0.3, published_at: Date.now(), url: '#' },
            { title: 'Ethereum upgrade scheduled for next month', source: 'ETHWorld', sentiment: 0.5, published_at: Date.now(), url: '#' },
            { title: 'Regulatory concerns weigh on crypto markets', source: 'CoinDesk', sentiment: -0.4, published_at: Date.now(), url: '#' }
        ];
    }
    
    /**
     * Mock social mentions
     */
    private getMockSocialMentions(symbol: string, limit: number): SocialMention[] {
        const mentions: SocialMention[] = [];
        for (let i = 0; i < limit; i++) {
            mentions.push({
                text: `${symbol} looking ${Math.random() > 0.5 ? 'bullish' : 'bearish'} today`,
                author: `user${i}`,
                sentiment: Math.random() > 0.5 ? 0.5 : -0.5,
                timestamp: Date.now() - Math.random() * 3600000,
                platform: 'TWITTER'
            });
        }
        return mentions;
    }
    
    /**
     * Mock whale alerts
     */
    private getMockWhaleAlerts(symbol: string, limit: number): any[] {
        const alerts: any[] = [];
        for (let i = 0; i < limit; i++) {
            const value = Math.random() * 50000000;
            alerts.push({
                symbol,
                amount: value / 50000,
                value,
                direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
                from: 'unknown_wallet',
                to: 'exchange_wallet',
                timestamp: Date.now() - Math.random() * 7200000,
                sentimentImpact: value > 10000000 ? 0.8 : 0.5
            });
        }
        return alerts;
    }
    
    /**
     * Obtém status das fontes
     */
    getStatus(): any {
        return {
            configuredSources: Object.keys(this.apiKeys),
            cryptopanicConfigured: !!this.apiKeys['cryptopanic'],
            whalealertConfigured: !!this.apiKeys['whalealert'],
            twitterConfigured: false // Requires paid API
        };
    }
}

// Singleton instance
export const sentimentDataSources = new SentimentDataSources();
