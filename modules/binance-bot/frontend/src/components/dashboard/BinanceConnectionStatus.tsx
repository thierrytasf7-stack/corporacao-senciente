import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api/client';

interface BinanceStatus {
  success: boolean;
  message: string;
  accountInfo?: any;
}

export const BinanceConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<BinanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/binance/test-connection');
      setStatus(response.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Testar conexão automaticamente ao carregar o componente
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (loading) return 'bg-blue-500';
    if (error) return 'bg-red-500';
    if (status?.success) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (loading) return 'TESTANDO';
    if (error) return 'ERRO';
    if (status?.success) return 'CONECTADO';
    return 'AGUARDANDO';
  };

  const getStatusMessage = () => {
    if (loading) return 'Testando conexão...';
    if (error) return error;
    if (status?.success) return status.message;
    return 'Aguardando configuração';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Status da Conexão Binance - Testnet
        </h3>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 ${getStatusColor()} rounded-full mr-3`}></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {getStatusText()}
              </div>
              <div className="text-xs text-gray-500">
                {getStatusMessage()}
              </div>
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-md ${loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {loading ? 'Testando...' : 'Testar Conexão'}
          </button>
        </div>

        {status?.success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Conexão Estabelecida
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>✅ Conectado com sucesso à Binance Testnet</p>
                  <p className="mt-1">📊 Dados da conta disponíveis</p>
                  <p className="mt-1">🔐 Credenciais válidas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro na Conexão
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1">Verifique as configurações da API</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!status && !error && !loading && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configuração Necessária
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Para conectar com a Binance Testnet, você precisa:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Configurar as variáveis de ambiente BINANCE_API_KEY e BINANCE_SECRET_KEY</li>
                    <li>Verificar se BINANCE_USE_TESTNET está definido como true</li>
                    <li>Garantir que as credenciais têm permissões de leitura</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          Última verificação: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
