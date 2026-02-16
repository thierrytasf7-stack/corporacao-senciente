# Betting Platform Credentials Setup Guide

## 🚀 Overview

This guide explains how to set up and configure credentials for the betting platform, including Betfair and Pinnacle API access, database connections, and other external services.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 25+ installed
- Access to AWS Secrets Manager (for production) or local development environment
- Accounts with Betfair and Pinnacle (for API access)
- Database access (PostgreSQL recommended)

## 🔑 Step 1: Obtain API Credentials

### Betfair API Setup

#### 1.1 Create Betfair Developer Account
1. Go to [Betfair Developer Program](https://developer.betfair.com/)
2. Click "Join Now" and create an account
3. Verify your email address
4. Log in to the Betfair Developer Program dashboard

#### 1.2 Create Application
1. Navigate to "My Applications" in the dashboard
2. Click "Create New Application"
3. Fill in application details:
   - Application Name: `Betting Platform API`
   - Description: `API integration for automated betting platform`
   - Application Type: `Non-Interactive`
4. Click "Create"

#### 1.3 Generate API Credentials
1. In your application details, find the "Application Key" section
2. Click "Generate Key"
3. Copy the generated **Application Key**
4. Note down the **Application Key** - this is your `BETFAIR_APP_KEY`

#### 1.4 Obtain SSL Certificate
1. In the Betfair Developer Program, go to "Certificates"
2. Click "Generate Certificate"
3. Download the SSL certificate file (`.pem` format)
4. Set a strong password for the certificate
5. Store the certificate file securely

#### 1.5 Test API Access
```bash
curl -X POST \
  https://identitysso-cert.betfair.com/api/certlogin \
  -H "X-Application: YOUR_APP_KEY" \
  -d "username=YOUR_USERNAME&password=YOUR_PASSWORD" \
  --cert YOUR_CERTIFICATE.pem \
  --cert-type PEM \
  --key YOUR_CERTIFICATE.pem
```

### Pinnacle API Setup

#### 1.1 Create Pinnacle Account
1. Go to [Pinnacle](https://www.pinnacle.com/)
2. Create a new account or log in to existing account
3. Verify your account (required for API access)

#### 1.2 Request API Access
1. Contact Pinnacle support to request API access
2. Provide business details and intended use case
3. Wait for approval (typically 24-48 hours)
4. Once approved, you'll receive an API key

#### 1.3 Test API Access
```bash
curl -X GET \
  "https://api.pinnacle.com/v2/fixtures?sportid=29" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 📁 Step 2: Configure Environment Variables

### 2.1 Copy Environment Template
```bash
cp modules/betting-platform/backend/.env.example modules/betting-platform/backend/.env
```

### 2.2 Fill in Credentials

#### Betfair Configuration
```bash
# Betfair API Credentials
BETFAIR_API_KEY=your_betfair_api_key_here
BETFAIR_SECRET=your_betfair_secret_here
BETFAIR_APP_KEY=your_betfair_app_key_here
BETFAIR_USERNAME=your_betfair_username_here
BETFAIR_PASSWORD=your_betfair_password_here
BETFAIR_CERTIFICATE_PATH=path_to_your_betfair_certificate.pem
BETFAIR_CERTIFICATE_PASSWORD=your_certificate_password_here
```

#### Pinnacle Configuration
```bash
# Pinnacle API Credentials
PINNACLE_API_KEY=your_pinnacle_api_key_here
PINNACLE_USERNAME=your_pinnacle_username_here
PINNACLE_PASSWORD=your_pinnacle_password_here
```

#### Database Configuration
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/betting_platform
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=betting_platform
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
```

#### Redis Configuration
```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

#### Security Configuration
```bash
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

## 🔐 Step 3: Set Up Secrets Management

### 3.1 Local Development (.env)
For local development, use the `.env` file created in Step 2.

### 3.2 Production (AWS Secrets Manager)

#### 3.2.1 Create Secrets
1. Log in to AWS Management Console
2. Navigate to Secrets Manager
3. Click "Store a new secret"
4. Select "Other type of secrets"
5. Add key-value pairs for all required environment variables
6. Name your secret (e.g., `betting-platform/production`)
7. Set rotation configuration (optional)
8. Click "Store"

#### 3.2.2 Configure Application
In production, configure your application to fetch secrets from AWS:

```typescript
// config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(name: string): Promise<any> {
  const command = new GetSecretValueCommand({ SecretId: name });
  const response = await client.send(command);
  return JSON.parse(response.SecretString || '');
}
```

## 🧪 Step 4: Validate Configuration

### 4.1 Run Environment Validation
```bash
# Install dependencies
npm install

# Run validation
npm run validate:env
```

### 4.2 Test API Connections

#### Test Betfair Connection
```bash
# Create test script
node -e "
const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'identitysso-cert.betfair.com',
  path: '/api/certlogin',
  method: 'POST',
  headers: {
    'X-Application': process.env.BETFAIR_APP_KEY,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  cert: fs.readFileSync(process.env.BETFAIR_CERTIFICATE_PATH),
  key: fs.readFileSync(process.env.BETFAIR_CERTIFICATE_PATH)
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (data) => {
    console.log(data.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(`username=${process.env.BETFAIR_USERNAME}&password=${process.env.BETFAIR_PASSWORD}`);
req.end();
"
```

#### Test Pinnacle Connection
```bash
curl -X GET \
  "https://api.pinnacle.com/v2/fixtures?sportid=29" \
  -H "Authorization: Bearer $PINNACLE_API_KEY"
```

## 🚀 Step 5: Start Application

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Run Database Migrations
```bash
npm run db:migrate
```

### 5.3 Start Development Server
```bash
npm run dev
```

### 5.4 Verify Application
1. Open browser to `http://localhost:21360`
2. Check API endpoints are responding
3. Verify authentication is working
4. Test betting functionality

## 🔍 Troubleshooting

### Common Issues

#### 1. Betfair API Connection Failed
- **Cause:** Invalid certificate or credentials
- **Solution:** Verify certificate path and password, check API key

#### 2. Pinnacle API Access Denied
- **Cause:** API key not authorized or account not verified
- **Solution:** Contact Pinnacle support, verify account status

#### 3. Database Connection Error
- **Cause:** Incorrect database URL or credentials
- **Solution:** Verify database is running, check connection string

#### 4. Environment Validation Failed
- **Cause:** Missing required environment variables
- **Solution:** Check `.env` file, ensure all required variables are set

### Debug Mode
Enable debug mode to see detailed logs:
```bash
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Betfair Developer Documentation](https://developer.betfair.com/)
- [Pinnacle API Documentation](https://www.pinnacle.com/en/api)
- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)

## 🔄 Maintenance

### Regular Tasks
- Rotate API keys periodically
- Update database credentials when changed
- Monitor API usage and rate limits
- Keep dependencies updated

### Security Best Practices
- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Enable 2FA where available
- Regularly audit access logs
- Use HTTPS for all API communications

## 📝 Changelog

### v1.0.0 (2026-02-15)
- Initial implementation
- Complete Betfair and Pinnacle setup
- Environment validation system
- AWS Secrets Manager integration
- Comprehensive troubleshooting guide