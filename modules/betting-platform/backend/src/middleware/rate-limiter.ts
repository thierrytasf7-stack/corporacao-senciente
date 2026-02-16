import rateLimit from 'express-rate-limit';
import { env } from '../config/env-validator';

export const rateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  },
  onLimitReached: (req, res, options) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  skipSuccessfulRequests: true,
});