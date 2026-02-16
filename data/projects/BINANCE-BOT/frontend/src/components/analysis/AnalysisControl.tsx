import React from 'react';
import { RealAnalysisPanel } from './RealAnalysisPanel';

const AnalysisControl: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            📊 Análise Rotativa Real
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Sistema de análise técnica com dados reais da Binance Testnet
                        </p>
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-700 font-medium">DADOS REAIS BINANCE</span>
                    </div>
                </div>
            </div>

            {/* Real Analysis Panel */}
            <RealAnalysisPanel />
        </div>
    );
};

export default AnalysisControl;