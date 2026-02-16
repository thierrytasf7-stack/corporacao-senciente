const { Router } = require('express');
const { BinanceController } = require('../controllers/BinanceController');

const router = Router();
const binanceController = new BinanceController();

// Rotas de teste e validação
router.get('/test-connection', binanceController.testConnection.bind(binanceController));

// Rotas de trading
router.get('/price/:symbol', binanceController.getCurrentPrice.bind(binanceController));

// Rota para colocar ordens REAIS
router.post('/order', binanceController.placeOrder.bind(binanceController));

module.exports = router;

