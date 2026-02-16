import React, { useEffect, useState } from 'react';
import { ensureConsoleFunctions } from '../../utils/consoleLogger';

interface LogViewerProps {
    isVisible: boolean;
    onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isVisible, onClose }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');

    useEffect(() => {
        if (!isVisible) return;

        // Garantir que as funções do console estejam disponíveis
        ensureConsoleFunctions();

        const updateLogs = () => {
            // Simular logs para demonstração
            const mockLogs = [
                {
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: 'Sistema de logs funcionando corretamente'
                },
                {
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: 'Frontend conectado ao backend'
                }
            ];
            setLogs(mockLogs);
        };

        const interval = setInterval(updateLogs, 1000);
        updateLogs();

        return () => clearInterval(interval);
    }, [isVisible]);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.level === filter;
    });

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-500';
            case 'warn': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            default: return 'text-white';
        }
    };

    const exportLogs = () => {
        const report = {
            timestamp: new Date().toISOString(),
            logs: logs,
            total: logs.length
        };
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LOG-CONSOLE-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">📊 Console Log Viewer</h2>
                    <div className="flex items-center space-x-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
                        >
                            <option value="all">All Logs</option>
                            <option value="error">Errors</option>
                            <option value="warn">Warnings</option>
                            <option value="info">Info</option>
                        </select>
                        <button onClick={exportLogs} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                            📄 Export
                        </button>
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm">
                            ✕ Close
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                    {filteredLogs.map((log, index) => (
                        <div key={index} className="p-2 rounded border-l-4 border-gray-500 bg-gray-800 mb-2">
                            <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${getLogLevelColor(log.level)}`}>
                                    {log.level.toUpperCase()}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-white mt-1">{log.message}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
