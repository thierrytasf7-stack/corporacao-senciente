import React, { useState } from 'react';
import PositionHistoryService from '../../services/PositionHistoryService';
import { AdvancedFilters } from './AdvancedFilters';
import { PaginationControls } from './PaginationControls';

export const TradeHistory: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForceLoadHistory = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 [FRONTEND] Forçando carregamento do histórico...');
      await PositionHistoryService.forceLoadHistoryFromBackend();
      console.log('✅ [FRONTEND] Carregamento concluído!');

      // Recarregar a página para mostrar as posições
      window.location.reload();
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Trades - Binance Testnet
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Histórico completo de operações da Binance Testnet
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleForceLoadHistory}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '🔄 Carregando...' : '🚀 Carregar Histórico'}
            </button>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs text-yellow-700 font-medium">EM DESENVOLVIMENTO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filtros */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <AdvancedFilters />
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Histórico de Trades
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Em desenvolvimento - Dados reais da Binance Testnet
          </p>

          <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700">
              <strong>Status:</strong> Implementando histórico de trades com dados reais da Binance Testnet
            </div>
          </div>
        </div>

        {/* Paginação */}
        <div className="mt-6">
          <PaginationControls />
        </div>
      </div>
    </div>
  );
};