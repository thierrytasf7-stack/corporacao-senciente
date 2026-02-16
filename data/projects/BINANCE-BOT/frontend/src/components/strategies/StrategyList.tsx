import React from 'react';

interface StrategyListProps {
  onCreateStrategy: () => void;
  onEditStrategy: (strategyId: string) => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  onCreateStrategy,
  onEditStrategy,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Estratégias de Trading
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie suas estratégias de trading automatizado
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-yellow-700 font-medium">EM DESENVOLVIMENTO</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Botão Criar Estratégia */}
        <div className="mb-6">
          <button
            onClick={onCreateStrategy}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Criar Nova Estratégia
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Estratégias de Trading
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Sistema em desenvolvimento
          </p>

          <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700">
              <strong>Status:</strong> Implementando sistema de estratégias
            </div>
          </div>
        </div>

        {/* Informações sobre Estratégias */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium text-gray-900 mb-1">Indicadores Técnicos</h4>
            <p className="text-sm text-gray-600">RSI, MACD, Médias Móveis e mais</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium text-gray-900 mb-1">Execução Automática</h4>
            <p className="text-sm text-gray-600">Trades executados automaticamente</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🛡️</div>
            <h4 className="font-medium text-gray-900 mb-1">Gestão de Risco</h4>
            <p className="text-sm text-gray-600">Stop loss e take profit automáticos</p>
          </div>
        </div>
      </div>
    </div>
  );
};