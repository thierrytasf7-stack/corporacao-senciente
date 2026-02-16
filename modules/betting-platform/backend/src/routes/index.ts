import { Application } from 'express';
import { setupAuthRoutes } from './auth-routes';\nimport { setupBettingRoutes } from './betting-routes';
import { setupHealthRoutes } from './health-routes';

export function setupRoutes(app: Application): void {
  // Health check routes
  setupHealthRoutes(app);

  // Authentication routes
  setupAuthRoutes(app);

  // Betting routes
  setupBettingRoutes(app);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'Route not found',
      },
    });
  });
}

// Error handling middleware
export function setupErrorHandling(app: Application): void {
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal Server Error',
      },
    });
  });
}