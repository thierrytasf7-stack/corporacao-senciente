import React, { useState } from 'react';
import FuturesAnalysisPanel from './FuturesAnalysisPanel';
import SpotRotativeAnalysisPanel from './SpotRotativeAnalysisPanel';

const AnalysisTabsPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'futures' | 'spot-rotative'>('futures');

    const tabs = [
        {
            id: 'spot-rotative',
            name: 'Análise Rotativa Spot',
            icon: '🔄',
            description: 'Análise rotativa automática para trading spot',
            status: 'active'
        },
        {
            id: 'futures',
            name: 'Análise Futures',
            icon: '📈',
            description: 'Análise rotativa para trading futures',
            status: 'active'
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
                            onClick={() => setActiveTab(tab.id as 'futures' | 'spot-rotative')}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <div className="text-left">
                                <div className="flex items-center space-x-2">
                                    <span>{tab.name}</span>
                                    {tab.status === 'development' && (
                                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                            Em Dev
                                        </span>
                                    )}
                                    {tab.status === 'active' && (
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                            Ativo
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">{tab.description}</div>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Conteúdo das Tabs */}
            <div className="p-0">
                {activeTab === 'spot-rotative' && <SpotRotativeAnalysisPanel />}
                {activeTab === 'futures' && <FuturesAnalysisPanel />}
            </div>
        </div>
    );
};

export default AnalysisTabsPanel;
