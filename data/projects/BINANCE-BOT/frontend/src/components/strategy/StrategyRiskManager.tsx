import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

interface RiskProfile {
    id: string;
    name: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE';
    displayName: string;
    description: string;
    stopLoss: number;
    takeProfit: number;
    riskRewardRatio: number;
    color: string;
}

interface StrategyRiskConfig {
    strategyId: string;
    strategyName: string;
    timeframe: string;
    currentProfile: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE';
    profiles: {
        AGGRESSIVE: RiskProfile;
        CONSERVATIVE: RiskProfile;
        MODERATE: RiskProfile;
    };
    createdAt: string;
    updatedAt: string;
}

const StrategyRiskManager: React.FC = () => {
    const [configs, setConfigs] = useState<StrategyRiskConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchRiskConfigs = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:23231/api/v1'}/strategy-risk/configs`);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setConfigs(data.configs);
            } else {
                throw new Error(data.error || 'Erro ao carregar configurações');
            }
        } catch (err: any) {
            setError('Erro ao carregar configurações de risco: ' + err.message);
            console.error('Erro ao carregar configurações de risco:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateRiskProfile = async (strategyId: string, profile: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE') => {
        try {
            setUpdating(strategyId);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:23231/api/v1'}/strategy-risk/config/${strategyId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ profile })
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Atualizar a configuração local
                setConfigs(prev => prev.map(config =>
                    config.strategyId === strategyId
                        ? { ...config, currentProfile: profile, updatedAt: new Date().toISOString() }
                        : config
                ));

                console.log(`✅ Perfil de risco atualizado para ${profile}`);
            } else {
                throw new Error(data.error || 'Erro ao atualizar perfil');
            }
        } catch (err: any) {
            setError('Erro ao atualizar perfil de risco: ' + err.message);
            console.error('Erro ao atualizar perfil de risco:', err);
        } finally {
            setUpdating(null);
        }
    };

    useEffect(() => {
        fetchRiskConfigs();
    }, []);

    const getProfileColor = (profile: RiskProfile) => {
        switch (profile.name) {
            case 'AGGRESSIVE':
                return 'border-red-500 bg-red-50';
            case 'CONSERVATIVE':
                return 'border-green-500 bg-green-50';
            case 'MODERATE':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    const getProfileTextColor = (profile: RiskProfile) => {
        switch (profile.name) {
            case 'AGGRESSIVE':
                return 'text-red-700';
            case 'CONSERVATIVE':
                return 'text-green-700';
            case 'MODERATE':
                return 'text-yellow-700';
            default:
                return 'text-gray-700';
        }
    };

    const formatPercentage = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const formatTimeframe = (timeframe: string) => {
        const timeframeMap: { [key: string]: string } = {
            '10s': '10 Segundos',
            '1m': '1 Minuto',
            '5m': '5 Minutos',
            '15m': '15 Minutos',
            '1h': '1 Hora',
            '4h': '4 Horas',
            '1d': '1 Dia'
        };
        return timeframeMap[timeframe] || timeframe;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Carregando configurações de risco...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
                <button
                    onClick={fetchRiskConfigs}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciador de Perfis de Risco</h1>
                <button
                    onClick={fetchRiskConfigs}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Carregando...' : 'Atualizar'}
                </button>
            </div>

            <div className="grid gap-6">
                {configs.map((config) => (
                    <div key={config.strategyId} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{config.strategyName}</h2>
                                <p className="text-sm text-gray-500">Timeframe: {formatTimeframe(config.timeframe)}</p>
                                <p className="text-sm text-gray-500">ID: {config.strategyId}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm text-gray-500">Perfil Atual:</span>
                                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getProfileColor(config.profiles[config.currentProfile])} ${getProfileTextColor(config.profiles[config.currentProfile])}`}>
                                    {config.profiles[config.currentProfile].displayName}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['AGGRESSIVE', 'MODERATE', 'CONSERVATIVE'] as const).map((profileKey) => {
                                const profile = config.profiles[profileKey];
                                const isCurrent = config.currentProfile === profileKey;
                                const isUpdating = updating === config.strategyId;

                                return (
                                    <div
                                        key={profileKey}
                                        className={`border-2 rounded-lg p-4 transition-all ${isCurrent
                                            ? getProfileColor(profile)
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className={`font-semibold ${getProfileTextColor(profile)}`}>
                                                {profile.displayName}
                                            </h3>
                                            {isCurrent && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Ativo
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">
                                            {profile.description}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Stop Loss:</span>
                                                <span className="text-sm font-medium text-red-600">
                                                    {formatPercentage(-profile.stopLoss)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Take Profit:</span>
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatPercentage(profile.takeProfit)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Risco/Retorno:</span>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {profile.riskRewardRatio.toFixed(2)}:1
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => updateRiskProfile(config.strategyId, profileKey)}
                                            disabled={isCurrent || isUpdating}
                                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${isCurrent
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : isUpdating
                                                    ? 'bg-blue-300 text-blue-600 cursor-wait'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {isCurrent
                                                ? 'Perfil Ativo'
                                                : isUpdating
                                                    ? 'Atualizando...'
                                                    : 'Ativar Perfil'
                                            }
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {configs.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Nenhuma Configuração Encontrada
                    </h3>
                    <p className="text-gray-600">
                        As configurações de risco das estratégias serão criadas automaticamente.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StrategyRiskManager;
