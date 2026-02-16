export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      details: this.details
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 404, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 401, details);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 409, details);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 500, details);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 429, details);
  }
}