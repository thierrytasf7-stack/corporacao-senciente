import React, { useState } from 'react';
import FuturesPositionsPanel from './FuturesPositionsPanel';
import SpotExecutionsPanel from './SpotExecutionsPanel';

const PositionsTabsPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'spot' | 'futures'>('spot');

    const tabs = [
        {
            id: 'spot',
            name: 'Execuções Spot',
            icon: '💰',
            description: 'Histórico de compras e vendas spot'
        },
        {
            id: 'futures',
            name: 'Posições Futures',
            icon: '📈',
            description: 'Histórico de posições futures com P&L'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header com Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 py-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'spot' | 'futures')}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <div className="text-left">
                                <div>{tab.name}</div>
                                <div className="text-xs text-gray-400">{tab.description}</div>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Conteúdo das Tabs */}
            <div className="p-0">
                {activeTab === 'spot' && <SpotExecutionsPanel />}
                {activeTab === 'futures' && <FuturesPositionsPanel />}
            </div>
        </div>
    );
};

export default PositionsTabsPanel;
