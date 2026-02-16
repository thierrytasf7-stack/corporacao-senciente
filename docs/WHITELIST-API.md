# Source Whitelist API Documentation

## Overview

The Source Whitelist system ensures that only trusted and authorized data sources are accessed by Diana's scrapers. It implements a "Block & Warn" policy for unauthorized sources and provides a comprehensive management interface.

## Architecture

### Components

1. **SourceWhitelistManager** - Core management class
2. **Middleware** - Express integration for request filtering
3. **API Routes** - RESTful endpoints for whitelist management
4. **Configuration** - JSON-based whitelist storage

### Key Features

- ✅ Whitelist/blocklist management
- ✅ Pending approval workflow
- ✅ Audit logging for all access attempts
- ✅ Domain reputation scoring
- ✅ Scheduled reputation checks
- ✅ Persistent storage
- ✅ Express middleware integration

## API Endpoints

### Get Whitelisted Sources

```http
GET /api/whitelist
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "source-001",
      "name": "ESPN",
      "domain": "espn.com",
      "category": "sports",
      "status": "active",
      "reputation": {
        "score": 9.5,
        "lastChecked": "2026-02-14T15:00:00Z",
        "trusted": true
      },
      "tags": ["sports", "live-data"],
      "description": "Primary sports data source",
      "addedBy": "system",
      "addedAt": "2026-02-14T15:00:00Z"
    }
  ],
  "count": 1
}
```

### Get Blocked Sources

```http
GET /api/whitelist/blocklist
```

**Response:** Same structure as whitelist endpoint.

### Get Pending Approval

```http
GET /api/whitelist/pending
```

**Response:** Sources waiting for admin approval.

### Get Audit Log

```http
GET /api/whitelist/audit?limit=100
```

**Query Parameters:**
- `limit` (optional): Number of recent entries to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-14T15:05:00Z",
      "event": "source_access_allowed",
      "domain": "espn.com",
      "result": "allowed",
      "reason": null
    }
  ],
  "count": 1,
  "total": 150
}
```

### Add Source to Whitelist

```http
POST /api/whitelist
Content-Type: application/json

{
  "name": "New Source",
  "domain": "newsource.com",
  "category": "sports",
  "description": "New data source",
  "tags": ["sports", "live"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "source-004",
    "name": "New Source",
    "domain": "newsource.com",
    "category": "sports",
    "status": "active",
    "reputation": {
      "score": 5.0,
      "lastChecked": "2026-02-14T15:10:00Z",
      "trusted": false
    },
    "tags": ["sports", "live"],
    "description": "New data source",
    "addedBy": "system",
    "addedAt": "2026-02-14T15:10:00Z"
  },
  "message": "Source added to whitelist"
}
```

### Request Source Addition (Pending Approval)

```http
POST /api/whitelist/request
Content-Type: application/json

{
  "name": "Pending Source",
  "domain": "pending.com",
  "category": "betting",
  "description": "Source pending admin approval",
  "tags": ["betting"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Source request submitted for approval"
}
```

### Approve Pending Source

```http
PATCH /api/whitelist/approve/{sourceId}
```

**Response:**
```json
{
  "success": true,
  "message": "Source approved and added to whitelist"
}
```

### Reject Pending Source

```http
PATCH /api/whitelist/reject/{sourceId}
```

**Response:**
```json
{
  "success": true,
  "message": "Source request rejected"
}
```

### Block a Source

```http
POST /api/whitelist/block
Content-Type: application/json

{
  "domain": "malicious.com",
  "reason": "Detected malicious activity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain malicious.com has been blocked",
  "domain": "malicious.com"
}
```

### Check Domain Authorization

```http
GET /api/whitelist/check?domain=example.com
```

**Response:**
```json
{
  "success": true,
  "domain": "example.com",
  "allowed": true,
  "status": "whitelisted"
}
```

### Update Reputation Scores

```http
POST /api/whitelist/reputation/update
```

**Response:**
```json
{
  "success": true,
  "message": "Reputation scores updated successfully"
}
```

## Integration with Scrapers

### Using the Middleware

```typescript
import express from 'express'
import { whitelistFilterMiddleware, auditLoggingMiddleware } from './middleware/whitelist-filter'
import whitelistRouter from './routes/whitelist'

const app = express()

// Apply whitelist filtering to scraper routes
app.use('/api/scrape', whitelistFilterMiddleware)
app.use('/api/scrape', auditLoggingMiddleware)

// Mount whitelist management routes
app.use('/api/whitelist', whitelistRouter)

app.get('/api/scrape', (req, res) => {
  // This will only be called if source is whitelisted
  res.json({ data: 'scraped content' })
})
```

### Using the Manager Directly

```typescript
import { getWhitelistManager } from './middleware/source-whitelist'

const manager = getWhitelistManager()

// Check if domain is allowed
if (manager.isSourceAllowed('example.com')) {
  // Proceed with scraping
} else {
  // Block scraping attempt
  console.warn('Unauthorized source: example.com')
}

// Get all whitelisted sources
const sources = manager.getWhitelist()

// Add new source
manager.addSourceToWhitelist({
  id: `source-${Date.now()}`,
  name: 'New Source',
  domain: 'newsource.com',
  category: 'sports',
  status: 'active',
  reputation: { score: 5.0, lastChecked: new Date().toISOString(), trusted: false },
  tags: ['sports'],
  description: 'New data source'
})
```

## Configuration

### Policy Settings

The whitelist behavior is configured in `security/source_whitelist.json`:

```json
{
  "policy": {
    "blockUnauthorized": true,      // Block sources not in whitelist
    "logBlocked": true,              // Log all blocked access attempts
    "validateReputation": true,      // Check reputation scores
    "reputationCheckInterval": 604800000  // 7 days in milliseconds
  }
}
```

### Reputation Scheduling

Start automatic reputation checks:

```typescript
const manager = getWhitelistManager()
manager.startReputationCheckScheduler()

// Later, stop the scheduler
manager.stopReputationCheckScheduler()
```

## Example: Scraper with Whitelist

```typescript
import axios from 'axios'
import { getWhitelistManager } from './middleware/source-whitelist'

async function scrapeData(url: string): Promise<any> {
  const manager = getWhitelistManager()

  try {
    const domain = new URL(url).hostname

    // Check whitelist first
    if (!manager.isSourceAllowed(domain)) {
      throw new Error(`Source ${domain} is not whitelisted`)
    }

    // Proceed with scraping
    const response = await axios.get(url)
    return response.data

  } catch (error) {
    console.error('Scraping failed:', error)
    throw error
  }
}
```

## Audit Log Retention

The audit log maintains a rolling window of the last 10,000 entries. Older entries are automatically removed when the limit is exceeded.

## Security Considerations

1. **Default Policy**: Block all unauthorized sources
2. **Reputation Scoring**: Sources with scores < 7.0 are marked as untrusted
3. **Logging**: All access attempts (allowed and blocked) are logged
4. **Persistence**: Configuration is stored on disk for persistence across restarts
5. **Domain Normalization**: www.example.com and example.com are treated as the same domain

## Future Enhancements

- [ ] Integration with VirusTotal API
- [ ] Integration with AbuseIPDB
- [ ] Machine learning-based reputation prediction
- [ ] Automatic blocklist updates from security feeds
- [ ] GraphQL API endpoint
- [ ] Advanced audit log querying and analytics
- [ ] Automated source health monitoring
