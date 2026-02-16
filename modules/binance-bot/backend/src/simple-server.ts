import cors from 'cors';
import express from 'express';
import { BinanceController } from './controllers/BinanceController';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'AURA Backend is running!', version: '1.0.0' });
});

// API routes
app.use('/api/v1/binance', (() => {
  const router = express.Router();
  const binanceController = new BinanceController();

  // Rotas de teste e validação
  router.get('/test-connection', binanceController.testConnection.bind(binanceController));
  router.get('/validate-credentials', binanceController.validateCredentials.bind(binanceController));

  // Rotas de dados da conta
  router.get('/account-info', binanceController.getAccountInfo.bind(binanceController));
  router.get('/portfolio', binanceController.getPortfolio.bind(binanceController));
  router.get('/balances', binanceController.getBalances.bind(binanceController));

  // Rotas de trading
  router.get('/positions', binanceController.getPositions.bind(binanceController));
  router.get('/trades', binanceController.getTrades.bind(binanceController));

  // Rotas de performance
  router.get('/performance', binanceController.getPerformance.bind(binanceController));

  return router;
})());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AURA Backend running on port ${PORT}`);
  console.log(`📊 Binance API routes available at /api/v1/binance/*`);
});
