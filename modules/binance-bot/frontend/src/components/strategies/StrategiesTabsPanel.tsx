import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import SpotStrategiesPanel from './SpotStrategiesPanel';
import TradingStrategiesPanel from './TradingStrategiesPanel';

interface Tab {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ComponentType;
    description: string;
}

const StrategiesTabsPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('spot');

    const tabs: Tab[] = [
        {
            id: 'spot',
            name: 'Estratégias Spot',
            icon: CurrencyDollarIcon,
            component: SpotStrategiesPanel,
            description: 'Estratégias de compra spot para análise rotativa'
        },
        {
            id: 'futures',
            name: 'Estratégias Futures',
            icon: ChartBarIcon,
            component: TradingStrategiesPanel,
            description: 'Estratégias de trading para futures (buy/sell)'
        },
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const ActiveComponent = activeTabData?.component || SpotStrategiesPanel;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Estratégias de Trading</h1>
                <p className="text-gray-600 mt-2">Gerencie todas as estratégias do sistema AURA</p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`} />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Description */}
            {activeTabData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <activeTabData.icon className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">{activeTabData.name}</h3>
                            <p className="text-sm text-blue-700 mt-1">{activeTabData.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="mt-6">
                <ActiveComponent />
            </div>
        </div>
    );
};

export default StrategiesTabsPanel;

