import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError, RateLimitError } from '../services/ErrorHandler';
import { logger } from '../services/Logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error('AppError occurred', {
      error: err.toJSON(),
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    res.status(err.statusCode).json({
      error: err.toJSON()
    });
  } else {
    const internalError = new InternalServerError(
      'Internal Server Error',
      { originalError: err.message }
    );

    logger.error('Unhandled error occurred', {
      error: internalError.toJSON(),
      url: req.url,
      method: req.method,
      ip: req.ip,
      stack: err.stack
    });

    res.status(500).json({
      error: internalError.toJSON()
    });
  }
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info('Request completed', {
      method,
      url,
      ip,
      statusCode,
      duration
    });
  });

  next();
};

export const tRpcErrorHandler = (
  input: unknown,
  error: Error
): unknown => {
  if (error instanceof AppError) {
    logger.error('tRPC AppError occurred', {
      error: error.toJSON(),
      input
    });

    return {
      type: 'TRPCError',
      code: mapStatusCodeToTRPCCode(error.statusCode),
      message: error.message,
      data: error.toJSON()
    };
  }

  const internalError = new InternalServerError(
    'Internal Server Error',
    { originalError: error.message }
  );

  logger.error('tRPC unhandled error occurred', {
    error: internalError.toJSON(),
    input,
    stack: error.stack
  });

  return {
    type: 'TRPCError',
    code: 'INTERNAL_SERVER_ERROR',
    message: internalError.message,
    data: internalError.toJSON()
  };
};

const mapStatusCodeToTRPCCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
};