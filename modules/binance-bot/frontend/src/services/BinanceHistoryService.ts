/**
 * Serviço de Histórico REAL da Binance Testnet
 * SEM dados do backend - apenas dados reais da Binance
 */
import { API_BASE_URL } from '../config/api';


export interface BinanceHistoryPosition {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    openPrice: number;
    closePrice?: number;
    status: 'OPEN' | 'CLOSED';
    pnl?: number;
    pnlPercentage?: number;
    openTime: string;
    closeTime?: string;
    source: 'binance';
    strategyName: string;
    notes: string;
    realValueInvested: number;
    leverage?: number;
}

export interface BinanceHistoryStats {
    totalPositions: number;
    openPositions: number;
    closedPositions: number;
    winningPositions: number;
    losingPositions: number;
    totalPnl: number;
    totalPnlPercentage: number;
}

export class BinanceHistoryService {
    private static instance: BinanceHistoryService;
    private positions: BinanceHistoryPosition[] = [];
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 30000; // 30 segundos

    static getInstance(): BinanceHistoryService {
        if (!BinanceHistoryService.instance) {
            BinanceHistoryService.instance = new BinanceHistoryService();
        }
        return BinanceHistoryService.instance;
    }

    /**
     * Carrega histórico completo de POSIÇÕES REAIS da Binance Testnet
     * SEM dados simulados - apenas dados REAIS da API da Binance
     */
    async loadHistory(): Promise<BinanceHistoryPosition[]> {
        try {
            console.log('📊 [HISTÓRICO BINANCE] Carregando histórico REAL de POSIÇÕES da Binance Testnet...');

            // Buscar apenas POSIÇÕES REAIS da Binance Testnet
            const futuresPositionsResponse = await fetch(`${API_BASE_URL}/binance/positions`);

            const allPositions: BinanceHistoryPosition[] = [];

            // Processar posições futures REAIS
            if (futuresPositionsResponse.ok) {
                const futuresData = await futuresPositionsResponse.json();
                console.log('📊 [HISTÓRICO BINANCE] Dados de posições recebidos:', futuresData);

                if (futuresData.success && futuresData.data && Object.keys(futuresData.data).length > 0) {
                    // Converter objeto de posições para array
                    const positionsArray = Object.values(futuresData.data);

                    positionsArray.forEach((position: any, index: number) => {
                        const positionAmt = parseFloat(position.positionAmt || '0');
                        const entryPrice = parseFloat(position.entryPrice || '0');
                        const unrealizedPnl = parseFloat(position.unrealizedPnl || '0');

                        // Calcular P&L percentual real
                        const investedValue = Math.abs(positionAmt) * entryPrice;
                        const pnlPercentage = investedValue > 0 ? (unrealizedPnl / investedValue) * 100 : 0;

                        allPositions.push({
                            id: `futures_position_${position.symbol}_${index}`,
                            symbol: position.symbol,
                            side: position.positionSide === 'LONG' ? 'BUY' : 'SELL',
                            quantity: Math.abs(positionAmt),
                            openPrice: entryPrice,
                            closePrice: positionAmt === 0 ? entryPrice : undefined,
                            status: positionAmt === 0 ? 'CLOSED' : 'OPEN',
                            pnl: unrealizedPnl,
                            pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
                            openTime: new Date(position.updateTime || Date.now()).toISOString(),
                            closeTime: positionAmt === 0 ? new Date(position.updateTime || Date.now()).toISOString() : undefined,
                            source: 'binance',
                            strategyName: 'Binance Futures Real',
                            notes: `Posição futures REAL - PnL: ${unrealizedPnl}`,
                            realValueInvested: investedValue,
                            leverage: parseFloat(position.leverage || '1')
                        });
                    });
                    console.log(`✅ [HISTÓRICO BINANCE] ${positionsArray.length} posições futures processadas`);
                } else {
                    console.log('ℹ️ [HISTÓRICO BINANCE] Nenhuma posição ativa encontrada na Binance Testnet');
                }
            }

            // Ordenar por data (mais recente primeiro)
            allPositions.sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());

            this.positions = allPositions;

            console.log(`✅ [HISTÓRICO BINANCE] ${allPositions.length} POSIÇÕES REAIS carregadas da Binance Testnet`);

            return allPositions;

        } catch (error) {
            console.error('❌ [HISTÓRICO BINANCE] Erro ao carregar histórico REAL:', error);

            // Em caso de erro, retornar array vazio (não dados simulados)
            this.positions = [];
            return [];
        }
    }


    /**
     * Obtém estatísticas do histórico
     */
    getStats(): BinanceHistoryStats {
        const totalPositions = this.positions.length;
        const openPositions = this.positions.filter(p => p.status === 'OPEN').length;
        const closedPositions = this.positions.filter(p => p.status === 'CLOSED').length;
        const closedPositionsWithPnL = this.positions.filter(p => p.status === 'CLOSED' && p.pnl !== undefined);

        const winningPositions = closedPositionsWithPnL.filter(p => (p.pnl || 0) > 0).length;
        const losingPositions = closedPositionsWithPnL.filter(p => (p.pnl || 0) < 0).length;

        const totalPnl = closedPositionsWithPnL.reduce((sum, p) => sum + (p.pnl || 0), 0);
        const totalPnlPercentage = closedPositionsWithPnL.length > 0
            ? closedPositionsWithPnL.reduce((sum, p) => sum + (p.pnlPercentage || 0), 0) / closedPositionsWithPnL.length
            : 0;

        return {
            totalPositions,
            openPositions,
            closedPositions,
            winningPositions,
            losingPositions,
            totalPnl,
            totalPnlPercentage
        };
    }

    /**
     * Obtém posições com paginação
     */
    getPositions(page: number = 1, limit: number = 20): {
        positions: BinanceHistoryPosition[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPositions = this.positions.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.positions.length / limit);

        return {
            positions: paginatedPositions,
            pagination: {
                page,
                limit,
                total: this.positions.length,
                totalPages
            }
        };
    }

    /**
     * Filtra posições por status
     */
    filterByStatus(status: 'OPEN' | 'CLOSED' | 'ALL'): BinanceHistoryPosition[] {
        if (status === 'ALL') return this.positions;
        return this.positions.filter(p => p.status === status);
    }

    /**
     * Filtra posições por símbolo
     */
    filterBySymbol(symbol: string): BinanceHistoryPosition[] {
        return this.positions.filter(p =>
            p.symbol.toLowerCase().includes(symbol.toLowerCase())
        );
    }

    /**
     * Atualiza posições em tempo real
     */
    async refreshPositions(): Promise<void> {
        await this.loadHistory();
    }

    /**
     * Limpa cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🗑️ [HISTÓRICO BINANCE] Cache limpo');
    }

    /**
     * Obtém posições ativas
     */
    getActivePositions(): BinanceHistoryPosition[] {
        return this.positions.filter(p => p.status === 'OPEN');
    }

    /**
     * Obtém posições fechadas
     */
    getClosedPositions(): BinanceHistoryPosition[] {
        return this.positions.filter(p => p.status === 'CLOSED');
    }
}

export default BinanceHistoryService.getInstance();
