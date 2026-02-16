import { useState, useEffect } from 'react';
import { DEFAULT_STRATEGIES } from "@/config/strategy-config";
import { WebSocketManager, WebSocketState } from "@/services/WebSocketManager";
import { StatusBadge } from "@/components/ui/StatusBadge";

const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:21300';

export function StrategyList({ strategies, onSelectStrategy }: any) {
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null);
  const [connectionState, setConnectionState] = useState<WebSocketState>('DISCONNECTED');

  useEffect(() => {
    const manager = new WebSocketManager({
      url: WS_URL,
      autoConnect: true
    });

    manager.on('stateChange', (state: WebSocketState) => {
      setConnectionState(state);
    });

    setWsManager(manager);

    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Available Strategies</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={connectionState.toLowerCase() as any} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {connectionState}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((strategy: any) => (
          <div
            key={strategy.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectStrategy(strategy.id)}
          >
            <h3 className="font-medium mb-2">{strategy.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {strategy.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-600">
                Risk: {strategy.riskLevel}
              </span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                {strategy.successRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}