import fs from 'fs';
import path from 'path';

export interface MarketConfig {
    id: string;
    symbol: string;
    name: string;
    tradingType: 'SPOT' | 'FUTURES' | 'MARGIN';
    isActive: boolean;
    quantity: number;
    maxPositions: number;
    description: string;
    baseAsset: string;
    quoteAsset: string;
    minQuantity: number;
    maxQuantity: number;
    pricePrecision: number;
    quantityPrecision: number;
    // Novos campos para informações de trading
    currentPrice?: number;
    minNotional?: number; // Valor mínimo em USDT para ordem
    minOrderAmount?: number; // Quantidade mínima da moeda base
    equivalentAmount?: number; // Quantidade equivalente à aposta mínima
    spreadPips?: number; // Spread em pips
    spreadDollars?: number; // Spread em dólares (negativo)
    pipsToNeutral?: number; // Pips necessários para chegar ao neutro
    pipValue?: number; // Valor de 1 pip em dólares
    createdAt: Date;
    updatedAt: Date;
}

export class MarketService {
    private dataDir: string;
    private marketsFile: string;

    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.marketsFile = path.join(this.dataDir, 'markets.json');
        this.ensureDataDirectory();
    }

    private ensureDataDirectory(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private readMarkets(): MarketConfig[] {
        try {
            if (!fs.existsSync(this.marketsFile)) {
                return [];
            }
            const data = fs.readFileSync(this.marketsFile, 'utf8');
            const markets = JSON.parse(data);
            return markets.map((market: any) => ({
                ...market,
                createdAt: new Date(market.createdAt),
                updatedAt: new Date(market.updatedAt)
            }));
        } catch (error) {
            console.error('❌ Erro ao ler mercados:', error);
            return [];
        }
    }

    private saveMarkets(markets: MarketConfig[]): void {
        try {
            fs.writeFileSync(this.marketsFile, JSON.stringify(markets, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar mercados:', error);
        }
    }

    /**
     * Adiciona um novo mercado
     */
    addMarket(marketData: Omit<MarketConfig, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; market?: MarketConfig; message: string } {
        try {
            const markets = this.readMarkets();

            // Verificar se já existe
            const existingMarket = markets.find(m => m.symbol === marketData.symbol);
            if (existingMarket) {
                return { success: false, message: 'Mercado já existe' };
            }

            const market: MarketConfig = {
                ...marketData,
                id: this.generateId(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            markets.push(market);
            this.saveMarkets(markets);

            console.log(`✅ Mercado adicionado: ${market.symbol} (${market.tradingType})`);
            return { success: true, market, message: 'Mercado adicionado com sucesso' };
        } catch (error: any) {
            console.error('❌ Erro ao adicionar mercado:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Remove um mercado
     */
    removeMarket(marketId: string): { success: boolean; message: string } {
        try {
            const markets = this.readMarkets();
            const marketIndex = markets.findIndex(m => m.id === marketId);

            if (marketIndex === -1) {
                return { success: false, message: 'Mercado não encontrado' };
            }

            const removedMarket = markets.splice(marketIndex, 1)[0];
            this.saveMarkets(markets);

            console.log(`✅ Mercado removido: ${removedMarket.symbol}`);
            return { success: true, message: 'Mercado removido com sucesso' };
        } catch (error: any) {
            console.error('❌ Erro ao remover mercado:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Atualiza um mercado
     */
    updateMarket(marketId: string, updates: Partial<MarketConfig>): { success: boolean; market?: MarketConfig; message: string } {
        try {
            const markets = this.readMarkets();
            const marketIndex = markets.findIndex(m => m.id === marketId);

            if (marketIndex === -1) {
                return { success: false, message: 'Mercado não encontrado' };
            }

            markets[marketIndex] = {
                ...markets[marketIndex],
                ...updates,
                updatedAt: new Date()
            };

            this.saveMarkets(markets);

            console.log(`✅ Mercado atualizado: ${markets[marketIndex].symbol}`);
            return { success: true, market: markets[marketIndex], message: 'Mercado atualizado com sucesso' };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar mercado:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Obtém todos os mercados
     */
    getMarkets(): MarketConfig[] {
        return this.readMarkets();
    }

    /**
     * Obtém mercados ativos
     */
    getActiveMarkets(): MarketConfig[] {
        return this.readMarkets().filter(m => m.isActive);
    }

    /**
     * Obtém um mercado específico
     */
    getMarket(marketId: string): MarketConfig | null {
        const markets = this.readMarkets();
        return markets.find(m => m.id === marketId) || null;
    }

    /**
     * Ativa/desativa um mercado
     */
    toggleMarket(marketId: string): { success: boolean; message: string } {
        try {
            const markets = this.readMarkets();
            const marketIndex = markets.findIndex(m => m.id === marketId);

            if (marketIndex === -1) {
                return { success: false, message: 'Mercado não encontrado' };
            }

            markets[marketIndex].isActive = !markets[marketIndex].isActive;
            markets[marketIndex].updatedAt = new Date();

            this.saveMarkets(markets);

            const status = markets[marketIndex].isActive ? 'ativado' : 'desativado';
            console.log(`✅ Mercado ${status}: ${markets[marketIndex].symbol}`);

            return {
                success: true,
                message: `Mercado ${status} com sucesso`
            };
        } catch (error: any) {
            console.error('❌ Erro ao alternar mercado:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Busca informações de trading dos mercados da Binance
     */
    async getMarketsWithTradingInfo(): Promise<MarketConfig[]> {
        try {
            const markets = this.readMarkets();

            // Retornar mercados sem informações de trading por enquanto
            // TODO: Implementar busca real de preços quando BinanceApiService estiver disponível
            return markets;
        } catch (error) {
            console.error('❌ Erro ao buscar informações de trading:', error);
            return this.readMarkets();
        }
    }

    /**
     * Gera ID único
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

export default MarketService;
