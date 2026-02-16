// Serviço simplificado da Binance para o trigger monitor
import { logger } from './trigger-logger';

export interface BinanceApiCredentials {
    apiKey: string;
    secretKey: string;
    isTestnet: boolean;
}

export class BinanceApiService {
    private apiKey: string;
    private secretKey: string;
    private isTestnet: boolean;
    private baseUrl: string;

    constructor(credentials: BinanceApiCredentials) {
        this.apiKey = credentials.apiKey;
        this.secretKey = credentials.secretKey;
        this.isTestnet = credentials.isTestnet;
        this.baseUrl = this.isTestnet
            ? 'https://testnet.binance.vision/api'
            : 'https://api.binance.com/api';
    }

    async getCurrentPrice(symbol: string): Promise<number | null> {
        try {
            const response = await fetch(`${this.baseUrl}/v3/ticker/price?symbol=${symbol}`);
            if (!response.ok) {
                logger.error(`❌ Erro ao buscar preço para ${symbol}: ${response.status}`);
                return null;
            }

            const data: any = await response.json();
            return parseFloat(data.price);
        } catch (error) {
            logger.error(`❌ Erro ao buscar preço para ${symbol}:`, error);
            return null;
        }
    }

    async marketSell(symbol: string, quantity: number): Promise<any> {
        try {
            logger.info(`🚀 [TRIGGER] Executando venda de ${quantity} ${symbol}...`);

            // Simular venda por enquanto (em produção, implementar assinatura real)
            const mockResult = {
                orderId: Date.now().toString(),
                symbol: symbol,
                side: 'SELL',
                type: 'MARKET',
                quantity: quantity,
                status: 'FILLED',
                fills: [{
                    price: '50000.00', // Preço simulado
                    qty: quantity.toString(),
                    commission: '0.001',
                    commissionAsset: 'USDT'
                }]
            };

            logger.info(`✅ [TRIGGER] Venda executada: ${JSON.stringify(mockResult)}`);
            return mockResult;
        } catch (error) {
            logger.error(`❌ [TRIGGER] Erro ao executar venda:`, error);
            throw error;
        }
    }
}
