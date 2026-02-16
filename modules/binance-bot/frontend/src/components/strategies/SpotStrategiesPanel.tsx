import { StarIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface SpotStrategy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    isFavorite: boolean;
    type: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    tradingType: 'SPOT';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    updatedAt: string;
}

interface MultiTimeframeSignal {
    timeframe1m: { strength: number; diagnostics: string };
    timeframe3m: { strength: number; diagnostics: string };
    timeframe5m: { strength: number; diagnostics: string };
    strongest: { timeframe: string; strength: number };
}

interface SpotSignalsTable {
    market: string;
    strategies: {
        [strategyId: string]: MultiTimeframeSignal;
    };
}

interface AnalysisStatus {
    isRunning: boolean;
    currentCycle: number;
    totalCycles: number;
    totalSignals: number;
    totalExecutions: number;
    lastUpdate: string;
    config: {
        minSignalsRequired: number;
        minSignalStrength: number;
        cycleIntervalMs: number;
        maxHistoryTables: number;
    };
    cycleHistory: {
        cycleNumber: number;
        timestamp: string;
        signalsGenerated: number;
        executionsPerformed: number;
        signalsByMarket: { [market: string]: number };
        table: SpotSignalsTable[];
    }[];
    currentTable: SpotSignalsTable[];
    tradingStrategies: string[];
    favoriteSymbols: string[];
    mathStrategy: string;
}

// Função auxiliar para determinar a cor baseada na força do sinal
const getSignalStrengthColor = (strength: number): string => {
    if (strength >= 80) return 'text-green-600 bg-green-100';
    if (strength >= 60) return 'text-blue-600 bg-blue-100';
    if (strength >= 40) return 'text-yellow-600 bg-yellow-100';
    if (strength >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
};

const SpotStrategiesPanel: React.FC = () => {
    const [strategies, setStrategies] = useState<SpotStrategy[]>([]);
    const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spot-favorites`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`⭐ [FRONTEND] Favoritos carregados: ${data.favorites?.length || 0}`);
            return data.favorites || [];
        } catch (err: any) {
            console.error(`❌ [FRONTEND] Erro ao carregar favoritos:`, err);
            return [];
        }
    };

    const fetchMarketFavorites = () => {
        try {
            const saved = localStorage.getItem('binance-market-favorites');
            if (saved) {
                const favorites = JSON.parse(saved);
                console.log(`📊 [FRONTEND] Mercados favoritos carregados: ${favorites.length}`);
                return favorites;
            }
            return [];
        } catch (err) {
            console.warn('❌ [FRONTEND] Erro ao carregar mercados favoritos:', err);
            return [];
        }
    };

    const fetchStrategies = async () => {
        try {
            setLoading(true);
            const url = `${API_BASE_URL}/spot-strategies`;
            console.log(`🔍 [FRONTEND] Buscando estratégias em: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000) // 10 segundos de timeout
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Falha ao carregar estratégias spot: HTTP ${response.status} - ${text.substring(0, 120)}`);
            }

            const data = await response.json();
            console.log(`✅ [FRONTEND] Estratégias carregadas: ${data.strategies?.length || 0}`);
            if (data.success) {
                // Carregar favoritos
                const favorites = await fetchFavorites();
                console.log(`⭐ [FRONTEND] Marcando estratégias favoritas:`, favorites);

                // Marcar estratégias favoritas
                const strategiesWithFavorites = data.strategies.map((strategy: any) => ({
                    ...strategy,
                    isFavorite: favorites.includes(strategy.id)
                }));

                setStrategies(strategiesWithFavorites);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            console.error(`❌ [FRONTEND] Erro ao carregar estratégias:`, err);
            setError('Erro ao carregar estratégias spot: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalysisStatus = async () => {
        try {
            const url = `${API_BASE_URL}/spot-rotative-analysis/status`;
            console.log(`🔍 [FRONTEND] Buscando status da análise em: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000) // 10 segundos de timeout
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Falha ao obter status da análise spot: HTTP ${response.status} - ${text.substring(0, 120)}`);
            }

            const data = await response.json();
            console.log(`✅ [FRONTEND] Status da análise carregado:`, data);
            if (data.success) {
                // Adicionar mercados favoritos do localStorage
                const marketFavorites = fetchMarketFavorites();
                const updatedStatus = {
                    ...data.status,
                    favoriteSymbols: marketFavorites
                };
                setAnalysisStatus(updatedStatus);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            console.error(`❌ [FRONTEND] Erro ao obter status da análise:`, err);
            setError('Erro ao obter status da análise: ' + err.message);
        }
    };

    const toggleStrategy = async (strategyId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/spot-strategies/${strategyId}/toggle`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                setStrategies(prev => prev.map(s =>
                    s.id === strategyId ? { ...s, isActive: data.strategy.isActive } : s
                ));
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError('Erro ao alternar estratégia: ' + err.message);
        }
    };

    const toggleFavorite = async (strategyId: string) => {
        try {
            console.log(`🔍 [FRONTEND] Alternando favorito para estratégia: ${strategyId}`);

            const response = await fetch(`${API_BASE_URL}/spot-favorites/${strategyId}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                const strategy = strategies.find(s => s.id === strategyId);
                const isNowFavorite = data.isFavorite;

                console.log(`✅ [FRONTEND] Estratégia ${strategy?.name} ${isNowFavorite ? 'adicionada aos' : 'removida dos'} favoritos!`);
                console.log(`📊 [FRONTEND] Total de favoritas: ${data.favoritesCount}`);

                setStrategies(prev => prev.map(s =>
                    s.id === strategyId ? { ...s, isFavorite: isNowFavorite } : s
                ));

                // Atualizar status da análise para refletir mudanças
                await fetchAnalysisStatus();

                console.log(`🎉 [FRONTEND] Interface atualizada com sucesso!`);
            } else {
                console.error(`❌ [FRONTEND] Erro ao alternar favorito:`, data.message);
                setError(data.message);
            }
        } catch (err: any) {
            console.error(`❌ [FRONTEND] Erro na requisição:`, err.message);
            setError('Erro ao alternar favorito: ' + err.message);
        }
    };


    const performSimpleAnalysis = async () => {
        try {
            setAnalyzing(true);
            setError(null);
            console.log('🔍 [ANÁLISE SIMPLES] Iniciando análise...');

            // Executar análise simples para preencher a tabela
            const response = await fetch(`${API_BASE_URL}/spot-rotative-analysis/simple-analysis`, {
                method: 'POST',
            });

            console.log('🔍 [ANÁLISE SIMPLES] Resposta recebida:', response.status);

            const data = await response.json();
            console.log('🔍 [ANÁLISE SIMPLES] Dados recebidos:', data);

            if (data.success) {
                console.log('✅ [ANÁLISE SIMPLES] Análise executada com sucesso!');
                console.log('📊 [ANÁLISE SIMPLES] Mercados analisados:', data.data?.signalsTable?.length || 0);
                console.log('📊 [ANÁLISE SIMPLES] Estratégias ativas:', data.data?.tradingStrategies?.length || 0);

                // Atualizar apenas a tabela de sinais
                setAnalysisStatus(prev => prev ? {
                    ...prev,
                    currentTable: data.data?.signalsTable || []
                } : null);

                console.log('🎉 [ANÁLISE SIMPLES] Tabela atualizada com sucesso!');
            } else {
                console.error('❌ [ANÁLISE SIMPLES] Erro:', data.message);
                setError(data.message);
            }
        } catch (err: any) {
            console.error('❌ [ANÁLISE SIMPLES] Erro na requisição:', err.message);
            setError('Erro ao executar análise simples: ' + err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await fetchStrategies();
            // Aguardar um pouco antes de buscar o status da análise
            setTimeout(() => {
                fetchAnalysisStatus();
            }, 1000);
        };

        initializeData();
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'CONSERVATIVE': return 'bg-green-100 text-green-800';
            case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
            case 'AGGRESSIVE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-600';
            case 'MEDIUM': return 'text-yellow-600';
            case 'HIGH': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Estratégias Spot</h2>
                    <p className="text-gray-600">Gerencie estratégias de compra spot para análise rotativa</p>
                </div>
            </div>

            {/* Resumo Informativo */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Estratégias Favoritas */}
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                            <span className="text-yellow-500 mr-2">⭐</span>
                            Estratégias Favoritas
                        </h3>
                        {strategies.filter(s => s.isFavorite).length > 0 ? (
                            <div className="space-y-2">
                                {strategies.filter(s => s.isFavorite).map((strategy, index) => (
                                    <div key={index} className="bg-white rounded-lg p-2 shadow-sm border border-blue-100">
                                        <div className="font-medium text-blue-800">{strategy.name}</div>
                                        <div className="text-xs text-blue-600">{strategy.type}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-blue-600 text-sm">Nenhuma estratégia favorita selecionada</div>
                        )}
                    </div>

                    {/* Mercados Favoritos */}
                    <div>
                        <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                            <span className="text-purple-500 mr-2">📊</span>
                            Mercados Favoritos
                        </h3>
                        {analysisStatus?.favoriteSymbols && analysisStatus.favoriteSymbols.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysisStatus.favoriteSymbols.map((symbol, index) => (
                                    <div key={index} className="bg-white rounded-lg px-3 py-1 shadow-sm border border-purple-100">
                                        <span className="font-medium text-purple-800">{symbol}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-purple-600 text-sm">Nenhum mercado favorito configurado</div>
                        )}
                    </div>

                    {/* Estratégia Matemática */}
                    <div>
                        <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                            <span className="text-green-500 mr-2">🧮</span>
                            Estratégia Matemática
                        </h3>
                        {analysisStatus?.mathStrategy ? (
                            <div className="bg-white rounded-lg p-2 shadow-sm border border-green-100">
                                <div className="font-medium text-green-800">{analysisStatus.mathStrategy}</div>
                            </div>
                        ) : (
                            <div className="text-green-600 text-sm">Nenhuma estratégia matemática ativa</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seção de Configurações */}
            {analysisStatus && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Ativas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Estratégias Spot Favoritas</h4>
                            <div className="text-sm text-gray-600">
                                {strategies.filter(s => s.isFavorite).length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {strategies.filter(s => s.isFavorite).map((strategy, index) => (
                                            <li key={index}>{strategy.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    'Nenhuma marcada como favorita'
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Mercados Favoritos</h4>
                            <div className="text-sm text-gray-600">
                                {analysisStatus.favoriteSymbols && analysisStatus.favoriteSymbols.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {analysisStatus.favoriteSymbols.map((symbol, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                {symbol}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    'Nenhum configurado'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabela de Sinais Multi-Timeframe - Colunas Ordenadas por Timeframe */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">📊 Tabela de Sinais Multi-Timeframe</h3>
                    <button
                        onClick={performSimpleAnalysis}
                        disabled={analyzing}
                        className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${analyzing
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                            }`}
                    >
                        {analyzing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Analisando Multi-Timeframe...
                            </>
                        ) : (
                            <>
                                <span className="mr-3">🔍</span>
                                Análise Multi-Timeframe
                            </>
                        )}
                    </button>
                </div>
                {analysisStatus?.currentTable && Array.isArray(analysisStatus.currentTable) && analysisStatus.currentTable.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                    <th className="border-2 border-gray-300 px-6 py-4 text-left font-bold text-gray-800 text-lg">Mercado</th>
                                    {analysisStatus?.currentTable?.[0]?.strategies && Object.keys(analysisStatus.currentTable[0].strategies).map((strategyId: string, index: number) => {
                                        const signal = (analysisStatus.currentTable![0] as any)?.strategies?.[strategyId];
                                        return (
                                            <th key={index} className="border-2 border-gray-300 px-4 py-4 text-center">
                                                <div className="space-y-2">
                                                    <div className="font-bold text-gray-800 text-sm">{strategyId}</div>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">1m</div>
                                                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">3m</div>
                                                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">5m</div>
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {analysisStatus?.currentTable?.map((row: any, rowIndex: number) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                        <td className="border-2 border-gray-300 px-6 py-4 font-bold text-gray-900 text-lg">{row.market}</td>
                                        {row.strategies && Object.keys(row.strategies).map((strategyId: string, signalIndex: number) => {
                                            const signal = row.strategies[strategyId];
                                            return (
                                                <td key={signalIndex} className="border-2 border-gray-300 px-4 py-4 text-center">
                                                    <div className="space-y-3">
                                                        {/* Timeframe 1min */}
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-blue-800">⚡ 1min (30 velas)</span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSignalStrengthColor(signal.timeframe1m?.strength || 0)}`}>
                                                                    {(signal.timeframe1m?.strength || 0).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {signal.timeframe1m?.diagnostics || 'N/A'}
                                                            </div>
                                                        </div>

                                                        {/* Timeframe 3min */}
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-green-800">📈 3min (60 velas)</span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSignalStrengthColor(signal.timeframe3m?.strength || 0)}`}>
                                                                    {(signal.timeframe3m?.strength || 0).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {signal.timeframe3m?.diagnostics || 'N/A'}
                                                            </div>
                                                        </div>

                                                        {/* Timeframe 5min */}
                                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-purple-800">🚀 5min (90 velas)</span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSignalStrengthColor(signal.timeframe5m?.strength || 0)}`}>
                                                                    {(signal.timeframe5m?.strength || 0).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {signal.timeframe5m?.diagnostics || 'N/A'}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-lg">Nenhum sinal disponível</p>
                        <p className="text-sm">Execute uma análise multi-timeframe para ver os resultados</p>
                    </div>
                )}
            </div>

            {/* Lista de Estratégias - Cards Gigantes Multi-Timeframe */}
            <div className="grid grid-cols-1 gap-8">
                {strategies.map((strategy) => (
                    <div key={strategy.id} className={`border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl ${strategy.isActive
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200'
                        : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                        } ${strategy.isFavorite ? 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' : ''}`}>

                        {/* Header Principal */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h3 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{strategy.name}</h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getTypeColor(strategy.type)}`}>
                                        {strategy.type}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskColor(strategy.riskLevel)}`}>
                                        Risco: {strategy.riskLevel}
                                    </span>
                                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                                        {strategy.tradingType}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${strategy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {strategy.isActive ? 'ATIVA' : 'INATIVA'}
                                    </span>
                                </div>
                            </div>

                            {/* Botão de favorito */}
                            <div className="flex items-center space-x-2 ml-6">
                                <button
                                    onClick={() => toggleFavorite(strategy.id)}
                                    className={`p-4 rounded-xl transition-all duration-200 ${strategy.isFavorite
                                        ? 'bg-yellow-300 text-yellow-900 hover:bg-yellow-400 shadow-lg'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    title={strategy.isFavorite ? 'Remover dos Favoritos' : 'Marcar como Favorita'}
                                >
                                    <StarIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Seção Multi-Timeframe - 3 Partes */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Timeframe 1min (30 velas) */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-blue-900">⚡ SCALPING RÁPIDO</h4>
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">1min (30 velas)</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">🎯 Foco:</h5>
                                        <p className="text-sm text-gray-700">Sinais rápidos de reversão em períodos de 30 minutos</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">📊 Lógica de Força:</h5>
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between"><span>0-20%:</span><span className="text-red-600">Sobrecarga</span></div>
                                            <div className="flex justify-between"><span>21-40%:</span><span className="text-yellow-600">Neutro-Alto</span></div>
                                            <div className="flex justify-between"><span>41-60%:</span><span className="text-blue-600">Recuperação</span></div>
                                            <div className="flex justify-between"><span>61-80%:</span><span className="text-green-600">Sinal Forte</span></div>
                                            <div className="flex justify-between"><span>81-95%:</span><span className="text-green-700">Muito Forte</span></div>
                                            <div className="flex justify-between"><span>96-100%:</span><span className="text-green-800 font-bold">EXECUÇÃO</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">⚙️ Condições:</h5>
                                        <ul className="text-xs text-gray-700 space-y-1">
                                            <li>• RSI(14) &lt; 30 (sobrevenda)</li>
                                            <li>• RSI cruza acima de 30</li>
                                            <li>• Momentum crescente</li>
                                            <li>• Volume crescente</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Timeframe 3min (60 velas) */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-green-900">📈 TREND MÉDIO</h4>
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">3min (60 velas)</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">🎯 Foco:</h5>
                                        <p className="text-sm text-gray-700">Confirmação de tendência em períodos de 3 horas</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">📊 Lógica de Força:</h5>
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between"><span>0-20%:</span><span className="text-red-600">Tendência Fraca</span></div>
                                            <div className="flex justify-between"><span>21-40%:</span><span className="text-yellow-600">Formação</span></div>
                                            <div className="flex justify-between"><span>41-60%:</span><span className="text-blue-600">Confirmação</span></div>
                                            <div className="flex justify-between"><span>61-80%:</span><span className="text-green-600">Tendência Clara</span></div>
                                            <div className="flex justify-between"><span>81-95%:</span><span className="text-green-700">Tendência Forte</span></div>
                                            <div className="flex justify-between"><span>96-100%:</span><span className="text-green-800 font-bold">TREND CONFIRMADA</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">⚙️ Condições:</h5>
                                        <ul className="text-xs text-gray-700 space-y-1">
                                            <li>• RSI(14) &lt; 30 (sobrevenda)</li>
                                            <li>• ROC(5) &gt; 0 (momentum)</li>
                                            <li>• Confirmação em 3 velas</li>
                                            <li>• Volume sustentado</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Timeframe 5min (90 velas) */}
                            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-purple-900">🚀 LONG TERM</h4>
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">5min (90 velas)</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">🎯 Foco:</h5>
                                        <p className="text-sm text-gray-700">Tendências de longo prazo em períodos de 7.5 horas</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">📊 Lógica de Força:</h5>
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between"><span>0-20%:</span><span className="text-red-600">Tendência Inversa</span></div>
                                            <div className="flex justify-between"><span>21-40%:</span><span className="text-yellow-600">Formação Lenta</span></div>
                                            <div className="flex justify-between"><span>41-60%:</span><span className="text-blue-600">Desenvolvimento</span></div>
                                            <div className="flex justify-between"><span>61-80%:</span><span className="text-green-600">Tendência Estabelecida</span></div>
                                            <div className="flex justify-between"><span>81-95%:</span><span className="text-green-700">Tendência Sólida</span></div>
                                            <div className="flex justify-between"><span>96-100%:</span><span className="text-green-800 font-bold">LONGO PRAZO</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                                        <h5 className="font-semibold text-gray-800 mb-2">⚙️ Condições:</h5>
                                        <ul className="text-xs text-gray-700 space-y-1">
                                            <li>• RSI(14) &lt; 30 (sobrevenda)</li>
                                            <li>• ROC(7) &gt; 0 (momentum longo)</li>
                                            <li>• Confirmação em 5 velas</li>
                                            <li>• Volume consistente</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descrição Completa Expandível */}
                        <details className="group">
                            <summary className="cursor-pointer text-lg font-bold text-blue-700 hover:text-blue-900 transition-colors flex items-center bg-blue-50 p-4 rounded-xl">
                                <span className="mr-3">📋</span>
                                Detalhamento Completo da Estratégia Multi-Timeframe
                                <span className="ml-3 transform group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-xl border max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                {strategy.description}
                            </div>
                        </details>
                    </div>
                ))}

                {strategies.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhuma estratégia spot encontrada</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpotStrategiesPanel;