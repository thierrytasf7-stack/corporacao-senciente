import React, { useEffect, useState } from 'react';
import BinanceRealService from '../../services/BinanceRealService';
import { buildApiUrl } from '../../config/api';

interface RealPosition {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  openPrice: number;
  status: 'OPEN' | 'CLOSED';
  strategyName: string;
  orderId: string;
  notes: string;
  openTime: string;
  realValueInvested: number;
  updatedAt: string;
  source: string;
  pnl?: number;
  pnlPercentage?: number;
}

export const ActivePositions: React.FC = () => {
  const [realPositions, setRealPositions] = useState<RealPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [closingPositions, setClosingPositions] = useState<Set<string>>(new Set());
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const loadActivePositions = async () => {
    setIsLoading(true);
    try {
      const positions = await BinanceRealService.getPositions();

      const openPositions: RealPosition[] = positions.map((position, index) => ({
        id: `binance_${position.symbol}_${index}`,
        symbol: position.symbol,
        side: position.side as 'BUY' | 'SELL',
        quantity: parseFloat(position.size || '0'),
        openPrice: parseFloat(position.entryPrice || '0'),
        status: 'OPEN',
        strategyName: 'Binance Real',
        orderId: `binance_${position.symbol}_${index}`,
        notes: 'Posição real da Binance',
        openTime: new Date().toISOString(),
        realValueInvested: parseFloat(position.notional || '0'),
        updatedAt: new Date().toISOString(),
        source: 'binance',
        pnl: parseFloat(position.unrealizedPnl || '0'),
        pnlPercentage: parseFloat(position.unrealizedPnlPercent || '0')
      }));

      setRealPositions(openPositions);
      await loadCurrentPrices(openPositions);
    } catch {
      setRealPositions([]);
    }
    setIsLoading(false);
  };

  const loadCurrentPrices = async (positions: RealPosition[]) => {
    try {
      const symbols = [...new Set(positions.map(p => p.symbol))];
      const prices: Record<string, number> = {};

      for (const symbol of symbols) {
        try {
          const price = await BinanceRealService.getPrice(symbol);
          prices[symbol] = price;
        } catch {
          // Price unavailable for this symbol
        }
      }

      setCurrentPrices(prices);
    } catch {
      // Price loading failed silently
    }
  };

  const closePosition = async (position: RealPosition) => {
    if (closingPositions.has(position.id)) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja fechar a posição ${position.side} de ${position.symbol}?\n\n` +
      `Quantidade: ${position.quantity}\n` +
      `Preço de entrada: $${position.openPrice?.toFixed(4) || 'N/A'}\n` +
      `Valor investido: $${position.realValueInvested?.toFixed(2) || 'N/A'}`
    );

    if (!confirmed) return;

    setClosingPositions(prev => new Set(prev).add(position.id));

    try {
      const closePositionUrl = buildApiUrl(`/close-position/${position.id}`);

      const response = await fetch(closePositionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await loadActivePositions();
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setRealPositions(prev => prev); // keep current state
      if (import.meta.env.DEV) console.error('Close position failed:', message);
    } finally {
      setClosingPositions(prev => {
        const newSet = new Set(prev);
        newSet.delete(position.id);
        return newSet;
      });
    }
  };

  const calculateUnrealizedPnL = (position: RealPosition) => {
    const currentPrice = currentPrices[position.symbol];
    if (!currentPrice) return { pnl: 0, percentage: 0 };

    const pnl = position.side === 'BUY'
      ? (currentPrice - position.openPrice) * position.quantity
      : (position.openPrice - currentPrice) * position.quantity;

    // Verificar se realValueInvested existe e é válido
    const investedValue = position.realValueInvested || (position.openPrice * position.quantity);
    const percentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return { pnl, percentage };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadActivePositions();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadActivePositions, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Posições Ativas - Binance Testnet
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Carregando posições...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Posicoes Ativas - Binance Testnet
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {realPositions.length} posição{realPositions.length !== 1 ? 'ões' : ''}
            </span>
            <button
              onClick={loadActivePositions}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {realPositions.length > 0 ? (
          <div className="space-y-4">
            {realPositions.map((position) => {
              const { pnl, percentage } = calculateUnrealizedPnL(position);
              const isClosing = closingPositions.has(position.id);
              const currentPrice = currentPrices[position.symbol];

              return (
                <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{position.symbol}</h4>
                      <p className="text-sm text-gray-500">
                        {position.side === 'BUY' ? '📈 Compra' : '📉 Venda'} • {position.quantity} unidades
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(position.openTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pnl)}
                      </div>
                      <div className={`text-sm ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(percentage)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Preço de Entrada:</span>
                      <div className="font-medium">{formatCurrency(position.openPrice)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Preço Atual:</span>
                      <div className="font-medium">
                        {currentPrice ? formatCurrency(currentPrice) : 'Carregando...'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor Investido:</span>
                      <div className="font-medium">{formatCurrency(position.realValueInvested)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Order ID:</span>
                      <div className="font-medium text-xs">#{position.orderId}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Estratégia: {position.strategyName}
                    </span>
                    <button
                      onClick={() => closePosition(position)}
                      disabled={isClosing}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isClosing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                        }`}
                    >
                      {isClosing ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Fechando...
                        </>
                      ) : (
                        '🔐 Fechar Posição'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma posição ativa</h3>
            <p className="text-gray-500">
              Suas posições abertas aparecerão aqui quando executadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};