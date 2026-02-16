import React, { useEffect, useState } from 'react';
import BinanceHistoryService, { BinanceHistoryPosition, BinanceHistoryStats } from '../../services/BinanceHistoryService';

const BinanceHistoryPanel: React.FC = () => {
    const [positions, setPositions] = useState<BinanceHistoryPosition[]>([]);
    const [stats, setStats] = useState<BinanceHistoryStats>({
        totalPositions: 0,
        openPositions: 0,
        closedPositions: 0,
        winningPositions: 0,
        losingPositions: 0,
        totalPnl: 0,
        totalPnlPercentage: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const positionsPerPage = 20;

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📊 [HISTÓRICO BINANCE] Carregando dados reais da Binance...');

            // Carregar histórico real da Binance
            await BinanceHistoryService.loadHistory();

            // Obter dados paginados
            const data = BinanceHistoryService.getPositions(currentPage, positionsPerPage);
            const statsData = BinanceHistoryService.getStats();

            setPositions(data.positions);
            setStats(statsData);
            setTotalPages(data.pagination.totalPages);

            console.log('✅ [HISTÓRICO BINANCE] Dados carregados:', {
                total: statsData.totalPositions,
                open: statsData.openPositions,
                closed: statsData.closedPositions,
                winning: statsData.winningPositions,
                losing: statsData.losingPositions
            });

        } catch (err: any) {
            console.error('❌ [HISTÓRICO BINANCE] Erro ao carregar dados:', err);
            setError(err.message || 'Erro ao carregar dados da Binance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage]);

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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Carregando histórico real da Binance...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="text-center text-red-600">
                        <h3 className="text-lg font-semibold mb-2">Erro ao carregar histórico</h3>
                        <p>{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    Histórico de Posições - Binance Testnet
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    ✅ Posições 100% REAIS da Binance Testnet - SEM simulações
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    ℹ️ Mostrando posições futures reais com P&L real e horários de abertura/fechamento corretos.
                </p>
            </div>

            {/* Estatísticas */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalPositions}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.openPositions}</div>
                        <div className="text-sm text-gray-600">Ativas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.closedPositions}</div>
                        <div className="text-sm text-gray-600">Fechadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.winningPositions}</div>
                        <div className="text-sm text-gray-600">Ganhos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.losingPositions}</div>
                        <div className="text-sm text-gray-600">Perdas</div>
                    </div>
                </div>
            </div>

            {/* Lista de Posições */}
            <div className="p-6">
                {positions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-lg mb-2">
                            {stats.totalPositions === 0
                                ? 'Nenhuma posição encontrada na Binance Testnet'
                                : 'Nenhuma posição nesta página'
                            }
                        </div>
                        <div className="text-sm text-gray-400 space-y-2">
                            <p>Mostrando posições REAIS da sua conta Binance Testnet.</p>
                            <p className="text-xs text-gray-500">
                                ℹ️ Para ver posições, você precisa:
                            </p>
                            <ul className="text-xs text-gray-500 text-left max-w-md mx-auto">
                                <li>• Abrir posições futures na Binance Testnet</li>
                                <li>• As posições spot não aparecem aqui (são execuções, não posições)</li>
                                <li>• Use a Binance Testnet para fazer trades de teste</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {positions.map((position) => (
                            <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-lg">{position.symbol}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${position.side === 'BUY'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {position.side}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${position.status === 'OPEN'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {position.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Quantidade:</span>
                                                <div className="font-medium">{position.quantity}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Preço Entrada:</span>
                                                <div className="font-medium">${formatPrice(position.openPrice)}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Valor Investido:</span>
                                                <div className="font-medium">${formatPrice(position.realValueInvested)}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">P&L:</span>
                                                <div className={`font-medium ${(position.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    ${formatPrice(position.pnl || 0)} ({formatPercentage(position.pnlPercentage || 0)})
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <span>Estratégia: {position.strategyName}</span>
                                            <span className="ml-4">Aberto: {formatDate(position.openTime)}</span>
                                            {position.closeTime && (
                                                <span className="ml-4">Fechado: {formatDate(position.closeTime)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BinanceHistoryPanel;
