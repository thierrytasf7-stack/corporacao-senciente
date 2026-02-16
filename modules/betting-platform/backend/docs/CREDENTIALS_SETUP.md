# Betfair + Pinnacle API Credentials Setup Guide

## 🚨 SECURITY WARNING
**NEVER commit real credentials to version control.**
Use environment variables and keep `.env` files out of Git.

## 📋 Prerequisites

### Betfair API
1. **Betfair Account** - Must be funded and verified
2. **Developer App Key** - Create at Betfair Developer Portal
3. **Certificate Setup** - Required for API authentication

### Pinnacle API
1. **Pinnacle Account** - Must be approved for API access
2. **API Key** - Request from Pinnacle support
3. **Username/Password** - For API authentication

## 🔧 Step-by-Step Setup

### 1. Betfair API Setup

#### 1.1 Create Developer App Key
1. Go to [Betfair Developer Portal](https://developer.betfair.com/)
2. Login with your Betfair account
3. Navigate to "My Account" → "My Apps"
4. Click "Create New App"
5. Fill in app details and submit
6. Copy your **App Key** (starts with "appKey")

#### 1.2 Generate SSL Certificate
1. Download [Betfair Certificate Generator](https://identitysso.betfair.com/api/cert)
2. Run the generator and follow instructions
3. Save the generated `.pem` files
4. Keep certificate and key files secure

#### 1.3 Configure Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit .env file
BETFAIR_APP_KEY=your_generated_app_key_here
BETFAIR_USERNAME=your_betfair_username_here
BETFAIR_PASSWORD=your_betfair_password_here
BETFAIR_CERTIFICATE_PATH=path/to/your/certificate.pem
BETFAIR_KEY_PATH=path/to/your/private_key.pem
```

### 2. Pinnacle API Setup

#### 2.1 Request API Access
1. Login to your Pinnacle account
2. Contact Pinnacle support to request API access
3. Provide business details and intended use
4. Wait for approval (usually 24-48 hours)
5. Receive your API key via email

#### 2.2 Configure Environment Variables
```bash
PINNACLE_API_KEY=your_pinnacle_api_key_here
PINNACLE_USERNAME=your_pinnacle_username_here
PINNACLE_PASSWORD=your_pinnacle_password_here
```

## 🔐 Security Best Practices

### 1. Environment Variables
- Use `.env` files for local development
- Never commit `.env` files to Git
- Add `.env` to `.gitignore`

### 2. Certificate Management
- Store certificates outside project directory
- Use secure file permissions (600)
- Rotate certificates regularly

### 3. API Key Security
- Use different keys for different environments
- Rotate API keys periodically
- Monitor API usage for anomalies

### 4. Database Security
- Use strong passwords
- Enable SSL connections
- Limit database user permissions

## 🔍 Validation Checklist

### Before Starting
- [ ] Betfair account is funded and verified
- [ ] Pinnacle account has API access approved
- [ ] SSL certificates generated for Betfair
- [ ] Environment variables configured

### After Setup
- [ ] Application starts without credential errors
- [ ] API endpoints respond correctly
- [ ] Rate limits are respected
- [ ] Error handling works for invalid credentials

## 🐛 Troubleshooting

### Common Issues

#### Betfair Certificate Errors
```bash
# Check certificate paths
ls -la /path/to/certificates/

# Verify certificate permissions
chmod 600 /path/to/certificate.pem

# Test certificate manually
openssl verify certificate.pem
```

#### API Key Invalid
```bash
# Check app key format
# Should start with "appKey" followed by 32 chars

# Verify Betfair account status
# Must be funded and not suspended

# Check rate limits
# Betfair has strict rate limits (60 requests/minute)
```

#### Pinnacle Authentication Failed
```bash
# Verify API key is active
# Contact Pinnacle support if key is invalid

# Check username/password format
# Must match Pinnacle account credentials

# Ensure account is approved for API access
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=betting-platform:*

# Check API responses
curl -X GET "https://api.betfair.com/exchange/betting/rest/v1.0/listEvents/" \
  -H "X-Authentication: $BETFAIR_APP_KEY"
```

## 📊 Monitoring

### API Usage
- Monitor request rates
- Track response times
- Log authentication failures
- Set up alerts for unusual patterns

### Security Events
- Failed login attempts
- Certificate expiration warnings
- API key rotation events
- Unauthorized access attempts

## 🔄 Maintenance

### Regular Tasks
- Rotate API keys quarterly
- Update certificates annually
- Review access logs monthly
- Test backup credentials

### Emergency Procedures
- Revoke compromised API keys immediately
- Update certificates if leaked
- Rotate database passwords if breached
- Notify stakeholders of credential changes