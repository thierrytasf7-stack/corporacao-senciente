import cors from 'cors';
import express from 'express';
import { SimpleSpotFavoritesController } from './controllers/SimpleSpotFavoritesController';

const app = express();
const PORT = 23232;

// Middleware
app.use(cors());
app.use(express.json());

// Controller
console.log('🔧 [SIMPLE FAVORITES] Inicializando controller...');
const favoritesController = new SimpleSpotFavoritesController();
console.log('✅ [SIMPLE FAVORITES] Controller inicializado!');

// Rotas
app.post('/api/v1/spot-favorites/:id/toggle', (req, res) => favoritesController.toggleFavorite(req, res));
app.get('/api/v1/spot-favorites', (req, res) => favoritesController.getFavorites(req, res));
app.get('/api/v1/spot-favorites/:id/status', (req, res) => favoritesController.getFavoriteStatus(req, res));

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
