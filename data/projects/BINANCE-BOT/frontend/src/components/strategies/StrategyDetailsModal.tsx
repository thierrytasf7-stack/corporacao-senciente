import React from 'react';

interface StrategyConfig {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
  buyThreshold: number;
  sellThreshold: number;
  quantity: number;
  maxPositions: number;
  stopLoss: number;
  takeProfit: number;
  description: string;
  strategyType: 'SCALPING' | 'SWING' | 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT';
  timeframes: string[];
  indicators: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

interface StrategyStats {
  totalSignals: number;
  executedSignals: number;
  successRate: number;
  totalPnl: number;
  openPositions: number;
  closedPositions: number;
}

interface StrategyDetailsModalProps {
  strategy: StrategyConfig | null;
  stats: StrategyStats | null;
  isOpen: boolean;
  onClose: () => void;
}

const StrategyDetailsModal: React.FC<StrategyDetailsModalProps> = ({
  strategy,
  stats,
  isOpen,
  onClose
}) => {
  if (!isOpen || !strategy) return null;

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'SCALPING': return 'bg-red-100 text-red-800';
      case 'TREND_FOLLOWING': return 'bg-blue-100 text-blue-800';
      case 'MEAN_REVERSION': return 'bg-green-100 text-green-800';
      case 'SWING': return 'bg-purple-100 text-purple-800';
      case 'BREAKOUT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{strategy.name}</h2>
            <p className="text-gray-600 mt-1">{strategy.symbol}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                strategy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {strategy.isActive ? '🟢 Ativa' : '🔴 Inativa'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tipo de Estratégia</h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStrategyTypeColor(strategy.strategyType)}`}>
                {strategy.strategyType.replace('_', ' ')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nível de Risco</h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(strategy.riskLevel)}`}>
                {strategy.riskLevel}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📝 Descrição da Estratégia</h3>
            <p className="text-blue-700">{strategy.description}</p>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configurações</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-medium">{strategy.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máx. Posições:</span>
                  <span className="font-medium">{strategy.maxPositions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stop Loss:</span>
                  <span className="font-medium text-red-600">{strategy.stopLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Take Profit:</span>
                  <span className="font-medium text-green-600">{strategy.takeProfit}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Threshold Compra:</span>
                  <span className="font-medium">{strategy.buyThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Threshold Venda:</span>
                  <span className="font-medium">{strategy.sellThreshold}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Indicadores Técnicos</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Timeframes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {strategy.timeframes.map((tf, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Indicadores:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {strategy.indicators.map((indicator, index) => (
                      <span key={index} className="bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Estatísticas de Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSignals}</div>
                  <div className="text-sm text-gray-600">Total de Sinais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.executedSignals}</div>
                  <div className="text-sm text-gray-600">Sinais Executados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.totalPnl.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">PnL Total</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{stats.openPositions}</div>
                  <div className="text-sm text-gray-600">Posições Abertas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">{stats.closedPositions}</div>
                  <div className="text-sm text-gray-600">Posições Fechadas</div>
                </div>
              </div>
            </div>
          )}

          {/* Informações de Criação */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">📅 Informações de Criação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Criada em:</span>
                <span className="ml-2 font-medium">{formatDate(strategy.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Última atualização:</span>
                <span className="ml-2 font-medium">{formatDate(strategy.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Lógica da Estratégia */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧠 Lógica da Estratégia</h3>
            <div className="space-y-3 text-yellow-700">
              {strategy.strategyType === 'SCALPING' && (
                <div>
                  <p><strong>Scalping:</strong> Estratégia de alta frequência que busca pequenos movimentos de preço. 
                  Entra em posições quando RSI está oversold/overbought com volume acima da média.</p>
                </div>
              )}
              {strategy.strategyType === 'TREND_FOLLOWING' && (
                <div>
                  <p><strong>Trend Following:</strong> Segue a tendência do mercado usando médias móveis. 
                  Compra quando preço está acima da SMA20 em tendência de alta, vende quando está abaixo em tendência de baixa.</p>
                </div>
              )}
              {strategy.strategyType === 'MEAN_REVERSION' && (
                <div>
                  <p><strong>Mean Reversion:</strong> Acredita que preços voltam à média. 
                  Compra quando preço está muito abaixo da média (oversold), vende quando está muito acima (overbought).</p>
                </div>
              )}
              {strategy.strategyType === 'SWING' && (
                <div>
                  <p><strong>Swing Trading:</strong> Estratégia de médio prazo que busca capturar movimentos de 1-4 dias. 
                  Usa múltiplos indicadores para confirmar entradas e saídas.</p>
                </div>
              )}
              {strategy.strategyType === 'BREAKOUT' && (
                <div>
                  <p><strong>Breakout:</strong> Entra quando preço rompe níveis importantes de suporte/resistência. 
                  Confirma breakout com volume e outros indicadores técnicos.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailsModal;
