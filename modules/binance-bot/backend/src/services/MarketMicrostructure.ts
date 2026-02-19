/**
 * MarketMicrostructure - Análise de Microestrutura de Mercado
 * 
 * Analisa:
 * - Order book (spread, imbalance, hidden liquidity)
 * - Trade flow (aggressive buys/sells)
 * - Predição de curto prazo (1-5 min)
 * 
 * INTEGRAÇÃO REAL: Binance WebSocket API
 */

import WebSocket from 'ws';

export interface OrderBookData {
    symbol: string;
    bids: { price: number; size: number }[];
    asks: { price: number; size: number }[];
    spread: number;
    spreadPercent: number;
    imbalance: number;      // -1 a +1
    timestamp: number;
}

export interface TradeFlowData {
    symbol: string;
    aggressiveBuys: number;
    aggressiveSells: number;
    totalVolume: number;
    buyVolume: number;
    sellVolume: number;
    imbalance: number;
    timestamp: number;
}

export interface ShortTermPrediction {
    symbol: string;
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    timeframe: '1min' | '5min';
    reasoning: string[];
}

export class MarketMicrostructure {
    // Order book history
    private orderBookHistory: Map<string, OrderBookData[]> = new Map();
    
    // Trade flow history
    private tradeFlowHistory: Map<string, TradeFlowData[]> = new Map();
    
    // WebSocket connections
    private wsConnections: Map<string, WebSocket> = new Map();
    
    // Thresholds
    private readonly HIGH_IMBALANCE_THRESHOLD = 0.7;
    private readonly PREDICTION_CONFIDENCE_THRESHOLD = 0.65;
    
    /**
     * Conecta ao WebSocket da Binance para order book em tempo real
     */
    connectToBinanceOrderBook(symbol: string): void {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`;
        
        console.log(`📡 Conectando ao order book WebSocket: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        
        ws.on('open', () => {
            console.log(`✅ WebSocket order book conectado para ${symbol}`);
        });
        
        ws.on('message', (data: WebSocket.Data) => {
            try {
                const message = JSON.parse(data.toString());
                this.processOrderBookUpdate(symbol, message);
            } catch (error) {
                console.error(`❌ Erro ao processar order book ${symbol}:`, error);
            }
        });
        
        ws.on('error', (error) => {
            console.error(`❌ WebSocket error para ${symbol}:`, error);
        });
        
        ws.on('close', () => {
            console.log(`🔌 WebSocket desconectado para ${symbol}`);
            // Reconectar após 5 segundos
            setTimeout(() => this.connectToBinanceOrderBook(symbol), 5000);
        });
        
        this.wsConnections.set(symbol, ws);
    }
    
    /**
     * Processa atualização de order book
     */
    private processOrderBookUpdate(symbol: string, message: any): void {
        const bids = message.bids.map((b: any[]) => ({
            price: parseFloat(b[0]),
            size: parseFloat(b[1])
        }));
        
        const asks = message.asks.map((a: any[]) => ({
            price: parseFloat(a[0]),
            size: parseFloat(a[1])
        }));
        
        const bestBid = bids[0]?.price || 0;
        const bestAsk = asks[0]?.price || 0;
        const spread = bestAsk - bestBid;
        const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;
        
        // Calcula imbalance
        const totalBidSize = bids.reduce((sum: number, b: any) => sum + b.size, 0);
        const totalAskSize = asks.reduce((sum: number, a: any) => sum + a.size, 0);
        const imbalance = (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize);
        
        const orderBookData: OrderBookData = {
            symbol,
            bids,
            asks,
            spread: Math.round(spread * 100) / 100,
            spreadPercent: Math.round(spreadPercent * 100) / 100,
            imbalance: Math.round(imbalance * 100) / 100,
            timestamp: Date.now()
        };
        
        this.updateOrderBook(orderBookData);
    }
    
    /**
     * Conecta ao WebSocket de trades da Binance
     */
    connectToBinanceTrades(symbol: string): void {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
        
        console.log(`📡 Conectando ao trades WebSocket: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        
        ws.on('message', (data: WebSocket.Data) => {
            try {
                const message = JSON.parse(data.toString());
                this.processTrade(symbol, message);
            } catch (error) {
                console.error(`❌ Erro ao processar trade ${symbol}:`, error);
            }
        });
        
        this.wsConnections.set(`${symbol}-trades`, ws);
    }
    
    /**
     * Processa trade individual
     */
    private processTrade(symbol: string, message: any): void {
        const isBuyerMaker = message.m; // true = venda agressiva, false = compra agressiva
        
        // Atualiza trade flow
        const existing = this.tradeFlowHistory.get(symbol);
        const latest = existing && existing.length > 0 ? existing[existing.length - 1] : null;
        
        if (!latest || Date.now() - latest.timestamp > 60000) {
            // Novo minuto
            this.updateTradeFlow({
                symbol,
                aggressiveBuys: isBuyerMaker ? 0 : 1,
                aggressiveSells: isBuyerMaker ? 1 : 0,
                totalVolume: message.q,
                buyVolume: isBuyerMaker ? 0 : message.q,
                sellVolume: isBuyerMaker ? message.q : 0,
                imbalance: isBuyerMaker ? -1 : 1,
                timestamp: Date.now()
            });
        } else {
            // Atualiza minuto atual
            latest.aggressiveBuys += isBuyerMaker ? 0 : 1;
            latest.aggressiveSells += isBuyerMaker ? 1 : 0;
            latest.totalVolume += message.q;
            latest.buyVolume += isBuyerMaker ? 0 : message.q;
            latest.sellVolume += isBuyerMaker ? message.q : 0;
            latest.imbalance = (latest.buyVolume - latest.sellVolume) / latest.totalVolume;
        }
    }
    
    /**
     * Atualiza order book
     */
    updateOrderBook(data: OrderBookData): void {
        if (!this.orderBookHistory.has(data.symbol)) {
            this.orderBookHistory.set(data.symbol, []);
        }
        
        const history = this.orderBookHistory.get(data.symbol)!;
        history.push(data);
        
        // Mantém últimos 100
        if (history.length > 100) {
            history.shift();
        }
    }
    
    /**
     * Atualiza trade flow
     */
    updateTradeFlow(data: TradeFlowData): void {
        if (!this.tradeFlowHistory.has(data.symbol)) {
            this.tradeFlowHistory.set(data.symbol, []);
        }
        
        const history = this.tradeFlowHistory.get(data.symbol)!;
        history.push(data);
        
        // Mantém últimos 100
        if (history.length > 100) {
            history.shift();
        }
    }
    
    /**
     * Analisa order book
     */
    analyzeOrderBook(symbol: string): {
        spread: number;
        imbalance: number;
        liquidity: number;
        pressure: 'BUY' | 'SELL' | 'NEUTRAL';
    } {
        const history = this.orderBookHistory.get(symbol);
        
        if (!history || history.length === 0) {
            return { spread: 0, imbalance: 0, liquidity: 0, pressure: 'NEUTRAL' };
        }
        
        const latest = history[history.length - 1];
        
        // Calcula pressão de compra/venda
        let pressure: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (latest.imbalance > this.HIGH_IMBALANCE_THRESHOLD) {
            pressure = 'BUY';
        } else if (latest.imbalance < -this.HIGH_IMBALANCE_THRESHOLD) {
            pressure = 'SELL';
        }
        
        // Calcula liquidez total
        const liquidity = latest.bids.reduce((sum, b) => sum + b.size, 0) +
                         latest.asks.reduce((sum, a) => sum + a.size, 0);
        
        return {
            spread: latest.spread,
            imbalance: latest.imbalance,
            liquidity,
            pressure
        };
    }
    
    /**
     * Analisa trade flow
     */
    analyzeTradeFlow(symbol: string): {
        aggressiveBuyRatio: number;
        aggressiveSellRatio: number;
        flowImbalance: number;
        pressure: 'BUY' | 'SELL' | 'NEUTRAL';
    } {
        const history = this.tradeFlowHistory.get(symbol);
        
        if (!history || history.length === 0) {
            return { aggressiveBuyRatio: 0, aggressiveSellRatio: 0, flowImbalance: 0, pressure: 'NEUTRAL' };
        }
        
        const latest = history[history.length - 1];
        
        const buyRatio = latest.aggressiveBuys / Math.max(1, latest.totalVolume);
        const sellRatio = latest.aggressiveSells / Math.max(1, latest.totalVolume);
        const flowImbalance = buyRatio - sellRatio;
        
        let pressure: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (flowImbalance > this.HIGH_IMBALANCE_THRESHOLD) {
            pressure = 'BUY';
        } else if (flowImbalance < -this.HIGH_IMBALANCE_THRESHOLD) {
            pressure = 'SELL';
        }
        
        return {
            aggressiveBuyRatio: Math.round(buyRatio * 100) / 100,
            aggressiveSellRatio: Math.round(sellRatio * 100) / 100,
            flowImbalance: Math.round(flowImbalance * 100) / 100,
            pressure
        };
    }
    
    /**
     * Predição de curto prazo (1-5 min)
     */
    predictShortTerm(symbol: string, timeframe: '1min' | '5min'): ShortTermPrediction {
        const orderBook = this.analyzeOrderBook(symbol);
        const tradeFlow = this.analyzeTradeFlow(symbol);
        
        const reasoning: string[] = [];
        let upSignals = 0;
        let downSignals = 0;
        
        // Order book signals
        if (orderBook.pressure === 'BUY') {
            upSignals++;
            reasoning.push(`Order book: pressão de compra (imbalance: ${orderBook.imbalance.toFixed(2)})`);
        } else if (orderBook.pressure === 'SELL') {
            downSignals++;
            reasoning.push(`Order book: pressão de venda (imbalance: ${orderBook.imbalance.toFixed(2)})`);
        }
        
        // Trade flow signals
        if (tradeFlow.pressure === 'BUY') {
            upSignals++;
            reasoning.push(`Trade flow: compras agressivas (${(tradeFlow.aggressiveBuyRatio * 100).toFixed(0)}%)`);
        } else if (tradeFlow.pressure === 'SELL') {
            downSignals++;
            reasoning.push(`Trade flow: vendas agressivas (${(tradeFlow.aggressiveSellRatio * 100).toFixed(0)}%)`);
        }
        
        // Determina direção
        let direction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
        if (upSignals >= 2) direction = 'UP';
        else if (downSignals >= 2) direction = 'DOWN';
        
        // Calcula confiança
        const totalSignals = upSignals + downSignals;
        const confidence = totalSignals > 0 ? Math.max(upSignals, downSignals) / totalSignals : 0.5;
        
        return {
            symbol,
            direction,
            confidence: Math.round(confidence * 100) / 100,
            timeframe,
            reasoning
        };
    }
    
    /**
     * Detecta spoofing/layering
     */
    detectSpoofing(symbol: string): {
        detected: boolean;
        confidence: number;
        description: string;
    } {
        const history = this.orderBookHistory.get(symbol);
        
        if (!history || history.length < 10) {
            return { detected: false, confidence: 0, description: 'Dados insuficientes' };
        }
        
        // Detecta ordens grandes que aparecem/desaparecem rapidamente
        let largeOrdersAppearing = 0;
        let largeOrdersDisappearing = 0;
        
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];
            
            const prevBidSize = prev.bids.reduce((sum, b) => sum + b.size, 0);
            const currBidSize = curr.bids.reduce((sum, b) => sum + b.size, 0);
            
            if (Math.abs(currBidSize - prevBidSize) > prevBidSize * 0.5) {
                if (currBidSize > prevBidSize) {
                    largeOrdersAppearing++;
                } else {
                    largeOrdersDisappearing++;
                }
            }
        }
        
        const ratio = largeOrdersDisappearing / Math.max(1, largeOrdersAppearing + largeOrdersDisappearing);
        
        if (ratio > 0.7) {
            return {
                detected: true,
                confidence: ratio,
                description: `Possível spoofing detectado: ${largeOrdersDisappearing} ordens grandes desapareceram rapidamente`
            };
        }
        
        return { detected: false, confidence: 0, description: 'Nenhum spoofing detectado' };
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const symbols = Array.from(this.orderBookHistory.keys());
        const wsStatus = Array.from(this.wsConnections.keys()).map(key => ({
            symbol: key,
            connected: this.wsConnections.get(key)?.readyState === WebSocket.OPEN
        }));
        
        return {
            totalSymbols: symbols.length,
            orderBookDataPoints: Array.from(this.orderBookHistory.values())
                .reduce((sum, h) => sum + h.length, 0),
            tradeFlowDataPoints: Array.from(this.tradeFlowHistory.values())
                .reduce((sum, h) => sum + h.length, 0),
            websocketConnections: wsStatus,
            predictions: symbols.map(s => ({
                symbol: s,
                prediction: this.predictShortTerm(s, '1min')
            }))
        };
    }
    
    /**
     * Desconecta todos os WebSockets
     */
    disconnectAll(): void {
        for (const [symbol, ws] of this.wsConnections) {
            ws.close();
            console.log(`🔌 WebSocket desconectado: ${symbol}`);
        }
        this.wsConnections.clear();
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.disconnectAll();
        this.orderBookHistory.clear();
        this.tradeFlowHistory.clear();
        console.log('📊 Market Microstructure resetado');
    }
}

// Singleton instance
export const marketMicrostructure = new MarketMicrostructure();
