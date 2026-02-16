import React from 'react';

const MarketsTest: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Teste da Aba de Mercados</h1>
            <p className="text-gray-600">
                Se você está vendo esta página, a rota de mercados está funcionando!
            </p>
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                ✅ Aba de Mercados funcionando corretamente
            </div>
        </div>
    );
};

export default MarketsTest;
