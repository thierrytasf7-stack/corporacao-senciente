import React from 'react';
import { API_BASE_URL } from '../../config/api';

const TestStrategyPanel: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧪 Teste - Estratégias</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Componente Carregado</h3>
                <p className="text-green-700">
                    Este é um componente de teste para verificar se o problema é com o TradingStrategyPanel.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Status da API</h3>
                <p className="text-blue-700">
                    Testando conexão com a API de estratégias...
                </p>
                <button
                    onClick={async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/strategies`);
                            const data = await response.json();
                            console.log('🎯 API Response:', data);
                            alert(`Estratégias encontradas: ${data.strategies?.length || 0}`);
                        } catch (error) {
                            console.error('❌ API Error:', error);
                            alert('Erro ao conectar com a API');
                        }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Testar API
                </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Debug Info</h3>
                <p className="text-yellow-700">
                    Se você está vendo este componente, significa que o problema não é com a renderização básica.
                </p>
                <p className="text-yellow-700 mt-2">
                    Verifique o console do navegador para logs de debug.
                </p>
            </div>
        </div>
    );
};

export default TestStrategyPanel;
