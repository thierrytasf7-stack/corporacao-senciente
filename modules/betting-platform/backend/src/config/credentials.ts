import { config } from 'dotenv';
import { validate as uuidValidate } from 'uuid';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

// Environment variable validation
interface CredentialsValidation {
  isValid: boolean;
  errors: string[];
}

export class CredentialsValidator {
  private static requiredEnvVars: string[] = [
    'BETFAIR_APP_KEY',
    'BETFAIR_USERNAME',
    'BETFAIR_PASSWORD',
    'BETFAIR_CERTIFICATE_PATH',
    'BETFAIR_KEY_PATH',
    'PINNACLE_API_KEY',
    'PINNACLE_USERNAME',
    'PINNACLE_PASSWORD',
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  static validate(): CredentialsValidation {
    const errors: string[] = [];

    // Check for missing environment variables
    this.requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    });

    // Validate Betfair App Key format
    if (process.env.BETFAIR_APP_KEY) {
      const appKey = process.env.BETFAIR_APP_KEY;
      if (!appKey.startsWith('appKey') || appKey.length !== 36) {
        errors.push('Invalid Betfair App Key format. Should start with "appKey" and be 36 characters long.');
      }
    }

    // Validate certificate files exist
    if (process.env.BETFAIR_CERTIFICATE_PATH) {
      const certPath = path.resolve(process.env.BETFAIR_CERTIFICATE_PATH);
      if (!fs.existsSync(certPath)) {
        errors.push(`Betfair certificate file not found: ${certPath}`);
      }
    }

    if (process.env.BETFAIR_KEY_PATH) {
      const keyPath = path.resolve(process.env.BETFAIR_KEY_PATH);
      if (!fs.existsSync(keyPath)) {
        errors.push(`Betfair private key file not found: ${keyPath}`);
      }
    }

    // Validate UUID format for JWT secret
    if (process.env.JWT_SECRET) {
      if (!uuidValidate(process.env.JWT_SECRET)) {
        errors.push('JWT_SECRET should be a valid UUID format.');
      }
    }

    // Validate database URL format
    if (process.env.DATABASE_URL) {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('mysql://')) {
        errors.push('DATABASE_URL should start with "postgresql://" or "mysql://".');
      }
    }

    // Validate port numbers
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('PORT must be a number between 1 and 65535.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static logValidationResults(validation: CredentialsValidation): void {
    if (validation.isValid) {
      console.log('✅ All credentials validated successfully');
    } else {
      console.error('❌ Credential validation failed:');
      validation.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
      console.error('\n⚠️  Please fix the above errors before starting the application.');
      process.exit(1);
    }
  }
}

// Auto-validate on module load
const validation = CredentialsValidator.validate();
CredentialsValidator.logValidationResults(validation);

// Export validated credentials
export const credentials = {
  betfair: {
    appKey: process.env.BETFAIR_APP_KEY,
    username: process.env.BETFAIR_USERNAME,
    password: process.env.BETFAIR_PASSWORD,
    certificatePath: process.env.BETFAIR_CERTIFICATE_PATH,
    keyPath: process.env.BETFAIR_KEY_PATH,
    apiUrl: process.env.BETFAIR_API_URL || 'https://api.betfair.com/exchange',
    authUrl: process.env.BETFAIR_AUTH_URL || 'https://identitysso-cert.betfair.com/api/certlogin',
    rateLimit: parseInt(process.env.BETFAIR_RATE_LIMIT || '60', 10),
    timeoutMs: parseInt(process.env.BETFAIR_TIMEOUT_MS || '30000', 10)
  },
  pinnacle: {
    apiKey: process.env.PINNACLE_API_KEY,
    username: process.env.PINNACLE_USERNAME,
    password: process.env.PINNACLE_PASSWORD,
    apiUrl: process.env.PINNACLE_API_URL || 'https://api.pinnacle.com',
    rateLimit: parseInt(process.env.PINNACLE_RATE_LIMIT || '60', 10),
    timeoutMs: parseInt(process.env.PINNACLE_TIMEOUT_MS || '30000', 10)
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '21300', 10),
    logLevel: process.env.LOG_LEVEL || 'info'
  }
} as const;

// Export for use in other modules
export default credentials;