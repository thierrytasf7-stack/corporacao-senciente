import { config } from 'dotenv';
import { validate, Validator } from 'jsonschema';
import { join } from 'path';

// Load environment variables from .env file
config({ path: join(__dirname, '../../.env') });

// Define environment variable schema
const envSchema = {
  type: 'object',
  properties: {
    NODE_ENV: { type: 'string', enum: ['development', 'production', 'test'] },
    PORT: { type: 'string', pattern: '^[0-9]+$'},
    
    // Betfair API Credentials
    BETFAIR_API_KEY: { type: 'string' },
    BETFAIR_SECRET: { type: 'string' },
    BETFAIR_APP_KEY: { type: 'string' },
    BETFAIR_USERNAME: { type: 'string' },
    BETFAIR_PASSWORD: { type: 'string' },
    BETFAIR_CERTIFICATE_PATH: { type: 'string' },
    BETFAIR_CERTIFICATE_PASSWORD: { type: 'string' },
    
    // Pinnacle API Credentials
    PINNACLE_API_KEY: { type: 'string' },
    PINNACLE_USERNAME: { type: 'string' },
    PINNACLE_PASSWORD: { type: 'string' },
    
    // Database Configuration
    DATABASE_URL: { type: 'string' },
    DATABASE_HOST: { type: 'string' },
    DATABASE_PORT: { type: 'string', pattern: '^[0-9]+$'},
    DATABASE_NAME: { type: 'string' },
    DATABASE_USER: { type: 'string' },
    DATABASE_PASSWORD: { type: 'string' },
    
    // Redis Configuration
    REDIS_URL: { type: 'string' },
    REDIS_HOST: { type: 'string' },
    REDIS_PORT: { type: 'string', pattern: '^[0-9]+$'},
    REDIS_PASSWORD: { type: 'string' },
    
    // Security Configuration
    JWT_SECRET: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'string' },
    BCRYPT_ROUNDS: { type: 'string', pattern: '^[0-9]+$' },
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: { type: 'string', pattern: '^[0-9]+$' },
    RATE_LIMIT_MAX_REQUESTS: { type: 'string', pattern: '^[0-9]+$' },
    
    // Cache Configuration
    CACHE_TTL_SECONDS: { type: 'string', pattern: '^[0-9]+$' },
    CACHE_MAX_SIZE: { type: 'string', pattern: '^[0-9]+$' },
    
    // External Services
    ODDS_API_KEY: { type: 'string' },
    SPORTS_DATA_API_KEY: { type: 'string' },
    
    // File Upload Configuration
    UPLOAD_MAX_SIZE_MB: { type: 'string', pattern: '^[0-9]+$' },
    UPLOAD_PATH: { type: 'string' },
    
    // Email Configuration
    SMTP_HOST: { type: 'string' },
    SMTP_PORT: { type: 'string', pattern: '^[0-9]+$' },
    SMTP_USER: { type: 'string' },
    SMTP_PASS: { type: 'string' },
    
    // Monitoring
    SENTRY_DSN: { type: 'string' },
    NEW_RELIC_LICENSE_KEY: { type: 'string' }
  },
  required: [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'BCRYPT_ROUNDS',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'CACHE_TTL_SECONDS',
    'CACHE_MAX_SIZE'
  ]
};

// Custom validation functions
const validators: Validator[] = [
  {
    name: 'BETFAIR_CREDENTIALS',
    validate: (env: NodeJS.ProcessEnv) => {
      if (env.NODE_ENV === 'production') {
        const requiredBetfair = ['BETFAIR_API_KEY', 'BETFAIR_SECRET', 'BETFAIR_APP_KEY'];
        for (const key of requiredBetfair) {
          if (!env[key] || env[key].trim() === '') {
            throw new Error(`Missing required Betfair credential: ${key}`);
          }
        }
      }
      return true;
    }
  },
  {
    name: 'PINNACLE_CREDENTIALS',
    validate: (env: NodeJS.ProcessEnv) => {
      if (env.NODE_ENV === 'production') {
        const requiredPinnacle = ['PINNACLE_API_KEY'];
        for (const key of requiredPinnacle) {
          if (!env[key] || env[key].trim() === '') {
            throw new Error(`Missing required Pinnacle credential: ${key}`);
          }
        }
      }
      return true;
    }
  },
  {
    name: 'DATABASE_CONNECTION',
    validate: (env: NodeJS.ProcessEnv) => {
      const url = env.DATABASE_URL || '';
      if (!url.startsWith('postgresql://') && !url.startsWith('mysql://')) {
        throw new Error('Invalid DATABASE_URL format. Must start with postgresql:// or mysql://');
      }
      return true;
    }
  },
  {
    name: 'JWT_SECRET_STRENGTH',
    validate: (env: NodeJS.ProcessEnv) => {
      if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long for security');
      }
      return true;
    }
  }
];

// Environment validation function
export function validateEnvironment(): void {
  console.log('🔍 Validating environment variables...');
  
  // Validate against JSON schema
  const validationResult = validate(process.env, envSchema);
  
  if (!validationResult.valid) {
    const errors = validationResult.errors.map(err => err.message).join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }
  
  // Run custom validators
  for (const validator of validators) {
    try {
      validator.validate(process.env);
      console.log(`✅ ${validator.name}: PASSED`);
    } catch (error) {
      console.error(`❌ ${validator.name}: FAILED`);
      throw error;
    }
  }
  
  console.log('✅ All environment variables validated successfully!');
}

// Export environment variables with defaults
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '21360', 10),
  
  // Betfair API
  betfairApiKey: process.env.BETFAIR_API_KEY || '',
  betfairSecret: process.env.BETFAIR_SECRET || '',
  betfairAppKey: process.env.BETFAIR_APP_KEY || '',
  betfairUsername: process.env.BETFAIR_USERNAME || '',
  betfairPassword: process.env.BETFAIR_PASSWORD || '',
  betfairCertificatePath: process.env.BETFAIR_CERTIFICATE_PATH || '',
  betfairCertificatePassword: process.env.BETFAIR_CERTIFICATE_PASSWORD || '',
  
  // Pinnacle API
  pinnacleApiKey: process.env.PINNACLE_API_KEY || '',
  pinnacleUsername: process.env.PINNACLE_USERNAME || '',
  pinnaclePassword: process.env.PINNACLE_PASSWORD || '',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/betting_platform',
  databaseHost: process.env.DATABASE_HOST || 'localhost',
  databasePort: parseInt(process.env.DATABASE_PORT || '5432', 10),
  databaseName: process.env.DATABASE_NAME || 'betting_platform',
  databaseUser: process.env.DATABASE_USER || 'postgres',
  databasePassword: process.env.DATABASE_PASSWORD || '',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Cache
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  
  // External Services
  oddsApiKey: process.env.ODDS_API_KEY || '',
  sportsDataApiKey: process.env.SPORTS_DATA_API_KEY || '',
  
  // File Upload
  uploadMaxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10),
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Email
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN || '',
  newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY || ''
} as const;