import { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError, RateLimitError } from './ErrorHandler';

describe('ErrorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code 500', () => {
      const error = new AppError('Test error');
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should create an AppError with details', () => {
      const error = new AppError('Test error', 400, { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should have toJSON method', () => {
      const error = new AppError('Test error', 400, { field: 'email' });
      const json = error.toJSON();
      expect(json).toEqual({
        name: 'AppError',
        message: 'Test error',
        statusCode: 400,
        timestamp: expect.any(String),
        details: { field: 'email' }
      });
    });
  });

  describe('ValidationError', () => {
    it('should extend AppError with status code 400', () => {
      const error = new ValidationError('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
    });

    it('should accept details', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('NotFoundError', () => {
    it('should extend AppError with status code 404', () => {
      const error = new NotFoundError('Not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('should extend AppError with status code 401', () => {
      const error = new UnauthorizedError('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ConflictError', () => {
    it('should extend AppError with status code 409', () => {
      const error = new ConflictError('Conflict');
      expect(error.name).toBe('ConflictError');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('InternalServerError', () => {
    it('should extend AppError with status code 500', () => {
      const error = new InternalServerError('Internal error');
      expect(error.name).toBe('InternalServerError');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('RateLimitError', () => {
    it('should extend AppError with status code 429', () => {
      const error = new RateLimitError('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('Inheritance', () => {
    it('should have proper inheritance chain', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have proper inheritance chain for NotFoundError', () => {
      const error = new NotFoundError('Test');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('Error Stack', () => {
    it('should capture stack trace', () => {
      const error = new AppError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });
});