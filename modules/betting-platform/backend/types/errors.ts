export enum BET_ERRORS {
  INVALID_ODDS = 'BET_INVALID_ODDS',
  INSUFFICIENT_BALANCE = 'BET_INSUFFICIENT_BALANCE',
  BET_ALREADY_PLACED = 'BET_ALREADY_PLACED',
  BET_NOT_FOUND = 'BET_NOT_FOUND',
  INVALID_BET_AMOUNT = 'BET_INVALID_AMOUNT',
  BETTING_CLOSED = 'BETTING_CLOSED'
}

export enum AUTH_ERRORS {
  INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  EXPIRED_SESSION = 'AUTH_EXPIRED_SESSION',
  UNAUTHORIZED_ACCESS = 'AUTH_UNAUTHORIZED_ACCESS',
  USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED'
}

export enum VALIDATION_ERRORS {
  MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  FIELD_TOO_SHORT = 'VALIDATION_FIELD_TOO_SHORT',
  FIELD_TOO_LONG = 'VALIDATION_FIELD_TOO_LONG',
  INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  INVALID_PHONE = 'VALIDATION_INVALID_PHONE'
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromCode(code: string, details?: unknown): AppError {
    const messageMap: Record<string, string> = {
      [BET_ERRORS.INVALID_ODDS]: 'Invalid odds provided',
      [BET_ERRORS.INSUFFICIENT_BALANCE]: 'Insufficient balance to place bet',
      [BET_ERRORS.BET_ALREADY_PLACED]: 'Bet already placed for this event',
      [BET_ERRORS.BET_NOT_FOUND]: 'Bet not found',
      [BET_ERRORS.INVALID_BET_AMOUNT]: 'Invalid bet amount',
      [BET_ERRORS.BETTING_CLOSED]: 'Betting is closed for this event',
      
      [AUTH_ERRORS.INVALID_TOKEN]: 'Invalid authentication token',
      [AUTH_ERRORS.EXPIRED_SESSION]: 'Session has expired',
      [AUTH_ERRORS.UNAUTHORIZED_ACCESS]: 'Unauthorized access',
      [AUTH_ERRORS.USER_NOT_FOUND]: 'User not found',
      [AUTH_ERRORS.INVALID_CREDENTIALS]: 'Invalid credentials',
      [AUTH_ERRORS.ACCOUNT_LOCKED]: 'Account is locked',
      
      [VALIDATION_ERRORS.MISSING_FIELD]: 'Required field is missing',
      [VALIDATION_ERRORS.INVALID_FORMAT]: 'Invalid format',
      [VALIDATION_ERRORS.FIELD_TOO_SHORT]: 'Field is too short',
      [VALIDATION_ERRORS.FIELD_TOO_LONG]: 'Field is too long',
      [VALIDATION_ERRORS.INVALID_EMAIL]: 'Invalid email format',
      [VALIDATION_ERRORS.INVALID_PHONE]: 'Invalid phone number format'
    };

    const message = messageMap[code] || 'An error occurred';
    return new AppError(code, message, details);
  }
}