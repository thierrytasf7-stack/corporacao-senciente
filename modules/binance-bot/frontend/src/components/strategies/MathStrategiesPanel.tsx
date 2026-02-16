import { CheckIcon } from '@heroicons/react/24/outline/index.js';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface MathStrategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  betAmount: number;
  type: 'SIMPLE' | 'ADVANCED';
  leverage: number;
  tradingType: 'SPOT' | 'FUTURES';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  takeProfitPercentage?: number;
  stopLossPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

const MathStrategiesPanel: React.FC = () => {
  const [strategies, setStrategies] = useState<MathStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/math-strategies`);
      const data = await response.json();

      if (data.success) {
        setStrategies(data.strategies);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao carregar estratégias matemáticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStrategy = async (strategyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/math-strategies/${strategyId}/toggle`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        await fetchStrategies();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Erro ao alternar estratégia: ' + err.message);
    }
  };

  // Removido: createDefaultStrategy - estratégias são criadas apenas em desenvolvimento

  useEffect(() => {
    fetchStrategies();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Estratégias Matemáticas</h1>
        <p className="text-gray-600 text-sm mt-2">
          Estratégias matemáticas padrão do sistema. Apenas uma pode estar ativa por vez.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-2">Estratégia Ativa</h2>
          <p className="text-gray-600 text-sm">
            Apenas uma estratégia matemática pode estar ativa por vez.
            Ela define o valor da aposta para o sistema rotativo de análise.
          </p>
        </div>

        <div className="divide-y">
          {strategies.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Nenhuma estratégia matemática configurada.</p>
              <p className="text-sm mt-2">As estratégias padrão serão carregadas automaticamente.</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <div key={strategy.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium">{strategy.name}</h3>
                      {strategy.isActive && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{strategy.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span>Valor da Aposta: ${strategy.betAmount}</span>
                      <span>Tipo: {strategy.type}</span>
                      <span>Criada: {new Date(strategy.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="text-green-600 font-medium">
                        TP: +{strategy.takeProfitPercentage || 60}%
                      </span>
                      <span className="text-red-600 font-medium">
                        SL: -{strategy.stopLossPercentage || 30}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${(strategy.leverage || 1) === 1
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                        }`}>
                        {(strategy.leverage || 1)}x {(strategy.tradingType || 'SPOT')}
                      </span>
                      {strategy.riskLevel && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${strategy.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                          strategy.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {strategy.riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => toggleStrategy(strategy.id)}
                      className={`px-4 py-2 rounded-lg font-medium ${strategy.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {strategy.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Como Funciona</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• A estratégia matemática ativa define o valor da aposta para cada operação</p>
          <p>• Apenas uma estratégia pode estar ativa por vez</p>
          <p>• O sistema rotativo de análise usa este valor para calcular posições</p>
          <p>• A estratégia padrão aposta $5.00 (valor mínimo da Binance) em cada operação</p>
        </div>
      </div>
    </div>
  );
};

export default MathStrategiesPanel;
