import { Logger } from 'pino';

export const logger: Logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  timestamp: () => `{"timestamp":${Date.now()}}`,
  base: {
    service: 'betting-platform',
    version: process.env.npm_package_version || '1.0.0'
  }
});