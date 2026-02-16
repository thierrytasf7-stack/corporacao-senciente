import React from 'react';
import TradingStrategiesPanel from './TradingStrategiesPanel';

export const StrategiesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🎯 Estratégias de Trading
            </h1>
            <p className="text-gray-600 mt-1">
              Configure e monitore suas estratégias de trading automatizado
            </p>
          </div>
        </div>
      </div>

      {/* Trading Strategy Panel */}
      <TradingStrategiesPanel />
    </div>
  );
};