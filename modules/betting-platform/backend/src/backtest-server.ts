import express from 'express';
import * as cors from 'cors';
import backtestRoutes from './routes/backtest-simple.routes';

const app = express();
const PORT = process.env.PORT || 21370;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/backtest', backtestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Betting Platform Backtest API running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🔬 API: http://localhost:${PORT}/api/backtest`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  POST   /api/backtest/run       - Run backtest');
    console.log('  GET    /api/backtest/:id       - Get backtest result');
    console.log('  GET    /api/backtest           - List backtests');
    console.log('  POST   /api/backtest/compare   - Compare backtests');
    console.log('  DELETE /api/backtest/:id       - Delete backtest');
  });
}

export default app;
