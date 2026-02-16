import { EyeIcon, PlayIcon, PlusIcon, StopIcon, TrashIcon } from '@heroicons/react/24/outline/index.js';
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api/client';
import { BinanceMarketsPanel } from './BinanceMarketsPanel';

interface Market {
  id: string;
  symbol: string;
  name: string;
  tradingType: 'SPOT' | 'FUTURES' | 'MARGIN';
  isActive: boolean;
  quantity: number;
  maxPositions: number;
  description: string;
  baseAsset: string;
  quoteAsset: string;
  minQuantity: number;
  maxQuantity: number;
  pricePrecision: number;
  quantityPrecision: number;
  // Novos campos para informações de trading
  currentPrice?: number;
  minNotional?: number; // Valor mínimo em USDT para ordem
  minOrderAmount?: number; // Quantidade mínima da moeda base
  equivalentAmount?: number; // Quantidade equivalente à aposta mínima
  spreadPips?: number; // Spread em pips
  spreadDollars?: number; // Spread em dólares (negativo)
  pipsToNeutral?: number; // Pips necessários para chegar ao neutro
  pipValue?: number; // Valor de 1 pip em dólares
  createdAt: string;
  updatedAt: string;
}

interface AddMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (market: Omit<Market, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddMarketModal: React.FC<AddMarketModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    tradingType: 'SPOT' as const,
    quantity: 0.001,
    maxPositions: 2,
    description: '',
    baseAsset: '',
    quoteAsset: '',
    minQuantity: 0.0001,
    maxQuantity: 1.0,
    pricePrecision: 2,
    quantityPrecision: 4,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    setFormData({
      symbol: '',
      name: '',
      tradingType: 'SPOT',
      quantity: 0.001,
      maxPositions: 2,
      description: '',
      baseAsset: '',
      quoteAsset: '',
      minQuantity: 0.0001,
      maxQuantity: 1.0,
      pricePrecision: 2,
      quantityPrecision: 4,
      isActive: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Adicionar Mercado</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Símbolo</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="BTCUSDT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Bitcoin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Trading</label>
              <select
                value={formData.tradingType}
                onChange={(e) => setFormData({ ...formData, tradingType: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="SPOT">SPOT</option>
                <option value="FUTURES">FUTURES</option>
                <option value="MARGIN">MARGIN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <input
                type="number"
                step="0.0001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stop Loss (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Take Profit (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.takeProfit}
                onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Posições</label>
              <input
                type="number"
                value={formData.maxPositions}
                onChange={(e) => setFormData({ ...formData, maxPositions: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base Asset</label>
              <input
                type="text"
                value={formData.baseAsset}
                onChange={(e) => setFormData({ ...formData, baseAsset: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="BTC"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quote Asset</label>
              <input
                type="text"
                value={formData.quoteAsset}
                onChange={(e) => setFormData({ ...formData, quoteAsset: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="USDT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full p-2 border rounded"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Descrição do mercado..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Adicionar Mercado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MarketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
}

const MarketDetailsModal: React.FC<MarketDetailsModalProps> = ({ isOpen, onClose, market }) => {
  if (!isOpen || !market) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalhes do Mercado</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Símbolo</label>
                <p className="text-lg font-semibold text-gray-900">{market.symbol}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nome</label>
                <p className="text-lg font-semibold text-gray-900">{market.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Tipo de Trading</label>
                <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${market.tradingType === 'SPOT' ? 'bg-green-100 text-green-800' :
                  market.tradingType === 'FUTURES' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                  {market.tradingType}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${market.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {market.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Configurações de Trading */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Configurações de Trading</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Quantidade</label>
                <p className="text-lg font-semibold text-gray-900">{market.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Preço Atual</label>
                <p className="text-lg font-semibold text-blue-600">${market.currentPrice ? market.currentPrice.toFixed(4) : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Valor Mínimo USDT</label>
                <p className="text-lg font-semibold text-green-600">${market.minNotional ? market.minNotional.toFixed(2) : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Max Posições</label>
                <p className="text-lg font-semibold text-gray-900">{market.maxPositions}</p>
              </div>
            </div>
          </div>

          {/* Informações de Trading Real */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Informações de Trading Real</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Qtd. Equivalente (Min. Aposta)</label>
                <p className="text-lg font-semibold text-purple-600">{market.equivalentAmount ? market.equivalentAmount.toFixed(6) : 'N/A'} {market.baseAsset}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Qtd. Mínima Ordem</label>
                <p className="text-lg font-semibold text-orange-600">{market.minOrderAmount ? market.minOrderAmount.toFixed(6) : 'N/A'} {market.baseAsset}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Base Asset</label>
                <p className="text-lg font-semibold text-gray-900">{market.baseAsset}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Quote Asset</label>
                <p className="text-lg font-semibold text-gray-900">{market.quoteAsset}</p>
              </div>
            </div>
          </div>

          {/* Informações de Spread */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Informações de Spread</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Spread em Pips</label>
                <p className="text-lg font-semibold text-blue-600">{market.spreadPips ? market.spreadPips.toFixed(2) : 'N/A'} pips</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Spread em Dólares</label>
                <p className="text-lg font-semibold text-red-600">{market.spreadDollars ? market.spreadDollars.toFixed(4) : 'N/A'} USD</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Pips para Neutro</label>
                <p className="text-lg font-semibold text-orange-600">{market.pipsToNeutral ? market.pipsToNeutral.toFixed(2) : 'N/A'} pips</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Valor de 1 Pip</label>
                <p className="text-lg font-semibold text-green-600">{market.pipValue ? market.pipValue.toFixed(6) : 'N/A'} USD</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Interpretação:</strong> O spread negativo em dólares mostra quanto você perde ao abrir uma posição.
                Você precisa de {market.pipsToNeutral ? market.pipsToNeutral.toFixed(2) : 'N/A'} pips de movimento favorável para chegar ao ponto neutro.
                Cada pip vale {market.pipValue ? market.pipValue.toFixed(6) : 'N/A'} USD neste mercado.
              </p>
            </div>
          </div>



          {/* Limites */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Limites</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Quantidade Mínima</label>
                <p className="text-lg font-semibold text-gray-900">{market.minQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Quantidade Máxima</label>
                <p className="text-lg font-semibold text-gray-900">{market.maxQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Precisão do Preço</label>
                <p className="text-lg font-semibold text-gray-900">{market.pricePrecision}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Precisão da Quantidade</label>
                <p className="text-lg font-semibold text-gray-900">{market.quantityPrecision}</p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {market.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Descrição</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{market.description}</p>
            </div>
          )}

          {/* Datas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Informações de Sistema</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Criado em</label>
                <p className="text-sm text-gray-600">{new Date(market.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Atualizado em</label>
                <p className="text-sm text-gray-600">{new Date(market.updatedAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const MarketsPanel: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/v1/markets');
      const data = response.data;

      if (data.success) {
        setMarkets(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao carregar mercados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMarket = async (marketData: Omit<Market, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiClient.post('/v1/markets', marketData);
      const data = response.data;

      if (data.success) {
        await fetchMarkets();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao adicionar mercado: ' + err.message);
    }
  };

  const toggleMarket = async (marketId: string) => {
    try {
      const response = await apiClient.post(`/v1/markets/${marketId}/toggle`);
      const data = response.data;

      if (data.success) {
        await fetchMarkets();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao alternar mercado: ' + err.message);
    }
  };

  const deleteMarket = async (marketId: string) => {
    if (!confirm('Tem certeza que deseja remover este mercado?')) return;

    try {
      const response = await apiClient.delete(`/v1/markets/${marketId}`);
      const data = response.data;

      if (data.success) {
        await fetchMarkets();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao remover mercado: ' + err.message);
    }
  };

  const initializeDefaultMarkets = async () => {
    try {
      setInitializing(true);
      const response = await apiClient.post('/v1/markets/initialize-defaults');
      const data = response.data;

      if (data.success) {
        await fetchMarkets();
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao inicializar mercados padrão: ' + err.message);
    } finally {
      setInitializing(false);
    }
  };

  const showMarketDetails = (market: Market) => {
    setSelectedMarket(market);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Mercados</h1>
        <div className="flex space-x-2">
          <button
            onClick={initializeDefaultMarkets}
            disabled={initializing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {initializing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Inicializando...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                Inicializar Padrões
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Mercado
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mercado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min. USDT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd. Equivalente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spread (Pips)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spread (USD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pips p/ Neutro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {markets.map((market) => (
                <tr key={market.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{market.symbol}</div>
                      <div className="text-sm text-gray-500">{market.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${market.tradingType === 'SPOT' ? 'bg-green-100 text-green-800' :
                      market.tradingType === 'FUTURES' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                      {market.tradingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${market.currentPrice ? market.currentPrice.toFixed(4) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${market.minNotional ? market.minNotional.toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {market.equivalentAmount ? market.equivalentAmount.toFixed(6) : 'N/A'} {market.baseAsset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {market.spreadPips ? market.spreadPips.toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {market.spreadDollars ? market.spreadDollars.toFixed(4) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                    {market.pipsToNeutral ? market.pipsToNeutral.toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleMarket(market.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${market.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                      {market.isActive ? (
                        <>
                          <PlayIcon className="w-3 h-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <StopIcon className="w-3 h-3 mr-1" />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showMarketDetails(market)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMarket(market.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Remover mercado"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {markets.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum Mercado Configurado
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Configure mercados para começar a operar. Você pode inicializar mercados padrão ou criar novos.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={initializeDefaultMarkets}
              disabled={initializing}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {initializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Inicializando...
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Inicializar Mercados Padrão
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Criar Mercado Personalizado
            </button>
          </div>
        </div>
      )}

      <AddMarketModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addMarket}
      />

      <MarketDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMarket(null);
        }}
        market={selectedMarket}
      />
    </div>
  );
};

export default MarketsPanel;
