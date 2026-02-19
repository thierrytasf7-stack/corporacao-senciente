import { Router, Request, Response } from 'express';
import { BacktestingService } from '../../services/BacktestingService';
import { HistoricalDataLoader } from '../../services/HistoricalDataLoader';
import { StrategyService } from '../../services/StrategyService';
import { AnalyticsService } from '../../services/AnalyticsService';
import { BacktestConfig } from '../../types/backtesting-types';

const router = Router();

// Initialize services
const historicalDataLoader = new HistoricalDataLoader(
  process.env.BETFAIR_API_KEY || '',
  process.env.BETFAIR_USERNAME || '',
  process.env.BETFAIR_PASSWORD || '',
  process.env.DATABASE_URL || ''
);

const strategyService = new StrategyService();
const analyticsService = new AnalyticsService();
const backtestingService = new BacktestingService(
  historicalDataLoader,
  strategyService,
  analyticsService
);

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

    // Get strategy from service
    const strategy = await strategyService.getStrategy(strategyId);
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STRATEGY_NOT_FOUND',
          message: `Strategy with id ${strategyId} not found`
        }
      });
    }

    // Run backtest
    const result = await backtestingService.runBacktest(strategy, config as BacktestConfig);

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

    const result = backtestingService.getResults(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BACKTEST_NOT_FOUND',
          message: `Backtest with id ${id} not found`
        }
      });
    }

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
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { strategyId, limit = '10' } = req.query;

    // For now, return empty array (would need to implement storage layer)
    // In production, would query from database or file storage
    return res.status(200).json({
      success: true,
      data: []
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

    const comparison = backtestingService.compareStrategies(backtestIds);

    // Convert Map to object for JSON response
    const comparisonObj: Record<string, any> = {};
    comparison.forEach((metrics, id) => {
      comparisonObj[id] = metrics;
    });

    return res.status(200).json({
      success: true,
      data: {
        comparison: comparisonObj
      }
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

    // Check if exists
    const result = backtestingService.getResults(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BACKTEST_NOT_FOUND',
          message: `Backtest with id ${id} not found`
        }
      });
    }

    // Delete file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/backtests', `${id}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

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
