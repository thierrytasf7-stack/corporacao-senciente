import { Router } from 'express';
import { BinanceMarketsController } from '../controllers/BinanceMarketsController';

const router = Router();
const controller = new BinanceMarketsController();

/**
 * @route GET /api/v1/binance/markets
 * @desc Get all available markets from Binance Testnet
 * @access Public
 */
router.get('/', controller.getAllMarkets.bind(controller));

/**
 * @route GET /api/v1/binance/markets/category/:category
 * @desc Get markets by category from Binance Testnet
 * @access Public
 */
router.get('/category/:category', controller.getMarketsByCategory.bind(controller));

/**
 * @route GET /api/v1/binance/markets/favorites
 * @desc Get favorite markets
 * @access Public
 */
router.get('/favorites', controller.getFavoriteMarkets.bind(controller));

export default router;
