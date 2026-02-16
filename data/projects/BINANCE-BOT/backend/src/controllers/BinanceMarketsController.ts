import { Request, Response } from 'express';
import { ConfigLoader } from '../config/ConfigLoader';
import { BinanceApiService } from '../services/BinanceApiService';
import { logger } from '../utils/logger';

export interface BinanceMarket {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
    permissions: string[];
    isSpotTradingAllowed: boolean;
    isMarginTradingAllowed: boolean;
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
    volume: string;
    quoteVolume: string;
    category: string;
    isFavorite: boolean;
}

export class BinanceMarketsController {
    private binanceService: BinanceApiService | null = null;

    constructor() {
        try {
            const configLoader = ConfigLoader.getInstance();
            const config = configLoader.loadConfig();
            const binanceConfig = config.binance;

            const apiKey = binanceConfig.apiKey;
            const secretKey = binanceConfig.secretKey;
            const isTestnet = binanceConfig.useTestnet;

            if (apiKey && secretKey) {
                this.binanceService = new BinanceApiService({
                    apiKey,
                    secretKey,
                    isTestnet
                });
                logger.info('Binance Markets service initialized successfully');
            } else {
                logger.warn('Binance credentials not configured - markets functionality limited');
            }
        } catch (error) {
            logger.warn('Error initializing Binance Markets service:', error);
        }
    }

    /**
     * Get all available markets from Binance with price data
     */
    async getAllMarkets(req: Request, res: Response) {
        try {
            if (!this.binanceService) {
                return res.status(503).json({
                    success: false,
                    message: 'Binance service not available'
                });
            }

            logger.info('Fetching all markets from Binance Testnet...');

            // Get symbols and tickers in parallel
            const [symbolsResponse, tickersResponse] = await Promise.all([
                this.binanceService.getAllSymbols(),
                this.binanceService.getAllTickers()
            ]);

            // Create a map of tickers for quick lookup
            const tickerMap = new Map();
            tickersResponse.forEach(ticker => {
                tickerMap.set(ticker.symbol, ticker);
            });

            // Combine symbol info with ticker data
            const markets: BinanceMarket[] = symbolsResponse.symbols.map(symbol => {
                const ticker = tickerMap.get(symbol.symbol);
                const category = this.categorizeMarket(symbol.symbol, symbol.quoteAsset);

                return {
                    symbol: symbol.symbol,
                    baseAsset: symbol.baseAsset,
                    quoteAsset: symbol.quoteAsset,
                    status: symbol.status,
                    permissions: symbol.permissions,
                    isSpotTradingAllowed: symbol.isSpotTradingAllowed,
                    isMarginTradingAllowed: symbol.isMarginTradingAllowed,
                    lastPrice: ticker?.lastPrice || '0',
                    priceChange: ticker?.priceChange || '0',
                    priceChangePercent: ticker?.priceChangePercent || '0',
                    volume: ticker?.volume || '0',
                    quoteVolume: ticker?.quoteVolume || '0',
                    category,
                    isFavorite: false // Default to false, will be managed by frontend
                };
            });

            // Sort by volume (most traded first)
            markets.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

            logger.info(`Successfully fetched ${markets.length} markets from Binance Testnet`);

            res.json({
                success: true,
                message: `${markets.length} mercados reais da Binance Testnet obtidos`,
                data: markets,
                count: markets.length,
                categories: this.getAvailableCategories(markets),
                timestamp: new Date().toISOString(),
                note: 'Dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error('Failed to get markets:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter mercados da Binance Testnet',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get markets by category
     */
    async getMarketsByCategory(req: Request, res: Response) {
        try {
            const { category } = req.params;

            if (!this.binanceService) {
                return res.status(503).json({
                    success: false,
                    message: 'Binance service not available'
                });
            }

            logger.info(`Fetching ${category} markets from Binance Testnet...`);

            const [symbolsResponse, tickersResponse] = await Promise.all([
                this.binanceService.getAllSymbols(),
                this.binanceService.getAllTickers()
            ]);

            const tickerMap = new Map();
            tickersResponse.forEach(ticker => {
                tickerMap.set(ticker.symbol, ticker);
            });

            const markets: BinanceMarket[] = symbolsResponse.symbols
                .filter(symbol => {
                    const marketCategory = this.categorizeMarket(symbol.symbol, symbol.quoteAsset);
                    return marketCategory.toLowerCase() === category.toLowerCase();
                })
                .map(symbol => {
                    const ticker = tickerMap.get(symbol.symbol);
                    return {
                        symbol: symbol.symbol,
                        baseAsset: symbol.baseAsset,
                        quoteAsset: symbol.quoteAsset,
                        status: symbol.status,
                        permissions: symbol.permissions,
                        isSpotTradingAllowed: symbol.isSpotTradingAllowed,
                        isMarginTradingAllowed: symbol.isMarginTradingAllowed,
                        lastPrice: ticker?.lastPrice || '0',
                        priceChange: ticker?.priceChange || '0',
                        priceChangePercent: ticker?.priceChangePercent || '0',
                        volume: ticker?.volume || '0',
                        quoteVolume: ticker?.quoteVolume || '0',
                        category: this.categorizeMarket(symbol.symbol, symbol.quoteAsset),
                        isFavorite: false
                    };
                });

            markets.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

            res.json({
                success: true,
                message: `${markets.length} mercados ${category} da Binance Testnet obtidos`,
                data: markets,
                count: markets.length,
                category,
                timestamp: new Date().toISOString(),
                note: 'Dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error('Failed to get markets by category:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter mercados por categoria',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Categorize market based on quote asset and symbol patterns
     */
    private categorizeMarket(symbol: string, quoteAsset: string): string {
        // Major stablecoins
        if (['USDT', 'USDC', 'BUSD', 'TUSD', 'USDP'].includes(quoteAsset)) {
            return 'Stablecoins';
        }

        // Bitcoin pairs
        if (quoteAsset === 'BTC') {
            return 'Bitcoin';
        }

        // Ethereum pairs
        if (quoteAsset === 'ETH') {
            return 'Ethereum';
        }

        // BNB pairs
        if (quoteAsset === 'BNB') {
            return 'BNB';
        }

        // Fiat pairs
        if (['EUR', 'GBP', 'USD', 'TRY', 'RUB', 'AUD', 'BRL'].includes(quoteAsset)) {
            return 'Fiat';
        }

        // DeFi tokens (common DeFi quote assets)
        if (['CAKE', 'UNI', 'SUSHI', 'COMP', 'AAVE'].includes(quoteAsset)) {
            return 'DeFi';
        }

        return 'Outros';
    }

    /**
     * Get available categories from markets
     */
    private getAvailableCategories(markets: BinanceMarket[]): string[] {
        const categories = new Set<string>();
        markets.forEach(market => categories.add(market.category));
        return Array.from(categories).sort();
    }

    /**
     * GET /api/v1/binance/markets/favorites
     * Obtém lista de mercados favoritos
     */
    async getFavoriteMarkets(req: Request, res: Response) {
        try {
            // Por enquanto, retorna lista vazia
            // No futuro, pode ser implementado para ler de um arquivo ou banco de dados
            const favorites: string[] = [];

            return res.json({
                success: true,
                favorites,
                count: favorites.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            logger.error('Error getting favorite markets:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}
