import React from 'react';

export const LogsFeed: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Logs do Sistema - Binance Testnet
          </h3>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-yellow-700 font-medium">EM DESENVOLVIMENTO</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm">Feed de Logs</div>
            <div className="text-xs mt-1">Em desenvolvimento - Logs reais da Binance Testnet</div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-700">
                <strong>Status:</strong> Implementando sistema de logs em tempo real
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Os logs mostrarão atividades do sistema e operações da Binance Testnet
        </div>
      </div>
    </div>
  );
};