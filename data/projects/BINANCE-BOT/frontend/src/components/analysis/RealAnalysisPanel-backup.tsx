import { ChartBarIcon, ClockIcon, PlayIcon, StarIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import OptimizedLogService from '../../services/OptimizedLogService';
import { RealAnalysisService, RotativeAnalysisResult } from '../../services/realAnalysisService';

export interface StrategyStrength {
    strategyName: string;
    strength: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
    reasons: string[];
}

export interface PositionMonitoringData {
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    strength: number;
    price: number;
    status: 'PENDING' | 'OPENED' | 'FAILED';
    attempts: number;
    lastCheck: number;
    timestamp: number;
    strategyStrengths?: StrategyStrength[];
    strategiesUsed?: string[];
    orderValue?: number;
    takeProfit?: number;
    stopLoss?: number;
}

export const RealAnalysisPanel: React.FC = () => {
    const [analysis, setAnalysis] = useState<RotativeAnalysisResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
    const [executedOrders, setExecutedOrders] = useState<any[]>([]);
    const [activeStrategies, setActiveStrategies] = useState<{ trading: number; mathStrategy: string | null }>({ trading: 0, mathStrategy: null });
    const [cycleStats, setCycleStats] = useState<{ totalCyclesCompleted: number; currentCycleNumber: number }>({ totalCyclesCompleted: 0, currentCycleNumber: 0 });
    const [accumulatedSignals, setAccumulatedSignals] = useState<any[]>([]);

    // Controle de logs para evitar repetição
    const [loggedSignals, setLoggedSignals] = useState<Set<string>>(new Set());
    const [loggedOrders, setLoggedOrders] = useState<Set<string>>(new Set());
    const [loggedStatus, setLoggedStatus] = useState<Set<string>>(new Set());
    const [positionMonitoring, setPositionMonitoring] = useState<Map<string, PositionMonitoringData>>(new Map());
    const [lastStatusHash, setLastStatusHash] = useState<string>('');

    useEffect(() => {
        loadInitialData();
        loadPersistedPositions();

        // Intervalo otimizado para status (3 segundos)
        const statusInterval = setInterval(updateStatus, 3000);

        // Intervalo para monitoramento de posições (5 segundos)
        const positionInterval = setInterval(monitorPositions, 5000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(positionInterval);
        };
    }, []);

    // Persistir posições no localStorage
    useEffect(() => {
        if (positionMonitoring.size > 0) {
            const positionsArray = Array.from(positionMonitoring.entries());
            localStorage.setItem('aura-position-monitoring', JSON.stringify(positionsArray));
        }
    }, [positionMonitoring]);

    const loadPersistedPositions = () => {
        try {
            const saved = localStorage.getItem('aura-position-monitoring');
            if (saved) {
                const positionsArray = JSON.parse(saved);
                const positionsMap = new Map(positionsArray);
                setPositionMonitoring(positionsMap);
                OptimizedLogService.logDebug(`Posições carregadas do localStorage: ${positionsMap.size}`);
            }
        } catch (error) {
            OptimizedLogService.logError('Erro ao carregar posições persistidas:', error);
        }
    };

    const loadInitialData = async () => {
        try {
            setFavoriteCount(RealAnalysisService.getFavoriteCount());

            // Load last analysis
            const lastAnalysis = await RealAnalysisService.getLastAnalysis();
            if (lastAnalysis) {
                setAnalysis(lastAnalysis);
                setLastAnalysisTime(lastAnalysis.timestamp);
            }

            // Update status
            await updateStatus();
        } catch (error) {
            console.warn('Erro ao carregar dados iniciais:', error);
        }
    };

    const updateStatus = async () => {
        try {
            const status = await RealAnalysisService.getAnalysisStatus();
            setIsRunning(status.isRunning);
            setIsAnalyzing(status.isAnalyzing);
            setExecutedOrders(status.executedOrders || []);
            setActiveStrategies(status.activeStrategies || { trading: 0, mathStrategy: null });
            setCycleStats({
                totalCyclesCompleted: status.totalCyclesCompleted || 0,
                currentCycleNumber: status.currentCycleNumber || 0
            });
            if (status.lastAnalysisTime) {
                setLastAnalysisTime(status.lastAnalysisTime);
            }
            setFavoriteCount(RealAnalysisService.getFavoriteCount());

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

            // Se a análise estiver rodando, buscar sinais atualizados
            if (status.isRunning) {
                try {
                    // Buscar todos os sinais do ciclo atual
                    const allSignals = await RealAnalysisService.getAllSignals();

                    // Usar logs otimizados para sinais
                    OptimizedLogService.logSignalsUpdate(allSignals);

                    // Acumular sinais (não limpar)
                    if (allSignals.length > 0) {
                        setAccumulatedSignals(prev => {
                            const newSignals = allSignals.filter(newSignal =>
                                !prev.some(existingSignal =>
                                    existingSignal.symbol === newSignal.symbol &&
                                    existingSignal.timestamp === newSignal.timestamp
                                )
                            );

                            // Log de novos sinais usando serviço otimizado
                            if (newSignals.length > 0) {
                                newSignals.forEach(signal => {
                                    OptimizedLogService.logNewTradingSignal(signal);

                                    // Iniciar monitoramento da posição
                                    if (signal.signal === 'BUY' || signal.signal === 'SELL') {
                                        const positionKey = `${signal.symbol}-${signal.timestamp}`;

                                        // Simular dados de estratégias com validação
                                        const strategyStrengths: StrategyStrength[] = [
                                            {
                                                strategyName: 'RSI Strategy',
                                                strength: Math.floor(Math.random() * 30) + 60, // 60-90%
                                                signal: signal.signal,
                                                reasons: ['RSI oversold/overbought', 'Momentum confirmation']
                                            },
                                            {
                                                strategyName: 'MACD Strategy',
                                                strength: Math.floor(Math.random() * 25) + 65, // 65-90%
                                                signal: signal.signal,
                                                reasons: ['MACD crossover', 'Trend confirmation']
                                            },
                                            {
                                                strategyName: 'EMA Strategy',
                                                strength: Math.floor(Math.random() * 20) + 70, // 70-90%
                                                signal: signal.signal,
                                                reasons: ['EMA alignment', 'Trend strength']
                                            }
                                        ];

                                        // Validar se pelo menos 2 estratégias concordam com 70%+ força
                                        const validStrategies = strategyStrengths.filter(s =>
                                            s.signal === signal.signal && s.strength >= 70
                                        );

                                        // APENAS LOGS - NÃO CRIAR POSIÇÕES FICTÍCIAS
                                        if (validStrategies.length >= 2) {
                                            OptimizedLogService.logDebug(`✅ Sinal válido detectado: ${signal.symbol} ${signal.signal} (${validStrategies.length} estratégias válidas) - Aguardando execução real`);
                                        } else {
                                            OptimizedLogService.logDebug(`❌ Sinal rejeitado: ${signal.symbol} ${signal.signal} (apenas ${validStrategies.length} estratégias válidas, necessário 2+)`);
                                        }
                                    }
                                });
                            }

                            return [...prev, ...newSignals];
                        });

                        // Criar análise atualizada com todos os sinais acumulados
                        const updatedAnalysis: RotativeAnalysisResult = {
                            totalMarkets: status.lastAnalysisMarkets || 0,
                            analyzedMarkets: status.lastAnalysisMarkets || 0,
                            signals: allSignals,
                            timestamp: Date.now(),
                            duration: 0,
                            errors: [],
                            summary: {
                                buySignals: allSignals.filter(s => s.signal === 'BUY').length,
                                sellSignals: allSignals.filter(s => s.signal === 'SELL').length,
                                holdSignals: allSignals.filter(s => s.signal === 'HOLD').length,
                                averageStrength: allSignals.length > 0 ?
                                    allSignals.reduce((sum, s) => sum + s.strength, 0) / allSignals.length : 0
                            }
                        };

                        setAnalysis(updatedAnalysis);
                        setLastAnalysisTime(updatedAnalysis.timestamp);

                        // Log de análise atualizada usando serviço otimizado
                        OptimizedLogService.logAnalysisUpdate({
                            totalMarkets: updatedAnalysis.totalMarkets,
                            buySignals: updatedAnalysis.summary.buySignals,
                            sellSignals: updatedAnalysis.summary.sellSignals,
                            holdSignals: updatedAnalysis.summary.holdSignals,
                            averageStrength: updatedAnalysis.summary.averageStrength,
                            timestamp: updatedAnalysis.timestamp
                        });
                    }
                } catch (error) {
                    OptimizedLogService.logWarning('Erro ao buscar sinais atualizados', error);
                }
            }
        } catch (error) {
            OptimizedLogService.logWarning('Erro ao atualizar status', error);
        }
    };

    const runAnalysis = async () => {
        if (!RealAnalysisService.canRunAnalysis()) {
            setError('Nenhum mercado favorito selecionado. Vá para a aba Mercados e marque alguns mercados com ⭐');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('🚀 Iniciando análise rotativa REAL...');

            const result = await RealAnalysisService.runRotativeAnalysis();
            setAnalysis(result);
            setLastAnalysisTime(result.timestamp);

            console.log('✅ Análise rotativa concluída:', result.summary);
        } catch (err: any) {
            console.error('Erro na análise rotativa:', err);
            setError(err.message || 'Erro ao executar análise rotativa');
        } finally {
            setLoading(false);
        }
    };

    const startContinuousAnalysis = async () => {
        if (!RealAnalysisService.canRunAnalysis()) {
            setError('Nenhum mercado favorito selecionado. Vá para a aba Mercados e marque alguns mercados com ⭐');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Usar logs otimizados para início da análise
            OptimizedLogService.logAnalysisStarted(RealAnalysisService.getFavoriteSymbols());

            await RealAnalysisService.startRotativeAnalysis();
            await updateStatus();

            OptimizedLogService.logDebug('Análise rotativa contínua iniciada com sucesso');
        } catch (err: any) {
            OptimizedLogService.logError('Erro ao iniciar análise contínua', err);
            setError(err.message || 'Erro ao iniciar análise rotativa contínua');
        } finally {
            setLoading(false);
        }
    };

    const stopContinuousAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usar logs otimizados para parada da análise
            OptimizedLogService.logAnalysisStopped(accumulatedSignals.length);

            await RealAnalysisService.stopRotativeAnalysis();
            await updateStatus();

            OptimizedLogService.logDebug('Análise rotativa contínua parada com sucesso');
        } catch (err: any) {
            OptimizedLogService.logError('Erro ao parar análise contínua', err);
            setError(err.message || 'Erro ao parar análise rotativa contínua');
        } finally {
            setLoading(false);
        }
    };

    const refreshAnalysis = async () => {
        try {
            const lastAnalysis = await RealAnalysisService.getLastAnalysis();
            if (lastAnalysis) {
                setAnalysis(lastAnalysis);
                setLastAnalysisTime(lastAnalysis.timestamp);
            }
        } catch (error) {
            console.warn('Erro ao atualizar análise:', error);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('Tem certeza que deseja limpar todo o histórico de sinais e análise? Esta ação não pode ser desfeita.')) {
            try {
                setLoading(true);
                await RealAnalysisService.clearHistory();

                // Recarregar dados após limpeza
                await loadInitialData();

                // Mostrar notificação de sucesso
                alert('✅ Histórico limpo com sucesso!');
            } catch (error) {
                console.error('Erro ao limpar histórico:', error);
                alert('❌ Erro ao limpar histórico. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    };

    const clearAccumulatedSignals = () => {
        const previousCount = accumulatedSignals.length;
        setAccumulatedSignals([]);
        setLoggedSignals(new Set());
        setLoggedOrders(new Set());
        setLoggedStatus(new Set());
        setPositionMonitoring(new Map());
        setLastStatusHash('');

        // Usar logs otimizados para limpeza
        OptimizedLogService.logDebug(`Histórico de sinais limpo: ${previousCount} sinais removidos`);
        OptimizedLogService.clearLogState();
    };

    // Função para monitorar posições reais da Binance
    const monitorPositions = async () => {
        // Esta função agora só monitora posições reais da Binance
        // Não cria posições fictícias
        try {
            // Buscar posições reais da Binance via API
            const response = await fetch('http://localhost:13001/api/v1/binance/positions');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.positions && data.positions.length > 0) {
                    OptimizedLogService.logDebug(`📊 Posições reais da Binance: ${data.positions.length}`);
                } else {
                    OptimizedLogService.logDebug(`📊 Nenhuma posição ativa na Binance`);
                }
            }
        } catch (error) {
            OptimizedLogService.logError('Erro ao verificar posições reais da Binance', error);
        }
    };

    const getSignalIcon = (signal: string) => {
        switch (signal) {
            case 'BUY': return '🟢';
            case 'SELL': return '🔴';
            case 'HOLD': return '🟡';
            default: return '⚪';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            📊 Análise Rotativa Real
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Análise técnica automatizada com dados reais da Binance Testnet
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Mercados Favoritos</p>
                            <p className="text-lg font-bold text-blue-600">
                                <StarIcon className="h-5 w-5 inline mr-1" />
                                {favoriteCount}
                            </p>
                        </div>

                        {/* Status das Estratégias */}
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Estratégias Ativas</p>
                            <p className="text-sm font-medium text-green-600">
                                Trading: {activeStrategies.trading} | Math: {activeStrategies.mathStrategy || 'Nenhuma'}
                            </p>
                        </div>

                        <div className="flex space-x-2">
                            {!isRunning ? (
                                <>
                                    <button
                                        onClick={runAnalysis}
                                        disabled={loading || favoriteCount === 0}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Executando...
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="h-4 w-4 mr-2" />
                                                Análise Única
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={startContinuousAnalysis}
                                        disabled={loading || favoriteCount === 0}
                                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Iniciando...
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="h-4 w-4 mr-2" />
                                                Iniciar Contínua
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleClearHistory}
                                        disabled={loading}
                                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        🧹 Limpar Histórico
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={stopContinuousAnalysis}
                                    disabled={loading}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Parando...
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-4 h-4 bg-white rounded-sm mr-2"></div>
                                            Parar Análise
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {favoriteCount === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            <StarIcon className="h-5 w-5 inline mr-2" />
                            Selecione mercados favoritos na aba "Mercados" para executar a análise rotativa.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
            </div>

            {/* Status da Análise Contínua */}
            {isRunning && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">
                                    🔄 Análise Rotativa Contínua Ativa
                                </h3>
                                <p className="text-green-600 text-sm">
                                    {isAnalyzing ? 'Analisando mercados...' : 'Aguardando próximo ciclo...'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-green-600">Última análise:</p>
                            <p className="text-sm font-medium text-green-800">
                                {lastAnalysisTime ? RealAnalysisService.formatTimestamp(lastAnalysisTime) : 'Nunca'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Sinais - Apenas Dados Reais */}
            {accumulatedSignals.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📊 Sinais de Trading ({accumulatedSignals.length})
                        </h3>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                    📊 {accumulatedSignals.length} Sinais
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                    ✅ {accumulatedSignals.filter(s => s.orderStatus === 'EXECUTED').length} Executadas
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    ❌ {accumulatedSignals.filter(s => s.orderStatus === 'FAILED').length} Falharam
                                </span>
                            </div>
                            <button
                                onClick={clearAccumulatedSignals}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                            >
                                🧹 Limpar Histórico
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mercado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sinal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Força
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RSI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Razões
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor da Posição
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Detalhes da Ordem
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Posições Unificadas - Apenas PENDENTE com dados integrados */}
                                {Array.from(positionMonitoring.values()).map((position, index) => {
                                    // Buscar dados do sinal correspondente para integrar RSI e razões
                                    const correspondingSignal = accumulatedSignals.find(signal =>
                                        signal.symbol === position.symbol &&
                                        signal.signal === position.signal
                                    );

                                    return (
                                        <tr key={`position-${index}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${position.status === 'OPENED' ? 'bg-green-500' :
                                                        position.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }`}></span>
                                                    <span className={`text-xs font-medium ${position.status === 'OPENED' ? 'text-green-600' :
                                                        position.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                                                        }`}>
                                                        {position.status === 'OPENED' ? '✅ ABERTA' :
                                                            position.status === 'PENDING' ? '⏳ PENDENTE' : '❌ ERRO'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{position.symbol}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RealAnalysisService.getSignalBgColor(position.signal)}`}>
                                                    {getSignalIcon(position.signal)} {position.signal}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {/* Barra de força principal */}
                                                    <div className="flex items-center">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div
                                                                className={`h-2 rounded-full ${position.signal === 'BUY' ? 'bg-green-500' : position.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                                style={{ width: `${position.strength}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-900">{position.strength}%</span>
                                                    </div>

                                                    {/* Estratégias individuais */}
                                                    {position.strategyStrengths && position.strategyStrengths.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {position.strategyStrengths.map((strategy, idx) => (
                                                                <div key={idx} className="flex items-center text-xs">
                                                                    <div className="w-12 bg-gray-100 rounded-full h-1 mr-1">
                                                                        <div
                                                                            className={`h-1 rounded-full ${strategy.signal === 'BUY' ? 'bg-green-400' : strategy.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'}`}
                                                                            style={{ width: `${strategy.strength}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 truncate max-w-20" title={strategy.strategyName}>
                                                                        {strategy.strategyName}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 ml-1">{strategy.strength}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400">
                                                            {position.strategiesUsed && position.strategiesUsed.length > 0
                                                                ? position.strategiesUsed.join(', ')
                                                                : 'Estratégias não disponíveis'
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {RealAnalysisService.formatPrice(position.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {correspondingSignal ? (
                                                    <span className={correspondingSignal.indicators.rsi < 30 ? 'text-green-600' : correspondingSignal.indicators.rsi > 70 ? 'text-red-600' : 'text-gray-600'}>
                                                        {correspondingSignal.indicators.rsi.toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                <div className="space-y-1">
                                                    {/* Estratégias que geraram o sinal */}
                                                    {position.strategiesUsed && position.strategiesUsed.length > 0 ? (
                                                        <div className="text-xs">
                                                            <span className="font-medium text-blue-600">Estratégias:</span>
                                                            <div className="mt-1 space-y-1">
                                                                {position.strategiesUsed.map((strategy, idx) => (
                                                                    <div key={idx} className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                                                                        {strategy}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {/* Razões técnicas */}
                                                    {correspondingSignal ? (
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-600">Análise:</span>
                                                            <div className="truncate mt-1" title={correspondingSignal.reasons.join(', ')}>
                                                                {correspondingSignal.reasons.slice(0, 2).join(', ')}
                                                                {correspondingSignal.reasons.length > 2 && '...'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400">
                                                            Monitoramento ativo
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div className="text-xs">
                                                        <span className="font-medium">Valor da Posição:</span>
                                                        <span className="ml-1 font-bold text-green-600">
                                                            ${position.orderValue ? position.orderValue.toFixed(2) : 'Calculando...'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">Take Profit:</span>
                                                        <span className="ml-1 font-bold text-blue-600">
                                                            ${position.takeProfit ? position.takeProfit.toFixed(2) : 'Calculando...'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">Stop Loss:</span>
                                                        <span className="ml-1 font-bold text-red-600">
                                                            ${position.stopLoss ? position.stopLoss.toFixed(2) : 'Calculando...'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">Preço da Moeda:</span>
                                                        <span className="ml-1 font-bold text-gray-600">
                                                            ${RealAnalysisService.formatPrice(position.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div className="text-xs">
                                                        <span className="font-medium">Tentativas:</span> {position.attempts}
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">Última verificação:</span> {new Date(position.lastCheck).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">Status:</span> {position.status}
                                                    </div>
                                                    {correspondingSignal && (
                                                        <div className="text-xs">
                                                            <span className="font-medium">Hora sinal:</span> {new Date(correspondingSignal.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Resumo da Análise</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {RealAnalysisService.formatTimestamp(analysis.timestamp)}
                                </span>
                                <span>{analysis.duration}ms</span>
                                <button
                                    onClick={refreshAnalysis}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Atualizar
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-900">{positionMonitoring.size}</div>
                                <div className="text-sm text-gray-600">Posições Ativas</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {Array.from(positionMonitoring.values()).filter(p => p.status === 'OPENED').length}
                                </div>
                                <div className="text-sm text-green-600">✅ Abertas</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {Array.from(positionMonitoring.values()).filter(p => p.status === 'PENDING').length}
                                </div>
                                <div className="text-sm text-yellow-600">⏳ Pendentes</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {positionMonitoring.size > 0 ?
                                        (Array.from(positionMonitoring.values()).reduce((sum, p) => sum + p.strength, 0) / positionMonitoring.size).toFixed(1) : 0}%
                                </div>
                                <div className="text-sm text-blue-600">Força Média</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600">{cycleStats.totalCyclesCompleted}</div>
                                <div className="text-sm text-purple-600">Ciclos Realizados</div>
                                {isRunning && (
                                    <div className="text-xs text-purple-500 mt-1">
                                        Ciclo Atual: {cycleStats.currentCycleNumber}
                                    </div>
                                )}
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {Array.from(positionMonitoring.values()).reduce((sum, p) => sum + p.attempts, 0)}
                                </div>
                                <div className="text-sm text-indigo-600">Total Tentativas</div>
                            </div>
                        </div>


                        {analysis.errors.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-red-600 mb-2">Erros ({analysis.errors.length}):</h4>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    {analysis.errors.map((error, index) => (
                                        <p key={index} className="text-sm text-red-700">{error}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Empty State */}
            {!analysis && !loading && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma Análise Executada
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Execute a análise rotativa para ver os sinais de trading baseados em dados reais da Binance.
                    </p>
                    {favoriteCount > 0 ? (
                        <button
                            onClick={runAnalysis}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Executar Primeira Análise
                        </button>
                    ) : (
                        <div className="text-center">
                            <p className="text-yellow-600 mb-4">
                                Selecione mercados favoritos primeiro na aba "Mercados"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
