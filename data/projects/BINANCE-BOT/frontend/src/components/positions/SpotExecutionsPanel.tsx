import React, { useEffect, useState } from 'react';
import TriggerMonitor from './TriggerMonitor';

// Interfaces para saldos e preços
interface BinanceBalance {
    asset: string;
    free: string;
    locked: string;
    frozen: string;
}

interface BinancePrice {
    symbol: string;
    price: string;
}

interface SpotExecution {
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
    // Novos campos para nova dinâmica buy/sell
    buyPrice?: number; // Preço de compra (sempre preenchido)
    sellPrice?: number; // Preço de venda (preenchido quando vendido)
    totalBuyValue?: number; // Valor total da compra
    totalSellValue?: number; // Valor total da venda
    profit?: number; // Lucro (totalSellValue - totalBuyValue)
    sellTime?: string; // Data/hora da venda
    isSold?: boolean; // Se foi vendido ou não
    matchedSellId?: string; // ID da venda que quitou esta compra
    // Novos campos para gatilhos
    profitTrigger?: number; // Valor de gatilho para lucro
    lossTrigger?: number; // Valor de gatilho para perda
}

interface SpotExecutionGroup {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    buyExecutions: SpotExecution[]; // Apenas compras
    totalBought: number;
    totalSold: number;
    totalSpent: number;
    totalReceived: number;
    netPnl: number;
    netPnlPercentage: number;
    firstBuyTime: string;
    lastActivityTime: string;
}

interface SpotExecutionsStats {
    totalExecutions: number;
    totalVolume: number;
    totalCommission: number;
    totalProfit: number;
    totalProfitPercentage: number;
    buyExecutions: number;
    sellExecutions: number;
}

interface MatchedRow {
    buy?: SpotExecution;
    sell?: SpotExecution;
    hasMatch: boolean;
    profit?: number;
}

interface TradingStats {
    totalBuys: number;
    totalSells: number;
    totalMatches: number;
    positiveMatches: number;
    negativeMatches: number;
    averagePositiveProfit: number;
    averageNegativeProfit: number;
    totalVolume: number;
    totalProfit: number;
}

interface DateRange {
    startDate: string;
    endDate: string;
}

const SpotExecutionsPanel: React.FC = () => {
    const [executions, setExecutions] = useState<SpotExecution[]>([]);
    const [groups, setGroups] = useState<SpotExecutionGroup[]>([]);
    const [stats, setStats] = useState<SpotExecutionsStats>({
        totalExecutions: 0,
        totalVolume: 0,
        totalCommission: 0,
        totalProfit: 0,
        totalProfitPercentage: 0,
        buyExecutions: 0,
        sellExecutions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'groups' | 'list'>('groups');
    const [sellingExecutions, setSellingExecutions] = useState<Set<string>>(new Set());
    const [realBalances, setRealBalances] = useState<Record<string, number>>({});
    const [realPrices, setRealPrices] = useState<Record<string, number>>({});
    const [sellsBySymbol, setSellsBySymbol] = useState<Record<string, SpotExecution[]>>({});

    // Novos estados para filtros e estatísticas
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: '',
        endDate: ''
    });
    const [tradingStats, setTradingStats] = useState<TradingStats>({
        totalBuys: 0,
        totalSells: 0,
        totalMatches: 0,
        positiveMatches: 0,
        negativeMatches: 0,
        averagePositiveProfit: 0,
        averageNegativeProfit: 0,
        totalVolume: 0,
        totalProfit: 0
    });
    const [filteredExecutions, setFilteredExecutions] = useState<SpotExecution[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<SpotExecutionGroup[]>([]);

    // URL da API - forçar localhost para evitar problemas de DNS
    const API_URL = 'http://127.0.0.1:23231/api/v1';

    // Função para obter preço atual (somente REAL). Sem fallback simulado
    const getCurrentPrice = (symbol: string): number | undefined => {
        return realPrices[symbol];
    };

    // Derivar base e quote assets a partir do símbolo
    const parseSymbol = (symbol: string): { base: string; quote: string } => {
        const knownQuotes = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB', 'TUSD', 'FDUSD'];
        for (const q of knownQuotes) {
            if (symbol.endsWith(q)) {
                return { base: symbol.slice(0, symbol.length - q.length), quote: q };
            }
        }
        // fallback mínimo
        return { base: symbol.replace(/USDT|BTC|ETH|BNB|BUSD|USDC/g, ''), quote: 'USDT' };
    };

    // Função para fazer matching automático entre compras e vendas
    const matchBuySellExecutions = (buyExecutions: SpotExecution[], sellExecutions: SpotExecution[]): SpotExecution[] => {
        console.log('🔄 [MATCHING] Iniciando matching automático...');
        console.log(`🔍 [MATCHING] Compras: ${buyExecutions.length}, Vendas: ${sellExecutions.length}`);
        console.log('🔍 [MATCHING] Compras detalhadas:', buyExecutions.map(b => ({ id: b.id, symbol: b.symbol, qty: b.quantity, isSold: b.isSold })));
        console.log('🔍 [MATCHING] Vendas detalhadas:', sellExecutions.map(s => ({ id: s.id, symbol: s.symbol, qty: s.quantity })));

        // Ordenar vendas por tempo (FIFO)
        const sortedSells = [...sellExecutions].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        // Para cada venda, tentar fazer matching com compras da mesma moeda
        sortedSells.forEach((sellExecution, sellIndex) => {
            console.log(`🔍 [MATCHING] === VENDA ${sellIndex + 1} ===`);
            console.log(`🔍 [MATCHING] Venda ID: ${sellExecution.id} | Symbol: ${sellExecution.symbol} | Qty: ${sellExecution.quantity}`);

            // Encontrar compras da mesma moeda que ainda não foram vendidas
            const matchingBuys = buyExecutions.filter(buy =>
                buy.symbol === sellExecution.symbol &&
                !buy.isSold &&
                buy.quantity > 0
            );

            console.log(`🔍 [MATCHING] Compras disponíveis para ${sellExecution.symbol}: ${matchingBuys.length}`);
            matchingBuys.forEach((buy, idx) => {
                console.log(`🔍 [MATCHING]   Compra ${idx + 1}: ID ${buy.id} | Qty: ${buy.quantity} | isSold: ${buy.isSold}`);
            });

            // Fazer matching exato por quantidade (FIFO)
            for (let i = 0; i < matchingBuys.length; i++) {
                const buyExecution = matchingBuys[i];

                // Match exato de quantidade
                const quantityDiff = Math.abs(buyExecution.quantity - sellExecution.quantity);
                console.log(`🔍 [MATCHING] Comparando: Compra ${buyExecution.quantity} vs Venda ${sellExecution.quantity} (diff: ${quantityDiff})`);

                if (quantityDiff < 1e-12) {
                    console.log(`🔗 [MATCHING] *** MATCH ENCONTRADO! ***`);
                    console.log(`🔗 [MATCHING] Venda: ${sellExecution.quantity} | Compra: ${buyExecution.quantity}`);

                    // Atualizar APENAS o estado da compra (sem criar cópias)
                    buyExecution.sellPrice = sellExecution.price;
                    buyExecution.totalSellValue = sellExecution.quantity * sellExecution.price;
                    buyExecution.profit = buyExecution.totalSellValue! - (buyExecution.quantity * buyExecution.buyPrice!);
                    buyExecution.sellTime = sellExecution.time;
                    buyExecution.isSold = true;
                    buyExecution.matchedSellId = sellExecution.id;

                    console.log(`✅ [MATCHING] *** MATCH CONCLUÍDO! ***`);
                    console.log(`✅ [MATCHING] Compra ID: ${buyExecution.id} | Venda ID: ${sellExecution.id}`);
                    console.log(`✅ [MATCHING] isSold: ${buyExecution.isSold} | Profit: $${buyExecution.profit?.toFixed(2)}`);
                    break; // Match exato encontrado, sair do loop
                } else {
                    console.log(`❌ [MATCHING] Quantidades não coincidem: ${buyExecution.quantity} != ${sellExecution.quantity}`);
                }
            }
        });

        console.log(`✅ [MATCHING] Matching concluído. Compras processadas: ${buyExecutions.length}`);
        console.log('🔍 [MATCHING] Estado final das compras:', buyExecutions.map(b => ({
            id: b.id,
            isSold: b.isSold,
            matchedSellId: b.matchedSellId,
            profit: b.profit
        })));
        return buyExecutions; // Retorna as compras originais (modificadas in-place)
    };

    // Função para processar execuções com nova dinâmica buy/sell
    const processExecutionsWithBuySell = (executions: SpotExecution[]): SpotExecution[] => {
        console.log('🔄 [DEBUG] Iniciando processamento de execuções...');
        console.log('🔍 [DEBUG] Total de execuções recebidas:', executions.length);

        try {
            const buyExecutions: SpotExecution[] = [];
            const sellExecutions: SpotExecution[] = [];

            // Separar compras e vendas
            executions.forEach((execution, index) => {
                console.log(`🔍 [DEBUG] Processando execução ${index + 1}/${executions.length}: ${execution.symbol} - ${execution.side}`);

                if (execution.side === 'BUY') {
                    const buyExecution = { ...execution };
                    buyExecution.buyPrice = execution.price;
                    buyExecution.totalBuyValue = execution.quantity * execution.price;
                    buyExecution.isSold = false;
                    buyExecutions.push(buyExecution);
                    console.log(`💰 [DEBUG] Compra adicionada: ${execution.symbol} - ${execution.quantity} @ ${execution.price}`);
                } else {
                    sellExecutions.push(execution);
                    console.log(`💸 [DEBUG] Venda encontrada: ${execution.symbol} - ${execution.quantity} @ ${execution.price}`);
                }
            });

            console.log(`🔍 [DEBUG] Compras encontradas: ${buyExecutions.length}`);
            console.log(`🔍 [DEBUG] Vendas encontradas: ${sellExecutions.length}`);

            // Fazer matching automático entre compras e vendas
            console.log('🚀 [DEBUG] ANTES DO MATCHING - Compras:', buyExecutions.length, 'Vendas:', sellExecutions.length);
            const matchedExecutions = matchBuySellExecutions(buyExecutions, sellExecutions);
            console.log('🚀 [DEBUG] APÓS O MATCHING - Compras vendidas:', matchedExecutions.filter(b => b.isSold).length);

            // Log das compras após matching
            console.log(`🔍 [DEBUG] Compras após matching:`);
            matchedExecutions.forEach((buy, index) => {
                console.log(`  ${index + 1}. ${buy.symbol} - ${buy.quantity} @ ${buy.price} - Vendida: ${buy.isSold}`);
            });

            console.log(`✅ [DEBUG] Processamento concluído. Compras processadas: ${matchedExecutions.length}`);
            return matchedExecutions;

        } catch (error) {
            console.error('❌ [DEBUG] Erro no processamento de execuções:', error);
            throw error;
        }
    };

    // Função para agrupar compras por moeda
    const groupBuyExecutionsBySymbol = (buyExecutions: SpotExecution[]): SpotExecutionGroup[] => {
        console.log('🔄 [DEBUG] Iniciando agrupamento de compras...');
        console.log('🔍 [DEBUG] Compras para agrupar:', buyExecutions.length);

        const groupsMap = new Map<string, SpotExecutionGroup>();

        buyExecutions.forEach((execution, index) => {
            console.log(`🔍 [DEBUG] Processando compra ${index + 1}/${buyExecutions.length}:`, execution.symbol);

            const symbol = execution.symbol;

            if (!groupsMap.has(symbol)) {
                console.log(`🆕 [DEBUG] Criando novo grupo para ${symbol}`);
                const parsed = parseSymbol(symbol);
                groupsMap.set(symbol, {
                    symbol: symbol,
                    baseAsset: parsed.base || execution.fromAsset || symbol.replace('USDT', ''),
                    quoteAsset: parsed.quote || execution.toAsset || 'USDT',
                    buyExecutions: [],
                    totalBought: 0,
                    totalSold: 0,
                    totalSpent: 0,
                    totalReceived: 0,
                    netPnl: 0,
                    netPnlPercentage: 0,
                    firstBuyTime: execution.time,
                    lastActivityTime: execution.time
                });
            }

            const group = groupsMap.get(symbol)!;
            group.buyExecutions.push(execution);

            // Calcular totais
            group.totalBought += execution.quantity;
            group.totalSpent += execution.totalBuyValue || 0;

            if (execution.isSold) {
                group.totalSold += execution.quantity;
                group.totalReceived += execution.totalSellValue || 0;
            }

            // Atualizar datas
            if (new Date(execution.time) < new Date(group.firstBuyTime)) {
                group.firstBuyTime = execution.time;
            }
            if (new Date(execution.time) > new Date(group.lastActivityTime)) {
                group.lastActivityTime = execution.time;
            }
        });

        console.log(`🔍 [DEBUG] Grupos criados: ${groupsMap.size}`);

        // Calcular estatísticas finais
        groupsMap.forEach(group => {
            group.netPnl = group.totalReceived - group.totalSpent;
            group.netPnlPercentage = group.totalSpent > 0 ? (group.netPnl / group.totalSpent) * 100 : 0;
        });

        const result = Array.from(groupsMap.values());
        console.log('✅ [DEBUG] Agrupamento concluído:', result);
        return result;
    };

    // Construir linhas pareadas (compras vs vendas) por símbolo com match exato de quantidade
    const buildPairedRows = (symbol: string, buys: SpotExecution[]): MatchedRow[] => {
        const sells = sellsBySymbol[symbol] || [];
        const buyPool = [...buys];
        const sellPool = [...sells];

        console.log(`🔍 [BUILD ROWS] ${symbol}: ${buyPool.length} compras, ${sellPool.length} vendas`);
        console.log(`🔍 [BUILD ROWS] Compras vendidas: ${buyPool.filter(b => b.isSold).length}`);
        console.log(`🔍 [BUILD ROWS] Compras detalhadas:`, buyPool.map(b => ({
            id: b.id,
            isSold: b.isSold,
            matchedSellId: b.matchedSellId,
            profit: b.profit
        })));
        console.log(`🔍 [BUILD ROWS] Vendas detalhadas:`, sellPool.map(s => ({
            id: s.id,
            symbol: s.symbol,
            quantity: s.quantity
        })));

        const usedSell = new Set<string>();
        const rows: MatchedRow[] = [];

        // PRIMEIRO: Adicionar TODAS as compras (vendidas e não vendidas)
        for (let bi = 0; bi < buyPool.length; bi++) {
            const buy = buyPool[bi];

            if (buy.isSold && buy.matchedSellId) {
                // Compra vendida - encontrar a venda correspondente
                const matchedSell = sellPool.find(sell => sell.id === buy.matchedSellId);

                if (matchedSell) {
                    usedSell.add(matchedSell.id);
                    rows.push({
                        buy,
                        sell: matchedSell,
                        hasMatch: true,
                        profit: buy.profit
                    });
                    console.log(`🔗 [BUILD ROWS] Match encontrado: Compra ${buy.quantity} + Venda ${matchedSell.quantity}`);
                } else {
                    // Venda não encontrada no pool - pode ser uma venda recém-executada
                    // Criar uma venda virtual com os dados da compra vendida
                    const virtualSell: SpotExecution = {
                        id: buy.matchedSellId,
                        symbol: buy.symbol,
                        side: 'SELL',
                        quantity: buy.quantity,
                        price: buy.sellPrice || buy.price,
                        quoteQuantity: (buy.sellPrice || buy.price) * buy.quantity,
                        commission: 0,
                        commissionAsset: 'USDT',
                        fromAsset: buy.fromAsset,
                        toAsset: buy.toAsset,
                        time: buy.sellTime || new Date().toISOString(),
                        isMaker: false,
                        isBestMatch: true,
                        realDollarCost: (buy.sellPrice || buy.price) * buy.quantity,
                        originalCommission: 0,
                        simulatedRate: 0,
                        buyPrice: buy.sellPrice || buy.price,
                        totalBuyValue: (buy.sellPrice || buy.price) * buy.quantity,
                        isSold: false
                    };

                    rows.push({
                        buy,
                        sell: virtualSell,
                        hasMatch: true,
                        profit: buy.profit
                    });
                    console.log(`🔗 [BUILD ROWS] Match virtual criado: Compra ${buy.quantity} + Venda virtual ${virtualSell.quantity}`);
                }
            } else {
                // Compra não vendida
                rows.push({ buy, hasMatch: false });
            }
        }

        // SEGUNDO: Adicionar vendas que não têm match com compras
        for (let si = 0; si < sellPool.length; si++) {
            const sell = sellPool[si];
            if (!usedSell.has(sell.id)) {
                rows.push({ sell, hasMatch: false });
                console.log(`🔍 [BUILD ROWS] Venda sem match: ${sell.quantity}`);
            }
        }

        // Ordenar por data (mais antigo primeiro), considerando buy/sell time
        rows.sort((a, b) => {
            const ta = new Date(a.buy?.time || a.sell?.time || 0).getTime();
            const tb = new Date(b.buy?.time || b.sell?.time || 0).getTime();
            return ta - tb;
        });

        console.log(`✅ [BUILD ROWS] Total de linhas criadas: ${rows.length}`);
        console.log(`✅ [BUILD ROWS] Linhas com match: ${rows.filter(r => r.hasMatch).length}`);
        return rows;
    };

    // Função para calcular estatísticas
    const calculateStats = (buyExecutions: SpotExecution[]): SpotExecutionsStats => {
        console.log('🔄 [DEBUG] Calculando estatísticas...');
        console.log('🔍 [DEBUG] Compras para calcular:', buyExecutions.length);

        const totalExecutions = buyExecutions.length;
        const totalVolume = buyExecutions.reduce((sum, exec) => sum + (exec.totalBuyValue || 0), 0);
        const totalCommission = buyExecutions.reduce((sum, exec) => sum + exec.commission, 0);
        const totalProfit = buyExecutions.reduce((sum, exec) => sum + (exec.profit || 0), 0);
        const buyExecutionsCount = buyExecutions.filter(exec => exec.side === 'BUY').length;
        const sellExecutionsCount = buyExecutions.filter(exec => exec.isSold).length;

        const stats = {
            totalExecutions,
            totalVolume,
            totalCommission,
            totalProfit,
            totalProfitPercentage: totalVolume > 0 ? (totalProfit / totalVolume) * 100 : 0,
            buyExecutions: buyExecutionsCount,
            sellExecutions: sellExecutionsCount
        };

        console.log('✅ [DEBUG] Estatísticas calculadas:', stats);
        return stats;
    };

    // Função para carregar saldos reais
    const loadBalances = async (): Promise<Record<string, number>> => {
        try {
            console.log('💰 [SALDO REAL] Buscando saldos REAIS da Binance Testnet...');

            const response = await fetch(`${API_URL}/binance/balances`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Aceita múltiplos formatos de resposta do backend
            // Preferência: { success, balances: BinanceBalance[] }
            // Alternativas: { success, data: { balances: [] } } ou { success, data: [] }
            if (data && data.success === false) {
                throw new Error(data.message || 'Erro ao buscar saldos');
            }

            const possibleBalances = Array.isArray(data?.balances)
                ? data.balances
                : Array.isArray(data?.data?.balances)
                    ? data.data.balances
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

            const balanceMap: Record<string, number> = {};
            (possibleBalances as BinanceBalance[]).forEach((balance) => {
                if (!balance || !balance.asset) return;
                const free = parseFloat((balance.free as any) || '0');
                const locked = parseFloat((balance.locked as any) || '0');
                const total = (isFinite(free) ? free : 0) + (isFinite(locked) ? locked : 0);
                balanceMap[balance.asset] = total;
            });

            console.log('✅ [SALDO REAL] Saldos REAIS obtidos:', Object.keys(balanceMap).length);
            return balanceMap;

        } catch (error) {
            console.error('❌ [SALDO REAL] Erro ao buscar saldos:', error);
            return {};
        }
    };

    // Função para carregar preços reais
    const loadPrices = async (symbols: string[]): Promise<Record<string, number>> => {
        try {
            console.log('📈 [PREÇO REAL] Buscando preços atuais REAIS da Binance Testnet...');

            const prices: Record<string, number> = {};

            // Buscar preços individuais para cada símbolo
            for (const symbol of symbols) {
                try {
                    const response = await fetch(`${API_URL}/binance/price/${symbol}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.price) {
                            prices[symbol] = parseFloat(data.price);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ [PREÇO REAL] Erro ao buscar preço para ${symbol}:`, error);
                }
            }

            // Sem fallback simulado: manter apenas preços reais obtidos

            console.log('✅ [PREÇO REAL] Preços obtidos:', Object.keys(prices).length);
            return prices;

        } catch (error) {
            console.error('❌ [PREÇO REAL] Erro ao buscar preços:', error);
            return {};
        }
    };

    // Função para carregar saldos e preços reais
    const loadRealData = async (symbols: string[]) => {
        try {
            console.log('💰 [DADOS REAIS] Carregando saldos e preços REAIS da Binance Testnet...');

            // Carregar saldos e preços em paralelo
            const [balances, prices] = await Promise.all([
                loadBalances(),
                loadPrices(symbols)
            ]);

            setRealBalances(balances);
            setRealPrices(prices);

            // Validar: exigir preço para todos os símbolos
            const missing = symbols.filter(s => prices[s] === undefined || Number.isNaN(prices[s]));
            if (missing.length > 0) {
                throw new Error(`Preço REAL indisponível para: ${missing.join(', ')}`);
            }

            console.log('✅ [DADOS REAIS] Dados reais carregados com sucesso!');

        } catch (error) {
            console.error('❌ [DADOS REAIS] Erro ao carregar dados reais:', error);
            setError(error instanceof Error ? error.message : 'Erro ao carregar dados reais');
        }
    };

    // Função para calcular estatísticas de trading
    const calculateTradingStats = (executions: SpotExecution[]): TradingStats => {
        const buys = executions.filter(e => e.side === 'BUY');
        const sells = executions.filter(e => e.side === 'SELL');
        const matches = executions.filter(e => e.isSold && e.profit !== undefined);

        const positiveMatches = matches.filter(m => (m.profit || 0) > 0);
        const negativeMatches = matches.filter(m => (m.profit || 0) < 0);

        const totalVolume = executions.reduce((sum, e) => sum + (e.quantity * e.price), 0);
        const totalProfit = matches.reduce((sum, m) => sum + (m.profit || 0), 0);

        const averagePositiveProfit = positiveMatches.length > 0
            ? positiveMatches.reduce((sum, m) => sum + (m.profit || 0), 0) / positiveMatches.length
            : 0;

        const averageNegativeProfit = negativeMatches.length > 0
            ? negativeMatches.reduce((sum, m) => sum + (m.profit || 0), 0) / negativeMatches.length
            : 0;

        return {
            totalBuys: buys.length,
            totalSells: sells.length,
            totalMatches: matches.length,
            positiveMatches: positiveMatches.length,
            negativeMatches: negativeMatches.length,
            averagePositiveProfit,
            averageNegativeProfit,
            totalVolume,
            totalProfit
        };
    };

    // Função para filtrar execuções por data
    const filterExecutionsByDate = (executions: SpotExecution[], startDate: string, endDate: string): SpotExecution[] => {
        if (!startDate && !endDate) return executions;

        return executions.filter(execution => {
            const executionDate = new Date(execution.time);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();

            return executionDate >= start && executionDate <= end;
        });
    };

    // Função para calcular lucro se vender agora
    const calculateProfitIfSellNow = (execution: SpotExecution): number => {
        if (execution.side !== 'BUY' || execution.isSold) return 0;

        const currentPrice = getCurrentPrice(execution.symbol);
        if (currentPrice === undefined) return 0;

        const buyValue = execution.quantity * (execution.buyPrice || execution.price);
        const sellValue = execution.quantity * currentPrice;

        return sellValue - buyValue;
    };

    // Função para carregar dados
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📊 [HISTÓRICO BINANCE] Carregando dados reais da Binance...');
            console.log('📊 [HISTÓRICO BINANCE] Carregando histórico REAL de trades da Binance Testnet...');

            // Buscar trades spot usando a API que inclui todos os mercados
            const spotResponse = await fetch('http://127.0.0.1:23231/api/analysis/position-history?page=1&limit=100');
            if (!spotResponse.ok) {
                throw new Error(`HTTP error! status: ${spotResponse.status}`);
            }
            const spotData = await spotResponse.json();

            console.log('🔍 [DEBUG] Dados brutos recebidos:', spotData);

            // Buscar triggers salvos
            const savedTriggers = spotData.triggers || [];
            console.log(`💾 [TRIGGERS] ${savedTriggers.length} triggers carregados`);

            // Mapear posições para SpotExecution (formato da API position-history)
            const mappedExecutions: SpotExecution[] = spotData.positions.map((position: any) => {
                // Buscar trigger correspondente
                const trigger = savedTriggers.find((t: any) => t.executionId === position.id.toString());

                return {
                    id: position.id.toString(),
                    symbol: position.symbol,
                    side: position.side, // Já vem como 'BUY' ou 'SELL'
                    quantity: parseFloat(position.quantity),
                    price: parseFloat(position.openPrice),
                    quoteQuantity: parseFloat(position.quantity) * parseFloat(position.openPrice),
                    commission: position.commission || 0,
                    commissionAsset: 'USDT',
                    fromAsset: position.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', ''),
                    toAsset: 'USDT',
                    time: new Date(position.openTime).toISOString(),
                    isMaker: false, // Não disponível na API position-history
                    isBestMatch: true, // Assumir true
                    realDollarCost: parseFloat(position.quantity) * parseFloat(position.openPrice),
                    originalCommission: position.commission || 0,
                    simulatedRate: 0.001, // 0.1% simulado
                    buyPrice: position.side === 'BUY' ? parseFloat(position.openPrice) : undefined,
                    totalBuyValue: position.side === 'BUY' ? parseFloat(position.quantity) * parseFloat(position.openPrice) : undefined,
                    isSold: position.status === 'CLOSED',
                    // Incluir triggers salvos
                    profitTrigger: trigger?.profitTrigger,
                    lossTrigger: trigger?.lossTrigger
                };
            });

            console.log(`✅ [HISTÓRICO BINANCE] ${mappedExecutions.length} trades/posições REAIS carregados da Binance Testnet`);
            console.log('🔍 [DEBUG] Execuções mapeadas:', mappedExecutions);

            // Construir mapa de vendas por símbolo (para exibir todas vendas mesmo sem match)
            const sellsMap: Record<string, SpotExecution[]> = {};
            mappedExecutions
                .filter((e: SpotExecution) => e.side === 'SELL')
                .forEach((e: SpotExecution) => {
                    if (!sellsMap[e.symbol]) sellsMap[e.symbol] = [];
                    sellsMap[e.symbol].push(e);
                });
            // Ordenar vendas por tempo
            Object.keys(sellsMap).forEach(sym => sellsMap[sym].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));

            try {
                // Processar com nova dinâmica
                console.log('🔄 [DEBUG] Processando execuções...');
                const processedExecutions = processExecutionsWithBuySell(mappedExecutions);
                console.log('🔍 [DEBUG] Execuções processadas:', processedExecutions);

                console.log('🔄 [DEBUG] Agrupando execuções...');
                const groupedExecutions = groupBuyExecutionsBySymbol(processedExecutions);
                console.log('🔍 [DEBUG] Grupos criados:', groupedExecutions);

                console.log('🔄 [DEBUG] Calculando estatísticas...');
                const calculatedStats = calculateStats(processedExecutions);
                console.log('🔍 [DEBUG] Estatísticas calculadas:', calculatedStats);

                console.log('🔄 [DEBUG] Atualizando estado...');
                setExecutions(processedExecutions);
                setGroups(groupedExecutions);
                setStats(calculatedStats);
                setSellsBySymbol(sellsMap);

                // Carregar saldos e preços reais para os símbolos encontrados
                const symbols = Array.from(new Set(processedExecutions.map(exec => exec.symbol)));
                await loadRealData(symbols);

                console.log('✅ [HISTÓRICO BINANCE] Dados carregados com sucesso!');
            } catch (processingError) {
                console.error('❌ [DEBUG] Erro no processamento:', processingError);
                throw processingError;
            }

        } catch (err) {
            console.error('❌ [HISTÓRICO BINANCE] Erro ao carregar histórico:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            console.log('🔄 [DEBUG] Finalizando carregamento...');
            setLoading(false);
        }
    };

    // Função para executar venda real na Binance
    const executeRealSell = async (execution: SpotExecution): Promise<any> => {
        try {
            console.log(`🚀 [VENDA REAL] Executando venda real na Binance: ${execution.symbol}`);

            const sellQuantity = execution.quantity;

            // Chamar endpoint real de venda no backend
            const response = await fetch('http://127.0.0.1:23231/api/v1/binance/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol: execution.symbol,
                    quantity: sellQuantity
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao executar venda');
            }

            console.log('✅ [VENDA REAL] Ordem executada com sucesso na Binance:', result.data);
            return result.data;

        } catch (error) {
            console.error('❌ [VENDA REAL] Erro ao executar venda:', error);
            return false;
        }
    };

    // Função para simular venda
    const handleSellExecution = async (execution: SpotExecution) => {
        if (execution.isSold) return;

        console.log('🔄 [DEBUG] Iniciando venda...');

        // Marcar como vendendo
        setSellingExecutions(prev => new Set(prev).add(execution.id));

        try {
            // Executar venda real na Binance
            const sellResult = await executeRealSell(execution);

            if (!sellResult) {
                console.error('❌ [VENDA] Falha ao executar venda real');
                return;
            }

            // Usar preço real da venda executada
            const sellPrice = sellResult.price || getCurrentPrice(execution.symbol);
            const sellQuantity = execution.quantity;
            const sellValue = sellQuantity * sellPrice;
            const profit = sellValue - (execution.totalBuyValue || 0);

            // Atualizar execução
            const updatedExecution = {
                ...execution,
                sellPrice: sellPrice,
                totalSellValue: sellValue,
                profit: profit,
                sellTime: new Date().toISOString(),
                isSold: true,
                matchedSellId: sellResult.orderId || Date.now().toString(),
                // Garantir que os dados de venda sejam salvos
                side: 'BUY' as const, // Manter como BUY mas com dados de venda
                totalBuyValue: execution.totalBuyValue || execution.quoteQuantity
            };

            console.log('🔍 [DEBUG] Execução atualizada:', updatedExecution);

            // Atualizar estado
            setExecutions(prev => {
                const newExecutions = prev.map(exec => exec.id === execution.id ? updatedExecution : exec);
                console.log('🔍 [DEBUG] Novas execuções:', newExecutions);
                return newExecutions;
            });

            // Recalcular grupos e estatísticas
            setExecutions(prev => {
                const updatedExecutions = prev.map(exec => exec.id === execution.id ? updatedExecution : exec);
                const updatedGroups = groupBuyExecutionsBySymbol(updatedExecutions);
                const updatedStats = calculateStats(updatedExecutions);

                setGroups(updatedGroups);
                setStats(updatedStats);

                console.log('🔍 [DEBUG] Grupos atualizados:', updatedGroups);
                console.log('🔍 [DEBUG] Estatísticas atualizadas:', updatedStats);

                return updatedExecutions;
            });

            console.log(`💸 [VENDA REAL] ${execution.symbol}: ${sellQuantity} @ $${sellPrice} | Lucro: $${profit.toFixed(2)}`);

            // Desativar trigger quando compra é vendida
            await deactivateTrigger(execution.id);

        } finally {
            // Remover do estado de vendendo
            setSellingExecutions(prev => {
                const newSet = new Set(prev);
                newSet.delete(execution.id);
                return newSet;
            });
        }
    };

    // Função para salvar trigger
    const saveTrigger = async (execution: SpotExecution, profitTrigger?: number, lossTrigger?: number) => {
        try {
            console.log(`💾 [TRIGGERS] Salvando trigger para execução ${execution.id}:`, {
                symbol: execution.symbol,
                quantity: execution.quantity,
                buyPrice: execution.buyPrice || execution.price,
                profitTrigger,
                lossTrigger
            });

            const response = await fetch('http://127.0.0.1:23231/api/v1/binance/triggers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    executionId: execution.id,
                    symbol: execution.symbol,
                    quantity: execution.quantity,
                    buyPrice: execution.buyPrice || execution.price,
                    profitTrigger,
                    lossTrigger
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ [TRIGGERS] Trigger salvo com sucesso:', result);
            return result;
        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao salvar trigger:', error);
            return false;
        }
    };

    // Função para atualizar trigger
    const updateTrigger = async (executionId: string, profitTrigger?: number, lossTrigger?: number) => {
        try {
            console.log(`🔄 [TRIGGERS] Atualizando trigger para execução ${executionId}:`, {
                profitTrigger,
                lossTrigger
            });

            const response = await fetch(`http://127.0.0.1:23231/api/v1/binance/triggers/${executionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profitTrigger,
                    lossTrigger
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ [TRIGGERS] Trigger atualizado com sucesso:', result);
            return result;
        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao atualizar trigger:', error);
            return false;
        }
    };

    // Função para desativar trigger (quando compra é vendida)
    const deactivateTrigger = async (executionId: string) => {
        try {
            console.log(`🔴 [TRIGGERS] Desativando trigger para execução ${executionId}`);

            const response = await fetch(`http://127.0.0.1:23231/api/v1/binance/triggers/${executionId}/deactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ [TRIGGERS] Trigger desativado com sucesso:', result);
            return result;
        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao desativar trigger:', error);
            return false;
        }
    };

    // Função para lidar com mudança de trigger
    const handleTriggerChange = async (execution: SpotExecution, type: 'profit' | 'loss', value: number) => {
        try {
            console.log(`🔄 [TRIGGERS] Mudança de trigger ${type} para execução ${execution.id}: ${value}`);

            // Se a execução já tem trigger salvo, atualizar
            if (execution.profitTrigger !== undefined || execution.lossTrigger !== undefined) {
                const updates: { profitTrigger?: number; lossTrigger?: number } = {};
                if (type === 'profit') updates.profitTrigger = value;
                if (type === 'loss') updates.lossTrigger = value;

                await updateTrigger(execution.id, updates.profitTrigger, updates.lossTrigger);
            } else {
                // Se não tem trigger salvo, criar novo
                const profitTrigger = type === 'profit' ? value : execution.profitTrigger;
                const lossTrigger = type === 'loss' ? value : execution.lossTrigger;

                await saveTrigger(execution, profitTrigger, lossTrigger);
            }

            // Atualizar estado local
            setExecutions(prev => prev.map(exec =>
                exec.id === execution.id
                    ? {
                        ...exec,
                        [type === 'profit' ? 'profitTrigger' : 'lossTrigger']: value
                    }
                    : exec
            ));

        } catch (error) {
            console.error('❌ [TRIGGERS] Erro ao processar mudança de trigger:', error);
        }
    };

    useEffect(() => {
        console.log('🔄 [DEBUG] useEffect executado');
        loadData();
    }, []);

    // useEffect para aplicar filtros e calcular estatísticas
    useEffect(() => {
        console.log('🔄 [DEBUG] useEffect de filtros executado');

        // Aplicar filtro de data
        const filtered = filterExecutionsByDate(executions, dateRange.startDate, dateRange.endDate);
        setFilteredExecutions(filtered);

        // Calcular estatísticas
        const stats = calculateTradingStats(filtered);
        setTradingStats(stats);

        // Agrupar as execuções FILTRADAS (não todas as execuções)
        const grouped = groupBuyExecutionsBySymbol(filtered);
        setFilteredGroups(grouped);

        console.log('✅ [DEBUG] Filtros aplicados - usando execuções filtradas para agrupamento');

    }, [executions, dateRange]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando histórico de execuções...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Erro ao carregar dados</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📊 Histórico de Execuções Spot
                </h2>
                <p className="text-gray-600">
                    Dados 100% REAIS da Binance Testnet - Nova dinâmica Buy/Sell
                </p>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Filtros de Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end space-x-3">
                        <button
                            onClick={() => setDateRange({ startDate: '', endDate: '' })}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Limpar Filtros
                        </button>
                        <button
                            onClick={() => {
                                console.log('🔄 [ATUALIZAR] Aplicando filtros aos dados existentes...');
                                // Forçar re-aplicação dos filtros sem recarregar dados
                                const filtered = filterExecutionsByDate(executions, dateRange.startDate, dateRange.endDate);
                                setFilteredExecutions(filtered);

                                const stats = calculateTradingStats(filtered);
                                setTradingStats(stats);

                                const grouped = groupBuyExecutionsBySymbol(filtered);
                                setFilteredGroups(grouped);

                                console.log('✅ [ATUALIZAR] Filtros re-aplicados com sucesso!');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Atualizar Filtros</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Total Compras/Vendas</h3>
                    <p className="text-2xl font-bold text-blue-900">{tradingStats.totalBuys}/{tradingStats.totalSells}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Matches Lucro Positivo</h3>
                    <p className="text-2xl font-bold text-green-900">{tradingStats.positiveMatches}</p>
                    <p className="text-sm text-green-700">Média: ${tradingStats.averagePositiveProfit.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800">Matches Lucro Negativo</h3>
                    <p className="text-2xl font-bold text-red-900">{tradingStats.negativeMatches}</p>
                    <p className="text-sm text-red-700">Média: ${tradingStats.averageNegativeProfit.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">Volume Total</h3>
                    <p className="text-2xl font-bold text-purple-900">${tradingStats.totalVolume.toFixed(2)}</p>
                </div>
            </div>

            {/* Card de Lucro Total */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg shadow mb-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">💰 Lucro Total</h3>
                    <p className={`text-4xl font-bold ${tradingStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${tradingStats.totalProfit.toFixed(2)}
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                        {tradingStats.totalMatches} matches realizados
                    </p>
                </div>
            </div>

            {/* Monitor de Gatilhos */}
            <TriggerMonitor
                executions={filteredExecutions as any}
                onSellExecution={handleSellExecution as any}
                onRefreshData={loadData}
            />

            {/* Controles de visualização */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setViewMode('groups')}
                    className={`px-4 py-2 rounded ${viewMode === 'groups'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Por Moeda
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded ${viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Lista Completa
                </button>
            </div>

            {/* Visualização por grupos */}
            {viewMode === 'groups' && (
                <div className="space-y-6">
                    {filteredGroups.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Nenhum Trade Encontrado
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Sua conta da Binance Testnet não possui histórico de trades ainda.
                            </p>
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                🔄 Atualizar Dados
                            </button>
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div key={group.symbol} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {group.symbol} ({group.baseAsset}/{group.quoteAsset})
                                        </h3>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Saldo Real: {realBalances[group.baseAsset] ? realBalances[group.baseAsset].toFixed(6) : '0.000000'} {group.baseAsset}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {getCurrentPrice(group.symbol) !== undefined && realBalances[group.baseAsset] !== undefined ? (
                                                <>Saldo Atual em Dólares: ${(realBalances[group.baseAsset] * (getCurrentPrice(group.symbol) as number)).toFixed(2)}</>
                                            ) : (
                                                'Saldo Atual em Dólares: -'
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">
                                            {getCurrentPrice(group.symbol) !== undefined ? (
                                                <>Preço Atual: ${getCurrentPrice(group.symbol)!.toFixed(2)}</>
                                            ) : (
                                                <span className="text-red-600 font-medium">Erro: preço real indisponível</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Duas listas lado a lado: Compras e Vendas */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                    {/* Compras */}
                                    <div className="overflow-x-auto">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">COMPRAS</div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Compra</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Compra</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Compra</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro se Vender</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gatilho Profit</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gatilho Loss</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {buildPairedRows(group.symbol, group.buyExecutions).map((row, idx) => (
                                                    <tr key={`buy-${group.symbol}-${idx}`} className="hover:bg-gray-50">
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.buy?.isSold
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {row.buy ? (row.buy.isSold ? 'Comprada e Vendida' : 'Moeda Comprada') : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.buy ? row.buy.quantity.toFixed(10) : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.buy ? `$${(row.buy.buyPrice ?? row.buy.price).toFixed(8)}` : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.buy ? `$${(row.buy.totalBuyValue ?? (row.buy.quantity * (row.buy.buyPrice ?? row.buy.price))).toFixed(8)}` : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-500">
                                                            {row.buy ? new Date(row.buy.time).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm">
                                                            {row.buy && !row.buy.isSold ? (
                                                                <span className={`font-medium ${calculateProfitIfSellNow(row.buy) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    ${calculateProfitIfSellNow(row.buy).toFixed(2)}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap">
                                                            {row.buy && !row.buy.isSold ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="Profit $"
                                                                    value={row.buy.profitTrigger || ''}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value) || 0;
                                                                        handleTriggerChange(row.buy!, 'profit', value);
                                                                    }}
                                                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                />
                                                            ) : row.buy?.profitTrigger ? (
                                                                <span className="text-gray-500 text-xs">
                                                                    ${row.buy.profitTrigger.toFixed(2)}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap">
                                                            {row.buy && !row.buy.isSold ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="Loss $"
                                                                    value={row.buy.lossTrigger || ''}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value) || 0;
                                                                        handleTriggerChange(row.buy!, 'loss', value);
                                                                    }}
                                                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                />
                                                            ) : row.buy?.lossTrigger ? (
                                                                <span className="text-gray-500 text-xs">
                                                                    ${row.buy.lossTrigger.toFixed(2)}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap">
                                                            {row.buy ? (
                                                                row.buy.isSold ? (
                                                                    <span className="px-2 py-1 text-white text-xs rounded bg-gray-500">
                                                                        Vendido
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleSellExecution(row.buy!)}
                                                                        disabled={sellingExecutions.has(row.buy.id)}
                                                                        className={`px-2 py-1 text-white text-xs rounded ${sellingExecutions.has(row.buy.id)
                                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                                            : 'bg-red-600 hover:bg-red-700'
                                                                            }`}
                                                                    >
                                                                        {sellingExecutions.has(row.buy.id) ? 'Vendendo...' : 'Vender'}
                                                                    </button>
                                                                )
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Vendas */}
                                    <div className="overflow-x-auto -mt-4">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">VENDAS</div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Venda</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Venda</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Venda</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match de Compra?</th>
                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro do Match</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {buildPairedRows(group.symbol, group.buyExecutions).map((row, idx) => (
                                                    <tr key={`sell-${group.symbol}-${idx}`} className="hover:bg-gray-50">
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.sell ? row.sell.quantity.toFixed(10) : row.buy && row.buy.isSold ? row.buy.quantity.toFixed(10) : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.sell ? `$${row.sell.price.toFixed(8)}` : row.buy && row.buy.sellPrice !== undefined ? `$${row.buy.sellPrice.toFixed(8)}` : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-900">
                                                            {row.sell ? `$${(row.sell.quantity * row.sell.price).toFixed(8)}` : row.buy && row.buy.totalSellValue !== undefined ? `$${row.buy.totalSellValue.toFixed(8)}` : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm text-gray-500">
                                                            {row.sell ? new Date(row.sell.time).toLocaleString() : row.buy && row.buy.sellTime ? new Date(row.buy.sellTime).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm font-medium">
                                                            {row.hasMatch ? <span className="text-green-700">SIM</span> : <span className="text-gray-500">NÃO</span>}
                                                        </td>
                                                        <td className="px-2 py-2 h-12 whitespace-nowrap text-sm">
                                                            {row.hasMatch && (row.profit !== undefined || row.buy?.profit !== undefined) ? (
                                                                <span className={`${(row.profit ?? row.buy?.profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                                                    ${((row.profit ?? row.buy?.profit) as number).toFixed(8)}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Visualização em lista */}
            {viewMode === 'list' && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Moeda
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantidade
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preço Compra
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor Compra
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ação
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preço Venda
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor Venda
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lucro
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data Compra
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data Venda
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {executions.map(execution => (
                                    <tr key={execution.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {execution.symbol}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${execution.isSold
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {execution.isSold ? 'Comprada e Vendida' : 'Moeda Comprada'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {execution.quantity.toFixed(6)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            ${execution.buyPrice?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            ${execution.totalBuyValue?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {!execution.isSold && (
                                                <button
                                                    onClick={() => handleSellExecution(execution)}
                                                    disabled={sellingExecutions.has(execution.id)}
                                                    className={`px-3 py-1 text-white text-xs rounded ${sellingExecutions.has(execution.id)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                        }`}
                                                >
                                                    {sellingExecutions.has(execution.id) ? 'Vendendo...' : 'Vender'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {execution.sellPrice ? `$${execution.sellPrice.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {execution.totalSellValue ? `$${execution.totalSellValue.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {execution.profit ? (
                                                <span className={`font-medium ${execution.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    ${execution.profit.toFixed(2)}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(execution.time).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {execution.sellTime ? new Date(execution.sellTime).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {executions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma execução encontrada</h3>
                    <p className="text-gray-500">Não há execuções de spot para exibir no momento.</p>
                </div>
            )}
        </div>
    );
};

export default SpotExecutionsPanel;