import React, { useState } from 'react';
import { LogViewer } from '../common/LogViewer';

export const Header: React.FC = () => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema AURA - Bot de Trading
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLogs(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <span>📊</span>
                <span>Logs</span>
              </button>
              <span className="text-sm text-gray-700">
                Modo Pessoal
              </span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <LogViewer isVisible={showLogs} onClose={() => setShowLogs(false)} />
    </>
  );
};