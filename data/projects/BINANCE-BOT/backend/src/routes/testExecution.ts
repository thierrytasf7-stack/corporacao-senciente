import { Router } from 'express';
import { TestExecutionController } from '../controllers/TestExecutionController';

const router = Router();
const controller = new TestExecutionController();

// POST /test/execution - Teste de execução forçada
router.post('/execution', (req, res) => controller.testExecution(req, res));

// GET /test/history - Teste de consulta ao histórico
router.get('/history', (req, res) => controller.testHistory(req, res));

export { router as testExecutionRouter };
