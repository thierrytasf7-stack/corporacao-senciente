/**
 * Serviço para dados REAIS da Binance Testnet
 * SEM dados simulados ou do backend
 */

import ApiService from './api/apiService';

export interface BinanceRealBalance {
    asset: string;
    free: string;
    locked: string;
    total: string;
}

export interface BinanceRealPosition {
    symbol: string;
    side: string;
    size: string;
    entryPrice: string;
    markPrice: string;
    notional: string;
    unrealizedPnl: string;
    unrealizedPnlPercent: string;
    leverage: string;
}

export interface BinanceRealPortfolio {
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    balances: BinanceRealBalance[];
    positions: BinanceRealPosition[];
}

export class BinanceRealService {
    private static instance: BinanceRealService;
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 30000; // 30 segundos

    static getInstance(): BinanceRealService {
        if (!BinanceRealService.instance) {
            BinanceRealService.instance = new BinanceRealService();
        }
        return BinanceRealService.instance;
    }

    /**
     * Testa conexão REAL com Binance Testnet
     */
    async testConnection(): Promise<any> {
        const cacheKey = 'test-connection';
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log('🔄 Usando cache para test-connection');
            return cached;
        }

        try {
            console.log('🔗 Testando conexão REAL com Binance Testnet...');
            const result = await ApiService.get('binance/test-connection');
            this.setCached(cacheKey, result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao testar conexão com Binance:', error);
            throw error;
        }
    }

    /**
     * Obtém saldos REAIS da Binance Testnet
     */
    async getBalances(): Promise<BinanceRealBalance[]> {
        const cacheKey = 'balances';
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log('🔄 Usando cache para balances');
            return cached;
        }

        try {
            console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
            const result = await ApiService.get('binance/balances');

            if (result.success && result.data) {
                const balances = result.data.map((balance: any) => ({
                    asset: balance.asset,
                    free: balance.free,
                    locked: balance.locked,
                    total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString()
                }));

                this.setCached(cacheKey, balances);
                console.log(`✅ ${balances.length} saldos REAIS obtidos`);
                return balances;
            }

            throw new Error('Erro ao obter saldos da Binance');
        } catch (error) {
            console.error('❌ Erro ao obter saldos da Binance:', error);
            throw error;
        }
    }

    /**
     * Obtém posições ativas REAIS da Binance Testnet
     */
    async getPositions(): Promise<BinanceRealPosition[]> {
        const cacheKey = 'positions';
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log('🔄 Usando cache para positions');
            return cached;
        }

        try {
            console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');
            const result = await ApiService.get('binance/positions');

            if (result.success) {
                const positions = result.data ? Object.values(result.data) : [];
                this.setCached(cacheKey, positions);
                console.log(`✅ ${positions.length} posições ativas REAIS obtidas`);
                return positions as BinanceRealPosition[];
            }

            // Spot trading não tem posições ativas tradicionais
            console.log('📊 Nenhuma posição ativa (normal para spot trading)');
            this.setCached(cacheKey, []);
            return [];
        } catch (error) {
            console.error('❌ Erro ao obter posições da Binance:', error);
            throw error;
        }
    }

    /**
     * Obtém dados do portfolio REAL da Binance Testnet
     */
    async getPortfolio(): Promise<BinanceRealPortfolio> {
        const cacheKey = 'portfolio';
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log('🔄 Usando cache para portfolio');
            return cached;
        }

        try {
            console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
            const result = await ApiService.get('binance/portfolio');

            if (result.success && result.data) {
                const portfolio: BinanceRealPortfolio = {
                    totalValue: result.data.totalValue || 0,
                    totalPnl: result.data.totalPnl || 0,
                    totalPnlPercent: result.data.totalPnlPercent || 0,
                    balances: result.data.balances || [],
                    positions: result.data.positions || []
                };

                this.setCached(cacheKey, portfolio);
                console.log('✅ Dados REAIS do portfolio obtidos');
                return portfolio;
            }

            throw new Error('Erro ao obter portfolio da Binance');
        } catch (error) {
            console.error('❌ Erro ao obter portfolio da Binance:', error);
            throw error;
        }
    }

    /**
     * Valida credenciais REAIS da Binance Testnet
     */
    async validateCredentials(): Promise<any> {
        const cacheKey = 'validate-credentials';
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log('🔄 Usando cache para validate-credentials');
            return cached;
        }

        try {
            console.log('🔐 Validando credenciais REAIS da Binance Testnet...');
            const result = await ApiService.get('binance/validate-credentials');
            this.setCached(cacheKey, result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao validar credenciais da Binance:', error);
            throw error;
        }
    }

    /**
     * Obtém preço atual de um símbolo da Binance
     */
    async getPrice(symbol: string): Promise<number> {
        try {
            const result = await ApiService.get(`binance/price/${symbol}`);
            if (result.success && result.price) {
                return parseFloat(result.price);
            }
            throw new Error(`Preço não encontrado para ${symbol}`);
        } catch (error) {
            console.error(`❌ Erro ao obter preço de ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * Limpa cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }

    private getCached(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    private setCached(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}

export default BinanceRealService.getInstance();
