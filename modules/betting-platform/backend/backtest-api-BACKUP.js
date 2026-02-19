const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

// Data directory
const backtestsDir = path.join(__dirname, 'data', 'backtests');
if (!fs.existsSync(backtestsDir)) {
  fs.mkdirSync(backtestsDir, { recursive: true });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/backtest/run
 * Run a new backtest
 */
app.post('/api/backtest/run', async (req, res) => {
  try {
    const { strategyId, config } = req.body;

    // Validation
    if (!strategyId || !config) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'strategyId and config are required'
        }
      });
    }

    // Validate date range
    const start = new Date(config.dateRange.start);
    const end = new Date(config.dateRange.end);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'start date must be before end date'
        }
      });
    }

    if (end > now) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FUTURE_DATE',
          message: 'end date cannot be in the future'
        }
      });
    }

    // Validate bankroll
    if (config.initialBankroll <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BANKROLL',
          message: 'initialBankroll must be greater than 0'
        }
      });
    }

    // Validate staking strategy
    const validStrategies = ['fixed', 'percentage', 'kelly'];
    if (!validStrategies.includes(config.stakingStrategy)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STAKING_STRATEGY',
          message: `stakingStrategy must be one of: ${validStrategies.join(', ')}`
        }
      });
    }

    // Generate backtest ID
    const backtestId = `bt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Mock backtest result
    const result = {
      id: backtestId,
      strategyId,
      config,
      metrics: {
        winRate: 0.55,
        roi: 0.12,
        totalProfit: config.initialBankroll * 0.12,
        sharpeRatio: 1.5,
        maxDrawdown: 0.08,
        avgOdds: 2.5,
        betCount: 100
      },
      bets: [],
      equityCurve: [],
      createdAt: new Date().toISOString()
    };

    // Save result
    fs.writeFileSync(
      path.join(backtestsDir, `${backtestId}.json`),
      JSON.stringify(result, null, 2)
    );

    return res.status(200).json({
      success: true,
      data: {
        backtestId: result.id,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Error running backtest:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/backtest/:id
 * Get backtest result by ID
 */
app.get('/api/backtest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(backtestsDir, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BACKTEST_NOT_FOUND',
          message: `Backtest with id ${id} not found`
        }
      });
    }

    const result = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting backtest result:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/backtest
 * List all backtests
 */
app.get('/api/backtest', async (req, res) => {
  try {
    const { strategyId, limit = '10' } = req.query;

    const files = fs.readdirSync(backtestsDir)
      .filter(f => f.endsWith('.json'))
      .slice(0, parseInt(limit));

    const backtests = files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(backtestsDir, file), 'utf-8'));
      return {
        id: data.id,
        strategyId: data.strategyId,
        createdAt: data.createdAt,
        metrics: data.metrics
      };
    });

    return res.status(200).json({
      success: true,
      data: strategyId
        ? backtests.filter(b => b.strategyId === strategyId)
        : backtests
    });
  } catch (error) {
    console.error('Error listing backtests:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/backtest/compare
 * Compare multiple backtest results
 */
app.post('/api/backtest/compare', async (req, res) => {
  try {
    const { backtestIds } = req.body;

    if (!backtestIds || !Array.isArray(backtestIds)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'backtestIds array is required'
        }
      });
    }

    if (backtestIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BACKTESTS',
          message: 'At least 2 backtest IDs required for comparison'
        }
      });
    }

    const comparison = {};

    for (const id of backtestIds) {
      const filePath = path.join(backtestsDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        comparison[id] = data.metrics;
      }
    }

    return res.status(200).json({
      success: true,
      data: { comparison }
    });
  } catch (error) {
    console.error('Error comparing backtests:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * DELETE /api/backtest/:id
 * Delete a backtest result
 */
app.delete('/api/backtest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(backtestsDir, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BACKTEST_NOT_FOUND',
          message: `Backtest with id ${id} not found`
        }
      });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting backtest:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

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
    console.log('');
    console.log('🚀 Betting Platform Backtest API');
    console.log(`📊 Running on port ${PORT}`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  GET    http://localhost:${PORT}/health`);
    console.log(`  POST   http://localhost:${PORT}/api/backtest/run`);
    console.log(`  GET    http://localhost:${PORT}/api/backtest/:id`);
    console.log(`  GET    http://localhost:${PORT}/api/backtest?limit=10`);
    console.log(`  POST   http://localhost:${PORT}/api/backtest/compare`);
    console.log(`  DELETE http://localhost:${PORT}/api/backtest/:id`);
    console.log('');
  });
}

module.exports = app;
