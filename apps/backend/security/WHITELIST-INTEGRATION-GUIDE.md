# Whitelist Integration Guide

## Overview

Este documento explica como integrar o sistema de whitelist em rotas de scraping ou qualquer endpoint que acesse fontes externas.

## Quick Start

### 1. Import Middleware

```typescript
import { whitelistFilterMiddleware, ScrapeRequest } from '../middleware/whitelist-filter'
```

### 2. Apply to Routes

```typescript
router.get('/scrape', whitelistFilterMiddleware, (req: ScrapeRequest, res: Response) => {
  // Se chegou aqui, sourceUrl está na whitelist
  const { sourceUrl } = req.query
  // ... sua lógica de scraping
})
```

### 3. Send Requests

**Query Parameter:**
```bash
GET /api/scrape?sourceUrl=https://bbc.com/article
```

**Request Body:**
```bash
POST /api/scrape
{
  "sourceUrl": "https://bbc.com/article"
}
```

## Middleware Behavior

### Allowed Sources
- Response: `200 OK` + request proceeds to handler
- Headers: `X-Source-Name`, `X-Source-Category`, `X-Source-Reputation`
- Audit Log: `source_access_allowed` event

### Blocked Sources
- Response: `403 Forbidden`
- Body: `{ error: 'Source domain is not whitelisted', code: 'UNAUTHORIZED_SOURCE', domain: '...' }`
- Audit Log: `source_access_blocked` event
- Console Warning: `[WHITELIST] Blocked access to domain: ...`

### Invalid URL
- Response: `400 Bad Request`
- Body: `{ error: 'Invalid URL format', code: 'INVALID_URL' }`

## Security Best Practices

### 1. Always Use Whitelist for External URLs

```typescript
// ✅ GOOD
router.get('/fetch-news', whitelistFilterMiddleware, async (req, res) => {
  const url = req.query.sourceUrl
  const data = await fetchData(url)
  res.json(data)
})

// ❌ BAD - No filtering
router.get('/fetch-news', async (req, res) => {
  const url = req.query.sourceUrl // User can access ANY domain!
  const data = await fetchData(url)
  res.json(data)
})
```

### 2. Combine with Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

router.get('/scrape', limiter, whitelistFilterMiddleware, handler)
```

### 3. Validate Response Data

```typescript
router.get('/scrape', whitelistFilterMiddleware, async (req, res) => {
  const { sourceUrl } = req.query
  const data = await fetchData(sourceUrl)

  // Validate/sanitize scraped data before storing/using
  const sanitized = sanitizeHtml(data)

  res.json(sanitized)
})
```

## API Management

### Add Source to Whitelist

```bash
POST /api/whitelist
Authorization: Bearer <admin-token>
{
  "name": "BBC News",
  "domain": "bbc.com",
  "category": "news",
  "description": "British news outlet",
  "tags": ["news", "uk", "trusted"]
}
```

### Check Domain Status

```bash
GET /api/whitelist/check?domain=bbc.com
```

Response:
```json
{
  "success": true,
  "domain": "bbc.com",
  "allowed": true,
  "status": "whitelisted"
}
```

### Block Domain

```bash
POST /api/whitelist/block
Authorization: Bearer <admin-token>
{
  "domain": "malicious-site.com",
  "reason": "Phishing attempt detected"
}
```

## Audit & Monitoring

### View Audit Log

```bash
GET /api/whitelist/audit?limit=100
```

### Monitor Blocked Attempts

```typescript
// The middleware automatically logs to console
// [WHITELIST] Blocked access to domain: evil.com at 2026-02-14T...

// Check audit log via API
const auditLog = await fetch('/api/whitelist/audit?limit=50')
const blocked = auditLog.data.filter(entry => entry.result === 'blocked')
```

## Advanced Usage

### Custom Error Handling

```typescript
router.get('/scrape', (req, res, next) => {
  // Pre-check if needed
  const manager = getWhitelistManager()
  const domain = new URL(req.query.sourceUrl).hostname

  if (!manager.isSourceAllowed(domain)) {
    // Custom error response
    return res.status(403).json({
      error: 'Custom error message',
      suggestion: 'Request domain whitelisting via /api/whitelist/request'
    })
  }

  next()
}, handler)
```

### Request Whitelisting Flow

```typescript
// User requests new source
POST /api/whitelist/request
{
  "name": "New Source",
  "domain": "newsource.com",
  "category": "api",
  "description": "Reason for request"
}

// Admin reviews in dashboard
GET /api/whitelist/pending

// Admin approves
PATCH /api/whitelist/approve/{sourceId}
```

## Testing

```bash
# Test blocked domain
curl -X GET "http://localhost:21301/api/scrape?sourceUrl=https://not-whitelisted.com"
# Expected: 403 Forbidden

# Test whitelisted domain
curl -X GET "http://localhost:21301/api/scrape?sourceUrl=https://bbc.com"
# Expected: 200 OK
```

## Troubleshooting

### Issue: All domains blocked

**Solution:** Check whitelist file exists and has sources
```bash
cat apps/backend/security/source_whitelist.json
```

### Issue: Domain not recognized

**Possible causes:**
- Domain normalization (www. vs without www.)
- Subdomain mismatch (api.example.com vs example.com)

**Solution:** Add all variants to whitelist or normalize in middleware

### Issue: Middleware not applied

**Check:** Route order matters
```typescript
// ✅ CORRECT
router.use('/api/scrape', whitelistFilterMiddleware)
router.get('/api/scrape/news', handler)

// ❌ WRONG - middleware defined after route
router.get('/api/scrape/news', handler)
router.use('/api/scrape', whitelistFilterMiddleware)
```

## Production Checklist

- [ ] All scraper routes have `whitelistFilterMiddleware`
- [ ] Admin routes protected with `authMiddleware + requireAdmin`
- [ ] Initial whitelist populated with trusted sources
- [ ] Audit log monitoring configured
- [ ] Rate limiting configured
- [ ] Backup of whitelist file configured
- [ ] Alert system for blocked attempts (optional)
- [ ] Reputation API integrated (VirusTotal/AbuseIPDB)
