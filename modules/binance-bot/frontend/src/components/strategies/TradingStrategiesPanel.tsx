import {
    ChartBarIcon,
    ClockIcon,
    CogIcon,
    PlayIcon,
    PlusIcon,
    StopIcon,
    TrashIcon
} from '@heroicons/react/24/outline/index.js';
import React, { useEffect, useState } from 'react';
import ApiService from '../../services/api/apiService';

interface TradingStrategy {
    id: string;
    name: string;
    description: string;
    timeframe: '10s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    isActive: boolean;
    isFavorite: boolean;
    maxCandles: number;
    indicators: any;
    rules: any;
    createdAt: string;
    updatedAt: string;
}

interface TradingStrategiesPanelProps {
    className?: string;
}

export const TradingStrategiesPanel: React.FC<TradingStrategiesPanelProps> = ({ className = '' }) => {
    const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'10s' | '1m' | '5m'>('10s');
    const [showCreateForm, setShowCreateForm] = useState(false);

    const timeframeLabels = {
        '10s': '10 Segundos (Scalping Ultra-Rápido)',
        '1m': '1 Minuto (Scalping Rápido)',
        '5m': '5 Minutos (Swing Trading)'
    };

    const timeframeColors = {
        '10s': 'bg-red-100 text-red-800 border-red-200',
        '1m': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        '5m': 'bg-green-100 text-green-800 border-green-200'
    };

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            setLoading(true);
            const data = await ApiService.get('trading-strategies');

            if (data.success) {
                setStrategies(data.strategies);
            }
        } catch (error) {
            console.error('Erro ao buscar estratégias:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStrategy = async (strategyId: string) => {
        try {
            await ApiService.post(`trading-strategies/${strategyId}/toggle`);
            await fetchStrategies();
        } catch (error) {
            console.error('Erro ao alternar estratégia:', error);
        }
    };

    const toggleFavorite = async (strategyId: string) => {
        try {
            await ApiService.post(`trading-strategies/${strategyId}/toggle-favorite`);
            await fetchStrategies();
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
        }
    };

    const deleteStrategy = async (strategyId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta estratégia?')) return;

        try {
            await ApiService.delete(`trading-strategies/${strategyId}`);
            await fetchStrategies();
        } catch (error) {
            console.error('Erro ao excluir estratégia:', error);
        }
    };

    const getStrategiesByTimeframe = (timeframe: string) => {
        return strategies.filter(s => s.timeframe === timeframe);
    };

    const getIndicatorSummary = (strategy: TradingStrategy) => {
        const indicators = [];
        if (strategy.indicators.rsi) indicators.push('RSI');
        if (strategy.indicators.macd) indicators.push('MACD');
        if (strategy.indicators.bollingerBands) indicators.push('Bollinger Bands');
        if (strategy.indicators.movingAverage) indicators.push('Moving Average');
        if (strategy.indicators.volume) indicators.push('Volume');
        return indicators.join(', ');
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Estratégias de Trading por Timeframe
                    </h3>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Nova Estratégia</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {(['10s', '1m', '5m'] as const).map((timeframe) => (
                    <button
                        key={timeframe}
                        onClick={() => setActiveTab(timeframe)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === timeframe
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{timeframeLabels[timeframe]}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Strategies List */}
            <div className="space-y-4">
                {getStrategiesByTimeframe(activeTab).map((strategy) => (
                    <div
                        key={strategy.id}
                        className={`border rounded-lg p-4 transition-all ${strategy.isActive
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {strategy.name}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${timeframeColors[strategy.timeframe]}`}>
                                        {strategy.timeframe}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${strategy.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {strategy.isActive ? 'ATIVA' : 'INATIVA'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                    {strategy.description}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Indicadores:</span>
                                        <p className="text-gray-600">{getIndicatorSummary(strategy)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Leitura de Velas:</span>
                                        <p className="text-gray-600">30 velas de 1 minuto (padronizado)</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Força da Estratégia:</span>
                                        <p className="text-gray-600">Derivada das regras/indicadores desta estratégia</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                                            Ver regras de leitura de velas e sinais
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <span className="font-medium text-green-700">Condições de Compra (Sinal BUY):</span>
                                                <ul className="list-disc list-inside text-gray-600 ml-2">
                                                    {strategy.rules.buyConditions.map((condition: string, index: number) => (
                                                        <li key={index}>{condition}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium text-red-700">Condições de Saída/Sinal CONTRÁRIO:</span>
                                                <ul className="list-disc list-inside text-gray-600 ml-2">
                                                    {strategy.rules.sellConditions.map((condition: string, index: number) => (
                                                        <li key={index}>{condition}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <p className="text-xs text-gray-500">Observação: Stop Loss, Take Profit, valor de aposta e limites de posições são definidos nas Estratégias Matemáticas.</p>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <button
                                    onClick={() => toggleFavorite(strategy.id)}
                                    className={`p-2 rounded-md transition-colors ${strategy.isFavorite
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title={strategy.isFavorite ? 'Remover dos Favoritos' : 'Marcar como Favorita'}
                                >
                                    <span className="text-sm">⭐</span>
                                </button>
                                <button
                                    onClick={() => toggleStrategy(strategy.id)}
                                    className={`p-2 rounded-md transition-colors ${strategy.isActive
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                    title={strategy.isActive ? 'Desativar' : 'Ativar'}
                                >
                                    {strategy.isActive ? (
                                        <StopIcon className="w-4 h-4" />
                                    ) : (
                                        <PlayIcon className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => deleteStrategy(strategy.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {getStrategiesByTimeframe(activeTab).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <CogIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma estratégia encontrada para este timeframe.</p>
                        <p className="text-sm">Clique em "Nova Estratégia" para criar uma.</p>
                    </div>
                )}
            </div>

            {/* Create Strategy Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Criar Nova Estratégia</h3>
                        <p className="text-gray-600 mb-4">
                            Funcionalidade em desenvolvimento. Estratégias de Trading são descrições de regras de leitura de velas e geração de sinais. Características financeiras (aposta, TP/SL, limites) são definidas na aba de Estratégias Matemáticas.
                        </p>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradingStrategiesPanel;
