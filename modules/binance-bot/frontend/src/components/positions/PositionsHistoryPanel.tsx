import {
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { BinanceHistoryPosition } from '../../services/BinanceHistoryService';
import ApiService from '../../services/api/apiService';

// Funções auxiliares para formatação
const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
};

const calculateRealTimePnL = (position: any, currentPrice: number): { pnl: number; pnlPercentage: number } => {
    if (!currentPrice || !position.openPrice || !position.quantity) {
        return { pnl: 0, pnlPercentage: 0 };
    }

    // Calcular P&L em tempo real considerando alavancagem: quantidade * (preço_atual - preço_abertura) * alavancagem
    const leverage = position.leverage || 1;
    const pnl = position.quantity * (currentPrice - position.openPrice) * leverage;

    // Calcular P&L percentual: (P&L / valor_investido) * 100
    const pnlPercentage = position.realValueInvested ? (pnl / position.realValueInvested) * 100 : 0;

    return { pnl, pnlPercentage };
};

const calculateTakeProfitStopLoss = (position: any): { takeProfit: number; stopLoss: number } => {
    if (!position.realValueInvested) {
        return { takeProfit: 0, stopLoss: 0 };
    }

    // Usar percentuais padrão das estratégias matemáticas: TP +60%, SL -30%
    const takeProfitPercentage = 60; // 60% de lucro
    const stopLossPercentage = 30;   // 30% de perda

    // Calcular valores totais baseados no valor investido em USD
    const takeProfit = position.realValueInvested * (1 + takeProfitPercentage / 100);
    const stopLoss = position.realValueInvested * (1 - stopLossPercentage / 100);

    return { takeProfit, stopLoss };
};

const calculatePipDifference = (position: any, currentPrice?: number): { pips: number; valuePerPip: number } => {
    // Para posições fechadas, usar currentPrice (que contém o preço de fechamento)
    // Para posições abertas, usar currentPrice passado como parâmetro (preço atual do mercado)
    const price = currentPrice || position.currentPrice;

    if (!price || !position.openPrice || !position.quantity) {
        return { pips: 0, valuePerPip: 0 };
    }

    // Calcular diferença de preço (preço atual - preço abertura)
    const priceDifference = price - position.openPrice;

    // Calcular pips baseado na diferença de preço real
    // Para pares FDUSD, usar valores mais realistas baseados no preço
    let pipValue = 0.01; // Valor padrão para pares FDUSD

    if (position.symbol.includes('JPY')) {
        pipValue = 0.01; // Para pares JPY
    } else if (position.symbol.includes('FDUSD')) {
        // Para pares FDUSD, usar valores mais realistas baseados no preço
        if (position.symbol.includes('BTC')) {
            pipValue = 1.0; // Para BTCFDUSD, 1 pip = $1
        } else if (position.symbol.includes('ETH')) {
            pipValue = 0.1; // Para ETHFDUSD, 1 pip = $0.1
        } else if (position.symbol.includes('ADA')) {
            pipValue = 0.0001; // Para ADAFDUSD, 1 pip = $0.0001
        } else {
            pipValue = 0.01; // Padrão para outros pares FDUSD
        }
    } else if (position.symbol.includes('USD') && !position.symbol.includes('FDUSD')) {
        pipValue = 0.0001; // Para pares USD tradicionais
    }

    const pips = Math.round(priceDifference / pipValue);

    // Calcular valor por pip baseado no P&L real considerando alavancagem
    // P&L = quantidade * diferença_de_preço * alavancagem
    // valor_por_pip = P&L / pips (valor real por pip)
    const leverage = position.leverage || 1;
    const pnl = position.pnl || (position.quantity * priceDifference * leverage);
    const valuePerPip = pnl && pips !== 0 ? pnl / pips : 0;

    return { pips, valuePerPip };
};

const getStatusText = (status: string): string => {
    switch (status) {
        case 'OPEN':
            return 'Ativa';
        case 'CLOSED':
            return 'Encerrada';
        case 'PENDING':
            return 'Pendente';
        case 'ERROR':
            return 'Erro';
        default:
            return status;
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'OPEN':
            return 'bg-green-100 text-green-800';
        case 'CLOSED':
            return 'bg-gray-100 text-gray-800';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
        case 'ERROR':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getResultText = (result: string): string => {
    switch (result) {
        case 'WIN':
            return 'Ganho';
        case 'LOSS':
            return 'Perda';
        case 'BREAKEVEN':
            return 'Empate';
        default:
            return result;
    }
};

const getResultColor = (result: string): string => {
    switch (result) {
        case 'WIN':
            return 'bg-green-100 text-green-800';
        case 'LOSS':
            return 'bg-red-100 text-red-800';
        case 'BREAKEVEN':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const PositionsHistoryPanel: React.FC = () => {
    console.log('🔄 [POSITIONS HISTORY] Componente renderizado!');
    console.log('🔍 [DEBUG] Iniciando PositionsHistoryPanel...');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [closingPositions, setClosingPositions] = useState<Set<string>>(new Set());
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>({});
    const [filters, setFilters] = useState({
        symbol: '',
        status: '',
        strategyId: '',
        result: ''
    });

    // Variáveis de estado para paginação
    const [positions, setPositions] = useState<BinanceHistoryPosition[]>([]);
    const [totalPositions, setTotalPositions] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const positionsPerPage = 20; // Constante para itens por página

    // Estado para página atual com dados completos
    const [currentPage, setCurrentPage] = useState<{
        currentPage: number;
        positions: BinanceHistoryPosition[];
        totalPositions: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    } | null>(null);


    const closePosition = async (position: BinanceHistoryPosition) => {
        if (closingPositions.has(position.id)) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja fechar a posição ${position.side} de ${position.symbol}?\n\n` +
            `Quantidade: ${position.quantity}\n` +
            `Preço de entrada: $${position.openPrice.toFixed(4)}\n` +
            `Valor investido: $${(position.realValueInvested || 5).toFixed(2)}`
        );

        if (!confirmed) return;

        setClosingPositions(prev => new Set(prev).add(position.id));

        try {
            console.log(`🔐 [CLOSE POSITION] Fechando posição:`, {
                id: position.id,
                symbol: position.symbol,
                side: position.side
            });

            const response = await fetch(`/api/v1/close-position/${position.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ [CLOSE POSITION] Posição fechada com sucesso:', data.data);

                // Mostrar notificação de sucesso
                alert(`✅ Posição fechada com sucesso!\n\nPnL: ${data.data.position.pnl > 0 ? '+' : ''}$${data.data.position.pnl.toFixed(2)} (${data.data.position.pnlPercentage.toFixed(2)}%)`);

                // Recarregar a página atual
                await loadPage(currentPageNumber);
            } else {
                throw new Error(data.message || 'Erro desconhecido');
            }
        } catch (error: any) {
            console.error('❌ [CLOSE POSITION] Erro ao fechar posição:', error);
            alert(`❌ Erro ao fechar posição: ${error.message}`);
        } finally {
            setClosingPositions(prev => {
                const newSet = new Set(prev);
                newSet.delete(position.id);
                return newSet;
            });
        }
    };

    const loadPage = async (pageNumber: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            console.log(`📊 [HISTÓRICO] Carregando página ${pageNumber} com ${positionsPerPage} itens por página...`);
            console.log(`🔍 [DEBUG] URL da API: /api/analysis/position-history?page=${pageNumber}&limit=${positionsPerPage}`);

            // Carregar posições diretamente do backend com parâmetros de paginação
            const data = await ApiService.getAnalysis(`position-history?page=${pageNumber}&limit=${positionsPerPage}`);

            console.log('📋 [HISTÓRICO API] Resposta completa da API:', data);

            if (data.success && data.positions) {
                console.log('📋 [HISTÓRICO BACKEND] Dados recebidos:', {
                    positions: data.positions.length,
                    pagination: data.pagination,
                    firstPosition: data.positions[0] ? {
                        symbol: data.positions[0].symbol,
                        side: data.positions[0].side,
                        status: data.positions[0].status
                    } : null
                });

                // Usar dados paginados do backend
                const positionsInPage = data.positions;
                const pagination = data.pagination;

                setPositions(positionsInPage);
                setTotalPositions(pagination.totalPositions);
                setTotalPages(pagination.totalPages);
                setCurrentPageNumber(pageNumber);
                setLastUpdate(new Date());

                // Atualizar currentPage para renderização da tabela
                setCurrentPage({
                    currentPage: pageNumber,
                    positions: positionsInPage,
                    totalPositions: pagination.totalPositions,
                    totalPages: pagination.totalPages,
                    hasNextPage: pagination.hasNextPage,
                    hasPreviousPage: pagination.hasPreviousPage
                });

                console.log('📊 [HISTÓRICO] Página carregada:', {
                    page: pageNumber,
                    totalPositions: pagination.totalPositions,
                    positionsInPage: positionsInPage.length,
                    totalPages: pagination.totalPages,
                    open: positionsInPage.filter((p: any) => p.status === 'OPEN').length,
                    closed: positionsInPage.filter((p: any) => p.status === 'CLOSED').length,
                    real: positionsInPage.filter((p: any) => p.source === 'BINANCE').length,
                    system: positionsInPage.filter((p: any) => p.source === 'SYSTEM').length,
                    samplePosition: positionsInPage[0] ? {
                        id: positionsInPage[0].id,
                        symbol: positionsInPage[0].symbol,
                        status: positionsInPage[0].status,
                        source: positionsInPage[0].source,
                        pnl: positionsInPage[0].pnl,
                        pnlPercentage: positionsInPage[0].pnlPercentage
                    } : null
                });

                // Buscar preços atuais para posições ativas
                fetchCurrentPrices(positionsInPage);
            } else {
                throw new Error('Erro ao carregar posições do backend');
            }
        } catch (err: any) {
            console.error('❌ [HISTÓRICO] Erro detalhado ao carregar página:', {
                message: err.message,
                stack: err.stack,
                name: err.name,
                url: `/api/analysis/position-history?page=${pageNumber}&limit=${positionsPerPage}`
            });
            setError('Erro ao carregar histórico: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshCurrentPage = async () => {
        try {
            setLoading(true);
            console.log('🔄 [HISTÓRICO] Sincronizando com Binance Testnet...');

            // 1. Forçar carregamento do histórico real da Binance
            const response = await ApiService.get('force-load-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success && data.positions && data.positions.positions) {
                const positionsArray = data.positions.positions;
                console.log('✅ [HISTÓRICO] Dados sincronizados com Binance:', {
                    total: positionsArray.length,
                    open: positionsArray.filter((p: any) => p.status === 'OPEN').length,
                    closed: positionsArray.filter((p: any) => p.status === 'CLOSED').length
                });

                // 2. Recarregar a página atual com os dados atualizados
                await loadPage(currentPageNumber);

                // 3. Atualizar timestamp
                setLastUpdate(new Date());
            } else {
                throw new Error('Falha ao sincronizar com Binance');
            }
        } catch (error) {
            console.error('❌ [HISTÓRICO] Erro ao sincronizar:', error);
            setError('Erro ao sincronizar com Binance Testnet');
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= (currentPage?.totalPages || 1)) {
            loadPage(pageNumber);
        }
    };

    const applyFilters = () => {
        // Implementar filtros se necessário
        loadPage(1); // Voltar para primeira página
    };

    const clearFilters = () => {
        setFilters({
            symbol: '',
            status: '',
            strategyId: '',
            result: ''
        });
        loadPage(1);
    };





    const getStatusText = (status: string) => {
        switch (status) {
            case 'OPEN': return 'Ativa';
            case 'CLOSED': return 'Encerrada';
            case 'PENDING': return 'Pendente';
            case 'ERROR': return 'Erro';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-green-600 bg-green-100';
            case 'CLOSED': return 'text-gray-600 bg-gray-100';
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'ERROR': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getResultColor = (result?: string) => {
        switch (result) {
            case 'WIN': return 'text-green-600 bg-green-100';
            case 'LOSS': return 'text-red-600 bg-red-100';
            case 'BREAKEVEN': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getResultText = (result?: string) => {
        switch (result) {
            case 'WIN': return 'Ganho';
            case 'LOSS': return 'Perda';
            case 'BREAKEVEN': return 'Empate';
            default: return '-';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }).format(price);
    };

    const formatPercentage = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const fetchCurrentPrices = async (positions: any[]) => {
        const openPositions = positions.filter(p => p.status === 'OPEN');
        if (openPositions.length === 0) return;

        console.log('💰 [PREÇOS] Buscando preços atuais para posições ativas:', openPositions.length);

        try {
            const pricePromises = openPositions.map(async (position) => {
                try {
                    const data = await ApiService.get(`binance/price/${position.symbol}`);
                    if (data && data.price) {
                        return { symbol: position.symbol, price: parseFloat(data.price) };
                    }
                } catch (err) {
                    console.warn(`⚠️ [PREÇOS] Erro ao buscar preço para ${position.symbol}:`, err);
                }
                return null;
            });

            const results = await Promise.all(pricePromises);
            const validPrices = results.filter(r => r !== null);

            const newPrices: { [key: string]: number } = {};
            validPrices.forEach(result => {
                if (result) {
                    newPrices[result.symbol] = result.price;
                }
            });

            setCurrentPrices(prev => ({ ...prev, ...newPrices }));
            console.log('✅ [PREÇOS] Preços atuais atualizados:', newPrices);
        } catch (err) {
            console.error('❌ [PREÇOS] Erro ao buscar preços atuais:', err);
        }
    };

    const getStatistics = () => {
        // Calcular estatísticas baseadas nos dados reais da página atual
        const allPositions = currentPage?.positions || [];
        const openPositions = allPositions.filter(p => p.status === 'OPEN').length;
        const closedPositions = allPositions.filter(p => p.status === 'CLOSED').length;

        // Calcular ganhos e perdas apenas para posições fechadas com P&L definido
        const closedPositionsWithPnL = allPositions.filter(p => p.status === 'CLOSED' && p.pnl !== undefined && p.pnl !== null);
        const winningPositions = closedPositionsWithPnL.filter(p => (p.pnl || 0) > 0).length;
        const losingPositions = closedPositionsWithPnL.filter(p => (p.pnl || 0) < 0).length;

        // Calcular P&L total apenas para posições fechadas
        const totalPnL = closedPositionsWithPnL.reduce((sum, p) => sum + (p.pnl || 0), 0);

        console.log('📊 [STATS] Calculando estatísticas:', {
            totalPositions: totalPositions,
            openPositions,
            closedPositions,
            closedPositionsWithPnL: closedPositionsWithPnL.length,
            winningPositions,
            losingPositions,
            totalPnL
        });

        return {
            totalPositions: totalPositions,
            openPositions: openPositions,
            closedPositions: closedPositions,
            totalWins: winningPositions,
            totalLosses: losingPositions,
            winRate: closedPositions > 0 ? (winningPositions / closedPositions) * 100 : 0,
            totalPnL: totalPnL
        };
    };

    useEffect(() => {
        console.log('🔄 [POSITIONS HISTORY] useEffect executado - carregando primeira página');
        // Carregar primeira página
        loadPage(1);
    }, []);

    // Atualizar preços atuais a cada 30 segundos
    useEffect(() => {
        if (!currentPage?.positions) return;

        const interval = setInterval(() => {
            fetchCurrentPrices(currentPage.positions);
        }, 30000);

        return () => clearInterval(interval);
    }, [currentPage]);

    const stats = getStatistics();

    if (loading && !currentPage) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Carregando histórico de posições...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Histórico de Posições</h1>
                    <p className="text-sm text-gray-500">
                        {currentPage && `Página ${currentPage.currentPage} de ${currentPage.totalPages} • ${currentPage.totalPositions} posições no total`}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        <FunnelIcon className="w-4 h-4 mr-1" />
                        Filtros
                    </button>
                    <button
                        onClick={refreshCurrentPage}
                        disabled={loading}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Símbolo..."
                            value={filters.symbol}
                            onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="">Todos os status</option>
                            <option value="OPEN">Ativa</option>
                            <option value="CLOSED">Encerrada</option>
                            <option value="PENDING">Pendente</option>
                            <option value="ERROR">Erro</option>
                        </select>
                        <select
                            value={filters.result}
                            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="">Todos os resultados</option>
                            <option value="WIN">Ganho</option>
                            <option value="LOSS">Perda</option>
                            <option value="BREAKEVEN">Empate</option>
                        </select>
                        <div className="flex space-x-2">
                            <button
                                onClick={applyFilters}
                                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                Aplicar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalPositions}</div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-green-600">{stats.openPositions}</div>
                    <div className="text-sm text-gray-600">Ativas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-gray-600">{stats.closedPositions}</div>
                    <div className="text-sm text-gray-600">Encerradas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-green-600">{stats.totalWins}</div>
                    <div className="text-sm text-gray-600">Ganhos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-red-600">{stats.totalLosses}</div>
                    <div className="text-sm text-gray-600">Perdas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-blue-600">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Taxa Sucesso</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPrice(stats.totalPnL)}
                    </div>
                    <div className="text-sm text-gray-600">P&L Total</div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={refreshCurrentPage}
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar {/* Hot reload test */}
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    {lastUpdate && `Última atualização: ${lastUpdate.toLocaleTimeString()}`}
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Símbolo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantidade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor Investido (USD)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preço Abertura
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preço Atual
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Diferença de Pips
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    P&L (USD)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    P&L (%)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Take Profit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stop Loss
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Origem
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Alavancagem
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estratégia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Abertura
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fechamento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentPage?.positions.map((position) => (
                                <tr key={position.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {position.symbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${position.side === 'BUY'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {position.side === 'BUY' ? 'COMPRA' : 'VENDA'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.quantity ? position.quantity.toFixed(8) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatPrice(position.realValueInvested || 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatPrice(position.openPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.status === 'CLOSED' ?
                                            (position.closePrice ? formatPrice(position.closePrice) : '-') :
                                            (currentPrices[position.symbol] ? formatPrice(currentPrices[position.symbol]) : '-')
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(() => {
                                            const currentPrice = position.status === 'CLOSED' ? position.closePrice : currentPrices[position.symbol];
                                            if (!currentPrice) return '-';

                                            const { pips, valuePerPip } = calculatePipDifference(position, currentPrice);
                                            return pips !== 0 ? (
                                                <div>
                                                    <div className="font-medium">{pips} pips</div>
                                                    <div className="text-xs text-gray-500">
                                                        {valuePerPip > 0 ? `$${valuePerPip.toFixed(6)}/pip` : '-'}
                                                    </div>
                                                </div>
                                            ) : '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {(() => {
                                            if (position.status === 'CLOSED' && position.pnl !== undefined) {
                                                return (
                                                    <span className={`font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPrice(position.pnl)}
                                                    </span>
                                                );
                                            } else if (position.status === 'OPEN' && currentPrices[position.symbol]) {
                                                const { pnl } = calculateRealTimePnL(position, currentPrices[position.symbol]);
                                                return (
                                                    <span className={`font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPrice(pnl)}
                                                    </span>
                                                );
                                            }
                                            return '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {(() => {
                                            if (position.status === 'CLOSED' && position.pnlPercentage !== undefined) {
                                                return (
                                                    <span className={`font-medium ${position.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPercentage(position.pnlPercentage)}
                                                    </span>
                                                );
                                            } else if (position.status === 'OPEN' && currentPrices[position.symbol]) {
                                                const { pnlPercentage } = calculateRealTimePnL(position, currentPrices[position.symbol]);
                                                return (
                                                    <span className={`font-medium ${pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPercentage(pnlPercentage)}
                                                    </span>
                                                );
                                            }
                                            return '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(() => {
                                            const { takeProfit } = calculateTakeProfitStopLoss(position);
                                            return takeProfit > 0 ? (
                                                <div>
                                                    <div className="font-medium text-green-600">
                                                        ${takeProfit.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        +60% TP
                                                    </div>
                                                </div>
                                            ) : '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(() => {
                                            const { stopLoss } = calculateTakeProfitStopLoss(position);
                                            return stopLoss > 0 ? (
                                                <div>
                                                    <div className="font-medium text-red-600">
                                                        ${stopLoss.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        -30% SL
                                                    </div>
                                                </div>
                                            ) : '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(position.status)}`}>
                                            {getStatusText(position.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {position.source === 'binance' ? (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                ✅ Binance Real
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                🔧 Sistema
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${(position.leverage || 1) === 1
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {(position.leverage || 1)}x
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.strategyName || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(position.openTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {position.closeTime ? formatDate(position.closeTime) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.status === 'OPEN' ? (
                                            <button
                                                onClick={() => closePosition(position)}
                                                disabled={closingPositions.has(position.id)}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${closingPositions.has(position.id)
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                                                    }`}
                                            >
                                                {closingPositions.has(position.id) ? (
                                                    <>
                                                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                        Fechando...
                                                    </>
                                                ) : (
                                                    '🔐 Fechar'
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {currentPage && currentPage.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => goToPage(currentPage.currentPage - 1)}
                                disabled={!currentPage.hasPreviousPage}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => goToPage(currentPage.currentPage + 1)}
                                disabled={!currentPage.hasNextPage}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{((currentPage.currentPage - 1) * 20) + 1}</span> a{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage.currentPage * 20, currentPage.totalPositions)}
                                    </span> de{' '}
                                    <span className="font-medium">{currentPage.totalPositions}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => goToPage(currentPage.currentPage - 1)}
                                        disabled={!currentPage.hasPreviousPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>

                                    {Array.from({ length: Math.min(5, currentPage.totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, Math.min(currentPage.totalPages - 4, currentPage.currentPage - 2)) + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === currentPage.currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => goToPage(currentPage.currentPage + 1)}
                                        disabled={!currentPage.hasNextPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mensagem de erro */}
            {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Mensagem quando não há posições */}
            {currentPage && currentPage.positions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Nenhuma Posição Encontrada
                    </h3>
                    <p className="text-gray-600">
                        O histórico de posições aparecerá aqui conforme as operações forem executadas.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PositionsHistoryPanel;
