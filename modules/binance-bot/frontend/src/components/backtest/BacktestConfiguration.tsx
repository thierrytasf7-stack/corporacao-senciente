import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ApiService } from '../../services/api/apiService';

interface BacktestTemplate {
  strategyType: string;
  name: string;
  description: string;
  strategyParams: any;
  initialBalance: number;
}

interface BacktestConfig {
  strategyType: string;
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  strategyParams: any;
}

interface BacktestConfigurationProps {
  onRunBacktest: (config: BacktestConfig) => void;
  isRunning: boolean;
}

export const BacktestConfiguration: React.FC<BacktestConfigurationProps> = ({
  onRunBacktest,
  isRunning,
}) => {
  const [config, setConfig] = useState<BacktestConfig>({
    strategyType: '',
    symbol: 'BTCUSDT',
    interval: '1h',
    startDate: '',
    endDate: '',
    initialBalance: 1000,
    strategyParams: {},
  });

  const [templates, setTemplates] = useState<Record<string, BacktestTemplate>>({});
  const [symbols, setSymbols] = useState<Array<{ symbol: string; name: string; category: string }>>([]);
  const [intervals, setIntervals] = useState<Array<{ interval: string; name: string; category: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const binanceState = useSelector((state: RootState) => state.binance);

  useEffect(() => {
    loadBacktestData();
  }, []);

  const loadBacktestData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [templatesRes, symbolsRes] = await Promise.all([
        ApiService.get('backtest/templates'),
        ApiService.get('backtest/symbols'),
      ]);

      if (templatesRes?.data?.templates) {
        setTemplates(templatesRes.data.templates);
      }
      if (symbolsRes?.data?.symbols) {
        setSymbols(symbolsRes.data.symbols);
      }
      if (symbolsRes?.data?.intervals) {
        setIntervals(symbolsRes.data.intervals);
      }

      // Set default dates (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setConfig(prev => ({
        ...prev,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }));
    } catch (err) {
      console.error('Failed to load backtest data:', err);
      setError('Falha ao carregar dados de backtest. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = (strategyType: string) => {
    const template = templates[strategyType];
    if (template) {
      setConfig(prev => ({
        ...prev,
        strategyType,
        strategyParams: template.strategyParams,
        initialBalance: template.initialBalance || prev.initialBalance,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.strategyType && config.symbol && config.startDate && config.endDate) {
      const template = templates[config.strategyType];
      const params = {
        ...config.strategyParams,
        symbol: config.symbol,
        interval: config.interval,
      };
      onRunBacktest({
        ...config,
        strategyParams: params,
      });
    }
  };

  const isValidDateRange = () => {
    if (!config.startDate || !config.endDate) return false;
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const now = new Date();
    return start < end && end <= now;
  };

  const getEstimatedDuration = () => {
    if (!config.startDate || !config.endDate) return '';
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return '~10 segundos';
    if (days <= 30) return '~30 segundos';
    if (days <= 90) return '~1-2 minutos';
    if (days <= 365) return '~3-5 minutos';
    return '~5-10 minutos';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Carregando configurações de backtest...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Erro ao Carregar</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadBacktestData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const templateKeys = Object.keys(templates);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Configuração do Backtest</h2>
        <p className="text-gray-600 mt-1">Teste estratégias com dados históricos reais da Binance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Strategy Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estratégia</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templateKeys.map((key) => {
              const tmpl = templates[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleStrategyChange(key)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    config.strategyType === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{tmpl.name || key}</div>
                  <div className="text-sm text-gray-500 mt-1">{tmpl.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symbol & Interval */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Par de Trading</label>
            <select
              value={config.symbol}
              onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {symbols.length > 0 ? symbols.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol})</option>
              )) : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo</label>
            <select
              value={config.interval}
              onChange={(e) => setConfig(prev => ({ ...prev, interval: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {intervals.length > 0 ? intervals.map((i) => (
                <option key={i.interval} value={i.interval}>{i.name}</option>
              )) : ['1m', '5m', '15m', '1h', '4h', '1d'].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Initial Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capital Inicial (USDT)</label>
          <input
            type="number"
            value={config.initialBalance}
            onChange={(e) => setConfig(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 1000 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="10"
            max="1000000"
            step="100"
            required
          />
        </div>

        {/* Risk Parameters (when strategy selected) */}
        {config.strategyType && config.strategyParams?.riskParams && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Parâmetros de Risco</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit (%)</label>
                <input
                  type="number"
                  value={config.strategyParams.riskParams.takeProfitPercent}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    strategyParams: {
                      ...prev.strategyParams,
                      riskParams: { ...prev.strategyParams.riskParams, takeProfitPercent: parseFloat(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.5" max="50" step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss (%)</label>
                <input
                  type="number"
                  value={config.strategyParams.riskParams.stopLossPercent}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    strategyParams: {
                      ...prev.strategyParams,
                      riskParams: { ...prev.strategyParams.riskParams, stopLossPercent: parseFloat(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.5" max="20" step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho Posição ($)</label>
                <input
                  type="number"
                  value={config.strategyParams.riskParams.positionSizeUsd}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    strategyParams: {
                      ...prev.strategyParams,
                      riskParams: { ...prev.strategyParams.riskParams, positionSizeUsd: parseFloat(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5" max="10000" step="5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Info */}
        {config.startDate && config.endDate && (
          <div className={`border rounded-lg p-4 ${isValidDateRange() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium ${isValidDateRange() ? 'text-green-900' : 'text-red-900'}`}>
                  {isValidDateRange() ? 'Período válido' : 'Período inválido'}
                </div>
                {isValidDateRange() && (
                  <div className="text-sm text-green-700">Duração estimada: {getEstimatedDuration()}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRunning || !isValidDateRange() || !config.strategyType}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
              isRunning || !isValidDateRange() || !config.strategyType
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executando Backtest...
              </div>
            ) : (
              'Executar Backtest'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
