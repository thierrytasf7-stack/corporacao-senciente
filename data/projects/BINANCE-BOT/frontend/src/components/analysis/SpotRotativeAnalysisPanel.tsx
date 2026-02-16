import React, { useEffect, useState } from 'react';

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

interface CycleSummary {
    cycleNumber: number;
    timestamp: string;
    signalsGenerated: number;
    executionsPerformed: number;
    signalsByMarket: { [market: string]: number };
    table: SpotSignalsTable[];
}

interface EmittedSignal {
    id: string;
    timestamp: string;
    market: string;
    signals: {
        strategyId: string;
        timeframe: string;
        strength: number;
        diagnostics: string;
    }[];
    positionValue: number; // Valor em USD da posição
    status: 'pending' | 'executed' | 'failed';
    executionDetails?: {
        quantity: number; // Quantidade da moeda
        price: number; // Preço de execução
        finalValueUSD: number; // Valor final em USD
        orderId?: string;
        error?: string;
    };
    stopWinLoss?: {
        takeProfitPercentage: number;
        stopLossPercentage: number;
        takeProfitPrice: number;
        stopLossPrice: number;
    };
}

interface RotativeAnalysisConfig {
    minSignalsRequired: number;
    minSignalStrength: number;
    cycleIntervalMs: number;
    maxHistoryTables: number;
}

interface RotativeAnalysisStatus {
    isRunning: boolean;
    currentCycle: number;
    totalCycles: number;
    totalSignals: number;
    totalExecutions: number;
    lastUpdate: string;
    config: RotativeAnalysisConfig;
    cycleHistory: CycleSummary[];
    currentTable: SpotSignalsTable[];
    tradingStrategies: string[];
    favoriteSymbols: string[];
    mathStrategy: string;
}

const SpotRotativeAnalysisPanel: React.FC = () => {
    const [status, setStatus] = useState<RotativeAnalysisStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCycles, setExpandedCycles] = useState<Set<number>>(new Set());
    const [emittedSignals, setEmittedSignals] = useState<EmittedSignal[]>([]);
    const [config, setConfig] = useState<RotativeAnalysisConfig>({
        minSignalsRequired: 3,
        minSignalStrength: 90,
        cycleIntervalMs: 10000,
        maxHistoryTables: 10
    });

    // Pagination state
    const [cyclesPage, setCyclesPage] = useState(1);
    const [cyclesPageSize] = useState(20);
    const [cyclesTotal, setCyclesTotal] = useState(0);
    const [executionsPage, setExecutionsPage] = useState(1);
    const [executionsPageSize] = useState(20);
    const [executionsTotal, setExecutionsTotal] = useState(0);

    // Carregar status inicial
    useEffect(() => {
        fetchStatus();
    }, []);

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

    const fetchStatus = async () => {
        try {
            setLoading(true);

            // Obter mercados favoritos do localStorage
            const marketFavorites = fetchMarketFavorites();
            console.log('📊 [FRONTEND] Enviando mercados favoritos para backend:', marketFavorites);

            const response = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    favoriteMarkets: marketFavorites
                })
            });
            const data = await response.json();

            if (data.success) {
                setStatus(data.data);
                setConfig(data.data.config);
            } else {
                setError(data.message);
            }

            // Buscar sinais emitidos e ciclos paginados também
            await fetchEmittedSignals();
            await fetchCycles();
        } catch (err: any) {
            setError('Erro ao carregar status: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const startAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Análise rotativa iniciada');
                await fetchStatus();
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError('Erro ao iniciar análise: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const stopAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                console.log('🛑 Análise rotativa parada');
                await fetchStatus();
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError('Erro ao parar análise: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const performSimpleAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 [ANÁLISE SIMPLES] Iniciando análise...');

            const response = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/simple-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('🔍 [ANÁLISE SIMPLES] Resposta recebida:', response.status);

            const data = await response.json();
            console.log('🔍 [ANÁLISE SIMPLES] Dados recebidos:', data);

            if (data.success) {
                console.log('✅ [ANÁLISE SIMPLES] Análise executada com sucesso!');
                console.log('📊 [ANÁLISE SIMPLES] Mercados analisados:', data.data?.signalsTable?.length || 0);

                // Atualizar apenas a tabela de sinais diretamente
                setStatus(prev => prev ? {
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
            setError('Erro na análise simples: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (data.success) {
                console.log('⚙️ Configuração atualizada');
                await fetchStatus();
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError('Erro ao atualizar configuração: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSignalStrengthColor = (strength: number) => {
        if (strength >= 90) return 'bg-green-100 text-green-800 border-green-300';
        if (strength >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (strength >= 50) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    const toggleCycleExpansion = (cycleNumber: number) => {
        setExpandedCycles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cycleNumber)) {
                newSet.delete(cycleNumber);
            } else {
                newSet.add(cycleNumber);
            }
            return newSet;
        });
    };

    const fetchEmittedSignals = async (page: number = executionsPage) => {
        try {
            const response = await fetch(`http://127.0.0.1:23231/api/v1/spot-rotative-analysis/emitted-signals?page=${page}&pageSize=${executionsPageSize}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                setEmittedSignals(data.data.items || []);
                setExecutionsTotal(data.data.total || 0);
            } else {
                console.error('❌ Erro ao buscar sinais emitidos:', data.message);
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar sinais emitidos:', err.message);
        }
    };

    const fetchCycles = async (page: number = cyclesPage) => {
        try {
            const response = await fetch(`http://127.0.0.1:23231/api/v1/spot-rotative-analysis/cycles?page=${page}&pageSize=${cyclesPageSize}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                // Update the cycleHistory in status
                setStatus(prev => prev ? {
                    ...prev,
                    cycleHistory: data.data.items
                } : null);
                setCyclesTotal(data.data.total || 0);
            } else {
                console.error('❌ Erro ao buscar ciclos:', data.message);
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar ciclos:', err.message);
        }
    };

    const clearHistories = async () => {
        try {
            setLoading(true);

            // Limpar execuções
            const execResponse = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/clear-executions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            // Limpar ciclos
            const cyclesResponse = await fetch('http://127.0.0.1:23231/api/v1/spot-rotative-analysis/clear-cycles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (execResponse.ok && cyclesResponse.ok) {
                // Limpar estados do frontend
                setEmittedSignals([]);
                setExecutionsPage(1);
                setExecutionsTotal(0);

                // Limpar cycleHistory do status
                setStatus(prev => prev ? {
                    ...prev,
                    cycleHistory: [],
                    totalCycles: 0,
                    currentCycle: 0
                } : null);

                setCyclesPage(1);
                setCyclesTotal(0);

                alert('Históricos limpos com sucesso!');
            } else {
                alert('Erro ao limpar históricos');
            }
        } catch (err: any) {
            console.error('Erro ao limpar históricos:', err);
            alert('Erro ao limpar históricos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Análise Rotativa Spot</h2>
                    <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${status?.isRunning
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {status?.isRunning ? '🟢 Executando' : '⏸️ Pausado'}
                        </div>
                        <button
                            onClick={fetchStatus}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            🔄 Atualizar
                        </button>
                        <button
                            onClick={clearHistories}
                            disabled={loading}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 ml-2"
                        >
                            🗑️ Limpar Históricos
                        </button>
                    </div>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-600">Ciclo Atual</div>
                        <div className="text-2xl font-bold text-blue-800">{status?.currentCycle || 0}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-600">Total de Sinais</div>
                        <div className="text-2xl font-bold text-green-800">{status?.totalSignals || 0}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-purple-600">Execuções</div>
                        <div className="text-2xl font-bold text-purple-800">{status?.totalExecutions || 0}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-orange-600">Última Atualização</div>
                        <div className="text-sm font-bold text-orange-800">
                            {status?.lastUpdate ? formatTime(status.lastUpdate) : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Resumo Informativo */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Estratégias Favoritas */}
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                                <span className="text-yellow-500 mr-2">⭐</span>
                                Estratégias Favoritas
                            </h3>
                            {status?.tradingStrategies && status.tradingStrategies.length > 0 ? (
                                <div className="space-y-2">
                                    {status.tradingStrategies.map((strategy, index) => (
                                        <div key={index} className="bg-white rounded-lg p-2 shadow-sm border border-blue-100">
                                            <div className="font-medium text-blue-800">{strategy}</div>
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
                            {status?.favoriteSymbols && status.favoriteSymbols.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {status.favoriteSymbols.map((symbol, index) => (
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
                            {status?.mathStrategy ? (
                                <div className="bg-white rounded-lg p-2 shadow-sm border border-green-100">
                                    <div className="font-medium text-green-800">{status.mathStrategy}</div>
                                </div>
                            ) : (
                                <div className="text-green-600 text-sm">Nenhuma estratégia matemática ativa</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={startAnalysis}
                        disabled={loading || status?.isRunning}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ▶️ Iniciar Análise
                    </button>
                    <button
                        onClick={stopAnalysis}
                        disabled={loading || !status?.isRunning}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ⏹️ Parar Análise
                    </button>
                    <button
                        onClick={performSimpleAnalysis}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        🔍 Análise Simples
                    </button>
                </div>
            </div>

            {/* Configuração */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Configuração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sinais Necessários
                        </label>
                        <input
                            type="number"
                            value={config.minSignalsRequired}
                            onChange={(e) => setConfig({ ...config, minSignalsRequired: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max="10"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Força Mínima (%)
                        </label>
                        <input
                            type="number"
                            value={config.minSignalStrength}
                            onChange={(e) => setConfig({ ...config, minSignalStrength: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="50"
                            max="100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Intervalo (ms)
                        </label>
                        <input
                            type="number"
                            value={config.cycleIntervalMs}
                            onChange={(e) => setConfig({ ...config, cycleIntervalMs: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="5000"
                            max="60000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Histórico Máximo
                        </label>
                        <input
                            type="number"
                            value={config.maxHistoryTables}
                            onChange={(e) => setConfig({ ...config, maxHistoryTables: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="5"
                            max="20"
                        />
                    </div>
                </div>
                <button
                    onClick={updateConfig}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                    💾 Salvar Configuração
                </button>
            </div>

            {/* Lista de Execuções Emitidas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">📡 Lista de Execuções Emitidas</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Total: {executionsTotal} execuções
                        </span>
                        <button
                            onClick={() => fetchEmittedSignals(executionsPage)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                {emittedSignals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>Nenhuma execução emitida ainda</p>
                        <p className="text-sm">As execuções aparecerão aqui quando a análise rotativa estiver ativa</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {emittedSignals.map((signal) => (
                            <div key={signal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-bold text-gray-600">
                                            {formatTime(signal.timestamp)}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
                                            {signal.market}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${signal.status === 'executed' ? 'bg-green-100 text-green-800' :
                                            signal.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {signal.status === 'executed' ? '✅ Executado' :
                                                signal.status === 'failed' ? '❌ Falhou' :
                                                    '⏳ Pendente'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            ${signal.positionValue?.toFixed(2) || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">Valor da Posição</div>
                                    </div>
                                </div>

                                {/* Sinais que geraram execução */}
                                <div className="mb-3">
                                    <div className="text-sm font-bold text-gray-700 mb-2">Sinais que Geraram Execução:</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {signal.signals.map((s, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 rounded p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {s.strategyId} ({s.timeframe})
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getSignalStrengthColor(s.strength)}`}>
                                                        {s.strength.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1 truncate" title={s.diagnostics}>
                                                    {s.diagnostics}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detalhes da Execução */}
                                {signal.executionDetails && (
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="text-sm font-bold text-gray-700 mb-2">Detalhes da Execução:</div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Quantidade</div>
                                                <div className="font-bold">{signal.executionDetails?.quantity?.toFixed(6) || 'N/A'} {signal.market.replace('USDT', '')}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Valor USD</div>
                                                <div className="font-bold">${signal.executionDetails?.finalValueUSD?.toFixed(2) || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Preço</div>
                                                <div className="font-bold">${signal.executionDetails?.price?.toFixed(4) || 'N/A'}</div>
                                            </div>
                                            {signal.executionDetails.orderId && (
                                                <div>
                                                    <div className="text-gray-500">Order ID</div>
                                                    <div className="font-bold text-xs">{signal.executionDetails.orderId}</div>
                                                </div>
                                            )}
                                        </div>
                                        {signal.executionDetails.error && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                                <strong>Erro:</strong> {signal.executionDetails.error}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Configurações de Stop Win/Loss */}
                                {signal.stopWinLoss && (
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="text-sm font-bold text-gray-700 mb-2">🎯 Stop Win/Loss:</div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Take Profit</div>
                                                <div className="font-bold text-green-600">+{signal.stopWinLoss.takeProfitPercentage}%</div>
                                                <div className="text-xs text-gray-400">${signal.stopWinLoss.takeProfitPrice.toFixed(4)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Stop Loss</div>
                                                <div className="font-bold text-red-600">-{signal.stopWinLoss.stopLossPercentage}%</div>
                                                <div className="text-xs text-gray-400">${signal.stopWinLoss.stopLossPrice.toFixed(4)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Lucro Potencial</div>
                                                <div className="font-bold text-green-600">${((signal.executionDetails?.finalValueUSD || 0) * signal.stopWinLoss.takeProfitPercentage / 100).toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Perda Máxima</div>
                                                <div className="font-bold text-red-600">${((signal.executionDetails?.finalValueUSD || 0) * signal.stopWinLoss.stopLossPercentage / 100).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls for Executions */}
                {executionsTotal > executionsPageSize && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Página {executionsPage} de {Math.ceil(executionsTotal / executionsPageSize)} ({executionsTotal} execuções total)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    const newPage = Math.max(1, executionsPage - 1);
                                    setExecutionsPage(newPage);
                                    fetchEmittedSignals(newPage);
                                }}
                                disabled={executionsPage <= 1 || loading}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                            >
                                ← Anterior
                            </button>
                            <button
                                onClick={() => {
                                    const newPage = Math.min(Math.ceil(executionsTotal / executionsPageSize), executionsPage + 1);
                                    setExecutionsPage(newPage);
                                    fetchEmittedSignals(newPage);
                                }}
                                disabled={executionsPage >= Math.ceil(executionsTotal / executionsPageSize) || loading}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                            >
                                Próxima →
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* Histórico de Ciclos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">📈 Histórico de Ciclos</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Total: {cyclesTotal} ciclos
                        </span>
                        <button
                            onClick={() => fetchCycles(cyclesPage)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                {status?.cycleHistory && status.cycleHistory.length > 0 ? (
                    <div className="space-y-4">
                        {status.cycleHistory.map((cycle, index) => {
                            const isExpanded = expandedCycles.has(cycle.cycleNumber);
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-gray-800">Ciclo #{cycle.cycleNumber}</h4>
                                            <button
                                                onClick={() => toggleCycleExpansion(cycle.cycleNumber)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title={isExpanded ? "Retrair análise" : "Expandir análise"}
                                            >
                                                <span className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-600">{formatTime(cycle.timestamp)}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{cycle.signalsGenerated}</div>
                                            <div className="text-sm text-gray-600">Sinais Gerados</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{cycle.executionsPerformed}</div>
                                            <div className="text-sm text-gray-600">Execuções</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Object.keys(cycle.signalsByMarket).length}
                                            </div>
                                            <div className="text-sm text-gray-600">Mercados</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Sinais por mercado:</strong> {Object.entries(cycle.signalsByMarket)
                                            .map(([market, count]) => `${market}: ${count}`)
                                            .join(', ')}
                                    </div>

                                    {/* Análise Expandida */}
                                    {isExpanded && cycle.table && cycle.table.length > 0 && (
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <h5 className="font-bold text-gray-700 mb-3">📊 Análise Completa do Ciclo #{cycle.cycleNumber}</h5>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full bg-white border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-800 text-sm">
                                                                Mercado
                                                            </th>
                                                            {cycle.table[0]?.strategies && Object.keys(cycle.table[0].strategies).map((strategyId: string, strategyIndex: number) => (
                                                                <th key={strategyIndex} className="border border-gray-300 px-3 py-2 text-center font-bold text-gray-800 text-sm">
                                                                    {strategyId}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cycle.table.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                                                <td className="border border-gray-300 px-3 py-2 font-bold text-gray-800 text-sm">
                                                                    {row.market}
                                                                </td>
                                                                {row.strategies && Object.keys(row.strategies).map((strategyId: string, signalIndex: number) => {
                                                                    const signal = row.strategies[strategyId];
                                                                    return (
                                                                        <td key={signalIndex} className="border border-gray-300 px-3 py-2 text-center">
                                                                            <div className="space-y-2">
                                                                                {/* Timeframe 1min */}
                                                                                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-xs font-bold text-blue-800">⚡ 1m</span>
                                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getSignalStrengthColor(signal?.timeframe1m?.strength || 0)}`}>
                                                                                            {(signal?.timeframe1m?.strength || 0).toFixed(1)}%
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-600 truncate" title={signal?.timeframe1m?.diagnostics || 'N/A'}>
                                                                                        {signal?.timeframe1m?.diagnostics || 'N/A'}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Timeframe 3min */}
                                                                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-xs font-bold text-green-800">📈 3m</span>
                                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getSignalStrengthColor(signal?.timeframe3m?.strength || 0)}`}>
                                                                                            {(signal?.timeframe3m?.strength || 0).toFixed(1)}%
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-600 truncate" title={signal?.timeframe3m?.diagnostics || 'N/A'}>
                                                                                        {signal?.timeframe3m?.diagnostics || 'N/A'}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Timeframe 5min */}
                                                                                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-xs font-bold text-purple-800">🚀 5m</span>
                                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getSignalStrengthColor(signal?.timeframe5m?.strength || 0)}`}>
                                                                                            {(signal?.timeframe5m?.strength || 0).toFixed(1)}%
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-600 truncate" title={signal?.timeframe5m?.diagnostics || 'N/A'}>
                                                                                        {signal?.timeframe5m?.diagnostics || 'N/A'}
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
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>Nenhum ciclo encontrado</p>
                        <p className="text-sm">Os ciclos aparecerão aqui quando a análise rotativa estiver ativa</p>
                    </div>
                )}

                {/* Pagination Controls for Cycles */}
                {cyclesTotal > cyclesPageSize && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Página {cyclesPage} de {Math.ceil(cyclesTotal / cyclesPageSize)} ({cyclesTotal} ciclos total)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    const newPage = Math.max(1, cyclesPage - 1);
                                    setCyclesPage(newPage);
                                    fetchCycles(newPage);
                                }}
                                disabled={cyclesPage <= 1 || loading}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                            >
                                ← Anterior
                            </button>
                            <button
                                onClick={() => {
                                    const newPage = Math.min(Math.ceil(cyclesTotal / cyclesPageSize), cyclesPage + 1);
                                    setCyclesPage(newPage);
                                    fetchCycles(newPage);
                                }}
                                disabled={cyclesPage >= Math.ceil(cyclesTotal / cyclesPageSize) || loading}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                            >
                                Próxima →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-red-600 mr-2">❌</span>
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-blue-600 mr-2">⏳</span>
                        <span className="text-blue-800">Carregando...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpotRotativeAnalysisPanel;
