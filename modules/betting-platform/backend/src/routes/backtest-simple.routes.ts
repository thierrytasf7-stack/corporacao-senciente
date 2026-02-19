import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Mock storage (em produção usaria DB)
const backtestsDir = path.join(__dirname, '../../data/backtests');
if (!fs.existsSync(backtestsDir)) {
  fs.mkdirSync(backtestsDir, { recursive: true });
}

/**
 * POST /api/backtest/run
 * Run a new backtest
 */
router.post('/run', async (req: Request, res: Response) => {
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

    // Mock backtest result (em produção chamaria BacktestingService)
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * GET /api/backtest/:id
 * Get backtest result by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * GET /api/backtest/list
 * List all backtests (with optional filters)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { strategyId, limit = '10' } = req.query;

    const files = fs.readdirSync(backtestsDir)
      .filter(f => f.endsWith('.json'))
      .slice(0, parseInt(limit as string));

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
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * POST /api/backtest/compare
 * Compare multiple backtest results
 */
router.post('/compare', async (req: Request, res: Response) => {
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

    const comparison: Record<string, any> = {};

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
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * DELETE /api/backtest/:id
 * Delete a backtest result
 */
router.delete('/:id', async (req: Request, res: Response) => {
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;
