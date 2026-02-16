import { Router } from 'express';
import { SpotRotativeAnalysisController } from '../controllers/SpotRotativeAnalysisController';

const router = Router();
const spotRotativeAnalysisController = new SpotRotativeAnalysisController();

// Rotas da análise rotativa spot
router.post('/start', (req, res) => spotRotativeAnalysisController.startRotativeAnalysis(req, res));
router.post('/stop', (req, res) => spotRotativeAnalysisController.stopRotativeAnalysis(req, res));
router.get('/status', (req, res) => spotRotativeAnalysisController.getRotativeAnalysisStatus(req, res));
router.post('/simple-analysis', (req, res) => spotRotativeAnalysisController.performSimpleAnalysis(req, res));
router.put('/config', (req, res) => spotRotativeAnalysisController.updateConfig(req, res));
router.get('/emitted-signals', (req, res) => spotRotativeAnalysisController.getEmittedSignals(req, res));
router.get('/cycles', (req, res) => spotRotativeAnalysisController.getCycles(req, res));
router.post('/clear-executions', (req, res) => spotRotativeAnalysisController.clearExecutions(req, res));
router.post('/clear-cycles', (req, res) => spotRotativeAnalysisController.clearCycles(req, res));

export default router;
