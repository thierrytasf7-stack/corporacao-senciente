/**
 * Serviço para chamadas diretas à API da Binance Testnet
 * SEM dependência do backend - dados 100% reais
 */

interface BinanceConfig {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    testnet: boolean;
}

interface BinanceOrder {
    orderId: number;
    symbol: string;
    side: string;
    type: string;
    status: string;
    origQty: string;
    price: string;
    time: number;
    updateTime: number;
    executedQty: string;
    avgPrice?: string;
    leverage?: string;
}

interface BinanceTrade {
    id: number;
    symbol: string;
    isBuyer: boolean;
    qty: string;
    price: string;
    time: number;
    commission: string;
    realizedPnl?: string;
    leverage?: string;
    buyer?: boolean;
}

export class BinanceApiService {
    private config: BinanceConfig;
    private readonly CACHE_TTL = 30000; // 30 segundos
    private cache = new Map<string, { data: any; timestamp: number }>();

    constructor() {
        this.config = {
            apiKey: process.env.REACT_APP_BINANCE_API_KEY || '',
            secretKey: process.env.REACT_APP_BINANCE_SECRET_KEY || '',
            baseUrl: 'https://testnet.binance.vision',
            testnet: true
        };
    }

    /**
     * Gera assinatura HMAC SHA256 para autenticação
     */
    private generateSignature(queryString: string): string {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', this.config.secretKey)
            .update(queryString)
            .digest('hex');
    }

    /**
     * Faz requisição autenticada para a API da Binance
     */
    private async makeAuthenticatedRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
        const timestamp = Date.now();
        const queryString = new URLSearchParams({
            ...params,
            timestamp: timestamp.toString()
        }).toString();

        const signature = this.generateSignature(queryString);
        const url = `${this.config.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': this.config.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Busca histórico de ordens spot
     */
    async getSpotOrderHistory(limit: number = 100): Promise<BinanceOrder[]> {
        try {
            console.log('📊 [BINANCE API] Buscando histórico de ordens spot...');

            const cacheKey = `spot-orders-${limit}`;
            const cached = this.cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log('🔄 [BINANCE API] Usando cache para ordens spot');
                return cached.data;
            }

            const orders = await this.makeAuthenticatedRequest('/api/v3/allOrders', {
                limit: limit.toString()
            });

            this.cache.set(cacheKey, {
                data: orders,
                timestamp: Date.now()
            });

            console.log(`✅ [BINANCE API] ${orders.length} ordens spot obtidas`);
            return orders;

        } catch (error) {
            console.error('❌ [BINANCE API] Erro ao buscar ordens spot:', error);
            return [];
        }
    }

    /**
     * Busca histórico de trades spot
     */
    async getSpotTradeHistory(limit: number = 100): Promise<BinanceTrade[]> {
        try {
            console.log('📊 [BINANCE API] Buscando histórico de trades spot...');

            const cacheKey = `spot-trades-${limit}`;
            const cached = this.cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log('🔄 [BINANCE API] Usando cache para trades spot');
                return cached.data;
            }

            const trades = await this.makeAuthenticatedRequest('/api/v3/myTrades', {
                limit: limit.toString()
            });

            this.cache.set(cacheKey, {
                data: trades,
                timestamp: Date.now()
            });

            console.log(`✅ [BINANCE API] ${trades.length} trades spot obtidos`);
            return trades;

        } catch (error) {
            console.error('❌ [BINANCE API] Erro ao buscar trades spot:', error);
            return [];
        }
    }

    /**
     * Busca histórico de ordens futures
     */
    async getFuturesOrderHistory(limit: number = 100): Promise<BinanceOrder[]> {
        try {
            console.log('📊 [BINANCE API] Buscando histórico de ordens futures...');

            const cacheKey = `futures-orders-${limit}`;
            const cached = this.cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log('🔄 [BINANCE API] Usando cache para ordens futures');
                return cached.data;
            }

            const orders = await this.makeAuthenticatedRequest('/fapi/v1/allOrders', {
                limit: limit.toString()
            });

            this.cache.set(cacheKey, {
                data: orders,
                timestamp: Date.now()
            });

            console.log(`✅ [BINANCE API] ${orders.length} ordens futures obtidas`);
            return orders;

        } catch (error) {
            console.error('❌ [BINANCE API] Erro ao buscar ordens futures:', error);
            return [];
        }
    }

    /**
     * Busca histórico de trades futures
     */
    async getFuturesTradeHistory(limit: number = 100): Promise<BinanceTrade[]> {
        try {
            console.log('📊 [BINANCE API] Buscando histórico de trades futures...');

            const cacheKey = `futures-trades-${limit}`;
            const cached = this.cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log('🔄 [BINANCE API] Usando cache para trades futures');
                return cached.data;
            }

            const trades = await this.makeAuthenticatedRequest('/fapi/v1/userTrades', {
                limit: limit.toString()
            });

            this.cache.set(cacheKey, {
                data: trades,
                timestamp: Date.now()
            });

            console.log(`✅ [BINANCE API] ${trades.length} trades futures obtidos`);
            return trades;

        } catch (error) {
            console.error('❌ [BINANCE API] Erro ao buscar trades futures:', error);
            return [];
        }
    }

    /**
     * Limpa cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🗑️ [BINANCE API] Cache limpo');
    }
}

export default BinanceApiService;

