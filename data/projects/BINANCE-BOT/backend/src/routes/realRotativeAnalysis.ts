import { Router } from 'express';
import { RealRotativeAnalysisController } from '../controllers/RealRotativeAnalysisController';

console.log('🚨 [ROTAS] RealRotativeAnalysisRouter carregado!');

const router = Router();
const controller = new RealRotativeAnalysisController();

/**
 * @route POST /api/v1/real-analysis/start
 * @desc Start continuous rotative analysis
 * @access Public
 * @body { favoriteSymbols: string[] }
 */
router.post('/start', controller.startAnalysis.bind(controller));

/**
 * @route POST /api/v1/real-analysis/stop
 * @desc Stop continuous rotative analysis
 * @access Public
 */
router.post('/stop', controller.stopAnalysis.bind(controller));

/**
 * @route POST /api/v1/real-analysis/run
 * @desc Run single analysis cycle (one-time)
 * @access Public
 * @body { favoriteSymbols: string[] }
 */
router.post('/run', controller.runAnalysis.bind(controller));

/**
 * @route GET /api/v1/real-analysis/symbol/:symbol
 * @desc Get analysis for specific symbol
 * @access Public
 */
router.get('/symbol/:symbol', controller.analyzeSymbol.bind(controller));

/**
 * @route GET /api/v1/real-analysis/multi-timeframe/:symbol
 * @desc Get multi-timeframe analysis for symbol
 * @access Public
 */
router.get('/multi-timeframe/:symbol', controller.getMultiTimeframeAnalysis.bind(controller));

/**
 * @route GET /api/v1/real-analysis/last
 * @desc Get last analysis result
 * @access Public
 */
router.get('/last', controller.getLastAnalysis.bind(controller));

/**
 * @route GET /api/v1/real-analysis/status
 * @desc Get analysis status
 * @access Public
 */
router.get('/status', (req, res) => {
    console.log('🔍 [ROUTE DEBUG] Rota /status chamada!');
    controller.getAnalysisStatus(req, res);
});

/**
 * @route GET /api/v1/real-analysis/market-data
 * @desc Get real market candlestick data
 * @access Public
 * @query symbol, interval, limit
 */
router.get('/market-data', controller.getMarketData.bind(controller));

/**
 * @route GET /api/v1/real-analysis/test-logs
 * @desc Test logs endpoint
 * @access Public
 */
router.get('/test-logs', (req, res) => {
    console.log('📋 [TEST-LOGS] Router endpoint de test-logs chamado!');
    res.json({
        success: true,
        message: 'Test logs endpoint funcionando via router',
        timestamp: new Date().toISOString()
    });
});

/**
 * @route GET /api/v1/real-analysis/logs
 * @desc Get trading logs
 * @access Public
 * @query limit
 */
router.get('/logs', (req, res) => {
    console.log('📋 [LOGS] Router endpoint de logs chamado!');
    res.json({
        success: true,
        message: 'Logs endpoint funcionando via router',
        logs: [],
        total: 0,
        timestamp: new Date().toISOString()
    });
});

/**
 * @route GET /api/v1/real-analysis/signals
 * @desc Get all accumulated signals (alias for all-signals)
 * @access Public
 */
router.get('/signals', (req, res) => {
    console.log('🔍 [ROUTER DEBUG] Rota /signals chamada via router!');
    controller.getAllSignals(req, res);
});

/**
 * @route GET /api/v1/real-analysis/all-signals
 * @desc Get all accumulated signals
 * @access Public
 */
router.get('/all-signals', (req, res) => {
    console.log('🔍 [ROUTER DEBUG] Rota /all-signals chamada via router!');
    controller.getAllSignals(req, res);
});

/**
 * @route POST /api/v1/real-analysis/clear-history
 * @desc Clear signals and analysis history
 * @access Public
 */
router.post('/clear-history', controller.clearHistory.bind(controller));

/**
 * @route POST /api/v1/real-analysis/clear-signals
 * @desc Clear only signals (not analysis history)
 * @access Public
 */
router.post('/clear-signals', controller.clearSignals.bind(controller));

export default router;
