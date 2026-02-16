import { apiClient } from './api/client';

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
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    strength: number;
    indicators: TechnicalIndicators;
    price: number;
    timestamp: number;
    reasons: string[];
    orderStatus?: 'PENDING' | 'EXECUTED' | 'FAILED' | 'WAITING';
    orderValue?: number;
    takeProfit?: number;
    stopLoss?: number;
    orderId?: string;
    executionTime?: number;
}

export interface RotativeAnalysisResult {
    totalMarkets: number;
    analyzedMarkets: number;
    signals: TradingSignal[];
    timestamp: number;
    duration: number;
    errors: string[];
    summary: {
        buySignals: number;
        sellSignals: number;
        holdSignals: number;
        averageStrength: number;
    };
}

export interface MultiTimeframeAnalysis {
    symbol: string;
    timeframes: {
        [key: string]: TradingSignal;
    };
    consensus: 'BUY' | 'SELL' | 'HOLD';
    timestamp: number;
}

export class RealAnalysisService {
    private static readonly FAVORITES_KEY = 'binance-market-favorites';

    /**
     * Get favorite symbols from localStorage
     */
    static getFavoriteSymbols(): string[] {
        try {
            const saved = localStorage.getItem(this.FAVORITES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Erro ao carregar favoritos:', error);
            return [];
        }
    }

    /**
     * Run rotative analysis on favorite markets
     */
    static async runRotativeAnalysis(): Promise<RotativeAnalysisResult> {
        const favoriteSymbols = this.getFavoriteSymbols();

        if (favoriteSymbols.length === 0) {
            throw new Error('Nenhum mercado favorito selecionado. Marque mercados com ⭐ primeiro.');
        }

        console.log(`🚀 Iniciando análise rotativa REAL de ${favoriteSymbols.length} mercados favoritos:`, favoriteSymbols);

        const response = await apiClient.post('/real-analysis/run', {
            favoriteSymbols
        });

        console.log(`✅ Análise rotativa concluída: ${response.data.message}`);
        return response.data.data;
    }

    /**
     * Analyze specific symbol
     */
    static async analyzeSymbol(symbol: string): Promise<TradingSignal> {
        console.log(`📊 Analisando símbolo: ${symbol}`);

        const response = await apiClient.get(`/real-analysis/symbol/${symbol}`);

        console.log(`✅ Análise de ${symbol} concluída: ${response.data.data.signal}`);
        return response.data.data;
    }

    /**
     * Get multi-timeframe analysis for symbol
     */
    static async getMultiTimeframeAnalysis(symbol: string): Promise<MultiTimeframeAnalysis> {
        console.log(`📊 Análise multi-timeframe para: ${symbol}`);

        const response = await apiClient.get(`/real-analysis/multi-timeframe/${symbol}`);

        console.log(`✅ Análise multi-timeframe de ${symbol} concluída: ${response.data.data.consensus}`);
        return response.data.data;
    }

    /**
     * Get last analysis result
     */
    static async getLastAnalysis(): Promise<RotativeAnalysisResult | null> {
        try {
            const response = await apiClient.get('/real-analysis/last');
            return response.data.data;
        } catch (error) {
            console.warn('Nenhuma análise anterior encontrada');
            return null;
        }
    }

    /**
     * Get all signals from current cycle
     */
    static async getAllSignals(): Promise<TradingSignal[]> {
        try {
            // Usar o endpoint /signals que retorna todos os sinais acumulados
            const response = await apiClient.get('/real-analysis/signals');
            return response.data.signals || [];
        } catch (error) {
            console.warn('Erro ao buscar todos os sinais:', error);
            return [];
        }
    }

    /**
     * Clear signals and analysis history
     */
    static async clearHistory(): Promise<void> {
        try {
            await apiClient.post('/real-analysis/clear-history');
            console.log('✅ Histórico de sinais e análise limpo com sucesso');
        } catch (error) {
            console.error('❌ Erro ao limpar histórico:', error);
            throw error;
        }
    }

    /**
     * Get analysis status
     */
    static async getAnalysisStatus(): Promise<{
        isRunning: boolean;
        isAnalyzing: boolean;
        lastAnalysisTime: number | null;
        lastAnalysisMarkets: number;
        hasLastAnalysis: boolean;
        executedOrders: any[];
        activeStrategies: {
            trading: number;
            mathStrategy: string | null;
        };
        totalCyclesCompleted: number;
        currentCycleNumber: number;
    }> {
        const response = await apiClient.get('/real-analysis/status');
        return response.data.data;
    }

    /**
     * Start continuous rotative analysis
     */
    static async startRotativeAnalysis(): Promise<{ success: boolean; message: string }> {
        const favoriteSymbols = this.getFavoriteSymbols();

        if (favoriteSymbols.length === 0) {
            throw new Error('Nenhum mercado favorito selecionado. Marque mercados com ⭐ primeiro.');
        }

        console.log(`🚀 Iniciando análise rotativa contínua REAL de ${favoriteSymbols.length} mercados favoritos:`, favoriteSymbols);

        const response = await apiClient.post('/real-analysis/start', {
            favoriteSymbols
        });

        console.log(`✅ Análise rotativa contínua iniciada: ${response.data.message}`);
        return response.data;
    }

    /**
     * Stop continuous rotative analysis
     */
    static async stopRotativeAnalysis(): Promise<{ success: boolean; message: string }> {
        console.log(`🛑 Parando análise rotativa contínua...`);

        const response = await apiClient.post('/real-analysis/stop');

        console.log(`✅ Análise rotativa contínua parada: ${response.data.message}`);
        return response.data;
    }

    /**
     * Get real market candlestick data
     */
    static async getMarketData(symbol: string, interval: string = '1h', limit: number = 100): Promise<{
        symbol: string;
        interval: string;
        klines: any[];
        count: number;
    }> {
        const response = await apiClient.get('/real-analysis/market-data', {
            params: { symbol, interval, limit }
        });

        return response.data.data;
    }

    /**
     * Format signal for display
     */
    static formatSignal(signal: TradingSignal): string {
        const emoji = signal.signal === 'BUY' ? '🟢' : signal.signal === 'SELL' ? '🔴' : '🟡';
        return `${emoji} ${signal.signal} (${signal.strength}%)`;
    }

    /**
     * Get signal color
     */
    static getSignalColor(signal: 'BUY' | 'SELL' | 'HOLD'): string {
        switch (signal) {
            case 'BUY': return 'text-green-600';
            case 'SELL': return 'text-red-600';
            case 'HOLD': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    }

    /**
     * Get signal background color
     */
    static getSignalBgColor(signal: 'BUY' | 'SELL' | 'HOLD'): string {
        switch (signal) {
            case 'BUY': return 'bg-green-100 border-green-300';
            case 'SELL': return 'bg-red-100 border-red-300';
            case 'HOLD': return 'bg-yellow-100 border-yellow-300';
            default: return 'bg-gray-100 border-gray-300';
        }
    }

    /**
     * Format price with appropriate decimals
     */
    static formatPrice(price: number): string {
        if (price === 0) return '0.00';
        if (price < 0.01) return price.toFixed(8);
        if (price < 1) return price.toFixed(6);
        if (price < 100) return price.toFixed(4);
        return price.toFixed(2);
    }

    /**
     * Format percentage
     */
    static formatPercent(percent: number): string {
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
    }

    /**
     * Format timestamp
     */
    static formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    /**
     * Get count of favorite markets
     */
    static getFavoriteCount(): number {
        return this.getFavoriteSymbols().length;
    }

    /**
     * Check if analysis can run (has favorites)
     */
    static canRunAnalysis(): boolean {
        return this.getFavoriteCount() > 0;
    }
}
