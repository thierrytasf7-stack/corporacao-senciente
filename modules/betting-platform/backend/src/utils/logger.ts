import { createLogger, transports, format } from 'winston';
import { env } from './env-validator';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

const logger = createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    env.nodeEnv === 'production' ? format.json() : format.simple(),
    logFormat
  ),
  defaultMeta: { service: 'betting-platform' },
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (env.nodeEnv !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      format.simple()
    ),
  }));
}

export { logger };