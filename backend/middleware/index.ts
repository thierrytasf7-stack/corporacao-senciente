import { Request, Response, NextFunction } from 'express';
import { errorHandler, requestLogger } from './middleware/middleware';

export const setupMiddleware = (app: Express): void => {
  app.use(requestLogger);
  app.use(errorHandler);
};

export const setupTRPCMiddleware = (app: Express): void => {
  app.use(requestLogger);
};

export const setupErrorHandler = (app: Express): void => {
  app.use(errorHandler);
};