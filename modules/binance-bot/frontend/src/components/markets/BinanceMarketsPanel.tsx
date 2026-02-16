import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api/client';

interface BinanceMarket {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
    permissions: string[];
    isSpotTradingAllowed: boolean;
    isMarginTradingAllowed: boolean;
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
    volume: string;
    quoteVolume: string;
    category: string;
    isFavorite: boolean;
}

export const BinanceMarketsPanel: React.FC = () => {
    const [markets, setMarkets] = useState<BinanceMarket[]>([]);
    const [filteredMarkets, setFilteredMarkets] = useState<BinanceMarket[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        fetchMarkets();
        loadFavorites();
    }, []);

    useEffect(() => {
        filterMarkets();
    }, [markets, selectedCategory, searchTerm, showFavoritesOnly, favorites]);

    const fetchMarkets = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get('/binance/markets');
            const data = response.data;

            if (data.success) {
                setMarkets(data.data);
                setCategories(data.categories);
                console.log(`📊 ${data.count} mercados reais da Binance Testnet carregados`);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            console.error('Erro ao carregar mercados:', err);
            setError('Erro ao carregar mercados da Binance: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterMarkets = () => {
        let filtered = [...markets];

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(market => market.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(market =>
                market.symbol.toLowerCase().includes(term) ||
                market.baseAsset.toLowerCase().includes(term) ||
                market.quoteAsset.toLowerCase().includes(term)
            );
        }

        // Filter by favorites only
        if (showFavoritesOnly) {
            filtered = filtered.filter(market => favorites.has(market.symbol));
        }

        setFilteredMarkets(filtered);
    };

    const toggleFavorite = (symbol: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(symbol)) {
            newFavorites.delete(symbol);
        } else {
            newFavorites.add(symbol);
        }
        setFavorites(newFavorites);
        saveFavorites(newFavorites);

        console.log(`⭐ ${symbol} ${newFavorites.has(symbol) ? 'adicionado aos' : 'removido dos'} favoritos`);
    };

    const saveFavorites = (favs: Set<string>) => {
        localStorage.setItem('binance-market-favorites', JSON.stringify(Array.from(favs)));
    };

    const loadFavorites = () => {
        try {
            const saved = localStorage.getItem('binance-market-favorites');
            if (saved) {
                setFavorites(new Set(JSON.parse(saved)));
            }
        } catch (err) {
            console.warn('Erro ao carregar favoritos:', err);
        }
    };

    const formatPrice = (price: string) => {
        const num = parseFloat(price);
        if (num === 0) return '0.00';
        if (num < 0.01) return num.toFixed(8);
        if (num < 1) return num.toFixed(6);
        if (num < 100) return num.toFixed(4);
        return num.toFixed(2);
    };

    const formatPercent = (percent: string) => {
        const num = parseFloat(percent);
        return num.toFixed(2);
    };

    const formatVolume = (volume: string) => {
        const num = parseFloat(volume);
        if (num === 0) return '0';
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(2);
    };

    const getPercentColor = (percent: string) => {
        const num = parseFloat(percent);
        if (num > 0) return 'text-green-500';
        if (num < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSearchTerm('');
        setShowFavoritesOnly(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        📊 Mercados Binance Testnet
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Todos os mercados disponíveis na Binance Testnet com dados reais
                    </p>
                </div>
                <button
                    onClick={fetchMarkets}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar mercado..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {/* Favorites Toggle */}
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showFavoritesOnly}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                        ⭐ Apenas favoritos ({favorites.size})
                    </span>
                </label>

                {/* Clear Filters */}
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Limpar filtros
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    Mostrando {filteredMarkets.length} de {markets.length} mercados
                    {selectedCategory && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {selectedCategory}
                        </span>
                    )}
                </p>
                {favorites.size > 0 && (
                    <p className="text-sm text-yellow-600">
                        ⭐ {favorites.size} mercados nos favoritos (usados na análise)
                    </p>
                )}
            </div>

            {/* Markets Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Favorito
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mercado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preço
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                24h %
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Volume 24h
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoria
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMarkets.map((market) => (
                            <tr key={market.symbol} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleFavorite(market.symbol)}
                                        className="text-yellow-500 hover:text-yellow-600"
                                    >
                                        {favorites.has(market.symbol) ? (
                                            <StarIconSolid className="h-5 w-5" />
                                        ) : (
                                            <StarIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {market.symbol}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {market.baseAsset} / {market.quoteAsset}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatPrice(market.lastPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={getPercentColor(market.priceChangePercent)}>
                                        {formatPercent(market.priceChangePercent)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatVolume(market.quoteVolume)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {market.category}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredMarkets.length === 0 && !loading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {searchTerm || selectedCategory || showFavoritesOnly
                                ? 'Nenhum mercado encontrado com os filtros aplicados'
                                : 'Nenhum mercado disponível'
                            }
                        </p>
                    </div>
                )}
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando mercados da Binance Testnet...
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    💡 <strong>Dica:</strong> Marque mercados com ⭐ para incluí-los na análise rotativa.
                    Os dados são reais da Binance Testnet e atualizados em tempo real.
                </p>
            </div>
        </div>
    );
};
