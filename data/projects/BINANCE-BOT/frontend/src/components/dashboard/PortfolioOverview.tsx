import React, { useEffect, useState } from 'react';
import BinanceRealService from '../../services/BinanceRealService';

export const PortfolioOverview: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados reais da Binance Testnet
      console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
      const portfolio = await BinanceRealService.getPortfolio();
      setPortfolioData(portfolio);

      console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
      const balanceData = await BinanceRealService.getBalances();
      setBalances(balanceData);

      console.log('✅ Dados REAIS do portfolio obtidos');
    } catch (err: any) {
      console.error('❌ Erro ao carregar dados da Binance:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Se está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Portfolio - Binance Testnet
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Carregando dados reais...</span>
          </div>
        </div>
      </div>
    );
  }

  // Se há erro crítico, mostrar erro
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Portfolio - Binance Testnet
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao Carregar Dados
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Erro Portfolio:</strong> {error || 'N/A'}</p>
                  <p><strong>Erro Balances:</strong> {error || 'N/A'}</p>
                  <p className="mt-2">
                    <strong>Solução:</strong> Verifique as credenciais da Binance Testnet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não há dados, mostrar mensagem
  if (!portfolioData) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Portfolio - Binance Testnet
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm">Nenhum dado de portfolio disponível</div>
            <div className="text-xs mt-1">Verifique a conexão com a Binance Testnet</div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar dados reais do portfolio
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Portfolio - Binance Testnet
        </h2>
        <div className="mt-1 text-sm text-gray-500">
          Dados reais da sua conta Binance Testnet
        </div>
      </div>

      <div className="p-6">
        {/* Total Portfolio Value */}
        <div className="mb-6">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(portfolioData.totalValue || 0)}
          </div>
          <div className="text-sm text-gray-500">Valor Total do Portfolio</div>
        </div>

        {/* Portfolio Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatPercent(portfolioData.dailyChange || 0)}
            </div>
            <div className="text-sm text-gray-500">Variação Diária</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatPercent(portfolioData.weeklyChange || 0)}
            </div>
            <div className="text-sm text-gray-500">Variação Semanal</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatPercent(portfolioData.monthlyChange || 0)}
            </div>
            <div className="text-sm text-gray-500">Variação Mensal</div>
          </div>
        </div>

        {/* Balances */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldos Disponíveis</h3>
          {balances.length > 0 ? (
            <div className="space-y-2">
              {balances
                .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
                .slice(0, 5)
                .map((balance, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600">
                          {balance.asset.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{balance.asset}</div>
                        <div className="text-sm text-gray-500">
                          Livre: {parseFloat(balance.free).toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(parseFloat(balance.free) * (balance.price || 0))}
                      </div>
                      {parseFloat(balance.locked) > 0 && (
                        <div className="text-sm text-gray-500">
                          Bloqueado: {parseFloat(balance.locked).toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="text-sm">Nenhum saldo disponível</div>
              <div className="text-xs mt-1">Adicione fundos à sua conta Binance Testnet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};