import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface TriggerExecution {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    quoteQuantity: number;
    commission: number;
    commissionAsset: string;
    fromAsset: string;
    toAsset: string;
    time: string;
    isMaker: boolean;
    isBestMatch: boolean;
    realDollarCost: number;
    originalCommission: number;
    simulatedRate: number;
    groupId?: string;
    isReturnToDefault?: boolean;
    parentExecutionId?: string;
    buyPrice?: number;
    sellPrice?: number;
    totalBuyValue?: number;
    totalSellValue?: number;
    profit?: number;
    sellTime?: string;
    isSold?: boolean;
    matchedSellId?: string;
    profitTrigger?: number;
    lossTrigger?: number;
}

interface TriggerMonitorProps {
    executions: TriggerExecution[];
    onSellExecution: (execution: TriggerExecution) => Promise<void>;
    onRefreshData?: () => Promise<void>;
}

const TriggerMonitor: React.FC<TriggerMonitorProps> = ({ executions, onSellExecution, onRefreshData }) => {
    const [isActive, setIsActive] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [triggeredExecutions, setTriggeredExecutions] = useState<Set<string>>(new Set());

    // Função para buscar preços atuais (com fallback por símbolo)
    const fetchPrices = async (symbols: string[]) => {
        if (!symbols || symbols.length === 0) return;
        try {
            // Tenta endpoint em lote (se disponível)
            const batchUrl = `${API_BASE_URL}/binance/prices?symbols=${encodeURIComponent(symbols.join(','))}`;
            const response = await fetch(batchUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            if (response.ok) {
                const data = await response.json();
                const priceMap: Record<string, number> = {};
                // Aceita formatos: {prices: {SYM: "123"}} ou {data: [{symbol, price}]}
                if (data?.prices && typeof data.prices === 'object') {
                    Object.entries<any>(data.prices).forEach(([sym, val]) => {
                        const num = typeof val === 'string' ? parseFloat(val) : Number(val);
                        if (!Number.isNaN(num)) priceMap[sym] = num;
                    });
                } else if (Array.isArray(data?.data)) {
                    data.data.forEach((p: any) => {
                        const num = parseFloat(p?.price ?? p?.priceUSDT ?? '');
                        if (!Number.isNaN(num) && p?.symbol) priceMap[p.symbol] = num;
                    });
                }
                if (Object.keys(priceMap).length > 0) {
                    setPrices(priceMap);
                    return;
                }
            }

            // Fallback: buscar por símbolo individualmente
            const results = await Promise.all(
                symbols.map(async (sym) => {
                    try {
                        const r = await fetch(`${API_BASE_URL}/binance/price/${sym}`);
                        if (!r.ok) return null;
                        const d = await r.json();
                        const priceNum = parseFloat(d?.price ?? d?.data?.price ?? d?.data?.[0]?.price ?? '');
                        return Number.isNaN(priceNum) ? null : { symbol: sym, price: priceNum };
                    } catch {
                        return null;
                    }
                })
            );

            const fallbackMap: Record<string, number> = {};
            results.filter(Boolean).forEach((item: any) => {
                fallbackMap[item.symbol] = item.price;
            });
            if (Object.keys(fallbackMap).length > 0) setPrices(fallbackMap);
        } catch (error) {
            console.error('❌ [TRIGGER] Erro ao buscar preços:', error);
        }
    };

    // Função para verificar gatilhos
    const checkTriggers = () => {
        const activeExecutions = executions.filter(exec =>
            exec.side === 'BUY' &&
            !exec.isSold &&
            ((exec.profitTrigger ?? 0) > 0 || (exec.lossTrigger ?? 0) < 0)
        );

        activeExecutions.forEach(execution => {
            if (triggeredExecutions.has(execution.id)) return;

            const currentPrice = prices[execution.symbol];
            if (!currentPrice) return;

            const buyPrice = execution.buyPrice || execution.price;
            const profitIfSellNow = execution.quantity * currentPrice - execution.quantity * buyPrice;

            // Verificar gatilho de lucro
            if (execution.profitTrigger && profitIfSellNow >= execution.profitTrigger) {
                console.log(`🚀 [TRIGGER] Gatilho de LUCRO ativado para ${execution.symbol}: $${profitIfSellNow.toFixed(2)} >= $${execution.profitTrigger}`);
                triggerSell(execution, 'PROFIT');
                return;
            }

            // Verificar gatilho de perda
            if (execution.lossTrigger && profitIfSellNow <= execution.lossTrigger) {
                console.log(`🛑 [TRIGGER] Gatilho de PERDA ativado para ${execution.symbol}: $${profitIfSellNow.toFixed(2)} <= $${execution.lossTrigger}`);
                triggerSell(execution, 'LOSS');
                return;
            }
        });
    };

    // Função para executar venda via gatilho
    const triggerSell = async (execution: TriggerExecution, triggerType: 'PROFIT' | 'LOSS') => {
        try {
            setTriggeredExecutions(prev => new Set(prev).add(execution.id));

            console.log(`⚡ [TRIGGER] Executando venda automática: ${execution.symbol} (${triggerType})`);

            await onSellExecution(execution);

            // Aguardar um pouco para a venda aparecer no histórico da Binance
            console.log(`⏳ [TRIGGER] Aguardando venda aparecer no histórico da Binance...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos

            // Forçar refresh do histórico após venda executada
            console.log(`🔄 [TRIGGER] Forçando refresh do histórico após venda...`);
            if (onRefreshData) {
                await onRefreshData();
            }

            console.log(`✅ [TRIGGER] Venda automática concluída: ${execution.symbol}`);
        } catch (error) {
            console.error(`❌ [TRIGGER] Erro na venda automática:`, error);
            setTriggeredExecutions(prev => {
                const newSet = new Set(prev);
                newSet.delete(execution.id);
                return newSet;
            });
        }
    };

    // Effect para monitoramento contínuo
    useEffect(() => {
        if (!isActive) return;

        // Primeiro fetch imediato
        const symbols = Array.from(new Set(executions.map(exec => exec.symbol)));
        fetchPrices(symbols);

        // Depois, polling
        const interval = setInterval(() => {
            const syms = Array.from(new Set(executions.map(exec => exec.symbol)));
            fetchPrices(syms);
        }, 5000); // Verificar a cada 5 segundos

        return () => clearInterval(interval);
    }, [isActive, executions]);

    // Effect para verificar gatilhos quando preços mudam
    useEffect(() => {
        if (Object.keys(prices).length === 0) return;
        checkTriggers();
    }, [prices, executions]);

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🎯 Monitor de Gatilhos</h3>
                <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {isActive ? '🟢 ATIVO' : '🔴 INATIVO'}
                    </div>
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${isActive
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {isActive ? 'Parar Monitor' : 'Iniciar Monitor'}
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                <p>• Monitora preços em tempo real a cada 5 segundos</p>
                <p>• Executa vendas automáticas quando gatilhos são atingidos</p>
                <p>• Funciona apenas com execuções que têm gatilhos configurados</p>
            </div>

            {isActive && (
                <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Status do Monitor:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-blue-700">Execuções Monitoradas:</span>
                            <span className="ml-2 font-medium">
                                {executions.filter(exec => exec.side === 'BUY' && !exec.isSold && (exec.profitTrigger || exec.lossTrigger)).length}
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-700">Símbolos Ativos:</span>
                            <span className="ml-2 font-medium">
                                {Array.from(new Set(executions.map(exec => exec.symbol))).length}
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-700">Preços Atualizados:</span>
                            <span className="ml-2 font-medium">
                                {Object.keys(prices).length}
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-700">Gatilhos Ativados:</span>
                            <span className="ml-2 font-medium">
                                {triggeredExecutions.size}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TriggerMonitor;
