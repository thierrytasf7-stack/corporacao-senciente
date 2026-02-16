import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: 'admin' | 'user'
  }
}

/**
 * Simple authentication middleware
 * In production, replace with proper JWT/session validation
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // For development, mock authentication
  // TODO: Implement proper JWT/session validation in production
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized - Missing or invalid authentication token'
    })
    return
  }

  // Mock user validation - in production, validate JWT token
  const token = authHeader.substring(7)

  // For now, accept any non-empty token as valid
  if (!token || token.length === 0) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid token'
    })
    return
  }

  // Mock user object - in production, extract from validated JWT
  req.user = {
    id: 'mock-user-id',
    role: 'admin' // For dev, all authenticated users are admins
  }

  next()
}

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden - Admin role required'
    })
    return
  }

  next()
}
