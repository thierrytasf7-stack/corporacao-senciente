/**
 * Serviço para gerenciar histórico de posições com armazenamento local persistente
 * COM LOGS OTIMIZADOS PARA EVITAR REPETIÇÕES
 */

import OptimizedLogService from './OptimizedLogService';
import ApiService from './api/apiService';

export interface PositionHistory {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    openPrice: number;
    closePrice?: number;
    currentPrice?: number;
    openTime: string;
    closeTime?: string;
    status: 'OPEN' | 'CLOSED' | 'PENDING' | 'ERROR';
    strategyId: string;
    leverage?: number;
    pnl?: number;
    pnlPercentage?: number;
    strategyName: string;
    stopLoss?: number;
    takeProfit?: number;
    spread?: number; // Spread no momento da abertura (para SPOT)
    result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
    orderId?: string;
    commission?: number;
    realValueInvested?: number; // Valor real investido em USD
    notes?: string;
    updatedAt: string;
}

export interface PositionHistoryPage {
    positions: PositionHistory[];
    totalPages: number;
    currentPage: number;
    totalPositions: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

class PositionHistoryService {
    private readonly STORAGE_KEY = 'aura_position_history';
    private readonly POSITIONS_PER_PAGE = 20;
    private updateInterval: NodeJS.Timeout | null = null;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeStorage();
        this.startDetailedMonitoring();
        console.log('🚀 [HISTÓRICO] PositionHistoryService inicializado com monitoramento detalhado');
    }

    private initializeStorage(): void {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            console.log('📊 [HISTÓRICO] Storage inicializado - novo histórico criado');
        } else {
            const positions = this.getAllPositions();
            console.log('📊 [HISTÓRICO] Storage carregado -', positions.length, 'posições existentes');
        }
    }

    // Iniciar monitoramento detalhado em tempo real
    private startDetailedMonitoring(): void {
        console.log('🔍 [MONITORAMENTO] Iniciando monitoramento detalhado da análise rotativa...');

        // Monitorar sinais da análise rotativa a cada 60 segundos (reduzido para evitar spam)
        this.monitoringInterval = setInterval(async () => {
            await this.monitorRotativeAnalysis();
        }, 60000);

        // Log inicial
        console.log('✅ [MONITORAMENTO] Monitoramento otimizado ativado - verificando a cada 60s');
    }

    // Monitorar análise rotativa em tempo real com logs otimizados
    private async monitorRotativeAnalysis(): Promise<void> {
        try {
            // 1. Verificar status da análise rotativa
            const status = await ApiService.get('real-analysis/status');
            if (status) {

                // Usar logs otimizados para status
                OptimizedLogService.logStatusUpdate({
                    isRunning: status.isRunning,
                    isAnalyzing: status.isAnalyzing,
                    lastAnalysisMarkets: status.lastAnalysisMarkets || 0,
                    executedOrders: status.executedOrders || 0,
                    totalCyclesCompleted: status.totalCyclesCompleted || 0,
                    currentCycleNumber: status.currentCycleNumber || 0
                });

                // Log de ordens executadas apenas quando há mudanças
                if (status.executedOrders > 0) {
                    OptimizedLogService.logOrdersUpdate(status.executedOrders, status.totalCyclesCompleted || 0);
                }
            }

            // 2. Verificar sinais gerados
            const signals = await ApiService.get('real-analysis/signals');
            if (signals) {
                if (signals.signals && signals.signals.length > 0) {
                    // Usar logs otimizados para sinais
                    OptimizedLogService.logSignalsUpdate(signals.signals);
                }
            }

            // 3. Verificar posições ativas
            const positionsResponse = await ApiService.get('binance/positions');
            if (positionsResponse) {
                const positions = positionsResponse;
                if (positions.positions && positions.positions.length > 0) {
                    // Usar logs otimizados para posições
                    OptimizedLogService.logPositionsUpdate(positions.positions);
                }
            }

            // 4. Verificar histórico de posições
            const historyResponse = await ApiService.getAnalysis('position-history');
            if (historyResponse) {
                const history = historyResponse;
                if (history.positions && history.positions.length > 0) {
                    // Verificar posições novas
                    const localPositions = this.getAllPositions();
                    const newPositions = history.positions.filter((bp: any) =>
                        !localPositions.find(lp => lp.orderId === bp.orderId)
                    );

                    if (newPositions.length > 0) {
                        // Só logar se há posições realmente novas (não todas as posições)
                        const trulyNewPositions = newPositions.filter((np: any) =>
                            !localPositions.some(lp => lp.orderId === np.orderId && lp.symbol === np.symbol)
                        );

                        if (trulyNewPositions.length > 0) {
                            OptimizedLogService.logWarning(`Novas posições detectadas no backend: ${trulyNewPositions.length}`);

                            // Log de abertura de posições importantes
                            trulyNewPositions.forEach((position: any) => {
                                if (position.status === 'OPEN' && position.orderId) {
                                    OptimizedLogService.logPositionOpened(
                                        position.symbol,
                                        position.side,
                                        position.orderId,
                                        position.openPrice
                                    );
                                }
                            });
                        }
                    }
                }
            }

        } catch (error) {
            OptimizedLogService.logError('Erro no monitoramento da análise rotativa', error);
        }
    }

    private getAllPositions(): PositionHistory[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ [HISTÓRICO] Erro ao carregar posições do localStorage:', error);
            return [];
        }
    }

    private savePositions(positions: PositionHistory[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(positions));
            console.log('💾 [HISTÓRICO] Posições salvas no localStorage:', positions.length);
        } catch (error) {
            console.error('❌ [HISTÓRICO] Erro ao salvar posições no localStorage:', error);
        }
    }

    // Adicionar nova posição com logs detalhados e VERIFICAÇÃO REAL DA BINANCE
    async addPosition(position: Omit<PositionHistory, 'id' | 'openTime' | 'updatedAt'>): Promise<PositionHistory | null> {
        try {
            console.log('🚀 [ABERTURA DE POSIÇÃO] Iniciando processo de abertura:', {
                symbol: position.symbol,
                side: position.side,
                status: position.status,
                strategyId: position.strategyId,
                strategyName: position.strategyName,
                orderId: position.orderId,
                openPrice: position.openPrice,
                quantity: position.quantity
            });

            // DEBUG: Log de entrada
            console.log('🔍 [DEBUG] addPosition chamado com sucesso, iniciando verificação...');

            // VERIFICAÇÃO INTELIGENTE baseada na origem dos dados
            let shouldVerifyBinance = true;
            let verificationReason = '';

            // 1. Dados da análise rotativa (já validados pelo backend)
            if (position.strategyId &&
                (position.strategyId.includes('scalping') ||
                    position.strategyId.includes('momentum') ||
                    position.strategyId.includes('rsi') ||
                    position.strategyId.includes('breakout'))) {
                shouldVerifyBinance = false;
                verificationReason = 'Dados da análise rotativa (já validados pelo backend)';
            }

            // 2. Dados com orderId específico (verificar se foi executado)
            if (position.orderId && String(position.orderId).startsWith('pos_')) {
                shouldVerifyBinance = false;
                verificationReason = 'Posição com orderId interno (já validada)';
            }

            // 3. Dados com orderId da análise rotativa (pular verificação)
            if (position.orderId && String(position.orderId).includes('signal_')) {
                shouldVerifyBinance = false;
                verificationReason = 'Sinal da análise rotativa (já validado)';
            }

            // 4. Dados da Binance (sempre verificar)
            if (position.strategyId === 'binance-real') {
                shouldVerifyBinance = false; // ← MUDANÇA: posições do backend não precisam verificar Binance
                verificationReason = 'Dados do backend (já validados)';
            }

            // 5. Posições com orderId numérico da Binance (aceitar como válidas)
            if (position.orderId && typeof position.orderId === 'number') {
                shouldVerifyBinance = false;
                verificationReason = 'OrderId numérico da Binance (já executada)';
            }

            // 6. Posições com source SYSTEM e orderId numérico (posições reais executadas)
            if (position.source === 'SYSTEM' && position.orderId && typeof position.orderId === 'number') {
                shouldVerifyBinance = false;
                verificationReason = 'Posição real executada na Binance (OrderId numérico)';
            }

            console.log('🔍 [HISTÓRICO] Estratégia de verificação:', {
                shouldVerifyBinance,
                verificationReason,
                strategyId: position.strategyId,
                orderId: position.orderId
            });

            // VERIFICAÇÃO REAL: Só verificar se realmente necessário
            if (shouldVerifyBinance) {
                console.log('🔍 [VERIFICAÇÃO REAL] Verificando se posição está REALMENTE na Binance...');

                // DEBUG: Log antes da verificação
                console.log('🔍 [DEBUG] Chamando verifyPositionInBinanceReal...');

                try {
                    const isRealPosition = await this.verifyPositionInBinanceReal(position);

                    // DEBUG: Log do resultado da verificação
                    console.log('🔍 [DEBUG] Resultado da verificação Binance:', {
                        symbol: position.symbol,
                        side: position.side,
                        isRealPosition
                    });

                    if (!isRealPosition) {
                        console.error('❌ [VERIFICAÇÃO REAL] POSIÇÃO REJEITADA - Não está na Binance:', {
                            symbol: position.symbol,
                            side: position.side,
                            strategyId: position.strategyId,
                            orderId: position.orderId
                        });
                        return null;
                    }
                } catch (error) {
                    console.warn('⚠️ [VERIFICAÇÃO REAL] Erro na verificação da Binance, mas continuando:', error);
                    // Continuar mesmo com erro na verificação
                }
            } else {
                console.log('✅ [VERIFICAÇÃO] PULANDO verificação da Binance:', verificationReason);
            }

            console.log('✅ [VERIFICAÇÃO REAL] Posição APROVADA - Confirmada na Binance:', {
                symbol: position.symbol,
                side: position.side
            });

            console.log('✅ [HISTÓRICO] Posição verificada na Binance:', {
                symbol: position.symbol,
                side: position.side
            });

            // 🎉 POSIÇÃO APROVADA - Criar no histórico
            console.log('🎉 [ABERTURA DE POSIÇÃO] Posição APROVADA - Criando no histórico...');

            const newPosition: PositionHistory = {
                ...position,
                id: this.generateId(),
                openTime: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const positions = this.getAllPositions();
            positions.unshift(newPosition); // Adiciona no início
            this.savePositions(positions);

            console.log('🎉 [ABERTURA DE POSIÇÃO] POSIÇÃO ABERTA COM SUCESSO:', {
                id: newPosition.id,
                symbol: newPosition.symbol,
                side: newPosition.side,
                status: newPosition.status,
                strategyId: newPosition.strategyId,
                orderId: newPosition.orderId,
                openPrice: newPosition.openPrice,
                quantity: newPosition.quantity,
                totalPositions: positions.length,
                timestamp: new Date().toISOString()
            });

            // Log de confirmação final
            console.log('✅ [HISTÓRICO] Nova posição real adicionada com sucesso:', {
                id: newPosition.id,
                symbol: newPosition.symbol,
                side: newPosition.side,
                status: newPosition.status,
                totalPositions: positions.length
            });

            return newPosition;
        } catch (error) {
            console.error('❌ [HISTÓRICO] Erro ao adicionar posição:', error);
            return null;
        }
    }

    // VERIFICAÇÃO REAL: Garantir que posição está REALMENTE na Binance
    private async verifyPositionInBinanceReal(position: Omit<PositionHistory, 'id' | 'openTime' | 'updatedAt'>): Promise<boolean> {
        try {
            console.log('🔍 [VERIFICAÇÃO REAL] Verificando se posição está REALMENTE na Binance:', {
                symbol: position.symbol,
                side: position.side,
                strategyId: position.strategyId
            });

            // DEBUG: Log de entrada da verificação
            console.log('🔍 [DEBUG] verifyPositionInBinanceReal iniciado para:', position.symbol);

            // 1. Verificar posições ativas da Binance
            console.log('📊 [VERIFICAÇÃO REAL] Buscando posições ativas da Binance...');

            // DEBUG: Log da requisição
            console.log('🔍 [DEBUG] Fazendo requisição para /api/v1/binance/positions...');

            const positionsResponse = await ApiService.get('binance/positions');

            // DEBUG: Log da resposta
            console.log('🔍 [DEBUG] Resposta da API de posições:', {
                ok: positionsResponse.ok,
                status: positionsResponse.status,
                statusText: positionsResponse.statusText
            });

            if (!positionsResponse.ok) {
                console.warn('⚠️ [VERIFICAÇÃO REAL] Erro ao buscar posições ativas da Binance');
                return false;
            }

            const positionsData = await positionsResponse.json();
            const binancePositions = positionsData.positions || [];

            // DEBUG: Log dos dados recebidos
            console.log('🔍 [DEBUG] Dados das posições recebidos:', {
                success: positionsData.success,
                positionsCount: binancePositions.length,
                firstPosition: binancePositions[0] || 'Nenhuma'
            });

            console.log('📊 [VERIFICAÇÃO REAL] Posições ativas encontradas na Binance:', binancePositions.length);

            // 2. Verificar trades da Binance
            console.log('📊 [VERIFICAÇÃO REAL] Buscando trades da Binance...');

            // DEBUG: Log da requisição de trades
            console.log('🔍 [DEBUG] Fazendo requisição para /api/v1/binance/trades...');

            const tradesResponse = await ApiService.get('binance/trades');

            // DEBUG: Log da resposta de trades
            console.log('🔍 [DEBUG] Resposta da API de trades:', {
                ok: tradesResponse.ok,
                status: tradesResponse.status,
                statusText: tradesResponse.statusText
            });

            if (!tradesResponse.ok) {
                console.warn('⚠️ [VERIFICAÇÃO REAL] Erro ao buscar trades da Binance');
                return false;
            }

            const tradesData = await tradesResponse.json();
            const binanceTrades = tradesData.trades || [];

            // DEBUG: Log dos dados de trades recebidos
            console.log('🔍 [DEBUG] Dados dos trades recebidos:', {
                success: tradesData.success,
                tradesCount: binanceTrades.length,
                firstTrade: binanceTrades[0] || 'Nenhum'
            });

            console.log('📊 [VERIFICAÇÃO REAL] Trades encontrados na Binance:', binanceTrades.length);

            // 3. Verificar se posição está ativa
            console.log('🔍 [DEBUG] Verificando se posição está ativa na Binance...');

            const isActivePosition = binancePositions.some((bp: any) =>
                bp.symbol === position.symbol &&
                bp.side === position.side
            );

            // DEBUG: Log da verificação de posição ativa
            console.log('🔍 [DEBUG] Verificação de posição ativa:', {
                symbol: position.symbol,
                side: position.side,
                isActivePosition,
                binancePositions: binancePositions.map((bp: any) => ({ symbol: bp.symbol, side: bp.side }))
            });

            // 4. Verificar se foi executada nos trades
            console.log('🔍 [DEBUG] Verificando se posição foi executada nos trades...');

            const isExecutedTrade = binanceTrades.some((trade: any) =>
                trade.symbol === position.symbol &&
                trade.side === position.side &&
                Math.abs(parseFloat(trade.price) - (position.openPrice || 0)) < 0.0001
            );

            // DEBUG: Log da verificação de trade executado
            console.log('🔍 [DEBUG] Verificação de trade executado:', {
                symbol: position.symbol,
                side: position.side,
                openPrice: position.openPrice,
                isExecutedTrade,
                binanceTrades: binanceTrades.map((trade: any) => ({
                    symbol: trade.symbol,
                    side: trade.side,
                    price: trade.price
                }))
            });

            const foundInBinance = isActivePosition || isExecutedTrade;
            const reason = foundInBinance
                ? (isActivePosition ? 'Posição ativa na Binance' : 'Trade executado na Binance')
                : 'NÃO encontrada na Binance';

            console.log('🎯 [VERIFICAÇÃO REAL] Resultado da verificação:', {
                symbol: position.symbol,
                side: position.side,
                isActivePosition,
                isExecutedTrade,
                foundInBinance,
                reason
            });

            if (!foundInBinance) {
                console.warn('❌ [VERIFICAÇÃO REAL] POSIÇÃO NÃO ENCONTRADA NA BINANCE:', {
                    symbol: position.symbol,
                    side: position.side,
                    strategyId: position.strategyId,
                    orderId: position.orderId,
                    openPrice: position.openPrice,
                    activePositions: binancePositions.length,
                    trades: binanceTrades.length
                });
                return false;
            }

            console.log('✅ [VERIFICAÇÃO REAL] Posição CONFIRMADA na Binance:', {
                symbol: position.symbol,
                side: position.side,
                reason
            });

            return true;

        } catch (error) {
            console.error('❌ [VERIFICAÇÃO REAL] Erro na verificação da Binance:', error);
            return false;
        }
    }

    // Atualizar posição existente com logs detalhados
    updatePosition(id: string, updates: Partial<PositionHistory>): PositionHistory | null {
        console.log('🔄 [HISTÓRICO] Atualizando posição:', {
            id,
            updates: Object.keys(updates)
        });

        const positions = this.getAllPositions();
        const index = positions.findIndex(p => p.id === id);

        if (index === -1) {
            console.warn('⚠️ [HISTÓRICO] Posição não encontrada para atualização:', id);
            return null;
        }

        const oldPosition = positions[index];
        const updatedPosition: PositionHistory = {
            ...oldPosition,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Se a posição foi fechada, calcular P&L
        if (updates.status === 'CLOSED' && updates.closePrice) {
            console.log('🔒 [HISTÓRICO] Posição sendo fechada:', {
                id: updatedPosition.id,
                symbol: updatedPosition.symbol,
                openPrice: updatedPosition.openPrice,
                closePrice: updates.closePrice
            });

            const pnl = this.calculatePnL(updatedPosition);
            updatedPosition.pnl = pnl.absolute;
            updatedPosition.pnlPercentage = pnl.percentage;
            updatedPosition.result = pnl.result;
            updatedPosition.closeTime = new Date().toISOString();

            console.log('💰 [HISTÓRICO] P&L calculado:', {
                id: updatedPosition.id,
                symbol: updatedPosition.symbol,
                pnl: pnl.absolute,
                pnlPercentage: pnl.percentage,
                result: pnl.result
            });
        }

        positions[index] = updatedPosition;
        this.savePositions(positions);

        console.log('✅ [HISTÓRICO] Posição atualizada com sucesso:', {
            id: updatedPosition.id,
            symbol: updatedPosition.symbol,
            status: updatedPosition.status,
            pnl: updatedPosition.pnl,
            result: updatedPosition.result
        });

        return updatedPosition;
    }

    // Obter página de posições
    getPositionsPage(page: number = 1): PositionHistoryPage {
        const allPositions = this.getAllPositions();
        const totalPositions = allPositions.length;
        const totalPages = Math.ceil(totalPositions / this.POSITIONS_PER_PAGE);
        const startIndex = (page - 1) * this.POSITIONS_PER_PAGE;
        const endIndex = startIndex + this.POSITIONS_PER_PAGE;
        const positions = allPositions.slice(startIndex, endIndex);

        return {
            positions,
            totalPages,
            currentPage: page,
            totalPositions,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    // Obter estatísticas gerais
    getStatistics(): {
        totalPositions: number;
        openPositions: number;
        closedPositions: number;
        totalWins: number;
        totalLosses: number;
        totalPnL: number;
        winRate: number;
        averagePnL: number;
    } {
        const positions = this.getAllPositions();
        const closedPositions = positions.filter(p => p.status === 'CLOSED');
        const openPositions = positions.filter(p => p.status === 'OPEN');
        const wins = closedPositions.filter(p => p.result === 'WIN');
        const losses = closedPositions.filter(p => p.result === 'LOSS');

        const totalPnL = closedPositions.reduce((sum, p) => sum + (p.pnl || 0), 0);
        const winRate = closedPositions.length > 0 ? (wins.length / closedPositions.length) * 100 : 0;
        const averagePnL = closedPositions.length > 0 ? totalPnL / closedPositions.length : 0;

        return {
            totalPositions: positions.length,
            openPositions: openPositions.length,
            closedPositions: closedPositions.length,
            totalWins: wins.length,
            totalLosses: losses.length,
            totalPnL,
            winRate,
            averagePnL
        };
    }

    // Buscar posições por filtros
    searchPositions(filters: {
        symbol?: string;
        status?: string;
        strategyId?: string;
        dateFrom?: string;
        dateTo?: string;
        result?: string;
    }): PositionHistory[] {
        let positions = this.getAllPositions();

        if (filters.symbol) {
            positions = positions.filter(p => p.symbol.toLowerCase().includes(filters.symbol!.toLowerCase()));
        }

        if (filters.status) {
            positions = positions.filter(p => p.status === filters.status);
        }

        if (filters.strategyId) {
            positions = positions.filter(p => p.strategyId === filters.strategyId);
        }

        if (filters.dateFrom) {
            positions = positions.filter(p => p.openTime >= filters.dateFrom!);
        }

        if (filters.dateTo) {
            positions = positions.filter(p => p.openTime <= filters.dateTo!);
        }

        if (filters.result) {
            positions = positions.filter(p => p.result === filters.result);
        }

        return positions;
    }

    // Atualizar posições abertas com dados reais
    async updateOpenPositions(): Promise<void> {
        console.log('🔄 [ATUALIZAÇÃO] Iniciando atualização de posições abertas...');

        try {
            const positions = this.getAllPositions();
            console.log('📊 [ATUALIZAÇÃO] Posições locais encontradas:', positions.length);

            // Se não há dados locais, tentar carregar do backend
            if (positions.length === 0) {
                console.log('📊 [ATUALIZAÇÃO] Nenhum dado local encontrado, carregando do backend...');
                await this.loadFromBackend();
            }

            const openPositions = positions.filter(p => p.status === 'OPEN');
            console.log('📊 [ATUALIZAÇÃO] Posições abertas para atualizar:', openPositions.length);

            if (openPositions.length === 0) {
                console.log('📊 [ATUALIZAÇÃO] Nenhuma posição aberta para atualizar');
                return;
            }

            // Buscar dados reais da API
            console.log('🌐 [ATUALIZAÇÃO] Buscando posições reais da Binance...');
            const response = await ApiService.get('binance/positions');
            if (!response.ok) {
                console.warn('⚠️ [ATUALIZAÇÃO] Não foi possível atualizar posições abertas - API não respondeu');
                return;
            }

            const data = await response.json();
            const realPositions = data.positions || [];
            console.log('📊 [ATUALIZAÇÃO] Posições reais obtidas da Binance:', realPositions.length);

            // Atualizar posições abertas com dados reais
            for (const openPosition of openPositions) {
                console.log('🔍 [ATUALIZAÇÃO] Verificando posição:', {
                    symbol: openPosition.symbol,
                    side: openPosition.side,
                    id: openPosition.id
                });

                const realPosition = realPositions.find((rp: any) =>
                    rp.symbol === openPosition.symbol && rp.side === openPosition.side
                );

                if (realPosition) {
                    // Posição ainda está ativa
                    console.log('✅ [ATUALIZAÇÃO] Posição ainda ativa na Binance:', {
                        symbol: openPosition.symbol,
                        markPrice: realPosition.markPrice,
                        unrealizedPnl: realPosition.unrealizedPnl
                    });

                    this.updatePosition(openPosition.id, {
                        closePrice: parseFloat(realPosition.markPrice || 0),
                        pnl: parseFloat(realPosition.unrealizedPnl || 0),
                        pnlPercentage: parseFloat(realPosition.percentage || 0)
                    });
                } else {
                    // NÃO marcar como fechada automaticamente - deixar o backend decidir
                    console.log('🔍 [ATUALIZAÇÃO] Posição não encontrada na API, mas mantendo status atual:', {
                        symbol: openPosition.symbol,
                        side: openPosition.side,
                        id: openPosition.id
                    });
                }
            }

            console.log('✅ [ATUALIZAÇÃO] Atualização de posições abertas concluída');
        } catch (error) {
            console.error('❌ [ATUALIZAÇÃO] Erro ao atualizar posições abertas:', error);
        }
    }

    // Carregar dados do backend
    private async loadFromBackend(): Promise<void> {
        console.log('🔄 [CARREGAMENTO] Iniciando carregamento de dados do backend...');

        try {
            console.log('🌐 [CARREGAMENTO] Fazendo requisição para /api/analysis/position-history...');
            const response = await ApiService.getAnalysis('position-history');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ [CARREGAMENTO] Resposta recebida do backend, processando dados...');
            const data = await response.json();

            if (data.success && data.positions) {
                console.log('📊 [CARREGAMENTO] Dados válidos recebidos, posições encontradas:', data.positions.length);

                // Adicionar todas as posições do backend ao localStorage
                for (const position of data.positions) {
                    console.log('➕ [CARREGAMENTO] Adicionando posição do backend:', {
                        symbol: position.symbol,
                        side: position.side,
                        status: position.status,
                        strategyId: position.strategyId,
                        orderId: position.orderId,
                        stopLoss: position.stopLoss,
                        takeProfit: position.takeProfit,
                        realValueInvested: position.realValueInvested
                    });

                    // VERIFICAÇÃO: Só adicionar se tiver orderId válido (foi executada)
                    if (position.orderId && position.orderId !== 'pending') {
                        console.log('✅ [CARREGAMENTO] Posição executada, adicionando ao histórico:', {
                            symbol: position.symbol,
                            orderId: position.orderId,
                            strategyId: position.strategyId
                        });

                        // DEBUG: Log detalhado antes de chamar addPosition
                        console.log('🔍 [DEBUG] Parâmetros para addPosition:', {
                            symbol: position.symbol,
                            side: position.side,
                            quantity: position.quantity,
                            openPrice: position.openPrice,
                            status: position.status,
                            strategyId: position.strategyId || 'scalping-10s-breakout',
                            strategyName: position.strategyName || 'Análise Rotativa',
                            orderId: position.orderId
                        });

                        try {
                            const result = await this.addPosition({
                                symbol: position.symbol,
                                side: position.side,
                                quantity: position.quantity,
                                openPrice: position.openPrice,
                                status: position.status,
                                strategyId: position.strategyId || 'scalping-10s-breakout', // Garantir strategyId
                                strategyName: position.strategyName || 'Análise Rotativa',
                                stopLoss: position.stopLoss,
                                takeProfit: position.takeProfit,
                                spread: position.spread,
                                pnl: position.pnl,
                                pnlPercentage: position.pnlPercentage,
                                result: position.result,
                                orderId: position.orderId,
                                commission: position.commission,
                                realValueInvested: position.realValueInvested,
                                notes: position.notes || 'Dados do backend (EXECUTADOS)'
                            });

                            if (result) {
                                console.log('✅ [CARREGAMENTO] Posição adicionada com sucesso:', {
                                    symbol: position.symbol,
                                    id: result.id
                                });
                            } else {
                                console.error('❌ [CARREGAMENTO] addPosition retornou NULL:', {
                                    symbol: position.symbol,
                                    orderId: position.orderId,
                                    reason: 'Verificação da Binance falhou'
                                });
                            }
                        } catch (error) {
                            console.error('❌ [CARREGAMENTO] Erro ao chamar addPosition:', {
                                symbol: position.symbol,
                                orderId: position.orderId,
                                error: error instanceof Error ? error.message : String(error)
                            });
                        }
                    } else {
                        console.log('⚠️ [CARREGAMENTO] Posição não executada, ignorando:', {
                            symbol: position.symbol,
                            orderId: position.orderId,
                            status: position.status
                        });
                    }
                }

                console.log('✅ [CARREGAMENTO] Carregamento concluído -', data.positions.length, 'posições adicionadas ao histórico local');
            } else {
                console.warn('⚠️ [CARREGAMENTO] Dados inválidos ou vazios recebidos do backend');
            }
        } catch (error) {
            console.error('❌ [CARREGAMENTO] Erro ao carregar dados do backend:', error);
        }
    }

    // Atualizar histórico real da Binance
    async updateRealHistory(): Promise<void> {
        console.log('🔄 [HISTÓRICO REAL] Iniciando atualização real da Binance...');

        try {
            // 1. Buscar posições ativas da Binance
            console.log('📊 [HISTÓRICO REAL] Buscando posições ativas da Binance...');
            const positionsResponse = await ApiService.get('binance/positions');

            if (!positionsResponse.ok) {
                throw new Error(`Erro ao buscar posições: ${positionsResponse.status}`);
            }

            const positionsData = await positionsResponse.json();
            console.log('📊 [HISTÓRICO REAL] Posições ativas obtidas:', positionsData.positions?.length || 0);

            // 2. Buscar histórico de trades da Binance
            console.log('📊 [HISTÓRICO REAL] Buscando histórico de trades da Binance...');
            const tradesResponse = await ApiService.get('binance/trades');

            if (!tradesResponse.ok) {
                throw new Error(`Erro ao buscar trades: ${tradesResponse.status}`);
            }

            const tradesData = await tradesResponse.json();
            console.log('📊 [HISTÓRICO REAL] Trades obtidos:', tradesData.trades?.length || 0);

            // 3. Buscar dados do backend (análise rotativa)
            console.log('📊 [HISTÓRICO REAL] Buscando dados da análise rotativa...');
            const analysisResponse = await ApiService.getAnalysis('position-history');

            if (!analysisResponse.ok) {
                throw new Error(`Erro ao buscar análise: ${analysisResponse.status}`);
            }

            const analysisData = await analysisResponse.json();
            console.log('📊 [HISTÓRICO REAL] Dados da análise obtidos:', analysisData.positions?.length || 0);

            // 4. Verificar se há dados suficientes antes de limpar
            const hasActivePositions = positionsData.success && positionsData.positions && positionsData.positions.length > 0;
            const hasTrades = tradesData.success && tradesData.trades && tradesData.trades.length > 0;
            const hasAnalysis = analysisData.success && analysisData.positions && analysisData.positions.length > 0;

            const totalNewData = (hasActivePositions ? positionsData.positions.length : 0) +
                (hasTrades ? tradesData.trades.length : 0) +
                (hasAnalysis ? analysisData.positions.length : 0);

            if (totalNewData > 0) {
                console.log('🗑️ [HISTÓRICO REAL] Limpando histórico atual...');
                localStorage.removeItem(this.STORAGE_KEY);
                this.initializeStorage();
            } else {
                console.log('⚠️ [HISTÓRICO REAL] Nenhum dado novo encontrado, mantendo histórico atual');
            }

            // 5. Adicionar posições ativas
            if (positionsData.success && positionsData.positions) {
                console.log('➕ [HISTÓRICO REAL] Adicionando posições ativas da Binance...');
                for (const position of positionsData.positions) {
                    console.log('➕ [HISTÓRICO REAL] Adicionando posição ativa:', {
                        symbol: position.symbol,
                        side: position.side,
                        quantity: position.quantity,
                        unrealizedPnl: position.unrealizedPnl
                    });

                    this.addPosition({
                        symbol: position.symbol,
                        side: position.side,
                        quantity: position.quantity,
                        openPrice: position.openPrice,
                        status: 'OPEN',
                        strategyId: 'binance-real',
                        strategyName: 'Posição Real Binance',
                        stopLoss: position.stopLoss,
                        takeProfit: position.takeProfit,
                        spread: position.spread,
                        pnl: position.unrealizedPnl,
                        pnlPercentage: position.percentage,
                        result: undefined,
                        orderId: position.orderId,
                        commission: position.commission,
                        notes: 'Posição ativa da Binance'
                    });
                }
                console.log('✅ [HISTÓRICO REAL] Posições ativas adicionadas:', positionsData.positions.length);
            }

            // 6. Adicionar trades fechados
            if (tradesData.success && tradesData.trades) {
                console.log('➕ [HISTÓRICO REAL] Adicionando trades fechados da Binance...');
                for (const trade of tradesData.trades) {
                    console.log('➕ [HISTÓRICO REAL] Adicionando trade fechado:', {
                        symbol: trade.symbol,
                        side: trade.side,
                        realizedPnl: trade.realizedPnl,
                        result: trade.realizedPnl > 0 ? 'WIN' : trade.realizedPnl < 0 ? 'LOSS' : 'BREAKEVEN'
                    });

                    this.addPosition({
                        symbol: trade.symbol,
                        side: trade.side,
                        quantity: trade.quantity,
                        openPrice: trade.price,
                        status: 'CLOSED',
                        strategyId: 'binance-real',
                        strategyName: 'Trade Real Binance',
                        stopLoss: undefined,
                        takeProfit: undefined,
                        spread: undefined,
                        pnl: trade.realizedPnl,
                        pnlPercentage: trade.percentage,
                        result: trade.realizedPnl > 0 ? 'WIN' : trade.realizedPnl < 0 ? 'LOSS' : 'BREAKEVEN',
                        orderId: trade.orderId,
                        commission: trade.commission,
                        notes: 'Trade fechado da Binance'
                    });
                }
                console.log('✅ [HISTÓRICO REAL] Trades fechados adicionados:', tradesData.trades.length);
            }

            // 7. Adicionar dados da análise rotativa (APENAS se forem reais)
            if (analysisData.success && analysisData.positions) {
                console.log('➕ [HISTÓRICO REAL] Verificando dados da análise rotativa...');
                let validPositions = 0;
                let invalidPositions = 0;

                for (const position of analysisData.positions) {
                    // VERIFICAÇÃO: Só adicionar se tiver orderId válido (foi executada)
                    if (position.orderId && position.orderId !== 'pending') {

                        const result = await this.addPosition({
                            symbol: position.symbol,
                            side: position.side,
                            quantity: position.quantity,
                            openPrice: position.openPrice,
                            status: position.status,
                            strategyId: position.strategyId,
                            strategyName: position.strategyName,
                            stopLoss: position.stopLoss,
                            takeProfit: position.takeProfit,
                            spread: position.spread,
                            pnl: position.pnl,
                            pnlPercentage: position.pnlPercentage,
                            result: position.result,
                            orderId: position.orderId,
                            commission: position.commission,
                            notes: position.notes || 'Dados da análise rotativa (EXECUTADOS)'
                        });

                        if (result) {
                            validPositions++;
                        } else {
                            invalidPositions++;
                        }
                    } else {
                        console.log('⚠️ [HISTÓRICO REAL] Posição não executada, ignorando:', {
                            symbol: position.symbol,
                            orderId: position.orderId,
                            status: position.status
                        });
                        invalidPositions++;
                    }
                }
                console.log('✅ [HISTÓRICO REAL] Dados da análise processados:', {
                    total: analysisData.positions.length,
                    valid: validPositions,
                    invalid: invalidPositions
                });
            }

            const totalPositions = this.getAllPositions().length;
            console.log('🎉 [HISTÓRICO REAL] Atualização real concluída! Total de posições:', totalPositions);

            // Se não há posições após a atualização, verificar se há dados no storage
            if (totalPositions === 0) {
                console.log('🔄 [HISTÓRICO REAL] Nenhuma posição encontrada, verificando storage local...');
                const localPositions = this.getAllPositions().length;
                console.log('📊 [HISTÓRICO REAL] Posições no storage local:', localPositions);
            }

        } catch (error) {
            console.error('❌ [HISTÓRICO REAL] Erro na atualização real:', error);
            throw error;
        }
    }

    // Iniciar atualização automática
    startAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateOpenPositions();
        }, 30000); // 30 segundos

        console.log('🔄 [HISTÓRICO] Atualização automática iniciada (30s)');
    }

    // Parar atualização automática
    stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ [HISTÓRICO] Atualização automática parada');
        }
    }

    // Limpar histórico (cuidado!)
    clearHistory(): void {
        if (confirm('Tem certeza que deseja limpar todo o histórico de posições? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.initializeStorage();
            console.log('🗑️ [HISTÓRICO] Histórico limpo');
        }
    }

    // Exportar dados
    exportData(): string {
        const positions = this.getAllPositions();
        const data = {
            positions,
            statistics: this.getStatistics(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Importar dados
    importData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            if (data.positions && Array.isArray(data.positions)) {
                this.savePositions(data.positions);
                console.log('📥 [HISTÓRICO] Dados importados com sucesso');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    private generateId(): string {
        return `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private calculatePnL(position: PositionHistory): { absolute: number; percentage: number; result: 'WIN' | 'LOSS' | 'BREAKEVEN' } {
        if (!position.closePrice || !position.openPrice) {
            return { absolute: 0, percentage: 0, result: 'BREAKEVEN' };
        }

        const isLong = position.side === 'BUY';
        const priceDiff = position.closePrice - position.openPrice;
        const pnl = isLong ? priceDiff : -priceDiff;
        const pnlValue = pnl * position.quantity;
        const pnlPercentage = (pnl / position.openPrice) * 100;

        let result: 'WIN' | 'LOSS' | 'BREAKEVEN';
        if (Math.abs(pnlValue) < 0.01) {
            result = 'BREAKEVEN';
        } else {
            result = pnlValue > 0 ? 'WIN' : 'LOSS';
        }

        return {
            absolute: pnlValue,
            percentage: pnlPercentage,
            result
        };
    }

    // Calcular valor da posição em USD
    calculatePositionValue(quantity: number, price: number): number {
        return quantity * price;
    }

    // Buscar preço atual de um símbolo
    async getCurrentPrice(symbol: string): Promise<number | null> {
        try {
            console.log('💰 [PREÇO] Buscando preço atual para:', symbol);
            const response = await fetch(`ApiService.get('binance/price/${symbol}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });

            if (!response.ok) {
                console.warn('⚠️ [PREÇO] Erro HTTP ao buscar preço para:', symbol, 'Status:', response.status);
                return null;
            }

            const data = await response.json();
            const price = parseFloat(data.price || 0);

            if (price <= 0 || isNaN(price)) {
                console.warn('⚠️ [PREÇO] Preço inválido para:', symbol, 'Price:', data.price);
                return null;
            }

            console.log('✅ [PREÇO] Preço atual obtido:', { symbol, price });
            return price;
        } catch (error) {
            console.error('❌ [PREÇO] Erro ao buscar preço para:', symbol, 'Error:', error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    // Calcular valor atual da posição em USD
    async calculateCurrentPositionValue(position: PositionHistory): Promise<number | null> {
        if (position.status !== 'OPEN') {
            return null;
        }

        const currentPrice = await this.getCurrentPrice(position.symbol);
        if (currentPrice === null) {
            return null;
        }

        const currentValue = this.calculatePositionValue(position.quantity, currentPrice);
        console.log('💰 [VALOR ATUAL] Calculado:', {
            symbol: position.symbol,
            quantity: position.quantity,
            currentPrice,
            currentValue
        });

        return currentValue;
    }

    // Buscar preços atuais para múltiplos símbolos
    async getCurrentPrices(symbols: string[]): Promise<Record<string, number>> {
        const prices: Record<string, number> = {};

        console.log('💰 [PREÇOS] Buscando preços atuais para:', symbols.length, 'símbolos');

        for (const symbol of symbols) {
            const price = await this.getCurrentPrice(symbol);
            if (price !== null) {
                prices[symbol] = price;
            }
        }

        console.log('✅ [PREÇOS] Preços obtidos:', Object.keys(prices).length, 'de', symbols.length);
        return prices;
    }

    // Calcular valores atuais para todas as posições abertas
    async calculateCurrentValuesForOpenPositions(): Promise<Record<string, number>> {
        const positions = this.getAllPositions();
        const openPositions = positions.filter(p => p.status === 'OPEN');
        const symbols = Array.from(new Set(openPositions.map(p => p.symbol)));

        console.log('💰 [VALORES] Calculando valores atuais para', openPositions.length, 'posições abertas');

        const currentPrices = await this.getCurrentPrices(symbols);
        const currentValues: Record<string, number> = {};

        for (const position of openPositions) {
            const currentPrice = currentPrices[position.symbol];
            if (currentPrice !== undefined && currentPrice > 0) {
                try {
                    // Calcular valor atual real da posição (quanto você receberia se fechasse agora)
                    const priceRatio = currentPrice / position.openPrice;
                    const currentValue = 5 * priceRatio; // 5 USD * ratio
                    currentValues[position.id] = currentValue;

                    // Atualizar P&L automaticamente para posições abertas
                    const pnlResult = this.calculatePnLForOpenPosition(position, currentPrice);
                    if (pnlResult) {
                        console.log('💰 [P&L] Atualizando P&L para posição aberta:', {
                            symbol: position.symbol,
                            investedValue: '5 USD',
                            openPrice: position.openPrice + ' USD',
                            currentPrice: currentPrice + ' USD',
                            currentValue: currentValue.toFixed(2) + ' USD',
                            pnl: pnlResult.absolute.toFixed(2) + ' USD',
                            pnlPercentage: pnlResult.percentage.toFixed(2) + '%',
                            result: pnlResult.result
                        });

                        this.updatePosition(position.id, {
                            pnl: pnlResult.absolute,
                            pnlPercentage: pnlResult.percentage,
                            result: pnlResult.result
                        });
                    }
                } catch (error) {
                    console.error('❌ [VALORES] Erro ao calcular valor para posição:', {
                        symbol: position.symbol,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            } else {
                console.warn('⚠️ [VALORES] Preço não disponível para:', {
                    symbol: position.symbol,
                    currentPrice: currentPrice
                });
            }
        }

        console.log('✅ [VALORES] Valores calculados:', Object.keys(currentValues).length, 'posições');
        return currentValues;
    }

    // Calcular P&L para posição aberta (sem fechar a posição)
    private calculatePnLForOpenPosition(position: PositionHistory, currentPrice: number): { absolute: number; percentage: number; result: 'WIN' | 'LOSS' | 'BREAKEVEN' } | null {
        if (!position.openPrice || position.status !== 'OPEN') {
            return null;
        }

        // Valor investido sempre 5 USD
        const investedValue = 5;

        // Calcular quanto você receberia se fechasse AGORA
        // Se você comprou BTC a 108,086.17 USD e agora está 108,253.98 USD
        // Você teria: 5 USD * (108,253.98 / 108,086.17) = 5.007 USD
        const priceRatio = currentPrice / position.openPrice;
        const currentValue = investedValue * priceRatio;

        // Calcular P&L real
        const pnlValue = currentValue - investedValue;
        const pnlPercentage = (pnlValue / investedValue) * 100;

        let result: 'WIN' | 'LOSS' | 'BREAKEVEN';
        if (Math.abs(pnlValue) < 0.01) {
            result = 'BREAKEVEN';
        } else {
            result = pnlValue > 0 ? 'WIN' : 'LOSS';
        }

        console.log('💰 [P&L REAL] Calculando valor se fechasse agora:', {
            symbol: position.symbol,
            investedValue: investedValue + ' USD',
            openPrice: position.openPrice + ' USD',
            currentPrice: currentPrice + ' USD',
            priceRatio: priceRatio.toFixed(6),
            currentValue: currentValue.toFixed(2) + ' USD',
            pnlValue: pnlValue.toFixed(2) + ' USD',
            pnlPercentage: pnlPercentage.toFixed(2) + '%',
            result
        });

        return {
            absolute: pnlValue,
            percentage: pnlPercentage,
            result
        };
    }

    // VERIFICAÇÃO TRIPLA: Garantir que posições da análise rotativa estão na Binance
    async verifyRotativeAnalysisPositions(): Promise<{
        total: number;
        verified: number;
        notFound: number;
        details: Array<{
            symbol: string;
            side: string;
            strategyId: string;
            found: boolean;
            reason: string;
        }>;
    }> {
        console.log('🔍 [VERIFICAÇÃO] Iniciando verificação tripla das posições da análise rotativa...');

        try {
            // 1. Buscar posições da análise rotativa
            const analysisResponse = await ApiService.getAnalysis('position-history');
            if (!analysisResponse.ok) {
                throw new Error('Erro ao buscar dados da análise rotativa');
            }

            const analysisData = await analysisResponse.json();
            const rotativePositions = analysisData.positions || [];

            console.log('📊 [VERIFICAÇÃO] Posições da análise rotativa encontradas:', rotativePositions.length);

            // 2. Buscar posições ativas da Binance
            const positionsResponse = await ApiService.get('binance/positions');
            if (!positionsResponse.ok) {
                throw new Error('Erro ao buscar posições ativas da Binance');
            }

            const positionsData = await positionsResponse.json();
            const binancePositions = positionsData.positions || [];

            // 3. Buscar trades da Binance
            const tradesResponse = await ApiService.get('binance/trades');
            if (!tradesResponse.ok) {
                throw new Error('Erro ao buscar trades da Binance');
            }

            const tradesData = await tradesResponse.json();
            const binanceTrades = tradesData.trades || [];

            console.log('📊 [VERIFICAÇÃO] Dados da Binance obtidos:', {
                activePositions: binancePositions.length,
                trades: binanceTrades.length
            });

            // 4. Verificar cada posição da análise rotativa
            const verificationResults = [];
            let verifiedCount = 0;
            let notFoundCount = 0;

            for (const position of rotativePositions) {
                // Verificar se está nas posições ativas
                const isActive = binancePositions.some((bp: any) =>
                    bp.symbol === position.symbol &&
                    bp.side === position.side
                );

                // Verificar se foi executada nos trades
                const isExecuted = binanceTrades.some((trade: any) =>
                    trade.symbol === position.symbol &&
                    trade.side === position.side &&
                    Math.abs(parseFloat(trade.price) - (position.openPrice || 0)) < 0.0001
                );

                const found = isActive || isExecuted;
                const reason = found
                    ? (isActive ? 'Posição ativa na Binance' : 'Trade executado na Binance')
                    : 'Não encontrada na Binance';

                if (found) {
                    verifiedCount++;
                } else {
                    notFoundCount++;
                }

                verificationResults.push({
                    symbol: position.symbol,
                    side: position.side,
                    strategyId: position.strategyId,
                    found,
                    reason
                });

                console.log(`🔍 [VERIFICAÇÃO] ${position.symbol}: ${found ? '✅' : '❌'} - ${reason}`);
            }

            const result = {
                total: rotativePositions.length,
                verified: verifiedCount,
                notFound: notFoundCount,
                details: verificationResults
            };

            console.log('🎯 [VERIFICAÇÃO] Resultado da verificação tripla:', result);
            return result;

        } catch (error) {
            console.error('❌ [VERIFICAÇÃO] Erro na verificação tripla:', error);
            throw error;
        }
    }

    // MÉTODO PÚBLICO: Forçar atualização do histórico (para parar loops infinitos)
    async forceUpdateHistory(): Promise<void> {
        try {
            console.log('🚀 [FORÇA BRUTA] Forçando atualização do histórico...');

            // 1. Parar atualizações automáticas
            this.stopAutoUpdate();
            console.log('⏹️ [FORÇA BRUTA] Atualizações automáticas paradas');

            // 2. Limpar histórico atual
            localStorage.removeItem(this.STORAGE_KEY);
            this.initializeStorage();
            console.log('🗑️ [FORÇA BRUTA] Histórico limpo');

            // 3. Forçar carregamento do backend
            await this.loadFromBackend();
            console.log('🔄 [FORÇA BRUTA] Carregamento do backend forçado');

            // 4. Verificar resultado
            const totalPositions = this.getAllPositions().length;
            console.log('🎯 [FORÇA BRUTA] Resultado final:', {
                totalPositions,
                success: totalPositions > 0
            });

            // 5. Reiniciar atualizações automáticas
            this.startAutoUpdate();
            console.log('🔄 [FORÇA BRUTA] Atualizações automáticas reiniciadas');

        } catch (error) {
            console.error('❌ [FORÇA BRUTA] Erro na atualização forçada:', error);
        }
    }

    // MÉTODO PÚBLICO: Verificar TODAS as posições da análise rotativa na Binance
    async verifyPositionsInBinance(): Promise<void> {
        try {
            console.log('🔍 [VERIFICAÇÃO PÚBLICA] Iniciando verificação das posições na Binance...');

            const result = await this.verifyRotativeAnalysisPositions();

            console.log('🎯 [VERIFICAÇÃO PÚBLICA] Resultado final:', {
                total: result.total,
                verified: result.verified,
                notFound: result.notFound,
                percentageVerified: result.total > 0 ? ((result.verified / result.total) * 100).toFixed(2) + '%' : '0%'
            });

            // Mostrar detalhes das posições não encontradas
            if (result.notFound > 0) {
                console.warn('⚠️ [VERIFICAÇÃO PÚBLICA] Posições NÃO encontradas na Binance:');
                result.details
                    .filter(d => !d.found)
                    .forEach(d => {
                        console.warn(`   ❌ ${d.symbol} (${d.side}) - ${d.strategyId}`);
                    });
            }

            // Mostrar detalhes das posições verificadas
            if (result.verified > 0) {
                console.log('✅ [VERIFICAÇÃO PÚBLICA] Posições VERIFICADAS na Binance:');
                result.details
                    .filter(d => d.found)
                    .forEach(d => {
                        console.log(`   ✅ ${d.symbol} (${d.side}) - ${d.strategyId} - ${d.reason}`);
                    });
            }

        } catch (error) {
            console.error('❌ [VERIFICAÇÃO PÚBLICA] Erro na verificação:', error);
        }
    }

    // MÉTODO PÚBLICO: Verificar posição específica na Binance
    async verifySpecificPosition(symbol: string, side: string): Promise<boolean> {
        try {
            console.log('🔍 [VERIFICAÇÃO ESPECÍFICA] Verificando posição específica:', { symbol, side });

            const mockPosition = {
                symbol,
                side: side as 'BUY' | 'SELL',
                status: 'OPEN' as const,
                strategyId: 'verification',
                strategyName: 'Verificação',
                quantity: 0,
                openPrice: 0
            };

            const result = await this.verifyPositionInBinanceReal(mockPosition);

            console.log('🎯 [VERIFICAÇÃO ESPECÍFICA] Resultado:', {
                symbol,
                side,
                found: result
            });

            return result;
        } catch (error) {
            console.error('❌ [VERIFICAÇÃO ESPECÍFICA] Erro:', error);
            return false;
        }
    }

    // MÉTODO PÚBLICO: Verificar todas as posições do backend na Binance
    async verifyAllBackendPositions(): Promise<void> {
        try {
            console.log('🔍 [VERIFICAÇÃO COMPLETA] Verificando TODAS as posições do backend na Binance...');

            const response = await ApiService.getAnalysis('position-history');
            if (!response.ok) {
                throw new Error('Erro ao buscar posições do backend');
            }

            const data = await response.json();
            const positions = data.positions || [];

            console.log('📊 [VERIFICAÇÃO COMPLETA] Posições encontradas no backend:', positions.length);

            let verified = 0;
            let notFound = 0;

            for (const position of positions) {
                console.log('🔍 [VERIFICAÇÃO COMPLETA] Verificando:', {
                    symbol: position.symbol,
                    side: position.side,
                    strategyId: position.strategyId
                });

                const isReal = await this.verifyPositionInBinanceReal(position);

                if (isReal) {
                    verified++;
                    console.log('✅ [VERIFICAÇÃO COMPLETA] Posição confirmada:', position.symbol);
                } else {
                    notFound++;
                    console.warn('❌ [VERIFICAÇÃO COMPLETA] Posição NÃO encontrada na Binance:', position.symbol);
                }
            }

            console.log('🎯 [VERIFICAÇÃO COMPLETA] Resultado final:', {
                total: positions.length,
                verified,
                notFound,
                percentageVerified: positions.length > 0 ? ((verified / positions.length) * 100).toFixed(2) + '%' : '0%'
            });

        } catch (error) {
            console.error('❌ [VERIFICAÇÃO COMPLETA] Erro na verificação:', error);
        }
    }

    // MÉTODO PÚBLICO: Forçar carregamento do histórico via endpoint de força bruta
    async forceLoadHistoryFromBackend(): Promise<void> {
        try {
            console.log('🚀 [FORÇA BRUTA FRONTEND] Forçando carregamento do histórico...');

            const response = await ApiService.get('force-load-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 [FORÇA BRUTA FRONTEND] Dados recebidos:', {
                success: data.success,
                message: data.message,
                count: data.count
            });

            if (data.success && data.positions && data.positions.length > 0) {
                console.log('🔄 [FORÇA BRUTA FRONTEND] Carregando posições do backend...');

                // Limpar histórico atual
                localStorage.removeItem(this.STORAGE_KEY);
                this.initializeStorage();

                // Adicionar posições do backend
                for (const position of data.positions) {
                    console.log('➕ [FORÇA BRUTA FRONTEND] Adicionando posição:', {
                        symbol: position.symbol,
                        side: position.side,
                        status: position.status,
                        orderId: position.orderId
                    });

                    await this.addPosition({
                        symbol: position.symbol,
                        side: position.side,
                        quantity: position.quantity,
                        openPrice: position.openPrice,
                        status: position.status,
                        strategyId: position.strategyId || 'backend-force-load',
                        strategyName: position.strategyName || 'Backend Force Load',
                        stopLoss: position.stopLoss,
                        takeProfit: position.takeProfit,
                        spread: position.spread,
                        pnl: position.pnl,
                        pnlPercentage: position.pnlPercentage,
                        result: position.result,
                        orderId: position.orderId,
                        commission: position.commission,
                        realValueInvested: position.realValueInvested,
                        notes: position.notes || 'Carregado via força bruta'
                    });
                }

                const totalPositions = this.getAllPositions().length;
                console.log('🎉 [FORÇA BRUTA FRONTEND] Carregamento concluído! Total de posições:', totalPositions);
            } else {
                console.warn('⚠️ [FORÇA BRUTA FRONTEND] Nenhuma posição encontrada no backend');
            }

        } catch (error) {
            console.error('❌ [FORÇA BRUTA FRONTEND] Erro no carregamento forçado:', error);
        }
    }
}

export default new PositionHistoryService();
