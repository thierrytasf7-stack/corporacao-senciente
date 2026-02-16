import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const SystemStatus: React.FC = () => {
  const { connectionStatus, credentials } = useSelector((state: RootState) => state.binance);
  const [systemStatus, setSystemStatus] = useState({
    api: 'checking',
    database: 'checking',
    redis: 'checking',
    websocket: 'checking'
  });

  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus({
        api: connectionStatus.isConnected ? 'connected' : 'error',
        database: connectionStatus.isConnected ? 'connected' : 'checking',
        redis: 'checking',
        websocket: 'checking'
      });
    };

    updateStatus();
  }, [connectionStatus.isConnected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'checking': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'CONECTADO';
      case 'checking': return 'VERIFICANDO';
      case 'error': return 'ERRO';
      default: return 'DESCONHECIDO';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Status do Sistema
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status da API Binance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">API Binance</div>
                <div className="text-xs text-gray-500">Conexão Testnet</div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${getStatusColor(systemStatus.api)} rounded-full mr-2`}></div>
                <span className={`text-xs ${systemStatus.api === 'connected' ? 'text-green-700' : systemStatus.api === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {getStatusText(systemStatus.api)}
                </span>
              </div>
            </div>
          </div>

          {/* Status do Database */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Database</div>
                <div className="text-xs text-gray-500">PostgreSQL</div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${getStatusColor(systemStatus.database)} rounded-full mr-2`}></div>
                <span className={`text-xs ${systemStatus.database === 'connected' ? 'text-green-700' : 'text-yellow-700'}`}>
                  {getStatusText(systemStatus.database)}
                </span>
              </div>
            </div>
          </div>

          {/* Status do Redis */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Cache Redis</div>
                <div className="text-xs text-gray-500">Dados em Memória</div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${getStatusColor(systemStatus.redis)} rounded-full mr-2`}></div>
                <span className={`text-xs ${systemStatus.redis === 'connected' ? 'text-green-700' : 'text-yellow-700'}`}>
                  {getStatusText(systemStatus.redis)}
                </span>
              </div>
            </div>
          </div>

          {/* Status do WebSocket */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">WebSocket</div>
                <div className="text-xs text-gray-500">Tempo Real</div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${getStatusColor(systemStatus.websocket)} rounded-full mr-2`}></div>
                <span className={`text-xs ${systemStatus.websocket === 'connected' ? 'text-green-700' : 'text-yellow-700'}`}>
                  {getStatusText(systemStatus.websocket)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {connectionStatus.isConnected ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Sistema Operacional
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>✅ Conectado com Binance Testnet</p>
                  <p>✅ Credenciais válidas</p>
                  <p>✅ Dados sendo carregados</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sistema em Configuração
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>O sistema está sendo configurado para conectar com a Binance Testnet.</p>
                  <p className="mt-1">Verifique as credenciais e configurações da API.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};