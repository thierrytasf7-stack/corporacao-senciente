import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Strategy {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
}

interface BacktestConfig {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  parameters: Record<string, any>;
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
    strategyId: '',
    symbol: 'BTCUSDT',
    startDate: '',
    endDate: '',
    initialCapital: 10000,
    parameters: {},
  });

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  
  const binanceState = useSelector((state: RootState) => state.binance);

  useEffect(() => {
    // Simular carregamento de estratégias
    const loadStrategies = async () => {
      setLoading(true);
      
      // Aguardar um pouco para simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, não há estratégias configuradas
      setStrategies([]);
      setLoading(false);
    };

    loadStrategies();
  }, []);

  const symbols = [
    'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'SOLUSDT',
    'DOTUSDT', 'LINKUSDT', 'AVAXUSDT', 'MATICUSDT', 'UNIUSDT'
  ];

  const handleStrategyChange = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    setSelectedStrategy(strategy || null);
    setConfig(prev => ({
      ...prev,
      strategyId,
      parameters: strategy?.parameters || {},
    }));
  };

  const handleParameterChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.strategyId && config.symbol && config.startDate && config.endDate) {
      onRunBacktest(config);
    }
  };

  const isValidDateRange = () => {
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const now = new Date();
    
    return start < end && end <= now;
  };

  const getEstimatedDuration = () => {
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 30) return '~30 segundos';
    if (days <= 90) return '~1-2 minutos';
    if (days <= 365) return '~3-5 minutos';
    return '~5-10 minutos';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Carregando estratégias...</div>
          </div>
        </div>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma Estratégia Configurada
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Você precisa configurar pelo menos uma estratégia antes de executar backtests.
          </p>
          
          {!binanceState.isConnected ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Conecte-se à Binance primeiro</strong> para configurar estratégias e executar backtests.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-blue-600 mr-2">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <strong>Conectado à Binance</strong> - Configure estratégias na seção de Estratégias para executar backtests.
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">Estratégias</h4>
              <p className="text-sm text-gray-600">Configure estratégias de trading</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-medium text-gray-900 mb-1">Período</h4>
              <p className="text-sm text-gray-600">Defina período histórico</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium text-gray-900 mb-1">Resultados</h4>
              <p className="text-sm text-gray-600">Analise performance</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Configuração do Backtest
        </h2>
        <p className="text-gray-600 mt-1">
          Configure os parâmetros para testar sua estratégia com dados históricos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Strategy Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estratégia
          </label>
          <select
            value={config.strategyId}
            onChange={(e) => handleStrategyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione uma estratégia</option>
            {strategies.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </div>

        {/* Symbol Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Símbolo
          </label>
          <select
            value={config.symbol}
            onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Initial Capital */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capital Inicial (USDT)
          </label>
          <input
            type="number"
            value={config.initialCapital}
            onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            step="100"
            required
          />
        </div>

        {/* Strategy Parameters */}
        {selectedStrategy && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Parâmetros da Estratégia: {selectedStrategy.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedStrategy.parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    value={config.parameters[key] || value}
                    onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation and Info */}
        {config.startDate && config.endDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  {isValidDateRange() ? '✅ Período válido' : '❌ Período inválido'}
                </div>
                <div className="text-sm text-blue-700">
                  Duração estimada: {getEstimatedDuration()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRunning || !isValidDateRange() || !config.strategyId}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              isRunning || !isValidDateRange() || !config.strategyId
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