const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 23232;

// Middleware
app.use(cors());
app.use(express.json());

// Favorites service
class SimpleSpotFavoritesService {
    constructor() {
        this.favoritesFile = path.join(process.cwd(), 'data', 'spot-favorites.json');
        this.favorites = new Set();
        this.loadFavorites();
    }

    loadFavorites() {
        try {
            if (fs.existsSync(this.favoritesFile)) {
                const data = fs.readFileSync(this.favoritesFile, 'utf8');
                const favoritesArray = JSON.parse(data);
                this.favorites = new Set(favoritesArray);
                console.log(`📝 [FAVORITES] ${this.favorites.size} favoritos carregados`);
            } else {
                console.log(`📝 [FAVORITES] Nenhum favorito encontrado, iniciando vazio`);
            }
        } catch (error) {
            console.error(`❌ [FAVORITES] Erro ao carregar favoritos:`, error);
            this.favorites = new Set();
        }
    }

    saveFavorites() {
        try {
            const dir = path.dirname(this.favoritesFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const favoritesArray = Array.from(this.favorites);
            fs.writeFileSync(this.favoritesFile, JSON.stringify(favoritesArray, null, 2));
            console.log(`💾 [FAVORITES] ${favoritesArray.length} favoritos salvos`);
        } catch (error) {
            console.error(`❌ [FAVORITES] Erro ao salvar favoritos:`, error);
        }
    }

    toggleFavorite(strategyId) {
        console.log(`🔄 [FAVORITES] Toggle favorite para: ${strategyId}`);

        if (this.favorites.has(strategyId)) {
            this.favorites.delete(strategyId);
            console.log(`❌ [FAVORITES] Removido dos favoritos: ${strategyId}`);
        } else {
            this.favorites.add(strategyId);
            console.log(`✅ [FAVORITES] Adicionado aos favoritos: ${strategyId}`);
        }

        this.saveFavorites();
        return this.favorites.has(strategyId);
    }

    isFavorite(strategyId) {
        return this.favorites.has(strategyId);
    }

    getFavorites() {
        return Array.from(this.favorites);
    }

    getFavoritesCount() {
        return this.favorites.size;
    }
}

// Initialize service
const favoritesService = new SimpleSpotFavoritesService();

// Routes
app.post('/api/v1/spot-favorites/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID da estratégia é obrigatório',
                timestamp: new Date().toISOString()
            });
        }

        const isFavorite = favoritesService.toggleFavorite(id);

        return res.json({
            success: true,
            message: `Estratégia ${isFavorite ? 'adicionada aos' : 'removida dos'} favoritos`,
            strategyId: id,
            isFavorite: isFavorite,
            favoritesCount: favoritesService.getFavoritesCount(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ [FAVORITES] Erro ao alternar favorito:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/v1/spot-favorites', (req, res) => {
    try {
        const favorites = favoritesService.getFavorites();

        return res.json({
            success: true,
            favorites: favorites,
            count: favorites.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ [FAVORITES] Erro ao obter favoritos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/v1/spot-favorites/:id/status', (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID da estratégia é obrigatório',
                timestamp: new Date().toISOString()
            });
        }

        const isFavorite = favoritesService.isFavorite(id);

        return res.json({
            success: true,
            strategyId: id,
            isFavorite: isFavorite,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ [FAVORITES] Erro ao verificar status do favorito:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Simple Spot Favorites',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 [SIMPLE FAVORITES] Servidor rodando na porta ${PORT}`);
    console.log(`📊 [SIMPLE FAVORITES] Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 [SIMPLE FAVORITES] Toggle favorite: http://localhost:${PORT}/api/v1/spot-favorites/{id}/toggle`);
    console.log(`📋 [SIMPLE FAVORITES] Listar favoritos: http://localhost:${PORT}/api/v1/spot-favorites`);
});
